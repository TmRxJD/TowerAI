import {
  DAILY_MISSION_CHALLENGE_FACTS,
  DAILY_MISSION_DESCRIPTION_FACTS,
  DAILY_MISSION_REROLL_LAB_FACTS,
  DAILY_MISSION_REROLL_LAB_LEVELS,
  DAILY_MISSION_REWARD_FACTS,
  DAILY_MISSION_TIER_REWARDS,
  DAILY_MISSION_WEEKLY_REWARDS,
  DAILY_MISSION_WEEKLY_TOTALS,
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
  { mechanic: 'Daily Missions', chunkId: 'daily_missions_overview_01', title: 'Daily Missions Overview', tags: ['daily missions', 'missions', 'gems', 'coins', 'progression'] },
  { mechanic: 'Daily Mission Challenges', chunkId: 'daily_missions_challenges_01', title: 'Daily Mission Challenge Pool', tags: ['daily missions', 'challenge pool', 'cards', 'ultimate weapons', 'progression'] },
  { mechanic: 'Daily Mission Rewards', chunkId: 'daily_missions_rewards_01', title: 'Daily Mission Rewards', tags: ['daily missions', 'rewards', 'gems', 'coins', 'shards'] },
  { mechanic: 'Daily Mission Tier Rewards', chunkId: 'daily_missions_tier_rewards_01', title: 'Daily Mission Tier Rewards', tags: ['daily missions', 'tier rewards', 'coins', 'shards'] },
  { mechanic: 'Weekly Mission Rewards', chunkId: 'daily_missions_weekly_rewards_01', title: 'Daily Mission Weekly Rewards', tags: ['daily missions', 'weekly rewards', 'gems', 'medals', 'stones', 'tokens'] },
  { mechanic: 'Reroll Daily Mission', chunkId: 'daily_missions_reroll_lab_01', title: 'Daily Mission Reroll Lab', tags: ['daily missions', 'reroll', 'lab', 'gems'] },
]

function buildAtomicParagraphs(mechanic: string): string[] {
  switch (mechanic) {
    case 'Daily Missions':
      return [...DAILY_MISSION_DESCRIPTION_FACTS]
    case 'Daily Mission Challenges':
      return [...DAILY_MISSION_CHALLENGE_FACTS]
    case 'Daily Mission Rewards':
      return [...DAILY_MISSION_REWARD_FACTS]
    case 'Daily Mission Tier Rewards':
      return [
        'The base daily mission payout is 3 gems plus tier-scaled coins and shards.',
        `Tier reward table: ${DAILY_MISSION_TIER_REWARDS.map(row => `Tier ${row.tier}: ${row.coins} coins and ${row.shards} shards`).join('. ')}.`,
      ]
    case 'Weekly Mission Rewards':
      return [
        'Weekly rewards are earned for every 5 daily missions completed until 35 missions complete, and the rewards can be re-earned each week.',
        `Weekly reward ladder: ${DAILY_MISSION_WEEKLY_REWARDS.map(row => `${row.missionsCompleted} missions gives coins ${row.coinsMultiplier}, ${row.gems} gems, ${row.medals} medals, ${row.stones} stones, and ${row.tokens} tokens`).join('. ')}.`,
        `Weekly totals are coins ${DAILY_MISSION_WEEKLY_TOTALS.coinsMultiplier}, ${DAILY_MISSION_WEEKLY_TOTALS.gems} gems, ${DAILY_MISSION_WEEKLY_TOTALS.medals} medals, ${DAILY_MISSION_WEEKLY_TOTALS.stones} stones, and ${DAILY_MISSION_WEEKLY_TOTALS.tokens} tokens.`,
      ]
    case 'Reroll Daily Mission':
      return [
        ...DAILY_MISSION_REROLL_LAB_FACTS,
        `Lab levels: ${DAILY_MISSION_REROLL_LAB_LEVELS.map(level => `Level ${level.level} takes ${level.time}, costs ${level.cost} coins, and gives ${level.value}`).join('. ')}.`,
      ]
    default:
      return []
  }
}

export function buildDailyMissionsCanonicalKbChunks(): KBChunkRecord[] {
  const atomicChunks = SYSTEM_SPECS.map(spec => {
    const namingEntry = getRequiredNamingRegistryEntryBySource('daily_missions', spec.mechanic)

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'Daily Missions Structured Reference',
      section: 'Daily Missions',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about event missions, unrelated tracker reminders, or non-daily reward systems outside this mechanic.`,
      data_source: namingEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Daily Missions',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: buildAtomicParagraphs(spec.mechanic),
    })
  })

  return [
    ...atomicChunks,
    buildRelationalKbChunk({
      chunk_id: 'daily_missions_progress_challenges_01',
      source: 'Daily Missions Structured Reference',
      section: 'Daily Missions',
      topic: 'Daily Missions with Daily Mission Challenges',
      title: 'Daily Missions with Daily Mission Challenges',
      disambiguation: 'This chunk is about the interaction between Daily Missions and Daily Mission Challenges, not the individual mechanics. It is not about event missions, tournament tasks, or static quest lists that ignore account progress.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('daily_missions', 'Daily Missions').data_source,
        getRequiredNamingRegistryEntryBySource('daily_missions', 'Daily Mission Challenges').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Daily Missions', 'Daily Mission Challenges'],
      interaction_type: 'conditional',
      interaction_summary: 'Daily Mission Challenges are determined by account progress, so Daily Missions only serves challenge types the player has already unlocked.',
      tags: ['daily missions', 'challenge pool', 'progression', 'cards', 'ultimate weapons'],
      paragraphs: [
        'Daily Missions do not use one universal challenge list for every account.',
        'Instead, the Daily Mission Challenges are filtered by player progress, so card and ultimate weapon tasks only appear after those systems are unlocked.',
        'That makes the mission pool conditional on account progression rather than fixed across all players.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'daily_missions_rewards_tiers_01',
      source: 'Daily Missions Structured Reference',
      section: 'Daily Missions',
      topic: 'Daily Mission Rewards with Tiers',
      title: 'Daily Mission Rewards with Tiers',
      disambiguation: 'This chunk is about the interaction between Daily Mission Rewards and Tiers, not the individual mechanics. It is not about event medals, milestone chests, or unrelated reward tables.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('daily_missions', 'Daily Mission Rewards').data_source,
        getRequiredNamingRegistryEntryBySource('daily_missions', 'Daily Mission Tier Rewards').data_source,
        getRequiredNamingRegistryEntryBySource('tiers', 'tiers').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Daily Mission Rewards', 'Tiers'],
      interaction_type: 'conditional',
      interaction_summary: 'Daily Mission Rewards scale from the highest unlocked tier, and that tier state also determines the coin basis used for weekly and guild reward payouts.',
      tags: ['daily missions', 'rewards', 'tiers', 'coins', 'shards'],
      paragraphs: [
        'Daily Mission Rewards are not fixed across the whole game because the highest unlocked tier determines the coin and shard payout table.',
        'That same tier state also affects the coin value used for Weekly Mission Rewards and guild reward payouts.',
        'As a result, tier progression changes the value of both per-mission rewards and the related weekly reward economy.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'daily_missions_rewards_weekly_01',
      source: 'Daily Missions Structured Reference',
      section: 'Daily Missions',
      topic: 'Daily Mission Rewards with Weekly Mission Rewards',
      title: 'Daily Mission Rewards with Weekly Mission Rewards',
      disambiguation: 'This chunk is about the interaction between Daily Mission Rewards and Weekly Mission Rewards, not the individual mechanics. It is not about unrelated event ladders, milestone chests, or non-daily payout systems.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('daily_missions', 'Daily Mission Rewards').data_source,
        getRequiredNamingRegistryEntryBySource('daily_missions', 'Weekly Mission Rewards').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Daily Mission Rewards', 'Weekly Mission Rewards'],
      interaction_type: 'scaling',
      interaction_summary: 'Weekly Mission Rewards reuse the same tier-based coin basis as Daily Mission Rewards, so higher unlocked tiers raise both per-mission and weekly coin value.',
      tags: ['daily missions', 'rewards', 'weekly rewards', 'tiers', 'coins'],
      paragraphs: [
        'Daily Mission Rewards set the tier-based coin value earned from each completed mission.',
        'Weekly Mission Rewards then reuse that same tier coin basis through their x3 to x20 coin multipliers.',
        'That means the value of weekly coin payouts scales alongside the same tier progression that boosts individual mission rewards.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'daily_missions_reroll_tiers_01',
      source: 'Daily Missions Structured Reference',
      section: 'Daily Missions',
      topic: 'Reroll Daily Mission with Tiers',
      title: 'Reroll Daily Mission with Tiers',
      disambiguation: 'This chunk is about the interaction between Reroll Daily Mission and Tiers, not the individual mechanics. It is not about event rerolls, mission reward scaling, or unrelated unlock menus.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('daily_missions', 'Reroll Daily Mission').data_source,
        getRequiredNamingRegistryEntryBySource('tiers', 'tiers').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Reroll Daily Mission', 'Tiers'],
      interaction_type: 'conditional',
      interaction_summary: 'Reroll Daily Mission is locked behind reaching Tier 4 Wave 30, so tier progression gates whether the reroll lab exists at all.',
      tags: ['daily missions', 'reroll', 'tiers', 'unlock'],
      paragraphs: [
        'Reroll Daily Mission is not available immediately when the Daily Missions system first appears.',
        'It unlocks only after the account reaches Tier 4 Wave 30.',
        'That means tier progression acts as the gate on when mission reroll control becomes available.',
      ],
    }),
  ]
}
