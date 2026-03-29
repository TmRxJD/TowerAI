import {
  buildModuleCalculatorView,
  buildGuardianCalculatorPreview,
  buildBotStatCostRows,
  buildLabProgressRows,
  buildModuleCostRows,
  buildTrackerAiUptimeProjectionPayload,
  buildThornsBaseChart,
  buildThornsWallChart,
  buildWorkshopLevelCostRows,
  computeShardSplitResult,
  findUwStatByName,
  findUwWeaponByName,
  formatTrackerAiUptimeProjectionPayload,
  findBotByName,
  buildUwStatCostRows,
  getUwStatMaxLevel,
  getSharedToolLabs,
  MAIN_SUB_COSTS,
  MODULE_COIN_COSTS,
  MODULE_SHARD_COSTS,
  normalizeModuleCalculatorState,
  normalizeBotStats,
  resolveWorkshopTotalDiscountPercent,
  sumUwAllStatCostsFromLevel,
  uwStoneChartData,
} from '@tmrxjd/platform/tools'
import type { ModuleType } from '@tmrxjd/platform/tools'
import type { z } from 'zod'
import type {
  towerAiCalcRunArgsSchema,
  towerAiCalcRunAssistModuleStoneArgsSchema,
  towerAiCalcRunBotsMedalsArgsSchema,
  towerAiCalcRunDamagePathArgsSchema,
  towerAiCalcRunLabsRangeArgsSchema,
  towerAiCalcRunModuleCostArgsSchema,
  towerAiCalcRunShardSplitterArgsSchema,
  towerAiCalcRunUptimeProjectionArgsSchema,
  towerAiCalcRunUwAllStatsArgsSchema,
  towerAiCalcRunUwStoneArgsSchema,
  towerAiBotCostArgsSchema,
  towerAiGuardianCostArgsSchema,
  towerAiLabProgressArgsSchema,
  towerAiModuleCostArgsSchema,
  towerAiShardSplitArgsSchema,
  towerAiThornsArgsSchema,
  towerAiUptimeProjectionArgsSchema,
  towerAiWorkshopCostArgsSchema,
} from './calculatorSchemas'

type TowerAiModuleCostArgs = z.infer<typeof towerAiModuleCostArgsSchema>
type TowerAiWorkshopCostArgs = z.infer<typeof towerAiWorkshopCostArgsSchema>
type TowerAiShardSplitArgs = z.infer<typeof towerAiShardSplitArgsSchema>
type TowerAiLabProgressArgs = z.infer<typeof towerAiLabProgressArgsSchema>
type TowerAiBotCostArgs = z.infer<typeof towerAiBotCostArgsSchema>
type TowerAiGuardianCostArgs = z.infer<typeof towerAiGuardianCostArgsSchema>
type TowerAiThornsArgs = z.infer<typeof towerAiThornsArgsSchema>
type TowerAiUptimeProjectionArgs = z.infer<typeof towerAiUptimeProjectionArgsSchema>
type TowerAiCalcRunArgs = z.infer<typeof towerAiCalcRunArgsSchema>
type TowerAiCalcRunBotArgs = z.infer<typeof towerAiCalcRunBotsMedalsArgsSchema>
type TowerAiCalcRunUwStoneArgs = z.infer<typeof towerAiCalcRunUwStoneArgsSchema>
type TowerAiCalcRunUwAllStatsArgs = z.infer<typeof towerAiCalcRunUwAllStatsArgsSchema>
type TowerAiCalcRunLabsRangeArgs = z.infer<typeof towerAiCalcRunLabsRangeArgsSchema>
type TowerAiCalcRunModuleCostArgs = z.infer<typeof towerAiCalcRunModuleCostArgsSchema>
type TowerAiCalcRunAssistModuleStoneArgs = z.infer<typeof towerAiCalcRunAssistModuleStoneArgsSchema>
type TowerAiCalcRunShardSplitterArgs = z.infer<typeof towerAiCalcRunShardSplitterArgsSchema>
type TowerAiCalcRunDamagePathArgs = z.infer<typeof towerAiCalcRunDamagePathArgsSchema>
type TowerAiCalcRunUptimeArgs = z.infer<typeof towerAiCalcRunUptimeProjectionArgsSchema>

function normalizeLookupKey(value: string): string {
  return value.trim().toLowerCase().replace(/[_\s]+/g, ' ')
}

function resolveModuleCosts(costType: TowerAiModuleCostArgs['costType']): readonly number[] {
  if (costType === 'coins') return MODULE_COIN_COSTS
  if (costType === 'main-sub') return MAIN_SUB_COSTS
  return MODULE_SHARD_COSTS
}

function buildAssistStoneRangeRows(startLevel: number, targetLevel: number) {
  const start = Math.max(0, Math.floor(startLevel))
  const target = Math.max(start, Math.floor(targetLevel))
  let cumulativeCost = 0
  const rows: Array<{ level: number; cost: number; cumulativeCost: number }> = []

  for (let level = start + 1; level <= target; level += 1) {
    const cost = Number(MAIN_SUB_COSTS[level - 1] || 0)
    cumulativeCost += cost
    rows.push({ level, cost, cumulativeCost })
  }

  return rows
}

function buildModuleCalculatorViewPreview(args: TowerAiCalcRunModuleCostArgs) {
  const state = normalizeModuleCalculatorState({
    moduleType: args.moduleType,
    coinDiscount: args.coinDiscount ?? 0,
    shardDiscount: args.shardDiscount ?? 0,
    ...(args.rarity ? { lastRarityByType: { [args.moduleType]: args.rarity } } : {}),
    ...(args.assistRarity ? { lastAssistRarityByType: { [args.moduleType]: args.assistRarity } } : {}),
    ...(args.currentLevel !== undefined ? { currentLevelByType: { [args.moduleType]: args.currentLevel } } : {}),
    ...(args.targetLevel !== undefined ? { targetLevelByType: { [args.moduleType]: args.targetLevel } } : {}),
    ...(args.assistCurrentLevel !== undefined ? { assistCurrentLevelByType: { [args.moduleType]: args.assistCurrentLevel } } : {}),
    ...(args.assistTargetLevel !== undefined ? { assistTargetLevelByType: { [args.moduleType]: args.assistTargetLevel } } : {}),
    ...(args.assistEffPct !== undefined ? { assistEffPctByType: { [args.moduleType]: args.assistEffPct } } : {}),
  })

  return buildModuleCalculatorView(state)
}

function buildUwStonePreview(args: TowerAiCalcRunUwStoneArgs) {
  const weapon = findUwWeaponByName(uwStoneChartData, args.weapon)
  if (!weapon) {
    throw new Error(`Unknown Ultimate Weapon: ${args.weapon}`)
  }

  const stat = findUwStatByName(weapon, args.stat)
  if (!stat) {
    throw new Error(`Unknown Ultimate Weapon stat '${args.stat}' for ${weapon.name}`)
  }

  const targetLevel = args.targetLevel ?? getUwStatMaxLevel(stat)
  const rows = buildUwStatCostRows(stat, args.startLevel, targetLevel)
  return {
    weapon: weapon.name,
    stat: stat.name,
    startLevel: args.startLevel,
    targetLevel,
    rows,
    totalCost: rows.length > 0 ? rows[rows.length - 1].cumulativeCost : 0,
  }
}

function buildUwAllStatsPreview(args: TowerAiCalcRunUwAllStatsArgs) {
  const weapon = findUwWeaponByName(uwStoneChartData, args.weapon)
  if (!weapon) {
    throw new Error(`Unknown Ultimate Weapon: ${args.weapon}`)
  }

  return {
    weapon: weapon.name,
    startLevel: args.startLevel,
    totalCost: sumUwAllStatCostsFromLevel(weapon, args.startLevel),
    stats: weapon.stats.map(stat => ({
      stat: stat.name,
      maxLevel: getUwStatMaxLevel(stat),
      totalCost: buildUwStatCostRows(stat, args.startLevel, getUwStatMaxLevel(stat)).reduce((total, row) => total + row.cost, 0),
    })),
  }
}

function buildBotMedalPreview(args: TowerAiCalcRunBotArgs) {
  return buildBotCostPreview({
    botName: args.bot,
    statName: args.stat,
    startLevel: args.startLevel,
    targetLevel: args.targetLevel ?? 20,
    ...(args.cooldownLab !== undefined || args.durationLab !== undefined
      ? {
          labLevels: {
            ...(args.durationLab !== undefined ? { Duration: args.durationLab } : {}),
            ...(args.cooldownLab !== undefined ? { Cooldown: args.cooldownLab } : {}),
          },
        }
      : {}),
  })
}

function buildLabRangePreview(args: TowerAiCalcRunLabsRangeArgs) {
  return {
    ...buildLabProgressPreview({
      labName: args.labName,
      currentLevel: args.currentLevel,
      targetLevel: args.targetLevel ?? args.currentLevel,
      modifiers: {
        labSpeed: args.speedLevel ?? 0,
        labRelic: args.relicPercent ?? 0,
        labDiscount: args.discountLevel ?? 0,
        speedUp: args.speedUp ?? 1,
      },
    }),
    gemMultiplier: args.gemMultiplier ?? 1,
  }
}

function buildAssistModuleStonePreview(args: TowerAiCalcRunAssistModuleStoneArgs) {
  const multiplierRows = buildAssistStoneRangeRows(args.multiplierStartLevel ?? 0, args.multiplierTargetLevel ?? args.multiplierStartLevel ?? 0)
  const substatRows = buildAssistStoneRangeRows(args.substatStartLevel ?? 0, args.substatTargetLevel ?? args.substatStartLevel ?? 0)
  return {
    moduleType: args.moduleType,
    multiplierRows,
    substatRows,
    totalCost: (multiplierRows[multiplierRows.length - 1]?.cumulativeCost ?? 0) + (substatRows[substatRows.length - 1]?.cumulativeCost ?? 0),
  }
}

function buildShardSplitterPreview(args: TowerAiCalcRunShardSplitterArgs) {
  return computeShardSplitResult({
    moduleType: (args.moduleType ?? 'cannon') as ModuleType,
    primaryLevel: args.primaryLevel ?? 1,
    secondaryLevel: args.assistLevel ?? 1,
    primaryRarity: args.primaryRarity ?? 'Ancestral 5',
    secondaryRarity: args.assistRarity ?? 'Ancestral 5',
    assistEffPct: args.assistEffPct ?? 25,
    unspentShards: args.unspentShards ?? 0,
    shardDiscount: args.shardDiscount ?? 0,
  })
}

function buildDamagePathPreview(args: TowerAiCalcRunDamagePathArgs) {
  return {
    shardDiscount: args.shardDiscount ?? 0,
    cannon: computeShardSplitResult({
      moduleType: 'cannon',
      primaryLevel: args.cannonPrimaryLevel ?? 1,
      secondaryLevel: args.cannonAssistLevel ?? 1,
      primaryRarity: args.cannonPrimaryRarity ?? 'Ancestral 5',
      secondaryRarity: args.cannonAssistRarity ?? 'Ancestral 5',
      assistEffPct: args.cannonAssistEffPct ?? 25,
      unspentShards: args.cannonUnspentShards ?? 0,
      shardDiscount: args.shardDiscount ?? 0,
    }),
    core: computeShardSplitResult({
      moduleType: 'core',
      primaryLevel: args.corePrimaryLevel ?? 1,
      secondaryLevel: args.coreAssistLevel ?? 1,
      primaryRarity: args.corePrimaryRarity ?? 'Ancestral 5',
      secondaryRarity: args.coreAssistRarity ?? 'Ancestral 5',
      assistEffPct: args.coreAssistEffPct ?? 25,
      unspentShards: args.coreUnspentShards ?? 0,
      shardDiscount: args.shardDiscount ?? 0,
    }),
  }
}

export function buildModuleCostPreview(args: TowerAiModuleCostArgs) {
  const rows = buildModuleCostRows(
    resolveModuleCosts(args.costType),
    args.fromLevel,
    args.toLevel,
    args.discountPercent,
  )

  return {
    costType: args.costType,
    fromLevel: args.fromLevel,
    toLevel: args.toLevel,
    discountPercent: args.discountPercent,
    rows,
    totalCost: rows.length > 0 ? rows[rows.length - 1].cumulativeCost : 0,
  }
}

export function buildWorkshopCostPreview(args: TowerAiWorkshopCostArgs) {
  const totalDiscountPercent = resolveWorkshopTotalDiscountPercent(
    args.sectionDiscountPercent,
    args.vaultDiscountPercent,
  )
  const rows = buildWorkshopLevelCostRows(
    args.costs,
    args.fromLevel,
    args.toLevel,
    totalDiscountPercent,
  )

  return {
    fromLevel: args.fromLevel,
    toLevel: args.toLevel,
    totalDiscountPercent,
    rows,
    totalCost: rows.length > 0 ? rows[rows.length - 1].cumulativeCost : 0,
  }
}

export function buildShardSplitPreview(args: TowerAiShardSplitArgs) {
  return computeShardSplitResult(args)
}

export function buildLabProgressPreview(args: TowerAiLabProgressArgs) {
  const needle = normalizeLookupKey(args.labName)
  const lab = getSharedToolLabs().find(candidate => normalizeLookupKey(candidate.name) === needle)
  if (!lab) {
    throw new Error(`Unknown lab: ${args.labName}`)
  }

  const rows = buildLabProgressRows(lab, args.currentLevel, args.targetLevel, args.modifiers)
  return {
    lab: {
      name: lab.name,
      type: lab.type ?? null,
      currency: lab.currency ?? null,
    },
    currentLevel: args.currentLevel,
    targetLevel: args.targetLevel,
    modifiers: args.modifiers,
    rows,
  }
}

export function buildBotCostPreview(args: TowerAiBotCostArgs) {
  const bot = findBotByName(args.botName)
  if (!bot) {
    throw new Error(`Unknown bot: ${args.botName}`)
  }

  const stat = normalizeBotStats(bot, args.labLevels).find(candidate => normalizeLookupKey(candidate.name) === normalizeLookupKey(args.statName))
  if (!stat) {
    throw new Error(`Unknown bot stat '${args.statName}' for ${bot.name}`)
  }

  const rows = buildBotStatCostRows(stat, args.startLevel, args.targetLevel)
  return {
    bot: bot.name,
    stat: stat.name,
    startLevel: args.startLevel,
    targetLevel: args.targetLevel,
    rows,
    totalCost: rows.reduce((total, row) => total + row.cost, 0),
  }
}

export function buildGuardianCostPreview(args: TowerAiGuardianCostArgs) {
  return buildGuardianCalculatorPreview(args)
}

export function buildUptimeProjectionPreview(args: TowerAiUptimeProjectionArgs) {
  const payload = buildTrackerAiUptimeProjectionPayload({
    field: args.field,
    focusSubjects: args.focusSubjects,
    compareSubjects: args.compareSubjects,
    overrides: args.overrides,
    includeDwKillWave: args.includeDwKillWave,
  })

  return {
    ...payload,
    text: formatTrackerAiUptimeProjectionPayload(payload as Record<string, unknown>),
  }
}

export function buildThornsWallPreview(args: TowerAiThornsArgs) {
  return buildThornsWallChart(args)
}

export function buildThornsBasePreview(args: TowerAiThornsArgs) {
  return buildThornsBaseChart(args)
}

export function buildCalcRunPreview(args: TowerAiCalcRunArgs) {
  switch (`${args.calculatorId}/${args.operation}`) {
    case 'bots/medalsToTarget':
      return buildBotMedalPreview(args as TowerAiCalcRunBotArgs)
    case 'uw/stonesToMax':
      return buildUwStonePreview(args as TowerAiCalcRunUwStoneArgs)
    case 'uw/stonesToMaxAllStats':
      return buildUwAllStatsPreview(args as TowerAiCalcRunUwAllStatsArgs)
    case 'labs/rangeCosts':
      return buildLabRangePreview(args as TowerAiCalcRunLabsRangeArgs)
    case 'modules/moduleCost':
      return buildModuleCalculatorViewPreview(args as TowerAiCalcRunModuleCostArgs)
    case 'modules/assistModuleStones':
      return buildAssistModuleStonePreview(args as TowerAiCalcRunAssistModuleStoneArgs)
    case 'modules/shardSplitter':
      return buildShardSplitterPreview(args as TowerAiCalcRunShardSplitterArgs)
    case 'modules/damagePath':
      return buildDamagePathPreview(args as TowerAiCalcRunDamagePathArgs)
    case 'uptime/project':
      return buildUptimeProjectionPreview({
        field: (args as TowerAiCalcRunUptimeArgs).field,
        focusSubjects: (args as TowerAiCalcRunUptimeArgs).focusSubjects,
        compareSubjects: (args as TowerAiCalcRunUptimeArgs).compareSubjects,
        overrides: (args as TowerAiCalcRunUptimeArgs).overrides,
        includeDwKillWave: (args as TowerAiCalcRunUptimeArgs).includeDwKillWave,
      })
    default:
      throw new Error(`Unsupported calculator operation: ${args.calculatorId}/${args.operation}`)
  }
}
