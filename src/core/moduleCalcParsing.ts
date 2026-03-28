import { MODULE_RARITIES, resolveRarityLabel } from '@tmrxjd/platform/tools'

export type TowerAiParsedModuleCostRequest = {
  moduleType: string
  rarity?: string | null
  assistRarity?: string | null
  currentLevel?: number
  targetLevel?: number
  assistCurrentLevel?: number
  assistTargetLevel?: number
  shardDiscount?: number
  coinDiscount?: number
  assistEffPct?: number
}

export type TowerAiParsedAssistStoneRequest = {
  moduleType: string
  multiplierStartLevel?: number
  multiplierTargetLevel?: number
  substatStartLevel?: number
  substatTargetLevel?: number
}

export type TowerAiParsedShardSplitterRequest = {
  moduleType?: string
  unspentShards?: number
  shardDiscount?: number
  assistEffPct?: number
  primaryLevel?: number
  assistLevel?: number
  primaryRarity?: string | null
  assistRarity?: string | null
}

export type TowerAiParsedDamagePathRequest = {
  shardDiscount?: number
  cannonPrimaryLevel?: number
  cannonAssistLevel?: number
  cannonPrimaryRarity?: string | null
  cannonAssistRarity?: string | null
  cannonAssistEffPct?: number
  cannonUnspentShards?: number
  corePrimaryLevel?: number
  coreAssistLevel?: number
  corePrimaryRarity?: string | null
  coreAssistRarity?: string | null
  coreAssistEffPct?: number
  coreUnspentShards?: number
}

const MODULE_TYPE_ALIASES: Record<string, string> = {
  cannon: 'cannon',
  defense: 'defense',
  defence: 'defense',
  generator: 'generator',
  core: 'core',
}

function parseNumberAfterKeyword(input: string, keywordRegex: RegExp): number | null {
  const match = input.match(keywordRegex)
  if (!match?.[1]) return null
  const value = Number(match[1].replace(/,/g, ''))
  return Number.isFinite(value) ? value : null
}

function parsePercentAfterKeyword(input: string, keywordRegex: RegExp): number | null {
  const match = input.match(keywordRegex)
  if (!match?.[1]) return null
  const value = Number(match[1].replace(/,/g, ''))
  if (!Number.isFinite(value)) return null
  return Math.max(0, Math.min(100, Math.floor(value)))
}

function normalizeRarityPrompt(input: string): string {
  return input
    .replace(/\*/g, '★')
    .replace(/\s*\+\s*/g, ' + ')
    .replace(/\s+/g, ' ')
    .trim()
}

function findRarityMatchesInText(input: string): Array<{ rarity: string; index: number }> {
  const normalized = normalizeRarityPrompt(input.toLowerCase())
  const rarities = [...MODULE_RARITIES]
  const matches: Array<{ rarity: string; index: number }> = []
  for (const rarity of rarities) {
    const pattern = rarity
      .toLowerCase()
      .replace(/\s*\+\s*/g, '\\s*\\+\\s*')
      .replace(/\s+/g, '\\s+')
    const regex = new RegExp(`(^|[^a-z0-9])(${pattern})(?=$|[^a-z0-9])`, 'i')
    const match = normalized.match(regex)
    if (!match || typeof match.index !== 'number') continue

    const index = match.index + String(match[1] || '').length
    const resolvedRarity = resolveRarityLabel(rarity)
    if (!resolvedRarity) continue
    matches.push({ rarity: resolvedRarity, index })
  }

  return matches.sort((left, right) => left.index - right.index || right.rarity.length - left.rarity.length)
}

function findRarityInText(input: string): string | null {
  return findRarityMatchesInText(input)[0]?.rarity ?? null
}

function findRarityBeforeKeyword(input: string, keywordRegex: RegExp): string | null {
  const match = input.match(keywordRegex)
  if (!match || typeof match.index !== 'number') return null
  const slice = input.slice(Math.max(0, match.index - 32), match.index)
  const matches = findRarityMatchesInText(slice)
  if (matches.length === 0) return null
  return matches.reduce((best, candidate) => {
    if (!best) return candidate
    if (candidate.index > best.index) return candidate
    if (candidate.index === best.index && candidate.rarity.length > best.rarity.length) return candidate
    return best
  }, matches[0])?.rarity ?? null
}

function findRarityAfterKeyword(input: string, keywordRegex: RegExp): string | null {
  const match = input.match(keywordRegex)
  if (!match || typeof match.index !== 'number') return null
  const slice = input.slice(match.index, Math.min(input.length, match.index + 64))
  return findRarityMatchesInText(slice)[0]?.rarity ?? null
}

function findAliasValue(input: string, aliases: Record<string, string>): string | null {
  const keys = Object.keys(aliases).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    if (input.includes(key)) {
      return aliases[key]
    }
  }
  return null
}

function parseModuleType(input: string): string | null {
  return findAliasValue(input, MODULE_TYPE_ALIASES)
}

export function parseTowerAiModuleCostRequest(
  input: string,
  parseLevelRange: (value: string) => { startLevel: number; targetLevel: number } | null,
): TowerAiParsedModuleCostRequest | null {
  const normalized = input.trim().toLowerCase()
  if (!normalized) return null
  if (!/\bmodule|modules\b/i.test(normalized)) return null
  if (!/\bcost|costs|shard|coin\b/i.test(normalized)) return null
  if (/(shard\s+splitter|split\s+shards|shard\s+split|optimal\s+split|best\s+(?:shard\s+)?split)/i.test(normalized)) return null

  const moduleType = parseModuleType(normalized)
  if (!moduleType) return null

  const primaryRange = parseLevelRange(normalized)
  const assistRangeMatch = normalized.match(/assist[\s\S]{0,16}?(\d{1,3})\s*(?:to|->|-)\s*(\d{1,3})/i)
  const assistRange = assistRangeMatch
    ? { startLevel: Number(assistRangeMatch[1]), targetLevel: Number(assistRangeMatch[2]) }
    : null

  const currentLevel = parseNumberAfterKeyword(normalized, /\bcurrent\s+(\d{1,3})\b/i)
  const targetLevel = parseNumberAfterKeyword(normalized, /\btarget\s+(\d{1,3})\b/i)
  const assistCurrent = parseNumberAfterKeyword(normalized, /\bassist\s+current\s+(\d{1,3})\b/i)
  const assistTarget = parseNumberAfterKeyword(normalized, /\bassist\s+target\s+(\d{1,3})\b/i)

  const rarity = findRarityAfterKeyword(normalized, /\bprimary\s+rarity\b/i)
    ?? findRarityBeforeKeyword(normalized, /\bprimary\s+rarity\b/i)
    ?? findRarityBeforeKeyword(normalized, /\brarity\b/i)
    ?? findRarityAfterKeyword(normalized, /\brarity\b/i)
    ?? findRarityInText(normalized)
  const assistRarity = findRarityAfterKeyword(normalized, /\bassist\s+rarity\b/i)
    ?? findRarityBeforeKeyword(normalized, /\bassist\s+rarity\b/i)
    ?? findRarityAfterKeyword(normalized, /\bsecondary\s+rarity\b/i)
    ?? findRarityBeforeKeyword(normalized, /\bsecondary\s+rarity\b/i)

  const shardDiscount = parsePercentAfterKeyword(normalized, /\bshard\s+discount\s*(\d{1,3})%?\b/i)
    ?? parsePercentAfterKeyword(normalized, /\b(\d{1,3})%?\s+shard\s+discount\b/i)
  const coinDiscount = parsePercentAfterKeyword(normalized, /\bcoin\s+discount\s*(\d{1,3})%?\b/i)
    ?? parsePercentAfterKeyword(normalized, /\b(\d{1,3})%?\s+coin\s+discount\b/i)
  const assistEffPct = parsePercentAfterKeyword(normalized, /\bassist\s+(?:eff|efficiency)\s*(\d{1,3})%?\b/i)

  return {
    moduleType,
    rarity,
    assistRarity,
    currentLevel: primaryRange?.startLevel ?? currentLevel ?? undefined,
    targetLevel: primaryRange?.targetLevel ?? targetLevel ?? undefined,
    assistCurrentLevel: assistRange?.startLevel ?? assistCurrent ?? undefined,
    assistTargetLevel: assistRange?.targetLevel ?? assistTarget ?? undefined,
    shardDiscount: shardDiscount ?? undefined,
    coinDiscount: coinDiscount ?? undefined,
    assistEffPct: assistEffPct ?? undefined,
  }
}

export function parseTowerAiAssistStoneRequest(input: string): TowerAiParsedAssistStoneRequest | null {
  const normalized = input.trim().toLowerCase()
  if (!normalized) return null
  if (!/\bmodule|modules\b/i.test(normalized)) return null
  if (!/\bstone|stones|assist\s+module\s+cost\b/i.test(normalized)) return null

  const moduleType = parseModuleType(normalized)
  if (!moduleType) return null

  const multiplierRange = normalized.match(/multiplier[\s\S]{0,12}?(\d{1,3})\s*(?:to|->|-)\s*(\d{1,3})/i)
  const substatRange = normalized.match(/substat[\s\S]{0,12}?(\d{1,3})\s*(?:to|->|-)\s*(\d{1,3})/i)

  const multiplierStart = parseNumberAfterKeyword(normalized, /\bmultiplier\s+current\s+(\d{1,3})\b/i)
  const multiplierTarget = parseNumberAfterKeyword(normalized, /\bmultiplier\s+target\s+(\d{1,3})\b/i)
  const substatStart = parseNumberAfterKeyword(normalized, /\bsubstat\s+current\s+(\d{1,3})\b/i)
  const substatTarget = parseNumberAfterKeyword(normalized, /\bsubstat\s+target\s+(\d{1,3})\b/i)

  return {
    moduleType,
    multiplierStartLevel: multiplierRange ? Number(multiplierRange[1]) : multiplierStart ?? undefined,
    multiplierTargetLevel: multiplierRange ? Number(multiplierRange[2]) : multiplierTarget ?? undefined,
    substatStartLevel: substatRange ? Number(substatRange[1]) : substatStart ?? undefined,
    substatTargetLevel: substatRange ? Number(substatRange[2]) : substatTarget ?? undefined,
  }
}

export function parseTowerAiShardSplitterRequest(input: string): TowerAiParsedShardSplitterRequest | null {
  const normalized = input.trim().toLowerCase()
  if (!normalized) return null
  if (!/(shard\s+splitter|split\s+shards|splitter|optimal\s+(?:shard\s+)?split|best\s+(?:shard\s+)?split|calculate\s+.*shards?|shards?\s+for\s+.*module)/i.test(normalized)) return null

  const moduleType = parseModuleType(normalized)

  const unspentShards = parseNumberAfterKeyword(normalized, /\b(?:unspent|extra|budget)\s+shards?\s*(\d{1,3}(?:,\d{3})*|\d{1,9})\b/i)
    ?? parseNumberAfterKeyword(normalized, /\bi\s+have\s*(\d{1,3}(?:,\d{3})*|\d{1,9})\s+shards?\b/i)
    ?? parseNumberAfterKeyword(normalized, /\b(\d{1,3}(?:,\d{3})*|\d{1,9})\s+(?:unspent|extra|budget)\s+shards?\b/i)
  const shardDiscount = parsePercentAfterKeyword(normalized, /\bshard\s+discount\s*(\d{1,3})%?\b/i)
    ?? parsePercentAfterKeyword(normalized, /\b(\d{1,3})%?\s+shard\s+discount\b/i)
  const assistEffPct = parsePercentAfterKeyword(normalized, /\bassist\s+(?:eff|efficiency)\s*(\d{1,3})%?\b/i)
    ?? parsePercentAfterKeyword(normalized, /\b(?:eff|efficiency)\s*(\d{1,3})%?\b/i)
    ?? parsePercentAfterKeyword(normalized, /(\d{1,3})%\s+assist\s+(?:eff|efficiency)\b/i)
    ?? parsePercentAfterKeyword(normalized, /(\d{1,3})%\s*(?:eff|efficiency)\b/i)
  const primaryLevel = parseNumberAfterKeyword(normalized, /\bprimary\s+level\s*(\d{1,3})\b/i)
  const assistLevel = parseNumberAfterKeyword(normalized, /\bassist\s+level\s*(\d{1,3})\b/i)

  const primaryRarity = findRarityAfterKeyword(normalized, /\bprimary\s+rarity\b/i)
    ?? findRarityBeforeKeyword(normalized, /\bprimary\s+rarity\b/i)
  const assistRarity = findRarityAfterKeyword(normalized, /\bassist\s+rarity\b/i)
    ?? findRarityBeforeKeyword(normalized, /\bassist\s+rarity\b/i)
    ?? findRarityAfterKeyword(normalized, /\bsecondary\s+rarity\b/i)
    ?? findRarityBeforeKeyword(normalized, /\bsecondary\s+rarity\b/i)

  return {
    ...(moduleType ? { moduleType } : {}),
    unspentShards: unspentShards ?? undefined,
    shardDiscount: shardDiscount ?? undefined,
    assistEffPct: assistEffPct ?? undefined,
    primaryLevel: primaryLevel ?? undefined,
    assistLevel: assistLevel ?? undefined,
    primaryRarity,
    assistRarity,
  }
}

export function parseTowerAiDamagePathRequest(input: string): TowerAiParsedDamagePathRequest | null {
  const normalized = input.trim().toLowerCase()
  if (!normalized) return null
  if (!/(damage\s+path|effective\s+path)\b/i.test(normalized)) return null

  const shardDiscount = parsePercentAfterKeyword(normalized, /\bshard\s+discount\s*(\d{1,3})%?\b/i)

  const cannonPrimaryLevel = parseNumberAfterKeyword(normalized, /\bcannon\s+primary\s+level\s*(\d{1,3})\b/i)
  const cannonAssistLevel = parseNumberAfterKeyword(normalized, /\bcannon\s+(?:assist|secondary)\s+level\s*(\d{1,3})\b/i)
  const cannonAssistEffPct = parsePercentAfterKeyword(normalized, /\bcannon\s+assist\s+(?:eff|efficiency)\s*(\d{1,3})%?\b/i)
  const cannonUnspentShards = parseNumberAfterKeyword(normalized, /\bcannon\s+unspent\s+shards?\s*(\d{1,9})\b/i)

  const corePrimaryLevel = parseNumberAfterKeyword(normalized, /\bcore\s+primary\s+level\s*(\d{1,3})\b/i)
  const coreAssistLevel = parseNumberAfterKeyword(normalized, /\bcore\s+(?:assist|secondary)\s+level\s*(\d{1,3})\b/i)
  const coreAssistEffPct = parsePercentAfterKeyword(normalized, /\bcore\s+assist\s+(?:eff|efficiency)\s*(\d{1,3})%?\b/i)
  const coreUnspentShards = parseNumberAfterKeyword(normalized, /\bcore\s+unspent\s+shards?\s*(\d{1,9})\b/i)

  const cannonPrimaryRarity = findRarityAfterKeyword(normalized, /\bcannon\s+primary\s+rarity\b/i)
    ?? findRarityBeforeKeyword(normalized, /\bcannon\s+primary\s+rarity\b/i)
  const cannonAssistRarity = findRarityAfterKeyword(normalized, /\bcannon\s+(?:assist|secondary)\s+rarity\b/i)
    ?? findRarityBeforeKeyword(normalized, /\bcannon\s+(?:assist|secondary)\s+rarity\b/i)
  const corePrimaryRarity = findRarityAfterKeyword(normalized, /\bcore\s+primary\s+rarity\b/i)
    ?? findRarityBeforeKeyword(normalized, /\bcore\s+primary\s+rarity\b/i)
  const coreAssistRarity = findRarityAfterKeyword(normalized, /\bcore\s+(?:assist|secondary)\s+rarity\b/i)
    ?? findRarityBeforeKeyword(normalized, /\bcore\s+(?:assist|secondary)\s+rarity\b/i)

  return {
    shardDiscount: shardDiscount ?? undefined,
    cannonPrimaryLevel: cannonPrimaryLevel ?? undefined,
    cannonAssistLevel: cannonAssistLevel ?? undefined,
    cannonPrimaryRarity,
    cannonAssistRarity,
    cannonAssistEffPct: cannonAssistEffPct ?? undefined,
    cannonUnspentShards: cannonUnspentShards ?? undefined,
    corePrimaryLevel: corePrimaryLevel ?? undefined,
    coreAssistLevel: coreAssistLevel ?? undefined,
    corePrimaryRarity,
    coreAssistRarity,
    coreAssistEffPct: coreAssistEffPct ?? undefined,
    coreUnspentShards: coreUnspentShards ?? undefined,
  }
}
