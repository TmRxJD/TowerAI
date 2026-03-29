import {
  BOT_UPGRADES_DATA,
  MAIN_SUB_COSTS,
  MODULE_COIN_COSTS,
  MODULE_SHARD_COSTS,
  MODULE_SUBSTAT_CANONICAL_DATA,
  WSP_WORKSHOP_COST_LEVELS,
  buildThornsBaseChart,
  buildThornsWallChart,
  computeGoldBotDeathWaveRows,
  getLevelCapForRarity,
  normalizeBotStats,
  uwPlusUnlockCostsByOwnedCount,
  uwPlusUnlockTotal,
  uwPlusUpgradeSections,
  uwStoneChartData,
} from '@tmrxjd/platform/tools'

import { buildAtomicKbChunk, type KBChunkRecord } from './shared'

type NumericStepSummary = {
  kind: 'constant'
  delta: number
} | {
  kind: 'irregular'
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0'
  const abs = Math.abs(value)
  if (abs >= 1e15) return value.toExponential(2)
  if (abs >= 1e6) {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(value)
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
}

function parseMetricValue(value: string): { numeric: number | null; unit: string } {
  const text = String(value || '').trim()
  if (!text) return { numeric: null, unit: '' }
  const numeric = Number.parseFloat(text.replace(/[^\d.-]/g, ''))
  return {
    numeric: Number.isFinite(numeric) ? numeric : null,
    unit: text.replace(/[\d.-]/g, '').trim(),
  }
}

function summarizeSteps(values: number[]): NumericStepSummary {
  if (values.length < 2) return { kind: 'irregular' }
  const deltas = values.slice(1).map((value, index) => Number((value - values[index]).toFixed(6)))
  const first = deltas[0]
  if (deltas.every(delta => Math.abs(delta - first) < 1e-6)) {
    return { kind: 'constant', delta: first }
  }
  return { kind: 'irregular' }
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function buildUwPlusSectionIdentity(section: (typeof uwPlusUpgradeSections)[number]): { slug: string; label: string } {
  const normalizedTitle = section.title.replace(/\s+/g, ' ').trim()
  const titleSlug = slugify(normalizedTitle)
  const normalizedUpgradeNames = section.upgrades
    .map(upgrade => upgrade.name.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const uniqueNameSuffix = normalizedUpgradeNames.length > 0
    ? normalizedUpgradeNames.join(' / ')
    : normalizedTitle

  return {
    slug: `${titleSlug}_${slugify(uniqueNameSuffix)}`,
    label: normalizedUpgradeNames.length > 0
      ? `${normalizedTitle} (${uniqueNameSuffix})`
      : normalizedTitle,
  }
}

function buildUwLabAssociationParagraph(weaponName: string): string {
  switch (weaponName) {
    case 'Golden Tower':
      return 'Golden Tower has an explicit lab association in the deterministic uptime model: GT Duration lab adds directly to effective Golden Tower duration, and tournament BC lab can reduce that effective duration when the BC branch is enabled.'
    case 'Chrono Field':
      return 'Chrono Field has an explicit lab association in the deterministic uptime model: CF Duration lab adds directly to effective Chrono Field duration, and tournament BC lab can reduce that effective duration when the BC branch is enabled.'
    case 'Black Hole':
      return 'Black Hole does not have its own standalone duration-lab field in the current deterministic uptime model, but tournament BC lab can still reduce effective Black Hole duration when the BC branch is enabled.'
    case 'Poison Swamp':
      return 'Poison Swamp does not have its own standalone duration-lab field in the current deterministic uptime model, but tournament BC lab can still reduce effective Poison Swamp duration when the BC branch is enabled.'
    case 'Death Wave':
      return 'Death Wave does not currently expose a separate dedicated lab field in the raw stone-ladder dataset. Its effective uptime still comes from the broader deterministic uptime formula layer instead of from the stone ladder alone.'
    default:
      return `${weaponName} does not currently expose a separate lab modifier in the dedicated stone-ladder dataset. If the site applies an effective-value modifier elsewhere, that modifier lives outside the raw ladder and should be treated as a separate formula layer.`
  }
}

function buildBotDatasetChunks(): KBChunkRecord[] {
  return BOT_UPGRADES_DATA.map(bot => {
    const normalizedStats = normalizeBotStats(bot)
    const medalMin = bot.costs[1] ?? 0
    const medalMax = bot.costs[bot.costs.length - 1] ?? 0
    const statSummaries = normalizedStats.map(stat => {
      const rows = stat.levels.filter(level => level.value !== '')
      const first = rows[0]
      const last = rows[rows.length - 1]
      const firstMetric = parseMetricValue(first?.value ?? '')
      const values = rows
        .map(row => parseMetricValue(row.value).numeric)
        .filter((value): value is number => value !== null)
      const steps = summarizeSteps(values)
      const stepText = steps.kind === 'constant'
        ? `The visible ${stat.name} ladder moves by ${steps.delta >= 0 ? '+' : ''}${formatNumber(steps.delta)}${firstMetric.unit || ''} per level.`
        : `The visible ${stat.name} ladder is irregular and should be treated as a lookup table rather than a fixed-step formula.`

      return `${stat.name} runs from level ${first?.level ?? 0} through ${last?.level ?? 0}, starting at ${first?.value ?? 'n/a'} and ending at ${last?.value ?? 'n/a'}. ${stepText}`
    })

    return buildAtomicKbChunk({
      chunk_id: `trackerai_bots_dataset_${bot.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_01`,
      source: 'Bot Calculator Deterministic Dataset Source',
      section: 'TrackerAI',
      topic: `${bot.label} deterministic stat ladder`,
      title: `Bot Calculator Dataset Summary: ${bot.label}`,
      disambiguation: `This chunk is about the deterministic medal and stat ladders behind ${bot.label} in the bot calculator, not generic strategy advice or tracker workflow prose.`,
      data_source: ['@tmrxjd/platform/tools/bots.ts'],
      mechanics: ['Bot Calculator Outputs', `${bot.label} stat ladder`],
      tags: ['trackerai', 'bots', 'calculator', 'dataset summary', 'levels', 'medals', bot.name.toLowerCase()],
      paragraphs: [
        `${bot.label} uses the shared bot medal ladder from level 1 cost ${formatNumber(medalMin)} through level ${bot.costs.length - 1} cost ${formatNumber(medalMax)}. The shared ladder exposes levels 0 through ${bot.costs.length - 1}.`,
        ...statSummaries,
        bot.labInfo.length > 0
          ? `${bot.label} also has deterministic lab modifiers: ${bot.labInfo.map(entry => `${entry.name} lab max level ${entry.maxLevel} with total adjustment ${entry.maxValue}`).join('; ')}.`
          : `${bot.label} has no separate deterministic lab modifier rows in the shared dataset.`,
      ],
    })
  })
}

function buildWorkshopDatasetChunks(): KBChunkRecord[] {
  const grouped = new Map<object, string[]>()
  for (const [key, levels] of Object.entries(WSP_WORKSHOP_COST_LEVELS)) {
    const existing = grouped.get(levels) ?? []
    existing.push(key)
    grouped.set(levels, existing)
  }

  return Array.from(grouped.entries()).map(([levels, keys], index) => {
    const numericLevels = Object.keys(levels as Record<number, number>).map(Number).sort((left, right) => left - right)
    const firstLevel = numericLevels[0] ?? 0
    const lastLevel = numericLevels[numericLevels.length - 1] ?? 0
    const firstCost = Number((levels as Record<number, number>)[firstLevel] ?? 0)
    const lastCost = Number((levels as Record<number, number>)[lastLevel] ?? 0)

    return buildAtomicKbChunk({
      chunk_id: `trackerai_workshop_dataset_group_${String(index + 1).padStart(2, '0')}`,
      source: 'Workshop Calculator Deterministic Dataset Source',
      section: 'TrackerAI',
      topic: `Workshop cost ladder group ${index + 1}`,
      title: `Workshop Calculator Dataset Summary: ${keys.join(', ')}`,
      disambiguation: 'This chunk is about the deterministic workshop cost ladder group used by the workshop calculator, not general tracker guidance or a full workshop strategy guide.',
      data_source: ['@tmrxjd/platform/tools/workshop-costs.ts', '@tmrxjd/platform/tools/workshop.ts'],
      mechanics: ['Workshop Calculator Outputs', 'Workshop cost ladder'],
      tags: ['trackerai', 'workshop', 'calculator', 'dataset summary', 'costs', 'levels'],
      paragraphs: [
        `This workshop calculator ladder is shared by ${keys.join(', ')}. It exposes deterministic base costs from level ${firstLevel} through level ${lastLevel}.`,
        `The base cost starts at ${formatNumber(firstCost)} and ends at ${formatNumber(lastCost)}. These costs are not a fixed-step ladder and should be treated as a compounding lookup table.`,
        'When the workshop calculator renders purchase rows, each purchased level also carries a deterministic bonus multiplier of 1 + level * 0.01, while total discount percent is clamped between 0 and 100 before discounted costs are rounded.',
      ],
    })
  })
}

function buildModuleDatasetChunks(): KBChunkRecord[] {
  const moduleMaxLevel = MODULE_SHARD_COSTS.length + 1
  const moduleCostChunk = buildAtomicKbChunk({
    chunk_id: 'trackerai_modules_dataset_cost_ladders_01',
    source: 'Module Calculator Deterministic Dataset Source',
    section: 'TrackerAI',
    topic: 'Module shard and coin cost ladders',
    title: 'Module Calculator Dataset Summary: Main Cost Ladders',
    disambiguation: 'This chunk is about the deterministic shard and coin ladders used by the module calculator, not tracker workflow guidance or assist substat prose.',
    data_source: ['@tmrxjd/platform/tools/module-costs.ts'],
    mechanics: ['Module Calculator Module Cost Tab'],
    tags: ['trackerai', 'modules', 'calculator', 'dataset summary', 'shards', 'coins', 'levels'],
    paragraphs: [
      `The module calculator exposes deterministic shard and coin costs for levels 1 through ${moduleMaxLevel}. The shard ladder begins with upgrade cost ${formatNumber(MODULE_SHARD_COSTS[0] ?? 0)} and ends with ${formatNumber(MODULE_SHARD_COSTS[MODULE_SHARD_COSTS.length - 1] ?? 0)}.`,
      `The coin ladder begins with upgrade cost ${formatNumber(MODULE_COIN_COSTS[0] ?? 0)} and ends with ${formatNumber(MODULE_COIN_COSTS[MODULE_COIN_COSTS.length - 1] ?? 0)}. Both ladders are lookup tables, not fixed-step arithmetic progressions.`,
      `Main and sub module reroll-style costs also expose a deterministic auxiliary ladder from ${formatNumber(MAIN_SUB_COSTS[0] ?? 0)} through ${formatNumber(MAIN_SUB_COSTS[MAIN_SUB_COSTS.length - 1] ?? 0)} over ${MAIN_SUB_COSTS.length} entries, with a fixed +3 step between adjacent entries.`,
    ],
  })

  const substatChunks = Object.entries(MODULE_SUBSTAT_CANONICAL_DATA).map(([category, data]) => buildAtomicKbChunk({
    chunk_id: `trackerai_modules_dataset_substats_${category.toLowerCase()}_01`,
    source: 'Module Calculator Deterministic Dataset Source',
    section: 'TrackerAI',
    topic: `${category} module substats`,
    title: `Module Calculator Dataset Summary: ${data.title}`,
    disambiguation: `This chunk is about the canonical ${category} module substat values used by the site tools, not general module ranking advice.`,
    data_source: ['@tmrxjd/platform/tools/module-substats-data.ts'],
    mechanics: ['Module Tracker Equipped Tab', 'Module Calculator Assist Module Cost Tab'],
    tags: ['trackerai', 'modules', 'calculator', 'dataset summary', 'substats', category.toLowerCase()],
    paragraphs: [
      `${data.title} is a deterministic rarity ladder covering ${data.substats.length} substats. Available rarities are limited per substat and should be treated as canonical lookup values, not estimated ranges.`,
      ...data.substats.slice(0, 8).map(substat => `${substat.label} supports ${substat.availableRarities.join(', ')} with values ${substat.availableRarities.map(rarity => `${rarity} ${substat.valuesByRarity[rarity]}`).join(', ')}.`),
    ],
  }))

  const shardSplitterChunk = buildAtomicKbChunk({
    chunk_id: 'trackerai_modules_dataset_shard_splitter_01',
    source: 'Shard Splitter Deterministic Engine Source',
    section: 'TrackerAI',
    topic: 'Shard splitter search space',
    title: 'Module Calculator Dataset Summary: Shard Splitter Search Space',
    disambiguation: 'This chunk is about the deterministic shard-splitter engine inputs and hard caps, not general module build advice.',
    data_source: ['@tmrxjd/platform/tools/shard-splitter-engine.ts', '@tmrxjd/platform/tools/module-levels.ts'],
    mechanics: ['Module Calculator Shard Splitter and Effective Paths Tabs'],
    tags: ['trackerai', 'modules', 'calculator', 'dataset summary', 'shard splitter', 'caps'],
    paragraphs: [
      `Shard Splitter works on the same main module shard cost ladder that covers levels 1 through ${moduleMaxLevel}. It clamps shard discount to 0 through 30 and converts assist efficiency to a percentage between 0 and 100 before applying any assist bonus.`,
      `Primary and secondary module levels are always clamped to at least level 1 and at most the selected rarity cap. The current rarity caps are Rare ${getLevelCapForRarity('Rare')}, Epic ${getLevelCapForRarity('Epic')}, Legendary ${getLevelCapForRarity('Legendary')}, Mythic ${getLevelCapForRarity('Mythic')}, and Ancestral ${getLevelCapForRarity('Ancestral')}.`,
      'The engine scores split rows from deterministic primary and secondary target levels, remaining shards, and total effective bonus gain. These rows should be treated as search results over a fixed cost ladder rather than as free-form AI estimates.',
    ],
  })

  return [moduleCostChunk, ...substatChunks, shardSplitterChunk]
}

function buildThornsDatasetChunks(): KBChunkRecord[] {
  const baseRows = buildThornsBaseChart({})
  const wallRows = buildThornsWallChart({})
  const firstBase = baseRows[0]
  const lastBase = baseRows[baseRows.length - 1]
  const firstWall = wallRows[0]
  const lastWall = wallRows[wallRows.length - 1]

  return [
    buildAtomicKbChunk({
      chunk_id: 'trackerai_thorns_dataset_inputs_01',
      source: 'Thorns Calculator Deterministic Dataset Source',
      section: 'TrackerAI',
      topic: 'Thorns calculator input ranges',
      title: 'Thorns Calculator Dataset Summary: Input Domains',
      disambiguation: 'This chunk is about the deterministic input clamps behind the thorns calculator, not general thorns strategy advice.',
      data_source: ['@tmrxjd/platform/tools/thorns.ts'],
      mechanics: ['Thorns Calculator Main Inputs', 'Thorns Calculator Input Guardrails'],
      tags: ['trackerai', 'thorns', 'calculator', 'dataset summary', 'ranges', 'inputs'],
      paragraphs: [
        'The thorns calculator clamps baseThorns from 0 through 600, tier from 1 through 21, Plasma Cannon level from 0 through 7, Plasma Cannon Mastery level from 0 through 9, BC lab level from 0 through 10, BC reduction lab level from 0 through 20, PC reduction lab level from 0 through 20, and Heat Wave from 0 through 1000.',
        'Tournament tier is a categorical input limited to none, t11, t14, or t17. Plasma Cannon Mastery is hard-gated: if Plasma Cannon level is below 7 then mastery is forced to 0, and any non-zero mastery forces Plasma Cannon level to 7.',
        'These clamped inputs drive deterministic reduction multipliers and hit-to-kill tables. They should be treated as exact page guardrails, not approximate user tips.',
      ],
    }),
    buildAtomicKbChunk({
      chunk_id: 'trackerai_thorns_dataset_outputs_01',
      source: 'Thorns Calculator Deterministic Dataset Source',
      section: 'TrackerAI',
      topic: 'Thorns calculator chart windows',
      title: 'Thorns Calculator Dataset Summary: Output Windows',
      disambiguation: 'This chunk is about the deterministic output windows produced by the thorns calculator charts, not a general combat simulation summary.',
      data_source: ['@tmrxjd/platform/tools/thorns.ts'],
      mechanics: ['Thorns Calculator Dual Results Tables'],
      tags: ['trackerai', 'thorns', 'calculator', 'dataset summary', 'outputs', 'hits to kill'],
      paragraphs: [
        `The wall-thorns chart always exposes a fixed 20-row lookup from wall thorns ${firstWall?.wallThorns ?? 1} through ${lastWall?.wallThorns ?? 20}. Each row deterministically reports hits to kill for elite, fleet, elite with PC, boss, and boss with PC.`,
        `The base-thorns chart exposes a 20-row window beginning from the normalized base thorns value. With default inputs that window runs from ${firstBase?.baseThornsVal ?? 0} through ${lastBase?.baseThornsVal ?? 0}.`,
        'Both result tables are deterministic recalculations from the clamped inputs and should be treated as table lookups generated from exact formulas, not prose-only explanation.',
      ],
    }),
  ]
}

function buildUptimeDatasetChunks(): KBChunkRecord[] {
  const goldBotDwRows = computeGoldBotDeathWaveRows()
  const bestGoldBotDwRow = goldBotDwRows.reduce((best, row) => row.syncPercent > best.syncPercent ? row : best, goldBotDwRows[0])
  const worstGoldBotDwRow = goldBotDwRows.reduce((worst, row) => row.syncPercent < worst.syncPercent ? row : worst, goldBotDwRows[0])

  return [
    buildAtomicKbChunk({
      chunk_id: 'trackerai_uptime_dataset_sync_inputs_01',
      source: 'Uptime Calculator Deterministic Formula Source',
      section: 'TrackerAI',
      topic: 'Uptime sync input domains',
      title: 'Uptime Calculator Dataset Summary: Sync Input Domains',
      disambiguation: 'This chunk is about the explicit input domains that drive sync behavior in the uptime calculator, not a generic advice article about syncing.',
      data_source: ['@tmrxjd/platform/tools/uptime-core.ts'],
      mechanics: ['Uptime Calculator Grouped Input Panels', 'Uptime Calculator Results Table'],
      tags: ['trackerai', 'uptime', 'calculator', 'dataset summary', 'sync', 'input ranges'],
      paragraphs: [
        'The sync model has explicit input domains. MVN rarity is limited to Disabled, Epic, Legendary, Mythic, or Ancestral, and only Golden Tower, Death Wave, and Black Hole can be selected as MVN participants.',
        'Wave Accelerator level is clamped from 0 through 7. Package chance is clamped from 0 through 100 percent. Assist efficiency is clamped from 0 through 100 percent before any assist contribution is applied. Bot cooldown levels are clamped from 0 through 15.',
        'Golden Bot cooldown lab, Amplify Bot cooldown lab, Flame Bot cooldown lab, and Thunder Bot cooldown lab are each clamped to a maximum of 25. Golden Bot and Amplify Bot duration labs are each clamped to a maximum of 20.',
      ],
    }),
    buildAtomicKbChunk({
      chunk_id: 'trackerai_uptime_dataset_sync_rules_01',
      source: 'Uptime Calculator Deterministic Formula Source',
      section: 'TrackerAI',
      topic: 'Uptime sync rules',
      title: 'Uptime Calculator Dataset Summary: Sync Rules and Compression',
      disambiguation: 'This chunk is about the deterministic rules the uptime calculator uses to synchronize cooldowns, not a general build guide.',
      data_source: ['@tmrxjd/platform/tools/uptime-core.ts'],
      mechanics: ['Uptime Calculator Results Table', 'Uptime Calculator Activation Visualizer'],
      tags: ['trackerai', 'uptime', 'calculator', 'dataset summary', 'sync', 'mvn', 'compressor'],
      paragraphs: [
        'Multiverse Nexus is the dedicated sync bridge in the deterministic uptime model. When MVN is enabled, the calculator averages the reduced cooldowns of the selected GT, DW, and BH participants, applies an MVN rarity delta, bankers-rounds the result, and then assigns that shared cooldown back to the selected participants.',
        'The MVN rarity deltas are explicit: Epic adds 20 seconds, Legendary adds 10 seconds, Mythic adds 1 second, and Ancestral subtracts 10 seconds from the averaged cooldown. Disabled leaves each cooldown on its own path.',
        'Galaxy Compressor style package compression is also explicit. Compressor package seconds are Disabled 0, Epic 10, Legendary 13, Mythic 17, and Ancestral 20. The calculator uses those values with expected packages per wave and wave time to derive compressed effective cooldowns rather than assuming natural sync alone.',
      ],
    }),
    buildAtomicKbChunk({
      chunk_id: 'trackerai_uptime_dataset_cooldowns_01',
      source: 'Uptime Calculator Deterministic Formula Source',
      section: 'TrackerAI',
      topic: 'Uptime cooldown formulas',
      title: 'Uptime Calculator Dataset Summary: Effective Cooldowns',
      disambiguation: 'This chunk is about the deterministic cooldown formulas in the uptime calculator, not a generic ultimate-weapon guide.',
      data_source: ['@tmrxjd/platform/tools/uptime-core.ts'],
      mechanics: ['Uptime Calculator Workspace Overview'],
      tags: ['trackerai', 'uptime', 'calculator', 'dataset summary', 'cooldowns', 'formulas'],
      paragraphs: [
        'The uptime calculator treats effective cooldowns as deterministic formulas over stored base cooldowns, module cooldown reductions, assist efficiency, MVN averaging, wave timing, and package-compressor adjustments.',
        'Assist efficiency is clamped from 0 through 100 percent before any assist contribution is applied. Wave Accelerator level is limited to 0 through 7 and wave time is computed as wavesPerBoss * 33.5 * (1 - WA multiplier). Package chance is also clamped from 0 through 100 percent.',
        'Bot cooldown levels are clamped from 0 through 15. Golden Bot and Amplify Bot start from 120 seconds and lose 3 seconds per level plus cooldown-lab seconds to a floor of 50. Flame Bot starts from 75 seconds and loses 3 seconds per level plus cooldown-lab seconds to a floor of 5. Thunder Bot starts from 120 seconds and loses 3 seconds per level plus cooldown-lab seconds to a floor of 50.',
      ],
    }),
    buildAtomicKbChunk({
      chunk_id: 'trackerai_uptime_dataset_durations_01',
      source: 'Uptime Calculator Deterministic Formula Source',
      section: 'TrackerAI',
      topic: 'Uptime duration formulas',
      title: 'Uptime Calculator Dataset Summary: Durations and Uptime Windows',
      disambiguation: 'This chunk is about the deterministic duration and uptime formulas in the uptime calculator, not a general recommendation layer.',
      data_source: ['@tmrxjd/platform/tools/uptime-core.ts'],
      mechanics: ['Uptime Calculator Workspace Overview'],
      tags: ['trackerai', 'uptime', 'calculator', 'dataset summary', 'durations', 'formulas'],
      paragraphs: [
        'Golden Tower duration is computed from stored GT duration level plus GT Duration lab plus module duration bonuses, with tournament BC reductions subtracted when that branch is active. Chrono Field duration is computed from stored CF duration level plus CF Duration lab plus module duration bonuses, perk bonus, and the same BC reduction branch.',
        'Black Hole and Poison Swamp do not currently have separate dedicated duration-lab fields in the uptime model, but tournament BC lab can still reduce their effective durations when that branch is enabled.',
        'Death Wave duration is not free-form: the calculator converts wave count into time with (DW base waves level + DW quantity bonuses + perk) * 4 seconds. Smart Missiles duration converts quantity into uptime with (missile quantity / 5) * 2 seconds after quantity bonuses are applied.',
        'Golden Bot and Amplify Bot durations are deterministic 20 + 0.5 * level + 0.5 * lab seconds, while Thunder Bot duration is min(15, 5 + level). Spotlight uptime is computed from spotlight angle times spotlight quantity over 360 degrees and then capped at 100 percent.',
      ],
    }),
    buildAtomicKbChunk({
      chunk_id: 'trackerai_uptime_dataset_gold_bot_dw_sync_01',
      source: 'Gold Bot vs Death Wave Sync Deterministic Dataset Source',
      section: 'TrackerAI',
      topic: 'Gold Bot and Death Wave sync table',
      title: 'Uptime Calculator Dataset Summary: Gold Bot vs Death Wave Sync',
      disambiguation: 'This chunk is about the dedicated Gold Bot versus Death Wave sync dataset, not a generic coin-bot recommendation.',
      data_source: ['@tmrxjd/platform/tools/gold-bot-vs-death-wave-uptime-data.ts'],
      mechanics: ['Uptime Calculator Results Table', 'Gold Bot vs Death Wave sync'],
      tags: ['trackerai', 'uptime', 'calculator', 'dataset summary', 'sync', 'gold bot', 'death wave'],
      paragraphs: [
        'The dedicated Gold Bot versus Death Wave sync table covers Gold Bot cooldowns from 38 through 65 seconds and Death Wave offsets from 2 through 8 seconds. Each row returns a syncPercent over a 600 second horizon by comparing trigger times within a 1 second tolerance window.',
        `In the current deterministic dataset, the best visible sync row is Gold Bot ${bestGoldBotDwRow.gbCooldownSec}s with Death Wave offset ${bestGoldBotDwRow.deathWaveOffsetSec}s at ${bestGoldBotDwRow.syncPercent}% sync, while the weakest visible row is Gold Bot ${worstGoldBotDwRow.gbCooldownSec}s with Death Wave offset ${worstGoldBotDwRow.deathWaveOffsetSec}s at ${worstGoldBotDwRow.syncPercent}% sync.`,
        'This table should be treated as a dedicated sync helper: it exists so TrackerAI can answer overlap questions with explicit rows instead of hand-waving about “roughly synced” cooldowns.',
      ],
    }),
  ]
}

function buildUwDatasetChunks(): KBChunkRecord[] {
  const weaponChunks = Object.entries(uwStoneChartData).map(([weaponKey, weapon]) => {
    const statSummaries = weapon.stats.map(stat => {
      const first = stat.levels[0]
      const last = stat.levels[stat.levels.length - 1]
      const numericValues = stat.levels
        .map(level => parseMetricValue(String(level.value)).numeric)
        .filter((value): value is number => value !== null)
      const valueSteps = summarizeSteps(numericValues)
      const numericCosts = stat.levels
        .map(level => Number(level.cost))
        .filter(cost => Number.isFinite(cost) && cost > 0)
      const totalStoneCost = numericCosts.reduce((sum, cost) => sum + cost, 0)
      const stepText = valueSteps.kind === 'constant'
        ? `The visible ${stat.name} ladder moves by ${valueSteps.delta >= 0 ? '+' : ''}${formatNumber(valueSteps.delta)}${parseMetricValue(String(first?.value ?? '')).unit} per level where the dataset is populated.`
        : `The visible ${stat.name} ladder is irregular and should be treated as a lookup table instead of a fixed-step formula.`

      return `${stat.name} runs from level ${first?.level ?? 0} through ${last?.level ?? 0}, starting at ${first?.value ?? 'n/a'} and ending at ${last?.value ?? 'n/a'}. First paid upgrade cost is ${formatNumber(numericCosts[0] ?? 0)} and full visible ladder cost is ${formatNumber(totalStoneCost)} stones. ${stepText}`
    })

    return buildAtomicKbChunk({
      chunk_id: `trackerai_uw_dataset_${slugify(weaponKey)}_01`,
      source: 'Ultimate Weapons Calculator Deterministic Dataset Source',
      section: 'TrackerAI',
      topic: `${weapon.name} deterministic stone ladders`,
      title: `Ultimate Weapons Dataset Summary: ${weapon.name}`,
      disambiguation: `This chunk is about the dedicated deterministic ${weapon.name} stone ladders used by the site tools, not chart-renderer metadata or generic Ultimate Weapon strategy prose.`,
      data_source: ['@tmrxjd/platform/tools/uw-stone-chart-data.ts', '@tmrxjd/platform/tools/uw-stones.ts'],
      mechanics: ['Ultimate Weapons Calculator Outputs', `${weapon.name} stone ladder`],
      tags: ['trackerai', 'ultimate weapons', 'calculator', 'dataset summary', 'stones', slugify(weapon.name)],
      paragraphs: [
        `${weapon.name} has ${weapon.stats.length} deterministic upgrade ladders in the shared UW dataset. These ladders are canonical lookup rows, not chart-only derivations.`,
        ...statSummaries,
        buildUwLabAssociationParagraph(weapon.name),
      ],
    })
  })

  const uwLabAssociationChunk = buildAtomicKbChunk({
    chunk_id: 'trackerai_uw_dataset_lab_associations_01',
    source: 'Ultimate Weapons Calculator Deterministic Formula Source',
    section: 'TrackerAI',
    topic: 'Ultimate Weapon lab associations',
    title: 'Ultimate Weapons Dataset Summary: Lab Associations',
    disambiguation: 'This chunk is about which Ultimate Weapon mechanics have explicit lab hooks in the current deterministic site model, not a generic lab recommendation guide.',
    data_source: ['@tmrxjd/platform/tools/uptime-core.ts', '@tmrxjd/platform/tools/uw-stone-chart-data.ts'],
    mechanics: ['Ultimate Weapons Calculator Outputs', 'Ultimate Weapon lab associations'],
    tags: ['trackerai', 'ultimate weapons', 'calculator', 'dataset summary', 'labs', 'associations'],
    paragraphs: [
      'The dedicated Ultimate Weapon stone ladders are raw canonical ladders. Lab associations that change effective values are modeled separately and should be retrieved as formula context rather than assumed to be baked into the raw ladder rows.',
      'Golden Tower has a direct GT Duration lab hook. Chrono Field has a direct CF Duration lab hook. Tournament BC lab can reduce effective GT, BH, PS, and CF durations when the BC branch is enabled in the uptime model.',
      'Weapons without a dedicated lab field in the current deterministic model should be treated as raw ladder-only mechanics unless a separate formula chunk says otherwise. This prevents retrieval from inventing nonexistent lab scaling on the stone ladder itself.',
    ],
  })

  const unlockCosts = Object.entries(uwPlusUnlockCostsByOwnedCount)
    .filter(([, cost]) => cost !== '-/-')
    .map(([ownedCount, cost]) => `owned count ${ownedCount} unlock cost ${cost}`)

  const uwPlusUnlockChunk = buildAtomicKbChunk({
    chunk_id: 'trackerai_uw_dataset_plus_unlocks_01',
    source: 'Ultimate Weapons Plus Deterministic Dataset Source',
    section: 'TrackerAI',
    topic: 'Ultimate Weapon Plus unlock ladder',
    title: 'Ultimate Weapons Dataset Summary: UW Plus Unlock Costs',
    disambiguation: 'This chunk is about the dedicated deterministic unlock ladder for Ultimate Weapon Plus, not a chart-only summary or a recommendation layer.',
    data_source: ['@tmrxjd/platform/tools/uw-plus-chart-data.ts'],
    mechanics: ['Ultimate Weapons Calculator Outputs', 'Ultimate Weapon Plus unlock ladder'],
    tags: ['trackerai', 'ultimate weapons', 'calculator', 'dataset summary', 'uw plus', 'unlock costs'],
    paragraphs: [
      `Ultimate Weapon Plus unlock cost is a dedicated lookup ladder keyed by owned Ultimate Weapon count. Visible unlock rows are ${unlockCosts.join(', ')}.`,
      `The total visible unlock requirement across the full ladder is ${uwPlusUnlockTotal} stones before the dataset reaches the terminal no-further-unlock state.`,
    ],
  })

  const uwPlusSectionChunks = uwPlusUpgradeSections.map(section => {
    const sectionIdentity = buildUwPlusSectionIdentity(section)

    return buildAtomicKbChunk({
      chunk_id: `trackerai_uw_dataset_plus_${sectionIdentity.slug}_01`,
      source: 'Ultimate Weapons Plus Deterministic Dataset Source',
      section: 'TrackerAI',
      topic: `${sectionIdentity.label} UW Plus ladders`,
      title: `Ultimate Weapons Dataset Summary: UW Plus ${sectionIdentity.label}`,
      disambiguation: `This chunk is about the dedicated deterministic UW Plus section ${sectionIdentity.label}, not chart-renderer metadata or generic Ultimate Weapon Plus advice.`,
      data_source: ['@tmrxjd/platform/tools/uw-plus-chart-data.ts'],
      mechanics: ['Ultimate Weapons Calculator Outputs', `Ultimate Weapon Plus ${sectionIdentity.label}`],
      tags: ['trackerai', 'ultimate weapons', 'calculator', 'dataset summary', 'uw plus', sectionIdentity.slug],
      paragraphs: [
        `UW Plus section ${sectionIdentity.label} exposes ${section.upgrades.length} dedicated upgrade ladders with section total ${section.total} stones.`,
        ...section.upgrades.map(upgrade => {
          const tierEntries = Object.entries(upgrade.tiers)
            .filter(([, tier]) => tier.cost !== 'Total')
            .map(([tierLevel, tier]) => ({
              level: Number(tierLevel),
              value: String(tier.value || '').trim(),
              cost: String(tier.cost || '').trim(),
            }))
            .filter(entry => entry.value.length > 0)
          const first = tierEntries[0]
          const last = tierEntries[tierEntries.length - 1]
          const numericValues = tierEntries
            .map(entry => parseMetricValue(entry.value).numeric)
            .filter((value): value is number => value !== null)
          const valueSteps = summarizeSteps(numericValues)
          const stepText = valueSteps.kind === 'constant'
            ? `The visible value step is ${valueSteps.delta >= 0 ? '+' : ''}${formatNumber(valueSteps.delta)}${parseMetricValue(first?.value ?? '').unit} per tier where populated.`
            : 'The visible value progression is irregular and should be treated as a lookup ladder.'
          return `${upgrade.name.replace(/\s+/g, ' ').trim()} runs from tier ${first?.level ?? 0} value ${first?.value ?? 'n/a'} through tier ${last?.level ?? 0} value ${last?.value ?? 'n/a'}. Final displayed cumulative cost row is ${upgrade.tiers[15]?.value ?? 'n/a'} stones total. ${stepText}`
        }),
      ],
    })
  })

  return [...weaponChunks, uwLabAssociationChunk, uwPlusUnlockChunk, ...uwPlusSectionChunks]
}

export function buildTrackerAiCalculatorDatasetCanonicalKbChunks(): KBChunkRecord[] {
  return [
    ...buildBotDatasetChunks(),
    ...buildUwDatasetChunks(),
    ...buildWorkshopDatasetChunks(),
    ...buildModuleDatasetChunks(),
    ...buildThornsDatasetChunks(),
    ...buildUptimeDatasetChunks(),
  ]
}