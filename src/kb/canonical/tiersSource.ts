import {
  TIER_BATTLE_CONDITION_DEFINITIONS,
  TIER_BATTLE_CONDITION_ROWS,
  TIER_COIN_BONUS_ROWS,
  TIER_DATA,
  TIER_OVERVIEW_FACTS,
  TIER_UNLOCK_REQUIREMENT_ROWS,
  type TierBattleConditionDefinition,
  type TierBattleConditionRow,
  type TierCoinBonusRow,
  type TierData,
  type TierUnlockRequirementRow,
} from '@tmrxjd/platform/tools'

export interface TiersSourceDocument {
  overviewParagraphs: string[]
  tierRows: readonly TierData[]
  coinBonusRows: readonly TierCoinBonusRow[]
  unlockRequirementRows: readonly TierUnlockRequirementRow[]
  battleConditionRows: readonly TierBattleConditionRow[]
  battleConditionDefinitions: readonly TierBattleConditionDefinition[]
}

export function loadTiersSourceDocument(): TiersSourceDocument {
  return {
    overviewParagraphs: [...TIER_OVERVIEW_FACTS],
    tierRows: TIER_DATA,
    coinBonusRows: TIER_COIN_BONUS_ROWS,
    unlockRequirementRows: TIER_UNLOCK_REQUIREMENT_ROWS,
    battleConditionRows: TIER_BATTLE_CONDITION_ROWS,
    battleConditionDefinitions: TIER_BATTLE_CONDITION_DEFINITIONS,
  }
}
