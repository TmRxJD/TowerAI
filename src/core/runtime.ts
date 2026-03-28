import type { TowerAiActionDefinition } from './contracts'
import { TowerAiActionRegistry } from './registry'
import { TowerAiOrchestrator } from './orchestrator'

export type TowerAiRuntime = {
  registry: TowerAiActionRegistry
  orchestrator: TowerAiOrchestrator
}

export function createTowerAiRuntime(actionGroups: readonly TowerAiActionDefinition[][]): TowerAiRuntime {
  const registry = new TowerAiActionRegistry()
  for (const group of actionGroups) {
    registry.registerMany([...group])
  }

  return {
    registry,
    orchestrator: new TowerAiOrchestrator(registry),
  }
}
