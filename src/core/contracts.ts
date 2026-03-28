import { z } from 'zod'

export const towerAiAccessModeSchema = z.enum(['full-access'])

export const towerAiActionScopeSchema = z.enum([
  'navigation',
  'tracker-read',
  'tracker-write',
  'tool-read',
  'tool-write',
  'calculation',
  'idb-read',
  'idb-write',
  'pinia-read',
  'pinia-write',
  'qa-execution',
])

export const towerAiActionStatusSchema = z.enum(['success', 'failed', 'skipped'])

export const towerAiActionContextSchema = z.object({
  sessionId: z.string().uuid(),
  traceId: z.string().uuid(),
  startedAtIso: z.string().datetime(),
  accessMode: towerAiAccessModeSchema,
}).strict()

export const towerAiActionRequestSchema = z.object({
  action: z.string().trim().min(1).max(160),
  args: z.record(z.string(), z.unknown()),
}).strict()

export const towerAiToolSignalSchema = z.object({
  success: z.boolean(),
  reason: z.string().trim().min(1).max(200).optional(),
}).strict()

export const towerAiActionResultSchema = z.object({
  status: towerAiActionStatusSchema,
  action: z.string().trim().min(1).max(160),
  data: z.unknown().optional(),
  error: z.string().trim().min(1).max(2000).optional(),
  toolSignal: towerAiToolSignalSchema.optional(),
  durationMs: z.number().min(0),
}).strict()

export const towerAiActionContractSchema = z.object({
  requiresPage: z.string().trim().min(1).max(160).optional(),
  requiresSelection: z.string().trim().min(1).max(160).optional(),
  requiresState: z.array(z.string().trim().min(1).max(160)).max(50).optional(),
  requiresData: z.array(z.string().trim().min(1).max(160)).max(50).optional(),
}).strict()

export const towerAiExecutionTraceSchema = z.object({
  prompt: z.string().trim().min(1).max(20000),
  steps: z.array(towerAiActionRequestSchema),
  results: z.array(towerAiActionResultSchema),
  startedAtIso: z.string().datetime(),
  finishedAtIso: z.string().datetime(),
}).strict()

export type TowerAiAccessMode = z.infer<typeof towerAiAccessModeSchema>
export type TowerAiActionScope = z.infer<typeof towerAiActionScopeSchema>
export type TowerAiActionStatus = z.infer<typeof towerAiActionStatusSchema>
export type TowerAiActionContext = z.infer<typeof towerAiActionContextSchema>
export type TowerAiActionRequest = z.infer<typeof towerAiActionRequestSchema>
export type TowerAiActionResult = z.infer<typeof towerAiActionResultSchema>
export type TowerAiActionContract = z.infer<typeof towerAiActionContractSchema>
export type TowerAiExecutionTrace = z.infer<typeof towerAiExecutionTraceSchema>

export type TowerAiActionPreconditionResult = {
  ok: boolean
  reason?: string
}

export type TowerAiActionPostconditionResult = {
  ok: boolean
  reason?: string
}

export type TowerAiActionDefinition<
  TArgs extends Record<string, unknown> = Record<string, unknown>,
  TResult = unknown,
> = {
  name: string
  description: string
  scope: TowerAiActionScope
  contract?: TowerAiActionContract
  precondition?: (args: TArgs, context: TowerAiActionContext) => Promise<TowerAiActionPreconditionResult> | TowerAiActionPreconditionResult
  postcondition?: (result: TResult, args: TArgs, context: TowerAiActionContext) => Promise<TowerAiActionPostconditionResult> | TowerAiActionPostconditionResult
  run: (args: TArgs, context: TowerAiActionContext) => Promise<TResult> | TResult
}

export function createTowerAiActionContext(accessMode: TowerAiAccessMode = 'full-access'): TowerAiActionContext {
  return {
    sessionId: crypto.randomUUID(),
    traceId: crypto.randomUUID(),
    startedAtIso: new Date().toISOString(),
    accessMode,
  }
}
