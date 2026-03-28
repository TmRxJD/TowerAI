import {
  createChartRenderRequest,
  getAllChartPaths,
  getChartCategoryNames,
  getChartItemNames,
  getChartPath,
  getChartSubcategoryNames,
  getChartTablePreview,
} from '@tmrxjd/platform/tools'
import type {
  towerAiChartCatalogListArgsSchema,
  towerAiChartTablePreviewArgsSchema,
} from './chartSchemas'
import type { z } from 'zod'

export type TowerAiChartCatalogListArgs = z.infer<typeof towerAiChartCatalogListArgsSchema>
export type TowerAiChartTablePreviewArgs = z.infer<typeof towerAiChartTablePreviewArgsSchema>

export function listChartCatalog(args: TowerAiChartCatalogListArgs) {
  const category = args.category?.trim()
  const subcategory = args.subcategory?.trim()

  if (!category) {
    return {
      categories: getChartCategoryNames(),
      paths: getAllChartPaths(),
    }
  }

  const subcategories = getChartSubcategoryNames(category)
  if (!subcategory) {
    return {
      category,
      subcategories,
      paths: getAllChartPaths().filter(path => path.category === category),
    }
  }

  return {
    category,
    subcategory,
    items: getChartItemNames(category, subcategory),
    paths: getAllChartPaths().filter(path => path.category === category && path.subcategory === subcategory),
  }
}

export function buildChartTablePreview(args: TowerAiChartTablePreviewArgs) {
  const path = getChartPath(args.category, args.subcategory, args.item)
  if (!path) {
    throw new Error(`Unknown chart path: ${args.category} / ${args.subcategory} / ${args.item}`)
  }

  const request = createChartRenderRequest(path)
  if (!request) {
    throw new Error(`Unable to build chart render request for: ${path.id}`)
  }

  const tablePreview = getChartTablePreview(request)
  return {
    path,
    request,
    tablePreview,
  }
}
