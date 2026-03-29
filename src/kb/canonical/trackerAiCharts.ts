import { summarizeCanonicalToolDataset } from '@tmrxjd/platform/tools'
import {
  type TrackerAiSharedChartKbRecord,
  CHARTS_AI_FACTS,
  CHARTS_BROWSER_CONTROL_FACTS,
  CHARTS_BROWSER_OVERVIEW_FACTS,
  CHARTS_BROWSER_PREVIEW_FACTS,
  CHARTS_GT_SOURCE_REVIEW_FACTS,
  CHART_CATALOG_INVENTORY_FACTS,
  CHART_STUDIO_IMPORT_FACTS,
  CHART_STUDIO_MODE_FACTS,
  CHART_STUDIO_OVERVIEW_FACTS,
  CHART_STUDIO_SPREADSHEET_FACTS,
  CHART_STUDIO_SYNC_FACTS,
  CHART_STUDIO_VISUALIZATION_FACTS,
  getTrackerAiSharedChartKbRecords,
} from './trackerAiChartsSource'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function formatArgs(args: readonly string[]): string {
  return args.length > 0 ? args.join(', ') : 'none'
}

function formatFallbacks(fallbacks: readonly string[]): string {
  return fallbacks.length > 0 ? fallbacks.join(', ') : 'none'
}

function sanitizeInlineText(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/[<>`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildAtomicChartDisambiguation(description: string): string {
  return `${description} This chunk describes the mechanic itself, not its interactions.`
}

function buildAtomicChartChunk(
  record: Omit<Parameters<typeof buildAtomicKbChunk>[0], 'disambiguation'> & { disambiguation: string },
): KBChunkRecord {
  return buildAtomicKbChunk({
    ...record,
    disambiguation: buildAtomicChartDisambiguation(record.disambiguation),
  })
}

function buildSharedChartChunk(record: TrackerAiSharedChartKbRecord): KBChunkRecord {
  const chunkId = `trackerai_chart_catalog_${slugify(record.pathId)}_01`
  const mechanicName = `Shared Chart ${record.pathId}`
  const previewParagraph = record.previewTitle
    ? `A built-in site preview is available with preview title ${record.previewTitle}, ${record.previewColumnCount} preview columns, and ${record.previewRowCount} preview rows.`
    : 'This path does not currently expose a built-in site table preview and is primarily represented as the packaged chart render.'

  const creditParagraph = record.creatorCredit
    ? `Creator credit on this packaged chart is ${sanitizeInlineText(record.creatorCredit)}.`
    : 'This packaged chart path does not declare a separate creator credit in the renderer registry.'

  return buildAtomicChartChunk({
    chunk_id: chunkId,
    source: 'Chart System Site Knowledge Source',
    section: 'TrackerAI',
    topic: `${record.category} / ${record.subcategory} / ${record.item}`,
    title: `Shared Chart Catalog Entry: ${record.title}`,
    disambiguation: `This chunk is about the shared chart catalog path ${record.pathId} and its packaged output, not every other chart path that may reuse renderer key ${record.rendererKey}. It is not generic gameplay advice beyond the packaged chart output.`,
    mechanics: [mechanicName],
    tags: [
      'trackerai',
      'charts',
      'shared chart',
      record.rendererKey,
      record.category.toLowerCase(),
      record.item.toLowerCase(),
    ],
    paragraphs: [
      `This shipped shared chart is selected from Category ${record.category}, Subcategory ${record.subcategory}, and Chart ${record.item}. Its canonical chart path id is ${record.pathId}.`,
      `The packaged render for this path uses renderer key ${record.rendererKey}, file name ${record.fileName}, color hint ${record.colorHex}, and runtime args ${formatArgs(record.args)}.`,
      record.description,
      `Baseline chart metadata for this path currently records formula plan count ${record.baselineFormulaPlanCount ?? 0}, named range count ${record.baselineNamedRangeCount ?? 0}, and materialized fallbacks ${formatFallbacks(record.materializedFallbacks)}.`,
      previewParagraph,
      creditParagraph,
    ],
  })
}

function buildSharedChartDatasetSummaryChunk(record: TrackerAiSharedChartKbRecord): KBChunkRecord | null {
  const datasetSummary = summarizeCanonicalToolDataset(record.rendererKey, record.args)
  if (!datasetSummary) return null

  return buildAtomicChartChunk({
    chunk_id: `trackerai_chart_dataset_${slugify(record.pathId)}_01`,
    source: 'Chart System Site Knowledge Source',
    section: 'TrackerAI',
    topic: `${record.category} / ${record.subcategory} / ${record.item} dataset summary`,
    title: `Shared Chart Dataset Summary: ${record.title}`,
    disambiguation: `This chunk is about the packaged tabular dataset behind shared chart path ${record.pathId}, not only the rendered chart image or generic gameplay prose.`,
    mechanics: [`Shared Chart ${record.pathId}`, `Shared Chart Dataset ${record.pathId}`],
    tags: [
      'trackerai',
      'charts',
      'shared chart',
      'dataset summary',
      'range',
      'levels',
      record.rendererKey,
      record.category.toLowerCase(),
      record.item.toLowerCase(),
    ],
    paragraphs: [
      `This packaged shared chart exposes a canonical lookup dataset behind renderer key ${record.rendererKey} for chart path ${record.pathId}.`,
      datasetSummary.overview,
      datasetSummary.axisSummary,
      ...datasetSummary.columnSummaries.slice(0, 8).map(summary => summary.summary),
    ],
  })
}

export function buildTrackerAiChartsCanonicalKbChunks(): KBChunkRecord[] {
  const sharedChartChunks = getTrackerAiSharedChartKbRecords().map(buildSharedChartChunk)
  const sharedChartDatasetSummaryChunks = getTrackerAiSharedChartKbRecords()
    .map(buildSharedChartDatasetSummaryChunk)
    .filter((entry): entry is KBChunkRecord => entry !== null)

  return [
    buildAtomicChartChunk({
      chunk_id: 'trackerai_charts_browser_overview_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'Charts Browser Overview',
      title: 'Charts Browser Overview',
      disambiguation: 'This chunk is about the /tools/charts browser route itself, not Chart Studio authoring or a specific chart entry.',
      mechanics: ['Charts Browser Overview'],
      tags: ['trackerai', 'charts', 'browser', 'shared charts', 'overview'],
      paragraphs: [...CHARTS_BROWSER_OVERVIEW_FACTS],
    }),
    buildAtomicChartChunk({
      chunk_id: 'trackerai_charts_browser_controls_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'Charts Browser Controls',
      title: 'Charts Browser Controls',
      disambiguation: 'This chunk is about the /tools/charts selection and shared-settings controls, not the editable chart spreadsheet surface.',
      mechanics: ['Charts Browser Controls'],
      tags: ['trackerai', 'charts', 'browser', 'palette', 'cloud sync', 'filters'],
      paragraphs: [...CHARTS_BROWSER_CONTROL_FACTS],
    }),
    buildAtomicChartChunk({
      chunk_id: 'trackerai_charts_browser_preview_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'Charts Browser Preview Output',
      title: 'Charts Browser Preview Output',
      disambiguation: 'This chunk is about how /tools/charts previews shipped chart output, not how users edit chart formulas or submit new charts.',
      mechanics: ['Charts Browser Preview Output'],
      tags: ['trackerai', 'charts', 'browser', 'preview', 'renderer'],
      paragraphs: [...CHARTS_BROWSER_PREVIEW_FACTS],
    }),
    buildAtomicChartChunk({
      chunk_id: 'trackerai_chart_studio_overview_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'Chart Studio Overview',
      title: 'Chart Studio Overview',
      disambiguation: 'This chunk is about the /tools/chart authoring route itself, not the lightweight /tools/charts browser.',
      mechanics: ['Chart Studio Overview'],
      tags: ['trackerai', 'charts', 'chart studio', 'overview', 'authoring'],
      paragraphs: [...CHART_STUDIO_OVERVIEW_FACTS],
    }),
    buildAtomicChartChunk({
      chunk_id: 'trackerai_chart_studio_modes_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'Chart Studio Modes and Actions',
      title: 'Chart Studio Modes and Actions',
      disambiguation: 'This chunk is about Chart Studio render modes and top-bar actions, not a specific chart profile or shared chart path.',
      mechanics: ['Chart Studio Modes and Actions'],
      tags: ['trackerai', 'charts', 'chart studio', 'view', 'edit', 'new'],
      paragraphs: [...CHART_STUDIO_MODE_FACTS],
    }),
    buildAtomicChartChunk({
      chunk_id: 'trackerai_chart_studio_import_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'Chart Studio Import Workflow',
      title: 'Chart Studio Import Workflow',
      disambiguation: 'This chunk is about how Chart Studio imports external files and OCR payloads, not the packaged shared chart registry by itself.',
      mechanics: ['Chart Studio Import Workflow'],
      tags: ['trackerai', 'charts', 'chart studio', 'import', 'ocr', 'daemon'],
      paragraphs: [...CHART_STUDIO_IMPORT_FACTS],
    }),
    buildAtomicChartChunk({
      chunk_id: 'trackerai_chart_studio_spreadsheet_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'Chart Studio Spreadsheet Engine',
      title: 'Chart Studio Spreadsheet Engine',
      disambiguation: 'This chunk is about the spreadsheet and function system behind Chart Studio, not a specific gameplay mechanic table.',
      mechanics: ['Chart Studio Spreadsheet Engine'],
      tags: ['trackerai', 'charts', 'chart studio', 'spreadsheet', 'named ranges', 'functions'],
      paragraphs: [...CHART_STUDIO_SPREADSHEET_FACTS],
    }),
    buildAtomicChartChunk({
      chunk_id: 'trackerai_chart_studio_visualizations_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'Chart Studio Visualization Types',
      title: 'Chart Studio Visualization Types',
      disambiguation: 'This chunk is about the generic visualization types Chart Studio can author, not the fixed shared chart catalog entries.',
      mechanics: ['Chart Studio Visualization Types'],
      tags: ['trackerai', 'charts', 'chart studio', 'visualizations', 'node charts'],
      paragraphs: [...CHART_STUDIO_VISUALIZATION_FACTS],
    }),
    buildAtomicChartChunk({
      chunk_id: 'trackerai_chart_studio_sync_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'Chart Studio Local Save and Sync',
      title: 'Chart Studio Local Save and Sync',
      disambiguation: 'This chunk is about Chart Studio local persistence, save flows, and sync handling, not general site cloud sync outside the chart system.',
      mechanics: ['Chart Studio Local Save and Sync'],
      tags: ['trackerai', 'charts', 'chart studio', 'save', 'sync', 'local persistence'],
      paragraphs: [...CHART_STUDIO_SYNC_FACTS],
    }),
    buildAtomicChartChunk({
      chunk_id: 'trackerai_charts_catalog_inventory_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'Shared Chart Catalog Inventory',
      title: 'Shared Chart Catalog Inventory',
      disambiguation: 'This chunk is about the shipped shared-chart inventory as a whole, not one individual chart path or one studio draft.',
      mechanics: ['Shared Chart Catalog Inventory'],
      tags: ['trackerai', 'charts', 'catalog', 'baseline documents', 'inventory'],
      paragraphs: [...CHART_CATALOG_INVENTORY_FACTS],
    }),
    buildAtomicChartChunk({
      chunk_id: 'trackerai_charts_gt_review_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'Golden Tower Source Review',
      title: 'Chart System Golden Tower Source Review',
      disambiguation: 'This chunk is about the remaining gap between Golden Tower source material and the currently shipped chart catalog, not Golden Tower mechanics in full isolation.',
      mechanics: ['Chart System Golden Tower Source Review'],
      tags: ['trackerai', 'charts', 'golden tower', 'source review', 'gaps'],
      paragraphs: [...CHARTS_GT_SOURCE_REVIEW_FACTS],
    }),
    buildAtomicChartChunk({
      chunk_id: 'trackerai_charts_ai_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'AI Help on Chart System',
      title: 'Chart System AI Help Coverage',
      disambiguation: 'This chunk is about how TrackerAI can help on the chart routes, not silent admin package writes or guaranteed reproduction of arbitrary private user drafts without source data.',
      mechanics: ['Chart System AI Help Coverage'],
      tags: ['trackerai', 'charts', 'ai help', 'chart studio', 'shared charts'],
      paragraphs: [...CHARTS_AI_FACTS],
    }),
    ...sharedChartChunks,
    ...sharedChartDatasetSummaryChunks,
    buildRelationalKbChunk({
      chunk_id: 'trackerai_charts_faq_browser_vs_studio_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'What is the difference between the Charts page and Chart Studio?',
      title: 'What is the difference between the Charts page and Chart Studio?',
      disambiguation: 'This chunk is about the interaction between the two chart routes, not a claim that they are interchangeable screens.',
      mechanics: ['Charts Browser Overview', 'Charts Browser Preview Output', 'Chart Studio Overview', 'Chart Studio Modes and Actions'],
      tags: ['trackerai', 'charts', 'faq', 'browser', 'chart studio'],
      interaction_type: 'cross_system',
      interaction_summary: 'Charts Browser Overview, Charts Browser Preview Output, Chart Studio Overview, and Chart Studio Modes and Actions explain why one route is a lightweight shipped-chart browser while the other is a full authoring surface.',
      paragraphs: [
        'Charts Browser Overview and Charts Browser Preview Output describe /tools/charts as a browse-and-preview route for the shipped shared chart catalog.',
        'Chart Studio Overview and Chart Studio Modes and Actions describe /tools/chart as the authoring route where users can edit existing chart-backed profiles, import outside data, or draft new submissions.',
        'The clearest answer is to name those mechanics directly: use /tools/charts when you want to browse a packaged chart quickly, and use /tools/chart when you need spreadsheet editing, imports, submissions, or chart-authoring controls.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'trackerai_charts_faq_reproduce_shared_chart_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'How can TrackerAI reproduce a built-in shared chart in chat?',
      title: 'How can TrackerAI reproduce a built-in shared chart in chat?',
      disambiguation: 'This chunk is about the interaction between the shipped chart catalog and TrackerAI help boundaries, not arbitrary private studio drafts with unknown source data.',
      mechanics: ['Shared Chart Catalog Inventory', 'Charts Browser Overview', 'Chart System AI Help Coverage', 'TrackerAI Safety Guardrails'],
      tags: ['trackerai', 'charts', 'faq', 'shared chart', 'reproduction'],
      interaction_type: 'conditional',
      interaction_summary: 'Shared Chart Catalog Inventory, Charts Browser Overview, Chart System AI Help Coverage, and TrackerAI Safety Guardrails define when TrackerAI can identify and reproduce a shipped shared chart versus when it should ask for the user document or source data.',
      paragraphs: [
        'Shared Chart Catalog Inventory and Charts Browser Overview explain that built-in shared charts have canonical category, subcategory, item, path id, renderer key, and packaged output metadata instead of existing only as ad hoc user drafts.',
        'Chart System AI Help Coverage is why TrackerAI can use that identity to point to the right chart path or reproduce the correct shipped chart request in chat, while TrackerAI Safety Guardrails prevents it from pretending every private studio draft already has a packaged shared-chart equivalent.',
        'The clearest answer is to name those mechanics directly: TrackerAI can reproduce built-in shared charts by their catalog identity, but custom studio charts still need the actual imported data or saved document state.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'trackerai_charts_faq_imports_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'What import workflows does Chart Studio support?',
      title: 'What import workflows does Chart Studio support?',
      disambiguation: 'This chunk is about the interaction between file import, OCR import, and the studio spreadsheet engine, not a claim that every source becomes a perfect chart automatically.',
      mechanics: ['Chart Studio Import Workflow', 'Chart Studio Spreadsheet Engine', 'Chart Studio Visualization Types'],
      tags: ['trackerai', 'charts', 'faq', 'import', 'ocr', 'spreadsheet'],
      interaction_type: 'cross_system',
      interaction_summary: 'Chart Studio Import Workflow, Chart Studio Spreadsheet Engine, and Chart Studio Visualization Types explain how imported files and OCR payloads become editable chart profiles and eventual visualizations.',
      paragraphs: [
        'Chart Studio Import Workflow explains the accepted file formats and the daemon OCR requirement for image imports.',
        'Chart Studio Spreadsheet Engine explains how those imports are normalized into named ranges, table bindings, and a function-aware workbook-style document, while Chart Studio Visualization Types explains the chart or node outputs the document can drive after import.',
        'The clearest answer is to name those mechanics directly: Chart Studio can import spreadsheet-like files locally or through the daemon, and it can import images through daemon OCR into an editable chart profile before the user shapes the final visualization.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'trackerai_charts_faq_gt_gap_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'What Golden Tower source material exists outside the current chart catalog?',
      title: 'What Golden Tower source material exists outside the current chart catalog?',
      disambiguation: 'This chunk is about the interaction between the Golden Tower shared chart path and the broader Golden Tower structured source, not a claim that the chart catalog is missing all Golden Tower coverage.',
      mechanics: [
        'Shared Chart ultimate-weapons:stone-costs:golden-tower',
        'Shared Chart ultimate-weapons:golden-tower:golden-combo-relative-income',
        'Shared Chart ultimate-weapons:golden-tower:golden-combo-relative-income-100-gt-uptime',
        'Shared Chart milestones:ultimate-weapons:golden-tower-lab-unlocks',
        'Shared Chart Catalog Inventory',
        'Chart System Golden Tower Source Review',
      ],
      tags: ['trackerai', 'charts', 'faq', 'golden tower', 'source review'],
      interaction_type: 'cross_system',
      interaction_summary: 'Golden Tower shared chart entries, Shared Chart Catalog Inventory, and Chart System Golden Tower Source Review explain which Golden Tower slices are already charted and which source sections still remain as non-chart prose.',
      paragraphs: [
        'Shared Chart Catalog Inventory is the catalog-wide mechanic that confirms Golden Tower now has multiple shipped entries rather than only its stone-cost table.',
        'Shared Chart ultimate-weapons:stone-costs:golden-tower, Shared Chart ultimate-weapons:golden-tower:golden-combo-relative-income, Shared Chart ultimate-weapons:golden-tower:golden-combo-relative-income-100-gt-uptime, and Shared Chart milestones:ultimate-weapons:golden-tower-lab-unlocks are the specific Golden Tower chart mechanics listed inside that Shared Chart Catalog Inventory surface.',
        'Chart System Golden Tower Source Review is still the gap callout because the broader Golden Tower structured source also contains prose-level Formula and Behavior explanations that help AI reasoning even after the comparison and milestone tables are charted.',
        'The clearest answer is to name those mechanics directly: Golden Tower stone costs, Golden Combo comparison math, uptime comparison math, and the milestone lab unlock path are charted today, while the remaining behavior explanation still lives as structured source prose.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'trackerai_charts_faq_sync_and_package_01',
      source: 'Chart System Site Knowledge Source',
      section: 'TrackerAI',
      topic: 'How does Chart Studio save and sync work, and what is different about Save To Package?',
      title: 'How does Chart Studio save and sync work, and what is different about Save To Package?',
      disambiguation: 'This chunk is about the interaction between normal Chart Studio save flows and the admin-only package-write path, not a promise that both are equally available to normal users.',
      mechanics: ['Chart Studio Local Save and Sync', 'Chart Studio Overview', 'TrackerAI Safety Guardrails'],
      tags: ['trackerai', 'charts', 'faq', 'save', 'sync', 'package'],
      interaction_type: 'conditional',
      interaction_summary: 'Chart Studio Local Save and Sync, Chart Studio Overview, and TrackerAI Safety Guardrails explain how normal local and cloud save flows differ from the separate admin-only package-write action.',
      paragraphs: [
        'Chart Studio Local Save and Sync explains the normal user-facing flow: local draft persistence, saved config persistence, session persistence, and explicit sync-conflict decisions instead of silent overwrites.',
        'Chart Studio Overview explains that these are part of normal authoring use, while TrackerAI Safety Guardrails is the reason the separate Save To Package path should not be treated as a normal non-admin AI action even though it appears in the studio UI for admins.',
        'The clearest answer is to name those mechanics directly: normal save and sync keep the chart work in local and optional cloud-backed user config, while Save To Package is a separate admin-only source-writing action.',
      ],
    }),
  ]
}
