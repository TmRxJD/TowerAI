import { detectTowerAiPromptIntentTags, normalizeTowerAiPromptForUnderstanding } from './promptUnderstanding'

export type TowerAiConversationIntent = 'new_topic' | 'follow_up' | 'correction' | 'meta_request' | 'ambiguous'

export type TowerAiConversationIntentResult = {
  intent: TowerAiConversationIntent
  confidence: number
  reason: string
}

export type TowerAiClassifyConversationIntentOptions = {
  prompt: string
  recentConversationContext?: string[]
  hasPendingConfirmation?: boolean
}

const META_REQUEST_PATTERNS = [
  /\b(?:who|what)\s+are\s+you\b/i,
  /\bwhat\s+model\b/i,
  /\bhow\s+do\s+you\s+work\b/i,
  /\bhow\s+are\s+you\b/i,
  /\babout\s+tracker\s*ai\b/i,
  /\byour\s+(?:memory|context|limitations|capabilities)\b/i,
]

const FOLLOW_UP_PATTERNS = [
  /^(?:and|also|then|so|okay|ok|cool|btw|next)\b/i,
  /\b(?:what\s+about|how\s+about|continue|same\s+thing|again)\b/i,
  /\b(?:it|that|this|those|these|them|same|previous|earlier|last\s+(?:answer|response|step|turn))\b/i,
]

const CORRECTION_PATTERNS = [
  /\b(?:no|nope|nah)[,\s]+/i,
  /\b(?:that(?:'s| is)?\s+wrong|incorrect|not\s+what\s+i\s+asked)\b/i,
  /\b(?:i\s+meant|meant\s+to\s+say|instead|rather\s+than|not\s+\w+)\b/i,
  /\b(?:correct(?:ion)?|fix\s+that|revise\s+that)\b/i,
]

const AMBIGUOUS_SHORT_PATTERNS = [
  /^do\s+it[.!]?$/i,
  /^help[.!]?$/i,
  /^what\??$/i,
  /^huh\??$/i,
  /^maybe\??$/i,
  /^idk\??$/i,
  /^that\??$/i,
  /^this\??$/i,
  /^explain\??$/i,
]

const TOPIC_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how', 'i', 'if', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'so', 'that', 'the', 'this', 'to', 'we', 'what', 'when', 'where', 'which', 'who', 'why', 'you', 'your',
])

const DOMAIN_TERM_FAMILIES: Record<string, RegExp[]> = {
  uw: [/\buw\b/i, /\bultimate\s+weapon/i, /\bgolden\s+tower\b/i, /\bblack\s+hole\b/i, /\bspotlight\b/i],
  labs: [/\blabs?\b/i, /\blab\s+speed\b/i, /\bresearch\b/i],
  modules: [/\bmodules?\b/i, /\bshards?\b/i, /\breroll\b/i],
  bots: [/\bbots?\b/i, /\bgolden\s+bot\b/i],
  cards: [/\bcards?\b/i],
  workshop: [/\bworkshop\b/i],
  vault: [/\bvault\b/i],
  relics: [/\brelics?\b/i],
  site: [/\bpage\b/i, /\broute\b/i, /\btracker\b/i, /\bcalculator\b/i, /\bnavigate\b/i, /\bopen\b/i],
}

function hasRecentContext(context: string[]): boolean {
  return context.some(line => String(line || '').trim().length > 0)
}

function tokenizeTopicTerms(value: string): string[] {
  const raw = String(value || '').toLowerCase().match(/[a-z0-9+#/%-]{2,24}/g) || []
  return raw
    .map(token => token.trim())
    .filter(token => token.length >= 3 && !TOPIC_STOP_WORDS.has(token))
}

function detectDomainFamilies(value: string): Set<string> {
  const out = new Set<string>()
  const normalized = String(value || '')
  if (!normalized.trim()) return out

  for (const [family, patterns] of Object.entries(DOMAIN_TERM_FAMILIES)) {
    if (patterns.some(pattern => pattern.test(normalized))) {
      out.add(family)
    }
  }

  return out
}

function hasStrongTopicalShift(normalizedPrompt: string, recentConversationContext: string[]): boolean {
  const promptDomains = detectDomainFamilies(normalizedPrompt)
  const contextDomains = detectDomainFamilies(recentConversationContext.join(' '))
  if (promptDomains.size > 0 && contextDomains.size > 0) {
    const domainOverlap = [...promptDomains].filter(domain => contextDomains.has(domain)).length
    if (domainOverlap === 0) {
      return true
    }
  }

  const promptTerms = new Set(tokenizeTopicTerms(normalizedPrompt))
  if (promptTerms.size === 0) return false
  if (promptTerms.size <= 3) return false

  const contextTerms = new Set(tokenizeTopicTerms(recentConversationContext.join(' ')))
  if (contextTerms.size === 0) return false

  const overlapCount = [...promptTerms].filter(term => contextTerms.has(term)).length
  const overlapRatio = overlapCount / Math.max(1, promptTerms.size)

  const hasDomainCue = /\b(?:uw|gt|bh|labs?|cards?|modules?|workshop|vault|relic|bot|tracker|calculator|page|route)\b/i.test(normalizedPrompt)
  if (hasDomainCue && overlapRatio < 0.2) return true

  return promptTerms.size >= 5 && overlapRatio < 0.15
}

function isMetaRequest(normalized: string): boolean {
  return META_REQUEST_PATTERNS.some(pattern => pattern.test(normalized))
}

function isCorrection(normalized: string): boolean {
  return CORRECTION_PATTERNS.some(pattern => pattern.test(normalized))
}

function isFollowUp(normalized: string, hasContext: boolean): boolean {
  if (!hasContext) return false
  if (FOLLOW_UP_PATTERNS.some(pattern => pattern.test(normalized))) return true

  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length <= 4 && /\b(this|that|it|those|these|same|again|continue|next|then)\b/i.test(normalized)) {
    return true
  }

  return false
}

function isAmbiguous(normalized: string, hasContext: boolean): boolean {
  if (!normalized) return true

  if (hasContext && isFollowUp(normalized, hasContext)) {
    return false
  }

  if (/^[a-z0-9+#%._-]{2,12}\s+is\??$/i.test(normalized)) {
    return false
  }

  if (AMBIGUOUS_SHORT_PATTERNS.some(pattern => pattern.test(normalized))) {
    return true
  }

  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length <= 2) {
    const intentTags = detectTowerAiPromptIntentTags(normalized)
    const hasSignals = intentTags.length > 0
    const looksSpecific = /\b(?:uw|gt|bh|gb|labs?|cards?|modules?|workshop|vault|tracker|calculator|route|page|cost|level|upgrade)\b/i.test(normalized)
    if (!hasSignals && !looksSpecific && !hasContext) {
      return true
    }
  }

  return false
}

export function classifyTowerAiConversationIntent(options: TowerAiClassifyConversationIntentOptions): TowerAiConversationIntentResult {
  const normalized = normalizeTowerAiPromptForUnderstanding(options.prompt)
  const recentConversation = Array.isArray(options.recentConversationContext)
    ? options.recentConversationContext
    : []
  const hasContext = hasRecentContext(recentConversation)
  const topicalShift = hasContext ? hasStrongTopicalShift(normalized, recentConversation) : false

  if (isMetaRequest(normalized)) {
    return {
      intent: 'meta_request',
      confidence: 0.94,
      reason: 'Prompt asks about TrackerAI itself.',
    }
  }

  if (isCorrection(normalized) && hasContext) {
    return {
      intent: 'correction',
      confidence: 0.88,
      reason: 'Prompt includes correction signals tied to prior context.',
    }
  }

  if (topicalShift) {
    return {
      intent: 'new_topic',
      confidence: 0.9,
      reason: 'Prompt introduces a distinct topic that does not overlap recent context.',
    }
  }

  if ((isFollowUp(normalized, hasContext) && !topicalShift) || options.hasPendingConfirmation) {
    return {
      intent: 'follow_up',
      confidence: 0.84,
      reason: 'Prompt references prior turn or active pending confirmation.',
    }
  }

  if (isAmbiguous(normalized, hasContext)) {
    return {
      intent: 'ambiguous',
      confidence: 0.8,
      reason: 'Prompt is too short/vague to resolve safely.',
    }
  }

  return {
    intent: 'new_topic',
    confidence: 0.86,
    reason: 'Prompt introduces a standalone request.',
  }
}

export function buildTowerAiAmbiguousClarificationQuestion(prompt: string): string {
  const normalized = normalizeTowerAiPromptForUnderstanding(prompt)

  if (/\b(?:set|update|change|add|remove|delete|clear|write)\b/i.test(normalized)) {
    return 'Which exact page/tool and field should I change?'
  }

  if (/\b(?:cost|level|upgrade|value|sync|cooldown|lab|module|card|vault|relic)\b/i.test(normalized)) {
    return 'Which mechanic or stat do you want me to focus on?'
  }

  return 'What exact result do you want from me right now?'
}
