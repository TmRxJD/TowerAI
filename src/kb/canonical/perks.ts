import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import { loadPerksSourceDocument } from './perksSource'

type SystemSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

const SYSTEM_SPECS: SystemSpec[] = [
  { mechanic: 'Perks', chunkId: 'perks_overview_01', title: 'Perks Overview', tags: ['perks', 'progression', 'runs'] },
  { mechanic: 'Perk Wave Requirement', chunkId: 'perks_wave_requirement_01', title: 'Perk Wave Requirement', tags: ['perks', 'waves', 'formula'] },
  { mechanic: 'Perk Choice', chunkId: 'perks_choice_01', title: 'Perk Choice', tags: ['perks', 'choices', 'auto pick'] },
  { mechanic: 'Standard Perk Math', chunkId: 'perks_standard_math_01', title: 'Standard Perk Math', tags: ['perks', 'math', 'standard'] },
  { mechanic: 'Standard Perks', chunkId: 'perks_standard_pool_01', title: 'Standard Perks', tags: ['perks', 'standard', 'pool'] },
  { mechanic: 'Ultimate Weapon Perks', chunkId: 'perks_uw_pool_01', title: 'Ultimate Weapon Perks', tags: ['perks', 'ultimate weapons', 'pool'] },
  { mechanic: 'Random Ultimate Weapon Perk', chunkId: 'perks_random_uw_01', title: 'Random Ultimate Weapon Perk', tags: ['perks', 'ultimate weapons', 'random'] },
  { mechanic: 'Trade-off Perks', chunkId: 'perks_tradeoff_pool_01', title: 'Trade-off Perks', tags: ['perks', 'trade-off', 'pool'] },
  { mechanic: 'Perk Labs', chunkId: 'perks_labs_01', title: 'Perk Labs', tags: ['perks', 'labs', 'unlock'] },
]

function formatPerkRows(rows: readonly { perk: string; quantity: number }[]): string {
  return rows.map(row => `${row.perk} (qty ${row.quantity})`).join(', ')
}

function buildOverviewParagraphs(): string[] {
  const sourceDocument = loadPerksSourceDocument()
  return [
    ...sourceDocument.overviewParagraphs,
    `Perk pools are split into ${sourceDocument.poolRates.map(row => `${row.pool.replace(/_/g, ' ')} ${row.chancePercent}%`).join(', ')}.`,
  ]
}

function buildWaveRequirementParagraphs(): string[] {
  const sourceDocument = loadPerksSourceDocument()
  return [
    `Base wave brackets are ${sourceDocument.waveRequirementBrackets.map(row => `${row.baseWavesRequired} waves from ${row.minimumPerksSelected} perks selected`).join(', ')}.`,
    `Formula: ${sourceDocument.waveRequirementFormula}.`,
    ...sourceDocument.waveRequirementNotes,
  ]
}

function buildChoiceParagraphs(): string[] {
  const sourceDocument = loadPerksSourceDocument()
  return [...sourceDocument.choiceFacts]
}

function buildStandardMathParagraphs(): string[] {
  const sourceDocument = loadPerksSourceDocument()
  return [...sourceDocument.standardPerkMathFacts]
}

function buildStandardPerksParagraphs(): string[] {
  const sourceDocument = loadPerksSourceDocument()
  return [
    formatPerkRows(sourceDocument.standardPerks),
    ...sourceDocument.standardPerkNotes,
  ]
}

function buildUwPerksParagraphs(): string[] {
  const sourceDocument = loadPerksSourceDocument()
  return [
    formatPerkRows(sourceDocument.uwPerks),
    ...sourceDocument.uwPerkNotes,
  ]
}

function buildRandomUwParagraphs(): string[] {
  const sourceDocument = loadPerksSourceDocument()
  return [
    ...sourceDocument.randomUwPerkNotes,
    `Random UW stat packages: ${sourceDocument.randomUwPerkStats.map(row => `${row.weapon} = stone value ${row.stoneValue}, ${row.effect1} ${row.amount1}, ${row.effect2} ${row.amount2}, ${row.effect3} ${row.amount3}`).join('; ')}.`,
  ]
}

function buildTradeoffParagraphs(): string[] {
  const sourceDocument = loadPerksSourceDocument()
  return [
    formatPerkRows(sourceDocument.tradeOffPerks),
    ...sourceDocument.tradeOffPerkNotes,
  ]
}

function buildPerkLabsParagraphs(): string[] {
  const sourceDocument = loadPerksSourceDocument()
  return sourceDocument.perkLabs.map(lab => `${lab.name}: ${lab.behavior} Unlock: ${lab.unlockRequirement}. Levels: ${lab.levels}.`)
}

function buildAtomicParagraphs(mechanic: string): string[] {
  switch (mechanic) {
    case 'Perks':
      return buildOverviewParagraphs()
    case 'Perk Wave Requirement':
      return buildWaveRequirementParagraphs()
    case 'Perk Choice':
      return buildChoiceParagraphs()
    case 'Standard Perk Math':
      return buildStandardMathParagraphs()
    case 'Standard Perks':
      return buildStandardPerksParagraphs()
    case 'Ultimate Weapon Perks':
      return buildUwPerksParagraphs()
    case 'Random Ultimate Weapon Perk':
      return buildRandomUwParagraphs()
    case 'Trade-off Perks':
      return buildTradeoffParagraphs()
    case 'Perk Labs':
      return buildPerkLabsParagraphs()
    default:
      return []
  }
}

export function buildPerksCanonicalKbChunks(): KBChunkRecord[] {
  const perksEntry = getRequiredNamingRegistryEntryBySource('perks', 'perks')

  const systemChunks = SYSTEM_SPECS.map(spec => {
    const namingEntry = spec.mechanic === 'Perks'
      ? perksEntry
      : getRequiredNamingRegistryEntryBySource('perks', spec.mechanic)

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'Perks Platform Reference',
      section: 'Perks',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not a perk pick recommendation or unrelated tool guidance.`,
      data_source: namingEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Perks',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: buildAtomicParagraphs(spec.mechanic),
    })
  })

  return [
    ...systemChunks,
    buildRelationalKbChunk({
      chunk_id: 'perks_unlocks_milestones_01',
      source: 'Perks Platform Reference',
      section: 'Perks',
      topic: 'Perks with Milestones',
      title: 'Perks with Milestones',
      disambiguation: 'This chunk is about the interaction between Perks and Milestones, not the individual mechanics. It is not about event timing, workshop values, or unrelated round systems.',
      data_source: [
        perksEntry.data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'Milestones').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Perks', 'Milestones'],
      interaction_type: 'conditional',
      interaction_summary: 'Perks only come online after Milestones unlock the perk system path at Tier 2 Wave 150.',
      tags: ['perks', 'milestones', 'unlock'],
      paragraphs: [
        'Perks are not available from the start of account progression.',
        'Milestones unlock the Unlock Perks lab at Tier 2 Wave 150, and that lab must then be completed before perks can appear in runs.',
        'Once that unlock chain is finished, perk offers begin at wave 200 and the rest of the perk-lab tree becomes available.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'perks_choice_auto_pick_ranking_01',
      source: 'Perks Platform Reference',
      section: 'Perks',
      topic: 'Perk Choice with Perk Labs',
      title: 'Perk Choice with Perk Labs',
      disambiguation: 'This chunk is about the interaction between Perk Choice and Perk Labs, not the individual mechanics. It is not about perk probability weights, event shops, or unrelated automation systems.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('perks', 'Perk Choice').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Perk Labs').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Perk Choice', 'Perk Labs'],
      interaction_type: 'conditional',
      interaction_summary: 'Perk labs expand the number of choices, guarantee a first perk, and control how auto-pick and ranking behave when multiple priority systems are active.',
      tags: ['perks', 'choices', 'labs', 'auto pick'],
      paragraphs: [
        'Perk Choice starts at two options and scales to four through Perk Option Quantity.',
        'First Perk Choice guarantees one selected perk as the top option on the first offer, but Auto Pick Ranking can still override it if a higher-ranked perk is also present.',
        'Auto Pick Perks then chooses the top-listed option from the final ordering rather than evaluating a separate hidden priority system.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'perks_wave_requirement_bonus_scaling_01',
      source: 'Perks Platform Reference',
      section: 'Perks',
      topic: 'Perk Wave Requirement with Standard Perk Math',
      title: 'Perk Wave Requirement with Standard Perk Math',
      disambiguation: 'This chunk is about the interaction between Perk Wave Requirement and Standard Perk Math, not the individual mechanics. It is not about perk selection order, lab completion times, or unrelated formulas.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('perks', 'Perk Wave Requirement').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Standard Perk Math').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Perk Wave Requirement', 'Standard Perk Math'],
      interaction_type: 'scaling',
      interaction_summary: 'Perk Wave Requirement is one of the additive standard perks, so its effective reduction scales with Standard Perk Bonus instead of using the multiplicative perk formula.',
      tags: ['perks', 'waves', 'math', 'standard'],
      paragraphs: [
        'Perk Wave Requirement belongs to the additive side of standard perk math.',
        'That means each copy of the perk is scaled by Standard Perk Bonus before being applied in the wave-requirement formula.',
        'The result changes the first perk timing within each base-wave bracket, and decimal outputs are floored before projecting later perk timings in the same bracket.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'perks_random_uw_pool_01',
      source: 'Perks Platform Reference',
      section: 'Perks',
      topic: 'Random Ultimate Weapon Perk with Ultimate Weapon Perks',
      title: 'Random Ultimate Weapon Perk with Ultimate Weapon Perks',
      disambiguation: 'This chunk is about the interaction between Random Ultimate Weapon Perk and Ultimate Weapon Perks, not the individual mechanics. It is not about permanent weapon ownership, labs, or unrelated random pools.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('perks', 'Random Ultimate Weapon Perk').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Ultimate Weapon Perks').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Random Ultimate Weapon Perk', 'Ultimate Weapon Perks'],
      interaction_type: 'conditional',
      interaction_summary: 'The random ultimate weapon perk can temporarily add a weapon the player does not own, which then lets the related weapon-specific perk appear for that run.',
      tags: ['perks', 'ultimate weapons', 'random', 'conditional'],
      paragraphs: [
        'Random Ultimate Weapon Perk chooses a weapon the account does not already own and grants a semi-upgraded run-only version.',
        'Once that run-only weapon exists, its related Ultimate Weapon perk can enter the pool for that run.',
        'This does not unlock the permanent lab tree for that weapon, and once the account owns every weapon the random perk is removed from the pool entirely.',
      ],
    }),
  ]
}
