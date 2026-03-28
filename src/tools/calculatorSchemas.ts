import { z } from 'zod'

const finiteNumber = z.number().finite()

export const towerAiModuleCostArgsSchema = z.object({
  costType: z.enum(['shards', 'coins', 'main-sub']),
  fromLevel: z.number().int().min(1).max(500),
  toLevel: z.number().int().min(1).max(500),
  discountPercent: z.number().int().min(0).max(100).default(0),
}).strict()

export const towerAiModuleCostRequestSchema = z.object({
  tool: z.literal('calc.module.costs'),
  args: towerAiModuleCostArgsSchema,
}).strict()

export const towerAiWorkshopCostArgsSchema = z.object({
  costs: z.union([
    z.array(finiteNumber),
    z.record(z.string(), finiteNumber),
  ]),
  fromLevel: z.number().int().min(0).max(9999),
  toLevel: z.number().int().min(1).max(9999),
  sectionDiscountPercent: z.number().min(0).max(100).default(0),
  vaultDiscountPercent: z.number().min(0).max(100).default(0),
}).strict()

export const towerAiWorkshopCostRequestSchema = z.object({
  tool: z.literal('calc.workshop.costs'),
  args: towerAiWorkshopCostArgsSchema,
}).strict()

export const towerAiShardSplitArgsSchema = z.object({
  moduleType: z.enum(['cannon', 'defense', 'generator', 'core']),
  primaryLevel: z.number().int().min(1).max(500),
  secondaryLevel: z.number().int().min(1).max(500),
  primaryRarity: z.string().trim().min(1).max(60),
  secondaryRarity: z.string().trim().min(1).max(60),
  assistEffPct: z.number().int().min(0).max(100),
  assistLabLevel: z.number().int().min(0).max(99).optional(),
  unspentShards: z.number().int().min(0).max(1000000000),
  shardDiscount: z.number().int().min(0).max(100),
}).strict()

export const towerAiShardSplitRequestSchema = z.object({
  tool: z.literal('calc.shard.split'),
  args: towerAiShardSplitArgsSchema,
}).strict()

export const towerAiLabProgressArgsSchema = z.object({
  labName: z.string().trim().min(1).max(160),
  currentLevel: z.number().int().min(0).max(999),
  targetLevel: z.number().int().min(1).max(999),
  modifiers: z.object({
    labSpeed: z.number().int().min(0).max(999),
    labRelic: z.number().int().min(0).max(999),
    labDiscount: z.number().int().min(0).max(999),
    speedUp: z.number().min(1).max(8),
  }).strict(),
}).strict()

export const towerAiLabProgressRequestSchema = z.object({
  tool: z.literal('calc.lab.progress'),
  args: towerAiLabProgressArgsSchema,
}).strict()

export const towerAiBotCostArgsSchema = z.object({
  botName: z.string().trim().min(1).max(120),
  statName: z.string().trim().min(1).max(120),
  startLevel: z.number().int().min(0).max(100),
  targetLevel: z.number().int().min(0).max(100),
  labLevels: z.object({
    Duration: z.number().int().min(0).max(99).optional(),
    Cooldown: z.number().int().min(0).max(99).optional(),
  }).strict().optional(),
}).strict()

export const towerAiBotCostRequestSchema = z.object({
  tool: z.literal('calc.bot.costs'),
  args: towerAiBotCostArgsSchema,
}).strict()

export const towerAiThornsArgsSchema = z.object({
  baseThorns: z.number().int().min(0).max(600).optional(),
  tier: z.number().int().min(1).max(21).optional(),
  pcLevel: z.number().int().min(0).max(7).optional(),
  pcMasteryLevel: z.number().int().min(0).max(9).optional(),
  bcLabLevel: z.number().int().min(0).max(10).optional(),
  bcReductionLabLevel: z.number().int().min(0).max(20).optional(),
  pcReductionLabLevel: z.number().int().min(0).max(20).optional(),
  tournamentTier: z.enum(['none', 't11', 't14', 't17']).optional(),
  heatWave: z.number().int().min(0).max(1000).optional(),
  sharpFortitude: z.boolean().optional(),
}).strict()

export const towerAiThornsWallRequestSchema = z.object({
  tool: z.literal('calc.thorns.wall'),
  args: towerAiThornsArgsSchema,
}).strict()

export const towerAiThornsBaseRequestSchema = z.object({
  tool: z.literal('calc.thorns.base'),
  args: towerAiThornsArgsSchema,
}).strict()
