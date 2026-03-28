import { z } from 'zod'
import {
  towerAiBotCostRequestSchema,
  towerAiLabProgressRequestSchema,
  towerAiModuleCostRequestSchema,
  towerAiShardSplitRequestSchema,
  towerAiThornsBaseRequestSchema,
  towerAiThornsWallRequestSchema,
  towerAiWorkshopCostRequestSchema,
} from './calculatorSchemas'
import {
  towerAiChartCatalogListRequestSchema,
  towerAiChartTablePreviewRequestSchema,
} from './chartSchemas'

export const towerAiPlatformToolRequestSchema = z.discriminatedUnion('tool', [
  towerAiChartCatalogListRequestSchema,
  towerAiChartTablePreviewRequestSchema,
  towerAiModuleCostRequestSchema,
  towerAiWorkshopCostRequestSchema,
  towerAiShardSplitRequestSchema,
  towerAiLabProgressRequestSchema,
  towerAiBotCostRequestSchema,
  towerAiThornsWallRequestSchema,
  towerAiThornsBaseRequestSchema,
])

export type TowerAiPlatformToolRequest = z.infer<typeof towerAiPlatformToolRequestSchema>
export type TowerAiPlatformToolName = TowerAiPlatformToolRequest['tool']

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
