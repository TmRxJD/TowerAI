export type TowerAiParsedGlobalStoreReadRequest = {
  store: string
  path?: string
}

export type TowerAiParsedGlobalStoreWriteRequest = {
  store: string
  path: string
  value: unknown
}

export type TowerAiParsedGlobalIdbReadRequest = {
  collection: string
  id: string
}

export type TowerAiParsedGlobalIdbWriteRequest = {
  collection: string
  id: string
  data: unknown
}

function tryParseTowerAiLooseValue(raw: string): unknown {
  const trimmed = String(raw || '').trim()
  if (!trimmed) return ''

  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (trimmed === 'null') return null

  const numberValue = Number(trimmed)
  if (Number.isFinite(numberValue) && /^-?\d+(?:\.\d+)?$/.test(trimmed)) {
    return numberValue
  }

  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return trimmed
    }
  }

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith('\'') && trimmed.endsWith('\''))) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

export function parseTowerAiGlobalStoreReadRequest(input: string): TowerAiParsedGlobalStoreReadRequest | null {
  const normalized = input.trim()
  const strictMatch = normalized.match(/^\s*(?:read|get)\s+store\s+([a-zA-Z0-9_-]+)(?:\s+path\s+([a-zA-Z0-9_.-]+))?\s*$/i)
  const conversationalMatch = normalized.match(/\b(?:read|get|show|check|view|lookup|look\s+up|what(?:'s|\s+is))\b[\s\S]{0,60}\bstore\s+([a-zA-Z0-9_-]+)(?:[\s\S]{0,24}\b(?:path|field|key)\s+([a-zA-Z0-9_.-]+))?/i)
  const match = strictMatch ?? conversationalMatch
  if (!match) return null
  return {
    store: match[1],
    path: match[2] || undefined,
  }
}

export function parseTowerAiGlobalStoreWriteRequest(input: string): TowerAiParsedGlobalStoreWriteRequest | null {
  const normalized = input.trim()
  const strictMatch = normalized.match(/^\s*(?:set|write|update)\s+store\s+([a-zA-Z0-9_-]+)\s+path\s+([a-zA-Z0-9_.-]+)\s+(?:to|=|value)\s+([\s\S]+)$/i)
  const conversationalWithPathMatch = normalized.match(/\b(?:set|write|update|change)\b[\s\S]{0,60}\bstore\s+([a-zA-Z0-9_-]+)[\s\S]{0,24}\b(?:path|field|key)\s+([a-zA-Z0-9_.-]+)[\s\S]{0,24}\b(?:to|as|=|value)\s+([\s\S]+)$/i)
  const conversationalSimpleMatch = normalized.match(/\b(?:set|write|update|change)\b[\s\S]{0,60}\bstore\s+([a-zA-Z0-9_-]+)\s+([a-zA-Z0-9_.-]+)\s+(?:to|as|=|value)\s+([\s\S]+)$/i)
  const match = strictMatch ?? conversationalWithPathMatch ?? conversationalSimpleMatch
  if (!match) return null
  return {
    store: match[1],
    path: match[2],
    value: tryParseTowerAiLooseValue(match[3]),
  }
}

export function parseTowerAiGlobalIdbReadRequest(input: string): TowerAiParsedGlobalIdbReadRequest | null {
  const normalized = input.trim()
  const strictMatch = normalized.match(/^\s*(?:idb\s+)?read\s+(?:idb\s+)?([a-zA-Z0-9_-]+)\s+([a-zA-Z0-9_.:-]+)\s*$/i)
  const conversationalMatch = normalized.match(/\b(?:read|get|show|check|find|lookup|look\s+up)\b[\s\S]{0,60}\b(?:idb|indexeddb|database)?\s*(?:collection\s+)?([a-zA-Z0-9_-]+)[\s\S]{0,24}\b(?:record|id)\s+([a-zA-Z0-9_.:-]+)\b/i)
  const match = strictMatch ?? conversationalMatch
  if (!match) return null
  return {
    collection: match[1],
    id: match[2],
  }
}

export function parseTowerAiGlobalIdbWriteRequest(input: string): TowerAiParsedGlobalIdbWriteRequest | null {
  const normalized = input.trim()
  const strictMatch = normalized.match(/^\s*(?:idb\s+)?write\s+(?:idb\s+)?([a-zA-Z0-9_-]+)\s+([a-zA-Z0-9_.:-]+)\s+(?:to|=|data)\s+([\s\S]+)$/i)
  const conversationalMatch = normalized.match(/\b(?:write|update|save|set)\b[\s\S]{0,60}\b(?:idb|indexeddb|database)?\s*(?:collection\s+)?([a-zA-Z0-9_-]+)[\s\S]{0,24}\b(?:record|id)\s+([a-zA-Z0-9_.:-]+)[\s\S]{0,24}\b(?:to|as|=|data|value)\s+([\s\S]+)$/i)
  const match = strictMatch ?? conversationalMatch
  if (!match) return null
  return {
    collection: match[1],
    id: match[2],
    data: tryParseTowerAiLooseValue(match[3]),
  }
}
