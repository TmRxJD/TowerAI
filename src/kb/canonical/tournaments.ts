import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import { loadTournamentsSourceDocument } from './tournamentsSource'

type SystemSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

const SYSTEM_SPECS: SystemSpec[] = [
  { mechanic: 'Tournaments', chunkId: 'tournaments_overview_01', title: 'Tournaments Overview', tags: ['tournaments', 'overview', 'events'] },
  { mechanic: 'Tournament Entry', chunkId: 'tournaments_entry_01', title: 'Tournament Entry', tags: ['tournaments', 'entry', 'schedule'] },
  { mechanic: 'Tournament Tickets', chunkId: 'tournaments_tickets_01', title: 'Tournament Tickets', tags: ['tournaments', 'tickets', 'gems'] },
  { mechanic: 'Tournament Promotion', chunkId: 'tournaments_promotion_01', title: 'Tournament Promotion and Demotion', tags: ['tournaments', 'promotion', 'leagues'] },
  { mechanic: 'Tournament Difficulty', chunkId: 'tournaments_difficulty_01', title: 'Tournament Difficulty', tags: ['tournaments', 'difficulty', 'scaling'] },
  { mechanic: 'Tournament Heat', chunkId: 'tournaments_heat_01', title: 'Tournament Heat', tags: ['tournaments', 'heat', 'battle conditions'] },
  { mechanic: 'Tournament Battle Condition Definitions', chunkId: 'tournaments_battle_condition_definitions_01', title: 'Tournament Battle Condition Definitions', tags: ['tournaments', 'battle conditions', 'definitions'] },
  { mechanic: 'Tournament Rewards', chunkId: 'tournaments_rewards_01', title: 'Tournament Rewards', tags: ['tournaments', 'rewards', 'stones'] },
]

function buildOverviewParagraphs(): string[] {
  const sourceDocument = loadTournamentsSourceDocument()
  const leagueList = sourceDocument.leagues.map(row => row.league).join(', ')

  return [
    ...sourceDocument.overviewFacts,
    `The tournament league ladder is ${leagueList}.`,
  ]
}

function buildEntryParagraphs(): string[] {
  const sourceDocument = loadTournamentsSourceDocument()
  const schedule = sourceDocument.schedule.map(slot => `${slot.day} ${slot.startUtc} UTC`).join(' and ')

  return [
    ...sourceDocument.entryFacts,
    `Tournament unlock requirement is ${sourceDocument.unlockRequirement.milestoneLabel}.`,
    `Tournament start cadence is ${schedule}.`,
  ]
}

function buildTicketParagraphs(): string[] {
  const sourceDocument = loadTournamentsSourceDocument()
  const ticketModel = sourceDocument.ticketModel

  return [
    ...sourceDocument.ticketFacts,
    `Each run costs ${ticketModel.runCostTickets} ticket, and gem repurchases scale by ${ticketModel.incrementalGemCost} gems each time starting from ${ticketModel.baseGemCost}.`,
    'Because tournament ranking uses the best wave from each purchased entry, extra tickets are a direct way to buy more attempts in the same tournament window.',
  ]
}

function buildPromotionParagraphs(): string[] {
  const sourceDocument = loadTournamentsSourceDocument()

  return [
    ...sourceDocument.promotionFacts,
    ...sourceDocument.promotionRules.map(rule => {
      const promotionText = rule.promotesTo ? `Top ${rule.promotedRankMax} promote to ${rule.promotesTo}.` : 'No higher league exists above this one.'
      const demotionText = rule.demotedRankMin && rule.demotesTo
        ? `Ranks ${rule.demotedRankMin}-30 demote to ${rule.demotesTo}.`
        : 'No demotion bracket is applied here.'

      return `${rule.league}: ${promotionText} ${demotionText}`
    }),
  ]
}

function buildDifficultyParagraphs(): string[] {
  const sourceDocument = loadTournamentsSourceDocument()

  return [
    ...sourceDocument.difficultyFacts,
    'Tournament difficulty should be treated as its own scaling ladder rather than as a renamed normal tier, because league pressure changes both stat growth and battle-condition load.',
  ]
}

function buildHeatParagraphs(): string[] {
  const sourceDocument = loadTournamentsSourceDocument()

  return [
    ...sourceDocument.heatFacts,
    ...sourceDocument.heatProfiles.map(profile => {
      if (!profile.hasHeat) {
        return `${profile.league}: no random heat package, and bosses spawn every ${profile.moreBossesEveryWaves} waves.`
      }

      const guaranteed = profile.guaranteedHeatRules.length > 0
        ? ` Guaranteed heat: ${profile.guaranteedHeatRules.join(', ')}.`
        : ''

      return `${profile.league}: bosses spawn every ${profile.moreBossesEveryWaves} waves and ${profile.randomBattleConditionCount} random battle condition${profile.randomBattleConditionCount === 1 ? '' : 's'} are added.${guaranteed}`
    }),
  ]
}

function buildBattleConditionDefinitionParagraphs(): string[] {
  return loadTournamentsSourceDocument().battleConditionDefinitions.map(definition => `${definition.name}: ${definition.description}`)
}

function buildRewardParagraphs(): string[] {
  const sourceDocument = loadTournamentsSourceDocument()

  return [
    sourceDocument.rewardRuleFact,
    ...sourceDocument.rewardTables.map(table => {
      const rows = table.rewards
        .map(row => `${row.rank}: ${row.gems} gems, ${row.stones} stones${row.keys > 0 ? `, ${row.keys} keys` : ''}`)
        .join('; ')

      return `${table.league}: ${rows}.`
    }),
  ]
}

function buildAtomicParagraphs(mechanic: string): string[] {
  switch (mechanic) {
    case 'Tournaments':
      return buildOverviewParagraphs()
    case 'Tournament Entry':
      return buildEntryParagraphs()
    case 'Tournament Tickets':
      return buildTicketParagraphs()
    case 'Tournament Promotion':
      return buildPromotionParagraphs()
    case 'Tournament Difficulty':
      return buildDifficultyParagraphs()
    case 'Tournament Heat':
      return buildHeatParagraphs()
    case 'Tournament Battle Condition Definitions':
      return buildBattleConditionDefinitionParagraphs()
    case 'Tournament Rewards':
      return buildRewardParagraphs()
    default:
      return []
  }
}

export function buildTournamentsCanonicalKbChunks(): KBChunkRecord[] {
  const tournamentsEntry = getRequiredNamingRegistryEntryBySource('tournaments', 'tournaments')

  const systemChunks = SYSTEM_SPECS.map(spec => {
    const namingEntry = spec.mechanic === 'Tournaments'
      ? tournamentsEntry
      : getRequiredNamingRegistryEntryBySource('tournaments', spec.mechanic)

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'Tournaments Platform Reference',
      section: 'Tournaments',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about tracker pages, unrelated event systems, or generic resource descriptions outside tournaments.`,
      data_source: namingEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Tournaments',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: buildAtomicParagraphs(spec.mechanic),
    })
  })

  return [
    ...systemChunks,
    buildRelationalKbChunk({
      chunk_id: 'tournaments_unlocks_milestones_01',
      source: 'Tournaments Platform Reference',
      section: 'Tournaments',
      topic: 'Tournaments with Milestones',
      title: 'Tournaments with Milestones',
      disambiguation: 'This chunk is about the interaction between Tournaments and Milestones, not the individual mechanics. It is not about tier coin bonuses, event shops, or unrelated unlock trees.',
      data_source: [
        tournamentsEntry.data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'Milestones').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Tournaments', 'Milestones'],
      interaction_type: 'conditional',
      interaction_summary: 'Milestones gate tournament access by requiring Tier 1 Wave 60 before tournament tickets and brackets become usable.',
      tags: ['tournaments', 'milestones', 'unlock'],
      paragraphs: [
        'Tournament access is not available on a fresh account.',
        'The unlock comes from Milestones at Tier 1 Wave 60, after which tournament tickets can be spent on Wednesday and Saturday brackets.',
        'In practice, milestone progression determines when tournament stones, gems, and later keys enter the account economy.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'tournaments_difficulty_tiers_01',
      source: 'Tournaments Platform Reference',
      section: 'Tournaments',
      topic: 'Tournament Difficulty with Tiers',
      title: 'Tournament Difficulty with Tiers',
      disambiguation: 'This chunk is about the interaction between Tournament Difficulty and Tiers, not the individual mechanics. It is not about league rewards, milestone tracks, or unrelated scaling tables.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('tournaments', 'Tournament Difficulty').data_source,
        getRequiredNamingRegistryEntryBySource('tiers', 'Tiers').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Tournament Difficulty', 'Tiers'],
      interaction_type: 'scaling',
      interaction_summary: 'Tournament leagues are calibrated as tier-plus difficulty bands, so they inherit tier-style scaling ideas but add harsher stat growth and heat packages.',
      tags: ['tournaments', 'tiers', 'difficulty', 'heat'],
      paragraphs: [
        'Tournament leagues are described relative to the tier ladder, but they are not identical to normal tier runs.',
        'Each league pushes enemy stat growth harder than the comparable tier band and layers heat on top, which is why tournament control requirements often exceed ordinary farming tiers.',
        'This makes the tier ladder the reference point, while tournament leagues remain a stricter competitive difficulty system.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'tournaments_rewards_ultimate_weapons_01',
      source: 'Tournaments Platform Reference',
      section: 'Tournaments',
      topic: 'Tournament Rewards with Ultimate Weapons',
      title: 'Tournament Rewards with Ultimate Weapons',
      disambiguation: 'This chunk is about the interaction between Tournament Rewards and Ultimate Weapons, not the individual mechanics. It is not about vault tracker records, gem sinks, or unrelated event currencies.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('tournaments', 'Tournament Rewards').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'list').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Tournament Rewards', 'Ultimate Weapons'],
      interaction_type: 'cross_system',
      interaction_summary: 'Tournament rewards are the main recurring source of power stones, which feed directly into Ultimate Weapon purchases and upgrades.',
      tags: ['tournaments', 'power stones', 'ultimate weapons', 'rewards'],
      paragraphs: [
        'Tournament placement converts competitive performance into power stones on a fixed league reward table.',
        'Those stones are the main recurring currency used for Ultimate Weapon progression, so stronger tournament results usually accelerate weapon acquisition and investment more than ordinary play loops.',
        'Legend also adds keys for Vault progression, but the tournament-to-stones-to-Ultimate-Weapons link is the main economy interaction.',
      ],
    }),
  ]
}
