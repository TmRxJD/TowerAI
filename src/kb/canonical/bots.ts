import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, type KBChunkRecord } from './shared'
import { type BotDeterministicEntry, loadBotsSourceDocument } from './botsSource'

function formatSectionParagraph(entry: BotDeterministicEntry, key: string): string | null {
  const value = entry.sections[key]
  if (!value || /^none\.?$/i.test(value.trim())) {
    return null
  }

  return `${key}: ${value}`
}

function createBotChunkId(mechanic: string): string {
  return `bots_${mechanic.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}_01`
}

function resolveCanonicalBotMechanic(mechanic: string): string {
  const normalized = mechanic.trim().toLowerCase()

  if (normalized === 'golden bot' || normalized === 'gold bot' || normalized === 'coin bot') {
    return 'Golden Bot'
  }

  return mechanic
}

function extractAliases(entry: BotDeterministicEntry): string[] {
  return String(entry.sections.Aliases || '')
    .split(';')
    .map(alias => alias.trim().toLowerCase())
    .filter(alias => alias && alias !== 'none.')
}

function buildMetadataParagraph(entry: BotDeterministicEntry): string | null {
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
  if (/mechanic itself, not its interactions/i.test(value)) {
    return value
  }

  return `${value} This chunk describes the mechanic itself, not its interactions.`
}

function readDeterministicDisambiguation(entry: BotDeterministicEntry | undefined, fallback: string): string {
  const value = entry?.sections.Disambiguation
  return ensureAtomicDisambiguation(value ? value.replace(/\n+/g, ' ') : fallback)
}

function buildOrderedParagraphs(entry: BotDeterministicEntry, preferredKeys: string[]): string[] {
  const paragraphs: string[] = []
  const usedKeys = new Set<string>()

  const pushParagraph = (key: string) => {
    const paragraph = formatSectionParagraph(entry, key)
    if (!paragraph) {
      return
    }

    paragraphs.push(paragraph)
    usedKeys.add(key)
  }

  pushParagraph('Definition')

  const metadataParagraph = buildMetadataParagraph(entry)
  if (metadataParagraph) {
    paragraphs.push(metadataParagraph)
  }

  for (const key of preferredKeys) {
    pushParagraph(key)
  }

  for (const key of Object.keys(entry.sections)) {
    if (usedKeys.has(key) || key === 'Mechanic' || key === 'Definition' || key === 'Description' || key === 'Disambiguation') {
      continue
    }

    pushParagraph(key)
  }

  return paragraphs
}

export function buildBotsCanonicalKbChunks(): KBChunkRecord[] {
  const sourceDocument = loadBotsSourceDocument()
  const botsEntry = getRequiredNamingRegistryEntryBySource('bots', 'bots')
  const entryByMechanic = new Map(sourceDocument.deterministicEntries.map(entry => [entry.mechanic, entry]))
  const overviewEntry = entryByMechanic.get('Bots')
  const botRoster = sourceDocument.deterministicEntries
    .map(entry => resolveCanonicalBotMechanic(entry.mechanic))
    .filter(mechanic => mechanic !== 'Bots')

  if (!overviewEntry) {
    throw new Error('Bots structured source is missing the overview mechanic entry.')
  }

  const botChunks = sourceDocument.deterministicEntries
    .filter(entry => entry.mechanic !== 'Bots')
    .map(entry => {
      const canonicalMechanic = resolveCanonicalBotMechanic(entry.mechanic)
      const namingEntry = getRequiredNamingRegistryEntryBySource('bots', canonicalMechanic)
      const mechanicTags = [entry.mechanic.toLowerCase()]

      if (canonicalMechanic !== entry.mechanic) {
        mechanicTags.push(canonicalMechanic.toLowerCase())
      }

      return buildAtomicKbChunk({
        chunk_id: createBotChunkId(entry.mechanic),
        source: 'Bots Structured Reference',
        section: 'Bots',
        topic: entry.mechanic,
        title: entry.mechanic,
        disambiguation: readDeterministicDisambiguation(entry, `This chunk is about ${entry.mechanic} as an individual bot mechanic itself, not its interactions. It is not about other bots, aliases alone, or tracker implementation details.`),
        data_source: namingEntry.data_source,
        is_base_mechanic: namingEntry.is_base_mechanic,
        mechanics: [canonicalMechanic],
        tags: ['bots', 'event store', 'medals', ...mechanicTags, ...extractAliases(entry)],
        paragraphs: buildOrderedParagraphs(entry, [
          'Unlocking/Upgrading',
          'Upgrade Stats',
          'Costs',
          'Behavior',
          'Labs',
          'Interactions',
          'Footguns',
        ]),
      })
    })

  return [
    buildAtomicKbChunk({
      chunk_id: 'bots_overview_01',
      source: 'Bots Structured Reference',
      section: 'Bots',
      topic: 'Bots Overview',
      title: 'Bots Overview',
      disambiguation: readDeterministicDisambiguation(overviewEntry, 'This chunk is about the Bots mechanic itself, not its interactions. It is not about individual bot stat tables, bot aliases alone, or tracker implementation details.'),
      data_source: botsEntry.data_source,
      is_base_mechanic: botsEntry.is_base_mechanic,
      mechanics: ['Bots'],
      tags: ['bots', 'event store', 'medals', 'progression'],
      paragraphs: [
        ...sourceDocument.overviewParagraphs,
        ...buildOrderedParagraphs(overviewEntry, [
          'Behavior',
        ]),
      ],
    }),
    buildAtomicKbChunk({
      chunk_id: 'bots_aliases_01',
      source: 'Bots Structured Reference',
      section: 'Bots',
      topic: 'Bot Aliases',
      title: 'Common Bot Aliases',
      disambiguation: 'This chunk is about the Bot Aliases mechanic itself, not its interactions. It is not about bot upgrade values, bot costs, or tracker state behavior.',
      data_source: botsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Bot Aliases'],
      tags: ['bots', 'aliases', 'gb', 'cb', 'ab', 'tb', 'fb'],
      paragraphs: [
        formatSectionParagraph(overviewEntry, 'Aliases') ?? '',
      ],
    }),
    buildAtomicKbChunk({
      chunk_id: 'bots_roster_01',
      source: 'Bots Structured Reference',
      section: 'Bots',
      topic: 'Bot Roster',
      title: 'All Bots Roster',
      disambiguation: 'This chunk describes the permanent bot roster mechanic itself, not its interactions. It is not an upgrade-order guide, a cooldown breakpoint table, or a medal-cost chart.',
      data_source: botsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Bots'],
      tags: ['bots', 'roster', 'list', 'all bots', 'event store', 'medals'],
      paragraphs: [
        `The current permanent bot roster is: ${botRoster.join(', ')}.`,
        'Golden Bot is the canonical economy-bot name in this knowledge base. Coin Bot and Gold Bot are treated as aliases for Golden Bot.',
      ],
    }),
    buildAtomicKbChunk({
      chunk_id: 'bots_unlock_costs_01',
      source: 'Bots Structured Reference',
      section: 'Bots',
      topic: 'Bot Unlock Costs',
      title: 'Bot Unlock Costs',
      disambiguation: 'This chunk is about the Bot Unlock Costs mechanic itself, not its interactions. It is not about per-bot stat effects, bot aliases, or tracker implementation details.',
      data_source: botsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Bot Unlock Costs'],
      tags: ['bots', 'unlock costs', 'event store', 'medals'],
      paragraphs: [
        formatSectionParagraph(overviewEntry, 'Unlock Costs') ?? '',
      ],
    }),
    buildAtomicKbChunk({
      chunk_id: 'bots_shared_upgrade_costs_01',
      source: 'Bots Structured Reference',
      section: 'Bots',
      topic: 'Shared Bot Upgrade Costs',
      title: 'Shared Bot Upgrade Medal Costs',
      disambiguation: 'This chunk is about the Shared Bot Upgrade Medal Costs mechanic itself, not its interactions. It is not about individual bot effects, aliases, or tracker implementation details.',
      data_source: botsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Bot Upgrade Medal Costs'],
      tags: ['bots', 'upgrade costs', 'medals', 'event store'],
      paragraphs: [
        formatSectionParagraph(overviewEntry, 'Shared Upgrade Costs') ?? '',
      ],
    }),
    buildAtomicKbChunk({
      chunk_id: 'bots_respec_01',
      source: 'Bots Structured Reference',
      section: 'Bots',
      topic: 'Bot Respec',
      title: 'Bot Respec',
      disambiguation: 'This chunk is about the Bot Respec mechanic itself, not its interactions. It is not about bot stat values, aliases, or tracker implementation details.',
      data_source: botsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Bot Respec'],
      tags: ['bots', 'respec', 'gems', 'event store'],
      paragraphs: [
        formatSectionParagraph(overviewEntry, 'Bot Respec') ?? '',
      ],
    }),
    ...botChunks,
  ]
}
