import { z } from 'zod'
import {
  towerAiCalcRunRequestSchema,
  towerAiBotCostRequestSchema,
  towerAiGuardianCostRequestSchema,
  towerAiLabProgressRequestSchema,
  towerAiModuleCostRequestSchema,
  towerAiShardSplitRequestSchema,
  towerAiThornsBaseRequestSchema,
  towerAiThornsWallRequestSchema,
  towerAiUptimeProjectionRequestSchema,
  towerAiWorkshopCostRequestSchema,
} from './calculatorSchemas'
import {
  towerAiChartBrowseRequestSchema,
  towerAiChartCatalogListRequestSchema,
  towerAiChartTablePreviewRequestSchema,
} from './chartSchemas'

export const towerAiPlatformToolRequestOptions = [
  towerAiChartBrowseRequestSchema,
  towerAiChartCatalogListRequestSchema,
  towerAiChartTablePreviewRequestSchema,
  towerAiCalcRunRequestSchema,
  towerAiModuleCostRequestSchema,
  towerAiWorkshopCostRequestSchema,
  towerAiShardSplitRequestSchema,
  towerAiLabProgressRequestSchema,
  towerAiBotCostRequestSchema,
  towerAiGuardianCostRequestSchema,
  towerAiUptimeProjectionRequestSchema,
  towerAiThornsWallRequestSchema,
  towerAiThornsBaseRequestSchema,
] as const

export const towerAiPlatformToolRequestSchema = z.discriminatedUnion('tool', towerAiPlatformToolRequestOptions)

export type TowerAiPlatformToolRequest = z.infer<typeof towerAiPlatformToolRequestSchema>
export type TowerAiPlatformToolName = TowerAiPlatformToolRequest['tool']

export const towerAiPlatformToolNames = towerAiPlatformToolRequestOptions.map(schema => String(schema.shape.tool.value)) as TowerAiPlatformToolName[]
export const towerAiPlatformToolNameSet = new Set<TowerAiPlatformToolName>(towerAiPlatformToolNames)

export type TowerAiPlatformToolResult = {
  success: true
  tool: TowerAiPlatformToolName
  summary: string
  data: unknown
} | {
  success: false
  tool: TowerAiPlatformToolName
  reason: string
  data?: unknown
}
