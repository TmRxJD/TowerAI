export function parseTowerAiLevelRange(input: string): { startLevel: number; targetLevel: number } | null {
  const normalized = input.toLowerCase()
  const fromMatch = normalized.match(/\bfrom\s+(?:level|lvl)?\s*(\d{1,3})\s*(?:to|->|-)\s*(?:level|lvl)?\s*(\d{1,3})\b/)
  const reverseFromMatch = normalized.match(/\bto\s+(?:level|lvl)?\s*(\d{1,3})\b[\s\S]{0,24}?\bfrom\s+(?:level|lvl)?\s*(\d{1,3})\b/)
  const plainMatch = normalized.match(/\b(?:(?:level|lvl)\s*)?(\d{1,3})\s*(?:to|->|-)\s*(?:(?:level|lvl)\s*)?(\d{1,3})\b/)
  const looseFromMatch = normalized.match(/\bfrom\s+(?:level|lvl)?\s*(\d{1,3})\b[\s\S]{0,24}?\bto\s+(?:level|lvl)?\s*(\d{1,3})\b/)
  const match = fromMatch ?? plainMatch ?? looseFromMatch
  if (reverseFromMatch) {
    const targetLevel = Math.max(0, Number(reverseFromMatch[1]) || 0)
    const startLevel = Math.max(0, Number(reverseFromMatch[2]) || 0)
    return {
      startLevel,
      targetLevel,
    }
  }
  if (!match) return null

  const startLevel = Math.max(0, Number(match[1]) || 0)
  const targetLevel = Math.max(0, Number(match[2]) || 0)
  return {
    startLevel,
    targetLevel,
  }
}
