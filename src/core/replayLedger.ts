import { sha256Hex } from './hashing'
import type { TowerAiReplaySafeWriteEnvelope } from './securityPolicy'

const CURSOR_PREFIX = 'tracker-ai-replay-cursor:'
const EVENT_PREFIX = 'tracker-ai-replay-event:'
const IDEMPOTENCY_PREFIX = 'tracker-ai-replay-idempotency:'

export type TowerAiReplayCursor = {
  id: string
  actorKey: string
  lastSequence: number
  lastRequestHash: string
  lastRequestId: string
  updatedAtIso: string
}

export type TowerAiReplayEventRecord = {
  id: string
  requestId: string
  idempotencyKey: string
  actorKey: string
  sequence: number
  requestHash: string
  previousRequestHash?: string
  createdAtIso: string
  envelopeExpiresAtIso: string
  status: 'accepted'
  syncStatus: 'pending' | 'synced' | 'failed'
  syncAttempts: number
  auditId: string
}

export type TowerAiReplayIdempotencyRecord = {
  id: string
  actorKey: string
  idempotencyKey: string
  requestId: string
  createdAtIso: string
  syncStatus: 'pending'
}

export type TowerAiReplayLedgerGuardResult = {
  actorKey: string
  cursorId: string
  eventId: string
  idempotencyId: string
  requestHash: string
}

export type TowerAiReplayLedgerGuardState = {
  existingEvent?: unknown
  existingIdempotency?: unknown
  existingCursor?: unknown
}

export type TowerAiReplayLedgerCommitRecords = {
  cursorRecord: TowerAiReplayCursor
  eventRecord: TowerAiReplayEventRecord
  idempotencyRecord: TowerAiReplayIdempotencyRecord
}

function stableNormalize(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(item => stableNormalize(item, seen))
  if (seen.has(value as object)) {
    throw new Error('replay ledger cannot hash circular payloads')
  }
  seen.add(value as object)
  const out: Record<string, unknown> = {}
  const record = value as Record<string, unknown>
  const keys = Object.keys(record).sort((a, b) => a.localeCompare(b))
  for (const key of keys) {
    out[key] = stableNormalize(record[key], seen)
  }
  return out
}

function stableStringify(value: unknown): string {
  return JSON.stringify(stableNormalize(value))
}

function extractStoredCursor(record: unknown): TowerAiReplayCursor | undefined {
  if (!record || typeof record !== 'object') return undefined
  const data = (record as Record<string, unknown>)['data']
  if (!data || typeof data !== 'object') return undefined
  return data as TowerAiReplayCursor
}

export function getTowerAiReplayLedgerActorKey(envelope: TowerAiReplaySafeWriteEnvelope): string {
  const { authScope, userId, sessionId } = envelope.actor
  return `${authScope}:${userId}:${sessionId}`
}

export function getTowerAiReplayLedgerCursorId(actorKey: string): string {
  return `${CURSOR_PREFIX}${actorKey}`
}

export function getTowerAiReplayLedgerEventId(requestId: string): string {
  return `${EVENT_PREFIX}${requestId}`
}

export function getTowerAiReplayLedgerIdempotencyId(actorKey: string, idempotencyKey: string): string {
  return `${IDEMPOTENCY_PREFIX}${actorKey}:${idempotencyKey}`
}

export async function computeTowerAiReplayRequestHash(envelope: TowerAiReplaySafeWriteEnvelope): Promise<string> {
  const payload = {
    requestId: envelope.requestId,
    idempotencyKey: envelope.idempotencyKey,
    actor: envelope.actor,
    policy: envelope.policy,
    operation: {
      resource: envelope.operation.resource,
      action: envelope.operation.action,
      target: envelope.operation.target,
      payloadHash: envelope.operation.payloadHash,
    },
    replayProtection: envelope.replayProtection,
    audit: {
      initiatedBy: envelope.audit.initiatedBy,
      source: envelope.audit.source,
      traceId: envelope.audit.traceId,
    },
    createdAtIso: envelope.createdAtIso,
    expiresAtIso: envelope.expiresAtIso,
  }
  return await sha256Hex(stableStringify(payload), 'replay ledger hashing')
}

export async function guardTowerAiReplayLedgerAccept(
  envelope: TowerAiReplaySafeWriteEnvelope,
  state: TowerAiReplayLedgerGuardState,
): Promise<TowerAiReplayLedgerGuardResult> {
  const actorKey = getTowerAiReplayLedgerActorKey(envelope)
  const cursorId = getTowerAiReplayLedgerCursorId(actorKey)
  const eventId = getTowerAiReplayLedgerEventId(envelope.requestId)
  const idempotencyId = getTowerAiReplayLedgerIdempotencyId(actorKey, envelope.idempotencyKey)

  if (state.existingEvent) {
    throw new Error(`replay ledger rejected duplicate requestId: ${envelope.requestId}`)
  }
  if (state.existingIdempotency) {
    throw new Error(`replay ledger rejected duplicate idempotencyKey for actor scope: ${envelope.idempotencyKey}`)
  }

  const sequence = envelope.replayProtection.sequence
  const cursorData = extractStoredCursor(state.existingCursor)
  if (cursorData) {
    if (sequence <= cursorData.lastSequence) {
      throw new Error(`replay ledger rejected out-of-order sequence: ${sequence} <= ${cursorData.lastSequence}`)
    }
    const previousHash = envelope.replayProtection.previousRequestHash
    if (sequence > 1 && previousHash !== cursorData.lastRequestHash) {
      throw new Error('replay ledger rejected previousRequestHash mismatch for sequence chain')
    }
  } else if (sequence > 1) {
    throw new Error('replay ledger requires sequence 1 for first actor-scoped request')
  }

  const requestHash = await computeTowerAiReplayRequestHash(envelope)
  return {
    actorKey,
    cursorId,
    eventId,
    idempotencyId,
    requestHash,
  }
}

export function buildTowerAiReplayLedgerCommitRecords(input: {
  envelope: TowerAiReplaySafeWriteEnvelope
  guard: TowerAiReplayLedgerGuardResult
  auditId: string
  nowIso?: string
}): TowerAiReplayLedgerCommitRecords {
  const nowIso = input.nowIso || new Date().toISOString()
  const sequence = input.envelope.replayProtection.sequence

  return {
    cursorRecord: {
      id: input.guard.cursorId,
      actorKey: input.guard.actorKey,
      lastSequence: sequence,
      lastRequestHash: input.guard.requestHash,
      lastRequestId: input.envelope.requestId,
      updatedAtIso: nowIso,
    },
    eventRecord: {
      id: input.guard.eventId,
      requestId: input.envelope.requestId,
      idempotencyKey: input.envelope.idempotencyKey,
      actorKey: input.guard.actorKey,
      sequence,
      requestHash: input.guard.requestHash,
      previousRequestHash: input.envelope.replayProtection.previousRequestHash,
      createdAtIso: nowIso,
      envelopeExpiresAtIso: input.envelope.expiresAtIso,
      status: 'accepted',
      syncStatus: 'pending',
      syncAttempts: 0,
      auditId: input.auditId,
    },
    idempotencyRecord: {
      id: input.guard.idempotencyId,
      actorKey: input.guard.actorKey,
      idempotencyKey: input.envelope.idempotencyKey,
      requestId: input.envelope.requestId,
      createdAtIso: nowIso,
      syncStatus: 'pending',
    },
  }
}
