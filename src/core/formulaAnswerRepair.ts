function extractDisplayMathExpressions(input: string): string[] {
  return Array.from(String(input || '').matchAll(/\$\$([\s\S]+?)\$\$/g))
    .map(match => String(match[1] || '').trim())
    .filter(Boolean)
}

function containsDelimitedDisplayMath(input: string): boolean {
  return /\$\$[\s\S]+?\$\$/.test(String(input || ''))
}

function containsUndelimitedLatex(input: string): boolean {
  return /\\(?:sum|prod|frac|text|left|right|begin|bigl|bigr|cdot|times)/.test(String(input || ''))
    && !containsDelimitedDisplayMath(input)
}

function looksLikeLatexOnlyLine(line: string): boolean {
  const normalized = String(line || '').trim()
  if (!normalized) return false
  if (!containsUndelimitedLatex(normalized)) return false
  return !/[.!?]$/.test(normalized) || normalized.startsWith('\\') || normalized.startsWith('{')
}

function stripUndelimitedLatexLines(input: string): string {
  const lines = String(input || '').split('\n')
  const kept: string[] = []

  for (const line of lines) {
    if (looksLikeLatexOnlyLine(line)) continue
    kept.push(line)
  }

  return kept.join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function stripUndelimitedLatexFragments(input: string): string {
  return String(input || '')
    .replace(/(^|\n)\s*\\(?:sum|prod|frac|text|left|right|begin|bigl|bigr)[^\n]*/g, '$1')
    .replace(/\\\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function insertDisplayFormulaAfterLead(answer: string, formula: string): string {
  const normalizedAnswer = String(answer || '').trim()
  const displayBlock = `$$${formula}$$`
  if (!normalizedAnswer) return displayBlock

  const firstParagraphBreak = normalizedAnswer.indexOf('\n\n')
  if (firstParagraphBreak >= 0) {
    return `${normalizedAnswer.slice(0, firstParagraphBreak).trim()}\n\n${displayBlock}\n\n${normalizedAnswer.slice(firstParagraphBreak + 2).trim()}`.trim()
  }

  const firstSentenceMatch = normalizedAnswer.match(/^(.+?[.!?])(?:\s+|$)([\s\S]*)$/)
  if (firstSentenceMatch?.[1]) {
    const lead = firstSentenceMatch[1].trim()
    const remainder = String(firstSentenceMatch[2] || '').trim()
    return remainder
      ? `${lead}\n\n${displayBlock}\n\n${remainder}`
      : `${lead}\n\n${displayBlock}`
  }

  return `${normalizedAnswer}\n\n${displayBlock}`
}

export function repairTowerAiAnswerMathFormatting(prompt: string, answer: string): string {
  const displayExpressions = extractDisplayMathExpressions(prompt)
  if (displayExpressions.length === 0) return String(answer || '').trim()

  const primaryDisplayExpression = displayExpressions[0]
  const normalizedAnswer = String(answer || '').trim()
  if (!normalizedAnswer) return `$$${primaryDisplayExpression}$$`

  const strippedAnswer = stripUndelimitedLatexFragments(stripUndelimitedLatexLines(normalizedAnswer))
  const shouldInjectCanonicalFormula = !containsDelimitedDisplayMath(strippedAnswer)
    || containsUndelimitedLatex(normalizedAnswer)

  if (!shouldInjectCanonicalFormula) return strippedAnswer
  return insertDisplayFormulaAfterLead(strippedAnswer, primaryDisplayExpression)
}
