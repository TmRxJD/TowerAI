import {
  autoSelectSingleChartState,
  createChartRenderRequest,
  getAllChartPaths,
  getAvailableChartStatLabels,
  getChartCategoryNames,
  getChartItemNames,
  getChartPath,
  getChartSubcategoryNames,
  getChartTablePreview,
  normalizeChartState,
} from '@tmrxjd/platform/tools'
import type {
  towerAiChartBrowseArgsSchema,
  towerAiChartCatalogListArgsSchema,
  towerAiChartTablePreviewArgsSchema,
} from './chartSchemas'
import type { z } from 'zod'

export type TowerAiChartBrowseArgs = z.infer<typeof towerAiChartBrowseArgsSchema>
export type TowerAiChartCatalogListArgs = z.infer<typeof towerAiChartCatalogListArgsSchema>
export type TowerAiChartTablePreviewArgs = z.infer<typeof towerAiChartTablePreviewArgsSchema>

function resolveChartPath(args: TowerAiChartBrowseArgs) {
  const resolvedState = autoSelectSingleChartState(normalizeChartState({
    ...(args.chartPathId
      ? (() => {
          const path = getAllChartPaths().find(entry => entry.id === args.chartPathId)
          return path
            ? { category: path.category, subcategory: path.subcategory, item: path.item, selectedStats: args.selectedStats }
            : { selectedStats: args.selectedStats }
        })()
      : {
          category: args.category,
          subcategory: args.subcategory,
          item: args.item,
          selectedStats: args.selectedStats,
        }),
  }))

  if (!resolvedState.category || !resolvedState.subcategory || !resolvedState.item) {
    return { path: null, state: resolvedState }
  }

  return {
    state: resolvedState,
    path: getChartPath(resolvedState.category, resolvedState.subcategory, resolvedState.item),
  }
}

export function browseChartCatalog(args: TowerAiChartBrowseArgs) {
  const resolved = resolveChartPath(args)
  if (resolved.path) {
    const request = createChartRenderRequest(resolved.path)
    if (!request) {
      throw new Error(`Unable to build chart render request for: ${resolved.path.id}`)
    }

    return {
      category: resolved.path.category,
      subcategory: resolved.path.subcategory,
      item: resolved.path.item,
      path: resolved.path,
      state: resolved.state,
      request,
      tablePreview: getChartTablePreview(request),
      selectedStats: resolved.state.selectedStats,
      availableStats: getAvailableChartStatLabels(resolved.state),
    }
  }

  const fallback = listChartCatalog({
    category: resolved.state.category ?? undefined,
    subcategory: resolved.state.subcategory ?? undefined,
  })

  return {
    ...fallback,
    state: resolved.state,
  }
}

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
