import {
  ABSOLUTE_MAX_MODULE_LEVEL,
  BOT_UPGRADES_DATA,
  getLevelCapForRarity,
  getSharedToolLabs,
  buildGuardianDefinitions,
  MODULE_RARITIES,
  moduleTypes,
  TRACKER_AI_UPTIME_SUBJECT_KEYS,
  uwStoneChartData,
} from '@tmrxjd/platform/tools'
import {
  towerAiBotCalcAliases,
  towerAiBotDisplayAliases,
  towerAiBotStatAliases,
  towerAiUwStatAliases,
  towerAiUwWeaponAliases,
} from '../core/aliases'
import { z } from 'zod'

const finiteNumber = z.number().finite()
const guardianDefinitions = buildGuardianDefinitions()
const guardianTypeValues = guardianDefinitions.map(guardian => guardian.key) as [string, ...string[]]
const guardianStatNameValues = Array.from(new Set([
  'all',
  ...guardianDefinitions.flatMap(guardian => guardian.statOrder),
])).sort((left, right) => left.localeCompare(right)) as [string, ...string[]]
const guardianStatsByType = new Map(
  guardianDefinitions.map(guardian => [guardian.key, new Set(guardian.statOrder)]),
)
const guardianMaxLevelByType = new Map(
  guardianDefinitions.map(guardian => {
    const maxLevel = Math.max(
      1,
      ...Object.values(guardian.stats).flatMap(stat => Object.keys(stat.levels).map(level => Number(level) || 0)),
    )
    return [guardian.key, maxLevel] as const
  }),
)

function uniqueSorted(values: readonly string[]): string[] {
  return Array.from(new Set(values.map(value => String(value || '').trim()).filter(Boolean))).sort((left, right) => left.localeCompare(right))
}

function buildEnum(values: readonly string[], fallback: string) {
  const normalized = uniqueSorted(values)
  const safeValues = (normalized.length > 0 ? normalized : [fallback]) as [string, ...string[]]
  return z.enum(safeValues)
}

function normalizeString(value: unknown): string {
  return String(value ?? '').trim()
}

function splitCsvValues(value: unknown): string[] | unknown {
  if (typeof value !== 'string') return value
  const parts = value.split(',').map(part => part.trim()).filter(Boolean)
  return parts.length > 0 ? parts : value
}

function normalizeModuleTypeValue(value: unknown): string {
  const raw = normalizeString(value).toLowerCase()
  if (raw === 'defence') return 'defense'
  return raw
}

function normalizeModuleRarityValue(value: unknown): string {
  const raw = normalizeString(value)
  const resolved = MODULE_RARITIES.find(entry => entry.toLowerCase() === raw.toLowerCase())
  if (resolved) return resolved
  const normalized = raw
    .replace(/\*/g, '+')
    .replace(/\s*\+\s*/g, ' + ')
    .replace(/\s+/g, ' ')
    .trim()
  return MODULE_RARITIES.find(entry => entry.toLowerCase() === normalized.toLowerCase()) ?? raw
}

function parseBooleanLike(value: unknown): unknown {
  if (typeof value !== 'string') return value
  const normalized = value.trim().toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return value
}

const moduleTypeValues = uniqueSorted(moduleTypes)
const moduleRarityValues = uniqueSorted(MODULE_RARITIES)
const sharedLabNameValues = uniqueSorted(getSharedToolLabs().map(lab => lab.name))
const botNameValues = uniqueSorted(BOT_UPGRADES_DATA.map(bot => bot.name))
const botStatNameValues = uniqueSorted(['all', ...BOT_UPGRADES_DATA.flatMap(bot => bot.statOrder)])
const uwWeaponNameValues = uniqueSorted(Object.values(uwStoneChartData).map(weapon => weapon.name))
const uwStatNameValues = uniqueSorted(['all', ...Object.values(uwStoneChartData).flatMap(weapon => weapon.stats.map(stat => stat.name))])

const towerAiModuleTypeSchema = buildEnum(moduleTypeValues, 'cannon')
const towerAiModuleRaritySchema = buildEnum(moduleRarityValues, 'Ancestral 5')
const towerAiCalcLabNameSchema = buildEnum(sharedLabNameValues, sharedLabNameValues[0] || 'Lab Speed')
const towerAiCalcBotNameContractSchema = buildEnum([...botNameValues, ...Object.values(towerAiBotDisplayAliases)], botNameValues[0] || 'Golden Bot')
const towerAiCalcUwWeaponContractSchema = buildEnum(uwWeaponNameValues, uwWeaponNameValues[0] || 'Golden Tower')

const botNameByLower = new Map(botNameValues.map(value => [value.toLowerCase(), value]))
const labNameByLower = new Map(sharedLabNameValues.map(value => [value.toLowerCase(), value]))
const uwWeaponByLower = new Map(uwWeaponNameValues.map(value => [value.toLowerCase(), value]))
const validBotStatsByName = new Map(BOT_UPGRADES_DATA.map(bot => [bot.name, new Set(bot.statOrder)]))
const validUwStats = new Set([
  ...uwStatNameValues.map(value => value.toLowerCase()),
  ...Object.keys(towerAiUwStatAliases).map(value => value.toLowerCase()),
  ...Object.values(towerAiUwStatAliases).map(value => value.toLowerCase()),
])

const towerAiCalcBotNameSchema = z.preprocess(value => {
  const raw = normalizeString(value)
  const displayMapped = towerAiBotDisplayAliases[raw.toLowerCase()] ?? raw
  const calcMapped = towerAiBotCalcAliases[raw.toLowerCase()] ?? displayMapped
  return botNameByLower.get(calcMapped.toLowerCase()) ?? displayMapped
}, towerAiCalcBotNameContractSchema)

const towerAiCalcBotStatSchema = z.preprocess(value => {
  const raw = normalizeString(value)
  return towerAiBotStatAliases[raw.toLowerCase()] ?? raw
}, buildEnum(botStatNameValues, 'all'))

const towerAiCalcUwWeaponSchema = z.preprocess(value => {
  const raw = normalizeString(value)
  const mapped = towerAiUwWeaponAliases[raw.toLowerCase()] ?? raw
  return uwWeaponByLower.get(mapped.toLowerCase()) ?? mapped
}, towerAiCalcUwWeaponContractSchema)

const towerAiCalcUwStatSchema = z.preprocess(value => {
  const raw = normalizeString(value)
  return towerAiUwStatAliases[raw.toLowerCase()] ?? raw
}, z.string().trim().min(1).max(120)).superRefine((value, ctx) => {
  if (!validUwStats.has(value.toLowerCase())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Unsupported UW stat ${value}`,
      path: [],
    })
  }
})

const towerAiCalcRunUptimeFieldSchema = z.enum(['overview', 'uptime', 'perma', 'effectiveCd', 'sync'])
const towerAiCalcRunUptimeSubjectSchema = z.enum(TRACKER_AI_UPTIME_SUBJECT_KEYS)
const towerAiCalcRunUptimeMvnRaritySchema = z.enum(['Disabled', 'Epic', 'Legendary', 'Mythic', 'Ancestral'])

const towerAiCalcRunUptimeOverridesSchema = z.object({
  mvnRarity: towerAiCalcRunUptimeMvnRaritySchema.optional(),
  mvnGt: z.preprocess(parseBooleanLike, z.boolean()).optional(),
  mvnDw: z.preprocess(parseBooleanLike, z.boolean()).optional(),
  mvnBh: z.preprocess(parseBooleanLike, z.boolean()).optional(),
  assistEffPct: z.coerce.number().min(0).max(100).optional(),
  wavesPerBoss: z.coerce.number().int().min(1).max(10).optional(),
  waLevel: z.coerce.number().int().min(0).max(7).optional(),
  dwBaseWavesLevel: z.coerce.number().int().min(1).max(30).optional(),
  pkgChance: z.coerce.number().min(0).max(100).optional(),
  gtCdLevel: z.coerce.number().min(0).max(500).optional(),
  dwCdLevel: z.coerce.number().min(0).max(500).optional(),
  bhCdLevel: z.coerce.number().min(0).max(500).optional(),
  cfCdLevel: z.coerce.number().min(0).max(500).optional(),
  gtDurLab: z.coerce.number().int().min(0).max(30).optional(),
  cfDurLab: z.coerce.number().int().min(0).max(30).optional(),
  gtDurLevel: z.coerce.number().min(0).max(500).optional(),
  bhDurLevel: z.coerce.number().min(0).max(500).optional(),
  cfDurLevel: z.coerce.number().min(0).max(500).optional(),
  bhPerk: z.preprocess(parseBooleanLike, z.boolean()).optional(),
  cfDurPerk: z.preprocess(parseBooleanLike, z.boolean()).optional(),
  dwPerk: z.preprocess(parseBooleanLike, z.boolean()).optional(),
}).strict()

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

export const towerAiGuardianTypeSchema = z.enum(guardianTypeValues)
export const towerAiGuardianStatNameSchema = z.enum(guardianStatNameValues)

export const towerAiGuardianCostArgsSchema = z.object({
  guardianType: towerAiGuardianTypeSchema,
  statName: towerAiGuardianStatNameSchema.default('all'),
  startLevel: z.number().int().min(0).max(200).default(0),
  targetLevel: z.number().int().min(0).max(200).optional(),
}).strict().superRefine((value, ctx) => {
  const maxLevel = guardianMaxLevelByType.get(value.guardianType) ?? 0
  if (value.startLevel > maxLevel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `startLevel exceeds max level ${maxLevel} for ${value.guardianType}`,
      path: ['startLevel'],
    })
  }
  if (value.targetLevel !== undefined && value.targetLevel < value.startLevel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'targetLevel must be greater than or equal to startLevel',
      path: ['targetLevel'],
    })
  }
  if (value.targetLevel !== undefined && value.targetLevel > maxLevel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `targetLevel exceeds max level ${maxLevel} for ${value.guardianType}`,
      path: ['targetLevel'],
    })
  }
  if (value.statName !== 'all' && !guardianStatsByType.get(value.guardianType)?.has(value.statName)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `statName ${value.statName} is not valid for ${value.guardianType}`,
      path: ['statName'],
    })
  }
})

export const towerAiGuardianCostRequestSchema = z.object({
  tool: z.literal('calc.guardian.costs'),
  args: towerAiGuardianCostArgsSchema,
}).strict()

const towerAiUptimeFieldSchema = z.enum(['overview', 'uptime', 'perma', 'effectiveCd', 'sync'])
const towerAiUptimeSubjectSchema = z.enum(TRACKER_AI_UPTIME_SUBJECT_KEYS)
const towerAiUptimeMvnRaritySchema = z.enum(['Disabled', 'Epic', 'Legendary', 'Mythic', 'Ancestral'])

export const towerAiUptimeOverridesSchema = z.object({
  mvnRarity: towerAiUptimeMvnRaritySchema.optional(),
  mvnGt: z.boolean().optional(),
  mvnDw: z.boolean().optional(),
  mvnBh: z.boolean().optional(),
  assistEffPct: z.number().min(0).max(100).optional(),
  wavesPerBoss: z.number().int().min(1).max(10).optional(),
  waLevel: z.number().int().min(0).max(7).optional(),
  dwBaseWavesLevel: z.number().int().min(1).max(30).optional(),
  pkgChance: z.number().min(0).max(100).optional(),
  gtCdLevel: z.number().min(0).max(500).optional(),
  dwCdLevel: z.number().min(0).max(500).optional(),
  bhCdLevel: z.number().min(0).max(500).optional(),
  cfCdLevel: z.number().min(0).max(500).optional(),
  gtDurLab: z.number().int().min(0).max(30).optional(),
  cfDurLab: z.number().int().min(0).max(30).optional(),
  gtDurLevel: z.number().min(0).max(500).optional(),
  bhDurLevel: z.number().min(0).max(500).optional(),
  cfDurLevel: z.number().min(0).max(500).optional(),
  bhPerk: z.boolean().optional(),
  cfDurPerk: z.boolean().optional(),
  dwPerk: z.boolean().optional(),
}).strict()

export const towerAiUptimeProjectionArgsSchema = z.object({
  field: towerAiUptimeFieldSchema.default('overview'),
  focusSubjects: z.array(towerAiUptimeSubjectSchema).min(1).max(4).optional(),
  compareSubjects: z.tuple([towerAiUptimeSubjectSchema, towerAiUptimeSubjectSchema]).optional(),
  overrides: towerAiUptimeOverridesSchema.optional(),
  includeDwKillWave: z.boolean().optional(),
}).strict()

export const towerAiUptimeProjectionRequestSchema = z.object({
  tool: z.literal('calc.uptime.project'),
  args: towerAiUptimeProjectionArgsSchema,
}).strict()

export const towerAiCalcRunBotsMedalsArgsSchema = z.object({
  calculatorId: z.literal('bots'),
  operation: z.literal('medalsToTarget'),
  bot: towerAiCalcBotNameSchema,
  stat: towerAiCalcBotStatSchema.default('all'),
  startLevel: z.coerce.number().int().min(0).max(20).default(0),
  targetLevel: z.coerce.number().int().min(0).max(20).optional(),
  cooldownLab: z.coerce.number().int().min(0).max(25).optional(),
  durationLab: z.coerce.number().int().min(0).max(20).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.targetLevel !== undefined && value.targetLevel < value.startLevel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'targetLevel must be greater than or equal to startLevel',
      path: ['targetLevel'],
    })
  }
  if (value.stat !== 'all' && !validBotStatsByName.get(value.bot)?.has(value.stat)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `stat ${value.stat} is not valid for ${value.bot}`,
      path: ['stat'],
    })
  }
})

export const towerAiCalcRunUwStoneArgsSchema = z.object({
  calculatorId: z.literal('uw'),
  operation: z.literal('stonesToMax'),
  weapon: towerAiCalcUwWeaponSchema,
  stat: towerAiCalcUwStatSchema,
  startLevel: z.coerce.number().int().min(0).max(500).default(0),
  targetLevel: z.coerce.number().int().min(0).max(500).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.targetLevel !== undefined && value.targetLevel < value.startLevel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'targetLevel must be greater than or equal to startLevel',
      path: ['targetLevel'],
    })
  }
})

export const towerAiCalcRunUwAllStatsArgsSchema = z.object({
  calculatorId: z.literal('uw'),
  operation: z.literal('stonesToMaxAllStats'),
  weapon: towerAiCalcUwWeaponSchema,
  startLevel: z.coerce.number().int().min(0).max(500).default(0),
}).strict()

export const towerAiCalcRunLabsRangeArgsSchema = z.object({
  calculatorId: z.literal('labs'),
  operation: z.literal('rangeCosts'),
  labName: z.preprocess(value => labNameByLower.get(normalizeString(value).toLowerCase()) ?? value, towerAiCalcLabNameSchema),
  currentLevel: z.coerce.number().int().min(0).max(500).default(0),
  targetLevel: z.coerce.number().int().min(0).max(500).optional(),
  speedLevel: z.coerce.number().int().min(0).max(99).optional(),
  discountLevel: z.coerce.number().int().min(0).max(99).optional(),
  relicPercent: z.coerce.number().min(0).max(99).optional(),
  speedUp: z.coerce.number().positive().optional(),
  gemMultiplier: z.coerce.number().positive().optional(),
}).strict().superRefine((value, ctx) => {
  if (value.targetLevel !== undefined && value.targetLevel < value.currentLevel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'targetLevel must be greater than or equal to currentLevel',
      path: ['targetLevel'],
    })
  }
})

export const towerAiCalcRunModuleCostArgsSchema = z.object({
  calculatorId: z.literal('modules'),
  operation: z.literal('moduleCost'),
  moduleType: z.preprocess(normalizeModuleTypeValue, towerAiModuleTypeSchema).default('cannon'),
  rarity: z.preprocess(normalizeModuleRarityValue, towerAiModuleRaritySchema).optional(),
  assistRarity: z.preprocess(normalizeModuleRarityValue, towerAiModuleRaritySchema).optional(),
  currentLevel: z.coerce.number().int().min(1).max(ABSOLUTE_MAX_MODULE_LEVEL).optional(),
  targetLevel: z.coerce.number().int().min(1).max(ABSOLUTE_MAX_MODULE_LEVEL).optional(),
  assistCurrentLevel: z.coerce.number().int().min(1).max(ABSOLUTE_MAX_MODULE_LEVEL).optional(),
  assistTargetLevel: z.coerce.number().int().min(1).max(ABSOLUTE_MAX_MODULE_LEVEL).optional(),
  shardDiscount: z.coerce.number().int().min(0).max(100).optional(),
  coinDiscount: z.coerce.number().int().min(0).max(100).optional(),
  assistEffPct: z.coerce.number().int().min(0).max(100).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.currentLevel !== undefined && value.targetLevel !== undefined && value.targetLevel < value.currentLevel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'targetLevel must be greater than or equal to currentLevel',
      path: ['targetLevel'],
    })
  }
  if (value.assistCurrentLevel !== undefined && value.assistTargetLevel !== undefined && value.assistTargetLevel < value.assistCurrentLevel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'assistTargetLevel must be greater than or equal to assistCurrentLevel',
      path: ['assistTargetLevel'],
    })
  }
  if (value.targetLevel !== undefined && value.rarity && value.targetLevel > getLevelCapForRarity(value.rarity)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `targetLevel exceeds the cap for ${value.rarity}`,
      path: ['targetLevel'],
    })
  }
  if (value.assistTargetLevel !== undefined && value.assistRarity && value.assistTargetLevel > getLevelCapForRarity(value.assistRarity)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `assistTargetLevel exceeds the cap for ${value.assistRarity}`,
      path: ['assistTargetLevel'],
    })
  }
})

export const towerAiCalcRunAssistModuleStoneArgsSchema = z.object({
  calculatorId: z.literal('modules'),
  operation: z.literal('assistModuleStones'),
  moduleType: z.preprocess(normalizeModuleTypeValue, towerAiModuleTypeSchema).default('cannon'),
  multiplierStartLevel: z.coerce.number().int().min(0).max(70).optional(),
  multiplierTargetLevel: z.coerce.number().int().min(0).max(70).optional(),
  substatStartLevel: z.coerce.number().int().min(0).max(70).optional(),
  substatTargetLevel: z.coerce.number().int().min(0).max(70).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.multiplierStartLevel !== undefined && value.multiplierTargetLevel !== undefined && value.multiplierTargetLevel < value.multiplierStartLevel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'multiplierTargetLevel must be greater than or equal to multiplierStartLevel',
      path: ['multiplierTargetLevel'],
    })
  }
  if (value.substatStartLevel !== undefined && value.substatTargetLevel !== undefined && value.substatTargetLevel < value.substatStartLevel) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'substatTargetLevel must be greater than or equal to substatStartLevel',
      path: ['substatTargetLevel'],
    })
  }
})

export const towerAiCalcRunShardSplitterArgsSchema = z.object({
  calculatorId: z.literal('modules'),
  operation: z.literal('shardSplitter'),
  moduleType: z.preprocess(normalizeModuleTypeValue, towerAiModuleTypeSchema).optional(),
  assistEffPct: z.coerce.number().int().min(0).max(100).optional(),
  unspentShards: z.coerce.number().int().min(0).max(10_000_000_000).optional(),
  primaryLevel: z.coerce.number().int().min(1).max(ABSOLUTE_MAX_MODULE_LEVEL).optional(),
  assistLevel: z.coerce.number().int().min(1).max(ABSOLUTE_MAX_MODULE_LEVEL).optional(),
  primaryRarity: z.preprocess(normalizeModuleRarityValue, towerAiModuleRaritySchema).optional(),
  assistRarity: z.preprocess(normalizeModuleRarityValue, towerAiModuleRaritySchema).optional(),
  shardDiscount: z.coerce.number().int().min(0).max(100).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.primaryLevel !== undefined && value.primaryRarity && value.primaryLevel > getLevelCapForRarity(value.primaryRarity)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `primaryLevel exceeds the cap for ${value.primaryRarity}`,
      path: ['primaryLevel'],
    })
  }
  if (value.assistLevel !== undefined && value.assistRarity && value.assistLevel > getLevelCapForRarity(value.assistRarity)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `assistLevel exceeds the cap for ${value.assistRarity}`,
      path: ['assistLevel'],
    })
  }
})

export const towerAiCalcRunDamagePathArgsSchema = z.object({
  calculatorId: z.literal('modules'),
  operation: z.literal('damagePath'),
  shardDiscount: z.coerce.number().int().min(0).max(100).optional(),
  cannonPrimaryLevel: z.coerce.number().int().min(1).max(ABSOLUTE_MAX_MODULE_LEVEL).optional(),
  cannonAssistLevel: z.coerce.number().int().min(1).max(ABSOLUTE_MAX_MODULE_LEVEL).optional(),
  cannonPrimaryRarity: z.preprocess(normalizeModuleRarityValue, towerAiModuleRaritySchema).optional(),
  cannonAssistRarity: z.preprocess(normalizeModuleRarityValue, towerAiModuleRaritySchema).optional(),
  cannonAssistEffPct: z.coerce.number().int().min(0).max(100).optional(),
  cannonUnspentShards: z.coerce.number().int().min(0).max(10_000_000_000).optional(),
  corePrimaryLevel: z.coerce.number().int().min(1).max(ABSOLUTE_MAX_MODULE_LEVEL).optional(),
  coreAssistLevel: z.coerce.number().int().min(1).max(ABSOLUTE_MAX_MODULE_LEVEL).optional(),
  corePrimaryRarity: z.preprocess(normalizeModuleRarityValue, towerAiModuleRaritySchema).optional(),
  coreAssistRarity: z.preprocess(normalizeModuleRarityValue, towerAiModuleRaritySchema).optional(),
  coreAssistEffPct: z.coerce.number().int().min(0).max(100).optional(),
  coreUnspentShards: z.coerce.number().int().min(0).max(10_000_000_000).optional(),
}).strict()

export const towerAiCalcRunUptimeProjectionArgsSchema = z.object({
  calculatorId: z.literal('uptime'),
  operation: z.literal('project'),
  field: towerAiCalcRunUptimeFieldSchema.default('overview'),
  focusSubjects: z.preprocess(splitCsvValues, z.array(towerAiCalcRunUptimeSubjectSchema).min(1).max(4)).optional(),
  compareSubjects: z.preprocess(splitCsvValues, z.tuple([towerAiCalcRunUptimeSubjectSchema, towerAiCalcRunUptimeSubjectSchema])).optional(),
  includeDwKillWave: z.preprocess(parseBooleanLike, z.boolean()).optional(),
  overrides: towerAiCalcRunUptimeOverridesSchema.optional(),
}).strict().superRefine((value, ctx) => {
  if (value.compareSubjects && value.compareSubjects[0] === value.compareSubjects[1]) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'compareSubjects must reference two different uptime rows',
      path: ['compareSubjects'],
    })
  }
  if (value.field === 'sync' && !value.compareSubjects) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'sync projections require compareSubjects',
      path: ['compareSubjects'],
    })
  }
})

export const towerAiCalcRunArgsSchema = z.union([
  towerAiCalcRunBotsMedalsArgsSchema,
  towerAiCalcRunUwStoneArgsSchema,
  towerAiCalcRunUwAllStatsArgsSchema,
  towerAiCalcRunLabsRangeArgsSchema,
  towerAiCalcRunModuleCostArgsSchema,
  towerAiCalcRunAssistModuleStoneArgsSchema,
  towerAiCalcRunShardSplitterArgsSchema,
  towerAiCalcRunDamagePathArgsSchema,
  towerAiCalcRunUptimeProjectionArgsSchema,
])

export const towerAiCalcRunSchemaKeys = [
  'bots/medalsToTarget',
  'uw/stonesToMax',
  'uw/stonesToMaxAllStats',
  'labs/rangeCosts',
  'modules/moduleCost',
  'modules/assistModuleStones',
  'modules/shardSplitter',
  'modules/damagePath',
  'uptime/project',
] as const

export const towerAiCalcRunRequestSchema = z.object({
  tool: z.literal('calc.run'),
  args: towerAiCalcRunArgsSchema,
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
