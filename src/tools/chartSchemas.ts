import { z } from 'zod'

export const towerAiChartBrowseArgsSchema = z.object({
  chartPathId: z.string().trim().min(1).max(200).optional(),
  category: z.string().trim().min(1).max(120).optional(),
  subcategory: z.string().trim().min(1).max(120).optional(),
  item: z.string().trim().min(1).max(160).optional(),
  selectedStats: z.array(z.string().trim().min(1).max(120)).max(12).optional(),
}).strict().superRefine((value, ctx) => {
  if (value.chartPathId) return
  if (value.item && (!value.category || !value.subcategory)) {
    if (!value.category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'category is required when item is provided',
        path: ['category'],
      })
    }
    if (!value.subcategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'subcategory is required when item is provided',
        path: ['subcategory'],
      })
    }
  }
  if (value.subcategory && !value.category) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'category is required when subcategory is provided',
      path: ['category'],
    })
  }
})

export const towerAiChartBrowseRequestSchema = z.object({
  tool: z.literal('chart.browse'),
  args: towerAiChartBrowseArgsSchema,
}).strict()

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
