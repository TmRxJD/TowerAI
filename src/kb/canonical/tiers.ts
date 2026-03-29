import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import { loadTiersSourceDocument } from './tiersSource'

type SystemSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

const SYSTEM_SPECS: SystemSpec[] = [
  { mechanic: 'Tiers', chunkId: 'tiers_overview_01', title: 'Tiers Overview', tags: ['tiers', 'difficulty', 'progression'] },
  { mechanic: 'Tier Coin Bonus', chunkId: 'tiers_coin_bonus_01', title: 'Tier Coin Bonus', tags: ['tiers', 'coins', 'scaling'] },
  { mechanic: 'Tier Unlock Requirement', chunkId: 'tiers_unlock_requirement_01', title: 'Tier Unlock Requirement', tags: ['tiers', 'unlock', 'milestones'] },
  { mechanic: 'Tier Battle Conditions', chunkId: 'tiers_battle_conditions_01', title: 'Tier Battle Conditions', tags: ['tiers', 'battle conditions', 'difficulty'] },
  { mechanic: 'Battle Condition Definitions', chunkId: 'tiers_battle_condition_definitions_01', title: 'Battle Condition Definitions', tags: ['tiers', 'battle conditions', 'definitions'] },
]

function buildOverviewParagraphs(): string[] {
  const sourceDocument = loadTiersSourceDocument()
  const firstTier = sourceDocument.tierRows[0]
  const lastTier = sourceDocument.tierRows[sourceDocument.tierRows.length - 1]

  return [
    ...sourceDocument.overviewParagraphs,
    `Coin bonus scaling starts at Tier ${firstTier?.tier} with ${firstTier?.coinBonus}x coins and reaches Tier ${lastTier?.tier} with ${lastTier?.coinBonus}x coins.`,
  ]
}

function buildCoinBonusParagraphs(): string[] {
  const sourceDocument = loadTiersSourceDocument()
  const breakpoints = [1, 5, 10, 14, 16, 21]
  const rows = breakpoints
    .map(tier => sourceDocument.coinBonusRows.find(row => row.tier === tier))
    .filter((row): row is NonNullable<typeof row> => Boolean(row))

  return [
    'Tier Coin Bonus is the basic reward multiplier for choosing a harder tier.',
    `Representative breakpoints are ${rows.map(row => `Tier ${row.tier} = ${row.coinBonus}x`).join(', ')}.`,
    'Higher tiers pay substantially more coins, but from Tier 14 onward that extra payout is paired with static battle conditions that permanently raise run difficulty.',
  ]
}

function buildUnlockRequirementParagraphs(): string[] {
  const sourceDocument = loadTiersSourceDocument()
  const early = sourceDocument.unlockRequirementRows.filter(row => row.tier >= 2 && row.tier <= 15)
  const late = sourceDocument.unlockRequirementRows.filter(row => row.tier >= 16)

  return [
    'Tier unlock requirements are based on the previous tier, and the unlocked tier is awarded through the milestone ladder rather than from an isolated tier menu.',
    `Early tier unlocks follow ${early[0]?.requiredWave}-wave clears from Tier ${early[0]?.requiredPreviousTier} through Tier ${early[early.length - 1]?.tier - 1}.`,
    `Late tier unlocks shift to ${late[0]?.requiredWave}-wave clears for Tier ${late[0]?.tier} through Tier ${late[late.length - 1]?.tier}.`,
  ]
}

function buildBattleConditionsParagraphs(): string[] {
  const sourceDocument = loadTiersSourceDocument()
  const grouped = sourceDocument.tierRows.filter(row => row.battleConditions.length > 0)

  return [
    'Tier 14 and above add static battle conditions, so their difficulty is defined by a fixed condition package instead of a rotating tournament rule set.',
    ...grouped.map(row => `Tier ${row.tier}: ${row.battleConditions.map(condition => condition.raw).join(', ')}.`),
  ]
}

function buildBattleConditionDefinitionsParagraphs(): string[] {
  const sourceDocument = loadTiersSourceDocument()
  return sourceDocument.battleConditionDefinitions.map(definition => `${definition.name}: ${definition.description}`)
}

function buildAtomicParagraphs(mechanic: string): string[] {
  switch (mechanic) {
    case 'Tiers':
      return buildOverviewParagraphs()
    case 'Tier Coin Bonus':
      return buildCoinBonusParagraphs()
    case 'Tier Unlock Requirement':
      return buildUnlockRequirementParagraphs()
    case 'Tier Battle Conditions':
      return buildBattleConditionsParagraphs()
    case 'Battle Condition Definitions':
      return buildBattleConditionDefinitionsParagraphs()
    default:
      return []
  }
}

export function buildTiersCanonicalKbChunks(): KBChunkRecord[] {
  const tiersEntry = getRequiredNamingRegistryEntryBySource('tiers', 'tiers')

  const systemChunks = SYSTEM_SPECS.map(spec => {
    const namingEntry = spec.mechanic === 'Tiers'
      ? tiersEntry
      : getRequiredNamingRegistryEntryBySource('tiers', spec.mechanic)

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'Tiers Platform Reference',
      section: 'Tiers',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about tournament brackets, tracker filters, or unrelated scaling systems.`,
      data_source: namingEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Tiers',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: buildAtomicParagraphs(spec.mechanic),
    })
  })

  return [
    ...systemChunks,
    buildRelationalKbChunk({
      chunk_id: 'tiers_unlocks_milestones_01',
      source: 'Tiers Platform Reference',
      section: 'Tiers',
      topic: 'Tiers with Milestones',
      title: 'Tiers with Milestones',
      disambiguation: 'This chunk is about the interaction between Tiers and Milestones, not the individual mechanics. It is not about premium tracks, event difficulty, or unrelated unlock trees.',
      data_source: [
        tiersEntry.data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'Milestones').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Tiers', 'Milestones'],
      interaction_type: 'conditional',
      interaction_summary: 'Tier progression is awarded through Milestones, using wave targets on the current tier to unlock the next one.',
      tags: ['tiers', 'milestones', 'unlock', 'progression'],
      paragraphs: [
        'Tier progression is not a separate unlock ladder from Milestones.',
        'Instead, the account earns the next tier by reaching the required wave on the current tier, and Milestones then deliver that tier unlock reward.',
        'That requirement is usually wave 100, but it increases to wave 300 for Tier 16 through Tier 21 unlocks.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'tiers_coin_bonus_battle_conditions_01',
      source: 'Tiers Platform Reference',
      section: 'Tiers',
      topic: 'Tier Coin Bonus with Tier Battle Conditions',
      title: 'Tier Coin Bonus with Tier Battle Conditions',
      disambiguation: 'This chunk is about the interaction between Tier Coin Bonus and Tier Battle Conditions, not the individual mechanics. It is not about tournament rewards, milestone resource totals, or unrelated economy formulas.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('tiers', 'Tier Coin Bonus').data_source,
        getRequiredNamingRegistryEntryBySource('tiers', 'Tier Battle Conditions').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Tier Coin Bonus', 'Tier Battle Conditions'],
      interaction_type: 'scaling',
      interaction_summary: 'Later tiers pay more coins, but the payout increase comes with fixed battle-condition packages that sharply raise run difficulty.',
      tags: ['tiers', 'coins', 'battle conditions', 'difficulty'],
      paragraphs: [
        'Tier Coin Bonus rises steadily across the tier ladder, which is why later tiers are valuable for coin farming and account progression once they are stable.',
        'From Tier 14 onward, that higher payout is balanced by fixed battle conditions such as resistances, extra bosses, and enemy ultimates.',
        'In practice, each higher tier is both a reward multiplier and a difficulty profile, not just a flat coin-bonus increase.',
      ],
    }),
  ]
}
