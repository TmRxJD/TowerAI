import { createTowerAiActionContext } from './contracts'
import type {
  TowerAiAccessMode,
  TowerAiActionRequest,
  TowerAiExecutionTrace,
} from './contracts'
import { TowerAiActionRegistry } from './registry'

export type TowerAiPlan = {
  prompt: string
  steps: TowerAiActionRequest[]
}

export class TowerAiOrchestrator {
  constructor(private readonly registry: TowerAiActionRegistry) {}

  async executePlan(
    plan: TowerAiPlan,
    options?: {
      accessMode?: TowerAiAccessMode
      onExecutionChange?: (executing: boolean, action: string) => void
    },
  ): Promise<TowerAiExecutionTrace> {
    const context = createTowerAiActionContext(options?.accessMode ?? 'full-access')
    const results: TowerAiExecutionTrace['results'] = []

    for (const step of plan.steps) {
      options?.onExecutionChange?.(true, step.action)
      const result = await this.registry.execute(step, context)
      options?.onExecutionChange?.(false, step.action)
      results.push(result)
      if (result.status === 'failed') {
        break
      }
    }

    return {
      prompt: plan.prompt,
      steps: plan.steps,
      results,
      startedAtIso: context.startedAtIso,
      finishedAtIso: new Date().toISOString(),
    }
  }
}
