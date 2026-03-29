/// <reference types="vite/client" />

import katex from 'katex'
import 'katex/dist/katex.min.css'
import MarkdownIt from 'markdown-it'
import {
  BOT_UPGRADES_DATA,
  buildGuardianDefinitions,
  getSharedToolLabs,
  moduleTypes,
  TRACKER_AI_UPTIME_SUBJECT_KEYS,
} from '@tmrxjd/platform/tools'

import {
  DEFAULT_TOWER_AI_KB_ARTIFACT_PROVIDER,
  loadTowerAiKbArtifactBundle,
  type TowerAiKbArtifactBundle,
  type TowerAiKbArtifactRepoManifest,
} from '../src/core/kbArtifactClient'

type PlaygroundBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; title?: string; items: string[] }
  | { type: 'pre'; title?: string; text: string }
  | { type: 'table'; title?: string; columns: string[]; rows: string[][] }

// Keep assistant messages simple; the pipeline lives in the sidebar.
type PlaygroundMessage = {
  id: string
  role: 'assistant' | 'user' | 'system'
  text: string
  createdAt: string
  blocks?: PlaygroundBlock[]
}

type BundleChunk = {
  id: string
  title: string
  category: string
  text: string
  aliases?: string[]
  keywords?: string[]
  summary?: string
}

type ScoredChunk = {
  chunk: BundleChunk
  score: number
}

type ManifestProvider = NonNullable<TowerAiKbArtifactRepoManifest['providers'][string]>

type PipelineStepId =
  | 'input'
  | 'vision'
  | 'router'
  | 'classifier'
  | 'embedding'
  | 'retriever'
  | 'sanitizer'
  | 'ranker'
  | 'reranker'
  | 'assembler'
  | 'intent'
  | 'reasoning'
  | 'planner'
  | 'synthesizer'
  | 'post'

type PipelineStepState = {
  id: PipelineStepId
  technicalName: string
  friendlyName: string
  model: string
  healthy: boolean
  detail: string
  description: string
}

type AttachmentState = {
  file: File
  dataUrl: string
  mimeType: string
  previewUrl: string
  width: number
  height: number
}

type CloudConfig = {
  endpoint: string
  apiKey: string
  semanticModel: string
  reasoningModel: string
  deepReasoningModel: string
  fallbackReasoningModel: string
  visionModel: string
  rankingModel: string
  intentModel: string
  answerSynthesisModel: string
}

type LocalRoute = 'reasoning' | 'knowledge' | 'tool' | 'help'

type RouteInfo = {
  route: LocalRoute
  classification: string
  ambiguous: boolean
  complex: boolean
  forcedToolRequest: unknown | null
  normalizedQuestion: string
}

type IntentResult = {
  userGoal: string
  toolNeeded: boolean
  deepReasoning: boolean
  ambiguous: boolean
  modelUsed: string
  healthy: boolean
}

type ReasoningResult = {
  text: string
  modelUsed: string
  healthy: boolean
  usedFallback: boolean
}

type PlannerResult = {
  toolRequest: unknown | null
  toolNeeded: boolean
  modelUsed: string
  healthy: boolean
}

type VisionResult = {
  text: string
  modelUsed: string
  healthy: boolean
}

type LiveTest = {
  id: string
  label: string
  prompt: string
  deep?: boolean
  needsImage?: boolean
}

type LiveTestResult = {
  label: string
  passed: boolean
  items: string[]
}

type CommandGuideEntry = {
  id: string
  baseCommand: string
  syntax: string
  insertValue: string
  purpose: string
  details: string
  subOptions: string
  example: string
  mode: 'local' | 'developer'
}

type SlashSuggestion = {
  id: string
  label: string
  description: string
  completion: string
  keywords: string[]
  appendTrailingSpace?: boolean
}

type PlaceholderRange = {
  start: number
  end: number
}

const SEMANTIC_MODEL = String(import.meta.env.VITE_TOWERAI_SEMANTIC_MODEL || '').trim() || DEFAULT_TOWER_AI_KB_ARTIFACT_PROVIDER
const ENFORCED_SEMANTIC_MODEL = SEMANTIC_MODEL === DEFAULT_TOWER_AI_KB_ARTIFACT_PROVIDER
  ? SEMANTIC_MODEL
  : DEFAULT_TOWER_AI_KB_ARTIFACT_PROVIDER

const cloudConfig: CloudConfig = {
  endpoint: String(import.meta.env.VITE_TOWERAI_CLOUD_AI_ENDPOINT || '').trim(),
  apiKey: String(import.meta.env.VITE_TOWERAI_CLOUD_AI_API_KEY || '').trim(),
  semanticModel: ENFORCED_SEMANTIC_MODEL,
  reasoningModel: String(import.meta.env.VITE_TOWERAI_CLOUD_REASONING_MODEL || '').trim() || 'qwen/qwen3-32b',
  deepReasoningModel: String(import.meta.env.VITE_TOWERAI_CLOUD_DEEP_REASONING_MODEL || '').trim() || 'openai/gpt-oss-120b',
  fallbackReasoningModel: String(import.meta.env.VITE_TOWERAI_CLOUD_FALLBACK_REASONING_MODEL || '').trim() || 'openai/gpt-oss-20b',
  visionModel: String(import.meta.env.VITE_TOWERAI_CLOUD_VISION_MODEL || '').trim() || 'meta-llama/llama-4-scout-17b-16e-instruct',
  rankingModel: String(import.meta.env.VITE_TOWERAI_CLOUD_RANKING_MODEL || '').trim() || 'openai/gpt-oss-20b',
  intentModel: String(import.meta.env.VITE_TOWERAI_CLOUD_INTENT_MODEL || '').trim() || 'openai/gpt-oss-20b',
  answerSynthesisModel: String(import.meta.env.VITE_TOWERAI_CLOUD_ANSWER_SYNTHESIS_MODEL || '').trim() || 'openai/gpt-oss-20b',
}

const STANDARD_RETRIEVAL_LIMIT = 5
const DEEP_RETRIEVAL_LIMIT = 8
const DEFAULT_SEMANTIC_DIMENSIONS = 384
const MIN_CLOUD_DELAY_MS = 900
const STANDARD_REASONING_TIMEOUT_MS = 12000
const DEEP_REASONING_TIMEOUT_MS = STANDARD_REASONING_TIMEOUT_MS + 7000
const AUXILIARY_TIMEOUT_MS = 10000

const COMMAND_GUIDE: CommandGuideEntry[] = [
  {
    id: 'help',
    baseCommand: '/help',
    syntax: '/help',
    insertValue: '/help',
    purpose: 'Show the command list.',
    details: 'Use this if you want a quick reminder of the commands you can pick from.',
    subOptions: 'No sub-options.',
    example: '/help',
    mode: 'local',
  },
  {
    id: 'kb',
    baseCommand: '/kb',
    syntax: '/kb <question>',
    insertValue: '/kb ',
    purpose: 'Answer from the guide notes only.',
    details: 'This still thinks through the answer, but it stays on the guide-note path instead of jumping to chart or calculator commands.',
    subOptions: 'Your question.',
    example: '/kb What unlocks Workshop Enhancements?',
    mode: 'local',
  },
  {
    id: 'chart',
    baseCommand: '/chart',
    syntax: '/chart browse|table ...',
    insertValue: '/chart category=<category> subcategory=<subcategory> item=<item>',
    purpose: 'Browse charts or open one chart table.',
    details: 'Type /chart to open a chart template, then tab between fields and replace the values you need.',
    subOptions: 'Browse charts, or open one chart table.',
    example: '/chart table "Bots" "Upgrades and Costs" "Golden Bot"',
    mode: 'local',
  },
  {
    id: 'calc',
    baseCommand: '/calc',
    syntax: '/calc <calculator> ...',
    insertValue: '/calc <calculatorId> <operation> key=<value>',
    purpose: 'Open the calculator list.',
    details: 'Type /calc to open a schema-first calculator template, then tab through the editable fields.',
    subOptions: 'Module costs, workshop costs, shard split, lab time, bot costs, wall thorns, tower thorns.',
    example: '/calc lab "Lab Speed" 40 50 60 10 0 2',
    mode: 'local',
  },
  {
    id: 'tool-json',
    baseCommand: '/tool',
    syntax: '/tool {json}',
    insertValue: '/tool ',
    purpose: 'Call the packaged tool executor with a strict JSON payload.',
    details: 'Use this for exact contract testing when you want to validate the public TowerAI tool surface instead of the playground parser shortcuts.',
    subOptions: 'One JSON payload matching the tool contract.',
    example: '/tool {"tool":"calc.lab.progress","args":{"labName":"Lab Speed","currentLevel":40,"targetLevel":50,"modifiers":{"labSpeed":60,"labRelic":10,"labDiscount":0,"speedUp":2}}}',
    mode: 'developer',
  },
]

const guardianDefinitions = buildGuardianDefinitions()
const guardianStatsByType = new Map(guardianDefinitions.map(guardian => [guardian.key, guardian.statOrder]))
const botStatsByName = new Map(BOT_UPGRADES_DATA.map(bot => [bot.name, bot.statOrder]))
const sharedLabNames = getSharedToolLabs().map(lab => lab.name).sort((left, right) => left.localeCompare(right))
const uptimeSubjectLabels: Record<string, string> = {
  gt: 'Golden Tower',
  dw: 'Death Wave',
  bh: 'Black Hole',
  ps: 'Poison Swamp',
  cf: 'Chrono Field',
  sm: 'Smart Missiles',
  ilm: 'Inner Land Mines',
  sl: 'Spotlight',
  gb: 'Golden Bot',
  ab: 'Amp Bot',
  fb: 'Flame Bot',
  tb: 'Thunder Bot',
  ATK: 'Attack Guardian',
  ALY: 'Ally Guardian',
  BTY: 'Bounty Guardian',
  FCH: 'Fetch Guardian',
  SMN: 'Summon Guardian',
  SCT: 'Scout Guardian',
}
const uptimeSubjectByLower = new Map(TRACKER_AI_UPTIME_SUBJECT_KEYS.map(subject => [subject.toLowerCase(), subject]))
const uptimeFieldOptions = ['overview', 'uptime', 'perma', 'effectiveCd', 'sync'] as const
const uptimeNumericOverrideKeys = new Set([
  'assistEffPct',
  'wavesPerBoss',
  'waLevel',
  'dwBaseWavesLevel',
  'pkgChance',
  'gtCdLevel',
  'dwCdLevel',
  'bhCdLevel',
  'cfCdLevel',
  'gtDurLab',
  'cfDurLab',
  'gtDurLevel',
  'bhDurLevel',
  'cfDurLevel',
])
const uptimeBooleanOverrideKeys = new Set(['mvnGt', 'mvnDw', 'mvnBh', 'bhPerk', 'cfDurPerk', 'dwPerk'])
const calcRunOperationSuggestionsByCalculator: Record<string, SlashSuggestion[]> = {
  bots: [createSlashSuggestion('calc-run-bots-medals', 'medalsToTarget', 'Schema-driven bot medal calculator.', 'medalsToTarget', ['bot', 'medals'])],
  uw: [
    createSlashSuggestion('calc-run-uw-stat', 'stonesToMax', 'Schema-driven UW stat stone calculator.', 'stonesToMax', ['uw', 'stones', 'stat']),
    createSlashSuggestion('calc-run-uw-all', 'stonesToMaxAllStats', 'Schema-driven UW all-stats stone calculator.', 'stonesToMaxAllStats', ['uw', 'stones', 'all']),
  ],
  labs: [createSlashSuggestion('calc-run-labs-range', 'rangeCosts', 'Schema-driven lab range calculator.', 'rangeCosts', ['lab', 'range'])],
  modules: [
    createSlashSuggestion('calc-run-modules-cost', 'moduleCost', 'Schema-driven module calculator view.', 'moduleCost', ['module', 'cost']),
    createSlashSuggestion('calc-run-modules-assist', 'assistModuleStones', 'Schema-driven assist stones calculator.', 'assistModuleStones', ['assist', 'stones']),
    createSlashSuggestion('calc-run-modules-split', 'shardSplitter', 'Schema-driven shard splitter.', 'shardSplitter', ['shards', 'split']),
    createSlashSuggestion('calc-run-modules-damage', 'damagePath', 'Schema-driven damage path projection.', 'damagePath', ['damage', 'path']),
  ],
  uptime: [createSlashSuggestion('calc-run-uptime-project', 'project', 'Schema-driven uptime projection.', 'project', ['uptime', 'project'])],
}
const calcRunKeySuggestionsByOperation: Record<string, SlashSuggestion[]> = {
  'bots/medalsToTarget': [
    createSlashSuggestion('calc-run-bot-key-bot', 'bot=', 'Bot name or alias.', 'bot=', ['bot']),
    createSlashSuggestion('calc-run-bot-key-stat', 'stat=', 'Bot stat or all.', 'stat=', ['stat']),
    createSlashSuggestion('calc-run-bot-key-start', 'startLevel=', 'Starting bot level.', 'startLevel=', ['start']),
    createSlashSuggestion('calc-run-bot-key-target', 'targetLevel=', 'Target bot level.', 'targetLevel=', ['target']),
    createSlashSuggestion('calc-run-bot-key-cooldown', 'cooldownLab=', 'Cooldown lab level.', 'cooldownLab=', ['cooldown']),
    createSlashSuggestion('calc-run-bot-key-duration', 'durationLab=', 'Duration lab level.', 'durationLab=', ['duration']),
  ],
  'uw/stonesToMax': [
    createSlashSuggestion('calc-run-uw-key-weapon', 'weapon=', 'Ultimate Weapon name or alias.', 'weapon=', ['weapon']),
    createSlashSuggestion('calc-run-uw-key-stat', 'stat=', 'Ultimate Weapon stat.', 'stat=', ['stat']),
    createSlashSuggestion('calc-run-uw-key-start', 'startLevel=', 'Starting stat level.', 'startLevel=', ['start']),
    createSlashSuggestion('calc-run-uw-key-target', 'targetLevel=', 'Target stat level.', 'targetLevel=', ['target']),
  ],
  'uw/stonesToMaxAllStats': [
    createSlashSuggestion('calc-run-uw-all-key-weapon', 'weapon=', 'Ultimate Weapon name or alias.', 'weapon=', ['weapon']),
    createSlashSuggestion('calc-run-uw-all-key-start', 'startLevel=', 'Starting stat level.', 'startLevel=', ['start']),
  ],
  'labs/rangeCosts': [
    createSlashSuggestion('calc-run-lab-key-name', 'labName=', 'Lab name.', 'labName=', ['lab']),
    createSlashSuggestion('calc-run-lab-key-current', 'currentLevel=', 'Current level.', 'currentLevel=', ['current']),
    createSlashSuggestion('calc-run-lab-key-target', 'targetLevel=', 'Target level.', 'targetLevel=', ['target']),
    createSlashSuggestion('calc-run-lab-key-speed', 'speedLevel=', 'Lab speed level.', 'speedLevel=', ['speed']),
    createSlashSuggestion('calc-run-lab-key-discount', 'discountLevel=', 'Lab discount level.', 'discountLevel=', ['discount']),
    createSlashSuggestion('calc-run-lab-key-relic', 'relicPercent=', 'Relic percent.', 'relicPercent=', ['relic']),
    createSlashSuggestion('calc-run-lab-key-speedup', 'speedUp=', 'Speed up multiplier.', 'speedUp=', ['speedup']),
  ],
  'modules/moduleCost': [
    createSlashSuggestion('calc-run-mod-key-type', 'moduleType=', 'Module family.', 'moduleType=', ['module']),
    createSlashSuggestion('calc-run-mod-key-rarity', 'rarity=', 'Primary rarity.', 'rarity=', ['rarity']),
    createSlashSuggestion('calc-run-mod-key-assist-rarity', 'assistRarity=', 'Assist rarity.', 'assistRarity=', ['assist']),
    createSlashSuggestion('calc-run-mod-key-current', 'currentLevel=', 'Current primary level.', 'currentLevel=', ['current']),
    createSlashSuggestion('calc-run-mod-key-target', 'targetLevel=', 'Target primary level.', 'targetLevel=', ['target']),
    createSlashSuggestion('calc-run-mod-key-assist-current', 'assistCurrentLevel=', 'Current assist level.', 'assistCurrentLevel=', ['assist']),
    createSlashSuggestion('calc-run-mod-key-assist-target', 'assistTargetLevel=', 'Target assist level.', 'assistTargetLevel=', ['assist']),
    createSlashSuggestion('calc-run-mod-key-shard-discount', 'shardDiscount=', 'Shard discount percent.', 'shardDiscount=', ['shard']),
    createSlashSuggestion('calc-run-mod-key-coin-discount', 'coinDiscount=', 'Coin discount percent.', 'coinDiscount=', ['coin']),
    createSlashSuggestion('calc-run-mod-key-assist-eff', 'assistEffPct=', 'Assist efficiency percent.', 'assistEffPct=', ['assist']),
  ],
  'modules/assistModuleStones': [
    createSlashSuggestion('calc-run-assist-key-type', 'moduleType=', 'Module family.', 'moduleType=', ['module']),
    createSlashSuggestion('calc-run-assist-key-mult-start', 'multiplierStartLevel=', 'Multiplier start level.', 'multiplierStartLevel=', ['multiplier']),
    createSlashSuggestion('calc-run-assist-key-mult-target', 'multiplierTargetLevel=', 'Multiplier target level.', 'multiplierTargetLevel=', ['multiplier']),
    createSlashSuggestion('calc-run-assist-key-sub-start', 'substatStartLevel=', 'Substat start level.', 'substatStartLevel=', ['substat']),
    createSlashSuggestion('calc-run-assist-key-sub-target', 'substatTargetLevel=', 'Substat target level.', 'substatTargetLevel=', ['substat']),
  ],
  'modules/shardSplitter': [
    createSlashSuggestion('calc-run-split-key-type', 'moduleType=', 'Module family.', 'moduleType=', ['module']),
    createSlashSuggestion('calc-run-split-key-eff', 'assistEffPct=', 'Assist efficiency percent.', 'assistEffPct=', ['assist']),
    createSlashSuggestion('calc-run-split-key-budget', 'unspentShards=', 'Available unspent shards.', 'unspentShards=', ['shards']),
    createSlashSuggestion('calc-run-split-key-primary', 'primaryLevel=', 'Primary level.', 'primaryLevel=', ['primary']),
    createSlashSuggestion('calc-run-split-key-assist', 'assistLevel=', 'Assist level.', 'assistLevel=', ['assist']),
    createSlashSuggestion('calc-run-split-key-primary-rarity', 'primaryRarity=', 'Primary rarity.', 'primaryRarity=', ['rarity']),
    createSlashSuggestion('calc-run-split-key-assist-rarity', 'assistRarity=', 'Assist rarity.', 'assistRarity=', ['rarity']),
    createSlashSuggestion('calc-run-split-key-discount', 'shardDiscount=', 'Shard discount percent.', 'shardDiscount=', ['discount']),
  ],
  'modules/damagePath': [
    createSlashSuggestion('calc-run-dmg-key-discount', 'shardDiscount=', 'Shard discount percent.', 'shardDiscount=', ['discount']),
    createSlashSuggestion('calc-run-dmg-key-cannon-primary', 'cannonPrimaryLevel=', 'Cannon primary level.', 'cannonPrimaryLevel=', ['cannon']),
    createSlashSuggestion('calc-run-dmg-key-cannon-assist', 'cannonAssistLevel=', 'Cannon assist level.', 'cannonAssistLevel=', ['cannon']),
    createSlashSuggestion('calc-run-dmg-key-core-primary', 'corePrimaryLevel=', 'Core primary level.', 'corePrimaryLevel=', ['core']),
    createSlashSuggestion('calc-run-dmg-key-core-assist', 'coreAssistLevel=', 'Core assist level.', 'coreAssistLevel=', ['core']),
  ],
  'uptime/project': [
    createSlashSuggestion('calc-run-uptime-key-field', 'field=', 'Uptime field.', 'field=', ['field']),
    createSlashSuggestion('calc-run-uptime-key-focus', 'focusSubjects=', 'Comma-separated focus subjects.', 'focusSubjects=', ['focus']),
    createSlashSuggestion('calc-run-uptime-key-compare', 'compareSubjects=', 'Comma-separated compare subjects.', 'compareSubjects=', ['compare']),
    createSlashSuggestion('calc-run-uptime-key-kill-wave', 'includeDwKillWave=', 'Include DW kill wave.', 'includeDwKillWave=', ['dw']),
    createSlashSuggestion('calc-run-uptime-key-gt-cd', 'overrides.gtCdLevel=', 'Golden Tower cooldown override.', 'overrides.gtCdLevel=', ['gt']),
    createSlashSuggestion('calc-run-uptime-key-bh-cd', 'overrides.bhCdLevel=', 'Black Hole cooldown override.', 'overrides.bhCdLevel=', ['bh']),
    createSlashSuggestion('calc-run-uptime-key-dw-cd', 'overrides.dwCdLevel=', 'Death Wave cooldown override.', 'overrides.dwCdLevel=', ['dw']),
  ],
}

function quoteToken(value: string): string {
  return /\s/.test(value) ? `"${value}"` : value
}

function createSlashSuggestion(id: string, label: string, description: string, completion: string, keywords: string[] = []): SlashSuggestion {
  return {
    id,
    label,
    description,
    completion,
    keywords,
    appendTrailingSpace: true,
  }
}

const TOP_LEVEL_SLASH_SUGGESTIONS: SlashSuggestion[] = [
  createSlashSuggestion('top-help', '/help', 'Show the command list.', '/help', ['help', 'commands']),
  createSlashSuggestion('top-kb', '/kb', 'Stay on the guide-note answer path.', '/kb', ['kb', 'guide', 'notes']),
  createSlashSuggestion('top-chart', '/chart', 'Browse charts or open one table.', '/chart', ['chart', 'table']),
  createSlashSuggestion('top-calc', '/calc', 'Pick a calculator from the list.', '/calc', ['calc', 'calculator', 'math']),
  createSlashSuggestion('top-tool', '/tool', 'Developer-only raw tool request.', '/tool', ['tool', 'developer', 'json']),
]

const CHART_SLASH_SUGGESTIONS: SlashSuggestion[] = [
  createSlashSuggestion('chart-path-id', 'chartPathId=', 'Open a chart directly by stable path id.', 'chartPathId=', ['chart', 'path']),
  createSlashSuggestion('chart-category', 'category=', 'Filter by chart category.', 'category=', ['category']),
  createSlashSuggestion('chart-subcategory', 'subcategory=', 'Filter by chart subcategory.', 'subcategory=', ['subcategory']),
  createSlashSuggestion('chart-item', 'item=', 'Open a specific chart item.', 'item=', ['item']),
]

const CALC_SLASH_SUGGESTIONS: SlashSuggestion[] = [
  createSlashSuggestion('calc-bots', 'bots', 'Schema-driven bot medal calculators.', 'bots', ['bots', 'medals']),
  createSlashSuggestion('calc-uw', 'uw', 'Schema-driven Ultimate Weapon calculators.', 'uw', ['uw', 'stones']),
  createSlashSuggestion('calc-labs', 'labs', 'Schema-driven lab calculators.', 'labs', ['labs', 'range']),
  createSlashSuggestion('calc-modules', 'modules', 'Schema-driven module calculators.', 'modules', ['modules', 'damage', 'shards']),
  createSlashSuggestion('calc-module', 'module', 'Module upgrade costs.', 'module', ['module', 'shards', 'coins', 'levels']),
  createSlashSuggestion('calc-workshop', 'workshop', 'Workshop upgrade costs.', 'workshop', ['workshop', 'costs', 'levels']),
  createSlashSuggestion('calc-shard-split', 'shard-split', 'Shard split between two modules.', 'shard-split', ['shards', 'split', 'modules']),
  createSlashSuggestion('calc-lab', 'lab', 'Lab time and levels.', 'lab', ['lab', 'time', 'speed']),
  createSlashSuggestion('calc-bot', 'bot', 'Bot medal costs.', 'bot', ['bot', 'costs', 'golden']),
  createSlashSuggestion('calc-guardians', 'guardians', 'Guardian stat costs and pathing.', 'guardians', ['guardians', 'guardian', 'costs']),
  createSlashSuggestion('calc-uptime', 'uptime', 'Uptime projections.', 'uptime', ['uptime', 'sync', 'cooldown']),
  createSlashSuggestion('calc-thorns', 'thorns', 'Wall or base thorns breakpoints.', 'thorns', ['thorns', 'wall', 'base', 'breakpoints']),
]

const uptimeFieldSuggestions = uptimeFieldOptions.map(field => createSlashSuggestion(
  `calc-uptime-field-${field}`,
  field,
  `Use the ${field} uptime view.`,
  field,
  [field],
))

const uptimeSubjectSuggestions = TRACKER_AI_UPTIME_SUBJECT_KEYS.map(subject => createSlashSuggestion(
  `calc-uptime-subject-${subject}`,
  subject,
  uptimeSubjectLabels[subject] || subject,
  subject,
  [subject.toLowerCase(), uptimeSubjectLabels[subject]?.toLowerCase() || ''],
))

const uptimeOverrideSuggestions: SlashSuggestion[] = [
  createSlashSuggestion('calc-uptime-compare', 'compare=', 'Compare two subjects, like compare=gt,dw', 'compare=', ['compare', 'ratio', 'sync']),
  createSlashSuggestion('calc-uptime-kill-wave', 'includeDwKillWave=', 'Turn DW kill wave on or off.', 'includeDwKillWave=', ['dw', 'kill', 'wave']),
  createSlashSuggestion('calc-uptime-gt-cd', 'gtCdLevel=', 'Golden Tower cooldown override.', 'gtCdLevel=', ['gt', 'cooldown']),
  createSlashSuggestion('calc-uptime-dw-cd', 'dwCdLevel=', 'Death Wave cooldown override.', 'dwCdLevel=', ['dw', 'cooldown']),
  createSlashSuggestion('calc-uptime-bh-cd', 'bhCdLevel=', 'Black Hole cooldown override.', 'bhCdLevel=', ['bh', 'cooldown']),
  createSlashSuggestion('calc-uptime-cf-cd', 'cfCdLevel=', 'Chrono Field cooldown override.', 'cfCdLevel=', ['cf', 'cooldown']),
  createSlashSuggestion('calc-uptime-assist', 'assistEffPct=', 'Assist efficiency percent.', 'assistEffPct=', ['assist', 'efficiency']),
  createSlashSuggestion('calc-uptime-wpb', 'wavesPerBoss=', 'Waves per boss.', 'wavesPerBoss=', ['boss', 'waves']),
]

const LIVE_TESTS: LiveTest[] = [
  {
    id: 'trackerai-contract',
    label: 'TrackerAI: Local Limits',
    prompt: 'What can TowerAI do locally in this playground before a cloud API key is configured, and what still depends on the cloud models?',
  },
  {
    id: 'workshop-enhancements',
    label: 'Workshop: Enhancements',
    prompt: 'What unlocks Workshop Enhancements, and how are they different from the normal Workshop upgrade tabs?',
  },
  {
    id: 'guides-ehp',
    label: 'Guides: eHP Start',
    prompt: 'Summarize the eHP guide starting setup and the early workshop priorities it recommends.',
  },
  {
    id: 'labs-management',
    label: 'Labs: Management',
    prompt: 'What do Lab Switching, Auto Research, and Lab Search each do?',
  },
  {
    id: 'cards-slots',
    label: 'Cards: Slots',
    prompt: 'How do card slots and card slot gem costs work?',
  },
  {
    id: 'modules-basics',
    label: 'Modules: Basics',
    prompt: 'What are the four module families, and what do module pull rates describe?',
  },
  {
    id: 'uw-roster',
    label: 'Ultimate Weapons: Roster',
    prompt: 'What is the full Ultimate Weapon roster, and how are Ultimate Weapons purchased?',
  },
  {
    id: 'guilds-basics',
    label: 'Guilds: Basics',
    prompt: 'How do guild creation, guild joining, and recurring guild rewards work?',
  },
  {
    id: 'events-cycle',
    label: 'Events: Cycle',
    prompt: 'How does the event cycle work, and what are event mission tiers?',
  },
  {
    id: 'currency-overview',
    label: 'Currency: Overview',
    prompt: 'Break down the gameplay role of Cash, Coins, and Gems.',
  },
  {
    id: 'faq-visual-bug',
    label: 'FAQ: Negative Stats',
    prompt: 'Why can Black Hole, Golden Bot, or Spotlight show negative values on the stats page?',
  },
  {
    id: 'footguns-uw',
    label: 'Footguns: UW Picks',
    prompt: 'What makes a bad early Ultimate Weapon pick a real footgun instead of just a temporary inefficiency?',
    deep: true,
  },
  {
    id: 'perks-math',
    label: 'Perks: Math',
    prompt: 'How do perk wave requirements, perk choices, and standard perk math work?',
    deep: true,
  },
  {
    id: 'enemy-categories',
    label: 'Enemies: Categories',
    prompt: 'What is the difference between normal, elite, fleet, and boss enemies?',
  },
  {
    id: 'relics-usage',
    label: 'Relics: Usage',
    prompt: 'How do relic bonuses work, how do they stack, and how are relics unlocked?',
  },
  {
    id: 'tournaments-progression',
    label: 'Tournaments: Progression',
    prompt: 'How do tournament entry, tickets, promotion, and demotion work?',
    deep: true,
  },
  {
    id: 'bots-roster',
    label: 'Bots: Roster',
    prompt: 'List the permanent bot roster, the common bot aliases players use, and the bot unlock costs.',
  },
  {
    id: 'daily-missions-rewards',
    label: 'Daily Missions: Rewards',
    prompt: 'How do daily mission rewards scale, and how is the daily mission challenge pool tied to player progress?',
  },
  {
    id: 'vault-access',
    label: 'Vault: Access',
    prompt: 'When does the Vault become visible, how do Vault Keys work, and what is the difference between the Power and Harmony trees?',
  },
  {
    id: 'themes-bonus',
    label: 'Themes: Coin Bonus',
    prompt: 'How do theme categories work, and how is the passive coin bonus from owned themes calculated?',
  },
  {
    id: 'milestones-tracks',
    label: 'Milestones: Tracks',
    prompt: 'What is the difference between the milestone standard track and premium track, and how does milestone tier progression work?',
  },
  {
    id: 'tiers-rules',
    label: 'Tiers: Rules',
    prompt: 'How do tiers work, what sets the tier coin bonus, and what changes once battle conditions start?',
  },
  {
    id: 'vision-review',
    label: 'Screenshot Review',
    prompt: 'Use the screenshot as context and explain the most important game details it shows.',
    needsImage: true,
  },
]

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) {
  throw new Error('Missing playground root')
}

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
})

const sessionSeed = Math.floor(Date.now() + Math.random() * 100000)

const state = {
  provider: DEFAULT_TOWER_AI_KB_ARTIFACT_PROVIDER,
  bundle: null as TowerAiKbArtifactBundle | null,
  manifest: null as TowerAiKbArtifactRepoManifest | null,
  kbVersion: 'Not loaded',
  kbDimensions: 'Unknown',
  kbChunkCount: 'Unknown',
  status: 'Local runtime not loaded',
  runtimeHealthy: false,
  busy: false,
  messages: [] as PlaygroundMessage[],
  pendingDeepReasoning: false,
  attachment: null as AttachmentState | null,
  pipeline: [] as PipelineStepState[],
  liveTestOffset: 0,
  liveTestResult: null as LiveTestResult | null,
  slashSuggestions: [] as SlashSuggestion[],
  slashSuggestionIndex: 0,
}

const COMMAND_PLACEHOLDER_PATTERN = /<[^>\n]+>/g

app.innerHTML = `
  <div class="playground-shell">
    <aside class="playground-sidebar">
      <div class="playground-brand">
        <div class="playground-brand__eyebrow">TowerAI</div>
        <h1>Ask TowerAI</h1>
        <div class="playground-brand__caption">Powered by CatGPT</div>
        <p>Ask questions, compare choices, browse charts, and use calculators in one place.</p>
      </div>

      <section class="playground-panel">
        <div class="playground-panel__title">Runtime</div>
        <div id="status-text" class="playground-status"></div>
      </section>

      <section class="playground-panel">
        <div class="playground-panel__title">KB</div>
        <div class="playground-metadata">
          <div>
            <span class="playground-metadata__label">Version</span>
            <span id="kb-version"></span>
          </div>
          <div>
            <span class="playground-metadata__label">Chunks</span>
            <span id="kb-count"></span>
          </div>
          <div>
            <span class="playground-metadata__label">Dimensions</span>
            <span id="kb-dimensions"></span>
          </div>
        </div>
        <button id="reload-kb" class="playground-button" type="button">Reload KB</button>
      </section>

      <section class="playground-panel" title="Search, matching, and finding the best notes to answer from." aria-label="Semantic. Search, matching, and finding the best notes to answer from.">
        <div class="playground-panel__title">Semantic</div>
        <div class="playground-metadata">
          <div>
            <span class="playground-metadata__label">Model</span>
            <span id="semantic-model"></span>
          </div>
        </div>
      </section>

      <section class="playground-panel">
        <div class="playground-panel__title">Reasoning</div>
        <div class="playground-metadata">
          <div>
            <span class="playground-metadata__label">Standard</span>
            <span id="reasoning-model"></span>
          </div>
          <div>
            <span class="playground-metadata__label">Deep</span>
            <span id="deep-model"></span>
          </div>
          <div>
            <span class="playground-metadata__label">Backup</span>
            <span id="fallback-model"></span>
          </div>
        </div>
      </section>

      <section class="playground-panel">
        <div class="playground-panel__title">Vision</div>
        <div class="playground-metadata">
          <div>
            <span class="playground-metadata__label">Model</span>
            <span id="vision-model"></span>
          </div>
        </div>
      </section>

      <section class="playground-panel">
        <div class="playground-panel__title">Tests</div>
        <p class="playground-section-copy">These send real coverage prompts through chat so you can spot-check retrieval across the actual KB domains.</p>
        <div class="playground-subsection">
          <div class="playground-subsection__title">Prompt Tests</div>
          <div id="live-test-list" class="playground-quick-actions"></div>
        </div>
        <div id="live-test-result" class="playground-live-result"></div>
      </section>
    </aside>

    <main class="playground-main">
      <div class="playground-workspace">
        <section class="playground-chat">
          <header class="playground-main__header">
            <div>
              <div class="playground-main__eyebrow">Chat</div>
              <h2>Ask anything about The Tower</h2>
              <p class="playground-main__summary">Type a question, use a command, or attach a screenshot.</p>
            </div>
          </header>

          <section id="message-list" class="playground-messages"></section>

          <form id="composer-form" class="playground-composer">
            <input id="attachment-input" class="playground-hidden-input" type="file" accept="image/*" />
            <button id="attachment-button" class="playground-composer__icon" type="button" aria-label="Attach image">+</button>
            <div class="playground-composer__stack">
              <div id="attachment-strip" class="playground-attachment-strip"></div>
              <div id="composer-command-menu" class="playground-composer__menu" hidden></div>
              <textarea id="composer-input" class="playground-composer__input" rows="1" placeholder="Ask anything, or type / for commands"></textarea>
            </div>
            <button id="deep-reasoning-button" class="playground-composer__icon" type="button" aria-label="Think harder before answering">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 2c3.2 0 5.8 2.6 5.8 5.8 0 1.4-.5 2.7-1.4 3.7-.5.6-.8 1.1-.8 1.6v1.1h-2.2v-1.1c0-1.1.5-2.1 1.4-3.1.6-.6.8-1.4.8-2.2 0-2-1.6-3.6-3.6-3.6S8.4 5.8 8.4 7.8c0 .8.3 1.6.8 2.2.9 1 1.4 2 1.4 3.1v1.1H8.4v-1.1c0-.5-.3-1-.8-1.6-.9-1-1.4-2.3-1.4-3.7C6.2 4.6 8.8 2 12 2Zm-2.5 14.4h5v2h-5v-2Zm.6 3h3.8c-.2 1.4-1.3 2.6-2.7 2.6-1.4 0-2.6-1.1-2.8-2.6Z" fill="currentColor"/>
              </svg>
            </button>
            <button id="composer-send" class="playground-composer__send" type="submit" aria-label="Send message">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M3.2 11.1 19.8 4.2c.8-.3 1.5.4 1.2 1.2l-6.9 16.6c-.3.8-1.4.8-1.7 0l-2.2-5.8-5.8-2.2c-.8-.3-.8-1.4 0-1.7Zm3.8 1.2 4.5 1.7 1.7 4.5 5.1-12.2-11.3 6Z" fill="currentColor"/>
              </svg>
            </button>
          </form>
        </section>

        <aside class="playground-rail">
          <section class="playground-panel">
            <div class="playground-panel__title">Pipeline</div>
            <div id="pipeline-list" class="playground-pipeline"></div>
          </section>

          <section class="playground-panel">
            <div class="playground-panel__header">
              <div class="playground-panel__title">Commands</div>
              <button id="command-help-open" class="playground-panel__info" type="button" aria-label="Show detailed command guide" title="Show detailed command guide">i</button>
            </div>
            <p class="playground-section-copy">Type / to open the command picker. Pick a template, type your own values, and use Tab to move to the next field.</p>
            <div class="playground-subsection">
              <div class="playground-subsection__title">Quick Commands</div>
              <div id="command-list" class="playground-command-list"></div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  </div>

  <div id="command-help-dialog" class="playground-dialog-shell" hidden aria-hidden="true">
    <section class="playground-dialog" role="dialog" aria-modal="true" aria-labelledby="command-help-title">
      <div class="playground-dialog__header">
        <div>
          <div class="playground-dialog__eyebrow">Command Guide</div>
          <h3 id="command-help-title">Playground Commands</h3>
        </div>
        <button id="command-help-close" class="playground-panel__info" type="button" aria-label="Close command guide" title="Close command guide">×</button>
      </div>
      <p class="playground-section-copy">These are the only direct command paths the playground guarantees. Everything else should be asked in natural language.</p>
      <div id="command-help-body" class="playground-dialog__body"></div>
    </section>
  </div>
`

function requireNode<T>(value: T | null, key: string): T {
  if (!value) {
    throw new Error(`Playground failed to initialize ${key}`)
  }
  return value
}

const dom = {
  semanticModel: requireNode(document.querySelector<HTMLSpanElement>('#semantic-model'), 'semanticModel'),
  reloadButton: requireNode(document.querySelector<HTMLButtonElement>('#reload-kb'), 'reloadButton'),
  reasoningModel: requireNode(document.querySelector<HTMLSpanElement>('#reasoning-model'), 'reasoningModel'),
  deepModel: requireNode(document.querySelector<HTMLSpanElement>('#deep-model'), 'deepModel'),
  fallbackModel: requireNode(document.querySelector<HTMLSpanElement>('#fallback-model'), 'fallbackModel'),
  visionModel: requireNode(document.querySelector<HTMLSpanElement>('#vision-model'), 'visionModel'),
  statusText: requireNode(document.querySelector<HTMLDivElement>('#status-text'), 'statusText'),
  kbVersion: requireNode(document.querySelector<HTMLSpanElement>('#kb-version'), 'kbVersion'),
  kbCount: requireNode(document.querySelector<HTMLSpanElement>('#kb-count'), 'kbCount'),
  kbDimensions: requireNode(document.querySelector<HTMLSpanElement>('#kb-dimensions'), 'kbDimensions'),
  pipelineList: requireNode(document.querySelector<HTMLDivElement>('#pipeline-list'), 'pipelineList'),
  liveTestList: requireNode(document.querySelector<HTMLDivElement>('#live-test-list'), 'liveTestList'),
  liveTestResult: requireNode(document.querySelector<HTMLDivElement>('#live-test-result'), 'liveTestResult'),
  commandList: requireNode(document.querySelector<HTMLDivElement>('#command-list'), 'commandList'),
  commandHelpOpen: requireNode(document.querySelector<HTMLButtonElement>('#command-help-open'), 'commandHelpOpen'),
  commandHelpClose: requireNode(document.querySelector<HTMLButtonElement>('#command-help-close'), 'commandHelpClose'),
  commandHelpDialog: requireNode(document.querySelector<HTMLDivElement>('#command-help-dialog'), 'commandHelpDialog'),
  commandHelpBody: requireNode(document.querySelector<HTMLDivElement>('#command-help-body'), 'commandHelpBody'),
  messageList: requireNode(document.querySelector<HTMLElement>('#message-list'), 'messageList'),
  composerForm: requireNode(document.querySelector<HTMLFormElement>('#composer-form'), 'composerForm'),
  composerCommandMenu: requireNode(document.querySelector<HTMLDivElement>('#composer-command-menu'), 'composerCommandMenu'),
  composerInput: requireNode(document.querySelector<HTMLTextAreaElement>('#composer-input'), 'composerInput'),
  attachmentInput: requireNode(document.querySelector<HTMLInputElement>('#attachment-input'), 'attachmentInput'),
  attachmentButton: requireNode(document.querySelector<HTMLButtonElement>('#attachment-button'), 'attachmentButton'),
  attachmentStrip: requireNode(document.querySelector<HTMLDivElement>('#attachment-strip'), 'attachmentStrip'),
  deepButton: requireNode(document.querySelector<HTMLButtonElement>('#deep-reasoning-button'), 'deepButton'),
}

let toolExecutorPromise: Promise<typeof import('../src/tools/platformExecutor')> | null = null
let openAiCtorPromise: Promise<typeof import('openai')> | null = null
let cloudChain = Promise.resolve()
let lastCloudRequestAt = 0

function createId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

function hasCloudKey(): boolean {
  return Boolean(cloudConfig.apiKey && cloudConfig.endpoint)
}

function getSdkBaseUrl(endpoint: string): string {
  return endpoint.replace(/\/chat\/completions\/?$/i, '')
}

function setStatus(nextStatus: string): void {
  state.status = nextStatus
  dom.statusText.innerHTML = `
    <span class="playground-runtime ${state.runtimeHealthy ? 'is-healthy' : 'is-unhealthy'}">
      <span class="playground-runtime__icon" aria-hidden="true">${state.runtimeHealthy ? '✓' : '✕'}</span>
      <span>${escapeHtml(nextStatus)}</span>
    </span>
  `
}

function setRuntimeHealth(nextHealthy: boolean): void {
  state.runtimeHealthy = nextHealthy
  setStatus(state.status)
}

function setKbVersion(nextVersion: string): void {
  state.kbVersion = nextVersion
  dom.kbVersion.textContent = nextVersion
}

function setKbDetails(nextCount: string, nextDimensions: string): void {
  state.kbChunkCount = nextCount
  state.kbDimensions = nextDimensions
  dom.kbCount.textContent = nextCount
  dom.kbDimensions.textContent = nextDimensions
}

function renderHeaderState(): void {
  dom.semanticModel.textContent = cloudConfig.semanticModel
  dom.reasoningModel.textContent = cloudConfig.reasoningModel || 'N/A'
  dom.deepModel.textContent = cloudConfig.deepReasoningModel || 'N/A'
  dom.fallbackModel.textContent = cloudConfig.fallbackReasoningModel || 'N/A'
  dom.visionModel.textContent = cloudConfig.visionModel || 'N/A'
  dom.deepButton.classList.toggle('is-active', state.pendingDeepReasoning)
  dom.deepButton.setAttribute(
    'aria-label',
    state.pendingDeepReasoning ? 'Thinking mode is on for your next message' : 'Turn on thinking mode for your next message',
  )
  dom.deepButton.title = state.pendingDeepReasoning ? 'Thinking mode is on for your next message' : 'Turn on thinking mode for your next message'
  dom.deepButton.disabled = state.busy
}

function createInitialPipeline(): PipelineStepState[] {
  const cloudHealthy = hasCloudKey()
  return [
    { id: 'input', technicalName: 'Input Processing', friendlyName: 'Your Question', model: 'N/A', healthy: true, detail: 'Ready', description: 'Captures the message you typed and any extra context needed for the run.' },
    { id: 'vision', technicalName: 'Vision', friendlyName: 'Image Notes', model: cloudConfig.visionModel || 'N/A', healthy: cloudHealthy && Boolean(cloudConfig.visionModel), detail: 'Ready', description: 'Reads an attached screenshot and turns it into text the rest of the system can use.' },
    { id: 'router', technicalName: 'Router', friendlyName: 'Question Match', model: cloudConfig.semanticModel, healthy: true, detail: 'Ready', description: 'Decides what kind of request this is so the right path can be used.' },
    { id: 'classifier', technicalName: 'Classifier', friendlyName: 'Topic Match', model: cloudConfig.semanticModel, healthy: true, detail: 'Ready', description: 'Groups the question by topic so related knowledge can be prioritized.' },
    { id: 'embedding', technicalName: 'Embedding', friendlyName: 'Search Prep', model: cloudConfig.semanticModel, healthy: true, detail: 'Ready', description: 'Turns the request into search-friendly vectors for semantic lookup.' },
    { id: 'retriever', technicalName: 'Retriever', friendlyName: 'Library Search', model: 'N/A', healthy: Boolean(state.bundle), detail: state.bundle ? 'Ready' : 'Waiting for KB', description: 'Finds the most relevant chunks from the local knowledge base.' },
    { id: 'sanitizer', technicalName: 'Sanitizer', friendlyName: 'Cleanup', model: 'N/A', healthy: true, detail: 'Ready', description: 'Removes duplicate or noisy results before ranking them.' },
    { id: 'ranker', technicalName: 'Ranker', friendlyName: 'Local Sort', model: cloudConfig.semanticModel, healthy: true, detail: 'Ready', description: 'Applies local scoring to sort the retrieved chunks by likely usefulness.' },
    { id: 'reranker', technicalName: 'Reranker', friendlyName: 'Cloud Sort', model: cloudConfig.rankingModel || cloudConfig.semanticModel, healthy: cloudHealthy && Boolean(cloudConfig.rankingModel), detail: 'Ready', description: 'Uses the optional cloud ranker to refine the order of the strongest matches.' },
    { id: 'assembler', technicalName: 'Context Assembler', friendlyName: 'Answer Prep', model: 'N/A', healthy: true, detail: 'Ready', description: 'Builds the final context package that will be used to answer the question.' },
    { id: 'intent', technicalName: 'Intent Interpreter', friendlyName: 'Intent Check', model: cloudConfig.semanticModel, healthy: true, detail: 'Ready', description: 'Checks whether the user wants an explanation, a tool run, a comparison, or something else.' },
    { id: 'reasoning', technicalName: 'Reasoning', friendlyName: 'Draft Reply', model: cloudConfig.reasoningModel || cloudConfig.semanticModel, healthy: cloudHealthy && Boolean(cloudConfig.reasoningModel), detail: 'Ready', description: 'Creates the first full answer using the gathered context and selected mode.' },
    { id: 'planner', technicalName: 'Tool Planner / Executor', friendlyName: 'Tool Check', model: cloudConfig.semanticModel, healthy: true, detail: 'Ready', description: 'Decides whether a packaged tool should run to improve the answer.' },
    { id: 'synthesizer', technicalName: 'Answer Synthesizer', friendlyName: 'Final Reply', model: cloudConfig.semanticModel, healthy: true, detail: 'Ready', description: 'Combines the final context, tool output, and answer draft into one response.' },
    { id: 'post', technicalName: 'Post-Processor', friendlyName: 'Polish', model: 'N/A', healthy: true, detail: 'Ready', description: 'Applies the final cleanup pass before the answer is shown.' },
  ]
}

function setPipelineStep(id: PipelineStepId, patch: Partial<PipelineStepState>): void {
  state.pipeline = state.pipeline.map(step => step.id === id ? { ...step, ...patch } : step)
  renderPipeline()
}

function renderPipeline(): void {
  dom.pipelineList.innerHTML = state.pipeline.map(step => `
    <div class="playground-pipeline__row" aria-label="${escapeHtml(`${step.technicalName}. ${step.friendlyName}. ${step.description}`)}">
      <div class="playground-pipeline__text">
        <span class="playground-pipeline__name">${escapeHtml(step.technicalName)}</span>
        <div class="playground-pipeline__meta">
          <span class="playground-pipeline__model">${escapeHtml(step.model || 'N/A')}</span>
          <span class="playground-pipeline__detail ${step.healthy ? 'is-healthy' : 'is-unhealthy'}">${escapeHtml(step.detail || 'Ready')}</span>
        </div>
        <span class="playground-pipeline__description">${escapeHtml(`${step.friendlyName} - ${step.description}`)}</span>
      </div>
      <span class="playground-health ${step.healthy ? 'is-healthy' : 'is-unhealthy'}">${step.healthy ? '✓' : '✕'}</span>
    </div>
  `).join('')
  updateExpandableHeights(dom.pipelineList, '.playground-pipeline__row', '.playground-pipeline__description', '--expand-height')
}

function renderLiveTests(): void {
  dom.liveTestList.innerHTML = LIVE_TESTS.map(test => `
    <button class="playground-chip" type="button" data-live-test-id="${escapeHtml(test.id)}" title="${escapeHtml(test.prompt)}">${escapeHtml(test.label)}</button>
  `).join('')

  dom.liveTestResult.innerHTML = state.liveTestResult
    ? `
      <div class="playground-live-result__title">${escapeHtml(state.liveTestResult.label)}</div>
      <ul class="playground-live-result__list">
        ${state.liveTestResult.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    `
    : '<div class="playground-live-result__empty">Run one of the prompt tests above to see a quick result summary here.</div>'

  dom.liveTestList.querySelectorAll<HTMLButtonElement>('[data-live-test-id]').forEach(button => {
    button.addEventListener('click', async () => {
      const testId = String(button.dataset.liveTestId || '').trim()
      const test = LIVE_TESTS.find(entry => entry.id === testId)
      if (!test) return
      if (test.deep) {
        state.pendingDeepReasoning = true
        renderHeaderState()
      }
      dom.composerInput.value = test.prompt
      await submitMessage(test.prompt, test)
    })
  })
}

function insertComposerText(insertValue: string): void {
  const textarea = dom.composerInput
  const currentValue = textarea.value
  const start = textarea.selectionStart ?? currentValue.length
  const end = textarea.selectionEnd ?? currentValue.length
  const nextValue = `${currentValue.slice(0, start)}${insertValue}${currentValue.slice(end)}`
  textarea.value = nextValue
  textarea.focus()
  const nextCursor = start + insertValue.length
  textarea.setSelectionRange(nextCursor, nextCursor)
}

function findCommandPlaceholderRanges(value: string): PlaceholderRange[] {
  return Array.from(value.matchAll(COMMAND_PLACEHOLDER_PATTERN)).map(match => ({
    start: match.index || 0,
    end: (match.index || 0) + match[0].length,
  }))
}

function selectCommandPlaceholder(direction = 1): boolean {
  const textarea = dom.composerInput
  const ranges = findCommandPlaceholderRanges(textarea.value)
  if (ranges.length === 0) {
    return false
  }

  const selectionStart = textarea.selectionStart ?? 0
  const selectionEnd = textarea.selectionEnd ?? selectionStart
  const selectedIndex = ranges.findIndex(range => range.start === selectionStart && range.end === selectionEnd)

  let target: PlaceholderRange | undefined
  if (selectedIndex >= 0) {
    const offset = direction < 0 ? -1 : 1
    target = ranges[(selectedIndex + offset + ranges.length) % ranges.length]
  } else if (direction < 0) {
    target = [...ranges].reverse().find(range => range.end < selectionStart) || ranges[ranges.length - 1]
  } else {
    target = ranges.find(range => range.start > selectionEnd) || ranges[0]
  }

  if (!target) {
    return false
  }

  textarea.focus()
  textarea.setSelectionRange(target.start, target.end)
  return true
}

function applyComposerValue(nextValue: string): void {
  dom.composerInput.value = nextValue
  dom.composerInput.focus()
  if (!selectCommandPlaceholder()) {
    const nextCursor = nextValue.length
    dom.composerInput.setSelectionRange(nextCursor, nextCursor)
  }
  updateSlashSuggestions()
}

function renderCommandGuide(): void {
  const visibleEntries = COMMAND_GUIDE.filter(entry => entry.mode === 'local')
  dom.commandList.innerHTML = visibleEntries.map(entry => `
    <div class="playground-command-row">
      <div class="playground-command-row__body">
        <code class="playground-command-row__syntax">${escapeHtml(entry.baseCommand)}</code>
        <div class="playground-command-row__expand">
          <div class="playground-command-row__purpose">${escapeHtml(entry.purpose)}</div>
          <div class="playground-command-row__details">${escapeHtml(entry.details)}</div>
          <div class="playground-command-row__details"><strong>Options:</strong> ${escapeHtml(entry.subOptions)}</div>
          <div class="playground-command-row__details"><strong>Syntax:</strong> ${escapeHtml(entry.syntax)}</div>
        </div>
      </div>
      <button class="playground-command-row__action" type="button" data-command-insert-id="${escapeHtml(entry.id)}" aria-label="Add command example to composer" title="Add example to composer">
        <span aria-hidden="true">+</span>
      </button>
    </div>
  `).join('')

  dom.commandHelpBody.innerHTML = COMMAND_GUIDE.map(entry => `
    <section class="playground-command-card">
      <div class="playground-command-card__meta">
        <code class="playground-command-card__syntax">${escapeHtml(entry.syntax)}</code>
        <span class="playground-command-card__mode is-${escapeHtml(entry.mode)}">${escapeHtml(entry.mode === 'developer' ? 'developer path' : 'local path')}</span>
      </div>
      <p class="playground-command-card__purpose">${escapeHtml(entry.purpose)}</p>
      <p class="playground-command-card__details">${escapeHtml(entry.details)}</p>
      <div class="playground-command-card__example-label">Example</div>
      <pre class="playground-command-card__example">${escapeHtml(entry.example)}</pre>
    </section>
  `).join('')

  dom.commandList.querySelectorAll<HTMLButtonElement>('[data-command-insert-id]').forEach(button => {
    button.addEventListener('click', () => {
      const commandId = String(button.dataset.commandInsertId || '').trim()
      const command = COMMAND_GUIDE.find(entry => entry.id === commandId)
      if (!command) return
      insertComposerText(command.insertValue)
      if (!selectCommandPlaceholder()) {
        updateSlashSuggestions()
      }
    })
  })

  updateExpandableHeights(dom.commandList, '.playground-command-row', '.playground-command-row__expand', '--expand-height')
}

function updateExpandableHeights(root: ParentNode, rowSelector: string, contentSelector: string, variableName: string): void {
  root.querySelectorAll<HTMLElement>(rowSelector).forEach(row => {
    const content = row.querySelector<HTMLElement>(contentSelector)
    if (!content) return
    row.style.setProperty(variableName, `${Math.ceil(content.scrollHeight + 8)}px`)
  })
}

function splitCommandArgs(input: string): string[] {
  const matches = input.match(/"([^"]*)"|'([^']*)'|(\S+)/g) || []
  return matches.map(token => token.replace(/^['"]|['"]$/g, ''))
}

function getSlashContext(input: string): { tokens: string[]; fragment: string } | null {
  const trimmed = input.trimStart()
  if (!trimmed.startsWith('/')) return null

  const tokens = splitCommandArgs(trimmed)
  if (/\s$/.test(trimmed)) {
    return { tokens, fragment: '' }
  }

  if (tokens.length === 0) {
    return { tokens: [], fragment: trimmed }
  }

  return {
    tokens: tokens.slice(0, -1),
    fragment: tokens[tokens.length - 1]?.toLowerCase() || '',
  }
}

function filterSlashSuggestions(suggestions: SlashSuggestion[], fragment: string): SlashSuggestion[] {
  const query = fragment.replace(/^\//, '').trim().toLowerCase()
  return suggestions.filter(item => {
    if (!query) return true
    const haystack = [item.label, item.description, ...item.keywords].join(' ').toLowerCase()
    return haystack.includes(query)
  }).slice(0, 12)
}

function getCalcSubSuggestions(tokens: string[], fragment: string): SlashSuggestion[] {
  const calcType = String(tokens[1] || '').toLowerCase()

  if (!calcType) {
    return filterSlashSuggestions(CALC_SLASH_SUGGESTIONS, fragment)
  }

  if (calcRunOperationSuggestionsByCalculator[calcType] && tokens.length === 2) {
    return filterSlashSuggestions(calcRunOperationSuggestionsByCalculator[calcType], fragment)
  }

  if (calcRunOperationSuggestionsByCalculator[calcType] && tokens.length >= 3) {
    const operation = String(tokens[2] || '')
    return filterSlashSuggestions(calcRunKeySuggestionsByOperation[`${calcType}/${operation}`] || [], fragment)
  }

  if (calcType === 'module' && tokens.length === 2) {
    return filterSlashSuggestions([
      createSlashSuggestion('calc-module-shards', 'shards', 'Use shard costs.', 'shards', ['shards']),
      createSlashSuggestion('calc-module-coins', 'coins', 'Use coin costs.', 'coins', ['coins']),
      createSlashSuggestion('calc-module-main-sub', 'main-sub', 'Use main-sub costs.', 'main-sub', ['main', 'sub']),
    ], fragment)
  }

  if (calcType === 'shard-split' && tokens.length === 2) {
    return filterSlashSuggestions(moduleTypes.map(type => createSlashSuggestion(
      `calc-shard-${type}`,
      type,
      `${type} module family.`,
      type,
      [type],
    )), fragment)
  }

  if (calcType === 'lab' && tokens.length === 2) {
    return filterSlashSuggestions(sharedLabNames.map(name => createSlashSuggestion(
      `calc-lab-${name}`,
      name,
      'Pick a lab name.',
      quoteToken(name),
      [name.toLowerCase()],
    )), fragment)
  }

  if (calcType === 'bot' && tokens.length === 2) {
    return filterSlashSuggestions(BOT_UPGRADES_DATA.map(bot => createSlashSuggestion(
      `calc-bot-${bot.name}`,
      bot.name,
      'Pick a bot.',
      quoteToken(bot.name),
      [bot.name.toLowerCase()],
    )), fragment)
  }

  if (calcType === 'bot' && tokens.length === 3) {
    const botName = tokens[2]
    const statNames = botStatsByName.get(botName) || []
    return filterSlashSuggestions(statNames.map(statName => createSlashSuggestion(
      `calc-bot-stat-${statName}`,
      statName,
      `${botName} stat.`,
      quoteToken(statName),
      [statName.toLowerCase()],
    )), fragment)
  }

  if (calcType === 'guardians' && tokens.length === 2) {
    return filterSlashSuggestions(guardianDefinitions.map(guardian => createSlashSuggestion(
      `calc-guardian-${guardian.key}`,
      guardian.key,
      guardian.label,
      guardian.key,
      [guardian.key, guardian.label.toLowerCase()],
    )), fragment)
  }

  if (calcType === 'guardians' && tokens.length === 3) {
    const guardianType = tokens[2]
    const statNames = guardianStatsByType.get(guardianType) || []
    return filterSlashSuggestions([
      createSlashSuggestion(`calc-guardian-${guardianType}-all`, 'all', 'Use every guardian stat.', 'all', ['all']),
      ...statNames.map(statName => createSlashSuggestion(
        `calc-guardian-${guardianType}-${statName}`,
        statName,
        `${guardianType} stat.`,
        quoteToken(statName),
        [statName.toLowerCase()],
      )),
    ], fragment)
  }

  if (calcType === 'uptime' && tokens.length === 2) {
    return filterSlashSuggestions(uptimeFieldSuggestions, fragment)
  }

  if (calcType === 'uptime' && tokens.length >= 3) {
    return filterSlashSuggestions([...uptimeSubjectSuggestions, ...uptimeOverrideSuggestions], fragment)
  }

  if (calcType === 'thorns' && tokens.length === 2) {
    return filterSlashSuggestions([
      createSlashSuggestion('calc-thorns-wall', 'wall', 'Wall thorns chart.', 'wall', ['wall']),
      createSlashSuggestion('calc-thorns-base', 'base', 'Base thorns chart.', 'base', ['base']),
    ], fragment)
  }

  return []
}

function getSlashSuggestions(input: string): SlashSuggestion[] {
  const context = getSlashContext(input)
  if (!context) return []

  const first = String(context.tokens[0] || '').toLowerCase()
  if (first === '/calc') {
    return getCalcSubSuggestions(context.tokens, context.fragment)
  }
  if (first === '/chart') {
    return filterSlashSuggestions(CHART_SLASH_SUGGESTIONS, context.fragment)
  }

  return filterSlashSuggestions(TOP_LEVEL_SLASH_SUGGESTIONS, context.fragment)
}

function renderSlashSuggestionMenu(): void {
  const suggestions = state.slashSuggestions
  if (suggestions.length === 0) {
    dom.composerCommandMenu.hidden = true
    dom.composerCommandMenu.innerHTML = ''
    return
  }

  dom.composerCommandMenu.hidden = false
  dom.composerCommandMenu.innerHTML = suggestions.map((suggestion, index) => `
    <button type="button" class="playground-composer__menu-item ${index === state.slashSuggestionIndex ? 'is-active' : ''}" data-slash-suggestion-id="${escapeHtml(suggestion.id)}">
      <span class="playground-composer__menu-label">${escapeHtml(suggestion.label)}</span>
      <span class="playground-composer__menu-description">${escapeHtml(suggestion.description)}</span>
    </button>
  `).join('')

  dom.composerCommandMenu.querySelectorAll<HTMLButtonElement>('[data-slash-suggestion-id]').forEach(button => {
    button.addEventListener('click', () => {
      const suggestionId = String(button.dataset.slashSuggestionId || '').trim()
      const suggestion = state.slashSuggestions.find(item => item.id === suggestionId)
      if (!suggestion) return
      applySlashSuggestion(suggestion)
    })
  })
}

function updateSlashSuggestions(): void {
  state.slashSuggestions = getSlashSuggestions(dom.composerInput.value)
  state.slashSuggestionIndex = Math.min(state.slashSuggestionIndex, Math.max(0, state.slashSuggestions.length - 1))
  renderSlashSuggestionMenu()
}

function completeSlashInput(input: string, suggestion: SlashSuggestion): string {
  const leadingWhitespace = input.match(/^\s*/)?.[0] || ''
  const trimmed = input.trimStart()
  const tokens = splitCommandArgs(trimmed)
  const baseTokens = /\s$/.test(trimmed) ? tokens : tokens.slice(0, -1)
  const completed = `${leadingWhitespace}${[...baseTokens, suggestion.completion].join(' ')}`
  return suggestion.appendTrailingSpace === false ? completed : `${completed} `
}

function buildCalcOperationTemplate(calculatorId: string, operation: string): string | null {
  switch (`${calculatorId}/${operation}`) {
    case 'bots/medalsToTarget':
      return '/calc bots medalsToTarget bot=<bot> stat=<stat> startLevel=<startLevel> targetLevel=<targetLevel> cooldownLab=<cooldownLab> durationLab=<durationLab>'
    case 'uw/stonesToMax':
      return '/calc uw stonesToMax weapon=<weapon> stat=<stat> startLevel=<startLevel> targetLevel=<targetLevel>'
    case 'uw/stonesToMaxAllStats':
      return '/calc uw stonesToMaxAllStats weapon=<weapon> startLevel=<startLevel>'
    case 'labs/rangeCosts':
      return '/calc labs rangeCosts labName=<labName> currentLevel=<currentLevel> targetLevel=<targetLevel> speedLevel=<speedLevel> discountLevel=<discountLevel> relicPercent=<relicPercent> speedUp=<speedUp>'
    case 'modules/moduleCost':
      return '/calc modules moduleCost moduleType=<moduleType> rarity=<rarity> assistRarity=<assistRarity> currentLevel=<currentLevel> targetLevel=<targetLevel> assistCurrentLevel=<assistCurrentLevel> assistTargetLevel=<assistTargetLevel> shardDiscount=<shardDiscount> coinDiscount=<coinDiscount> assistEffPct=<assistEffPct>'
    case 'modules/assistModuleStones':
      return '/calc modules assistModuleStones moduleType=<moduleType> multiplierStartLevel=<multiplierStartLevel> multiplierTargetLevel=<multiplierTargetLevel> substatStartLevel=<substatStartLevel> substatTargetLevel=<substatTargetLevel>'
    case 'modules/shardSplitter':
      return '/calc modules shardSplitter moduleType=<moduleType> assistEffPct=<assistEffPct> unspentShards=<unspentShards> primaryLevel=<primaryLevel> assistLevel=<assistLevel> primaryRarity=<primaryRarity> assistRarity=<assistRarity> shardDiscount=<shardDiscount>'
    case 'modules/damagePath':
      return '/calc modules damagePath shardDiscount=<shardDiscount> cannonPrimaryLevel=<cannonPrimaryLevel> cannonAssistLevel=<cannonAssistLevel> corePrimaryLevel=<corePrimaryLevel> coreAssistLevel=<coreAssistLevel>'
    case 'uptime/project':
      return '/calc uptime project field=<field> focusSubjects=<focusSubjects> compareSubjects=<compareSubjects> includeDwKillWave=<includeDwKillWave> overrides.gtCdLevel=<gtCdLevel> overrides.bhCdLevel=<bhCdLevel> overrides.dwCdLevel=<dwCdLevel>'
    default:
      return null
  }
}

function buildSuggestionTemplate(input: string, suggestion: SlashSuggestion): string | null {
  const context = getSlashContext(input)
  const calculatorId = String(context?.tokens[1] || '').toLowerCase()

  switch (suggestion.id) {
    case 'top-kb':
      return '/kb <question>'
    case 'top-chart':
      return '/chart category=<category> subcategory=<subcategory> item=<item>'
    case 'top-calc':
      return '/calc <calculatorId> <operation> key=<value>'
    case 'chart-path-id':
      return '/chart chartPathId=<chartPathId>'
    case 'chart-category':
    case 'chart-subcategory':
    case 'chart-item':
      return '/chart category=<category> subcategory=<subcategory> item=<item>'
    case 'calc-bots':
      return '/calc bots medalsToTarget bot=<bot> stat=<stat> startLevel=<startLevel> targetLevel=<targetLevel>'
    case 'calc-uw':
      return '/calc uw stonesToMax weapon=<weapon> stat=<stat> startLevel=<startLevel> targetLevel=<targetLevel>'
    case 'calc-labs':
      return '/calc labs rangeCosts labName=<labName> currentLevel=<currentLevel> targetLevel=<targetLevel> speedLevel=<speedLevel> discountLevel=<discountLevel> relicPercent=<relicPercent> speedUp=<speedUp>'
    case 'calc-modules':
      return '/calc modules moduleCost moduleType=<moduleType> rarity=<rarity> assistRarity=<assistRarity> currentLevel=<currentLevel> targetLevel=<targetLevel>'
    case 'calc-uptime':
      return '/calc uptime project field=<field> focusSubjects=<focusSubjects> compareSubjects=<compareSubjects>'
    default:
      return buildCalcOperationTemplate(calculatorId, suggestion.completion)
  }
}

function applySlashSuggestion(suggestion: SlashSuggestion): void {
  const template = buildSuggestionTemplate(dom.composerInput.value, suggestion)
  applyComposerValue(template || completeSlashInput(dom.composerInput.value, suggestion))
}

function openCommandHelpDialog(): void {
  dom.commandHelpDialog.hidden = false
  dom.commandHelpDialog.setAttribute('aria-hidden', 'false')
  dom.commandHelpDialog.removeAttribute('inert')
}

function closeCommandHelpDialog(): void {
  dom.commandHelpDialog.hidden = true
  dom.commandHelpDialog.setAttribute('aria-hidden', 'true')
  dom.commandHelpDialog.setAttribute('inert', '')
  ;(document.activeElement as HTMLElement | null)?.blur?.()
}

function renderAttachmentStrip(): void {
  if (!state.attachment) {
    dom.attachmentStrip.innerHTML = ''
    return
  }

  dom.attachmentStrip.innerHTML = `
    <div class="playground-attachment-pill">
      <img class="playground-attachment-pill__preview" src="${escapeHtml(state.attachment.previewUrl)}" alt="Attached image preview" />
      <span>${escapeHtml(state.attachment.file.name)}</span>
      <button type="button" class="playground-attachment-pill__remove" aria-label="Remove image">×</button>
    </div>
  `

  dom.attachmentStrip.querySelector<HTMLButtonElement>('.playground-attachment-pill__remove')?.addEventListener('click', () => {
    clearAttachment()
  })
}

function clearAttachment(): void {
  if (state.attachment?.previewUrl) {
    URL.revokeObjectURL(state.attachment.previewUrl)
  }
  state.attachment = null
  dom.attachmentInput.value = ''
  renderAttachmentStrip()
}

function pushMessage(message: Omit<PlaygroundMessage, 'id' | 'createdAt'>): void {
  state.messages.push({
    id: createId(),
    createdAt: new Date().toISOString(),
    ...message,
  })
  renderMessages()
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function formatTimestamp(value: string): string {
  const parsed = Date.parse(value)
  if (!Number.isFinite(parsed)) return ''
  return new Date(parsed).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function createRenderToken(prefix: string, index: number): string {
  return `TOWERAI_${prefix}_${index}_TOKEN`
}

function renderKatex(expression: string, displayMode: boolean): string {
  return katex.renderToString(expression, {
    displayMode,
    throwOnError: false,
    strict: 'ignore',
  })
}

function renderMessageText(value: string): string {
  if (!value.trim()) return ''

  const replacements: Array<{ token: string; html: string }> = []
  let nextValue = value

  nextValue = nextValue.replace(/```([\w-]+)?\n?([\s\S]*?)```/g, (_match, language: string | undefined, code: string) => {
    const token = createRenderToken('CODE', replacements.length)
    const title = language ? `<div class="playground-block__title">${escapeHtml(language)}</div>` : ''
    replacements.push({
      token,
      html: `<div class="playground-block">${title}<pre class="playground-block__pre"><code>${escapeHtml(code.trim())}</code></pre></div>`,
    })
    return `\n\n${token}\n\n`
  })

  nextValue = nextValue.replace(/\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g, (_match, bracketExpression: string | undefined, dollarExpression: string | undefined) => {
    const token = createRenderToken('BLOCK_MATH', replacements.length)
    const expression = String(bracketExpression || dollarExpression || '').trim()
    replacements.push({ token, html: `<div class="playground-message__math">${renderKatex(expression, true)}</div>` })
    return `\n\n${token}\n\n`
  })

  nextValue = nextValue.replace(/\\\((.+?)\\\)|(^|[^\\])\$([^\n$]+?)\$/gm, (match, bracketExpression: string | undefined, prefix: string | undefined, dollarExpression: string | undefined) => {
    const expression = String(bracketExpression || dollarExpression || '').trim()
    if (!expression) return match
    const token = createRenderToken('INLINE_MATH', replacements.length)
    replacements.push({ token, html: renderKatex(expression, false) })
    return bracketExpression ? token : `${prefix || ''}${token}`
  })

  let rendered = markdown.render(nextValue)
  for (const replacement of replacements) {
    rendered = rendered.replaceAll(replacement.token, replacement.html)
  }
  return rendered
}

function renderBlock(block: PlaygroundBlock): string {
  if (block.type === 'paragraph') {
    return `<p class="playground-block__paragraph">${escapeHtml(block.text)}</p>`
  }

  if (block.type === 'list') {
    return `
      <div class="playground-block">
        ${block.title ? `<div class="playground-block__title">${escapeHtml(block.title)}</div>` : ''}
        <ul class="playground-block__list">${block.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
    `
  }

  if (block.type === 'table') {
    return `
      <div class="playground-block">
        ${block.title ? `<div class="playground-block__title">${escapeHtml(block.title)}</div>` : ''}
        <div class="playground-table-wrap">
          <table class="playground-table">
            <thead><tr>${block.columns.map(column => `<th>${escapeHtml(column)}</th>`).join('')}</tr></thead>
            <tbody>${block.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    `
  }

  return `
    <div class="playground-block">
      ${block.title ? `<div class="playground-block__title">${escapeHtml(block.title)}</div>` : ''}
      <pre class="playground-block__pre">${escapeHtml(block.text)}</pre>
    </div>
  `
}

function renderMessages(): void {
  if (state.messages.length === 0) {
    dom.messageList.innerHTML = '<div class="playground-empty">Ask a question, use a shortcut, or attach a screenshot.</div>'
    return
  }

  dom.messageList.innerHTML = state.messages.map(message => `
    <article class="playground-message playground-message--${message.role}">
      <div class="playground-message__header">
        <span class="playground-message__role">${message.role === 'assistant' ? 'TowerAI' : message.role === 'system' ? 'System' : 'You'}</span>
        <span class="playground-message__time">${formatTimestamp(message.createdAt)}</span>
      </div>
      <div class="playground-message__text">${renderMessageText(message.text)}</div>
      ${message.blocks?.map(renderBlock).join('') || ''}
    </article>
  `).join('')

  dom.messageList.scrollTop = dom.messageList.scrollHeight
}

function chooseSessionValue(values: readonly string[], salt = 0): string {
  if (values.length === 0) return ''
  return values[(sessionSeed + salt) % values.length] || values[0] || ''
}

function buildSessionExamples(): string[] {
  const examples = [
    'What unlocks Workshop Enhancements?',
    'Compare Glass Cannon and eHP starts for early progression.',
    'How do tournament tickets, promotion, and demotion work?',
    'Show me the bot roster and unlock costs.',
    'How is the passive coin bonus from owned themes calculated?',
    'Summarize the Lab Switching, Auto Research, and Lab Search features.',
    'List the Ultimate Weapon roster and explain how they are purchased.',
    'Use the screenshot and tell me the most important things it shows.',
  ] as const

  const start = sessionSeed % examples.length
  return Array.from({ length: 4 }, (_value, index) => examples[(start + index) % examples.length] || examples[0] || '')
}

function buildSessionWelcome(): { text: string; examples: string[] } {
  const greetings = [
    'Welcome back.',
    'Good to see you again.',
    'Back in the lab already.',
    'Ready when you are.',
  ] as const
  const capabilityLines = [
    'Ask about mechanics, progression, charts, or calculators and I will help you get to the answer fast.',
    'I can explain systems, compare options, surface chart info, and use the built-in calculators when you need exact numbers.',
    'I can help with game questions, progression planning, chart lookups, and calculator-backed answers.',
    'Throw me a Tower question, a comparison, or a chart-related request and I will help you work through it.',
  ] as const

  return {
    text: `${chooseSessionValue(greetings)} ${chooseSessionValue(capabilityLines, 7)}`,
    examples: buildSessionExamples(),
  }
}

function tokenize(value: string): string[] {
  return String(value || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map(token => token.trim())
    .filter(token => token.length >= 2)
}

function getChunks(bundle: TowerAiKbArtifactBundle | null): BundleChunk[] {
  const record = bundle?.chunks as { chunks?: unknown } | null
  if (!record || !Array.isArray(record.chunks)) return []

  return record.chunks
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map(item => ({
      id: String(item.id || ''),
      title: String(item.title || ''),
      category: String(item.category || ''),
      text: String(item.text || ''),
      aliases: Array.isArray(item.aliases) ? item.aliases.map(value => String(value)) : [],
      keywords: Array.isArray(item.keywords) ? item.keywords.map(value => String(value)) : [],
      summary: typeof item.summary === 'string' ? item.summary : undefined,
    }))
}

function scoreKnowledge(query: string, limit: number): ScoredChunk[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []

  return getChunks(state.bundle)
    .map(chunk => {
      const title = chunk.title.toLowerCase()
      const category = chunk.category.toLowerCase()
      const summary = String(chunk.summary || '').toLowerCase()
      const haystack = [chunk.title, chunk.category, chunk.summary || '', chunk.text, ...(chunk.aliases || []), ...(chunk.keywords || [])]
        .join(' ')
        .toLowerCase()
      let score = 0
      for (const token of tokens) {
        if (title.includes(token)) score += 7
        if (summary.includes(token)) score += 5
        if (category.includes(token)) score += 3
        if (haystack.includes(token)) score += 1
      }
      return { chunk, score }
    })
    .filter(entry => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
}

function sanitizeChunks(scored: ScoredChunk[]): ScoredChunk[] {
  const seen = new Set<string>()
  const sanitized: ScoredChunk[] = []
  for (const entry of scored) {
    const key = `${entry.chunk.id}:${entry.chunk.title}`
    if (seen.has(key)) continue
    seen.add(key)
    sanitized.push(entry)
  }
  return sanitized
}

function buildKbContextList(chunks: ScoredChunk[]): string[] {
  return chunks.map(entry => `${entry.chunk.title || 'Untitled'}${entry.chunk.category ? ` (${entry.chunk.category})` : ''}`)
}

function isComplexPrompt(input: string): boolean {
  const normalized = input.toLowerCase()
  return normalized.includes(' and ') || normalized.includes('compare') || normalized.includes('versus') || normalized.includes(' vs ') || normalized.includes('step by step') || tokenize(input).length >= 18
}

function analyzeRoute(input: string): RouteInfo {
  const trimmed = input.trim()
  if (/^\/help$/i.test(trimmed)) {
    return {
      route: 'help',
      classification: 'help',
      ambiguous: false,
      complex: false,
      forcedToolRequest: null,
      normalizedQuestion: trimmed,
    }
  }

  if (/^\/kb\s+/i.test(trimmed)) {
    return {
      route: 'knowledge',
      classification: 'knowledge lookup',
      ambiguous: false,
      complex: false,
      forcedToolRequest: null,
      normalizedQuestion: trimmed.replace(/^\/kb\s+/i, '').trim(),
    }
  }

  const forcedToolRequest = /^\/(chart|calc|tool)\b/i.test(trimmed)
    ? parseToolRequest(trimmed)
    : null
  if (forcedToolRequest) {
    return {
      route: 'tool',
      classification: 'tool request',
      ambiguous: false,
      complex: false,
      forcedToolRequest,
      normalizedQuestion: trimmed,
    }
  }

  const complex = isComplexPrompt(trimmed)
  const ambiguous = /\b(or|which|best|better|compare|difference)\b/i.test(trimmed) || complex
  return {
    route: 'reasoning',
    classification: ambiguous ? 'comparison / multistep' : 'knowledge question',
    ambiguous,
    complex,
    forcedToolRequest: null,
    normalizedQuestion: trimmed,
  }
}

function parseToolJson(input: string): unknown {
  const payloadText = input.replace(/^\/tool\s+/i, '').trim()
  return JSON.parse(payloadText)
}

function parseCsvNumberList(token: string): number[] | null {
  const values = token.split(',').map(part => Number(part.trim())).filter(value => Number.isFinite(value))
  return values.length > 0 ? values : null
}

function parseBooleanValue(token: string): boolean | null {
  const normalized = token.trim().toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return null
}

function parseNumberValue(token: string): number | null {
  const value = Number(token)
  return Number.isFinite(value) ? value : null
}

function setNestedCommandArg(target: Record<string, unknown>, keyPath: string, value: unknown): void {
  const parts = keyPath.split('.').map(part => part.trim()).filter(Boolean)
  if (parts.length === 0) return

  let cursor: Record<string, unknown> = target
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index]
    const next = cursor[part]
    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      cursor[part] = {}
    }
    cursor = cursor[part] as Record<string, unknown>
  }

  const leaf = parts[parts.length - 1]
  const normalized = String(value ?? '').trim()
  cursor[leaf] = normalized.includes(',')
    ? normalized.split(',').map(entry => entry.trim()).filter(Boolean)
    : normalized
}

function parseNamedCommandArgs(tokens: string[]): Record<string, unknown> | null {
  const args: Record<string, unknown> = {}
  for (const token of tokens) {
    const separatorIndex = token.indexOf('=')
    if (separatorIndex <= 0) return null
    const key = token.slice(0, separatorIndex).trim()
    const rawValue = token.slice(separatorIndex + 1).trim()
    if (!key || !rawValue) return null
    setNestedCommandArg(args, key, rawValue)
  }
  return args
}

function normalizeUptimeSubjectToken(token: string): (typeof TRACKER_AI_UPTIME_SUBJECT_KEYS)[number] | null {
  return uptimeSubjectByLower.get(token.trim().toLowerCase()) || null
}

function parseCalcCommand(input: string): unknown | null {
  const tokens = splitCommandArgs(input)
  if (tokens[0]?.toLowerCase() !== '/calc') return null

  if (tokens.length >= 4) {
    const namedArgs = parseNamedCommandArgs(tokens.slice(3))
    if (namedArgs) {
      return {
        tool: 'calc.run',
        args: {
          calculatorId: tokens[1],
          operation: tokens[2],
          ...namedArgs,
        },
      }
    }
  }

  const calcType = tokens[1]?.toLowerCase()
  switch (calcType) {
    case 'module':
      if (tokens.length < 5) return null
      return {
        tool: 'calc.module.costs',
        args: {
          costType: String(tokens[2] || '').toLowerCase(),
          fromLevel: Number(tokens[3]),
          toLevel: Number(tokens[4]),
          discountPercent: Number(tokens[5] || 0),
        },
      }
    case 'workshop': {
      if (tokens.length < 7) return null
      const costs = parseCsvNumberList(tokens[6])
      if (!costs) return null
      return {
        tool: 'calc.workshop.costs',
        args: {
          fromLevel: Number(tokens[2]),
          toLevel: Number(tokens[3]),
          sectionDiscountPercent: Number(tokens[4] || 0),
          vaultDiscountPercent: Number(tokens[5] || 0),
          costs,
        },
      }
    }
    case 'shard-split':
      if (tokens.length < 10) return null
      return {
        tool: 'calc.shard.split',
        args: {
          moduleType: tokens[2],
          primaryLevel: Number(tokens[3]),
          secondaryLevel: Number(tokens[4]),
          primaryRarity: tokens[5],
          secondaryRarity: tokens[6],
          assistEffPct: Number(tokens[7]),
          unspentShards: Number(tokens[8]),
          shardDiscount: Number(tokens[9]),
          ...(tokens[10] ? { assistLabLevel: Number(tokens[10]) } : {}),
        },
      }
    case 'lab':
      if (tokens.length < 9) return null
      return {
        tool: 'calc.lab.progress',
        args: {
          labName: tokens[2],
          currentLevel: Number(tokens[3]),
          targetLevel: Number(tokens[4]),
          modifiers: {
            labSpeed: Number(tokens[5]),
            labRelic: Number(tokens[6]),
            labDiscount: Number(tokens[7]),
            speedUp: Number(tokens[8]),
          },
        },
      }
    case 'bot':
      if (tokens.length < 6) return null
      return {
        tool: 'calc.bot.costs',
        args: {
          botName: tokens[2],
          statName: tokens[3],
          startLevel: Number(tokens[4]),
          targetLevel: Number(tokens[5]),
          ...(tokens[6] || tokens[7]
            ? {
                labLevels: {
                  ...(tokens[6] ? { Duration: Number(tokens[6]) } : {}),
                  ...(tokens[7] ? { Cooldown: Number(tokens[7]) } : {}),
                },
              }
            : {}),
        },
      }
    case 'guardians':
      if (tokens.length < 3) return null
      return {
        tool: 'calc.guardian.costs',
        args: {
          guardianType: tokens[2],
          ...(tokens[3] ? { statName: tokens[3] } : {}),
          ...(tokens[4] ? { startLevel: Number(tokens[4]) } : {}),
          ...(tokens[5] ? { targetLevel: Number(tokens[5]) } : {}),
        },
      }
    case 'uptime': {
      const args: Record<string, unknown> = {}
      let index = 2

      if (tokens[index] && uptimeFieldOptions.includes(tokens[index] as typeof uptimeFieldOptions[number])) {
        args.field = tokens[index]
        index += 1
      }

      const focusSubjects: string[] = []
      while (tokens[index]) {
        const subject = normalizeUptimeSubjectToken(tokens[index])
        if (!subject) break
        focusSubjects.push(subject)
        index += 1
      }
      if (focusSubjects.length > 0) {
        args.focusSubjects = focusSubjects
      }

      const overrides: Record<string, unknown> = {}
      while (tokens[index]) {
        const token = tokens[index]
        const separatorIndex = token.indexOf('=')
        if (separatorIndex <= 0) return null
        const key = token.slice(0, separatorIndex).trim()
        const rawValue = token.slice(separatorIndex + 1).trim()
        if (!rawValue) return null

        if (key === 'compare') {
          const compareSubjects = rawValue
            .split(',')
            .map(value => normalizeUptimeSubjectToken(value))
            .filter((value): value is (typeof TRACKER_AI_UPTIME_SUBJECT_KEYS)[number] => Boolean(value))
          if (compareSubjects.length !== 2) return null
          args.compareSubjects = [compareSubjects[0], compareSubjects[1]]
        } else if (key === 'includeDwKillWave') {
          const parsed = parseBooleanValue(rawValue)
          if (parsed == null) return null
          args.includeDwKillWave = parsed
        } else if (key === 'mvnRarity') {
          overrides.mvnRarity = rawValue
        } else if (uptimeBooleanOverrideKeys.has(key)) {
          const parsed = parseBooleanValue(rawValue)
          if (parsed == null) return null
          overrides[key] = parsed
        } else if (uptimeNumericOverrideKeys.has(key)) {
          const parsed = parseNumberValue(rawValue)
          if (parsed == null) return null
          overrides[key] = parsed
        } else {
          return null
        }

        index += 1
      }

      if (Object.keys(overrides).length > 0) {
        args.overrides = overrides
      }

      return {
        tool: 'calc.uptime.project',
        args,
      }
    }
    case 'thorns': {
      if (tokens.length < 13) return null
      const tool = tokens[2] === 'wall' ? 'calc.thorns.wall' : tokens[2] === 'base' ? 'calc.thorns.base' : null
      if (!tool) return null
      return {
        tool,
        args: {
          baseThorns: Number(tokens[3]),
          tier: Number(tokens[4]),
          pcLevel: Number(tokens[5]),
          pcMasteryLevel: Number(tokens[6]),
          bcLabLevel: Number(tokens[7]),
          bcReductionLabLevel: Number(tokens[8]),
          pcReductionLabLevel: Number(tokens[9]),
          tournamentTier: tokens[10],
          heatWave: Number(tokens[11]),
          sharpFortitude: String(tokens[12]).toLowerCase() === 'true',
        },
      }
    }
    default:
      return null
  }
}

function parseChartCommand(input: string): unknown | null {
  const tokens = splitCommandArgs(input)
  if (tokens[0]?.toLowerCase() !== '/chart') return null

  if (tokens.length === 1) {
    return {
      tool: 'chart.browse',
      args: {},
    }
  }

  const chartMode = tokens[1]?.toLowerCase()
  if (chartMode === 'browse') {
    return {
      tool: 'chart.catalog.list',
      args: {
        ...(tokens[2] ? { category: tokens[2] } : {}),
        ...(tokens[3] ? { subcategory: tokens[3] } : {}),
      },
    }
  }

  if (chartMode === 'table' && tokens.length >= 5) {
    return {
      tool: 'chart.preview.table',
      args: {
        category: tokens[2],
        subcategory: tokens[3],
        item: tokens[4],
      },
    }
  }

  const namedArgs = parseNamedCommandArgs(tokens.slice(1))
  if (namedArgs) {
    return {
      tool: 'chart.browse',
      args: namedArgs,
    }
  }

  if (tokens.length === 2 && tokens[1] && !tokens[1].includes('=')) {
    return tokens[1].includes(':')
      ? { tool: 'chart.browse', args: { chartPathId: tokens[1] } }
      : { tool: 'chart.browse', args: { category: tokens[1] } }
  }

  if (tokens.length === 3) {
    return {
      tool: 'chart.browse',
      args: {
        category: tokens[1],
        subcategory: tokens[2],
      },
    }
  }

  if (tokens.length >= 4) {
    return {
      tool: 'chart.browse',
      args: {
        category: tokens[1],
        subcategory: tokens[2],
        item: tokens[3],
      },
    }
  }

  return null
}

function parseToolRequest(input: string): unknown | null {
  if (/^\/tool\s+/i.test(input)) return parseToolJson(input)
  return parseChartCommand(input) || parseCalcCommand(input)
}

function buildObjectTable(title: string, rowsLike: unknown): PlaygroundBlock[] {
  if (!Array.isArray(rowsLike) || rowsLike.length === 0) {
    return [{ type: 'pre', title, text: JSON.stringify(rowsLike, null, 2) }]
  }

  const records = rowsLike.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
  if (records.length === 0) {
    return [{ type: 'pre', title, text: JSON.stringify(rowsLike, null, 2) }]
  }

  const columns = Array.from(new Set(records.flatMap(record => Object.keys(record)))).slice(0, 8)
  const rows = records.slice(0, 10).map(record => columns.map(column => String(record[column] ?? '')))
  return [{ type: 'table', title, columns, rows }]
}

function buildToolBlocks(result: unknown): PlaygroundBlock[] {
  const typed = result as Record<string, unknown>
  if (typeof typed.text === 'string' && typed.text.trim()) {
    return [{ type: 'paragraph', text: typed.text.trim() }]
  }

  if (typed.tablePreview && typeof typed.tablePreview === 'object') {
    const preview = typed.tablePreview as { title?: unknown; columns?: unknown; rows?: unknown }
    const columns = Array.isArray(preview.columns) ? preview.columns.map(value => String(value ?? '')) : []
    const rows = Array.isArray(preview.rows)
      ? preview.rows.filter((row): row is unknown[] => Array.isArray(row)).map(row => row.map(cell => String(cell ?? '')))
      : []
    return [{ type: 'table', title: String(preview.title || 'Table preview'), columns, rows }]
  }

  if (Array.isArray(typed.categories)) {
    return [{ type: 'list', title: 'Categories', items: typed.categories.map(value => String(value ?? '')) }]
  }

  if (Array.isArray(typed.items)) {
    return [{ type: 'list', title: 'Items', items: typed.items.map(value => String(value ?? '')) }]
  }

  if (Array.isArray(typed.paths)) {
    return [{
      type: 'list',
      title: 'Chart paths',
      items: typed.paths.slice(0, 20).map(value => {
        const record = value as Record<string, unknown>
        return [record.category, record.subcategory, record.item].map(part => String(part || '')).filter(Boolean).join(' / ')
      }),
    }]
  }

  if (Array.isArray(typed.rows)) {
    return buildObjectTable('Rows', typed.rows)
  }

  return [{ type: 'pre', title: 'Payload', text: JSON.stringify(result, null, 2) }]
}

async function executePlatformTool(requestLike: unknown) {
  toolExecutorPromise ||= import('../src/tools/platformExecutor')
  const module = await toolExecutorPromise
  return module.executeTowerAiPlatformTool(requestLike)
}

async function readManifest(): Promise<TowerAiKbArtifactRepoManifest> {
  const response = await fetch('/artifacts/kb/manifest.json', { credentials: 'same-origin' })
  if (!response.ok) {
    throw new Error(`Failed to load local manifest (${response.status})`)
  }

  const contentType = response.headers.get('content-type') || ''
  const responseText = await response.text()
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(`Expected JSON from /artifacts/kb/manifest.json but received ${contentType || 'unknown content type'}: ${responseText.slice(0, 120)}`)
  }

  return JSON.parse(responseText) as TowerAiKbArtifactRepoManifest
}

function rewriteManifestForLocalDev(manifest: TowerAiKbArtifactRepoManifest): TowerAiKbArtifactRepoManifest {
  const providers = Object.fromEntries(
    Object.entries(manifest.providers).map(([provider, value]) => {
      const typedValue = value as ManifestProvider
      const version = String(typedValue.version || '').trim()
      return [provider, {
        ...typedValue,
        files: {
          versionUrl: `/artifacts/kb/${provider}/${version}/trackerai-kb.version.txt`,
          metadataUrl: `/artifacts/kb/${provider}/${version}/trackerai-kb.metadata.json`,
          chunksUrl: `/artifacts/kb/${provider}/${version}/trackerai-kb.chunks.json`,
          indexUrl: `/artifacts/kb/${provider}/${version}/trackerai-kb.index.json`,
        },
        modelAsset: typedValue.modelAsset
          ? {
              ...typedValue.modelAsset,
              rootUrl: `/artifacts/models/${provider}`,
            }
          : undefined,
      }]
    }),
  )

  return {
    ...manifest,
    providers,
  }
}

async function loadKnowledgeBundle(forceRefresh = false): Promise<void> {
  if (state.busy) return
  state.busy = true
  renderHeaderState()
  setRuntimeHealth(false)
    setStatus(`Local ${state.provider} bundle not loaded`)
  try {
    const manifest = rewriteManifestForLocalDev(await readManifest())
    state.manifest = manifest
    state.bundle = await loadTowerAiKbArtifactBundle({
      provider: state.provider,
      forceRefresh,
      skipLocalArtifacts: true,
      repoConfig: { manifestUrl: '/artifacts/kb/manifest.json' },
      repoManifest: manifest,
      fetchImpl: window.fetch.bind(window),
    })
    const providerEntry = manifest.providers[state.provider] as ManifestProvider | undefined
    setKbVersion(state.bundle?.version || providerEntry?.version || 'Unavailable')
    setKbDetails(
        providerEntry?.chunkCount ? providerEntry.chunkCount.toLocaleString() : getChunks(state.bundle).length.toLocaleString(),
        String(providerEntry?.vectorSize || DEFAULT_SEMANTIC_DIMENSIONS),
    )
    setRuntimeHealth(true)
      setStatus(`Local ${state.provider} bundle loaded`)
  } catch (error) {
    state.bundle = null
    setKbVersion('Unavailable')
    setKbDetails('Unavailable', 'Unavailable')
    setRuntimeHealth(false)
      setStatus(`Local ${state.provider} bundle not loaded`)
    pushMessage({
      role: 'system',
      text: 'The knowledge base could not be loaded.',
      blocks: [{ type: 'pre', text: error instanceof Error ? error.message : String(error) }],
    })
  } finally {
    state.pipeline = createInitialPipeline()
    renderPipeline()
    state.busy = false
    renderHeaderState()
  }
}

async function ensureCloudDelay(): Promise<void> {
  const previous = cloudChain
  let release = () => {}
  cloudChain = new Promise<void>(resolve => {
    release = resolve
  })
  await previous
  const waitMs = Math.max(0, MIN_CLOUD_DELAY_MS - (Date.now() - lastCloudRequestAt))
  if (waitMs > 0) {
    await sleep(waitMs)
  }
  lastCloudRequestAt = Date.now()
  release()
}

async function withTimeout<T>(label: string, timeoutMs: number, task: () => Promise<T>): Promise<T> {
  let timer = 0
  try {
    return await Promise.race([
      task(),
      new Promise<T>((_, reject) => {
        timer = window.setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
      }),
    ])
  } finally {
    if (timer) {
      window.clearTimeout(timer)
    }
  }
}

async function getOpenAiClient() {
  openAiCtorPromise ||= import('openai')
  const { default: OpenAI } = await openAiCtorPromise
  return new OpenAI({
    apiKey: cloudConfig.apiKey,
    baseURL: getSdkBaseUrl(cloudConfig.endpoint),
    dangerouslyAllowBrowser: true,
  })
}

function extractAssistantText(payload: unknown): string {
  const record = payload && typeof payload === 'object'
    ? payload as Record<string, unknown>
    : null
  const choices = Array.isArray(record?.choices) ? record.choices : []
  const firstChoice = choices[0] as Record<string, unknown> | undefined
  const message = firstChoice?.message as Record<string, unknown> | undefined
  const content = message?.content
  if (typeof content === 'string') {
    return content.trim()
  }
  if (Array.isArray(content)) {
    return content
      .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object')
      .map(entry => String(entry.text || ''))
      .join('\n')
      .trim()
  }
  return ''
}

function stripCodeFence(value: string): string {
  return value
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function stripReasoningTags(value: string): string {
  const cleaned = String(value || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .trim()

  return cleaned.replace(/\n{3,}/g, '\n\n').trim()
}

function parseJsonText<T>(value: string): T | null {
  const trimmed = stripCodeFence(value)
  try {
    return JSON.parse(trimmed) as T
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (!match) return null
    try {
      return JSON.parse(match[0]) as T
    } catch {
      return null
    }
  }
}

async function requestCloudText(model: string, messages: Array<Record<string, unknown>>, timeoutMs: number): Promise<{ text: string; transport: 'sdk' | 'endpoint' }> {
  if (!hasCloudKey() || !model) {
    throw new Error('Cloud model unavailable')
  }

  await ensureCloudDelay()
  try {
    const client = await getOpenAiClient()
    const completion = await withTimeout(`SDK ${model}`, timeoutMs, () => client.chat.completions.create({
      model,
      temperature: 0.2,
      messages,
    } as never))
    const text = extractAssistantText(completion)
    const cleanedText = stripReasoningTags(text)
    if (!cleanedText) {
      throw new Error('SDK reply was empty')
    }
    return { text: cleanedText, transport: 'sdk' }
  } catch (sdkError) {
    await ensureCloudDelay()
    const response = await withTimeout(`Endpoint ${model}`, timeoutMs, () => fetch(cloudConfig.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${cloudConfig.apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages,
      }),
    }))
    const payload = await response.json().catch(() => null) as Record<string, unknown> | null
    if (!response.ok) {
      const errorRecord = payload?.error as Record<string, unknown> | undefined
      const failure = new Error(String(errorRecord?.message || (sdkError instanceof Error ? sdkError.message : 'Cloud request failed'))) as Error & { cause?: unknown }
      failure.cause = sdkError
      throw failure
    }
    const text = payload ? extractAssistantText(payload) : ''
    const cleanedText = stripReasoningTags(text)
    if (!cleanedText) {
      const failure = new Error('Endpoint reply was empty') as Error & { cause?: unknown }
      failure.cause = sdkError
      throw failure
    }
    return { text: cleanedText, transport: 'endpoint' }
  }
}

async function requestCloudJson<T>(model: string, messages: Array<Record<string, unknown>>, timeoutMs: number): Promise<T> {
  const reply = await requestCloudText(model, messages, timeoutMs)
  const parsed = parseJsonText<T>(reply.text)
  if (!parsed) {
    throw new Error(`Failed to parse JSON from ${model} (${reply.transport})`)
  }
  return parsed
}

function buildVisionFallbackText(attachment: AttachmentState): string {
  const size = `${attachment.width || 0}×${attachment.height || 0}`
  return `Image attached: ${attachment.file.name} (${attachment.mimeType}, ${size})`
}

async function runVisionStep(attachment: AttachmentState | null): Promise<VisionResult> {
  if (!attachment) {
    setPipelineStep('vision', {
      model: cloudConfig.visionModel || 'N/A',
      healthy: true,
      detail: 'Skipped',
    })
    return {
      text: '',
      modelUsed: cloudConfig.visionModel || 'N/A',
      healthy: true,
    }
  }

  const fallbackText = buildVisionFallbackText(attachment)
  if (!hasCloudKey() || !cloudConfig.visionModel) {
    setPipelineStep('vision', {
      model: cloudConfig.semanticModel,
      healthy: false,
      detail: 'Fallback',
    })
    return {
      text: fallbackText,
      modelUsed: cloudConfig.semanticModel,
      healthy: false,
    }
  }

  try {
    const text = await requestCloudText(
      cloudConfig.visionModel,
      [
        {
          role: 'system',
          content: 'Describe the attached image in concise structured text that helps TowerAI answer the user. Focus on game terms, numbers, labels, and visible context.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Read the image and return concise structured context.' },
            { type: 'image_url', image_url: { url: attachment.dataUrl } },
          ],
        },
      ],
      AUXILIARY_TIMEOUT_MS,
    )
    setPipelineStep('vision', {
      model: cloudConfig.visionModel,
      healthy: true,
      detail: 'Healthy',
    })
    return {
      text: text.text,
      modelUsed: cloudConfig.visionModel,
      healthy: true,
    }
  } catch {
    setPipelineStep('vision', {
      model: cloudConfig.semanticModel,
      healthy: false,
      detail: 'Fallback',
    })
    return {
      text: fallbackText,
      modelUsed: cloudConfig.semanticModel,
      healthy: false,
    }
  }
}

async function runReranker(query: string, scored: ScoredChunk[]): Promise<{ reranked: ScoredChunk[]; modelUsed: string; healthy: boolean }> {
  if (scored.length <= 1) {
    setPipelineStep('reranker', {
      model: cloudConfig.rankingModel || cloudConfig.semanticModel,
      healthy: true,
      detail: 'Skipped',
    })
    return {
      reranked: scored,
      modelUsed: cloudConfig.rankingModel || cloudConfig.semanticModel,
      healthy: true,
    }
  }

  if (!hasCloudKey() || !cloudConfig.rankingModel) {
    setPipelineStep('reranker', {
      model: cloudConfig.semanticModel,
      healthy: false,
      detail: 'Fallback',
    })
    return {
      reranked: scored,
      modelUsed: cloudConfig.semanticModel,
      healthy: false,
    }
  }

  try {
    const result = await requestCloudJson<{ ids?: string[] }>(
      cloudConfig.rankingModel,
      [
        {
          role: 'system',
          content: 'Return strict JSON only: {"ids":[...]} listing chunk ids from best to worst for the user prompt.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            query,
            chunks: scored.map(entry => ({
              id: entry.chunk.id,
              title: entry.chunk.title,
              category: entry.chunk.category,
              summary: entry.chunk.summary || entry.chunk.text.slice(0, 240),
            })),
          }),
        },
      ],
      AUXILIARY_TIMEOUT_MS,
    )

    const ids = Array.isArray(result.ids) ? result.ids.map(value => String(value)) : []
    const order = new Map(ids.map((id, index) => [id, index]))
    const reranked = [...scored].sort((left, right) => {
      const leftOrder = order.get(left.chunk.id)
      const rightOrder = order.get(right.chunk.id)
      if (leftOrder == null && rightOrder == null) return right.score - left.score
      if (leftOrder == null) return 1
      if (rightOrder == null) return -1
      return leftOrder - rightOrder
    })

    setPipelineStep('reranker', {
      model: cloudConfig.rankingModel,
      healthy: true,
      detail: 'Healthy',
    })
    return {
      reranked,
      modelUsed: cloudConfig.rankingModel,
      healthy: true,
    }
  } catch {
    setPipelineStep('reranker', {
      model: cloudConfig.semanticModel,
      healthy: false,
      detail: 'Fallback',
    })
    return {
      reranked: scored,
      modelUsed: cloudConfig.semanticModel,
      healthy: false,
    }
  }
}

function buildSemanticIntent(routeInfo: RouteInfo, wantsDeep: boolean, hasToolRequest: boolean): IntentResult {
  return {
    userGoal: routeInfo.classification,
    toolNeeded: hasToolRequest,
    deepReasoning: wantsDeep,
    ambiguous: routeInfo.ambiguous,
    modelUsed: cloudConfig.semanticModel,
    healthy: true,
  }
}

async function runIntentInterpreter(routeInfo: RouteInfo, assembledContext: string, wantsDeep: boolean, hasToolRequest: boolean): Promise<IntentResult> {
  if (!routeInfo.ambiguous || !hasCloudKey() || !cloudConfig.intentModel) {
    const result = buildSemanticIntent(routeInfo, wantsDeep, hasToolRequest)
    setPipelineStep('intent', {
      model: result.modelUsed,
      healthy: result.healthy,
      detail: result.healthy ? 'Healthy' : 'Fallback',
    })
    return result
  }

  try {
    const result = await requestCloudJson<{
      userGoal?: string
      toolNeeded?: boolean
      deepReasoning?: boolean
      ambiguous?: boolean
    }>(
      cloudConfig.intentModel,
      [
        {
          role: 'system',
          content: 'Return strict JSON only with keys userGoal, toolNeeded, deepReasoning, ambiguous.',
        },
        {
          role: 'user',
          content: assembledContext,
        },
      ],
      AUXILIARY_TIMEOUT_MS,
    )
    const intent: IntentResult = {
      userGoal: String(result.userGoal || routeInfo.classification),
      toolNeeded: result.toolNeeded === true || hasToolRequest,
      deepReasoning: result.deepReasoning === true || wantsDeep,
      ambiguous: result.ambiguous !== false,
      modelUsed: cloudConfig.intentModel,
      healthy: true,
    }
    setPipelineStep('intent', {
      model: intent.modelUsed,
      healthy: true,
      detail: 'Healthy',
    })
    return intent
  } catch {
    const fallback = buildSemanticIntent(routeInfo, wantsDeep, hasToolRequest)
    setPipelineStep('intent', {
      model: fallback.modelUsed,
      healthy: false,
      detail: 'Fallback',
    })
    return {
      ...fallback,
      healthy: false,
    }
  }
}

function buildKnowledgePrompt(query: string, visionText: string, chunks: ScoredChunk[]): string {
  return JSON.stringify({
    question: query,
    vision: visionText || null,
    knowledge: chunks.map((entry, index) => ({
      rank: index + 1,
      id: entry.chunk.id,
      title: entry.chunk.title,
      category: entry.chunk.category,
      summary: entry.chunk.summary || entry.chunk.text.slice(0, 360),
    })),
  })
}

function buildDeterministicReasoning(query: string, visionText: string, chunks: ScoredChunk[]): string {
  if (chunks.length === 0) {
    return visionText
      ? `I could not find a strong KB match yet. I did keep the image context: ${visionText}`
      : 'I could not find a strong KB match yet. Try a more specific mechanic, stat, bot, module, or chart request.'
  }

  const lead = chunks[0]?.chunk
  const summary = lead?.summary || lead?.text || ''
  const visionLine = visionText ? `Image context: ${visionText}` : ''
  return [summary, visionLine].filter(Boolean).join('\n\n').trim()
}

async function runReasoningStep(query: string, visionText: string, chunks: ScoredChunk[], wantsDeep: boolean, routeInfo: RouteInfo): Promise<ReasoningResult> {
  if (routeInfo.route === 'tool' || routeInfo.route === 'help') {
    setPipelineStep('reasoning', {
      model: wantsDeep ? cloudConfig.deepReasoningModel || cloudConfig.reasoningModel || cloudConfig.semanticModel : cloudConfig.reasoningModel || cloudConfig.semanticModel,
      healthy: true,
      detail: 'Skipped',
    })
    return {
      text: '',
      modelUsed: wantsDeep ? cloudConfig.deepReasoningModel || cloudConfig.reasoningModel || cloudConfig.semanticModel : cloudConfig.reasoningModel || cloudConfig.semanticModel,
      healthy: true,
      usedFallback: false,
    }
  }

  const promptPayload = buildKnowledgePrompt(query, visionText, chunks)
  const standardMessages = [
    {
      role: 'system',
      content: 'You are TowerAI. Answer only from the provided local knowledge and visible image context. If the knowledge does not support a detail, say that it is not covered in the current knowledge base. Do not fill gaps from general memory. Do not output chain-of-thought, <think> tags, or hidden reasoning.',
    },
    {
      role: 'user',
      content: promptPayload,
    },
  ]

  const timeoutMs = wantsDeep ? DEEP_REASONING_TIMEOUT_MS : STANDARD_REASONING_TIMEOUT_MS
  const preferredModels = wantsDeep
    ? [cloudConfig.deepReasoningModel, cloudConfig.reasoningModel, cloudConfig.fallbackReasoningModel]
    : [cloudConfig.reasoningModel, cloudConfig.fallbackReasoningModel]
  const uniqueModels = preferredModels.filter((value, index, array) => Boolean(value) && array.indexOf(value) === index)

  if (hasCloudKey() && uniqueModels.length > 0) {
    for (let index = 0; index < uniqueModels.length; index += 1) {
      const model = uniqueModels[index]
      try {
        const reply = await requestCloudText(model, standardMessages, timeoutMs)
        const usedFallback = index > 0
        setPipelineStep('reasoning', {
          model,
          healthy: !usedFallback,
          detail: usedFallback ? 'Fallback' : 'Healthy',
        })
        return {
          text: reply.text,
          modelUsed: model,
          healthy: !usedFallback,
          usedFallback,
        }
      } catch {
        // try next configured model
      }
    }
  }

  const localText = buildDeterministicReasoning(query, visionText, chunks)
  setPipelineStep('reasoning', {
    model: cloudConfig.semanticModel,
    healthy: false,
    detail: 'Fallback',
  })
  return {
    text: localText,
    modelUsed: cloudConfig.semanticModel,
    healthy: false,
    usedFallback: true,
  }
}

async function runPlannerStep(routeInfo: RouteInfo, assembledContext: string, toolRequest: unknown | null, intent: IntentResult): Promise<PlannerResult> {
  const plannerModel = intent.ambiguous ? cloudConfig.answerSynthesisModel : cloudConfig.semanticModel
  if (!intent.ambiguous || !hasCloudKey() || !cloudConfig.answerSynthesisModel) {
    setPipelineStep('planner', {
      model: plannerModel,
      healthy: plannerModel === cloudConfig.semanticModel,
      detail: plannerModel === cloudConfig.semanticModel ? 'Healthy' : 'Fallback',
    })
    return {
      toolRequest,
      toolNeeded: Boolean(toolRequest),
      modelUsed: plannerModel,
      healthy: plannerModel === cloudConfig.semanticModel,
    }
  }

  try {
    const result = await requestCloudJson<{ toolNeeded?: boolean }>(
      cloudConfig.answerSynthesisModel,
      [
        {
          role: 'system',
          content: 'Return strict JSON only with key toolNeeded.',
        },
        {
          role: 'user',
          content: assembledContext,
        },
      ],
      AUXILIARY_TIMEOUT_MS,
    )
    setPipelineStep('planner', {
      model: cloudConfig.answerSynthesisModel,
      healthy: true,
      detail: 'Healthy',
    })
    return {
      toolRequest,
      toolNeeded: Boolean(toolRequest) || result.toolNeeded === true,
      modelUsed: cloudConfig.answerSynthesisModel,
      healthy: true,
    }
  } catch {
    setPipelineStep('planner', {
      model: cloudConfig.semanticModel,
      healthy: false,
      detail: 'Fallback',
    })
    return {
      toolRequest,
      toolNeeded: Boolean(toolRequest),
      modelUsed: cloudConfig.semanticModel,
      healthy: false,
    }
  }
}

function buildAnswerBlocks(chunks: ScoredChunk[], toolBlocks?: PlaygroundBlock[]): PlaygroundBlock[] | undefined {
  const blocks: PlaygroundBlock[] = []
  if (chunks.length > 0) {
    blocks.push({
      type: 'list',
      title: 'KB context used',
      items: buildKbContextList(chunks),
    })
  }
  if (toolBlocks) {
    blocks.push(...toolBlocks)
  }
  return blocks.length > 0 ? blocks : undefined
}

function buildSemanticAnswer(query: string, reasoningText: string, toolSummary: string | null): string {
  if (toolSummary) {
    return reasoningText ? `${toolSummary}\n\n${reasoningText}`.trim() : toolSummary
  }
  if (reasoningText) {
    return reasoningText
  }
  return `I processed: ${query}`
}

async function runAnswerSynthesizer(query: string, reasoning: ReasoningResult, planner: PlannerResult, toolSummary: string | null, chunks: ScoredChunk[]): Promise<{ text: string; modelUsed: string; healthy: boolean }> {
  const model = planner.modelUsed
  const localAnswer = buildSemanticAnswer(query, reasoning.text, toolSummary)

  if (model === cloudConfig.semanticModel || !hasCloudKey() || !planner.healthy) {
    setPipelineStep('synthesizer', {
      model,
      healthy: model === cloudConfig.semanticModel,
      detail: model === cloudConfig.semanticModel ? 'Healthy' : 'Fallback',
    })
    return {
      text: localAnswer,
      modelUsed: model,
      healthy: model === cloudConfig.semanticModel,
    }
  }

  try {
    const reply = await requestCloudText(
      cloudConfig.answerSynthesisModel,
      [
        {
          role: 'system',
          content: 'Rewrite the answer into clear final user-facing text. Keep it concise, practical, grounded in the provided context, and never include hidden reasoning or <think> tags.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            query,
            reasoning: reasoning.text,
            toolSummary,
            context: buildKbContextList(chunks),
          }),
        },
      ],
      AUXILIARY_TIMEOUT_MS,
    )
    setPipelineStep('synthesizer', {
      model: cloudConfig.answerSynthesisModel,
      healthy: true,
      detail: 'Healthy',
    })
    return {
      text: reply.text,
      modelUsed: cloudConfig.answerSynthesisModel,
      healthy: true,
    }
  } catch {
    setPipelineStep('synthesizer', {
      model: cloudConfig.semanticModel,
      healthy: false,
      detail: 'Fallback',
    })
    return {
      text: localAnswer,
      modelUsed: cloudConfig.semanticModel,
      healthy: false,
    }
  }
}

function buildLiveTestResult(test: LiveTest | null, steps: PipelineStepState[], chunks: ScoredChunk[], usedAttachment: boolean): void {
  if (!test) return
  const stepMap = new Map(steps.map(step => [step.id, step]))
  const items = [
    `Embeddings: ${stepMap.get('embedding')?.model === cloudConfig.semanticModel ? 'pass' : 'fail'}`,
    `Retrieval: ${chunks.length > 0 ? 'pass' : 'fail'}`,
    `Reranking: ${stepMap.get('reranker')?.healthy ? 'pass' : 'fallback'}`,
    `Reasoning: ${stepMap.get('reasoning')?.model ? 'pass' : 'fail'}`,
    `Deep: ${test.deep ? (chunks.length >= 7 ? 'pass' : 'fail') : 'not used'}`,
    `Vision: ${test.needsImage ? (usedAttachment ? 'pass' : 'waiting for image') : 'not used'}`,
    'Browser: pass',
  ]
  state.liveTestResult = {
    label: test.label,
    passed: items.every(item => !item.endsWith('fail')),
    items,
  }
  renderLiveTests()
}

async function runTurn(input: string, test: LiveTest | null): Promise<void> {
  const routeInfo = analyzeRoute(input)
  if (routeInfo.route === 'help') {
    pushMessage({
      role: 'assistant',
      text: 'Available playground commands:',
      blocks: [{
        type: 'list',
        items: COMMAND_GUIDE.map(entry => `${entry.syntax} - ${entry.purpose}`),
      }],
    })
    buildLiveTestResult(test, state.pipeline, [], Boolean(state.attachment))
    return
  }

  const wantsDeep = state.pendingDeepReasoning || routeInfo.complex || Boolean(test?.deep)
  state.pendingDeepReasoning = false
  renderHeaderState()

  state.pipeline = createInitialPipeline()
  renderPipeline()

  setPipelineStep('input', {
    healthy: true,
    detail: 'Healthy',
  })

  const attachment = state.attachment
  const vision = await runVisionStep(attachment)
  const combinedInput = [routeInfo.normalizedQuestion, vision.text].filter(Boolean).join('\n\n')

  setPipelineStep('router', {
    model: cloudConfig.semanticModel,
    healthy: true,
    detail: routeInfo.route,
  })
  setPipelineStep('classifier', {
    model: cloudConfig.semanticModel,
    healthy: true,
    detail: routeInfo.classification,
  })
  setPipelineStep('embedding', {
    model: cloudConfig.semanticModel,
    healthy: true,
    detail: 'Healthy',
  })

  const retrievalLimit = wantsDeep ? DEEP_RETRIEVAL_LIMIT : STANDARD_RETRIEVAL_LIMIT
  const retrieved = sanitizeChunks(scoreKnowledge(combinedInput || routeInfo.normalizedQuestion, retrievalLimit))
  setPipelineStep('retriever', {
    model: 'N/A',
    healthy: Boolean(state.bundle),
    detail: `${retrieved.length} chunks`,
  })
  setPipelineStep('sanitizer', {
    model: 'N/A',
    healthy: true,
    detail: `${retrieved.length} kept`,
  })
  setPipelineStep('ranker', {
    model: cloudConfig.semanticModel,
    healthy: true,
    detail: 'Healthy',
  })

  const reranked = await runReranker(routeInfo.normalizedQuestion, retrieved)
  const assembledContext = JSON.stringify({
    input: routeInfo.normalizedQuestion,
    route: routeInfo.route,
    classification: routeInfo.classification,
    vision: vision.text || null,
    chunks: reranked.reranked.map(entry => ({
      id: entry.chunk.id,
      title: entry.chunk.title,
      category: entry.chunk.category,
      summary: entry.chunk.summary || entry.chunk.text.slice(0, 280),
    })),
  })
  setPipelineStep('assembler', {
    model: 'N/A',
    healthy: true,
    detail: 'Healthy',
  })

  const explicitToolRequest = routeInfo.forcedToolRequest
  const intent = await runIntentInterpreter(routeInfo, assembledContext, wantsDeep, Boolean(explicitToolRequest))
  const reasoning = await runReasoningStep(routeInfo.normalizedQuestion, vision.text, reranked.reranked, intent.deepReasoning, routeInfo)
  const planner = await runPlannerStep(routeInfo, assembledContext, explicitToolRequest, intent)

  let toolSummary: string | null
  let toolBlocks: PlaygroundBlock[] | undefined
  if (planner.toolNeeded && planner.toolRequest) {
    const toolResult = await executePlatformTool(planner.toolRequest)
    toolSummary = toolResult.success ? toolResult.summary : `Tool failed: ${toolResult.reason}`
    toolBlocks = toolResult.success ? buildToolBlocks(toolResult.data) : [{ type: 'pre', text: toolResult.reason }]
  } else {
    toolSummary = routeInfo.route === 'tool' && !planner.toolRequest
      ? 'No matching tool request was found.'
      : null
  }

  const synthesized = await runAnswerSynthesizer(routeInfo.normalizedQuestion, reasoning, planner, toolSummary, reranked.reranked)
  const finalText = synthesized.text.trim() || buildSemanticAnswer(routeInfo.normalizedQuestion, reasoning.text, toolSummary)
  setPipelineStep('post', {
    model: 'N/A',
    healthy: true,
    detail: 'Healthy',
  })

  pushMessage({
    role: 'assistant',
    text: finalText,
    blocks: buildAnswerBlocks(reranked.reranked, toolBlocks),
  })

  buildLiveTestResult(test, state.pipeline, reranked.reranked, Boolean(attachment))
}

async function submitMessage(rawInput: string, test: LiveTest | null = null): Promise<void> {
  const trimmed = rawInput.trim()
  if (!trimmed || state.busy) return

  pushMessage({ role: 'user', text: trimmed })
  dom.composerInput.value = ''
  state.busy = true
  renderHeaderState()

  try {
    await runTurn(trimmed, test)
  } catch (error) {
    pushMessage({
      role: 'system',
      text: 'The playground run failed.',
      blocks: [{ type: 'pre', text: error instanceof Error ? error.message : String(error) }],
    })
  } finally {
    state.busy = false
    renderHeaderState()
  }
}

async function readAttachment(file: File): Promise<AttachmentState> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('Failed to read image'))
    reader.readAsDataURL(file)
  })

  const previewUrl = URL.createObjectURL(file)
  const size = await new Promise<{ width: number; height: number }>((resolve) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => resolve({ width: 0, height: 0 })
    image.src = dataUrl
  })

  return {
    file,
    dataUrl,
    mimeType: file.type || 'image/*',
    previewUrl,
    width: size.width,
    height: size.height,
  }
}

export function mountPlayground(): void {
  dom.reloadButton.addEventListener('click', async () => {
    await loadKnowledgeBundle(true)
  })

  dom.attachmentButton.addEventListener('click', () => {
    dom.attachmentInput.click()
  })

  dom.attachmentInput.addEventListener('change', async () => {
    const file = dom.attachmentInput.files?.[0]
    if (!file) return
    clearAttachment()
    state.attachment = await readAttachment(file)
    renderAttachmentStrip()
  })

  dom.deepButton.addEventListener('click', () => {
    if (state.busy) return
    state.pendingDeepReasoning = !state.pendingDeepReasoning
    renderHeaderState()
  })

  dom.commandHelpOpen.addEventListener('click', () => {
    openCommandHelpDialog()
  })

  dom.commandHelpClose.addEventListener('click', () => {
    closeCommandHelpDialog()
  })

  dom.commandHelpDialog.addEventListener('click', event => {
    if (event.target === dom.commandHelpDialog) {
      closeCommandHelpDialog()
    }
  })

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !dom.commandHelpDialog.hidden) {
      closeCommandHelpDialog()
    }
  })

  dom.composerForm.addEventListener('submit', async event => {
    event.preventDefault()
    await submitMessage(dom.composerInput.value)
  })

  dom.composerInput.addEventListener('input', () => {
    updateSlashSuggestions()
  })

  dom.composerInput.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      if (state.slashSuggestions.length === 0) return
      event.preventDefault()
      state.slashSuggestionIndex = (state.slashSuggestionIndex + 1) % state.slashSuggestions.length
      renderSlashSuggestionMenu()
      return
    }

    if (event.key === 'ArrowUp') {
      if (state.slashSuggestions.length === 0) return
      event.preventDefault()
      state.slashSuggestionIndex = (state.slashSuggestionIndex - 1 + state.slashSuggestions.length) % state.slashSuggestions.length
      renderSlashSuggestionMenu()
      return
    }

    if (event.key === 'Tab') {
      if (selectCommandPlaceholder(event.shiftKey ? -1 : 1)) {
        event.preventDefault()
        return
      }

      if (state.slashSuggestions.length === 0) return
      const suggestion = state.slashSuggestions[state.slashSuggestionIndex]
      if (!suggestion) return
      event.preventDefault()
      applySlashSuggestion(suggestion)
      return
    }

    if (event.key === 'Escape') {
      state.slashSuggestions = []
      renderSlashSuggestionMenu()
    }
  })

  window.addEventListener('resize', () => {
    updateExpandableHeights(dom.pipelineList, '.playground-pipeline__row', '.playground-pipeline__description', '--expand-height')
    updateExpandableHeights(dom.commandList, '.playground-command-row', '.playground-command-row__expand', '--expand-height')
  })

  state.pipeline = createInitialPipeline()
  setStatus(state.status)
  setKbVersion(state.kbVersion)
  setKbDetails(state.kbChunkCount, state.kbDimensions)
  renderHeaderState()
  renderPipeline()
  renderLiveTests()
  renderCommandGuide()
  renderAttachmentStrip()
  updateSlashSuggestions()

  const welcome = buildSessionWelcome()

  pushMessage({
    role: 'assistant',
    text: welcome.text,
    blocks: [{
      type: 'list',
      title: 'Try one of these',
      items: welcome.examples,
    }],
  })

  void loadKnowledgeBundle(false)
}
