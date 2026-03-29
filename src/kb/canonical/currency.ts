import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import { loadCurrencySourceDocument } from './currencySource'

type SystemSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

const SYSTEM_SPECS: SystemSpec[] = [
  { mechanic: 'Currencies', chunkId: 'currency_overview_01', title: 'Currency Overview', tags: ['currency', 'economy', 'overview'] },
  { mechanic: 'Cash', chunkId: 'currency_cash_01', title: 'Cash', tags: ['currency', 'cash', 'run economy'] },
  { mechanic: 'Coins', chunkId: 'currency_coins_01', title: 'Coins', tags: ['currency', 'coins', 'progression'] },
  { mechanic: 'Gems', chunkId: 'currency_gems_01', title: 'Gems', tags: ['currency', 'gems', 'premium'] },
  { mechanic: 'Power Stones', chunkId: 'currency_power_stones_01', title: 'Power Stones', tags: ['currency', 'power stones', 'ultimate weapons'] },
  { mechanic: 'Medals', chunkId: 'currency_medals_01', title: 'Medals', tags: ['currency', 'medals', 'events'] },
  { mechanic: 'Elite Cells', chunkId: 'currency_elite_cells_01', title: 'Elite Cells', tags: ['currency', 'elite cells', 'labs'] },
  { mechanic: 'Keys', chunkId: 'currency_keys_01', title: 'Keys', tags: ['currency', 'keys', 'vault'] },
  { mechanic: 'Bits', chunkId: 'currency_bits_01', title: 'Bits', tags: ['currency', 'bits', 'guilds'] },
  { mechanic: 'Tokens', chunkId: 'currency_tokens_01', title: 'Tokens', tags: ['currency', 'tokens', 'guilds'] },
  { mechanic: 'Module Currency', chunkId: 'currency_module_01', title: 'Module Currency', tags: ['currency', 'modules', 'shards'] },
]

function buildOverviewParagraphs(): string[] {
  const sourceDocument = loadCurrencySourceDocument()
  return [
    ...sourceDocument.overviewFacts,
    ...sourceDocument.definitions.map(definition => `${definition.name}: ${definition.summary} Persistence: ${definition.persistence}.`),
  ]
}

function buildCashParagraphs(): string[] {
  const sourceDocument = loadCurrencySourceDocument()
  const enemyValueSummary = sourceDocument.cashEnemyValueRules
    .map(rule => `Wave ${rule.startWave}${rule.endWaveInclusive ? `-${rule.endWaveInclusive}` : '+'}: +${rule.cashIncreasePerStep} cash every ${rule.waveStep} waves`)
    .join('; ')

  return [
    'Cash is the temporary in-run currency used for buying upgrades during the active run.',
    `Enemy base-cash scaling: ${enemyValueSummary}.`,
    ...sourceDocument.cashWaveFlowFacts,
    ...sourceDocument.cashImprovementFacts,
    ...sourceDocument.cashEnhancementFacts,
  ]
}

function buildCoinsParagraphs(): string[] {
  const sourceDocument = loadCurrencySourceDocument()
  return [
    'Coins are the backbone progression currency for permanent upgrades.',
    ...sourceDocument.coinAcquisitionFacts,
    ...sourceDocument.coinImprovementFacts,
    ...sourceDocument.coinEnhancementFacts,
  ]
}

function buildGemsParagraphs(): string[] {
  const sourceDocument = loadCurrencySourceDocument()
  return [
    'Gems are a core premium currency used for both permanent unlocks and speed/convenience spending.',
    ...sourceDocument.gemAcquisitionFacts,
    ...sourceDocument.gemSpendingFacts,
  ]
}

function buildPowerStoneParagraphs(): string[] {
  return loadCurrencySourceDocument().powerStoneFacts
}

function buildMedalParagraphs(): string[] {
  return loadCurrencySourceDocument().medalFacts
}

function buildEliteCellParagraphs(): string[] {
  const sourceDocument = loadCurrencySourceDocument()
  const highTierRows = sourceDocument.eliteCellTierRows
    .map(row => `Tier ${row.tier}: ${row.minimumCells}-${row.maximumCells} cells, average ${row.averageCells}${row.averageIncreaseFromPriorPercent !== null ? `, +${row.averageIncreaseFromPriorPercent}% from prior average` : ''}`)
    .join('; ')

  return [
    ...sourceDocument.eliteCellTierFacts,
    `Tier 14-21 base elite-cell rows: ${highTierRows}.`,
    ...sourceDocument.eliteCellImprovementFacts,
  ]
}

function buildKeysParagraphs(): string[] {
  return loadCurrencySourceDocument().keyFacts
}

function buildBitsParagraphs(): string[] {
  return loadCurrencySourceDocument().bitFacts
}

function buildTokensParagraphs(): string[] {
  return loadCurrencySourceDocument().tokenFacts
}

function buildModuleCurrencyParagraphs(): string[] {
  return loadCurrencySourceDocument().moduleCurrencyFacts
}

function buildAtomicParagraphs(mechanic: string): string[] {
  switch (mechanic) {
    case 'Currencies':
      return buildOverviewParagraphs()
    case 'Cash':
      return buildCashParagraphs()
    case 'Coins':
      return buildCoinsParagraphs()
    case 'Gems':
      return buildGemsParagraphs()
    case 'Power Stones':
      return buildPowerStoneParagraphs()
    case 'Medals':
      return buildMedalParagraphs()
    case 'Elite Cells':
      return buildEliteCellParagraphs()
    case 'Keys':
      return buildKeysParagraphs()
    case 'Bits':
      return buildBitsParagraphs()
    case 'Tokens':
      return buildTokensParagraphs()
    case 'Module Currency':
      return buildModuleCurrencyParagraphs()
    default:
      return []
  }
}

export function buildCurrencyCanonicalKbChunks(): KBChunkRecord[] {
  const currencyEntry = getRequiredNamingRegistryEntryBySource('currency', 'currency')

  const systemChunks = SYSTEM_SPECS.map(spec => {
    const namingEntry = spec.mechanic === 'Currencies'
      ? currencyEntry
      : getRequiredNamingRegistryEntryBySource('currency', spec.mechanic)

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'Currency Platform Reference',
      section: 'Currency',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about unrelated shop pages, UI formatting, or non-game currencies outside the Tower economy.`,
      data_source: namingEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Currencies',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: buildAtomicParagraphs(spec.mechanic),
    })
  })

  return [
    ...systemChunks,
    buildRelationalKbChunk({
      chunk_id: 'currency_cash_enhancement_golden_tower_01',
      source: 'Currency Platform Reference',
      section: 'Currency',
      topic: 'Cash with Cash Bonus Enhancement and Golden Tower',
      title: 'Cash with Cash Bonus Enhancement and Golden Tower',
      disambiguation: 'This chunk is about the interaction between Cash, Cash Bonus Enhancement, and Golden Tower, not the individual mechanics. It is not about coin-only farming, unrelated utility stats, or generic run advice.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('currency', 'Cash').data_source,
        getRequiredNamingRegistryEntryBySource('workshop_enhancements', 'WSP_CASH_BONUS').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Cash', 'Cash Bonus Enhancement', 'Golden Tower'],
      interaction_type: 'multiplicative',
      interaction_summary: 'Cash flow is improved both by Workshop Enhancement support scaling and by Golden Tower activation windows, so run cash is shaped by permanent utility growth plus temporary income windows.',
      tags: ['currency', 'cash', 'workshop enhancements', 'golden tower'],
      paragraphs: [
        'Cash Bonus Enhancement is not only a visible cash multiplier; it also raises Cash / Wave and Interest / Wave support values as part of the same upgrade path.',
        'Golden Tower then multiplies kill-based income during activation windows, making it one of the major temporary run-income spikes for cash flow.',
        'Taken together, permanent enhancement scaling and Ultimate Weapon income windows determine how quickly late-run cash can snowball.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'currency_coins_tiers_themes_enhancement_01',
      source: 'Currency Platform Reference',
      section: 'Currency',
      topic: 'Coins with Tier Coin Bonus, Theme Passive Coin Bonus, and Coin Bonus Enhancement',
      title: 'Coins with Tier Coin Bonus, Theme Passive Coin Bonus, and Coin Bonus Enhancement',
      disambiguation: 'This chunk is about the interaction between Coins, Tier Coin Bonus, Theme Passive Coin Bonus, and Coin Bonus Enhancement, not the individual mechanics. It is not about cash flow, event prices, or unrelated cosmetic effects.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('currency', 'Coins').data_source,
        getRequiredNamingRegistryEntryBySource('tiers', 'Tier Coin Bonus').data_source,
        getRequiredNamingRegistryEntryBySource('themes', 'Theme Passive Coin Bonus').data_source,
        getRequiredNamingRegistryEntryBySource('workshop_enhancements', 'WSP_COIN_BONUS').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Coins', 'Tier Coin Bonus', 'Theme Passive Coin Bonus', 'Coin Bonus Enhancement'],
      interaction_type: 'multiplicative',
      interaction_summary: 'Coin farming is shaped by multiple permanent multipliers at once: tier selection, owned-theme bonus, and Coin Bonus Enhancement all stack into the long-term coin economy.',
      tags: ['currency', 'coins', 'tiers', 'themes', 'workshop enhancements'],
      paragraphs: [
        'Tier Coin Bonus determines the base economy pressure-reward tradeoff for a run, while Theme Passive Coin Bonus adds additive category ownership value outside the run itself.',
        'Coin Bonus Enhancement further increases the coin economy and is called out in the source as effectively squared because it affects both tier bonus and Coins / Kill.',
        'That means coin efficiency is never one slider; it is the result of tier choice, owned passive multipliers, and permanent enhancement scaling working together.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'currency_gems_tournaments_labs_01',
      source: 'Currency Platform Reference',
      section: 'Currency',
      topic: 'Gems with Tournaments and Labs',
      title: 'Gems with Tournaments and Labs',
      disambiguation: 'This chunk is about the interaction between Gems, Tournaments, and Labs, not the individual mechanics. It is not about module shards, event medals, or unrelated reset costs.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('currency', 'Gems').data_source,
        getRequiredNamingRegistryEntryBySource('tournaments', 'Tournament Rewards').data_source,
        getRequiredNamingRegistryEntryBySource('labs', 'labs').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Gems', 'Tournament Rewards', 'Lab Rushing'],
      interaction_type: 'cross_system',
      interaction_summary: 'Tournaments are one recurring Gems source, while Labs are one of the biggest Gems sinks because Gems can rush research timers and buy additional lab capacity.',
      tags: ['currency', 'gems', 'tournaments', 'labs'],
      paragraphs: [
        'Tournament Rewards are one of the recurring non-store sources of Gems.',
        'On the spending side, Gems are heavily tied to Labs through lab-slot unlocks and Lab Rushing, which converts Gems directly into faster permanent progress.',
        'That source-and-sink pairing is why Gems sit at the center of both competitive rewards and long-term account acceleration.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'currency_power_stones_tournaments_events_01',
      source: 'Currency Platform Reference',
      section: 'Currency',
      topic: 'Power Stones with Tournaments and Events',
      title: 'Power Stones with Tournaments and Events',
      disambiguation: 'This chunk is about the interaction between Power Stones, Tournaments, and Events, not the individual mechanics. It is not about gems, guild currencies, or unrelated upgrade menus.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('currency', 'Power Stones').data_source,
        getRequiredNamingRegistryEntryBySource('tournaments', 'Tournament Rewards').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'events').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Power Stones', 'Tournament Rewards', 'Event Shop Currency Purchases'],
      interaction_type: 'cross_system',
      interaction_summary: 'Power Stones mainly enter the account from Tournaments, but Events also provide an exchange path that turns medals into additional stone income.',
      tags: ['currency', 'power stones', 'tournaments', 'events'],
      paragraphs: [
        'Tournament rewards are the main recurring Power Stone source and therefore the main progression driver for Ultimate Weapons.',
        'Events add a second route by letting medals be exchanged into stones through Event Shop currency purchases.',
        'That makes Power Stones a cross-system currency even though Tournaments remain the dominant source in normal progression.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'currency_medals_events_shop_01',
      source: 'Currency Platform Reference',
      section: 'Currency',
      topic: 'Medals with Events and Event Shop',
      title: 'Medals with Events and Event Shop',
      disambiguation: 'This chunk is about the interaction between Medals, Events, and Event Shop, not the individual mechanics. It is not about guild tokens, tournament keys, or unrelated reward ladders.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('currency', 'Medals').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'events').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Medals', 'Events', 'Event Shop'],
      interaction_type: 'conditional',
      interaction_summary: 'Events generate Medals through missions and weekly reward sources, and Event Shop is the place where those Medals are converted into lasting account value.',
      tags: ['currency', 'medals', 'events', 'shop'],
      paragraphs: [
        'Medals originate inside the Events system rather than as a free-standing global currency.',
        'The Event Shop is the sink that turns those medals into stones, gems, shards, themes, music, bots, and rerun relics.',
        'Because medals do not expire, Events determine income cadence while the Event Shop determines when that saved value is actually spent.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'currency_elite_cells_labs_enhancement_01',
      source: 'Currency Platform Reference',
      section: 'Currency',
      topic: 'Elite Cells with Labs and Cells / Kill Bonus Enhancement',
      title: 'Elite Cells with Labs and Cells / Kill Bonus Enhancement',
      disambiguation: 'This chunk is about the interaction between Elite Cells, Labs, and Cells / Kill Bonus Enhancement, not the individual mechanics. It is not about gem rushing, ordinary coins, or unrelated workshop categories.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('currency', 'Elite Cells').data_source,
        getRequiredNamingRegistryEntryBySource('labs', 'labs').data_source,
        getRequiredNamingRegistryEntryBySource('workshop_enhancements', 'WSP_CELLS_PER_KILL_BONUS').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Elite Cells', 'Lab Boosting', 'Cells / Kill Bonus Enhancement'],
      interaction_type: 'scaling',
      interaction_summary: 'Elite Cells are spent by Lab Boosting, and the Workshop cell enhancement increases how many cells a farming run can return before those boosts are purchased.',
      tags: ['currency', 'elite cells', 'labs', 'workshop enhancements'],
      paragraphs: [
        'Lab Boosting is the primary Elite Cell sink and turns stored cells into temporary research-speed multipliers.',
        'Cells / Kill Bonus Enhancement raises elite-cell income on the farming side, which changes how quickly the player can sustain repeated lab boosts.',
        'This creates a direct loop between run farming efficiency and the lab-speed economy built on Elite Cells.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'currency_bits_tokens_guilds_01',
      source: 'Currency Platform Reference',
      section: 'Currency',
      topic: 'Bits and Tokens with Guilds',
      title: 'Bits and Tokens with Guilds',
      disambiguation: 'This chunk is about the interaction between Bits, Tokens, and Guilds, not the individual mechanics. It is not about event medals, tournament placements, or unrelated tracker state.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('currency', 'Bits').data_source,
        getRequiredNamingRegistryEntryBySource('currency', 'Tokens').data_source,
        getRequiredNamingRegistryEntryBySource('guilds', 'guilds').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Bits', 'Tokens', 'Guilds'],
      interaction_type: 'cross_system',
      interaction_summary: 'Tokens are the Guild Shop currency, while Bits are one of the resources obtained through guild reward and shop systems and then spent on guardian progression.',
      tags: ['currency', 'bits', 'tokens', 'guilds'],
      paragraphs: [
        'Tokens come from Weekly Challenge boxes and Guild Reward Chests and are then spent in the Guild Shop.',
        'Bits are part of that same guild economy, with the source text listing both chest-derived bits and seasonal Guild Shop bit purchases.',
        'In practice, Tokens are the routing currency for guild spending while Bits are one of the progression outputs that feed guardian chip upgrades.',
      ],
    }),
  ]
}
