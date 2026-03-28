import { resolveTowerAiMechanicCurrencySemantics } from './mechanicCurrencySemantics'

export function isTowerAiLabDomainPrompt(input: string): boolean {
  return resolveTowerAiMechanicCurrencySemantics(input)?.domain === 'labs'
}

export function isTowerAiCoinCostResearchPrompt(input: string): boolean {
  return resolveTowerAiMechanicCurrencySemantics(input)?.subMechanic === 'lab-research-cost'
}
