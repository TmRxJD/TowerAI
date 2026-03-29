import {
  ALL_PERKS,
  PERK_CHOICE_FACTS,
  PERK_LABS,
  PERK_OVERVIEW_FACTS,
  PERK_POOL_RATES,
  PERK_WAVE_REQUIREMENT_BRACKETS,
  PERK_WAVE_REQUIREMENT_FORMULA,
  type PerkEntry,
  type PerkLabDefinition,
  type PerkPoolRate,
  type PerkWaveRequirementBracket,
  RANDOM_UW_PERK_NOTES,
  RANDOM_UW_PERK_STATS,
  type RandomUwPerkStat,
  STANDARD_PERK_MATH_FACTS,
  STANDARD_PERK_NOTES,
  STANDARD_PERKS,
  TRADE_OFF_PERK_NOTES,
  TRADE_OFF_PERKS,
  UW_PERK_NOTES,
  UW_PERKS,
} from '@tmrxjd/platform/tools'

export interface PerksSourceDocument {
  overviewParagraphs: string[]
  waveRequirementBrackets: readonly PerkWaveRequirementBracket[]
  waveRequirementFormula: string
  waveRequirementNotes: readonly string[]
  choiceFacts: readonly string[]
  standardPerkMathFacts: readonly string[]
  poolRates: readonly PerkPoolRate[]
  standardPerks: readonly PerkEntry[]
  standardPerkNotes: readonly string[]
  uwPerks: readonly PerkEntry[]
  uwPerkNotes: readonly string[]
  tradeOffPerks: readonly PerkEntry[]
  tradeOffPerkNotes: readonly string[]
  randomUwPerkStats: readonly RandomUwPerkStat[]
  randomUwPerkNotes: readonly string[]
  perkLabs: readonly PerkLabDefinition[]
  allPerks: readonly PerkEntry[]
}

export function loadPerksSourceDocument(): PerksSourceDocument {
  return {
    overviewParagraphs: [...PERK_OVERVIEW_FACTS],
    waveRequirementBrackets: PERK_WAVE_REQUIREMENT_BRACKETS,
    waveRequirementFormula: PERK_WAVE_REQUIREMENT_FORMULA.formula,
    waveRequirementNotes: PERK_WAVE_REQUIREMENT_FORMULA.notes,
    choiceFacts: PERK_CHOICE_FACTS,
    standardPerkMathFacts: STANDARD_PERK_MATH_FACTS,
    poolRates: PERK_POOL_RATES,
    standardPerks: STANDARD_PERKS,
    standardPerkNotes: STANDARD_PERK_NOTES,
    uwPerks: UW_PERKS,
    uwPerkNotes: UW_PERK_NOTES,
    tradeOffPerks: TRADE_OFF_PERKS,
    tradeOffPerkNotes: TRADE_OFF_PERK_NOTES,
    randomUwPerkStats: RANDOM_UW_PERK_STATS,
    randomUwPerkNotes: RANDOM_UW_PERK_NOTES,
    perkLabs: PERK_LABS,
    allPerks: ALL_PERKS,
  }
}
