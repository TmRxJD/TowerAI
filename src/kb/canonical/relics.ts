import {
  RELIC_DAMAGE_TOTALS,
  RELIC_DEFENSE_TOTALS,
  RELIC_MISC_TOTALS,
  RELIC_OVERVIEW_FACTS,
  RELIC_TOTAL_BONUS_CATEGORIES,
  RELIC_UNLOCK_METHODS,
  RELIC_USAGE_FACTS,
  RELIC_UTILITY_TOTALS,
  type RelicBonusCategoryDefinition,
} from '@tmrxjd/platform/tools'

import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'

type SystemSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

const SYSTEM_SPECS: SystemSpec[] = [
  { mechanic: 'Relics', chunkId: 'relics_overview_01', title: 'Relics Overview', tags: ['relics', 'passive buffs', 'bonuses'] },
  { mechanic: 'Relic Usage', chunkId: 'relics_usage_01', title: 'Relic Usage and Stacking', tags: ['relics', 'stacking', 'passive buffs'] },
  { mechanic: 'Relic Unlock Methods', chunkId: 'relics_unlock_methods_01', title: 'Relics Unlock Methods', tags: ['relics', 'unlock methods', 'events', 'tournaments', 'guilds'] },
  { mechanic: 'Total Relic Bonuses', chunkId: 'relics_total_bonuses_01', title: 'Relics Total Possible Bonuses', tags: ['relics', 'bonuses', 'categories'] },
  { mechanic: 'Misc Relic Totals', chunkId: 'relics_misc_totals_01', title: 'Misc Relic Totals', tags: ['relics', 'lab speed', 'bot range'] },
  { mechanic: 'Damage Relic Totals', chunkId: 'relics_damage_totals_01', title: 'Damage Relic Totals', tags: ['relics', 'damage', 'crit factor', 'ultimate damage'] },
  { mechanic: 'Defense Relic Totals', chunkId: 'relics_defense_totals_01', title: 'Defense Relic Totals', tags: ['relics', 'health', 'defense', 'thorns'] },
  { mechanic: 'Utility Relic Totals', chunkId: 'relics_utility_totals_01', title: 'Utility Relic Totals', tags: ['relics', 'coins', 'cash', 'free upgrades'] },
]

function formatTotalRows(rows: readonly { stat: string; total: string }[]): string {
  return rows.map(row => `${row.stat} ${row.total}`).join(', ')
}

function getCategoryDefinition(mechanic: string): RelicBonusCategoryDefinition {
  const categoryByMechanic: Record<string, RelicBonusCategoryDefinition> = {
    'Misc Relic Totals': RELIC_TOTAL_BONUS_CATEGORIES.find(category => category.key === 'misc') as RelicBonusCategoryDefinition,
    'Damage Relic Totals': RELIC_TOTAL_BONUS_CATEGORIES.find(category => category.key === 'damage') as RelicBonusCategoryDefinition,
    'Defense Relic Totals': RELIC_TOTAL_BONUS_CATEGORIES.find(category => category.key === 'defense') as RelicBonusCategoryDefinition,
    'Utility Relic Totals': RELIC_TOTAL_BONUS_CATEGORIES.find(category => category.key === 'utility') as RelicBonusCategoryDefinition,
  }

  return categoryByMechanic[mechanic]
}

function buildCategoryParagraphs(category: RelicBonusCategoryDefinition): string[] {
  return [
    category.description,
    `${category.label} currently tracks ${category.rows.length} published total bonus lines.`,
    `${category.label} totals: ${formatTotalRows(category.rows)}.`,
  ]
}

function buildTotalSummaryParagraphs(): string[] {
  const totalLines = RELIC_TOTAL_BONUS_CATEGORIES.reduce((sum, category) => sum + category.rows.length, 0)
  return [
    'Current total possible relic bonuses are grouped into Misc, Damage, Defense, and Utility sections.',
    `The published relic totals currently cover ${totalLines} tracked stat lines: Misc ${RELIC_MISC_TOTALS.length}, Damage ${RELIC_DAMAGE_TOTALS.length}, Defense ${RELIC_DEFENSE_TOTALS.length}, and Utility ${RELIC_UTILITY_TOTALS.length}.`,
    'Examples from the published totals include Lab Speed 71%, Damage 97%, Health 103%, and Coins 80%.',
  ]
}

function buildUnlockMethodParagraphs(): string[] {
  return [
    `Relics have ${RELIC_UNLOCK_METHODS.length} main unlock routes.`,
    ...RELIC_UNLOCK_METHODS.map(method => `${method.label}: ${method.description}`),
  ]
}

function buildAtomicParagraphs(mechanic: string): string[] {
  switch (mechanic) {
    case 'Relics':
      return [...RELIC_OVERVIEW_FACTS]
    case 'Relic Usage':
      return [...RELIC_USAGE_FACTS]
    case 'Relic Unlock Methods':
      return buildUnlockMethodParagraphs()
    case 'Total Relic Bonuses':
      return buildTotalSummaryParagraphs()
    case 'Misc Relic Totals':
    case 'Damage Relic Totals':
    case 'Defense Relic Totals':
    case 'Utility Relic Totals':
      return buildCategoryParagraphs(getCategoryDefinition(mechanic))
    default:
      return []
  }
}

export function buildRelicsCanonicalKbChunks(): KBChunkRecord[] {
  const relicsEntry = getRequiredNamingRegistryEntryBySource('relics', 'relics')

  const atomicChunks = SYSTEM_SPECS.map(spec => {
    const namingEntry = spec.mechanic === 'Relics'
      ? relicsEntry
      : getRequiredNamingRegistryEntryBySource('relics', spec.mechanic)

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'Relics Platform Reference',
      section: 'Relics',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about event threshold relic progress, unrelated tracker state, or non-relic systems outside this mechanic.`,
      data_source: namingEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Relics',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: buildAtomicParagraphs(spec.mechanic),
    })
  })

  return [
    ...atomicChunks,
    buildRelationalKbChunk({
      chunk_id: 'relics_themes_menu_01',
      source: 'Relics Platform Reference',
      section: 'Relics',
      topic: 'Relics with Theme Relic Menu',
      title: 'Relics with Theme Relic Menu',
      disambiguation: 'This chunk is about the interaction between Relics and Theme Relic Menu, not the individual mechanics. It is not about event thresholds, unrelated cosmetic menus, or tracker implementation details.',
      data_source: [
        relicsEntry.data_source,
        getRequiredNamingRegistryEntryBySource('themes', 'Theme Relic Menu').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Relics', 'Theme Relic Menu'],
      interaction_type: 'cross_system',
      interaction_summary: 'Relics are the passive system, while Theme Relic Menu is the UI surface that shows unlocked relics and their cumulative bonuses.',
      tags: ['relics', 'themes', 'ui'],
      paragraphs: [
        'Relics are passive bonuses that stay active after unlock rather than sitting in a separate equip screen.',
        'Theme Relic Menu is the place where the player checks which relics are unlocked and what the cumulative relic totals currently add up to.',
        'That makes the relic system itself separate from the menu that exposes its ownership and summary information.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'relics_unlock_milestones_tournaments_guilds_01',
      source: 'Relics Platform Reference',
      section: 'Relics',
      topic: 'Relic Unlock Methods with Milestones, Tournaments, and Guild Relics',
      title: 'Relic Unlock Methods with Milestones, Tournaments, and Guild Relics',
      disambiguation: 'This chunk is about the interaction between Relic Unlock Methods, Milestones, Tournaments, and Guild Relics, not the individual mechanics. It is not about event threshold relic rewards, tracker totals, or unrelated cosmetic shops.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('relics', 'Relic Unlock Methods').data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'milestones').data_source,
        getRequiredNamingRegistryEntryBySource('tournaments', 'tournaments').data_source,
        getRequiredNamingRegistryEntryBySource('guilds', 'Guild Relics').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Relic Unlock Methods', 'Milestones', 'Tournaments', 'Guild Relics'],
      interaction_type: 'cross_system',
      interaction_summary: 'Relic Unlock Methods pulls permanent relics from milestone wave 4500 clears, tournament placement rewards, and guild-shop relic offers.',
      tags: ['relics', 'milestones', 'tournaments', 'guilds', 'unlock methods'],
      paragraphs: [
        'Relic Unlock Methods is not tied to one progression source.',
        'Milestones provide wave-4500 relic rewards, Tournaments add placement-based relic rewards, and Guild Relics adds guild-shop access to another relic acquisition path.',
        'Years-played rewards also exist outside those three systems, so relic acquisition is spread across long-term progression, competitive placement, and guild economy sources.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'relics_unlock_events_01',
      source: 'Relics Platform Reference',
      section: 'Relics',
      topic: 'Relic Unlock Methods with Event Relic Progress and Event Relics',
      title: 'Relic Unlock Methods with Event Relic Progress and Event Relics',
      disambiguation: 'This chunk is about the interaction between Relic Unlock Methods, Event Relic Progress, and Event Relics, not the individual mechanics. It is not about tournament badges, guild offers, or unrelated medal sinks.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('relics', 'Relic Unlock Methods').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Relic Progress').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Relics').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Relic Unlock Methods', 'Event Relic Progress', 'Event Relics'],
      interaction_type: 'conditional',
      interaction_summary: 'Relic Unlock Methods splits event-based relic access into two paths: earned threshold relics from Event Relic Progress and purchased relics from Event Relics during rerun-store availability.',
      tags: ['relics', 'events', 'medals', 'unlock methods'],
      paragraphs: [
        'Relic Unlock Methods includes both event completion and event store acquisition, but those are not the same path.',
        'Event Relic Progress handles relics earned from current-event medal thresholds, while Event Relics covers the medal-shop relic offers sold through event store inventory.',
        'Because store relics only return on event reruns, event-based relic collection depends on both present-event performance and the future rerun schedule for shop availability.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'relics_usage_workshop_01',
      source: 'Relics Platform Reference',
      section: 'Relics',
      topic: 'Relic Usage with Workshop',
      title: 'Relic Usage with Workshop',
      disambiguation: 'This chunk is about the interaction between Relic Usage and Workshop, not the individual mechanics. It is not about relic unlock routes, tracker reminders, or unrelated progression screens.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('relics', 'Relic Usage').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'workshop').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Relic Usage', 'Workshop'],
      interaction_type: 'multiplicative',
      interaction_summary: 'Relic Usage adds passive relic totals on top of matching stats, while Workshop remains the underlying stat-upgrade system those bonuses amplify.',
      tags: ['relics', 'workshop', 'stacking', 'multiplicative'],
      paragraphs: [
        'Relic Usage says relic bonuses stay active automatically and stack additively with similar relic bonuses.',
        'Workshop remains the base stat-upgrade system for rows like damage, health, coins, crit factor, attack speed, and other relic-affected attributes.',
        'That means relic totals do not replace Workshop progression; they layer on top of it and multiply with other bonus systems to raise the final value further.',
      ],
    }),
  ]
}
