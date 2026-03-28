import {
  buildBotStatCostRows,
  buildLabProgressRows,
  buildModuleCostRows,
  buildThornsBaseChart,
  buildThornsWallChart,
  buildWorkshopLevelCostRows,
  computeShardSplitResult,
  findBotByName,
  getSharedToolLabs,
  MAIN_SUB_COSTS,
  MODULE_COIN_COSTS,
  MODULE_SHARD_COSTS,
  normalizeBotStats,
  resolveWorkshopTotalDiscountPercent,
} from '@tmrxjd/platform/tools'
import type { z } from 'zod'
import type {
  towerAiBotCostArgsSchema,
  towerAiLabProgressArgsSchema,
  towerAiModuleCostArgsSchema,
  towerAiShardSplitArgsSchema,
  towerAiThornsArgsSchema,
  towerAiWorkshopCostArgsSchema,
} from './calculatorSchemas'

type TowerAiModuleCostArgs = z.infer<typeof towerAiModuleCostArgsSchema>
type TowerAiWorkshopCostArgs = z.infer<typeof towerAiWorkshopCostArgsSchema>
type TowerAiShardSplitArgs = z.infer<typeof towerAiShardSplitArgsSchema>
type TowerAiLabProgressArgs = z.infer<typeof towerAiLabProgressArgsSchema>
type TowerAiBotCostArgs = z.infer<typeof towerAiBotCostArgsSchema>
type TowerAiThornsArgs = z.infer<typeof towerAiThornsArgsSchema>

function normalizeLookupKey(value: string): string {
  return value.trim().toLowerCase().replace(/[_\s]+/g, ' ')
}

function resolveModuleCosts(costType: TowerAiModuleCostArgs['costType']): readonly number[] {
  if (costType === 'coins') return MODULE_COIN_COSTS
  if (costType === 'main-sub') return MAIN_SUB_COSTS
  return MODULE_SHARD_COSTS
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

export function buildThornsWallPreview(args: TowerAiThornsArgs) {
  return buildThornsWallChart(args)
}

export function buildThornsBasePreview(args: TowerAiThornsArgs) {
  return buildThornsBaseChart(args)
}
