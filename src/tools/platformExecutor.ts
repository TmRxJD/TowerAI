import {
  towerAiPlatformToolNameSet,
  towerAiPlatformToolNames,
  towerAiPlatformToolRequestSchema,
  type TowerAiPlatformToolRequest,
  type TowerAiPlatformToolResult,
} from './contracts'
import { browseChartCatalog, buildChartTablePreview, listChartCatalog } from './chartTools'
import {
  buildCalcRunPreview,
  buildBotCostPreview,
  buildGuardianCostPreview,
  buildLabProgressPreview,
  buildModuleCostPreview,
  buildShardSplitPreview,
  buildThornsBasePreview,
  buildThornsWallPreview,
  buildUptimeProjectionPreview,
  buildWorkshopCostPreview,
} from './calculatorTools'

export const towerAiExecutedToolNames = [...towerAiPlatformToolNames]

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function isToolName(value: unknown): value is TowerAiPlatformToolRequest['tool'] {
  return typeof value === 'string' && towerAiPlatformToolNameSet.has(value as TowerAiPlatformToolRequest['tool'])
}

function getChartEntryCount(data: unknown): number {
  if (!isRecord(data)) return 0
  if (Array.isArray(data.categories)) return data.categories.length
  if (Array.isArray(data.items)) return data.items.length
  if (Array.isArray(data.paths)) return data.paths.length
  return 0
}

function getFallbackToolName(requestLike: unknown): TowerAiPlatformToolRequest['tool'] {
  if (!isRecord(requestLike) || !isToolName(requestLike.tool)) {
    return 'chart.catalog.list'
  }

  return requestLike.tool
}

function summarizeResult(tool: TowerAiPlatformToolRequest['tool'], data: unknown): string {
  switch (tool) {
    case 'chart.browse':
      return 'Resolved shared chart selection'
    case 'chart.catalog.list': {
      const total = getChartEntryCount(data)
      return `Resolved ${total} chart entries`
    }
    case 'chart.preview.table':
      return 'Resolved shared chart table preview'
    case 'calc.run':
      return 'Calculated schema-driven tool result'
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
    case 'calc.guardian.costs':
      return 'Calculated guardian upgrade costs'
    case 'calc.uptime.project':
      return 'Calculated uptime projection'
    case 'calc.thorns.wall':
      return 'Calculated thorns wall chart'
    case 'calc.thorns.base':
      return 'Calculated thorns base chart'
  }
}

function executeParsedRequest(request: TowerAiPlatformToolRequest): TowerAiPlatformToolResult {
  try {
    switch (request.tool) {
      case 'chart.browse':
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, request.args),
          data: browseChartCatalog(request.args),
        }
      case 'chart.catalog.list':
        {
          const data = listChartCatalog(request.args)
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, data),
          data,
        }
        }
      case 'chart.preview.table':
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, request.args),
          data: buildChartTablePreview(request.args),
        }
      case 'calc.run':
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, request.args),
          data: buildCalcRunPreview(request.args),
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
      case 'calc.guardian.costs':
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, request.args),
          data: buildGuardianCostPreview(request.args),
        }
      case 'calc.uptime.project':
        return {
          success: true,
          tool: request.tool,
          summary: summarizeResult(request.tool, request.args),
          data: buildUptimeProjectionPreview(request.args),
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
    return {
      success: false,
      tool: getFallbackToolName(requestLike),
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
