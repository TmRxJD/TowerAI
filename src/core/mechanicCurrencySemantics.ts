export type TowerAiCurrencyId =
  | 'cash'
  | 'coins'
  | 'gems'
  | 'stones'
  | 'medals'
  | 'elite-cells'
  | 'keys'
  | 'bits'
  | 'tokens'
  | 'module-shards'

export type TowerAiMechanicDomain =
  | 'labs'
  | 'bots'
  | 'uw'
  | 'modules'
  | 'cards'
  | 'events'
  | 'guilds'
  | 'guardians'

export type TowerAiMechanicSubMechanic =
  | 'lab-topic'
  | 'lab-research-cost'
  | 'lab-rush'
  | 'lab-boost'
  | 'bot-upgrade'
  | 'uw-upgrade'
  | 'module-upgrade'
  | 'module-pull'
  | 'card-pull'
  | 'event-shop-currency-purchase'
  | 'guild-shop-currency-purchase'
  | 'guardian-chip-unlock'
  | 'guardian-chip-upgrade'

export type TowerAiMechanicCurrencyResolution = {
  domain: TowerAiMechanicDomain
  subMechanic: TowerAiMechanicSubMechanic
  allowedCurrencies: TowerAiCurrencyId[]
  matchedSignals: string[]
}

const SPECIAL_LAB_ALIAS_PATTERN = /\b(?:lab\s+speed|labs\s+speed|lab\s+coin\s+discount|labs\s+coin\s+discount|coin\s+discount|lab\s+discount)\b/i
const BOT_LAB_PATTERN = /\b(?:gb|gold(?:en)?\s+bot|coin\s+bot|ab|amp\s+bot|fb|flame\s+bot|tb|thunder\s+bot|bots?)\b[\s\S]{0,24}\b(?:cooldown|cd|duration|dur)\b[\s\S]{0,16}\blab\b/i
const EVENT_SHOP_PATTERN = /\b(?:event\s+shop|event\s+store)\b/i
const GUILD_SHOP_PATTERN = /\b(?:guild\s+shop|guild\s+store)\b/i
const GUARDIAN_CHIP_NAME_PATTERN = /\b(?:ally|attack|bounty|fetch|scout|summon)\b/i
const GUARDIAN_SIGNAL_PATTERN = /\b(?:guardians?|guardian\s+chips?|guardian\s+slots?)\b/i
const MODULE_SIGNAL_PATTERN = /\bmodules?\b/i
const CARD_SIGNAL_PATTERN = /\bcards?\b/i
const BOT_SIGNAL_PATTERN = /\b(?:gb|gold(?:en)?\s+bot|coin\s+bot|ab|amp\s+bot|fb|flame\s+bot|tb|thunder\s+bot|bots?)\b/i
const UW_SIGNAL_PATTERN = /\b(?:uw|ultimate\s+weapon(?:s)?|gt|golden\s+tower|bh|black\s+hole|cf|chrono\s+field|sl|spotlight|cl|chain\s+lightning|dw|death\s+wave|ps|poison\s+swamp|sm|smart\s+missiles|ilm|inner\s+land\s+mines)\b/i

function normalizeTowerAiPrompt(input: string): string {
  return String(input || '').trim().toLowerCase()
}

export function getTowerAiExplicitCurrencySignals(input: string): TowerAiCurrencyId[] {
  const normalized = normalizeTowerAiPrompt(input)
  if (!normalized) return []

  const matches: TowerAiCurrencyId[] = []
  if (/\bcash\b/i.test(normalized)) matches.push('cash')
  if (/\bcoins?\b/i.test(normalized)) matches.push('coins')
  if (/\bgems?\b/i.test(normalized)) matches.push('gems')
  if (/\b(?:stones?|power\s+stones?)\b/i.test(normalized)) matches.push('stones')
  if (/\bmedals?\b/i.test(normalized)) matches.push('medals')
  if (/\belite\s+cells?\b/i.test(normalized)) matches.push('elite-cells')
  if (/\bkeys?\b/i.test(normalized)) matches.push('keys')
  if (/\bbits?\b/i.test(normalized)) matches.push('bits')
  if (/\btokens?\b/i.test(normalized)) matches.push('tokens')
  if (/\b(?:module\s+shards?|reroll\s+shards?|shards?)\b/i.test(normalized)) matches.push('module-shards')
  return [...new Set(matches)]
}

export function hasTowerAiExplicitCurrencyConflict(input: string, allowedCurrencies: TowerAiCurrencyId[]): boolean {
  const explicitSignals = getTowerAiExplicitCurrencySignals(input)
  if (explicitSignals.length === 0) return false

  const allowed = new Set(allowedCurrencies)
  return !explicitSignals.some(signal => allowed.has(signal))
}

function hasLabSignal(normalized: string): boolean {
  return /\blabs?\b/i.test(normalized)
    || SPECIAL_LAB_ALIAS_PATTERN.test(normalized)
    || BOT_LAB_PATTERN.test(normalized)
}

function hasLabResearchCostSignal(normalized: string): boolean {
  return /\b(?:how\s+many|how\s+much|cost|costs|price|prices|required|need|needs|time|coins?|gems?|from|to|max|level|lvl|target|current)\b/i.test(normalized)
}

function hasLabSpeedMultiplierSignal(normalized: string): boolean {
  return /\b(?:[0-9]+(?:\.[0-9]+)?)x\s*speedup\b/i.test(normalized)
    || /\bspeed\s*up\s*(?:[0-9]+(?:\.[0-9]+)?)x\b/i.test(normalized)
    || /\bspeedup\s*(?:[0-9]+(?:\.[0-9]+)?)x\b/i.test(normalized)
    || /\b(?:at|with|on)\s*(?:[0-9]+(?:\.[0-9]+)?)x(?:\s*speed)?\b/i.test(normalized)
}

function hasLabRushSignal(normalized: string): boolean {
  if (/\b(?:rush|rushing|finish\s+now|insta(?:nt|ntly)?|skip)\b/i.test(normalized)) {
    return true
  }

  const hasSpeedUpVerb = /\b(?:speed\s*up|speedup)\b/i.test(normalized)
  if (!hasSpeedUpVerb) return false
  if (hasLabSpeedMultiplierSignal(normalized)) return false

  return /\bgems?\b/i.test(normalized)
}

function hasLabBoostSignal(normalized: string): boolean {
  return /\b(?:boost|boosting|elite\s+cells?)\b/i.test(normalized)
}

function hasEventShopCurrencySignal(normalized: string): boolean {
  return EVENT_SHOP_PATTERN.test(normalized)
    && /\b(?:currency|exchange|rate|rates|buy|purchase|cost|costs|medals?|gems?|stones?|shards?)\b/i.test(normalized)
}

function hasGuildShopCurrencySignal(normalized: string): boolean {
  return GUILD_SHOP_PATTERN.test(normalized)
    && /\b(?:currency|buy|purchase|cost|costs|required|tokens?|bits?|gems?|shards?)\b/i.test(normalized)
}

function hasGuardianReference(normalized: string): boolean {
  return GUARDIAN_SIGNAL_PATTERN.test(normalized) || GUARDIAN_CHIP_NAME_PATTERN.test(normalized)
}

function hasGuardianChipUnlockSignal(normalized: string): boolean {
  return hasGuardianReference(normalized)
    && /\b(?:buy|purchase|unlock|get|acquire|equip|slot|slots?|cost|costs|price|prices|required|tokens?)\b/i.test(normalized)
}

function hasGuardianChipUpgradeSignal(normalized: string): boolean {
  return hasGuardianReference(normalized)
    && /\b(?:upgrade|upgrades|level|levels|stat|stats|max|value|effect|cooldown|duration|line|lines)\b/i.test(normalized)
}

function hasModulePullSignal(normalized: string): boolean {
  return MODULE_SIGNAL_PATTERN.test(normalized)
    && /\b(?:pull|pulls|draw|draws|roll|rolls|banner|banners|ticket|tickets|buy|purchase|pack|packs)\b/i.test(normalized)
}

function hasModuleUpgradeSignal(normalized: string): boolean {
  return MODULE_SIGNAL_PATTERN.test(normalized)
    && /\b(?:cost|costs|upgrade|upgrades|level|levels|from|to|max|coins?|shards?)\b/i.test(normalized)
}

function hasCardPullSignal(normalized: string): boolean {
  return CARD_SIGNAL_PATTERN.test(normalized)
    && /\b(?:buy|purchase|pull|draw|slot|slots?|unlock|cost|costs|gems?)\b/i.test(normalized)
}

function hasBotUpgradeSignal(normalized: string): boolean {
  return BOT_SIGNAL_PATTERN.test(normalized)
    && /\b(?:how\s+many|how\s+much|cost|costs|price|prices|required|need|needs|max|level|lvl|target|cooldown|cd|duration|dur|bonus|range|damage|medals?)\b/i.test(normalized)
}

function hasUwUpgradeSignal(normalized: string): boolean {
  return UW_SIGNAL_PATTERN.test(normalized)
    && /\b(?:how\s+many|how\s+much|cost|costs|price|prices|required|need|needs|max|level|lvl|target|cooldown|cd|duration|size|quantity|angle|chance|damage|stones?)\b/i.test(normalized)
}

export function resolveTowerAiMechanicCurrencySemantics(input: string): TowerAiMechanicCurrencyResolution | null {
  const normalized = normalizeTowerAiPrompt(input)
  if (!normalized) return null

  if (hasLabSignal(normalized)) {
    if (hasLabRushSignal(normalized)) {
      return {
        domain: 'labs',
        subMechanic: 'lab-rush',
        allowedCurrencies: ['gems'],
        matchedSignals: ['labs', 'rush'],
      }
    }

    if (hasLabBoostSignal(normalized)) {
      return {
        domain: 'labs',
        subMechanic: 'lab-boost',
        allowedCurrencies: ['elite-cells'],
        matchedSignals: ['labs', 'boost'],
      }
    }

    if (hasLabResearchCostSignal(normalized)) {
      return {
        domain: 'labs',
        subMechanic: 'lab-research-cost',
        allowedCurrencies: ['coins'],
        matchedSignals: ['labs', 'research'],
      }
    }

    return {
      domain: 'labs',
      subMechanic: 'lab-topic',
      allowedCurrencies: ['coins'],
      matchedSignals: ['labs'],
    }
  }

  if (hasEventShopCurrencySignal(normalized)) {
    return {
      domain: 'events',
      subMechanic: 'event-shop-currency-purchase',
      allowedCurrencies: ['medals'],
      matchedSignals: ['event-shop', 'medals'],
    }
  }

  if ((GUILD_SHOP_PATTERN.test(normalized) || /\bguilds?\b/i.test(normalized)) && hasGuardianChipUnlockSignal(normalized)) {
    return {
      domain: 'guardians',
      subMechanic: 'guardian-chip-unlock',
      allowedCurrencies: ['tokens'],
      matchedSignals: ['guardians', 'guild-shop', 'tokens'],
    }
  }

  if (hasGuardianChipUpgradeSignal(normalized)) {
    return {
      domain: 'guardians',
      subMechanic: 'guardian-chip-upgrade',
      allowedCurrencies: ['bits'],
      matchedSignals: ['guardians', 'bits'],
    }
  }

  if (hasGuildShopCurrencySignal(normalized)) {
    return {
      domain: 'guilds',
      subMechanic: 'guild-shop-currency-purchase',
      allowedCurrencies: ['tokens'],
      matchedSignals: ['guild-shop', 'tokens'],
    }
  }

  if (hasModulePullSignal(normalized)) {
    return {
      domain: 'modules',
      subMechanic: 'module-pull',
      allowedCurrencies: ['gems'],
      matchedSignals: ['modules', 'gems'],
    }
  }

  if (hasModuleUpgradeSignal(normalized)) {
    return {
      domain: 'modules',
      subMechanic: 'module-upgrade',
      allowedCurrencies: ['coins', 'module-shards'],
      matchedSignals: ['modules', 'coins', 'shards'],
    }
  }

  if (hasCardPullSignal(normalized)) {
    return {
      domain: 'cards',
      subMechanic: 'card-pull',
      allowedCurrencies: ['gems'],
      matchedSignals: ['cards', 'gems'],
    }
  }

  if (hasBotUpgradeSignal(normalized)) {
    return {
      domain: 'bots',
      subMechanic: 'bot-upgrade',
      allowedCurrencies: ['medals'],
      matchedSignals: ['bots', 'medals'],
    }
  }

  if (hasUwUpgradeSignal(normalized)) {
    return {
      domain: 'uw',
      subMechanic: 'uw-upgrade',
      allowedCurrencies: ['stones'],
      matchedSignals: ['uw', 'stones'],
    }
  }

  return null
}

export function isTowerAiMechanicDomainPrompt(input: string, domain: TowerAiMechanicDomain): boolean {
  return resolveTowerAiMechanicCurrencySemantics(input)?.domain === domain
}
