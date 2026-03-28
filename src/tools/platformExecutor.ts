import { towerAiPlatformToolRequestSchema, type TowerAiPlatformToolRequest, type TowerAiPlatformToolResult } from './contracts'
import { buildChartTablePreview, listChartCatalog } from './chartTools'
import {
  buildBotCostPreview,
  buildLabProgressPreview,
  buildModuleCostPreview,
  buildShardSplitPreview,
  buildThornsBasePreview,
  buildThornsWallPreview,
  buildWorkshopCostPreview,
} from './calculatorTools'

function summarizeResult(tool: TowerAiPlatformToolRequest['tool'], data: unknown): string {
  switch (tool) {
    case 'chart.catalog.list': {
      const record = data as { categories?: unknown[]; items?: unknown[]; paths?: unknown[] }
      return `Resolved ${record.categories?.length ?? record.items?.length ?? record.paths?.length ?? 0} chart entries`
    }
    case 'chart.preview.table':
      return 'Resolved shared chart table preview'
    case 'calc.module.costs':
      return 'Calculated module upgrade costs'
    case 'calc.workshop.costs':
      return 'Calculated workshop upgrade costs'
    case 'calc.shard.split':
      return 'Calculated shard split recommendations'
    case 'calc.lab.progress':
      return 'Calculated lab progression rows'
    case 'calc.bot.costs':
      return 'Calculated bot upgrade costs'
    case 'calc.thorns.wall':
      return 'Calculated thorns wall chart'
    case 'calc.thorns.base':
      return 'Calculated thorns base chart'
  }
}

function executeParsedRequest(request: TowerAiPlatformToolRequest): TowerAiPlatformToolResult {
  try {
    switch (request.tool) {
      case 'chart.catalog.list':
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, request.args),
          data: listChartCatalog(request.args),
        }
      case 'chart.preview.table':
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, request.args),
          data: buildChartTablePreview(request.args),
        }
      case 'calc.module.costs':
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, request.args),
          data: buildModuleCostPreview(request.args),
        }
      case 'calc.workshop.costs':
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, request.args),
          data: buildWorkshopCostPreview(request.args),
        }
      case 'calc.shard.split':
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, request.args),
          data: buildShardSplitPreview(request.args),
        }
      case 'calc.lab.progress':
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, request.args),
          data: buildLabProgressPreview(request.args),
        }
      case 'calc.bot.costs':
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, request.args),
          data: buildBotCostPreview(request.args),
        }
      case 'calc.thorns.wall':
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, request.args),
          data: buildThornsWallPreview(request.args),
        }
      case 'calc.thorns.base':
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, request.args),
          data: buildThornsBasePreview(request.args),
        }
    }
  } catch (error) {
    return {
      success: false,
      tool: request.tool,
      reason: error instanceof Error ? error.message : String(error),
    }
  }
}

export function executeTowerAiPlatformTool(requestLike: unknown): TowerAiPlatformToolResult {
  const parsed = towerAiPlatformToolRequestSchema.safeParse(requestLike)
  if (!parsed.success) {
    const fallbackTool = typeof requestLike === 'object' && requestLike && 'tool' in (requestLike as Record<string, unknown>)
      ? String((requestLike as Record<string, unknown>)['tool'] || 'chart.catalog.list') as TowerAiPlatformToolRequest['tool']
      : 'chart.catalog.list'

    return {
      success: false,
      tool: fallbackTool,
      reason: parsed.error.issues[0]?.message || 'Invalid TowerAI platform tool request',
    }
  }

  return executeParsedRequest(parsed.data)
}

export function createTowerAiPlatformToolExecutor() {
  return {
    execute: executeTowerAiPlatformTool,
  }
}
