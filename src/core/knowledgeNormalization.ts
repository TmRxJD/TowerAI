import { z } from 'zod'

export type TowerAiKnowledgeStatSource = {
  type: 'array_reference'
  path: string
  fields: string[]
}

export type TowerAiKnowledgeUserValueSource = {
  type: 'idb_reference'
  collection: string
  recordId: string
  fields: string[]
}

export type TowerAiKnowledgeUnlock = {
  method: string
  requirement: string
}

export type TowerAiAtomicKnowledgeEntry = {
  id: string
  type: string
  name: string
  summary: string
  effects: string[]
  statsSchema: string[]
  statSource?: TowerAiKnowledgeStatSource
  userValueSource?: TowerAiKnowledgeUserValueSource
  unlock?: TowerAiKnowledgeUnlock
  aliases: string[]
  keywords: string[]
  disambiguation: string
  sourceChunkId: string
  sourceTitle: string
  sourceText: string
  pageId: number
  sourceFile?: string
  chunkIndex?: number
}

export type TowerAiKnowledgeSourceChunk = {
  id: string
  pageId: number
  title: string
  category: string
  text: string
  sourceFile?: string
  chunkIndex?: number
}

export type TowerAiKnowledgeNormalizationOptions = {
  statSourceByType?: Partial<Record<string, TowerAiKnowledgeStatSource>>
  userValueSourceByType?: Partial<Record<string, TowerAiKnowledgeUserValueSource>>
}

const towerAiKnowledgeStatSourceSchema = z.object({
  type: z.literal('array_reference'),
  path: z.string().trim().min(1),
  fields: z.array(z.string().trim().min(1)).min(1),
}).strict()

const towerAiKnowledgeUserValueSourceSchema = z.object({
  type: z.literal('idb_reference'),
  collection: z.string().trim().min(1),
  recordId: z.string().trim().min(1),
  fields: z.array(z.string().trim().min(1)).min(1),
}).strict()

const towerAiKnowledgeUnlockSchema = z.object({
  method: z.string().trim().min(1),
  requirement: z.string().trim().min(1),
}).strict()

const towerAiAtomicKnowledgeEntrySchema = z.object({
  id: z.string().trim().min(1),
  type: z.string().trim().min(1),
  name: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  effects: z.array(z.string().trim().min(1)),
  statsSchema: z.array(z.string().trim().min(1)),
  statSource: towerAiKnowledgeStatSourceSchema.optional(),
  userValueSource: towerAiKnowledgeUserValueSourceSchema.optional(),
  unlock: towerAiKnowledgeUnlockSchema.optional(),
  aliases: z.array(z.string().trim().min(1)),
  keywords: z.array(z.string().trim().min(1)),
  disambiguation: z.string().trim().min(1),
  sourceChunkId: z.string().trim().min(1),
  sourceTitle: z.string().trim().min(1),
  sourceText: z.string().trim().min(1),
  pageId: z.number().int(),
  sourceFile: z.string().trim().min(1).optional(),
  chunkIndex: z.number().int().optional(),
}).strict()

const KEYWORD_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have', 'if', 'in', 'into', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'their', 'then', 'there', 'these', 'this', 'to', 'use', 'with', 'you', 'your',
])

const STAT_TERMS = [
  'damage',
  'duration',
  'cooldown',
  'bonus',
  'range',
  'quantity',
  'chance',
  'size',
  'angle',
  'speed',
  'reduction',
  'multiplier',
  'health',
  'regen',
  'armor',
  'cells',
  'coins',
  'cash',
  'cost',
  'level',
]

const EFFECT_KEYWORDS = [
  'increase', 'decrease', 'reduce', 'bonus', 'multiplier', 'damage', 'stun', 'unlock', 'cost', 'cooldown', 'duration', 'spawn', 'boost', 'amplify',
]

function sentenceSplit(text: string): string[] {
  return String(text || '')
    .split(/(?<=[.!?])\s+|\n+/)
    .map(part => part.trim())
    .filter(Boolean)
}

function splitAtomicSegments(text: string): string[] {
  const normalized = String(text || '').trim()
  if (!normalized) return []

  const rowSegments = normalized
    .split(/\.\s+(?=[A-Z][A-Za-z0-9/+%()'\-\s]{1,70}:\s)/)
    .map(part => part.trim())
    .filter(Boolean)

  if (rowSegments.length > 1) {
    return rowSegments.map(segment => segment.endsWith('.') ? segment : `${segment}.`)
  }

  const sentenceSegments = sentenceSplit(normalized)
  if (sentenceSegments.length > 1) {
    return sentenceSegments.map(segment => segment.endsWith('.') ? segment : `${segment}.`)
  }

  return [normalized]
}

function formatType(rawCategory: string): string {
  return String(rawCategory || 'general')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatName(baseTitle: string, segmentText: string): string {
  const labelMatch = segmentText.match(/^([A-Z][A-Za-z0-9/+%()'\-\s]{1,70}):\s/)
  if (!labelMatch) return baseTitle
  const label = labelMatch[1].trim()
  if (baseTitle.toLowerCase().includes(label.toLowerCase())) return baseTitle
  return `${baseTitle} - ${label}`
}

function deriveSummary(segmentText: string): string {
  const sentences = sentenceSplit(segmentText)
  return sentences[0] || segmentText
}

function deriveEffects(segmentText: string): string[] {
  const sentences = sentenceSplit(segmentText)
  const matches = sentences
    .filter(sentence => EFFECT_KEYWORDS.some(keyword => sentence.toLowerCase().includes(keyword)))
    .slice(0, 4)
  if (matches.length > 0) return matches
  return sentences.slice(1, 3)
}

function deriveStatsSchema(text: string): string[] {
  const lowered = text.toLowerCase()
  return STAT_TERMS.filter(term => lowered.includes(term)).slice(0, 8)
}

function deriveUnlock(segmentText: string): TowerAiKnowledgeUnlock | undefined {
  const sentence = sentenceSplit(segmentText).find(line => /\bunlock|unlocked|purchase|cost\b/i.test(line))
  if (!sentence) return undefined

  const lowered = sentence.toLowerCase()
  let method = 'inferred_text'
  if (lowered.includes('event')) method = 'event_store'
  else if (lowered.includes('lab')) method = 'lab_unlock'
  else if (lowered.includes('tier') || lowered.includes('wave')) method = 'tier_wave'
  else if (lowered.includes('medal')) method = 'medals'
  else if (lowered.includes('stone')) method = 'stones'

  return {
    method,
    requirement: sentence,
  }
}

function isStatFocusedEntry(text: string, statsSchema: string[]): boolean {
  if (statsSchema.length > 0) return true
  return /\b(stat|stats|cost|costs|level|levels|upgrade|upgrades|damage|duration|cooldown|range|bonus|quantity|chance|value|values)\b/i.test(text)
}

function deriveStatSource(
  type: string,
  name: string,
  segmentText: string,
  statsSchema: string[],
  options?: TowerAiKnowledgeNormalizationOptions,
): TowerAiKnowledgeStatSource | undefined {
  const domainSource = options?.statSourceByType?.[type]
  if (!domainSource) return undefined

  const context = `${name} ${segmentText}`
  if (!isStatFocusedEntry(context, statsSchema)) return undefined

  return domainSource
}

function deriveUserValueSource(
  type: string,
  name: string,
  segmentText: string,
  options?: TowerAiKnowledgeNormalizationOptions,
): TowerAiKnowledgeUserValueSource | undefined {
  const domainSource = options?.userValueSourceByType?.[type]
  if (!domainSource) return undefined

  const context = `${name} ${segmentText}`.toLowerCase()
  if (!/\b(track|tracker|preset|equipped|level|target|progress|state|ui|setting|settings)\b/.test(context)) {
    return undefined
  }

  return domainSource
}

function deriveKeywords(name: string, segmentText: string): string[] {
  const lowered = `${name} ${segmentText}`.toLowerCase()
  const words = lowered
    .split(/[^a-z0-9+/%-]+/)
    .map(word => word.trim())
    .filter(word => word.length >= 3 && !KEYWORD_STOP_WORDS.has(word))

  return [...new Set(words)].slice(0, 16)
}

function toAtomicEntry(
  chunk: TowerAiKnowledgeSourceChunk,
  segmentText: string,
  segmentIndex: number,
  options?: TowerAiKnowledgeNormalizationOptions,
): TowerAiAtomicKnowledgeEntry {
  const type = formatType(chunk.category)
  const name = formatName(chunk.title, segmentText)
  const summary = deriveSummary(segmentText)
  const effects = deriveEffects(segmentText)
  const statsSchema = deriveStatsSchema(segmentText)

  return towerAiAtomicKnowledgeEntrySchema.parse({
    id: `${chunk.id}::${segmentIndex + 1}`,
    type,
    name,
    summary,
    effects,
    statsSchema,
    statSource: deriveStatSource(type, name, segmentText, statsSchema, options),
    userValueSource: deriveUserValueSource(type, name, segmentText, options),
    unlock: deriveUnlock(segmentText),
    aliases: [],
    keywords: deriveKeywords(name, segmentText),
    disambiguation: `This entry is about ${name}.`,
    sourceChunkId: chunk.id,
    sourceTitle: chunk.title,
    sourceText: segmentText,
    pageId: chunk.pageId,
    sourceFile: chunk.sourceFile,
    chunkIndex: chunk.chunkIndex,
  })
}

export function normalizeTowerAiChunksToAtomicEntries(
  chunks: TowerAiKnowledgeSourceChunk[],
  options?: TowerAiKnowledgeNormalizationOptions,
): TowerAiAtomicKnowledgeEntry[] {
  const entries: TowerAiAtomicKnowledgeEntry[] = []

  for (const chunk of chunks) {
    const segments = splitAtomicSegments(chunk.text)
    for (const [segmentIndex, segmentText] of segments.entries()) {
      entries.push(toAtomicEntry(chunk, segmentText, segmentIndex, options))
    }
  }

  return entries
}
