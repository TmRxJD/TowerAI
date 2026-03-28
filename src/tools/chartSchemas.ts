import { z } from 'zod'

export const towerAiChartCatalogListArgsSchema = z.object({
  category: z.string().trim().min(1).max(120).optional(),
  subcategory: z.string().trim().min(1).max(120).optional(),
}).strict()

export const towerAiChartCatalogListRequestSchema = z.object({
  tool: z.literal('chart.catalog.list'),
  args: towerAiChartCatalogListArgsSchema,
}).strict()

export const towerAiChartTablePreviewArgsSchema = z.object({
  category: z.string().trim().min(1).max(120),
  subcategory: z.string().trim().min(1).max(120),
  item: z.string().trim().min(1).max(160),
}).strict()

export const towerAiChartTablePreviewRequestSchema = z.object({
  tool: z.literal('chart.preview.table'),
  args: towerAiChartTablePreviewArgsSchema,
}).strict()
