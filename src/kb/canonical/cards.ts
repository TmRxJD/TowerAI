import {
  CARD_LEVELS,
  CARD_TEMPLATES,
  type CardTemplate,
} from '../../game-data/card-data'
import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import { type CardDeterministicEntry, loadCardsSourceDocument } from './cardsSource'

type SystemAtomicSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
  preferredKeys: string[]
}

const CARD_TEMPLATE_BY_NAME = new Map(CARD_TEMPLATES.map(card => [card.name, card]))

const SYSTEM_ATOMIC_SPECS: SystemAtomicSpec[] = [
  {
    mechanic: 'Cards',
    chunkId: 'cards_overview_01',
    title: 'Cards Overview',
    tags: ['cards', 'gems', 'progression'],
    preferredKeys: ['Behavior'],
  },
  {
    mechanic: 'Card Locking',
    chunkId: 'cards_locking_01',
    title: 'Card Locking',
    tags: ['cards', 'locking', 'loadout'],
    preferredKeys: ['Behavior'],
  },
  {
    mechanic: 'Card Slots',
    chunkId: 'cards_slots_01',
    title: 'Card Slots',
    tags: ['cards', 'slots', 'loadout'],
    preferredKeys: ['Behavior'],
  },
  {
    mechanic: 'Card Slot Costs',
    chunkId: 'cards_slot_costs_01',
    title: 'Card Slot Costs',
    tags: ['cards', 'slot costs', 'gems'],
    preferredKeys: ['Costs'],
  },
  {
    mechanic: 'Card Star Costs',
    chunkId: 'cards_star_costs_01',
    title: 'Card Star Costs',
    tags: ['cards', 'star costs', 'copies', 'gems'],
    preferredKeys: ['Costs'],
  },
  {
    mechanic: 'Card Buying',
    chunkId: 'cards_buying_01',
    title: 'Card Buying',
    tags: ['cards', 'buying', 'draw rates', 'rarity'],
    preferredKeys: ['Behavior'],
  },
  {
    mechanic: 'Card Milestone Unlocks',
    chunkId: 'cards_milestone_unlocks_01',
    title: 'Card Milestone Unlocks',
    tags: ['cards', 'milestones', 'unlocks'],
    preferredKeys: ['Behavior'],
  },
  {
    mechanic: 'Card Mastery Unlock',
    chunkId: 'cards_mastery_unlock_01',
    title: 'Card Mastery Unlock',
    tags: ['cards', 'mastery', 'stones'],
    preferredKeys: ['Behavior'],
  },
]

function formatSectionParagraph(entry: CardDeterministicEntry, key: string): string | null {
  const value = entry.sections[key]
  if (!value || /^none\.?$/i.test(value.trim())) {
    return null
  }

  return `${key}: ${value}`
}

function createChunkId(prefix: string, mechanic: string): string {
  return `${prefix}_${mechanic.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}_01`
}

function extractAliases(entry: CardDeterministicEntry): string[] {
  return String(entry.sections.Aliases || '')
    .split(';')
    .map(alias => alias.trim().toLowerCase())
    .filter(alias => alias && alias !== 'none.')
}

function buildMetadataParagraph(entry: CardDeterministicEntry): string | null {
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

function readAtomicDisambiguation(entry: CardDeterministicEntry | undefined, fallback: string): string {
  const value = entry?.sections.Disambiguation
  return ensureAtomicDisambiguation(value ? value.replace(/\n+/g, ' ') : fallback)
}

function buildSystemParagraphs(entry: CardDeterministicEntry, preferredKeys: string[]): string[] {
  const paragraphs: string[] = []

  if (entry.sections.Definition) {
    paragraphs.push(`Definition: ${entry.sections.Definition}`)
  }

  const metadataParagraph = buildMetadataParagraph(entry)
  if (metadataParagraph) {
    paragraphs.push(metadataParagraph)
  }

  for (const key of preferredKeys) {
    const paragraph = formatSectionParagraph(entry, key)
    if (paragraph) {
      paragraphs.push(paragraph)
    }
  }

  return paragraphs
}

function formatSeries(levels: readonly number[], values: readonly number[]): string {
  return levels
    .map((level, index) => `L${level} ${values[index]}`)
    .join(', ')
}

function formatSequentialSeries(values: readonly number[]): string {
  return values
    .map((value, index) => `L${index + 1} ${value}`)
    .join(', ')
}

function buildCardAtomicParagraphs(entry: CardDeterministicEntry, template: CardTemplate): string[] {
  const paragraphs: string[] = []

  if (entry.sections.Definition) {
    paragraphs.push(`Definition: ${entry.sections.Definition}`)
  }

  const metadataParagraph = buildMetadataParagraph(entry)
  if (metadataParagraph) {
    paragraphs.push(metadataParagraph)
  }

  paragraphs.push(`Card data: Rarity ${template.rarity}. Base effect: ${template.description}.`)
  paragraphs.push(`Card levels use ${template.levelType} scaling with tracker values ${formatSeries(CARD_LEVELS, template.levelValues)}.`)

  return paragraphs
}

function extractInteractionMechanics(entry: CardDeterministicEntry): string[] {
  return String(entry.sections['Interaction Mechanics'] || '')
    .split(';')
    .map(mechanic => mechanic.trim())
    .filter(mechanic => mechanic && !/^none\.?$/i.test(mechanic))
}

function isStandardUnlock(value: string | undefined): boolean {
  return !value || /standard (card|epic )?pool|available from/i.test(value)
}

function buildCardMasteryRelationChunk(entry: CardDeterministicEntry, template: CardTemplate, cardsDataSource: string): KBChunkRecord {
  const namingEntry = getRequiredNamingRegistryEntryBySource('cards', entry.mechanic)
  const title = `${entry.mechanic} Card Mastery`

  return buildRelationalKbChunk({
    chunk_id: createChunkId('cards_mastery', entry.mechanic),
    source: 'Cards Structured Reference',
    section: 'Cards',
    topic: `${entry.mechanic} and ${template.masteryName}`,
    title,
    disambiguation: `This chunk is about the interaction between ${entry.mechanic}, ${template.masteryName}, and Card Mastery Unlock, not the individual mechanics. It is not about unrelated card draw odds, slot costs, or other cards.`,
    data_source: [namingEntry.data_source, cardsDataSource],
    is_base_mechanic: false,
    mechanics: [entry.mechanic, template.masteryName, 'Card Mastery Unlock'],
    interaction_type: 'conditional',
    interaction_summary: `${template.masteryName} applies only after Card Mastery Unlock is available and ${entry.mechanic} is equipped.`,
    tags: ['cards', 'mastery', template.rarity, template.id, ...extractAliases(entry)],
    paragraphs: [
      `${entry.mechanic} has the mastery ${template.masteryName}.`,
      `${template.masteryName} effect: ${template.masteryDescription}.`,
      `Card Mastery Unlock gates ${template.masteryName}; Card Mastery Unlock requires 30 cards maxed plus Tier 16 Wave 100, and ${entry.mechanic} must be equipped for ${template.masteryName} to matter.`,
      `${template.masteryName} uses ${template.masteryType} scaling in tracker card data with mastery values ${formatSequentialSeries(template.masteryValues)}.`,
    ],
  })
}

function buildMilestoneRelationChunk(entry: CardDeterministicEntry, cardsDataSource: string): KBChunkRecord | null {
  const unlockRequirement = entry.sections['Unlock Requirement']
  if (isStandardUnlock(unlockRequirement)) {
    return null
  }

  const namingEntry = getRequiredNamingRegistryEntryBySource('cards', entry.mechanic)
  const title = `${entry.mechanic} Milestone Unlock`

  return buildRelationalKbChunk({
    chunk_id: createChunkId('cards_milestone', entry.mechanic),
    source: 'Cards Structured Reference',
    section: 'Cards',
    topic: `${entry.mechanic} and Milestones`,
    title,
    disambiguation: `This chunk is about the interaction between ${entry.mechanic} and Milestones, not the individual mechanics. It is not about unrelated card effects, slot costs, or other milestone systems.`,
    data_source: [namingEntry.data_source, cardsDataSource],
    is_base_mechanic: false,
    mechanics: [entry.mechanic, 'Milestones'],
    interaction_type: 'conditional',
    interaction_summary: `${entry.mechanic} cannot enter card buying until its Milestones gate is cleared.`,
    tags: ['cards', 'milestones', namingEntry.key.toLowerCase(), ...extractAliases(entry)],
    paragraphs: [
      `${entry.mechanic} is gated by Milestones before it can appear in card buying.`,
      `Milestones rule: ${unlockRequirement}.`,
      `Until the required Milestones condition is met, ${entry.mechanic} is unavailable even if the player continues buying cards.`,
    ],
  })
}

function buildInteractionRelationChunk(entry: CardDeterministicEntry, cardsDataSource: string): KBChunkRecord | null {
  const interactionMechanics = extractInteractionMechanics(entry)
  const interactionText = entry.sections.Interactions
  if (interactionMechanics.length === 0 || !interactionText || /^none\.?$/i.test(interactionText.trim())) {
    return null
  }

  const namingEntry = getRequiredNamingRegistryEntryBySource('cards', entry.mechanic)
  const title = `${entry.mechanic} Interactions`

  return buildRelationalKbChunk({
    chunk_id: createChunkId('cards_relation', entry.mechanic),
    source: 'Cards Structured Reference',
    section: 'Cards',
    topic: `${entry.mechanic} interactions`,
    title,
    disambiguation: `This chunk is about the interaction between ${entry.mechanic} and ${interactionMechanics.join(', ')}, not the individual mechanics. It is not about unrelated card draw rules, mastery unlock costs, or other cards.`,
    data_source: [namingEntry.data_source, cardsDataSource],
    is_base_mechanic: false,
    mechanics: [entry.mechanic, ...interactionMechanics],
    interaction_type: 'cross_system',
    interaction_summary: interactionText.split('.').map(part => part.trim()).find(Boolean) ?? interactionText,
    tags: ['cards', 'interactions', namingEntry.key.toLowerCase(), ...extractAliases(entry)],
    paragraphs: [
      interactionText,
    ],
  })
}

export function buildCardsCanonicalKbChunks(): KBChunkRecord[] {
  const sourceDocument = loadCardsSourceDocument()
  const cardsEntry = getRequiredNamingRegistryEntryBySource('cards', 'cards')
  const entryByMechanic = new Map(sourceDocument.deterministicEntries.map(entry => [entry.mechanic, entry]))

  const systemChunks = SYSTEM_ATOMIC_SPECS.map(spec => {
    const entry = entryByMechanic.get(spec.mechanic)

    if (!entry) {
      throw new Error(`Cards structured source is missing the ${spec.mechanic} mechanic entry.`)
    }

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'Cards Structured Reference',
      section: 'Cards',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: readAtomicDisambiguation(entry, `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about unrelated cards, tracker implementation details, or other game systems.`),
      data_source: cardsEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Cards',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: spec.mechanic === 'Cards'
        ? [...sourceDocument.overviewParagraphs, ...buildSystemParagraphs(entry, spec.preferredKeys)]
        : buildSystemParagraphs(entry, spec.preferredKeys),
    })
  })

  const cardEntries = sourceDocument.deterministicEntries.filter(entry => CARD_TEMPLATE_BY_NAME.has(entry.mechanic))

  const cardAtomicChunks = cardEntries.map(entry => {
    const template = CARD_TEMPLATE_BY_NAME.get(entry.mechanic)
    if (!template) {
      throw new Error(`Cards structured source mechanic ${entry.mechanic} is missing card template data.`)
    }

    const namingEntry = getRequiredNamingRegistryEntryBySource('cards', entry.mechanic)

    return buildAtomicKbChunk({
      chunk_id: createChunkId('cards', entry.mechanic),
      source: 'Cards Structured Reference',
      section: 'Cards',
      topic: entry.mechanic,
      title: entry.mechanic,
      disambiguation: readAtomicDisambiguation(entry, `This chunk is about ${entry.mechanic} as a card mechanic itself, not its interactions. It is not about other cards, mastery interactions, or tracker implementation details.`),
      data_source: namingEntry.data_source,
      is_base_mechanic: namingEntry.is_base_mechanic,
      mechanics: [entry.mechanic],
      tags: ['cards', template.rarity, template.id, entry.mechanic.toLowerCase(), ...extractAliases(entry)],
      paragraphs: buildCardAtomicParagraphs(entry, template),
    })
  })

  const masteryRelationChunks = cardEntries.map(entry => {
    const template = CARD_TEMPLATE_BY_NAME.get(entry.mechanic)
    if (!template) {
      throw new Error(`Cards structured source mechanic ${entry.mechanic} is missing mastery template data.`)
    }

    return buildCardMasteryRelationChunk(entry, template, cardsEntry.data_source)
  })

  const milestoneRelationChunks = cardEntries
    .map(entry => buildMilestoneRelationChunk(entry, cardsEntry.data_source))
    .filter((chunk): chunk is KBChunkRecord => chunk !== null)

  const interactionRelationChunks = cardEntries
    .map(entry => buildInteractionRelationChunk(entry, cardsEntry.data_source))
    .filter((chunk): chunk is KBChunkRecord => chunk !== null)

  return [
    ...systemChunks,
    buildRelationalKbChunk({
      chunk_id: 'cards_locking_bosses_fleet_01',
      source: 'Cards Structured Reference',
      section: 'Cards',
      topic: 'Card Locking with Bosses and Fleet Enemies',
      title: 'Card Locking with Bosses and Fleet Enemies',
      disambiguation: 'This chunk is about the interaction between Card Locking, Bosses, and Fleet Enemies, not the individual mechanics. It is not about slot costs, rarity odds, or unrelated enemy mechanics.',
      data_source: cardsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Card Locking', 'Bosses', 'Fleet Enemies'],
      interaction_type: 'conditional',
      interaction_summary: 'Bosses and Fleet Enemies force Card Locking until they are cleared.',
      tags: ['cards', 'locking', 'bosses', 'fleet enemies'],
      paragraphs: [
        'Card Locking becomes universal when Bosses or Fleet Enemies are alive.',
        'While Bosses or Fleet Enemies remain on the field, Card Locking prevents card swaps and removals.',
        'Once Bosses and Fleet Enemies are cleared, normal Card Locking rules revert to the locked-card set instead of the full-loadout lock.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'cards_mastery_equipped_cards_01',
      source: 'Cards Structured Reference',
      section: 'Cards',
      topic: 'Card Mastery Unlock with Equipped Cards',
      title: 'Card Mastery Unlock with Equipped Cards',
      disambiguation: 'This chunk is about the interaction between Card Mastery Unlock and Equipped Cards, not the individual mechanics. It is not about card draw odds, slot purchases, or unrelated upgrade systems.',
      data_source: cardsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Card Mastery Unlock', 'Equipped Cards'],
      interaction_type: 'conditional',
      interaction_summary: 'A card mastery only applies when Card Mastery Unlock is available and the mastered card is one of the Equipped Cards.',
      tags: ['cards', 'mastery', 'equipped cards'],
      paragraphs: [
        'Card Mastery Unlock enables per-card mastery progression, but the mastery effect still depends on Equipped Cards.',
        'A mastered card only contributes its mastery bonus when that card is one of the Equipped Cards for the run.',
        'This makes Equipped Cards the live gate for mastery effects even after Card Mastery Unlock has been achieved.',
      ],
    }),
    ...cardAtomicChunks,
    ...masteryRelationChunks,
    ...milestoneRelationChunks,
    ...interactionRelationChunks,
  ]
}
