export type CanonicalKbRecord = {
  chunk_type: 'atomic' | 'relational'
  chunk_id: string
  kb_version: string
  source: string
  section: string
  topic: string
  title: string
  disambiguation: string
  data_source?: string | string[]
  is_base_mechanic?: boolean
  content: string
  mechanics: string[]
  interaction_type?: 'stacking' | 'additive' | 'multiplicative' | 'conditional' | 'scaling' | 'order_of_operations' | 'cross_system' | 'synergy' | 'conflict'
  interaction_summary?: string
  tags?: string[]
  notes?: string
  created_at?: string
  updated_at?: string
}

export type CanonicalRuntimeKnowledgeChunk = {
  id: string
  pageId: number
  title: string
  category: string
  text: string
  aliases: string[]
  keywords: string[]
  disambiguation: string
  summary: string
  effects: string[]
  statsSchema: string[]
  dataSource?: string | string[]
  isBaseMechanic?: boolean
  sourceFile: string
  chunkIndex: number
  tokens: string[]
  negativeDefinitions: string[]
  sourceKind: 'reference'
}

export type CanonicalRuntimeKnowledgeRecord = {
  version: string
  source: 'trackerai-canonical'
  generatedAt: string
  totalPages: number
  totalChunks: number
  entries: Array<{
    id: string
    pageId: number
    type: string
    name: string
    summary: string
    effects: string[]
    statsSchema: string[]
    aliases: string[]
    keywords: string[]
    disambiguation: string
    dataSource?: string | string[]
    isBaseMechanic?: boolean
    sourceChunkId: string
    sourceTitle: string
    sourceText: string
    sourceFile: string
    chunkIndex: number
  }>
  chunks: CanonicalRuntimeKnowledgeChunk[]
}

export function formatKbValidationError(error: unknown, payload: unknown, sourceName?: string): string
export function validateCanonicalKbArray(payload: unknown, options?: { sourceName?: string }): CanonicalKbRecord[]
export function buildCanonicalKbVersion(records: CanonicalKbRecord[]): string
export function loadCanonicalKbFromJson(payload: unknown, options?: { sourceName?: string }): CanonicalKbRecord[]
export function loadCanonicalKbFromFile(filePath: string, options?: { sourceName?: string }): Promise<CanonicalKbRecord[]>
export function toCanonicalRuntimeKnowledgeRecord(
  records: CanonicalKbRecord[],
  options?: { sourceFile?: string; generatedAt?: string; tokenize?: (value: string) => string[] },
): CanonicalRuntimeKnowledgeRecord
