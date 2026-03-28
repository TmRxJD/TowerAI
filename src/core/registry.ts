import type {
  TowerAiActionContext,
  TowerAiActionDefinition,
  TowerAiActionRequest,
  TowerAiActionResult,
} from './contracts'

function hasOwnProp(target: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(target, key)
}

function validateContractRequirements(
  definition: TowerAiActionDefinition,
  request: TowerAiActionRequest,
): string | null {
  const contract = definition.contract
  if (!contract) return null

  if (Array.isArray(contract.requiresData) && contract.requiresData.length > 0) {
    const missing = contract.requiresData
      .map(field => String(field || '').trim())
      .filter(Boolean)
      .filter(field => !hasOwnProp(request.args, field) || request.args[field] === undefined)

    if (missing.length > 0) {
      return `Missing required args for ${request.action}: ${missing.join(', ')}`
    }
  }

  if (contract.requiresSelection) {
    const key = String(contract.requiresSelection || '').trim()
    if (
      key
      && (
        !hasOwnProp(request.args, key)
        || request.args[key] === undefined
        || request.args[key] === null
        || String(request.args[key] || '').trim() === ''
      )
    ) {
      return `Missing required selection '${key}' for ${request.action}`
    }
  }

  return null
}

function extractToolSignal(data: unknown): { success: boolean; reason?: string } {
  if (!data || typeof data !== 'object') {
    return { success: true }
  }

  const record = data as Record<string, unknown>
  if (typeof record['success'] !== 'boolean') {
    return { success: true }
  }

  return {
    success: record['success'],
    reason: typeof record['reason'] === 'string' ? record['reason'] : undefined,
  }
}

function nowMs(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()
}

export class TowerAiActionRegistry {
  private readonly actions = new Map<string, TowerAiActionDefinition>()

  register<TArgs extends Record<string, unknown>, TResult>(
    definition: TowerAiActionDefinition<TArgs, TResult>,
  ): void {
    this.actions.set(definition.name, definition as TowerAiActionDefinition)
  }

  registerMany(definitions: TowerAiActionDefinition[]): void {
    for (const definition of definitions) {
      this.register(definition)
    }
  }

  list(): TowerAiActionDefinition[] {
    return Array.from(this.actions.values())
  }

  has(name: string): boolean {
    return this.actions.has(name)
  }

  async execute(
    request: TowerAiActionRequest,
    context: TowerAiActionContext,
  ): Promise<TowerAiActionResult> {
    const startedAt = nowMs()
    const definition = this.actions.get(request.action)

    if (!definition) {
      return {
        status: 'failed',
        action: request.action,
        error: `Unknown action: ${request.action}`,
        durationMs: Math.max(0, nowMs() - startedAt),
      }
    }

    const contractError = validateContractRequirements(definition, request)
    if (contractError) {
      return {
        status: 'failed',
        action: request.action,
        error: contractError,
        toolSignal: {
          success: false,
          reason: 'precondition-failed',
        },
        durationMs: Math.max(0, nowMs() - startedAt),
      }
    }

    try {
      if (definition.precondition) {
        const precondition = await definition.precondition(request.args, context)
        if (!precondition.ok) {
          return {
            status: 'failed',
            action: request.action,
            error: precondition.reason || `Precondition failed for action: ${request.action}`,
            toolSignal: {
              success: false,
              reason: precondition.reason || 'precondition-failed',
            },
            durationMs: Math.max(0, nowMs() - startedAt),
          }
        }
      }

      const data = await definition.run(request.args, context)
      const signal = extractToolSignal(data)

      if (!signal.success) {
        return {
          status: 'failed',
          action: request.action,
          data,
          error: signal.reason || `Action reported failure: ${request.action}`,
          toolSignal: signal,
          durationMs: Math.max(0, nowMs() - startedAt),
        }
      }

      if (definition.postcondition) {
        const postcondition = await definition.postcondition(data, request.args, context)
        if (!postcondition.ok) {
          return {
            status: 'failed',
            action: request.action,
            data,
            error: postcondition.reason || `Postcondition failed for action: ${request.action}`,
            toolSignal: {
              success: false,
              reason: postcondition.reason || 'postcondition-failed',
            },
            durationMs: Math.max(0, nowMs() - startedAt),
          }
        }
      }

      return {
        status: 'success',
        action: request.action,
        data,
        toolSignal: signal,
        durationMs: Math.max(0, nowMs() - startedAt),
      }
    } catch (error) {
      return {
        status: 'failed',
        action: request.action,
        error: error instanceof Error ? error.message : String(error),
        toolSignal: {
          success: false,
          reason: 'runtime-error',
        },
        durationMs: Math.max(0, nowMs() - startedAt),
      }
    }
  }
}
