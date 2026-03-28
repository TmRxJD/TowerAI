import { z } from 'zod'

const isoDateTimeSchema = z.string().datetime({ offset: true })

const policyResourceSchema = z.enum([
  'site.route',
  'pinia.store',
  'idb.collection',
  'ui.selector',
  'calc.operation',
  'qa.suite',
  'system.runtime',
])

const capabilityActionSchema = z.string().trim().min(1).max(120)
const capabilitySourceSchema = z.enum(['local-runtime', 'server-proxy'])
const capabilityInitiatorSchema = z.enum(['user', 'ai'])

const policySubjectSchema = z.object({
  userId: z.string().trim().min(1).max(128),
  sessionId: z.string().trim().min(1).max(128),
  authScope: z.enum(['guest', 'user']).default('user'),
  roles: z.array(z.string().trim().min(1).max(64)).max(20).default([]),
}).strict()

const stringAllowlistSchema = z.array(z.string().trim().min(1).max(200)).max(250).optional()

export const towerAiCapabilityConstraintSchema = z.object({
  requiresConfirmation: z.boolean().optional(),
  allowOffline: z.boolean().optional(),
  requireOnline: z.boolean().optional(),
  maxStepsPerRun: z.number().int().min(1).max(100).optional(),
  maxRecordsPerWrite: z.number().int().min(1).max(10_000).optional(),
  maxPayloadBytes: z.number().int().min(1).max(10_000_000).optional(),
  allowedInitiators: z.array(capabilityInitiatorSchema).min(1).max(2).optional(),
  allowedSources: z.array(capabilitySourceSchema).min(1).max(3).optional(),
  requireReplayPreviousHash: z.boolean().optional(),
  routeAllowlist: stringAllowlistSchema,
  routeDenylist: stringAllowlistSchema,
  storeAllowlist: stringAllowlistSchema,
  storeDenylist: stringAllowlistSchema,
  collectionAllowlist: stringAllowlistSchema,
  collectionDenylist: stringAllowlistSchema,
  selectorAllowlist: stringAllowlistSchema,
  selectorDenylist: stringAllowlistSchema,
  pathAllowlist: stringAllowlistSchema,
  pathDenylist: stringAllowlistSchema,
}).strict()

export const towerAiCapabilityRuleSchema = z.object({
  capabilityId: z.string().trim().min(1).max(120),
  resource: policyResourceSchema,
  actions: z.array(capabilityActionSchema).min(1).max(100),
  effect: z.enum(['allow', 'deny']).default('allow'),
  constraints: towerAiCapabilityConstraintSchema.default({}),
}).strict()

export const towerAiCapabilityPolicySchema = z.object({
  policyVersion: z.string().trim().min(1).max(80),
  subject: policySubjectSchema,
  issuedAtIso: isoDateTimeSchema,
  expiresAtIso: isoDateTimeSchema,
  nonce: z.string().trim().min(16).max(256),
  capabilities: z.array(towerAiCapabilityRuleSchema).min(1).max(500),
}).strict().superRefine((value, ctx) => {
  const issued = Date.parse(value.issuedAtIso)
  const expires = Date.parse(value.expiresAtIso)
  if (!Number.isFinite(issued) || !Number.isFinite(expires)) return
  if (expires <= issued) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['expiresAtIso'],
      message: 'expiresAtIso must be later than issuedAtIso',
    })
  }
})

export const towerAiSignedPolicyManifestSchema = z.object({
  manifestVersion: z.literal('tracker-ai-policy-manifest-v1'),
  contractVersion: z.literal('tracker-ai-contract-v1').default('tracker-ai-contract-v1'),
  audience: z.enum(['tracker-ai-client', 'tracker-ai-server', 'tracker-ai-both']).default('tracker-ai-both'),
  manifestId: z.string().trim().min(1).max(140),
  policyVersion: z.string().trim().min(1).max(80),
  subject: policySubjectSchema,
  issuedAtIso: isoDateTimeSchema,
  expiresAtIso: isoDateTimeSchema,
  ttlSeconds: z.number().int().min(30).max(86_400),
  nonce: z.string().trim().min(16).max(256),
  capabilities: z.array(towerAiCapabilityRuleSchema).min(1).max(500),
  signature: z.object({
    alg: z.enum(['EdDSA', 'ES256', 'RS256']),
    kid: z.string().trim().min(1).max(120),
    value: z.string().trim().min(16).max(8192),
    signedAtIso: isoDateTimeSchema,
  }).strict(),
}).strict().superRefine((value, ctx) => {
  const issued = Date.parse(value.issuedAtIso)
  const expires = Date.parse(value.expiresAtIso)
  const signedAt = Date.parse(value.signature.signedAtIso)
  if (Number.isFinite(issued) && Number.isFinite(expires)) {
    if (expires <= issued) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['expiresAtIso'],
        message: 'expiresAtIso must be later than issuedAtIso',
      })
    }
    const ttl = Math.floor((expires - issued) / 1000)
    if (ttl !== value.ttlSeconds) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ttlSeconds'],
        message: 'ttlSeconds must exactly match issuedAtIso → expiresAtIso interval',
      })
    }
  }
  if (Number.isFinite(signedAt) && Number.isFinite(issued) && signedAt > issued) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['signature', 'signedAtIso'],
      message: 'signature.signedAtIso must not be later than issuedAtIso',
    })
  }
})

const writeTargetSchema = z.object({
  route: z.string().trim().min(1).max(200).optional(),
  store: z.string().trim().min(1).max(120).optional(),
  path: z.string().trim().min(1).max(240).optional(),
  collection: z.string().trim().min(1).max(120).optional(),
  recordId: z.string().trim().min(1).max(240).optional(),
  selector: z.string().trim().min(1).max(400).optional(),
}).strict().refine(value => Object.keys(value).length > 0, {
  message: 'operation.target must define at least one scoped target',
})

const hex64Schema = z.string().trim().regex(/^[A-Fa-f0-9]{64}$/, 'Expected SHA-256 hex digest')

export const towerAiReplaySafeWriteEnvelopeSchema = z.object({
  envelopeVersion: z.literal('tracker-ai-write-envelope-v1'),
  requestId: z.string().trim().min(1).max(140),
  idempotencyKey: z.string().trim().regex(/^[A-Za-z0-9:_-]{12,200}$/),
  nonce: z.string().trim().min(16).max(256),
  createdAtIso: isoDateTimeSchema,
  expiresAtIso: isoDateTimeSchema,
  actor: policySubjectSchema,
  policy: z.object({
    contractVersion: z.literal('tracker-ai-contract-v1').default('tracker-ai-contract-v1'),
    manifestId: z.string().trim().min(1).max(140),
    policyVersion: z.string().trim().min(1).max(80),
    manifestNonce: z.string().trim().min(16).max(256),
    capabilityId: z.string().trim().min(1).max(120),
  }).strict(),
  operation: z.object({
    resource: policyResourceSchema,
    action: capabilityActionSchema,
    target: writeTargetSchema,
    payload: z.unknown(),
    payloadHash: hex64Schema,
  }).strict(),
  replayProtection: z.object({
    sequence: z.number().int().min(1).max(10_000_000_000),
    previousRequestHash: hex64Schema.optional(),
  }).strict(),
  audit: z.object({
    initiatedBy: z.enum(['user', 'ai']),
    traceId: z.string().trim().min(1).max(160),
    source: z.enum(['local-runtime', 'server-proxy']),
  }).strict(),
}).strict().superRefine((value, ctx) => {
  const created = Date.parse(value.createdAtIso)
  const expires = Date.parse(value.expiresAtIso)
  if (Number.isFinite(created) && Number.isFinite(expires) && expires <= created) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['expiresAtIso'],
      message: 'expiresAtIso must be later than createdAtIso',
    })
  }
})

export type TowerAiCapabilityPolicy = z.infer<typeof towerAiCapabilityPolicySchema>
export type TowerAiCapabilityRule = z.infer<typeof towerAiCapabilityRuleSchema>
export type TowerAiCapabilityConstraint = z.infer<typeof towerAiCapabilityConstraintSchema>
export type TowerAiSignedPolicyManifest = z.infer<typeof towerAiSignedPolicyManifestSchema>
export type TowerAiReplaySafeWriteEnvelope = z.infer<typeof towerAiReplaySafeWriteEnvelopeSchema>

export type TowerAiCapabilityCheckRequest = {
  resource: TowerAiCapabilityRule['resource']
  action: string
  route?: string
  store?: string
  collection?: string
  path?: string
  selector?: string
  isOffline?: boolean
  initiatedBy?: 'user' | 'ai'
  source?: 'local-runtime' | 'server-proxy'
  payloadBytes?: number
  writeRecordCount?: number
  hasPreviousRequestHash?: boolean
}

export type TowerAiCapabilityDecision = {
  allowed: boolean
  capabilityId: string | null
  reason: string
}

function normalize(input: string | undefined): string {
  return String(input || '').trim().toLowerCase()
}

function matchesAction(action: string, actions: string[]): boolean {
  const normalizedAction = normalize(action)
  return actions.some(candidate => {
    const normalizedCandidate = normalize(candidate)
    return normalizedCandidate === '*' || normalizedCandidate === normalizedAction
  })
}

function startsWithAny(value: string | undefined, prefixes: string[] | undefined): boolean {
  const normalizedValue = normalize(value)
  if (!normalizedValue || !Array.isArray(prefixes) || prefixes.length === 0) return false
  return prefixes.some(prefix => normalizedValue.startsWith(normalize(prefix)))
}

function listContains(list: string[] | undefined, value: string | undefined): boolean {
  const normalizedValue = normalize(value)
  if (!normalizedValue || !Array.isArray(list) || list.length === 0) return false
  return list.some(item => normalize(item) === normalizedValue)
}

function matchesPrefixAllowDeny(options: {
  value: string | undefined
  allowlist?: string[]
  denylist?: string[]
}): boolean {
  if (Array.isArray(options.allowlist) && options.allowlist.length > 0) {
    if (!startsWithAny(options.value, options.allowlist)) return false
  }

  if (Array.isArray(options.denylist) && options.denylist.length > 0) {
    if (startsWithAny(options.value, options.denylist)) return false
  }

  return true
}

function matchesExecutionContextConstraints(
  rule: TowerAiCapabilityRule,
  request: TowerAiCapabilityCheckRequest,
): boolean {
  const constraints = rule.constraints
  if (constraints.allowOffline === false && request.isOffline) return false
  if (constraints.requireOnline === true && request.isOffline) return false

  if (Array.isArray(constraints.allowedInitiators) && constraints.allowedInitiators.length > 0) {
    if (!listContains(constraints.allowedInitiators, request.initiatedBy)) return false
  }

  if (Array.isArray(constraints.allowedSources) && constraints.allowedSources.length > 0) {
    if (!listContains(constraints.allowedSources, request.source)) return false
  }

  if (constraints.requireReplayPreviousHash === true && request.hasPreviousRequestHash === false) {
    return false
  }

  return true
}

function matchesPayloadConstraints(
  rule: TowerAiCapabilityRule,
  request: TowerAiCapabilityCheckRequest,
): boolean {
  const constraints = rule.constraints
  if (typeof constraints.maxPayloadBytes === 'number' && Number.isFinite(request.payloadBytes)) {
    if ((request.payloadBytes as number) > constraints.maxPayloadBytes) return false
  }

  if (typeof constraints.maxRecordsPerWrite === 'number' && Number.isFinite(request.writeRecordCount)) {
    if ((request.writeRecordCount as number) > constraints.maxRecordsPerWrite) return false
  }

  return true
}

function matchesResourceScopeConstraints(
  rule: TowerAiCapabilityRule,
  request: TowerAiCapabilityCheckRequest,
): boolean {
  const constraints = rule.constraints
  return (
    matchesPrefixAllowDeny({ value: request.route, allowlist: constraints.routeAllowlist, denylist: constraints.routeDenylist })
    && matchesPrefixAllowDeny({ value: request.store, allowlist: constraints.storeAllowlist, denylist: constraints.storeDenylist })
    && matchesPrefixAllowDeny({ value: request.collection, allowlist: constraints.collectionAllowlist, denylist: constraints.collectionDenylist })
    && matchesPrefixAllowDeny({ value: request.path, allowlist: constraints.pathAllowlist, denylist: constraints.pathDenylist })
    && matchesPrefixAllowDeny({ value: request.selector, allowlist: constraints.selectorAllowlist, denylist: constraints.selectorDenylist })
  )
}

function capabilityMatchesConstraints(
  rule: TowerAiCapabilityRule,
  request: TowerAiCapabilityCheckRequest,
): boolean {
  return (
    matchesExecutionContextConstraints(rule, request)
    && matchesPayloadConstraints(rule, request)
    && matchesResourceScopeConstraints(rule, request)
  )
}

export function validateTowerAiCapabilityPolicy(input: unknown) {
  return towerAiCapabilityPolicySchema.safeParse(input)
}

export function validateTowerAiSignedPolicyManifest(input: unknown) {
  return towerAiSignedPolicyManifestSchema.safeParse(input)
}

export function validateTowerAiReplaySafeWriteEnvelope(input: unknown) {
  return towerAiReplaySafeWriteEnvelopeSchema.safeParse(input)
}

export function isTowerAiManifestActive(
  manifest: TowerAiSignedPolicyManifest,
  nowIso = new Date().toISOString(),
): boolean {
  const now = Date.parse(nowIso)
  const issued = Date.parse(manifest.issuedAtIso)
  const expires = Date.parse(manifest.expiresAtIso)
  if (!Number.isFinite(now) || !Number.isFinite(issued) || !Number.isFinite(expires)) return false
  return now >= issued && now < expires
}

export function evaluateTowerAiCapability(
  policy: TowerAiCapabilityPolicy,
  request: TowerAiCapabilityCheckRequest,
): TowerAiCapabilityDecision {
  const matchingRules = policy.capabilities.filter(rule => {
    if (rule.resource !== request.resource) return false
    if (!matchesAction(request.action, rule.actions)) return false
    return capabilityMatchesConstraints(rule, request)
  })

  const denyRule = matchingRules.find(rule => rule.effect === 'deny')
  if (denyRule) {
    return { allowed: false, capabilityId: denyRule.capabilityId, reason: 'Denied by matching capability rule' }
  }

  const allowRule = matchingRules.find(rule => rule.effect === 'allow')
  if (allowRule) {
    return { allowed: true, capabilityId: allowRule.capabilityId, reason: 'Allowed by matching capability rule' }
  }

  return {
    allowed: false,
    capabilityId: null,
    reason: 'Deny-by-default: no matching allow capability rule',
  }
}
