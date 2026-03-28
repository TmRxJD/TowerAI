export type TowerAiAnswerEvalCase = {
  id: string
  prompt: string
  requiredPhrases: string[]
  forbiddenPhrases?: string[]
}

export type TowerAiAnswerEvalFailure = {
  id: string
  prompt: string
  reply: string
  issues: string[]
}

export type TowerAiAnswerEvalResult = {
  passRate: number
  passedCount: number
  failed: TowerAiAnswerEvalFailure[]
}

const GLOBAL_FORBIDDEN_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: 'internal kb markup leaked', pattern: /<kb>|<site_data>|<user_data>/i },
  { label: 'internal metadata leaked', pattern: /\b(?:aliases|keywords|disambiguation|source detail|stat source|user value source)\s*:/i },
  { label: 'ontology scaffold leaked', pattern: /domain ontology anchor|grounding rule|matched alias|expected effect types/i },
  { label: 'insufficient-answer fallback leaked', pattern: /i do not have enough reliable information|don’t have a grounded answer yet|i may be mixing entries/i },
  { label: 'action failure leaked', pattern: /executed \d+ step\(s\)|first failure:|fetch failed/i },
]

function normalizeForTowerAiAnswerMatch(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[,_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function detectRepeatedSentence(reply: string): boolean {
  const sentences = String(reply || '')
    .split(/(?<=[.!?])\s+/)
    .map(sentence => normalizeForTowerAiAnswerMatch(sentence))
    .filter(Boolean)

  for (let index = 1; index < sentences.length; index += 1) {
    if (sentences[index] === sentences[index - 1]) {
      return true
    }
  }

  return false
}

function detectRepeatedLeadLabel(reply: string): boolean {
  return /^([^:]{2,80}):\s*\1\s*:/i.test(String(reply || '').trim())
}

export function evaluateTowerAiSingleAnswer(testCase: TowerAiAnswerEvalCase, reply: string): string[] {
  const issues: string[] = []
  const normalizedReply = normalizeForTowerAiAnswerMatch(reply)

  if (!normalizedReply) {
    issues.push('reply was empty')
    return issues
  }

  for (const phrase of testCase.requiredPhrases) {
    const normalizedPhrase = normalizeForTowerAiAnswerMatch(phrase)
    if (!normalizedPhrase) continue
    if (!normalizedReply.includes(normalizedPhrase)) {
      issues.push(`missing required phrase: ${phrase}`)
    }
  }

  for (const phrase of testCase.forbiddenPhrases || []) {
    const normalizedPhrase = normalizeForTowerAiAnswerMatch(phrase)
    if (!normalizedPhrase) continue
    if (normalizedReply.includes(normalizedPhrase)) {
      issues.push(`contained forbidden phrase: ${phrase}`)
    }
  }

  for (const rule of GLOBAL_FORBIDDEN_PATTERNS) {
    if (rule.pattern.test(reply)) {
      issues.push(rule.label)
    }
  }

  if (detectRepeatedSentence(reply)) {
    issues.push('repeated sentence pattern detected')
  }

  if (detectRepeatedLeadLabel(reply)) {
    issues.push('repeated lead label detected')
  }

  return issues
}

export async function runTowerAiAnswerEval(
  cases: TowerAiAnswerEvalCase[],
  executor: (prompt: string) => Promise<string>,
): Promise<TowerAiAnswerEvalResult> {
  const failed: TowerAiAnswerEvalFailure[] = []

  for (const testCase of cases) {
    const reply = await executor(testCase.prompt)
    const issues = evaluateTowerAiSingleAnswer(testCase, reply)
    if (issues.length > 0) {
      failed.push({
        id: testCase.id,
        prompt: testCase.prompt,
        reply,
        issues,
      })
    }
  }

  const passedCount = cases.length - failed.length
  return {
    passRate: cases.length === 0 ? 1 : passedCount / cases.length,
    passedCount,
    failed,
  }
}
