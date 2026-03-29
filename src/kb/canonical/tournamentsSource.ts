import {
  TOURNAMENT_BATTLE_CONDITION_DEFINITIONS,
  TOURNAMENT_DIFFICULTY_FACTS,
  TOURNAMENT_ENTRY_FACTS,
  TOURNAMENT_HEAT_FACTS,
  TOURNAMENT_HEAT_PROFILES,
  TOURNAMENT_LEAGUES,
  TOURNAMENT_OVERVIEW_FACTS,
  TOURNAMENT_PROMOTION_FACTS,
  TOURNAMENT_PROMOTION_RULES,
  TOURNAMENT_REWARD_ROWS,
  TOURNAMENT_REWARD_RULE_FACT,
  TOURNAMENT_REWARD_TABLES,
  TOURNAMENT_SCHEDULE,
  TOURNAMENT_TICKET_FACTS,
  TOURNAMENT_TICKET_MODEL,
  TOURNAMENT_UNLOCK_REQUIREMENT,
  type TournamentBattleConditionDefinition,
  type TournamentHeatProfile,
  type TournamentLeagueDefinition,
  type TournamentLeagueRewardTable,
  type TournamentPromotionRule,
  type TournamentRewardRow,
  type TournamentScheduleSlot,
  type TournamentTicketModel,
  type TournamentUnlockRequirement,
} from '@tmrxjd/platform/tools'

export interface TournamentsSourceDocument {
  overviewFacts: string[]
  entryFacts: string[]
  ticketFacts: string[]
  promotionFacts: string[]
  difficultyFacts: string[]
  heatFacts: string[]
  rewardRuleFact: string
  schedule: readonly TournamentScheduleSlot[]
  unlockRequirement: TournamentUnlockRequirement
  ticketModel: TournamentTicketModel
  leagues: readonly TournamentLeagueDefinition[]
  promotionRules: readonly TournamentPromotionRule[]
  heatProfiles: readonly TournamentHeatProfile[]
  rewardRows: readonly TournamentRewardRow[]
  rewardTables: readonly TournamentLeagueRewardTable[]
  battleConditionDefinitions: readonly TournamentBattleConditionDefinition[]
}

export function loadTournamentsSourceDocument(): TournamentsSourceDocument {
  return {
    overviewFacts: [...TOURNAMENT_OVERVIEW_FACTS],
    entryFacts: [...TOURNAMENT_ENTRY_FACTS],
    ticketFacts: [...TOURNAMENT_TICKET_FACTS],
    promotionFacts: [...TOURNAMENT_PROMOTION_FACTS],
    difficultyFacts: [...TOURNAMENT_DIFFICULTY_FACTS],
    heatFacts: [...TOURNAMENT_HEAT_FACTS],
    rewardRuleFact: TOURNAMENT_REWARD_RULE_FACT,
    schedule: TOURNAMENT_SCHEDULE,
    unlockRequirement: TOURNAMENT_UNLOCK_REQUIREMENT,
    ticketModel: TOURNAMENT_TICKET_MODEL,
    leagues: TOURNAMENT_LEAGUES,
    promotionRules: TOURNAMENT_PROMOTION_RULES,
    heatProfiles: TOURNAMENT_HEAT_PROFILES,
    rewardRows: TOURNAMENT_REWARD_ROWS,
    rewardTables: TOURNAMENT_REWARD_TABLES,
    battleConditionDefinitions: TOURNAMENT_BATTLE_CONDITION_DEFINITIONS,
  }
}
