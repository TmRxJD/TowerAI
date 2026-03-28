import { detectTowerAiPromptIntentTags } from './promptUnderstanding'

export type TowerAiIntentClass = 'action-intent' | 'capability' | 'knowledge' | 'context' | 'other'

export type TowerAiIntentConfidenceAssessment = {
  topIntent: TowerAiIntentClass
  confidence: number
  margin: number
  needsClarification: boolean
  reason: string
  scores: Record<TowerAiIntentClass, number>
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function buildBaseScores(input: string, tags: string[]): Record<TowerAiIntentClass, number> {
  const normalized = String(input || '').trim().toLowerCase()
  const scores: Record<TowerAiIntentClass, number> = {
    'action-intent': 0,
    capability: 0,
    knowledge: 0,
    context: 0,
    other: 0.05,
  }

  if (tags.includes('action-intent')) scores['action-intent'] += 0.55
  if (tags.includes('capability-tools') || tags.includes('capability-page') || tags.includes('capability-io')) {
    scores.capability += 0.65
  }
  if (tags.includes('context-note') || tags.includes('context-summary') || tags.includes('context-clear') || tags.includes('context-clear-all')) {
    scores.context += 0.75
  }

  if (/\b(go|navigate|open|set|update|write|run|execute|add|remove|delete|clear|catalog|click)\b/.test(normalized)) {
    scores['action-intent'] += 0.25
  }

  if (/\b(what|how|why|when|where|which|who|explain|compare|difference|does|do|is|are)\b/.test(normalized)) {
    scores.knowledge += 0.25
  }

  if (/\b(tools?|capabilities|inputs?|outputs?|page|route|tracker|calculator|feature|mechanic)\b/.test(normalized)) {
    scores.capability += 0.15
  }

  if (/\b(remember|notes?|context|clear|wipe|forget|goal|setup)\b/.test(normalized)) {
    scores.context += 0.2
  }

  if (/\?$/.test(normalized) || /\bwhat\b|\bhow\b/.test(normalized)) {
    scores.knowledge += 0.1
  }

  return scores
}

function rankScores(scores: Record<TowerAiIntentClass, number>): Array<{ intent: TowerAiIntentClass; score: number }> {
  return (Object.entries(scores) as Array<[TowerAiIntentClass, number]>)
    .map(([intent, score]) => ({ intent, score: clamp01(score) }))
    .sort((a, b) => b.score - a.score)
}

export function assessTowerAiPromptIntentConfidence(input: string): TowerAiIntentConfidenceAssessment {
  const normalized = String(input || '').trim()
  if (!normalized) {
    return {
      topIntent: 'other',
      confidence: 0,
      margin: 0,
      needsClarification: true,
      reason: 'empty input',
      scores: {
        'action-intent': 0,
        capability: 0,
        knowledge: 0,
        context: 0,
        other: 0,
      },
    }
  }

  const tags = detectTowerAiPromptIntentTags(normalized)
  const scores = buildBaseScores(normalized, tags)
  const ranked = rankScores(scores)
  const top = ranked[0]
  const second = ranked[1]
  const margin = clamp01((top?.score || 0) - (second?.score || 0))
  const confidence = clamp01((top?.score || 0) * 0.8 + margin * 0.2)

  const needsClarification = confidence < 0.45
    || (top?.intent === 'action-intent' && confidence < 0.55)
    || (top?.intent === 'other')

  const reason = needsClarification
    ? `low confidence (${confidence.toFixed(2)}) for ${top?.intent || 'other'}`
    : `high confidence (${confidence.toFixed(2)}) for ${top?.intent || 'other'}`

  return {
    topIntent: top?.intent || 'other',
    confidence,
    margin,
    needsClarification,
    reason,
    scores: {
      'action-intent': clamp01(scores['action-intent']),
      capability: clamp01(scores.capability),
      knowledge: clamp01(scores.knowledge),
      context: clamp01(scores.context),
      other: clamp01(scores.other),
    },
  }
}
