import { z } from 'zod'

export type TowerAiTurnTraceStep = {
  action: string
  args: Record<string, unknown>
}

export type TowerAiTurnTraceResult = {
  status: 'success' | 'failed' | 'skipped'
  action: string
  durationMs: number
}

export type TowerAiTurnTrace = {
  prompt: string
  steps: TowerAiTurnTraceStep[]
  results: TowerAiTurnTraceResult[]
  startedAtIso: string
  finishedAtIso: string
}

export type TowerAiTurnResult<
  TTrace extends TowerAiTurnTrace = TowerAiTurnTrace,
  TGuardrails extends Record<string, unknown> = Record<string, unknown>,
> = {
  reply: string
  trace?: TTrace
  guardrails?: TGuardrails
}

export type TowerAiDirectorCommand = {
  id?: string
  prompt: string
  requiredActions?: string[]
  forbidFailedActions?: boolean
  maxLatencyMs?: number
}

export type TowerAiDirectorStepResult<
  TTrace extends TowerAiTurnTrace = TowerAiTurnTrace,
  TGuardrails extends Record<string, unknown> = Record<string, unknown>,
> = {
  id: string
  prompt: string
  reply: string
  startedAtIso: string
  finishedAtIso: string
  latencyMs: number
  actionCount: number
  failedActionCount: number
  passed: boolean
  issues: string[]
  trace?: TTrace
  guardrails?: TGuardrails
}

export type TowerAiDirectorSessionResult<
  TTrace extends TowerAiTurnTrace = TowerAiTurnTrace,
  TGuardrails extends Record<string, unknown> = Record<string, unknown>,
> = {
  startedAtIso: string
  finishedAtIso: string
  totalSteps: number
  passedSteps: number
  failedSteps: number
  passed: boolean
  stoppedEarly: boolean
  steps: Array<TowerAiDirectorStepResult<TTrace, TGuardrails>>
}

export type TowerAiDirectorSessionOptions<
  TLocalOptions extends object = Record<string, never>,
  TTrace extends TowerAiTurnTrace = TowerAiTurnTrace,
  TGuardrails extends Record<string, unknown> = Record<string, unknown>,
> = {
  commands: TowerAiDirectorCommand[]
  maxSteps?: number
  stopOnFailure?: boolean
  localTurnOptions?: TLocalOptions
  onStepStart?: (command: TowerAiDirectorCommand, index: number) => void
  onStepComplete?: (step: TowerAiDirectorStepResult<TTrace, TGuardrails>, index: number) => void
}

export type TowerAiTurnExecutor<
  TLocalOptions extends object = Record<string, never>,
  TTrace extends TowerAiTurnTrace = TowerAiTurnTrace,
  TGuardrails extends Record<string, unknown> = Record<string, unknown>,
> = (
  prompt: string,
  options?: TLocalOptions,
) => Promise<TowerAiTurnResult<TTrace, TGuardrails>>

const MAX_SESSION_STEPS = 50

export const towerAiDirectorCommandSchema = z.object({
  id: z.string().trim().min(1).max(120).optional(),
  prompt: z.string().trim().min(1).max(2000),
  requiredActions: z.array(z.string().trim().min(1).max(160)).max(50).optional(),
  forbidFailedActions: z.boolean().optional(),
  maxLatencyMs: z.number().int().min(10).max(600000).optional(),
}).strict()

export const towerAiDirectorSessionInputSchema = z.object({
  commands: z.array(towerAiDirectorCommandSchema).min(1).max(MAX_SESSION_STEPS),
  maxSteps: z.number().int().min(1).max(MAX_SESSION_STEPS).optional(),
  stopOnFailure: z.boolean().optional(),
}).strict()

function normalizeCommandId(command: TowerAiDirectorCommand, index: number): string {
  const id = String(command.id || '').trim()
  if (id) return id
  return `step-${index + 1}`
}

function normalizeCommands(commands: TowerAiDirectorCommand[]): TowerAiDirectorCommand[] {
  return commands
    .map(command => ({
      ...command,
      prompt: String(command.prompt || '').trim(),
      requiredActions: Array.isArray(command.requiredActions)
        ? command.requiredActions.map(action => String(action || '').trim()).filter(Boolean)
        : undefined,
      forbidFailedActions: command.forbidFailedActions !== false,
      maxLatencyMs: Number.isFinite(Number(command.maxLatencyMs))
        ? Math.max(10, Math.floor(Number(command.maxLatencyMs)))
        : undefined,
    }))
    .filter(command => command.prompt.length > 0)
}

function parseIsoToMs(value: string | undefined): number | null {
  if (!value) return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

function deriveLatencyMs(startedAtIso: string, finishedAtIso: string, fallbackMs: number): number {
  const startedMs = parseIsoToMs(startedAtIso)
  const finishedMs = parseIsoToMs(finishedAtIso)
  if (startedMs === null || finishedMs === null) {
    return Math.max(0, fallbackMs)
  }
  return Math.max(0, finishedMs - startedMs)
}

function evaluateStep<
  TTrace extends TowerAiTurnTrace,
  TGuardrails extends Record<string, unknown>,
>(
  command: TowerAiDirectorCommand,
  result: TowerAiTurnResult<TTrace, TGuardrails>,
  fallbackLatencyMs: number,
): Omit<TowerAiDirectorStepResult<TTrace, TGuardrails>, 'id' | 'prompt'> {
  const issues: string[] = []
  const trace = result.trace
  const reply = String(result.reply || '').trim()

  if (!reply) {
    issues.push('empty-reply')
  }

  const actionResults = Array.isArray(trace?.results) ? trace.results : []
  const actionNames = new Set(actionResults.map(item => String(item.action || '').trim()).filter(Boolean))
  const failedActionCount = actionResults.filter(item => item.status === 'failed').length

  const startedAtIso = trace?.startedAtIso || new Date().toISOString()
  const finishedAtIso = trace?.finishedAtIso || new Date().toISOString()
  const latencyMs = deriveLatencyMs(startedAtIso, finishedAtIso, fallbackLatencyMs)

  if (command.forbidFailedActions !== false && failedActionCount > 0) {
    issues.push(`failed-actions:${failedActionCount}`)
  }

  if (Array.isArray(command.requiredActions) && command.requiredActions.length > 0) {
    const missingActions = command.requiredActions.filter(action => !actionNames.has(action))
    if (missingActions.length > 0) {
      issues.push(`missing-actions:${missingActions.join(',')}`)
    }
  }

  if (typeof command.maxLatencyMs === 'number' && latencyMs > command.maxLatencyMs) {
    issues.push(`latency-exceeded:${latencyMs}>${command.maxLatencyMs}`)
  }

  return {
    reply,
    startedAtIso,
    finishedAtIso,
    latencyMs,
    actionCount: actionResults.length,
    failedActionCount,
    passed: issues.length === 0,
    issues,
    trace,
    guardrails: result.guardrails,
  }
}

export function createTowerAiDirector<
  TLocalOptions extends object = Record<string, never>,
  TTrace extends TowerAiTurnTrace = TowerAiTurnTrace,
  TGuardrails extends Record<string, unknown> = Record<string, unknown>,
>(
  executor: TowerAiTurnExecutor<TLocalOptions, TTrace, TGuardrails>,
) {
  return {
    async runSession(
      options: TowerAiDirectorSessionOptions<TLocalOptions, TTrace, TGuardrails>,
    ): Promise<TowerAiDirectorSessionResult<TTrace, TGuardrails>> {
      const startedAtIso = new Date().toISOString()
      const normalizedCommands = normalizeCommands(options.commands)
      const maxSteps = Number.isFinite(Number(options.maxSteps))
        ? Math.max(1, Math.min(MAX_SESSION_STEPS, Math.floor(Number(options.maxSteps))))
        : MAX_SESSION_STEPS

      const stopOnFailure = options.stopOnFailure !== false
      const steps: Array<TowerAiDirectorStepResult<TTrace, TGuardrails>> = []
      let stoppedEarly = false

      for (let index = 0; index < normalizedCommands.length && index < maxSteps; index += 1) {
        const command = normalizedCommands[index]
        options.onStepStart?.(command, index)

        const wallClockStartMs = Date.now()
        const result = await executor(command.prompt, options.localTurnOptions)
        const evaluated = evaluateStep(command, result, Date.now() - wallClockStartMs)

        const step: TowerAiDirectorStepResult<TTrace, TGuardrails> = {
          id: normalizeCommandId(command, index),
          prompt: command.prompt,
          ...evaluated,
        }

        steps.push(step)
        options.onStepComplete?.(step, index)

        if (!step.passed && stopOnFailure) {
          stoppedEarly = true
          break
        }
      }

      if (normalizedCommands.length > maxSteps) {
        stoppedEarly = true
      }

      const passedSteps = steps.filter(step => step.passed).length
      const failedSteps = steps.length - passedSteps

      return {
        startedAtIso,
        finishedAtIso: new Date().toISOString(),
        totalSteps: steps.length,
        passedSteps,
        failedSteps,
        passed: failedSteps === 0,
        stoppedEarly,
        steps,
      }
    },
  }
}
