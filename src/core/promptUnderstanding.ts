export type TowerAiPromptIntentTag =
  | 'action-intent'
  | 'capability-tools'
  | 'capability-page'
  | 'capability-io'
  | 'context-note'
  | 'context-summary'
  | 'context-clear'
  | 'context-clear-all'

export type TowerAiPromptVariantCase = {
  prompt: string
  expects: TowerAiPromptIntentTag[]
}

const ACTION_VERBS = [
  'navigate', 'open', 'go to', 'set', 'update', 'change', 'toggle', 'turn on', 'turn off',
  'enable', 'disable', 'reset',
  'click', 'select', 'fill', 'enter', 'read', 'get', 'show', 'add', 'create', 'delete',
  'remove', 'clear', 'write', 'save', 'load', 'sync', 'calculate', 'compare', 'run',
  'take me to', 'bring me to',
  'head to', 'jump to', 'check', 'look up', 'find',
]

const ACTION_NOUNS = [
  'store', 'idb', 'indexeddb', 'tracker', 'calculator', 'settings', 'page', 'route',
  'record', 'tab', 'button', 'input', 'selector', 'leaderboard', 'rank', 'graph',
  'mechanic', 'lab', 'uptime', 'copies', 'module', 'card', 'report', 'database', 'calc',
]

const TOOL_CAPABILITY_PATTERNS = [
  /\bwhat\s+tools\s+do\s+i\s+have\b/i,
  /\bwhat\s+can\s+you\s+do\b/i,
  /\bwhat\s+can\s+tracker\s*ai\s+control\b/i,
  /\bwhat\s+can\s+.*\s+control\s+for\s+me\b/i,
  /\bavailable\s+tools\b/i,
  /\btoolset\b/i,
  /\bcapabilities\b/i,
  /\bactions\s+can\s+you\s+take\b/i,
  /\bactions\s+you\s+can\s+take\b/i,
]

const PAGE_CAPABILITY_PATTERNS = [
  /\bwhat\s+can\s+i\s+do\s+on\s+this\s+page\b/i,
  /\bwhat\s+can\s+you\s+do\s+on\s+this\s+page\b/i,
  /\bavailable\s+on\s+this\s+page\b/i,
  /\bwhat\s+controls?\s+can\s+you\s+use\s+on\s+this\s+(?:page|screen)\b/i,
  /\bwhat\s+can\s+you\s+read\s+or\s+change\s+here\b/i,
  /\binspect\s+everything\s+clickable\s+on\s+this\s+page\b/i,
  /\bwhere\s+do\s+i\s+find\b/i,
  /\bwhere\s+is\b/i,
  /\bwhere\s+[a-z0-9+\-/%\s]{1,24}\s+calc\s+page\b/i,
  /\b(?:all|every)\s+pages?\b/i,
  /\bsite[-\s]?wide\s+(?:page\s+)?capabilit(?:y|ies)\b/i,
  /\bevery\s+(?:element|control)\s+of\s+every\s+page\b/i,
]

const IO_CAPABILITY_PATTERNS = [
  /\binputs?\s+and\s+outputs?\b/i,
  /\bhow\s+do\s+i\s+use\b[\s\S]{0,24}\b(?:this|the)?\s*(?:page|tool|tracker|calculator)\b/i,
  /\bhow\s+do\s+i\s+use\b[\s\S]{0,24}\b(?:this|the)?\s*(?:feature|mechanic)\b/i,
  /\bhow\s+to\s+use\b[\s\S]{0,24}\b(?:this|the)?\s*(?:page|tool|tracker|calculator)\b/i,
  /\bhow\s+to\s+use\b[\s\S]{0,24}\b(?:this|the)?\s*(?:feature|mechanic)\b/i,
  /\binputs?\b[\s\S]{0,32}\boutputs?\b/i,
  /\bwhat\s+are\s+the\s+inputs?\b[\s\S]{0,24}\b(?:for|of)?\s*(?:this|the)?\s*(?:page|tool|tracker|calculator)\b/i,
  /\bwhat\s+are\s+the\s+outputs?\b[\s\S]{0,24}\b(?:for|of)?\s*(?:this|the)?\s*(?:page|tool|tracker|calculator)\b/i,
  /\bwhat\s+do\s+i\s+type\s+in\s+and\s+what\s+result\s+do\s+i\s+get\b/i,
  /\bwhat\s+does\s+this\s+(?:feature|mechanic)\s+do\b/i,
  /\bhow\s+does\s+[a-z0-9+\-/%\s]{1,32}\s+interact\s+with\s+[a-z0-9+\-/%\s]{1,32}\b/i,
  /\bhow\s+do\s+i\s+unlock\s+this\s+(?:feature|mechanic)\b/i,
  /\bexplain\s+this\s+tool\s+flow\b/i,
  /\bgive\s+me\s+the\s+link\s+to\b/i,
  /\btool\s+flow\b[\s\S]{0,16}\bstep\s+by\s+step\b/i,
  /\bhow\s+many\s+records\s+do\s+i\s+have\b/i,
  /\bhow\s+many\s+days\s+until\b/i,
  /\b(?:uw|labs?|bh|gb|gt|workshop|bots?)\s+calc\b[\s\S]{0,48}\bcost\b/i,
  /\b(?:uw|labs?|bh|gb|gt|workshop|bots?)\s+calc\b[\s\S]{0,56}\blvl\b[\s\S]{0,24}\b(?:to|->)\b[\s\S]{0,16}\btime\b/i,
  /\b(?:uw|labs?|bh|gb|gt|medals?|stones?|cooldown|cd)\b[\s\S]{0,40}\bcost\b/i,
  /\b(?:uw|labs?|bh|gb|gt|workshop|bots?)\b[\s\S]{0,32}\b(?:stones?|medals?)\b[\s\S]{0,20}\bto\s+max\b/i,
  /\bhow\s+to\s+interpret\b/i,
  /\bwhat\s+is\s+the\s+difference\s+between\b[\s\S]{0,64}\b(?:and|vs\.?|versus)\b/i,
  /\bwhat\s+is\s+my\s+rank\b/i,
  /\bcan\s+you\s+tell\s+me\s+my\s+rank\b/i,
  /\bwhat\s+is\s+my\s+current\s+progress\b/i,
  /^\s*define\s+[a-z0-9+\-/%\s]{2,40}\??\s*$/i,
  /^\s*what\s+is\s+(?!my\b|the\b|this\b|that\b|tracker\s+settings\b)[a-z0-9+\-/%\s]{2,40}\??\s*$/i,
  /^\s*what\s+are\s+(?!tracker\s+settings\b)[a-z0-9+\-/%\s]{2,40}\??\s*$/i,
  /\bhow\s+do\s+[a-z0-9+\-/%\s]{2,40}\bcosts?\s+work\b/i,
  /\bmy\s+current\s+module\s+progress\b/i,
  /\bhow\s+far\s+am\s+i\s+from\b/i,
  /\benough\s+data\b[\s\S]{0,16}\bcomparison\b/i,
  /\bwhich\s+upgrade\s+is\s+better\b/i,
  /\bis\s+this\s+path\s+worth\s+it\b/i,
  /\bcompare\b[\s\S]{0,20}\bupgrade\s+choices?\b/i,
  /\bwhat\s+about\s+[a-z0-9+\-/%\s]{1,24}\s+then\b/i,
  /^\s*and\s+for\s+[a-z0-9+\-/%\s]{1,24}\??\s*$/i,
  /\bsame\s+question\s+but\s+for\b/i,
  /\bcontinue\s+from\s+last\s+answer\b/i,
  /\buse\s+my\s+previous\s+setup\b/i,
  /\bbased\s+on\s+what\s+i\s+said\s+earlier\b/i,
]

const CONTEXT_SUMMARY_PATTERNS = [
  /\b(?:summar(?:ize|ise)|status|context)\b[\s\S]{0,24}\b(?:memory|notes|cache|context)\b/i,
  /\bwhat\s+do\s+you\s+know\s+about\s+me\b/i,
  /\bwhat\s+do\s+you\s+know\s+about\s+my\b/i,
  /\bshow\s+my\s+(?:saved\s+)?(?:notes|goals|setup|memory|context)\b/i,
  /\bmy\s+(?:saved\s+)?(?:notes|goals|setup|memory|context)\b/i,
]

const CONTEXT_CLEAR_PATTERNS = [
  /\b(?:clear|forget|remove|reset)\b[\s\S]{0,24}\b(?:notes|memory|goals|setup)\b/i,
]

const CONTEXT_CLEAR_ALL_PATTERNS = [
  /\b(?:clear|reset|wipe)\b[\s\S]{0,24}\b(?:all\s+)?(?:ai\s+)?(?:context|cache|history|memory)\b/i,
]

const CONTEXT_NOTE_SENTENCE_PATTERNS = [
  /\bmy\s+(?:goal|setup|build|plan|target|priority|focus|device|platform)\b/i,
  /\bi\s+(?:want|need|prefer|use|run|play|am|have|usually|mainly)\b/i,
]

export const TOWER_AI_PROMPT_VARIANT_MATRIX: TowerAiPromptVariantCase[] = [
  { prompt: 'what tools do i have available?', expects: ['capability-tools'] },
  { prompt: 'what can you do for me here?', expects: ['capability-tools'] },
  { prompt: 'where do i find cloud sync on this page?', expects: ['capability-page'] },
  { prompt: 'what can i do on this page', expects: ['capability-page'] },
  { prompt: 'what can you do across all pages?', expects: ['capability-page'] },
  { prompt: 'what are the inputs and outputs of this calculator?', expects: ['capability-io'] },
  { prompt: 'how do i use this tracker?', expects: ['capability-io'] },
  { prompt: 'please navigate to modules tracker and update rarity', expects: ['action-intent'] },
  { prompt: 'could you read idb runs record abc123', expects: ['action-intent'] },
  { prompt: 'remember my goal is to maximize lab uptime this month', expects: ['context-note'] },
  { prompt: 'i usually run devo and prefer short cooldown builds', expects: ['context-note'] },
  { prompt: 'show my saved notes', expects: ['context-summary'] },
  { prompt: 'clear my setup notes', expects: ['context-clear'] },
  { prompt: 'wipe all ai context', expects: ['context-clear-all'] },
]

export function normalizeTowerAiPromptForUnderstanding(input: string): string {
  return String(input || '')
    .replace(/^(?:hey|hi|hello)\s+tracker\s*ai[:,\-\s]*/i, '')
    .replace(/^(?:can|could|would)\s+you\s+help\s+with\s+this\s*:\s*/i, '')
    .replace(/^(?:please|pls)\s+/i, '')
    .replace(/\bur\b/gi, 'your')
    .replace(/\bu\b/gi, 'you')
    .replace(/\br\b/gi, 'are')
    .replace(/\bplz\b/gi, 'please')
    .replace(/\s+/g, ' ')
    .replace(/[!?]+$/g, '')
    .trim()
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function containsTerm(input: string, term: string): boolean {
  const normalizedTerm = String(term || '').trim().toLowerCase()
  if (!normalizedTerm) return false

  const pattern = normalizedTerm
    .split(/\s+/)
    .map(part => escapeRegex(part))
    .join('\\s+')

  return new RegExp(`\\b${pattern}\\b`, 'i').test(input)
}

export function hasTowerAiActionIntent(input: string): boolean {
  const normalized = normalizeTowerAiPromptForUnderstanding(input).toLowerCase()
  if (!normalized) return false

  const dePrefixed = normalized
    .replace(/^(?:[a-z0-9][a-z0-9_-]{1,40}\s*:\s*)+/i, '')
    .replace(/^(?:can|could|would)\s+you\s+help\s+with\s+this\s*:\s*/i, '')
    .trim()
  const actionable = dePrefixed || normalized

  const verbMatch = ACTION_VERBS.some(term => containsTerm(actionable, term))
  const nounMatch = ACTION_NOUNS.some(term => containsTerm(actionable, term))

  const imperativeStart = /^(?:please\s+)?(?:navigate|open|go\s+to|set|update|change|toggle|turn\s+on|turn\s+off|turn|enable|disable|reset|click|select|fill|enter|read|get|show|add|create|delete|remove|clear|write|save|load|sync|calculate|compare|run|take\s+me\s+to|bring\s+me\s+to|head\s+to|jump\s+to)\b/.test(actionable)
  const politeRequest = /\b(?:can|could|would)\s+you\s+(?:please\s+)?(?:navigate|open|go\s+to|set|update|change|toggle|turn\s+on|turn\s+off|turn|enable|disable|reset|click|select|fill|enter|read|get|show|add|create|delete|remove|clear|write|save|load|sync|calculate|compare|run|take\s+me\s+to|bring\s+me\s+to|head\s+to|jump\s+to)\b/.test(actionable)
  const hasExplicitCommandPattern = imperativeStart || politeRequest

  if (hasExplicitCommandPattern) return true
  if (verbMatch && nounMatch) return true

  const hasStoreTarget = /\b(?:idb|indexeddb|pinia|store|collection|record|selector|route)\b/.test(actionable)
  if (verbMatch && hasStoreTarget) return true

  return false
}

export function matchesTowerAiPatternGroup(input: string, patterns: RegExp[]): boolean {
  return patterns.some(pattern => pattern.test(input))
}

export function extractTowerAiPotentialContextNotes(input: string): string[] {
  const normalized = normalizeTowerAiPromptForUnderstanding(input)
  if (!normalized) return []

  const directRemember = normalized.match(/^\s*(?:remember|note|save)\s+(?:that\s+)?(.+)$/i)
  if (directRemember?.[1]) {
    const note = directRemember[1].trim()
    return note ? [note] : []
  }

  const candidates = normalized
    .split(/[.!?\n]+/)
    .map(part => part.trim())
    .map(part => part.replace(/^(?:can|could|would)\s+you\s+help\s+with\s+this\s*:\s*/i, '').trim())
    .filter(Boolean)

  return candidates
    .filter(candidate => !/^(what|how|why|when|where|which|who)\b/i.test(candidate))
    .filter(candidate => !/^(do|does|did|can|could|would|should|is|are|am|have|has|will)\b/i.test(candidate))
    .filter(candidate => !/\b(what|how|why|when|where|which|who)\b/i.test(candidate))
    .filter(candidate => CONTEXT_NOTE_SENTENCE_PATTERNS.some(pattern => pattern.test(candidate)))
    .filter(candidate => candidate.length >= 8 && candidate.length <= 220)
    .slice(0, 3)
}

export function detectTowerAiPromptIntentTags(input: string): TowerAiPromptIntentTag[] {
  const normalized = normalizeTowerAiPromptForUnderstanding(input)
  if (!normalized) return []

  const tags: TowerAiPromptIntentTag[] = []

  if (hasTowerAiActionIntent(normalized)) tags.push('action-intent')
  if (matchesTowerAiPatternGroup(normalized, TOOL_CAPABILITY_PATTERNS)) tags.push('capability-tools')
  if (matchesTowerAiPatternGroup(normalized, PAGE_CAPABILITY_PATTERNS)) tags.push('capability-page')
  if (matchesTowerAiPatternGroup(normalized, IO_CAPABILITY_PATTERNS)) tags.push('capability-io')
  if (extractTowerAiPotentialContextNotes(normalized).length > 0) tags.push('context-note')
  if (matchesTowerAiPatternGroup(normalized, CONTEXT_SUMMARY_PATTERNS)) tags.push('context-summary')
  if (matchesTowerAiPatternGroup(normalized, CONTEXT_CLEAR_PATTERNS)) tags.push('context-clear')
  if (matchesTowerAiPatternGroup(normalized, CONTEXT_CLEAR_ALL_PATTERNS)) tags.push('context-clear-all')

  return Array.from(new Set(tags))
}
