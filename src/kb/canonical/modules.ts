import {
  MODULE_RARITY_LEVEL_CAPS,
  MODULE_SUBSTAT_CANONICAL_DATA,
} from '@tmrxjd/platform/tools'
import type {
  ModuleRarity,
  ModuleSubstatCanonicalCategory,
  ModuleSubstatCanonicalDefinition,
} from '@tmrxjd/platform/tools'
import { labs as LABS } from '@tmrxjd/platform/tools'
import { MODULE_TEMPLATES, type ModuleCategory, type ModuleTemplate } from '../../game-data/module-data'
import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import { loadModulesSourceDocument, type ModuleSourceEntry } from './modulesSource'

type SystemSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
  preferredKeys: string[]
}

const SYSTEM_SPECS: SystemSpec[] = [
  { mechanic: 'Modules', chunkId: 'modules_overview_01', title: 'Modules Overview', tags: ['modules', 'gear', 'progression'], preferredKeys: ['Behavior'] },
  { mechanic: 'Module Types', chunkId: 'modules_types_01', title: 'Module Types', tags: ['modules', 'families'], preferredKeys: ['Behavior'] },
  { mechanic: 'Module Acquisition', chunkId: 'modules_acquisition_01', title: 'Module Acquisition', tags: ['modules', 'acquisition', 'gems', 'tickets'], preferredKeys: ['Behavior'] },
  { mechanic: 'Module Pull Rates', chunkId: 'modules_pull_rates_01', title: 'Module Pull Rates', tags: ['modules', 'pull rates', 'rarity'], preferredKeys: ['Behavior'] },
  { mechanic: 'Module Banners', chunkId: 'modules_banners_01', title: 'Module Banners', tags: ['modules', 'banners', 'featured banner'], preferredKeys: ['Behavior'] },
  { mechanic: 'Module Upgrading', chunkId: 'modules_upgrading_01', title: 'Module Upgrading', tags: ['modules', 'upgrading', 'shards', 'coins'], preferredKeys: ['Behavior'] },
  { mechanic: 'Module Level Caps', chunkId: 'modules_level_caps_01', title: 'Module Level Caps', tags: ['modules', 'level caps', 'rarity'], preferredKeys: ['Behavior'] },
  { mechanic: 'Module Restore', chunkId: 'modules_restore_01', title: 'Module Restore', tags: ['modules', 'restore', 'reset'], preferredKeys: ['Behavior'] },
  { mechanic: 'Module Boss Drops', chunkId: 'modules_boss_drops_01', title: 'Module Boss Drops', tags: ['modules', 'boss drops', 'reroll shards'], preferredKeys: ['Behavior'] },
  { mechanic: 'Module Merging', chunkId: 'modules_merging_01', title: 'Module Merging', tags: ['modules', 'merging', 'rarity'], preferredKeys: ['Behavior'] },
  { mechanic: 'Module Merge Materials', chunkId: 'modules_merge_materials_01', title: 'Module Merge Materials', tags: ['modules', 'merge materials', 'wildcards'], preferredKeys: ['Behavior'] },
  { mechanic: 'Module Stats', chunkId: 'modules_stats_01', title: 'Module Stats', tags: ['modules', 'stats'], preferredKeys: ['Behavior'] },
  { mechanic: 'Module Main Effect', chunkId: 'modules_main_effect_01', title: 'Module Main Effect', tags: ['modules', 'main effect'], preferredKeys: ['Behavior'] },
  { mechanic: 'Module Sub-Module Effects', chunkId: 'modules_submodule_effects_01', title: 'Module Sub-Module Effects', tags: ['modules', 'substats', 'sub-module effects'], preferredKeys: ['Behavior'] },
  { mechanic: 'Module Reroll Locks', chunkId: 'modules_reroll_locks_01', title: 'Module Reroll Locks', tags: ['modules', 'reroll locks', 'auto roll'], preferredKeys: ['Behavior'] },
  { mechanic: 'Unique Effects', chunkId: 'modules_unique_effects_01', title: 'Module Unique Effects', tags: ['modules', 'unique effects'], preferredKeys: ['Behavior'] },
  { mechanic: 'Assist Modules', chunkId: 'modules_assist_01', title: 'Assist Modules', tags: ['modules', 'assist modules', 'stones'], preferredKeys: ['Behavior'] },
  { mechanic: 'Assist Module Unique Rarity Costs', chunkId: 'modules_assist_rarity_costs_01', title: 'Assist Module Unique Rarity Costs', tags: ['modules', 'assist modules', 'stones', 'rarity'], preferredKeys: ['Behavior'] },
]

const MODULE_LEVEL_CAPS = MODULE_RARITY_LEVEL_CAPS as Record<ModuleRarity, number>

const SUBSTAT_CATEGORY_TO_MODULE: Record<ModuleSubstatCanonicalCategory, ModuleCategory> = {
  Cannon: 'Cannon',
  Defense: 'Armor',
  Generator: 'Generator',
  Core: 'Core',
}

function createChunkId(prefix: string, value: string): string {
  return `${prefix}_${value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}_01`
}

function buildMetadataParagraph(entry: ModuleSourceEntry): string | null {
  const parts = [
    entry.sections.Type ? `Type: ${entry.sections.Type}` : '',
    entry.sections.Domain ? `Domain: ${entry.sections.Domain}` : '',
    entry.sections.Section ? `Section: ${entry.sections.Section}` : '',
    entry.sections.Category ? `Category: ${entry.sections.Category}` : '',
    entry.sections.Aliases && !/^none\.?$/i.test(entry.sections.Aliases) ? `Aliases: ${entry.sections.Aliases}` : '',
  ].filter(Boolean)

  return parts.length > 0 ? `${parts.join('. ')}.` : null
}

function ensureAtomicDisambiguation(value: string): string {
  if (/mechanic itself,? not its interactions/i.test(value)) {
    return value
  }

  return `${value} This chunk describes the mechanic itself, not its interactions.`
}

function readAtomicDisambiguation(entry: ModuleSourceEntry | undefined, fallback: string): string {
  const value = entry?.sections.Disambiguation
  return ensureAtomicDisambiguation(value ? value.replace(/\n+/g, ' ') : fallback)
}

function buildSystemParagraphs(entry: ModuleSourceEntry, preferredKeys: string[]): string[] {
  const paragraphs: string[] = []
  if (entry.sections.Definition) {
    paragraphs.push(`Definition: ${entry.sections.Definition}`)
  }

  const metadataParagraph = buildMetadataParagraph(entry)
  if (metadataParagraph) {
    paragraphs.push(metadataParagraph)
  }

  for (const key of preferredKeys) {
    const value = entry.sections[key]
    if (value && !/^none\.?$/i.test(value.trim())) {
      paragraphs.push(`${key}: ${value}`)
    }
  }

  return paragraphs
}

function formatRarityBonuses(template: ModuleTemplate): string | null {
  if (!template.rarityBonuses || template.rarityBonuses.length === 0) {
    return null
  }

  return template.rarityBonuses
    .map(row => `${row.rarity} ${row.value}`)
    .join(', ')
}

function buildModuleAtomicParagraphs(template: ModuleTemplate): string[] {
  const rarityBonusText = formatRarityBonuses(template)
  const description = template.description(template.rarityBonuses?.[template.rarityBonuses.length - 1]?.value)
  const uniqueStatus = template.unique ? 'This is a natural Epic unique module.' : 'This is a non-unique module template.'

  return [
    `Definition: ${template.name} is a ${template.type} module. ${description}`,
    `Module metadata: Family ${template.type}. ${uniqueStatus} Rarity range ${template.minRarity} through ${template.maxRarity}.`,
    template.baseEffect
      ? `Base effect: ${template.baseEffect}`
      : `Base effect: ${template.name} uses its listed module effect without a separate base-effect note in site data.`,
    rarityBonusText
      ? `Rarity scaling: ${rarityBonusText}.`
      : `Rarity scaling: ${template.name} does not expose rarity bonus breakpoints in site data because it is a standard ${template.minRarity} template.`,
  ]
}

function formatSubstatValues(substat: ModuleSubstatCanonicalDefinition): string {
  return substat.availableRarities
    .map(rarity => `${rarity} ${substat.valuesByRarity[rarity]}`)
    .join(', ')
}

function buildSubstatFamilyParagraphs(category: ModuleSubstatCanonicalCategory): string[] {
  const familyData = MODULE_SUBSTAT_CANONICAL_DATA[category]
  const substatSummary = familyData.substats
    .map(substat => `${substat.label}: ${formatSubstatValues(substat)}`)
    .join(' | ')

  return [
    `Definition: ${familyData.title} lists the sub-module effect pool for ${category === 'Defense' ? 'Armor' : category} modules.`,
    `Substat pool: ${familyData.substats.map(substat => substat.label).join(', ')}.`,
    `Rarity values: ${substatSummary}.`,
  ]
}

function buildFamilyAssistRelation(category: ModuleSubstatCanonicalCategory): KBChunkRecord {
  const moduleFamily = SUBSTAT_CATEGORY_TO_MODULE[category]
  const substatMechanic = `${moduleFamily} Module Substats`
  const substatLab = LABS.find(lab => lab.name === `Assist Module Substats - ${moduleFamily}`)
  const bonusLab = LABS.find(lab => lab.name === `Assist Module Bonus - ${moduleFamily}`)
  const namingEntry = getRequiredNamingRegistryEntryBySource('modules', substatMechanic)
  const dataSources: string[] = [namingEntry.data_source]

  if (substatLab) {
    dataSources.push(getRequiredNamingRegistryEntryBySource('labs', substatLab.name).data_source)
  }
  if (bonusLab) {
    dataSources.push(getRequiredNamingRegistryEntryBySource('labs', bonusLab.name).data_source)
  }

  return buildRelationalKbChunk({
    chunk_id: createChunkId('modules_relation_assist', substatMechanic),
    source: 'Modules Structured Reference',
    section: 'Modules',
    topic: `${substatMechanic} with Assist Module Labs`,
    title: `${substatMechanic} with Assist Module Labs`,
    disambiguation: `This chunk is about the interaction between ${substatMechanic}, ${substatLab?.name ?? 'Assist Module Substats'}, and ${bonusLab?.name ?? 'Assist Module Bonus'}, not the individual mechanics. It is not about unrelated module banners, merge materials, or other module families.`,
    data_source: dataSources,
    is_base_mechanic: false,
    mechanics: [substatMechanic, substatLab?.name ?? `Assist Module Substats - ${moduleFamily}`, bonusLab?.name ?? `Assist Module Bonus - ${moduleFamily}`],
    interaction_type: 'scaling',
    interaction_summary: `${substatLab?.name ?? 'Assist Module Substats'} and ${bonusLab?.name ?? 'Assist Module Bonus'} increase the weaker assist-side version of ${substatMechanic}.`,
    tags: ['modules', 'assist modules', moduleFamily.toLowerCase(), 'labs'],
    paragraphs: [
      `${substatMechanic} defines the rerollable secondary stat pool for ${moduleFamily} modules.`,
      `${substatLab?.name ?? `Assist Module Substats - ${moduleFamily}`} increases the assist-side substats for ${moduleFamily} modules, while ${bonusLab?.name ?? `Assist Module Bonus - ${moduleFamily}`} improves the assist-side bonus values.`,
      `These labs matter only for Assist Modules and do not replace the normal ${substatMechanic} pool on the primary module itself.`,
    ],
  })
}

export function buildModulesCanonicalKbChunks(): KBChunkRecord[] {
  const sourceDocument = loadModulesSourceDocument()
  const modulesEntry = getRequiredNamingRegistryEntryBySource('modules', 'modules')
  const entryByMechanic = new Map(sourceDocument.deterministicEntries.map(entry => [entry.mechanic, entry]))

  const systemChunks = SYSTEM_SPECS.map(spec => {
    const entry = entryByMechanic.get(spec.mechanic)
    if (!entry) {
      throw new Error(`Modules structured source is missing the ${spec.mechanic} mechanic entry.`)
    }

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'Modules Structured Reference',
      section: 'Modules',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: readAtomicDisambiguation(entry, `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about unrelated tracker state, implementation details, or other game systems.`),
      data_source: modulesEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Modules',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: spec.mechanic === 'Modules'
        ? [...sourceDocument.overviewParagraphs, ...buildSystemParagraphs(entry, spec.preferredKeys)]
        : buildSystemParagraphs(entry, spec.preferredKeys),
    })
  })

  const familySubstatChunks = (Object.keys(MODULE_SUBSTAT_CANONICAL_DATA) as ModuleSubstatCanonicalCategory[]).map(category => {
    const moduleFamily = SUBSTAT_CATEGORY_TO_MODULE[category]
    const mechanic = `${moduleFamily} Module Substats`
    const namingEntry = getRequiredNamingRegistryEntryBySource('modules', mechanic)

    return buildAtomicKbChunk({
      chunk_id: createChunkId('modules_substats', mechanic),
      source: 'Tracker Website Module Substat Data',
      section: 'Modules',
      topic: mechanic,
      title: mechanic,
      disambiguation: `This chunk is about ${mechanic} as a module mechanic itself, not its interactions. It is not about other module families, general reroll rules, or unrelated tracker implementation details.`,
      data_source: namingEntry.data_source,
      is_base_mechanic: false,
      mechanics: [mechanic],
      tags: ['modules', 'substats', moduleFamily.toLowerCase()],
      paragraphs: buildSubstatFamilyParagraphs(category),
    })
  })

  const moduleTemplateChunks = MODULE_TEMPLATES.map(template => {
    const namingEntry = getRequiredNamingRegistryEntryBySource('modules', template.name)

    return buildAtomicKbChunk({
      chunk_id: createChunkId('modules', template.name),
      source: 'Tracker Website Module Data',
      section: 'Modules',
      topic: template.name,
      title: template.name,
      disambiguation: `This chunk is about ${template.name} as a module mechanic itself, not its interactions. It is not about unrelated modules, banner odds, or tracker implementation details.`,
      data_source: namingEntry.data_source,
      is_base_mechanic: namingEntry.is_base_mechanic,
      mechanics: [template.name],
      tags: ['modules', template.type.toLowerCase(), template.unique ? 'unique' : 'standard', template.initials.toLowerCase()],
      paragraphs: buildModuleAtomicParagraphs(template),
    })
  })

  const levelCapParagraph = Object.entries(MODULE_LEVEL_CAPS)
    .map(([rarity, cap]) => `${rarity} ${cap}`)
    .join(', ')

  return [
    ...systemChunks,
    buildRelationalKbChunk({
      chunk_id: 'modules_acquisition_gems_tickets_banners_01',
      source: 'Modules Structured Reference',
      section: 'Modules',
      topic: 'Module Acquisition with Gems, Module Tickets, and Module Banners',
      title: 'Module Acquisition with Gems, Module Tickets, and Module Banners',
      disambiguation: 'This chunk is about the interaction between Module Acquisition, Gems, Module Tickets, and Module Banners, not the individual mechanics. It is not about substats, merge materials, or unrelated currencies.',
      data_source: modulesEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Module Acquisition', 'Gems', 'Module Tickets', 'Module Banners'],
      interaction_type: 'conditional',
      interaction_summary: 'Module Acquisition consumes Gems or Module Tickets, and Module Banners decide which Epic distributions apply to those purchases.',
      tags: ['modules', 'acquisition', 'gems', 'tickets', 'banners'],
      paragraphs: [
        'Module Acquisition begins once Modules unlock, and it can spend Gems or Module Tickets to create pulls.',
        'Module Banners determine how those Gems or Module Tickets translate into actual Epic distributions, including featured-module weighting.',
        'This means the value of Module Acquisition depends both on the resource spent and on which Module Banners are currently active.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'modules_pull_rates_bad_luck_ten_pull_01',
      source: 'Modules Structured Reference',
      section: 'Modules',
      topic: 'Module Pull Rates with Bad Luck Protection and Ten Pulls',
      title: 'Module Pull Rates with Bad Luck Protection and Ten Pulls',
      disambiguation: 'This chunk is about the interaction between Module Pull Rates, Bad Luck Protection, and Ten Pulls, not the individual mechanics. It is not about merge rules, substats, or unrelated drop systems.',
      data_source: modulesEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Module Pull Rates', 'Bad Luck Protection', 'Ten Pulls'],
      interaction_type: 'conditional',
      interaction_summary: 'Module Pull Rates define the base draw odds, while Bad Luck Protection and Ten Pulls add guarantee rules on top of those odds.',
      tags: ['modules', 'pull rates', 'bad luck protection', 'ten pulls'],
      paragraphs: [
        'Module Pull Rates provide the base Common, Rare, and Epic odds.',
        'Bad Luck Protection overrides those odds only after 150 purchases pass without an Epic module.',
        'Ten Pulls add a separate guarantee for at least one Rare module, so the live outcome is a combination of base Module Pull Rates and guarantee rules.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'modules_upgrading_level_caps_merging_01',
      source: 'Modules Structured Reference',
      section: 'Modules',
      topic: 'Module Upgrading with Module Level Caps and Module Merging',
      title: 'Module Upgrading with Module Level Caps and Module Merging',
      disambiguation: 'This chunk is about the interaction between Module Upgrading, Module Level Caps, and Module Merging, not the individual mechanics. It is not about banner odds, boss drops, or unrelated currencies.',
      data_source: modulesEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Module Upgrading', 'Module Level Caps', 'Module Merging'],
      interaction_type: 'scaling',
      interaction_summary: 'Module Upgrading spends shards and coins up to the current Module Level Caps, and Module Merging raises those caps without wiping current levels.',
      tags: ['modules', 'upgrading', 'level caps', 'merging'],
      paragraphs: [
        'Module Upgrading spends shards and coins to increase level, but it can only move until the active Module Level Caps for the current rarity.',
        `Module Level Caps in site data are: ${levelCapParagraph}.`,
        'Module Merging changes the rarity state, which in turn raises the Module Level Caps while preserving the already-earned module level.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'modules_boss_drops_labs_01',
      source: 'Modules Structured Reference',
      section: 'Modules',
      topic: 'Module Boss Drops with Lab Research',
      title: 'Module Boss Drops with Lab Research',
      disambiguation: 'This chunk is about the interaction between Module Boss Drops and Lab Research, not the individual mechanics. It is not about module banners, merge paths, or unrelated lab families.',
      data_source: modulesEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Module Boss Drops', 'Lab Research'],
      interaction_type: 'scaling',
      interaction_summary: 'Module Boss Drops start from base reroll-shard and module rates, and Lab Research can increase the module-drop side of those boss rewards.',
      tags: ['modules', 'boss drops', 'labs'],
      paragraphs: [
        'Module Boss Drops provide the baseline reroll-shard, Common-module, and Rare-module boss rewards.',
        'The wiki extraction explicitly notes that the module drop rates from Module Boss Drops can be improved by Lab Research.',
        'This makes Lab Research a scaling layer on top of the base Module Boss Drops table rather than a separate drop system.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'modules_substats_reroll_locks_auto_roll_01',
      source: 'Modules Structured Reference',
      section: 'Modules',
      topic: 'Module Sub-Module Effects with Module Reroll Locks, Auto Roll, and Effect Bans',
      title: 'Module Sub-Module Effects with Module Reroll Locks, Auto Roll, and Effect Bans',
      disambiguation: 'This chunk is about the interaction between Module Sub-Module Effects, Module Reroll Locks, Auto Roll, and Effect Bans, not the individual mechanics. It is not about main stat leveling, banner odds, or unrelated merge systems.',
      data_source: modulesEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Module Sub-Module Effects', 'Module Reroll Locks', 'Auto Roll', 'Effect Bans'],
      interaction_type: 'conditional',
      interaction_summary: 'Module Sub-Module Effects are rerolled through Auto Roll or manual rerolls, while Module Reroll Locks protect chosen effects and Effect Bans remove forbidden effects from the reroll pool.',
      tags: ['modules', 'substats', 'reroll locks', 'auto roll', 'effect bans'],
      paragraphs: [
        'Module Sub-Module Effects are the pool being rerolled when players chase better secondary stats.',
        'Module Reroll Locks increase reroll cost to preserve chosen substats, while Auto Roll automates repeated rerolls until acceptable effects or rarities appear.',
        'If Effect Bans are researched, Effect Bans further narrow the Module Sub-Module Effects pool by excluding banned results from rerolls.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'modules_assist_stones_labs_hard_caps_01',
      source: 'Modules Structured Reference',
      section: 'Modules',
      topic: 'Assist Modules with Stones, Assist Module Labs, and Hard Caps',
      title: 'Assist Modules with Stones, Assist Module Labs, and Hard Caps',
      disambiguation: 'This chunk is about the interaction between Assist Modules, Stones, Assist Module Labs, and Hard Caps, not the individual mechanics. It is not about banner odds, normal merge paths, or unrelated tracker pages.',
      data_source: ['modules', 'labs'],
      is_base_mechanic: false,
      mechanics: ['Assist Modules', 'Stones', 'Assist Module Labs', 'Hard Caps'],
      interaction_type: 'conditional',
      interaction_summary: 'Assist Modules spend Stones for unlock and quality, use Assist Module Labs for efficiency scaling, and still remain bounded by the game\'s Hard Caps.',
      tags: ['modules', 'assist modules', 'stones', 'labs', 'hard caps'],
      paragraphs: [
        'Assist Modules require Stones both to unlock assist slots and to improve assist-side quality or efficiency.',
        'Assist Module Labs add extra scaling to assist bonuses and assist substats after those labs unlock.',
        'Even with Stones investment and Assist Module Labs, Assist Modules still obey Hard Caps such as defense, Chrono Field slow, Wall rebuild, Shockwave Frequency, Death Defy, and Inner Land Mine cooldown caps.',
      ],
    }),
    ...(Object.keys(MODULE_SUBSTAT_CANONICAL_DATA) as ModuleSubstatCanonicalCategory[]).map(buildFamilyAssistRelation),
    ...familySubstatChunks,
    ...moduleTemplateChunks,
  ]
}
