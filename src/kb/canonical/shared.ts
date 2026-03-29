export type KBChunkRecord = {
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
}

export const TRACKERAI_CANONICAL_KB_VERSION = '2.0.0'

function normalizeWhitespace(value: string): string {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeAtomicMechanics(mechanics: string[], topic: string, title: string): string[] {
  const normalizedMechanics = mechanics
    .map(mechanic => normalizeWhitespace(mechanic))
    .filter(Boolean)

  if (normalizedMechanics.length > 0) {
    return [normalizedMechanics[0]]
  }

  const fallbackMechanic = normalizeWhitespace(topic) || normalizeWhitespace(title)
  return fallbackMechanic ? [fallbackMechanic] : ['Unknown Mechanic']
}

function normalizeAtomicDisambiguation(disambiguation: string, primaryMechanic: string): string {
  const normalizedDisambiguation = normalizeWhitespace(disambiguation)
  const canonicalSuffix = `This chunk is about the ${primaryMechanic} mechanic itself, not its interactions.`

  if (!normalizedDisambiguation) {
    return canonicalSuffix
  }

  if (/mechanic itself,? not its interactions/i.test(normalizedDisambiguation)) {
    return normalizedDisambiguation
  }

  return normalizeWhitespace(`${normalizedDisambiguation} ${canonicalSuffix}`)
}

function mergeAtomicNotes(notes: string | undefined, originalMechanics: string[], normalizedMechanics: string[]): string | undefined {
  const normalizedNote = normalizeWhitespace(notes ?? '')
  if (originalMechanics.length <= 1) {
    return normalizedNote || undefined
  }

  const normalizationNote = `Atomic normalization collapsed mechanics to primary mechanic ${normalizedMechanics[0]} from ${originalMechanics.join(' | ')}.`
  return normalizedNote
    ? normalizeWhitespace(`${normalizedNote} ${normalizationNote}`)
    : normalizationNote
}

export function buildKbContent(title: string, paragraphs: string[]): string {
  const normalizedParagraphs = paragraphs
    .map(paragraph => normalizeWhitespace(paragraph))
    .filter(Boolean)
  const body = normalizedParagraphs.join(' ')
  return normalizeWhitespace(`${title}. ${body}`)
}

export function buildAtomicKbChunk(record: Omit<KBChunkRecord, 'kb_version' | 'content' | 'chunk_type' | 'interaction_type' | 'interaction_summary'> & { paragraphs: string[] }): KBChunkRecord {
  const originalMechanics = record.mechanics
    .map(mechanic => normalizeWhitespace(mechanic))
    .filter(Boolean)
  const mechanics = normalizeAtomicMechanics(record.mechanics, record.topic, record.title)
  const primaryMechanic = mechanics[0]

  return {
    chunk_type: 'atomic',
    chunk_id: record.chunk_id,
    kb_version: TRACKERAI_CANONICAL_KB_VERSION,
    source: record.source,
    section: record.section,
    topic: record.topic,
    title: record.title,
    disambiguation: normalizeAtomicDisambiguation(record.disambiguation, primaryMechanic),
    data_source: record.data_source,
    is_base_mechanic: record.is_base_mechanic ?? false,
    content: buildKbContent(record.title, record.paragraphs),
    mechanics,
    tags: record.tags,
    notes: mergeAtomicNotes(record.notes, originalMechanics, mechanics),
  }
}

export function buildRelationalKbChunk(record: Omit<KBChunkRecord, 'kb_version' | 'content' | 'chunk_type'> & { paragraphs: string[]; interaction_type: NonNullable<KBChunkRecord['interaction_type']>; interaction_summary: string }): KBChunkRecord {
  return {
    chunk_type: 'relational',
    chunk_id: record.chunk_id,
    kb_version: TRACKERAI_CANONICAL_KB_VERSION,
    source: record.source,
    section: record.section,
    topic: record.topic,
    title: record.title,
    disambiguation: normalizeWhitespace(record.disambiguation),
    data_source: record.data_source,
    is_base_mechanic: record.is_base_mechanic ?? false,
    content: buildKbContent(record.title, record.paragraphs),
    mechanics: record.mechanics,
    interaction_type: record.interaction_type,
    interaction_summary: normalizeWhitespace(record.interaction_summary),
    tags: record.tags,
    notes: record.notes,
  }
}
