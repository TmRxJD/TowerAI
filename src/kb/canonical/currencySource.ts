import {
  BIT_FACTS,
  CASH_BONUS_ENHANCEMENT_FACTS,
  CASH_ENEMY_VALUE_RULES,
  CASH_IMPROVEMENT_FACTS,
  CASH_WAVE_FLOW_FACTS,
  type CashEnemyValueRule,
  COIN_ACQUISITION_FACTS,
  COIN_BONUS_ENHANCEMENT_FACTS,
  COIN_IMPROVEMENT_FACTS,
  CURRENCY_DEFINITIONS,
  CURRENCY_FLOW_ROWS,
  CURRENCY_OVERVIEW_FACTS,
  type CurrencyDefinition,
  type CurrencyFlowRow,
  ELITE_CELL_IMPROVEMENT_FACTS,
  ELITE_CELL_TIER_FACTS,
  ELITE_CELL_TIER_ROWS,
  type EliteCellTierRow,
  GEM_ACQUISITION_FACTS,
  GEM_SPENDING_FACTS,
  KEY_FACTS,
  MEDAL_FACTS,
  MODULE_CURRENCY_FACTS,
  POWER_STONE_FACTS,
  TOKEN_FACTS,
} from '@tmrxjd/platform/tools'

export interface CurrencySourceDocument {
  overviewFacts: string[]
  definitions: readonly CurrencyDefinition[]
  flowRows: readonly CurrencyFlowRow[]
  cashEnemyValueRules: readonly CashEnemyValueRule[]
  cashWaveFlowFacts: string[]
  cashImprovementFacts: string[]
  cashEnhancementFacts: string[]
  coinAcquisitionFacts: string[]
  coinImprovementFacts: string[]
  coinEnhancementFacts: string[]
  gemAcquisitionFacts: string[]
  gemSpendingFacts: string[]
  powerStoneFacts: string[]
  medalFacts: string[]
  eliteCellTierFacts: string[]
  eliteCellTierRows: readonly EliteCellTierRow[]
  eliteCellImprovementFacts: string[]
  keyFacts: string[]
  bitFacts: string[]
  tokenFacts: string[]
  moduleCurrencyFacts: string[]
}

export function loadCurrencySourceDocument(): CurrencySourceDocument {
  return {
    overviewFacts: [...CURRENCY_OVERVIEW_FACTS],
    definitions: CURRENCY_DEFINITIONS,
    flowRows: CURRENCY_FLOW_ROWS,
    cashEnemyValueRules: CASH_ENEMY_VALUE_RULES,
    cashWaveFlowFacts: [...CASH_WAVE_FLOW_FACTS],
    cashImprovementFacts: [...CASH_IMPROVEMENT_FACTS],
    cashEnhancementFacts: [...CASH_BONUS_ENHANCEMENT_FACTS],
    coinAcquisitionFacts: [...COIN_ACQUISITION_FACTS],
    coinImprovementFacts: [...COIN_IMPROVEMENT_FACTS],
    coinEnhancementFacts: [...COIN_BONUS_ENHANCEMENT_FACTS],
    gemAcquisitionFacts: [...GEM_ACQUISITION_FACTS],
    gemSpendingFacts: [...GEM_SPENDING_FACTS],
    powerStoneFacts: [...POWER_STONE_FACTS],
    medalFacts: [...MEDAL_FACTS],
    eliteCellTierFacts: [...ELITE_CELL_TIER_FACTS],
    eliteCellTierRows: ELITE_CELL_TIER_ROWS,
    eliteCellImprovementFacts: [...ELITE_CELL_IMPROVEMENT_FACTS],
    keyFacts: [...KEY_FACTS],
    bitFacts: [...BIT_FACTS],
    tokenFacts: [...TOKEN_FACTS],
    moduleCurrencyFacts: [...MODULE_CURRENCY_FACTS],
  }
}
