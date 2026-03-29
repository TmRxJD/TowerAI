import fs from 'node:fs/promises'
import path from 'node:path'
import { ZodError } from 'zod'
import { KBChunkArraySchema } from './canonicalKbSchema.js'

function defaultTokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+/%\s-]+/g, ' ')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(Boolean)
}

function uniqueStrings(values) {
  return Array.from(new Set(values.map(value => String(value || '').trim()).filter(Boolean)))
}

function normalizeDisambiguation(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function categoryFromSection(section) {
  return String(section || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') || 'knowledge'
}

function buildKeywordSet(record, tokenize) {
  return uniqueStrings([
    ...tokenize(record.section),
    ...tokenize(record.topic),
    ...tokenize(record.title),
    ...tokenize(record.content),
    ...(Array.isArray(record.mechanics) ? record.mechanics.flatMap(mechanic => tokenize(mechanic)) : []),
    ...tokenize(record.interaction_type),
    ...tokenize(record.interaction_summary),
    ...(Array.isArray(record.tags) ? record.tags.flatMap(tag => tokenize(tag)) : []),
  ])
}

export function formatKbValidationError(error, payload, sourceName = 'canonical KB') {
  if (!(error instanceof ZodError)) {
    return `${sourceName} validation failed: ${error instanceof Error ? error.message : String(error)}`
  }

  const parsedPayload = Array.isArray(payload) ? payload : []
  const lines = error.issues.map(issue => {
    const pathParts = issue.path.map(part => String(part))
    const chunkIndex = typeof issue.path[0] === 'number' ? Number(issue.path[0]) : null
    const fieldPath = pathParts.slice(chunkIndex === null ? 0 : 1).join('.') || 'root'
    const chunkId = chunkIndex !== null
      ? String(parsedPayload[chunkIndex]?.chunk_id || '').trim()
      : ''

    const location = chunkIndex === null
      ? `field ${fieldPath}`
      : `chunk ${chunkIndex + 1}${chunkId ? ` (${chunkId})` : ''} field ${fieldPath}`

    return `${location}: ${issue.message}`
  })

  return `${sourceName} validation failed\n${lines.join('\n')}`
}

export function validateCanonicalKbArray(payload, options = {}) {
  const sourceName = String(options.sourceName || 'canonical KB')
  const result = KBChunkArraySchema.safeParse(payload)
  if (!result.success) {
    throw new Error(formatKbValidationError(result.error, payload, sourceName))
  }

  return result.data.map(record => ({
    chunk_type: record.chunk_type,
    chunk_id: record.chunk_id,
    kb_version: record.kb_version,
    source: record.source,
    section: record.section,
    topic: record.topic,
    title: record.title,
    disambiguation: normalizeDisambiguation(record.disambiguation),
    data_source: Array.isArray(record.data_source)
      ? uniqueStrings(record.data_source)
      : typeof record.data_source === 'string' && record.data_source.trim()
        ? record.data_source.trim()
        : undefined,
    is_base_mechanic: Boolean(record.is_base_mechanic),
    content: String(record.content || '').trim(),
    mechanics: Array.isArray(record.mechanics) ? uniqueStrings(record.mechanics) : [],
    interaction_type: typeof record.interaction_type === 'string' ? record.interaction_type : undefined,
    interaction_summary: typeof record.interaction_summary === 'string' && record.interaction_summary.trim()
      ? record.interaction_summary.trim()
      : undefined,
    tags: Array.isArray(record.tags) ? uniqueStrings(record.tags) : undefined,
    notes: typeof record.notes === 'string' && record.notes.trim() ? record.notes.trim() : undefined,
    created_at: typeof record.created_at === 'string' ? record.created_at : undefined,
    updated_at: typeof record.updated_at === 'string' ? record.updated_at : undefined,
  }))
}

export function buildCanonicalKbVersion(records) {
  const canonicalVersion = String(records[0]?.kb_version || '').trim() || 'unknown'
  let hash = 0
  const source = JSON.stringify(records)
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0
  }
  return `trackerai-canonical-${canonicalVersion}-${records.length}-${Math.abs(hash)}`
}

export function loadCanonicalKbFromJson(payload, options = {}) {
  const normalizedPayload = typeof payload === 'string'
    ? JSON.parse(payload)
    : payload

  return validateCanonicalKbArray(normalizedPayload, options)
}

export async function loadCanonicalKbFromFile(filePath, options = {}) {
  const raw = await fs.readFile(filePath, 'utf8')
  return loadCanonicalKbFromJson(raw, {
    ...options,
    sourceName: options.sourceName || path.basename(filePath),
  })
}

export function toCanonicalRuntimeKnowledgeRecord(records, options = {}) {
  const tokenize = typeof options.tokenize === 'function' ? options.tokenize : defaultTokenize
  const sourceFile = String(options.sourceFile || 'trackerai-canonical-kb.json')
  const generatedAt = String(options.generatedAt || '').trim() || new Date().toISOString()

  const chunks = records.map((record, index) => {
    const category = categoryFromSection(record.section)
    const keywords = buildKeywordSet(record, tokenize)
    const interactionSummary = record.chunk_type === 'relational' && record.interaction_summary
      ? ` ${record.interaction_summary}`
      : ''
    const mechanicsText = Array.isArray(record.mechanics) && record.mechanics.length > 0
      ? ` Mechanics: ${record.mechanics.join(', ')}.`
      : ''
    const interactionTypeText = record.chunk_type === 'relational' && record.interaction_type
      ? ` Interaction type: ${record.interaction_type}.`
      : ''
    return {
      id: record.chunk_id,
      pageId: index + 1,
      title: record.title,
      category,
      text: record.content,
      aliases: uniqueStrings([
        ...(Array.isArray(record.tags) ? record.tags : []),
        ...(Array.isArray(record.mechanics) ? record.mechanics : []),
      ]),
      keywords,
      disambiguation: record.disambiguation,
      summary: `${record.content}${mechanicsText}${interactionTypeText}${interactionSummary}`.trim(),
      effects: [],
      statsSchema: [],
      sourceFile,
      chunkIndex: index,
      tokens: tokenize(`${record.title} ${record.section} ${record.topic} ${record.content} ${record.mechanics.join(' ')} ${record.interaction_type || ''} ${record.interaction_summary || ''}`),
      negativeDefinitions: [],
      sourceKind: 'reference',
      dataSource: record.data_source,
      isBaseMechanic: Boolean(record.is_base_mechanic),
    }
  })

  return {
    version: buildCanonicalKbVersion(records),
    source: 'trackerai-canonical',
    generatedAt,
    totalPages: chunks.length,
    totalChunks: chunks.length,
    entries: chunks.map((chunk, index) => ({
      id: chunk.id,
      pageId: chunk.pageId,
      type: chunk.category,
      name: chunk.title,
      summary: chunk.summary,
      effects: chunk.effects,
      statsSchema: chunk.statsSchema,
      aliases: chunk.aliases,
      keywords: chunk.keywords,
      disambiguation: chunk.disambiguation || chunk.summary,
      dataSource: chunk.dataSource,
      isBaseMechanic: chunk.isBaseMechanic,
      sourceChunkId: chunk.id,
      sourceTitle: chunk.title,
      sourceText: chunk.text,
      sourceFile: chunk.sourceFile,
      chunkIndex: index,
    })),
    chunks,
  }
}
