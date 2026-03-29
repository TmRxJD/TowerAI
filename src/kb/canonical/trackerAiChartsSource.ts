import {
  createChartRenderRequest,
  getAllChartPaths,
  getBaselineChartDocumentMetadata,
  getChartTablePreview,
  listBaselineChartDocumentIds,
  sharedChartRendererRegistry,
} from '@tmrxjd/platform/tools'

export type TrackerAiSharedChartKbRecord = {
  pathId: string
  category: string
  subcategory: string
  item: string
  rendererKey: string
  title: string
  description: string
  fileName: string
  colorHex: string
  creatorCredit: string | null
  args: readonly string[]
  baselineFormulaPlanCount: number | null
  baselineNamedRangeCount: number | null
  materializedFallbacks: readonly string[]
  previewTitle: string | null
  previewColumnCount: number
  previewRowCount: number
}

export type TrackerAiChartCatalogStats = {
  chartCount: number
  rendererCount: number
  baselineDocumentCount: number
  categorySummaries: string[]
  duplicateRendererSummaries: string[]
}

function buildCategorySummaries(): string[] {
  const counts = new Map<string, number>()
  for (const path of getAllChartPaths()) {
    counts.set(path.category, (counts.get(path.category) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([category, count]) => `${category} (${count})`)
}

function buildDuplicateRendererSummaries(): string[] {
  const pathsByRenderer = new Map<string, string[]>()

  for (const entry of sharedChartRendererRegistry) {
    const existing = pathsByRenderer.get(entry.rendererKey) ?? []
    existing.push(entry.pathId)
    pathsByRenderer.set(entry.rendererKey, existing)
  }

  return [...pathsByRenderer.entries()]
    .filter(([, pathIds]) => pathIds.length > 1)
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([rendererKey, pathIds]) => `${rendererKey}: ${pathIds.join(', ')}`)
}

export function getTrackerAiChartCatalogStats(): TrackerAiChartCatalogStats {
  return {
    chartCount: sharedChartRendererRegistry.length,
    rendererCount: new Set(sharedChartRendererRegistry.map(entry => entry.rendererKey)).size,
    baselineDocumentCount: listBaselineChartDocumentIds().length,
    categorySummaries: buildCategorySummaries(),
    duplicateRendererSummaries: buildDuplicateRendererSummaries(),
  }
}

export function getTrackerAiSharedChartKbRecords(): TrackerAiSharedChartKbRecord[] {
  const records: TrackerAiSharedChartKbRecord[] = []

  for (const path of getAllChartPaths()) {
      const request = createChartRenderRequest(path)
      if (!request) continue

      const metadata = getBaselineChartDocumentMetadata(path.id)
      const preview = getChartTablePreview(request)

      records.push({
        pathId: path.id,
        category: path.category,
        subcategory: path.subcategory,
        item: path.item,
        rendererKey: request.rendererKey,
        title: request.definition.title,
        description: request.definition.description,
        fileName: request.definition.fileName,
        colorHex: request.definition.colorHex,
        creatorCredit: request.definition.creatorCredit ?? null,
        args: request.args,
        baselineFormulaPlanCount: metadata?.formulaPlanCount ?? null,
        baselineNamedRangeCount: metadata?.namedRangeCount ?? null,
        materializedFallbacks: metadata?.materializedFallbacks ?? [],
        previewTitle: preview?.title ?? null,
        previewColumnCount: preview?.columns.length ?? 0,
        previewRowCount: preview?.rows.length ?? 0,
      })
  }

  return records.sort((left, right) => left.pathId.localeCompare(right.pathId))
}

const chartCatalogStats = getTrackerAiChartCatalogStats()

export const CHARTS_BROWSER_OVERVIEW_FACTS = [
  'Charts is the browse-and-preview route at /tools/charts. It is the lightweight catalog surface for selecting one shipped shared chart path by Category, Subcategory, and Chart, then previewing its packaged image and any available table preview.',
  `The current shared chart catalog exposes ${chartCatalogStats.chartCount} shipped chart paths across ${chartCatalogStats.categorySummaries.length} top-level categories rather than a freeform chart search box.`,
  'This route is about consuming the existing shared chart catalog, not editing formulas or building a new chart document from scratch.',
] as const

export const CHARTS_BROWSER_CONTROL_FACTS = [
  'The browser route starts with shared tool settings controls for Cloud sync preference and Chart palette preset, then uses three dependent selects for Category, Subcategory, and Chart.',
  'Changing the category clears the lower-level selections, and changing the subcategory clears the selected chart, so the route always resolves a valid full chart path before attempting to render anything.',
  'The hydrated shared-tool-settings store gates the page, which prevents the browser from flashing default palette or sync values before local and optional cloud-backed settings are loaded.',
] as const

export const CHARTS_BROWSER_PREVIEW_FACTS = [
  'Once a valid shared chart path is selected, the page resolves a render request containing the chart path id, renderer key, packaged file name, and runtime args, then renders the chart image in-browser.',
  'If a built-in site table preview exists for that chart, the route also shows a compact table with the preview title, column headers, and preview rows beneath the image instead of limiting the user to image-only output.',
  'The browser route is read-only. It previews shipped chart metadata and render output, but it does not expose spreadsheet editing, chart submission, or package-writing actions on this route.',
] as const

export const CHART_STUDIO_OVERVIEW_FACTS = [
  'Chart Studio is the heavier authoring route at /tools/chart. It combines a chart catalog selector, spreadsheet-style editing surface, visualization insertion tools, render preview, local draft persistence, and optional cloud sync behavior.',
  'This route is not only for viewing the shipped catalog. It can load packaged baseline charts into an editable profile, create new drafts, import outside data, and submit new-chart or correction proposals through the reporting pipeline.',
  'The route uses the same shared catalog vocabulary as the browser route, so a shipped chart can be previewed at /tools/charts and then opened as a richer editable profile in /tools/chart.',
] as const

export const CHART_STUDIO_MODE_FACTS = [
  'Chart Studio supports three render modes: View, Edit, and New. View is the read-mostly preview mode, Edit is for working on an existing chart-backed profile, and New is for drafting a new chart or imported profile for review.',
  'The top bar changes by mode. New mode exposes Import and Submit, Edit mode exposes Submit Correction, and both non-view modes expose Save, Restore, Undo, and Redo.',
  'When the selected category is the special Settings category, the route restricts the available render mode list to Edit only because that path is meant for global style preview rather than normal chart browsing or submission.',
] as const

export const CHART_STUDIO_IMPORT_FACTS = [
  'Chart Studio accepts .csv, .xlsx, .xls, .json, and image imports from the hidden file picker. Non-image files can be imported locally or through the TrackerAI daemon import path when the daemon handshake is available.',
  'Image imports are different: they require the TrackerAI daemon OCR service. The route base64-encodes the image, sends it to daemon OCR, converts the OCR payload into an imported chart profile, and then enhances the resulting profile for OCR-oriented chart binding.',
  'If daemon import is available for non-image data, the route prefers daemon-side import parsing. Otherwise it falls back to the local file importer in the browser.',
] as const

export const CHART_STUDIO_SPREADSHEET_FACTS = [
  'The studio surface is backed by a spreadsheet engine built on HyperFormula plus a custom function registry, support sheets, named ranges, format presets, stat-group filters, and workbook-style sheet metadata.',
  'That spreadsheet library is game-aware rather than generic only. It includes chart function documentation and custom functions for systems like bots, labs, modules, workshop, damage reduction, thorns, vault, relics, themes, and ultimate weapons.',
  'Named ranges and stat groups are important because many editable chart profiles depend on those bindings to decide which range or table column feeds the final rendered chart or filter controls.',
] as const

export const CHART_STUDIO_VISUALIZATION_FACTS = [
  'Chart Studio can insert or manage more than plain tables. Its context actions include images, bar charts, line graphs, histograms, scatter charts, pie charts, donut charts, area charts, radar charts, box plots, heatmaps, and node-style visualizations.',
  'Node-style visualizations matter for packaged charts like the Harmony Tree and Power Tree, where the chart is not just a flat table but a positioned node graph with parent-child connectors.',
  'That means the chart system has two different output families: shipped shared charts with fixed registry paths, and user-authored studio visualizations built from editable document state.',
] as const

export const CHART_STUDIO_SYNC_FACTS = [
  'Chart Studio keeps a local draft, a saved local config, and a session record in IndexedDB-backed local persistence so work can survive reloads without relying on localStorage. Preview renders are coalesced and local draft writes are debounced through dedicated schedulers.',
  'The route also supports a sync-conflict dialog with explicit Load, Save, and Cancel choices, so cloud-backed chart config conflicts are not resolved silently when timestamps disagree.',
  'Saving to the package source is separate from normal use. The Save To Package action requires admin access, and non-admin TrackerAI flows should treat that as outside normal user-accessible scope even though it exists in the UI for admins.',
] as const

export const CHART_CATALOG_INVENTORY_FACTS = [
  `The shared chart registry currently contains ${chartCatalogStats.chartCount} shipped chart paths mapped onto ${chartCatalogStats.rendererCount} renderer keys.`,
  `The packaged baseline document set currently contains ${chartCatalogStats.baselineDocumentCount} baseline chart documents, which is the same surface the studio can load for shipped chart-backed profiles.`,
  `Current chart categories in the shipped catalog are ${chartCatalogStats.categorySummaries.join(', ')}.`,
  `Some renderer keys are reused across multiple catalog paths instead of being unique one-offs. Current multi-path renderers include ${chartCatalogStats.duplicateRendererSummaries.join('; ')}.`,
] as const

export const CHARTS_GT_SOURCE_REVIEW_FACTS = [
  'Golden Tower is now represented in the shared chart catalog by the stone-cost chart path, two Golden Combo comparison charts, and a milestone unlock chart for Golden Tower Bonus and Golden Tower Duration labs.',
  'The new chart coverage surfaces Golden Combo relative-income comparisons for normal use and 100% GT uptime, plus the Tier 4 Wave 200 milestone unlock path that gates Golden Tower lab support.',
  'The broader Golden Tower source still contains Formula and Behavior prose that remains useful for AI explanation even after the comparison and milestone tables are charted.',
] as const

export const CHARTS_AI_FACTS = [
  'TrackerAI can help users distinguish the browse route from Chart Studio, identify the exact shipped chart path to open, explain what a packaged chart shows, and summarize which inputs or source sections are still outside the shipped chart catalog.',
  'For built-in shared charts, the assistant can refer to the exact category, subcategory, chart item, path id, renderer key, and packaged file name so the chart can be reproduced or requested consistently in chat.',
  'For arbitrary user-authored studio charts, the assistant should stay grounded in the actual document, import data, or saved profile rather than pretending every possible ad hoc studio visualization already has a packaged shared-chart identity.',
] as const
