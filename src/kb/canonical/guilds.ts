import {
  buildGuardianDefinitions,
  getGuardianStatBounds,
  getGuardianStatCostAt,
  getGuardianStatValueAt,
  type GuardianDefinition,
} from '@tmrxjd/platform/tools'
import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import { type GuildSourceEntry, loadGuildsSourceDocument } from './guildsSource'

type SystemSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
  preferredKeys: string[]
}

const GUARDIANS = buildGuardianDefinitions()
const GUARDIAN_BY_MECHANIC = new Map(GUARDIANS.map(guardian => [`${guardian.label} Guardian`, guardian]))

const SYSTEM_SPECS: SystemSpec[] = [
  { mechanic: 'Guilds', chunkId: 'guilds_overview_01', title: 'Guilds Overview', tags: ['guilds', 'social', 'progression'], preferredKeys: ['Behavior'] },
  { mechanic: 'Guild Creation', chunkId: 'guilds_creation_01', title: 'Guild Creation', tags: ['guilds', 'membership', 'gems'], preferredKeys: ['Behavior'] },
  { mechanic: 'Guild Joining', chunkId: 'guilds_joining_01', title: 'Guild Joining', tags: ['guilds', 'membership'], preferredKeys: ['Behavior'] },
  { mechanic: 'Guild Rewards', chunkId: 'guilds_rewards_01', title: 'Guild Rewards', tags: ['guilds', 'rewards', 'guardians'], preferredKeys: ['Behavior'] },
  { mechanic: 'Guild Contribution', chunkId: 'guilds_contribution_01', title: 'Guild Contribution', tags: ['guilds', 'rewards', 'contribution'], preferredKeys: ['Behavior'] },
  { mechanic: 'Guild Weekly Reward Chests', chunkId: 'guilds_weekly_reward_chests_01', title: 'Guild Weekly Reward Chests', tags: ['guilds', 'rewards', 'tokens', 'bits'], preferredKeys: ['Behavior'] },
  { mechanic: 'Guild Seasons', chunkId: 'guilds_seasons_01', title: 'Guild Seasons', tags: ['guilds', 'seasons'], preferredKeys: ['Behavior'] },
  { mechanic: 'Guild Token Cashout', chunkId: 'guilds_token_cashout_01', title: 'Guild Token Cashout', tags: ['guilds', 'tokens', 'gems'], preferredKeys: ['Behavior'] },
  { mechanic: 'Guild Shop', chunkId: 'guilds_shop_01', title: 'Guild Shop', tags: ['guilds', 'shop', 'tokens'], preferredKeys: ['Behavior'] },
  { mechanic: 'Guild Shop Currency Purchases', chunkId: 'guilds_shop_currency_01', title: 'Guild Shop Currency Purchases', tags: ['guilds', 'shop', 'tokens', 'bits', 'gems', 'shards'], preferredKeys: ['Behavior', 'Costs'] },
  { mechanic: 'Guild Themes', chunkId: 'guilds_themes_01', title: 'Guild Themes', tags: ['guilds', 'themes', 'cosmetics'], preferredKeys: ['Behavior'] },
  { mechanic: 'Guild Relics', chunkId: 'guilds_relics_01', title: 'Guild Relics', tags: ['guilds', 'relics', 'tokens'], preferredKeys: ['Behavior'] },
  { mechanic: 'Guardians', chunkId: 'guilds_guardians_01', title: 'Guardians Overview', tags: ['guilds', 'guardians', 'bits'], preferredKeys: ['Behavior'] },
  { mechanic: 'Guardian Chips', chunkId: 'guilds_guardian_chips_01', title: 'Guardian Chips', tags: ['guilds', 'guardians', 'chips', 'bits'], preferredKeys: ['Behavior'] },
]

function createChunkId(prefix: string, value: string): string {
  return `${prefix}_${value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}_01`
}

function extractAliases(entry: GuildSourceEntry): string[] {
  return String(entry.sections.Aliases || '')
    .split(';')
    .map(alias => alias.trim().toLowerCase())
    .filter(alias => alias && alias !== 'none.')
}

function buildMetadataParagraph(entry: GuildSourceEntry): string | null {
  const parts = [
    entry.sections.Type ? `Type: ${entry.sections.Type}` : '',
    entry.sections.Domain ? `Domain: ${entry.sections.Domain}` : '',
    entry.sections.Section ? `Section: ${entry.sections.Section}` : '',
    entry.sections.Category ? `Category: ${entry.sections.Category}` : '',
    entry.sections.Aliases && !/^none\.?$/i.test(entry.sections.Aliases) ? `Aliases: ${entry.sections.Aliases}` : '',
  ].filter(Boolean)

  return parts.length > 0 ? `${parts.join('. ')}.` : null
}

function ensureAtomicDisambiguation(value: string): string {
  if (/mechanic itself,? not its interactions/i.test(value)) {
    return value
  }

  return `${value} This chunk describes the mechanic itself, not its interactions.`
}

function readAtomicDisambiguation(entry: GuildSourceEntry | undefined, fallback: string): string {
  const value = entry?.sections.Disambiguation
  return ensureAtomicDisambiguation(value ? value.replace(/\n+/g, ' ') : fallback)
}

function buildPreferredParagraphs(entry: GuildSourceEntry, preferredKeys: string[]): string[] {
  const paragraphs: string[] = []

  if (entry.sections.Definition) {
    paragraphs.push(`Definition: ${entry.sections.Definition}`)
  }

  const metadataParagraph = buildMetadataParagraph(entry)
  if (metadataParagraph) {
    paragraphs.push(metadataParagraph)
  }

  for (const key of preferredKeys) {
    const value = entry.sections[key]
    if (value && !/^none\.?$/i.test(value.trim())) {
      paragraphs.push(`${key}: ${value}`)
    }
  }

  return paragraphs
}

function getGuardianStatCostRange(guardian: GuardianDefinition, statIndex: number, minLevel: number, maxLevel: number): { firstLevel: number; firstCost: number; lastLevel: number; lastCost: number } | null {
  let firstLevel = -1
  let firstCost = -1
  let lastLevel = -1
  let lastCost = -1

  for (let level = minLevel; level <= maxLevel; level += 1) {
    const cost = getGuardianStatCostAt(guardian, statIndex, level)
    if (!Number.isFinite(cost) || cost === null || cost <= 0) {
      continue
    }

    if (firstLevel < 0) {
      firstLevel = level
      firstCost = cost
    }

    lastLevel = level
    lastCost = cost
  }

  if (firstLevel < 0 || lastLevel < 0) {
    return null
  }

  return { firstLevel, firstCost, lastLevel, lastCost }
}

function buildGuardianStatParagraph(guardian: GuardianDefinition, statIndex: number): string {
  const statName = guardian.statOrder[statIndex]
  const bounds = getGuardianStatBounds(guardian, statIndex)
  const minValue = getGuardianStatValueAt(guardian, statIndex, bounds.min)
  const maxValue = getGuardianStatValueAt(guardian, statIndex, bounds.max)
  const costRange = getGuardianStatCostRange(guardian, statIndex, bounds.min, bounds.max)

  const progression = `${statName} ranges from ${minValue} at L${bounds.min} to ${maxValue} at L${bounds.max}.`
  if (!costRange) {
    return progression
  }

  return `${progression} Upgrade costs shown in site data run from ${costRange.firstCost} bits at L${costRange.firstLevel} to ${costRange.lastCost} bits at L${costRange.lastLevel}.`
}

function buildGuardianAtomicParagraphs(entry: GuildSourceEntry, guardian: GuardianDefinition): string[] {
  const statMaxLevels = guardian.statOrder.map((_, statIndex) => getGuardianStatBounds(guardian, statIndex).max)
  const hasMixedCaps = new Set(statMaxLevels).size > 1
  const paragraphs = buildPreferredParagraphs(entry, ['Behavior'])

  paragraphs.push(`Guardian stats: ${guardian.statOrder.join(', ')}.`)
  guardian.statOrder.forEach((_, statIndex) => {
    paragraphs.push(buildGuardianStatParagraph(guardian, statIndex))
  })

  if (hasMixedCaps) {
    paragraphs.push(`${entry.mechanic} does not cap all three stats at the same level, so some upgrade lines stop improving before others.`)
  }

  return paragraphs
}

export function buildGuildsCanonicalKbChunks(): KBChunkRecord[] {
  const sourceDocument = loadGuildsSourceDocument()
  const guildsEntry = getRequiredNamingRegistryEntryBySource('guilds', 'guilds')
  const entryByMechanic = new Map(sourceDocument.deterministicEntries.map(entry => [entry.mechanic, entry]))

  const systemChunks = SYSTEM_SPECS.map(spec => {
    const entry = entryByMechanic.get(spec.mechanic)
    if (!entry) {
      throw new Error(`Guilds structured source is missing the ${spec.mechanic} mechanic entry.`)
    }

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'Guilds Structured Reference',
      section: 'Guilds',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: readAtomicDisambiguation(entry, `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about unrelated tracker state, implementation details, or other game systems.`),
      data_source: guildsEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Guilds',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: spec.mechanic === 'Guilds'
        ? [...sourceDocument.overviewParagraphs, ...buildPreferredParagraphs(entry, spec.preferredKeys)]
        : buildPreferredParagraphs(entry, spec.preferredKeys),
    })
  })

  const guardianChunks = sourceDocument.deterministicEntries
    .filter(entry => GUARDIAN_BY_MECHANIC.has(entry.mechanic))
    .map(entry => {
      const guardian = GUARDIAN_BY_MECHANIC.get(entry.mechanic)
      if (!guardian) {
        throw new Error(`Guilds structured source mechanic ${entry.mechanic} is missing guardian definition data.`)
      }

      const namingEntry = getRequiredNamingRegistryEntryBySource('guilds', entry.mechanic)
      return buildAtomicKbChunk({
        chunk_id: createChunkId('guilds_guardian', entry.mechanic),
        source: 'Tracker Website Guardian Data',
        section: 'Guilds',
        topic: entry.mechanic,
        title: entry.mechanic,
        disambiguation: readAtomicDisambiguation(entry, `This chunk is about ${entry.mechanic} as a guardian mechanic itself, not its interactions. It is not about unrelated guild rules, other guardians, or tracker implementation details.`),
        data_source: namingEntry.data_source,
        is_base_mechanic: namingEntry.is_base_mechanic,
        mechanics: [entry.mechanic],
        tags: ['guilds', 'guardians', guardian.key, ...extractAliases(entry)],
        paragraphs: buildGuardianAtomicParagraphs(entry, guardian),
      })
    })

  return [
    ...systemChunks,
    buildRelationalKbChunk({
      chunk_id: 'guilds_rewards_contribution_chests_01',
      source: 'Guilds Structured Reference',
      section: 'Guilds',
      topic: 'Guild Rewards with Guild Contribution and Guild Weekly Reward Chests',
      title: 'Guild Rewards with Guild Contribution and Guild Weekly Reward Chests',
      disambiguation: 'This chunk is about the interaction between Guild Rewards, Guild Contribution, and Guild Weekly Reward Chests, not the individual mechanics. It is not about guild creation, guardian upgrade costs, or unrelated reward systems.',
      data_source: guildsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Guild Rewards', 'Guild Contribution', 'Guild Weekly Reward Chests'],
      interaction_type: 'conditional',
      interaction_summary: 'Guild Contribution unlocks Guild Weekly Reward Chests, and those chests are how most recurring Guild Rewards are paid out.',
      tags: ['guilds', 'rewards', 'contribution', 'chests'],
      paragraphs: [
        'Guild Contribution is the weekly participation score that determines which Guild Weekly Reward Chests can be claimed.',
        'Those Guild Weekly Reward Chests are the main recurring Guild Rewards source for tokens, bits, coins, and gems.',
        'This means Guild Rewards scale with how much Guild Contribution a player earns during the weekly cycle.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guilds_seasons_cashout_gems_01',
      source: 'Guilds Structured Reference',
      section: 'Guilds',
      topic: 'Guild Seasons with Guild Token Cashout and Gems',
      title: 'Guild Seasons with Guild Token Cashout and Gems',
      disambiguation: 'This chunk is about the interaction between Guild Seasons, Guild Token Cashout, and Gems, not the individual mechanics. It is not about guardian chip costs, guild joining rules, or unrelated currencies.',
      data_source: guildsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Guild Seasons', 'Guild Token Cashout', 'Gems'],
      interaction_type: 'conditional',
      interaction_summary: 'Guild Seasons define when Guild Token Cashout occurs, and Guild Token Cashout converts leftover guild tokens into Gems.',
      tags: ['guilds', 'seasons', 'tokens', 'gems'],
      paragraphs: [
        'Guild Seasons last eight weeks and define when seasonal reset behavior happens.',
        'At the end of that season, Guild Token Cashout automatically converts leftover guild tokens into Gems at a rounded-up 5 to 1 ratio.',
        'Because of that timing, Guild Seasons determine when unused guild-token value turns into Gems instead of remaining shop currency.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guilds_shop_tokens_currency_01',
      source: 'Guilds Structured Reference',
      section: 'Guilds',
      topic: 'Guild Shop with Guild Shop Currency Purchases and Guild Tokens',
      title: 'Guild Shop with Guild Shop Currency Purchases and Guild Tokens',
      disambiguation: 'This chunk is about the interaction between Guild Shop, Guild Shop Currency Purchases, and Guild Tokens, not the individual mechanics. It is not about relic tracker implementation, weekly chest thresholds, or unrelated currencies.',
      data_source: guildsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Guild Shop', 'Guild Shop Currency Purchases', 'Guild Tokens'],
      interaction_type: 'conditional',
      interaction_summary: 'Guild Shop spends Guild Tokens, and Guild Shop Currency Purchases define the seasonal token ladders for bits, gems, and shards.',
      tags: ['guilds', 'shop', 'tokens', 'bits', 'gems', 'shards'],
      paragraphs: [
        'Guild Tokens are the currency consumed by the Guild Shop.',
        'Guild Shop Currency Purchases define how many Guild Tokens each seasonal purchase of bits, gems, or shards requires.',
        'This means the live value of Guild Tokens depends on which step of each Guild Shop Currency Purchases ladder the player is currently on.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guilds_themes_seasons_shop_01',
      source: 'Guilds Structured Reference',
      section: 'Guilds',
      topic: 'Guild Themes with Guild Seasons and Guild Shop',
      title: 'Guild Themes with Guild Seasons and Guild Shop',
      disambiguation: 'This chunk is about the interaction between Guild Themes, Guild Seasons, and Guild Shop, not the individual mechanics. It is not about relic rarity, guardian chip costs, or unrelated cosmetic systems.',
      data_source: guildsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Guild Themes', 'Guild Seasons', 'Guild Shop'],
      interaction_type: 'conditional',
      interaction_summary: 'Guild Themes are sold through the Guild Shop, and Guild Seasons control which theme rotation is currently available.',
      tags: ['guilds', 'themes', 'shop', 'seasons'],
      paragraphs: [
        'Guild Themes are purchased from the Guild Shop rather than earned through weekly chest thresholds.',
        'Guild Seasons rotate which tower, background, menu, and guardian-skin options are currently available in that shop.',
        'As a result, Guild Themes availability depends on both the Guild Shop and the active Guild Seasons rotation window.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guilds_relics_seasons_shop_01',
      source: 'Guilds Structured Reference',
      section: 'Guilds',
      topic: 'Guild Relics with Guild Seasons and Guild Shop',
      title: 'Guild Relics with Guild Seasons and Guild Shop',
      disambiguation: 'This chunk is about the interaction between Guild Relics, Guild Seasons, and Guild Shop, not the individual mechanics. It is not about weekly reward tables, guardian stat caps, or unrelated relic systems.',
      data_source: guildsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Guild Relics', 'Guild Seasons', 'Guild Shop'],
      interaction_type: 'conditional',
      interaction_summary: 'Guild Relics appear through the Guild Shop, and Guild Seasons influence which limited relic offers are available at a given time.',
      tags: ['guilds', 'relics', 'shop', 'seasons'],
      paragraphs: [
        'Guild Relics are purchased from the Guild Shop at fixed seasonal token price points.',
        'Because Guild Relics can be limited or event-tied, Guild Seasons influence which relic offers appear in the shop rotation.',
        'This makes Guild Relics availability a combined result of Guild Shop inventory and the current Guild Seasons window.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guilds_guardians_guilds_rewards_01',
      source: 'Guilds Structured Reference',
      section: 'Guilds',
      topic: 'Guardians with Guilds and Guild Rewards',
      title: 'Guardians with Guilds and Guild Rewards',
      disambiguation: 'This chunk is about the interaction between Guardians, Guilds, and Guild Rewards, not the individual mechanics. It is not about bot formulas, module assists, or unrelated progression systems.',
      data_source: guildsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Guardians', 'Guilds', 'Guild Rewards'],
      interaction_type: 'conditional',
      interaction_summary: 'Guardians only exist inside Guilds, and Guild Rewards progression is what opens and funds most guardian progression.',
      tags: ['guilds', 'guardians', 'rewards'],
      paragraphs: [
        'Guardians are unlocked only after the player is participating in Guilds.',
        'Guild Rewards provide the token and bit economy that makes ongoing guardian progression possible after that unlock.',
        'This means Guardians are not a standalone system; they sit downstream of Guilds access and recurring Guild Rewards income.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guilds_guardian_chips_bits_guardians_01',
      source: 'Guilds Structured Reference',
      section: 'Guilds',
      topic: 'Guardian Chips with Bits and Guardians',
      title: 'Guardian Chips with Bits and Guardians',
      disambiguation: 'This chunk is about the interaction between Guardian Chips, Bits, and Guardians, not the individual mechanics. It is not about guild creation cost, relic purchases, or unrelated currencies.',
      data_source: guildsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Guardian Chips', 'Bits', 'Guardians'],
      interaction_type: 'scaling',
      interaction_summary: 'Guardian Chips define each guardian upgrade line, and Bits are the resource spent to raise those guardian chip stats.',
      tags: ['guilds', 'guardians', 'chips', 'bits'],
      paragraphs: [
        'Guardian Chips hold the effect, cooldown, and secondary-stat upgrade lines for each guardian.',
        'Bits are the upgrade currency consumed when those guardian chip lines are leveled.',
        'Because each guardian stat has its own cap and bit-cost ladder, Guardians progress through Guardian Chips only as Bits are invested into those specific lines.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guilds_guardian_chips_shop_tokens_01',
      source: 'Guilds Structured Reference',
      section: 'Guilds',
      topic: 'Guardian Chips with Guild Shop and Guild Tokens',
      title: 'Guardian Chips with Guild Shop and Guild Tokens',
      disambiguation: 'This chunk is about the interaction between Guardian Chips, Guild Shop, and Guild Tokens, not the individual mechanics. It is not about weekly chest coin multipliers, relic pricing, or unrelated reward systems.',
      data_source: guildsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Guardian Chips', 'Guild Shop', 'Guild Tokens'],
      interaction_type: 'conditional',
      interaction_summary: 'Extra Guardian Chips are bought through the Guild Shop, and Guild Tokens pay the unlock cost for those additional guardian abilities.',
      tags: ['guilds', 'guardians', 'chips', 'shop', 'tokens'],
      paragraphs: [
        'Ally and Attack are the only Guardian Chips that start unlocked with the guardian system itself.',
        'Bounty, Fetch, Scout, and Summon must be purchased separately from the Guild Shop for Guild Tokens.',
        'This makes Guild Shop access and Guild Tokens the gate on expanding Guardian Chips beyond the two default guardian abilities.',
      ],
    }),
    ...guardianChunks,
  ]
}
