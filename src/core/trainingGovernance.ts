import { z } from 'zod'

const isoDateTimeSchema = z.string().datetime({ offset: true })
const boundedString = (min: number, max: number) => z.string().trim().min(min).max(max)
const optionalBoundedString = (max: number) => z.string().trim().max(max).optional()
const nonNegativeNumber = z.number().finite().min(0)
const nonNegativeInt = z.number().int().min(0)
const scoreSchema = z.number().finite().min(-1).max(1)
const probabilitySchema = z.number().finite().min(0).max(1)
const sha256HexSchema = z.string().trim().regex(/^[A-Fa-f0-9]{64}$/, 'Expected SHA-256 hex digest')

const analyticsFeedbackSchema = z.object({
  rating: z.enum(['positive', 'negative', 'neutral', 'mixed']).optional(),
  score: z.number().int().min(-1).max(1).optional(),
  label: optionalBoundedString(120),
  notes: optionalBoundedString(2_000),
  source: z.enum(['explicit-user', 'implicit-user', 'operator', 'system-derived']).optional(),
}).strict()

const chunkScoreSchema = z.object({
  chunkId: boundedString(1, 240),
  score: scoreSchema,
  rank: z.number().int().min(1).max(1_000).optional(),
  source: optionalBoundedString(120),
}).strict()

const analyticsSourceSchema = z.object({
  sourceId: boundedString(1, 240),
  sourceType: z.enum(['cloud-aggregate', 'local-telemetry-export', 'curated-dataset', 'kb-derived', 'operator-import']),
  collectedAtIso: isoDateTimeSchema.optional(),
  windowStartIso: isoDateTimeSchema.optional(),
  windowEndIso: isoDateTimeSchema.optional(),
  recordCount: nonNegativeInt.optional(),
}).strict()

export const towerAiTelemetryExportRowSchema = z.object({
  id: boundedString(1, 240),
  timestampIso: isoDateTimeSchema,
  interactionType: boundedString(1, 120),
  query: boundedString(1, 8_000),
  actions: z.array(boundedString(1, 160)).max(200),
  touchedFiles: z.array(boundedString(1, 600)).max(500),
  success: z.boolean(),
  error: z.string().max(2_000),
  feedbackScore: z.number().finite().min(-1).max(1).nullable(),
  notes: z.string().max(8_000),
}).strict()

export const towerAiTelemetryExportSchema = z.object({
  contractVersion: z.literal('trackerai-telemetry-export-v1'),
  generatedAtIso: isoDateTimeSchema,
  count: nonNegativeInt,
  filters: z.object({
    limit: z.number().int().min(1).max(50_000),
    includeFailures: z.boolean(),
    includeSuccess: z.boolean(),
  }).strict(),
  outputPath: z.string().trim().min(1).max(1_200).nullable().optional(),
  rows: z.array(towerAiTelemetryExportRowSchema).max(50_000),
}).strict().superRefine((value, ctx) => {
  if (value.count !== value.rows.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['count'],
      message: 'count must exactly match rows.length',
    })
  }
})

export const towerAiGovernedQueryAnalyticsSchema = z.object({
  rawQueryText: boundedString(1, 16_000),
  normalizedQueryText: boundedString(1, 16_000),
  detectedIntent: boundedString(1, 160),
  detectedSchema: boundedString(1, 160).nullable().optional(),
  toolSelected: boundedString(1, 160).nullable().optional(),
  reasoningModelUsed: boundedString(1, 200).nullable().optional(),
  latencyMs: nonNegativeNumber,
  tokenUsage: z.object({
    inputTokens: nonNegativeInt.optional(),
    outputTokens: nonNegativeInt.optional(),
    totalTokens: nonNegativeInt.optional(),
  }).strict(),
  userFeedback: analyticsFeedbackSchema.nullable().optional(),
}).strict()

export const towerAiGovernedRetrievalAnalyticsSchema = z.object({
  topKChunksBeforeRerank: z.array(chunkScoreSchema).max(200),
  topKChunksAfterRerank: z.array(chunkScoreSchema).max(200),
  rerankerConfidenceScores: z.array(probabilitySchema).max(200),
  retrievalSuccess: z.boolean(),
  retrievalFailureReason: boundedString(1, 400).nullable().optional(),
}).strict()

export const towerAiGovernedRouterAnalyticsSchema = z.object({
  routerPredictedIntent: boundedString(1, 160),
  routerConfidence: probabilitySchema,
  actualToolUsed: boundedString(1, 160).nullable().optional(),
  misrouteDetected: z.boolean(),
  misrouteType: boundedString(1, 160).nullable().optional(),
  correctionSource: boundedString(1, 160).nullable().optional(),
}).strict()

export const towerAiGovernedReasoningModelAnalyticsSchema = z.object({
  modelName: boundedString(1, 200),
  promptTemplateUsed: boundedString(1, 200),
  tokensIn: nonNegativeInt,
  tokensOut: nonNegativeInt,
  latencyMs: nonNegativeNumber,
  fallbackTriggered: z.boolean(),
  hallucinationFlag: z.boolean(),
  userFeedback: analyticsFeedbackSchema.nullable().optional(),
}).strict()

export const towerAiGovernedToolExecutionAnalyticsSchema = z.object({
  toolName: boundedString(1, 160),
  toolInputSchema: boundedString(1, 200),
  toolOutputSchema: boundedString(1, 200),
  toolExecutionSuccess: z.boolean(),
  toolErrorType: boundedString(1, 160).nullable().optional(),
  toolLatencyMs: nonNegativeNumber,
  toolUsageFrequency: nonNegativeInt,
}).strict()

export const towerAiGovernedKbHealthAnalyticsSchema = z.object({
  chunkId: boundedString(1, 240),
  retrievalFrequency: nonNegativeInt,
  retrievalSuccessRate: probabilitySchema,
  retrievalFailureRate: probabilitySchema,
  rerankerScoreDistribution: z.object({
    min: scoreSchema,
    max: scoreSchema,
    mean: scoreSchema,
    p50: scoreSchema.optional(),
    p90: scoreSchema.optional(),
  }).strict(),
  chunkAgeDays: nonNegativeNumber,
  chunkLastUpdatedIso: isoDateTimeSchema,
}).strict().superRefine((value, ctx) => {
  const totalRate = value.retrievalSuccessRate + value.retrievalFailureRate
  if (totalRate > 1.000001) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['retrievalFailureRate'],
      message: 'retrievalSuccessRate + retrievalFailureRate must not exceed 1',
    })
  }
})

export const towerAiGovernedAnalyticsRecordSchema = z.object({
  recordVersion: z.literal('trackerai-governed-analytics-record-v1'),
  recordId: boundedString(1, 240),
  sessionId: boundedString(1, 200).nullable().optional(),
  actorId: boundedString(1, 200).nullable().optional(),
  occurredAtIso: isoDateTimeSchema,
  source: analyticsSourceSchema,
  query: towerAiGovernedQueryAnalyticsSchema,
  retrieval: towerAiGovernedRetrievalAnalyticsSchema,
  router: towerAiGovernedRouterAnalyticsSchema,
  reasoning: towerAiGovernedReasoningModelAnalyticsSchema,
  toolExecution: towerAiGovernedToolExecutionAnalyticsSchema,
  kbHealth: towerAiGovernedKbHealthAnalyticsSchema,
  tags: z.array(boundedString(1, 80)).max(40).default([]),
}).strict()

export const towerAiGovernedAnalyticsDatasetSchema = z.object({
  contractVersion: z.literal('trackerai-governed-analytics-dataset-v1'),
  generatedAtIso: isoDateTimeSchema,
  pipelineVersion: boundedString(1, 120),
  sourceContracts: z.object({
    telemetryExport: z.literal('trackerai-telemetry-export-v1'),
    governedAnalytics: z.literal('trackerai-governed-analytics-dataset-v1'),
  }).strict(),
  sources: z.array(analyticsSourceSchema).min(1).max(100),
  rowCount: nonNegativeInt,
  rows: z.array(towerAiGovernedAnalyticsRecordSchema).max(100_000),
}).strict().superRefine((value, ctx) => {
  if (value.rowCount !== value.rows.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['rowCount'],
      message: 'rowCount must exactly match rows.length',
    })
  }
})

const trainingComponentStateSchema = z.object({
  required: z.boolean(),
  dirty: z.boolean(),
  reason: boundedString(1, 400),
  inputHash: sha256HexSchema.optional(),
  artifactHash: sha256HexSchema.optional(),
  trainedAtIso: isoDateTimeSchema.optional(),
}).strict()

export const towerAiMlStateSchema = z.object({
  contractVersion: z.literal('trackerai-ml-state-v1'),
  pipelineVersion: boundedString(1, 120),
  state: z.enum(['clean', 'dirty']),
  updatedAtIso: isoDateTimeSchema,
  generatedFrom: z.object({
    canonicalKbPath: boundedString(1, 1_200),
    analyticsDatasetContract: z.literal('trackerai-governed-analytics-dataset-v1'),
    telemetryExportContract: z.literal('trackerai-telemetry-export-v1'),
  }).strict(),
  hashes: z.object({
    kbContents: sha256HexSchema,
    toolDefinitions: sha256HexSchema,
    requestTypes: sha256HexSchema,
    embeddingModelVersion: sha256HexSchema,
    rerankerVersion: sha256HexSchema,
    routerClassifierVersion: sha256HexSchema,
    trainingPipelineVersion: sha256HexSchema,
    analyticsDataset: sha256HexSchema,
    threeBTrainingConfig: sha256HexSchema,
  }).strict(),
  versions: z.object({
    embeddingModel: boundedString(1, 120),
    reranker: boundedString(1, 120),
    routerClassifier: boundedString(1, 120),
    threeBModel: boundedString(1, 120),
    pipeline: boundedString(1, 120),
  }).strict(),
  analyticsIngestion: z.object({
    ingestedAtIso: isoDateTimeSchema,
    sourceCount: nonNegativeInt,
    ingestedRowCount: nonNegativeInt,
    deduplicatedRowCount: nonNegativeInt,
    normalizedRowCount: nonNegativeInt,
    datasetHash: sha256HexSchema,
    sources: z.array(analyticsSourceSchema).min(1).max(100),
  }).strict(),
  components: z.object({
    embeddings: trainingComponentStateSchema,
    reranker: trainingComponentStateSchema,
    routerClassifier: trainingComponentStateSchema,
    threeBLoRa: trainingComponentStateSchema,
  }).strict(),
  artifacts: z.object({
    embeddingsIndexPath: boundedString(1, 1_200),
    embeddingsMetaPath: boundedString(1, 1_200),
    rerankerPath: boundedString(1, 1_200),
    routerPath: boundedString(1, 1_200),
    classifierPath: boundedString(1, 1_200),
    threeBLoRaPath: boundedString(1, 1_200),
  }).strict(),
  validation: z.object({
    validatedAtIso: isoDateTimeSchema,
    retrievalAccuracy: probabilitySchema,
    routingAccuracy: probabilitySchema,
    embeddingQualityScore: probabilitySchema,
    rerankerScore: probabilitySchema,
    classifierScore: probabilitySchema,
  }).strict(),
  cloudSync: z.object({
    status: z.enum(['pending', 'clean', 'failed']),
    syncedAtIso: isoDateTimeSchema.optional(),
    registryManifestVersion: boundedString(1, 120).optional(),
    artifactBundleHash: sha256HexSchema.optional(),
    warning: boundedString(1, 2_000).optional(),
  }).strict(),
}).strict().superRefine((value, ctx) => {
  const hasDirtyComponent = Object.values(value.components).some(component => component.dirty)
  if (value.state === 'clean' && hasDirtyComponent) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['state'],
      message: 'state cannot be clean while any governed component is dirty',
    })
  }
  if (value.state === 'clean' && value.cloudSync.status !== 'clean') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cloudSync', 'status'],
      message: 'cloudSync.status must be clean when ml state is clean',
    })
  }
})

export type TowerAiTelemetryExportRow = z.infer<typeof towerAiTelemetryExportRowSchema>
export type TowerAiTelemetryExport = z.infer<typeof towerAiTelemetryExportSchema>
export type TowerAiGovernedAnalyticsRecord = z.infer<typeof towerAiGovernedAnalyticsRecordSchema>
export type TowerAiGovernedAnalyticsDataset = z.infer<typeof towerAiGovernedAnalyticsDatasetSchema>
export type TowerAiMlState = z.infer<typeof towerAiMlStateSchema>

export function parseTowerAiTelemetryExport(value: unknown): TowerAiTelemetryExport {
  return towerAiTelemetryExportSchema.parse(value)
}

export function parseTowerAiGovernedAnalyticsDataset(value: unknown): TowerAiGovernedAnalyticsDataset {
  return towerAiGovernedAnalyticsDatasetSchema.parse(value)
}

export function parseTowerAiMlState(value: unknown): TowerAiMlState {
  return towerAiMlStateSchema.parse(value)
}

export function stringifyTowerAiMlState(value: unknown): string {
  return `${JSON.stringify(parseTowerAiMlState(value), null, 2)}\n`
}
