import { z } from 'zod'

const boundedString = (min, max) => z.string().trim().min(min).max(max)
const isoDateTimeSchema = z.string().datetime({ offset: true })
const chunkIdPattern = /^[a-z0-9_]+$/
const formattingNoisePattern = /<[^>]+>|```|\|\s*[-:]{3,}\s*\||^\s*[-*+]\s+/m
const interactionTypeSchema = z.enum([
  'stacking',
  'additive',
  'multiplicative',
  'conditional',
  'scaling',
  'order_of_operations',
  'cross_system',
  'synergy',
  'conflict',
])

function normalizeWhitespace(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function estimateTokenCount(value) {
  const normalized = normalizeWhitespace(value)
  if (!normalized) return 0
  return normalized.split(/\s+/).filter(Boolean).length
}

const BaseChunkFields = {
  chunk_id: z
    .string()
    .trim()
    .regex(chunkIdPattern, 'chunk_id must be lowercase snake_case')
    .min(3)
    .describe('Stable unique ID: {topic}_{subtopic}_{index}'),
  kb_version: boundedString(1, 120)
    .describe("Canonical KB version string, e.g. '1.0.0'"),
  source: boundedString(1, 240)
    .describe("Origin of the text, e.g. 'Ultimate Weapons Wiki'"),
  section: boundedString(1, 240)
    .describe("High-level category, e.g. 'Ultimate Weapons'"),
  topic: boundedString(1, 240)
    .describe("Specific mechanic or concept, e.g. 'Chain Lightning'"),
  title: boundedString(1, 240)
    .describe('Human-readable title for the chunk'),
  disambiguation: boundedString(1, 1200)
    .describe('Clarifies what this chunk IS and IS NOT about'),
  data_source: z
    .union([boundedString(1, 400), z.array(boundedString(1, 400)).min(1)])
    .optional()
    .describe('Exact site data path or paths derived from factual sources'),
  is_base_mechanic: z
    .boolean()
    .default(false)
    .describe('True only when the chunk points at a base mechanic domain root'),
  tags: z
    .array(boundedString(1, 80))
    .max(24)
    .optional()
    .describe('Optional keywords for filtering or retrieval'),
  notes: boundedString(1, 2000)
    .optional()
    .describe('Optional internal notes, not embedded'),
  content: z
    .string()
    .trim()
    .min(50, 'Chunk content must be meaningful')
    .max(5000, 'Chunk content must not exceed 5000 characters')
    .describe('Clean, normalized semantic text for embedding'),
  created_at: isoDateTimeSchema
    .optional()
    .describe('Optional timestamp for auditing'),
  updated_at: isoDateTimeSchema
    .optional()
    .describe('Optional timestamp for auditing'),
}

export const AtomicChunkSchema = z.object({
  chunk_type: z.literal('atomic'),
  ...BaseChunkFields,
  mechanics: z
    .array(boundedString(1, 240))
    .min(1)
    .max(1)
    .describe('Exactly one mechanic name. Atomic chunks describe a single mechanic.'),
}).strict().superRefine((value, ctx) => {
  const normalizedContent = normalizeWhitespace(value.content)
  const normalizedTitle = normalizeWhitespace(value.title)
  const normalizedDisambiguation = normalizeWhitespace(value.disambiguation)

  if (formattingNoisePattern.test(value.content)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['content'],
      message: 'content must not include markup, code fences, table syntax, or list formatting noise',
    })
  }

  if (!normalizedContent.startsWith(normalizedTitle)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['content'],
      message: 'content must begin with the human-readable title so the chunk is self-contained in isolation',
    })
  }

  if (!/\bis\b/i.test(normalizedDisambiguation) || !/\bnot\b/i.test(normalizedDisambiguation)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['disambiguation'],
      message: 'disambiguation must explicitly state what the chunk is and is not about',
    })
  }

  if (/\bsee (above|below|earlier|later)\b/i.test(normalizedContent)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['content'],
      message: 'content must be self-contained and must not reference other chunks',
    })
  }

  const tokenEstimate = estimateTokenCount(normalizedContent)
  if (tokenEstimate < 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['content'],
      message: 'content is too short to be a meaningful semantic chunk',
    })
  }

  if (!/mechanic itself,? not its interactions/i.test(normalizedDisambiguation)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['disambiguation'],
      message: 'atomic chunk disambiguation must state that it describes the mechanic itself, not its interactions',
    })
  }
})

export const RelationalChunkSchema = z.object({
  chunk_type: z.literal('relational'),
  ...BaseChunkFields,
  mechanics: z
    .array(boundedString(1, 240))
    .min(2)
    .describe('List of mechanics involved in the interaction. Must be at least two.'),
  interaction_type: interactionTypeSchema.describe('The nature of the interaction between mechanics.'),
  interaction_summary: boundedString(10, 1000).describe('Short summary of how the mechanics interact.'),
}).strict().superRefine((value, ctx) => {
  const normalizedContent = normalizeWhitespace(value.content)
  const normalizedTitle = normalizeWhitespace(value.title)
  const normalizedDisambiguation = normalizeWhitespace(value.disambiguation)

  if (formattingNoisePattern.test(value.content)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['content'],
      message: 'content must not include markup, code fences, table syntax, or list formatting noise',
    })
  }

  if (!normalizedContent.startsWith(normalizedTitle)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['content'],
      message: 'content must begin with the human-readable title so the chunk is self-contained in isolation',
    })
  }

  if (!/\bis\b/i.test(normalizedDisambiguation) || !/\bnot\b/i.test(normalizedDisambiguation)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['disambiguation'],
      message: 'disambiguation must explicitly state what the chunk is and is not about',
    })
  }

  if (/\bsee (above|below|earlier|later)\b/i.test(normalizedContent)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['content'],
      message: 'content must be self-contained and must not reference other chunks',
    })
  }

  const tokenEstimate = estimateTokenCount(normalizedContent)
  if (tokenEstimate < 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['content'],
      message: 'content is too short to be a meaningful semantic chunk',
    })
  }

  if (!/interaction between/i.test(normalizedDisambiguation)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['disambiguation'],
      message: 'relational chunk disambiguation must state that it describes the interaction between mechanics, not the individual mechanics',
    })
  }

  for (const mechanic of value.mechanics) {
    if (!normalizedContent.toLowerCase().includes(mechanic.toLowerCase())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: `relational content must clearly identify mechanic \"${mechanic}\"`,
      })
    }
  }
})

export const KBChunkSchema = z.discriminatedUnion('chunk_type', [
  AtomicChunkSchema,
  RelationalChunkSchema,
])

export const KBChunkArraySchema = z.array(KBChunkSchema).min(1).superRefine((chunks, ctx) => {
  const seenChunkIds = new Map()
  const seenTitles = new Map()
  const kbVersions = new Set()

  chunks.forEach((chunk, index) => {
    kbVersions.add(chunk.kb_version)

    const normalizedChunkId = chunk.chunk_id.toLowerCase()
    if (seenChunkIds.has(normalizedChunkId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [index, 'chunk_id'],
        message: `Duplicate chunk_id. First defined at chunk ${seenChunkIds.get(normalizedChunkId) + 1}.`,
      })
    } else {
      seenChunkIds.set(normalizedChunkId, index)
    }

    const titleKey = `${chunk.section.toLowerCase()}::${chunk.topic.toLowerCase()}::${chunk.title.toLowerCase()}`
    if (seenTitles.has(titleKey)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [index, 'title'],
        message: `Duplicate section/topic/title combination. First defined at chunk ${seenTitles.get(titleKey) + 1}.`,
      })
    } else {
      seenTitles.set(titleKey, index)
    }
  })

  if (kbVersions.size > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [],
      message: 'All chunks must share the same kb_version.',
    })
  }
})

export const KBIndexArtifactSchema = z.object({
  kb_version: boundedString(1, 120),
  chunks: z.array(KBChunkSchema).min(1).describe('All validated KB chunks'),
  vectors: boundedString(1, 1200).describe('Path or reference to vectors.bin'),
  metadata: boundedString(1, 1200).describe('Path or reference to metadata.json'),
  index: boundedString(1, 1200).describe('Path or reference to FAISS/HNSW index file'),
  created_at: isoDateTimeSchema,
}).strict()

export function estimateKbChunkTokenCount(value) {
  return estimateTokenCount(value)
}

export function normalizeKbText(value) {
  return normalizeWhitespace(value)
}
