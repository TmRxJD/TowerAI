export type TowerAiDomainEntity = {
  id: string
  canonicalName: string
  category: 'ultimate-weapon' | 'ultimate-weapon-plus' | 'lab' | 'bot' | 'mechanic'
  aliases: string[]
  expectedEffectTypes: string[]
}

export type TowerAiDomainEntityMatch = {
  entity: TowerAiDomainEntity
  matchedAlias: string
}

const TOWER_AI_DOMAIN_ENTITIES: TowerAiDomainEntity[] = [
  {
    id: 'uw-golden-tower',
    canonicalName: 'Golden Tower',
    category: 'ultimate-weapon',
    aliases: ['golden tower', 'gt'],
    expectedEffectTypes: ['economy', 'coins', 'uptime', 'cooldown'],
  },
  {
    id: 'uw-black-hole',
    canonicalName: 'Black Hole',
    category: 'ultimate-weapon',
    aliases: ['black hole', 'bh'],
    expectedEffectTypes: ['control', 'pull', 'duration', 'size', 'cooldown'],
  },
  {
    id: 'uw-spotlight',
    canonicalName: 'Spotlight',
    category: 'ultimate-weapon',
    aliases: ['spotlight', 'sl'],
    expectedEffectTypes: ['damage amp', 'coverage', 'angle', 'multiplier'],
  },
  {
    id: 'uw-chain-lightning',
    canonicalName: 'Chain Lightning',
    category: 'ultimate-weapon',
    aliases: ['chain lightning', 'cl'],
    expectedEffectTypes: ['chance', 'chain', 'hits', 'damage'],
  },
  {
    id: 'uw-chrono-field',
    canonicalName: 'Chrono Field',
    category: 'ultimate-weapon',
    aliases: ['chrono field', 'cf'],
    expectedEffectTypes: ['speed reduction', 'slow', 'duration', 'cooldown'],
  },
  {
    id: 'uw-death-wave',
    canonicalName: 'Death Wave',
    category: 'ultimate-weapon',
    aliases: ['death wave', 'dw'],
    expectedEffectTypes: ['wave damage', 'damage', 'cooldown', 'quantity'],
  },
  {
    id: 'uw-poison-swamp',
    canonicalName: 'Poison Swamp',
    category: 'ultimate-weapon',
    aliases: ['poison swamp', 'ps'],
    expectedEffectTypes: ['poison', 'duration', 'radius', 'damage-over-time'],
  },
  {
    id: 'uw-smart-missiles',
    canonicalName: 'Smart Missiles',
    category: 'ultimate-weapon',
    aliases: ['smart missiles', 'sm'],
    expectedEffectTypes: ['missile', 'targeting', 'quantity', 'damage'],
  },
  {
    id: 'uw-inner-land-mines',
    canonicalName: 'Inner Land Mines',
    category: 'ultimate-weapon',
    aliases: ['inner land mines', 'ilm'],
    expectedEffectTypes: ['mines', 'damage', 'spawn', 'quantity'],
  },
  {
    id: 'lab-speed',
    canonicalName: 'Labs Speed',
    category: 'lab',
    aliases: ['labs speed', 'lab speed'],
    expectedEffectTypes: ['research rate', 'time reduction', 'lab completion'],
  },
]

function normalizeTowerAiDomainValue(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function includesTokenizedAlias(haystack: string, alias: string): boolean {
  const normalizedHaystack = ` ${normalizeTowerAiDomainValue(haystack)} `
  const normalizedAlias = ` ${normalizeTowerAiDomainValue(alias)} `
  if (!normalizedAlias.trim()) return false
  return normalizedHaystack.includes(normalizedAlias)
}

export function detectTowerAiDomainEntity(prompt: string): TowerAiDomainEntityMatch | null {
  const normalizedPrompt = normalizeTowerAiDomainValue(prompt)
  if (!normalizedPrompt) return null

  let best: TowerAiDomainEntityMatch | null = null
  for (const entity of TOWER_AI_DOMAIN_ENTITIES) {
    for (const alias of entity.aliases) {
      if (!includesTokenizedAlias(normalizedPrompt, alias)) continue
      if (!best || alias.length > best.matchedAlias.length) {
        best = {
          entity,
          matchedAlias: alias,
        }
      }
    }
  }

  return best
}

export function doesTowerAiTextMatchDomainEntity(text: string, match: TowerAiDomainEntityMatch | null): boolean {
  if (!match) return false
  const normalizedText = normalizeTowerAiDomainValue(text)
  if (!normalizedText) return false

  return match.entity.aliases.some(alias => includesTokenizedAlias(normalizedText, alias))
}

export function buildTowerAiDomainGroundingBlock(match: TowerAiDomainEntityMatch | null): string {
  if (!match) return ''

  const effectTypes = match.entity.expectedEffectTypes.join(', ')
  return [
    'Domain ontology anchor:',
    `- Entity: ${match.entity.canonicalName}`,
    `- Category: ${match.entity.category}`,
    `- Matched alias: ${match.matchedAlias}`,
    `- Expected effect types: ${effectTypes}`,
    '- Grounding rule: If evidence conflicts with this entity, ask for clarification instead of guessing.',
  ].join('\n')
}

export function shouldConstrainTowerAiKnowledgeToDomainEntity(prompt: string, match: TowerAiDomainEntityMatch | null): boolean {
  if (!match) return false
  const normalizedPrompt = normalizeTowerAiDomainValue(prompt)
  if (!normalizedPrompt) return false

  return /\b(what does|explain|core stats|how does|effect|what is)\b/.test(normalizedPrompt)
}
