import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import { loadThemesSourceDocument } from './themesSource'

type SystemSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

const SYSTEM_SPECS: SystemSpec[] = [
  { mechanic: 'Themes', chunkId: 'themes_overview_01', title: 'Themes Overview', tags: ['themes', 'skins', 'cosmetics'] },
  { mechanic: 'Theme Categories', chunkId: 'themes_categories_01', title: 'Theme Categories', tags: ['themes', 'categories', 'cosmetics'] },
  { mechanic: 'Theme Passive Coin Bonus', chunkId: 'themes_passive_coin_bonus_01', title: 'Theme Passive Coin Bonus', tags: ['themes', 'coins', 'formula'] },
  { mechanic: 'Theme Songs', chunkId: 'themes_songs_01', title: 'Theme Songs', tags: ['themes', 'songs', 'audio'] },
  { mechanic: 'Theme Relic Menu', chunkId: 'themes_relic_menu_01', title: 'Theme Relic Menu', tags: ['themes', 'relics', 'ui'] },
]

function buildOverviewParagraphs(): string[] {
  const sourceDocument = loadThemesSourceDocument()
  const categoryLabels = sourceDocument.categories.map(category => category.label).join(', ')

  return [
    ...sourceDocument.overviewFacts,
    `The four main passive-bonus theme categories are ${categoryLabels}.`,
  ]
}

function buildCategoryParagraphs(): string[] {
  const sourceDocument = loadThemesSourceDocument()

  return sourceDocument.categories.map(category =>
    `${category.label}: unlock sources ${category.unlockSources.join(' and ')}; passive coin bonus per owned ${category.passiveCoinBonusPerOwnedDisplay}.`)
}

function buildPassiveBonusParagraphs(): string[] {
  const sourceDocument = loadThemesSourceDocument()
  const termSummary = sourceDocument.passiveFormulaTerms
    .map(term => `${term.label} = ${term.coefficient.toFixed(3)}`)
    .join(', ')

  return [
    `${sourceDocument.passiveFormula}.`,
    ...sourceDocument.passiveFormulaFacts,
    `Formula coefficients by category are ${termSummary}.`,
  ]
}

function buildSongParagraphs(): string[] {
  return loadThemesSourceDocument().songFacts
}

function buildRelicMenuParagraphs(): string[] {
  return loadThemesSourceDocument().relicMenuFacts
}

function buildAtomicParagraphs(mechanic: string): string[] {
  switch (mechanic) {
    case 'Themes':
      return buildOverviewParagraphs()
    case 'Theme Categories':
      return buildCategoryParagraphs()
    case 'Theme Passive Coin Bonus':
      return buildPassiveBonusParagraphs()
    case 'Theme Songs':
      return buildSongParagraphs()
    case 'Theme Relic Menu':
      return buildRelicMenuParagraphs()
    default:
      return []
  }
}

export function buildThemesCanonicalKbChunks(): KBChunkRecord[] {
  const themesEntry = getRequiredNamingRegistryEntryBySource('themes', 'themes')

  const systemChunks = SYSTEM_SPECS.map(spec => {
    const namingEntry = spec.mechanic === 'Themes'
      ? themesEntry
      : getRequiredNamingRegistryEntryBySource('themes', spec.mechanic)

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'Themes Platform Reference',
      section: 'Themes',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about generic site color themes, chart styling, or unrelated cosmetic systems outside the game theme menu.`,
      data_source: namingEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Themes',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: buildAtomicParagraphs(spec.mechanic),
    })
  })

  return [
    ...systemChunks,
    buildRelationalKbChunk({
      chunk_id: 'themes_categories_passive_bonus_01',
      source: 'Themes Platform Reference',
      section: 'Themes',
      topic: 'Theme Categories with Theme Passive Coin Bonus',
      title: 'Theme Categories with Theme Passive Coin Bonus',
      disambiguation: 'This chunk is about the interaction between Theme Categories and Theme Passive Coin Bonus, not the individual mechanics. It is not about event medal prices, guild token costs, or unrelated multiplier systems.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('themes', 'Theme Categories').data_source,
        getRequiredNamingRegistryEntryBySource('themes', 'Theme Passive Coin Bonus').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Theme Categories', 'Theme Passive Coin Bonus'],
      interaction_type: 'additive',
      interaction_summary: 'Each owned theme category contributes its own additive coefficient into the total theme passive coin multiplier.',
      tags: ['themes', 'coins', 'categories', 'formula'],
      paragraphs: [
        'Theme passive coin bonus is not a single flat ownership count across all cosmetics.',
        'Instead, tower, background, menu, and guardian themes each contribute their own additive coefficient to the total theme multiplier.',
        'That is why owning more background themes moves the multiplier faster than tower themes, while menu and guardian themes share the same per-owned contribution.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'themes_sources_milestones_events_guilds_01',
      source: 'Themes Platform Reference',
      section: 'Themes',
      topic: 'Themes with Milestones, Event Themes, and Guild Themes',
      title: 'Themes with Milestones, Event Themes, and Guild Themes',
      disambiguation: 'This chunk is about the interaction between Themes, Milestones, Event Themes, and Guild Themes, not the individual mechanics. It is not about relic menus, bot shops, or unrelated unlock trees.',
      data_source: [
        themesEntry.data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'Milestones').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'events').data_source,
        getRequiredNamingRegistryEntryBySource('guilds', 'guilds').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Themes', 'Milestones', 'Event Themes', 'Guild Themes'],
      interaction_type: 'conditional',
      interaction_summary: 'Theme ownership comes from multiple source systems: Milestones supply tower-theme unlocks, Events supply event-bought cosmetics, and Guilds supply guild-purchased menu and guardian cosmetics.',
      tags: ['themes', 'milestones', 'events', 'guilds', 'cosmetics'],
      paragraphs: [
        'Themes are not sourced from one single progression path.',
        'Tower themes can come from Milestones at wave 2500 on each tier as well as event purchases, background themes are sold through events, and menu plus guardian themes are purchased through guild systems.',
        'Because the passive multiplier counts owned themes regardless of whether they are equipped, these source systems all feed the same long-term theme-bonus pool.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'themes_songs_event_songs_01',
      source: 'Themes Platform Reference',
      section: 'Themes',
      topic: 'Theme Songs with Event Songs',
      title: 'Theme Songs with Event Songs',
      disambiguation: 'This chunk is about the interaction between Theme Songs and Event Songs, not the individual mechanics. It is not about relic inventory, event relic thresholds, or unrelated audio settings outside the game theme menu.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('themes', 'Theme Songs').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'events').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Theme Songs', 'Event Songs'],
      interaction_type: 'cross_system',
      interaction_summary: 'Event Songs are an acquisition category, while Theme Songs is the in-menu playback surface that lets owned songs be selected during rounds.',
      tags: ['themes', 'songs', 'events', 'audio'],
      paragraphs: [
        'Theme Songs describes the song submenu inside the theme menu where the player chooses playback and can mute game sounds.',
        'Event Songs is the purchase-side system that adds songs to the account from the event shop.',
        'Taken together, events handle song acquisition while the themes menu handles song selection and playback behavior.',
      ],
    }),
  ]
}
