# TowerAI

Powered by CatGPT.

TowerAI is the assistant core extracted from The Tower Run Tracker, published as `towerai` on npm. It packages three closely related pieces of functionality:

- a typed action runtime for building local-first AI control layers in your own app
- a typed platform tool surface for deterministic chart and calculator execution
- a browser playground that exercises the same knowledge, routing, fallback, and tool paths in a live UI

The package currently exposes five public entry points:

- `towerai`
- `towerai/core`
- `towerai/tools`
- `towerai/kb`
- `towerai/game-data`

## What TowerAI Provides

### `towerai/core`

Use the core entry point when you want to embed TowerAI-style orchestration into your own application.

Core exports include:

- action contracts and execution trace types
- `TowerAiActionRegistry` for registering actions and executing typed requests
- `TowerAiOrchestrator` for running multi-step plans
- `createTowerAiRuntime()` for wiring grouped actions into a runtime
- `createTowerAiDirector()` for batch-running prompt sessions and grading them
- policy and capability helpers for confirmation, admin-only blocking, and signed manifests
- structured reply and plan validation helpers
- knowledge bundle loading via `loadTowerAiKbArtifactBundle()`

### `towerai/tools`

Use the tools entry point when you want deterministic, model-free execution for supported charts and calculators.

Tool exports include:

- Zod request schemas for every supported tool
- request/result contracts for the packaged tool executor
- `executeTowerAiPlatformTool()` and `createTowerAiPlatformToolExecutor()`
- chart helpers such as `listChartCatalog()` and `buildChartTablePreview()`
- calculator helpers such as `buildLabProgressPreview()` and `buildShardSplitPreview()`

### `towerai/kb`

Use the KB entry point when you want the bundled canonical knowledge surface, validators, and contributor-facing KB build helpers that ship with the package.

KB exports include:

- `buildTrackerAiCanonicalKbChunks()`
- `validateCanonicalKbArray()`
- `loadCanonicalKbFromFile()`
- the bundled canonical KB schema and adapter surface

### `towerai/game-data`

Use the game-data entry point when you want the bundled shared tracker and calculator datasets that TowerAI ships for convenience.

Game-data exports include:

- card data
- module data
- relic data
- workshop tracker definitions
- workshop enhancement tracker definitions

## Development

Requirements:

- Node.js 22
- pnpm 10.8.1

Install dependencies:

```bash
pnpm install
```

Optional: create a local env file for the playground if you want cloud-enhanced reasoning, reranking, or vision:

```bash
cp .env.example .env
```

The checked-in `.env.example` is the authoritative list of optional cloud settings:

```env
TOWERAI_CLOUD_AI_ENDPOINT=https://api.groq.com/openai/v1/chat/completions
TOWERAI_CLOUD_AI_API_KEY=
TOWERAI_CLOUD_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
TOWERAI_CLOUD_RANKING_MODEL=openai/gpt-oss-20b
TOWERAI_CLOUD_INTENT_MODEL=openai/gpt-oss-20b
TOWERAI_CLOUD_REASONING_MODEL=qwen/qwen3-32b
TOWERAI_CLOUD_DEEP_REASONING_MODEL=openai/gpt-oss-120b
TOWERAI_CLOUD_FALLBACK_REASONING_MODEL=openai/gpt-oss-20b
TOWERAI_CLOUD_ANSWER_SYNTHESIS_MODEL=openai/gpt-oss-20b
TOWERAI_SEMANTIC_MODEL=gte-small
```

If you want the cloud-enhanced path, then add your own Groq API key to `.env`.

Get a free key from the Groq Console:

- Open [Groq Console API Keys](https://console.groq.com/keys)
- Sign in or create an account
- Create an API key
- Paste that value into `TOWERAI_CLOUD_AI_API_KEY` in your local `.env`

Do not commit `.env` or your real API key. This repository includes `.env.example` for a safe checked-in template only.

Start the local playground dev server:

```bash
pnpm dev
```

The TowerAI playground always uses `http://localhost:5178` in development. Running `pnpm dev` again restarts the same port instead of requiring a manual cleanup step.

Common repo commands:

- `pnpm dev` starts the hot-reload playground on `localhost:5178`
- `pnpm lint` runs the repo ESLint checks
- `pnpm type-check` runs the package TypeScript check

Run the package lint gate:

```bash
pnpm lint
```

Build the package:

```bash
pnpm build
```

Build the playground bundle:

```bash
pnpm playground:build
```

Run the automated playground smoke check:

```bash
pnpm playground:smoke
```

Run the standalone release validation gate:

```bash
pnpm validate:standalone
```

## Local-Only Browser Mode

TowerAI does not require a backend service or remote AI endpoint to function in the browser.

- the packaged calculators and chart tooling are fully deterministic and local
- the playground loads the checked-in KB artifact bundle from local static files
- if `TOWERAI_CLOUD_AI_API_KEY` is empty, the playground still works entirely in-browser with local retrieval, local routing, and packaged tool execution
- the cloud variables only enable optional vision, reranking, and natural-language synthesis passes

For another app embedding TowerAI in the browser, the main requirement is to serve the KB artifact files from your own static assets or public path and point `loadTowerAiKbArtifactBundle()` at that local path.

## Playground

The repository includes a lightweight chat-style playground for local testing. It is not a toy UI layered on top of fake responses; it exercises the real KB loader, retrieval path, optional cloud path, and packaged tool executor.

Key facts:

- `gte-small` is the only supported semantic artifact model for embedding, indexing, and KB lookup
- the local knowledge bundle is loaded from the checked-in KB artifact manifest
- the entire playground works locally in the browser without any remote server when no API key is configured
- reasoning is opt-in and only works when `TOWERAI_CLOUD_AI_API_KEY` is set in the local `.env`
- the preferred cloud path uses the OpenAI-compatible SDK for chat completions
- the explicit endpoint value is still supported as a fallback transport
- without an API key, the playground intentionally falls back to deterministic functionality only, such as KB chunk lookup and packaged calculator/chart tools
- every pipeline row now shows its current detail state directly in the UI, so fallback, route, and chunk-count changes are visible without hover-only inspection
- `pnpm playground:smoke` builds the package, serves the built playground and checked-in artifact tree through a local smoke server, checks that static assets load, validates HTTP KB artifact loading, and confirms packaged chart tooling still resolves data

### Playground Pipeline

The playground uses a fixed step pipeline so you can see what is happening for each request.

| Stage | What it does | Typical model/runtime |
| --- | --- | --- |
| `Your Question` | Captures the prompt and any command text. | Local UI state |
| `Image Notes` | Extracts structured text from an attached screenshot. | `TOWERAI_CLOUD_VISION_MODEL` or local fallback |
| `Question Match` | Routes the request into knowledge, tool, help, or multistep reasoning behavior. | `gte-small` |
| `Topic Match` | Tags the request by topic so retrieval can prioritize the right chunk families. | `gte-small` |
| `Search Prep` | Builds semantic-search-ready query state. | `gte-small` |
| `Library Search` | Pulls candidate chunks from the local KB bundle. | Local KB bundle |
| `Cleanup` | Removes duplicate and noisy candidates. | Local logic |
| `Local Sort` | Applies deterministic local relevance ordering. | `gte-small`-driven lexical/semantic scoring |
| `Cloud Sort` | Optional reranking pass over retrieved chunks. | `TOWERAI_CLOUD_RANKING_MODEL` or fallback |
| `Answer Prep` | Builds the normalized reasoning context object. | Local logic |
| `Intent Check` | Decides whether the prompt is ambiguous, tool-driven, or simple KB lookup. | `TOWERAI_CLOUD_INTENT_MODEL` or fallback |
| `Draft Reply` | Generates the first natural-language answer. | `TOWERAI_CLOUD_REASONING_MODEL`, `TOWERAI_CLOUD_DEEP_REASONING_MODEL`, fallback model, or local deterministic answer |
| `Tool Check` | Decides whether a packaged tool should run. | `TOWERAI_CLOUD_ANSWER_SYNTHESIS_MODEL` or fallback |
| `Final Reply` | Rewrites the final user-facing answer. | `TOWERAI_CLOUD_ANSWER_SYNTHESIS_MODEL` or fallback |
| `Polish` | Final cleanup before display. | Local logic |

### Standard vs Deep Mode

Deep mode does not just flip a label. In the current playground it changes the working behavior in at least three important ways:

- retrieval limit increases from 5 chunks to 8 chunks
- reasoning timeout increases from 12 seconds to 19 seconds
- the preferred draft model switches from `TOWERAI_CLOUD_REASONING_MODEL` to `TOWERAI_CLOUD_DEEP_REASONING_MODEL`

In live UI validation, the same tournament question produced:

- standard answer: 164 words
- deep answer: 264 words
- standard draft model: cloud standard reasoning path
- deep draft model: `openai/gpt-oss-120b`

That is the kind of measurable stage difference the playground is meant to make visible.

### Playground Command Catalog

The chat box accepts normal questions and a small command surface.

| Command | Purpose | Arguments |
| --- | --- | --- |
| `/help` | Show the visible playground command list. | none |
| `/kb <question>` | Force a direct knowledge-base lookup path. | any KB-grounded question |
| `/chart [chartPathId=...] [category=...] [subcategory=...] [item=...]` | Drive the authoritative chart browser request shape from named args. | use `chartPathId=` for a stable direct selection |
| `/calc <calculatorId> <operation> key=value ...` | Drive the authoritative schema-first calculator request surface. | supports `bots`, `uw`, `labs`, `modules`, and `uptime` |

Advanced developer commands also exist:

| Command | Purpose | Notes |
| --- | --- | --- |
| `/calc module {shards \| coins \| main-sub} {fromLevel} {toLevel} [discount]` | Run the module upgrade cost ladder parser built into the playground. | This covers only module level cost ladders. It does not model rarity, family, or substat mechanics. |
| `/tool {json}` | Invoke the packaged tool executor directly with a strict JSON request. | Useful for testing exact request payloads and integration code paths. |

Examples:

```text
/kb What unlocks Workshop Enhancements?
/chart chartPathId=bots:upgrades-and-costs:golden-bot
/chart category=Modules subcategory=Substats
/calc bots medalsToTarget bot=gb stat=cd startLevel=0 targetLevel=15
/calc uw stonesToMax weapon=gt stat=bonus startLevel=0
/calc modules moduleCost moduleType=core rarity="Ancestral 5" currentLevel=1 targetLevel=41 assistEffPct=25
/calc module shards 1 20 0
/tool {"tool":"chart.preview.table","args":{"category":"Bots","subcategory":"Upgrades and Costs","item":"Golden Bot"}}
```

## Packaged Tool Registry

The packaged tool surface is typed and schema-validated. These are the supported tool names and argument shapes exported by `towerai/tools`.

### Chart Tools

#### `chart.browse`

Resolve a chart selection from a stable path id or category path and return the shared table preview when a specific chart is selected.

```ts
{
  tool: 'chart.browse',
  args: {
    chartPathId?: string,
    category?: string,
    subcategory?: string,
    item?: string,
    selectedStats?: string[],
  },
}
```

#### `chart.catalog.list`

List available chart categories, subcategories, or items.

```ts
{
  tool: 'chart.catalog.list',
  args: {
    category?: string,
    subcategory?: string,
  },
}
```

#### `chart.preview.table`

Build a table preview for a single chart.

```ts
{
  tool: 'chart.preview.table',
  args: {
    category: string,
    subcategory: string,
    item: string,
  },
}
```

### Calculator Tools

#### `calc.run`

Schema-driven calculator execution surface aligned to the authoritative calculator ids and operations.

```ts
{
  tool: 'calc.run',
  args:
    | { calculatorId: 'bots'; operation: 'medalsToTarget'; bot: string; stat?: string; startLevel?: number; targetLevel?: number }
    | { calculatorId: 'uw'; operation: 'stonesToMax'; weapon: string; stat: string; startLevel?: number; targetLevel?: number }
    | { calculatorId: 'uw'; operation: 'stonesToMaxAllStats'; weapon: string; startLevel?: number }
    | { calculatorId: 'labs'; operation: 'rangeCosts'; labName: string; currentLevel?: number; targetLevel?: number }
    | { calculatorId: 'modules'; operation: 'moduleCost' | 'assistModuleStones' | 'shardSplitter' | 'damagePath'; ...namedArgs }
    | { calculatorId: 'uptime'; operation: 'project'; field?: string; focusSubjects?: string[]; compareSubjects?: [string, string] },
}
```

#### `calc.module.costs`

Pure module upgrade cost ladder math.

```ts
{
  tool: 'calc.module.costs',
  args: {
    costType: 'shards' | 'coins' | 'main-sub',
    fromLevel: number,
    toLevel: number,
    discountPercent?: number,
  },
}
```

#### `calc.workshop.costs`

Workshop level cost preview using a supplied cost table.

```ts
{
  tool: 'calc.workshop.costs',
  args: {
    costs: number[] | Record<string, number>,
    fromLevel: number,
    toLevel: number,
    sectionDiscountPercent?: number,
    vaultDiscountPercent?: number,
  },
}
```

#### `calc.shard.split`

Shard split recommendation math for primary and secondary module investment.

```ts
{
  tool: 'calc.shard.split',
  args: {
    moduleType: 'cannon' | 'defense' | 'generator' | 'core',
    primaryLevel: number,
    secondaryLevel: number,
    primaryRarity: string,
    secondaryRarity: string,
    assistEffPct: number,
    assistLabLevel?: number,
    unspentShards: number,
    shardDiscount: number,
  },
}
```

#### `calc.lab.progress`

Lab progression rows for a named lab under speed modifiers.

```ts
{
  tool: 'calc.lab.progress',
  args: {
    labName: string,
    currentLevel: number,
    targetLevel: number,
    modifiers: {
      labSpeed: number,
      labRelic: number,
      labDiscount: number,
      speedUp: number,
    },
  },
}
```

#### `calc.bot.costs`

Bot upgrade cost rows for a specific bot stat.

```ts
{
  tool: 'calc.bot.costs',
  args: {
    botName: string,
    statName: string,
    startLevel: number,
    targetLevel: number,
    labLevels?: {
      Duration?: number,
      Cooldown?: number,
    },
  },
}
```

#### `calc.guardian.costs`

Guardian upgrade cost preview using the shared guardian definitions and stat validation.

```ts
{
  tool: 'calc.guardian.costs',
  args: {
    guardianType: string,
    statName?: string,
    startLevel?: number,
    targetLevel?: number,
  },
}
```

#### `calc.uptime.project`

Shared uptime projection payload builder with bounded field, subject, and override inputs.

```ts
{
  tool: 'calc.uptime.project',
  args: {
    field?: 'overview' | 'uptime' | 'perma' | 'effectiveCd' | 'sync',
    focusSubjects?: string[],
    compareSubjects?: [string, string],
    includeDwKillWave?: boolean,
    overrides?: Record<string, unknown>,
  },
}
```

#### `calc.thorns.wall` and `calc.thorns.base`

Thorns breakpoint tables for wall-based or base-based calculations.

```ts
{
  tool: 'calc.thorns.wall',
  args: {
    baseThorns?: number,
    tier?: number,
    pcLevel?: number,
    pcMasteryLevel?: number,
    bcLabLevel?: number,
    bcReductionLabLevel?: number,
    pcReductionLabLevel?: number,
    tournamentTier?: 'none' | 't11' | 't14' | 't17',
    heatWave?: number,
    sharpFortitude?: boolean,
  },
}
```

Use the same argument shape for `calc.thorns.base`.

## Using TowerAI In Your Own App

### Example: Build a Local Action Runtime

This is the lowest-level integration point when you want TowerAI to execute actions against your app.

```ts
import {
  createTowerAiRuntime,
  type TowerAiActionDefinition,
} from 'towerai/core'

const navigationActions: TowerAiActionDefinition[] = [
  {
    name: 'site.navigate',
    description: 'Navigate to a route in the host app.',
    scope: 'navigation',
    run: async (args) => {
      const route = String(args.route || '/').trim()
      return {
        success: true,
        route,
      }
    },
  },
]

const storeActions: TowerAiActionDefinition[] = [
  {
    name: 'store.read',
    description: 'Read state from the host store.',
    scope: 'tracker-read',
    run: async (args) => {
      return {
        success: true,
        value: {
          store: args.store,
          path: args.path,
        },
      }
    },
  },
]

const runtime = createTowerAiRuntime([navigationActions, storeActions])

const trace = await runtime.orchestrator.executePlan({
  prompt: 'Open the workshop page and read the current discounts.',
  steps: [
    { action: 'site.navigate', args: { route: '/tools/workshop' } },
    { action: 'store.read', args: { store: 'workshop', path: 'discounts' } },
  ],
})

console.log(trace.results)
```

### Example: Run a Regression Session With The Director

Use the director when you already have a local TowerAI turn executor and want structured multi-prompt evaluation.

```ts
import {
  createTowerAiDirector,
  type TowerAiTurnResult,
} from 'towerai/core'

type LocalTrace = {
  prompt: string
  steps: Array<{ action: string; args: Record<string, unknown> }>
  results: Array<{ status: 'success' | 'failed' | 'skipped'; action: string; durationMs: number }>
  startedAtIso: string
  finishedAtIso: string
}

async function runLocalTurn(prompt: string): Promise<TowerAiTurnResult<LocalTrace>> {
  const startedAtIso = new Date().toISOString()
  const finishedAtIso = new Date().toISOString()
  return {
    reply: `Handled: ${prompt}`,
    trace: {
      prompt,
      steps: [{ action: 'kb.lookup', args: { query: prompt } }],
      results: [{ status: 'success', action: 'kb.lookup', durationMs: 12 }],
      startedAtIso,
      finishedAtIso,
    },
  }
}

const director = createTowerAiDirector(runLocalTurn)

const session = await director.runSession({
  commands: [
    {
      id: 'faq-negative-breakouts',
      prompt: 'Why can Black Hole, Golden Bot, or Spotlight show negative values on the stats page?',
      requiredActions: ['kb.lookup'],
      maxLatencyMs: 5000,
    },
    {
      id: 'themes-bonus',
      prompt: 'How is the passive coin bonus from owned themes calculated?',
      requiredActions: ['kb.lookup'],
      maxLatencyMs: 5000,
    },
  ],
})

console.log(session.passed, session.steps)
```

### Example: Execute Packaged Tools Directly

Use the packaged executor when you want strict deterministic answers for supported charts and calculators.

```ts
import { createTowerAiPlatformToolExecutor } from 'towerai/tools'

const tools = createTowerAiPlatformToolExecutor()

const chartCatalog = tools.execute({
  tool: 'chart.catalog.list',
  args: { category: 'Ultimate Weapons' },
})

const labProgress = tools.execute({
  tool: 'calc.lab.progress',
  args: {
    labName: 'Lab Speed',
    currentLevel: 40,
    targetLevel: 50,
    modifiers: {
      labSpeed: 60,
      labRelic: 10,
      labDiscount: 0,
      speedUp: 2,
    },
  },
})

console.log(chartCatalog.summary)
console.log(labProgress.data)
```

### Example: Load The Shared KB Artifact Bundle

Use the KB artifact loader when your app wants the same local knowledge bundle structure used by the playground.

```ts
import {
  DEFAULT_TOWER_AI_KB_ARTIFACT_PROVIDER,
  loadTowerAiKbArtifactBundle,
} from 'towerai/core'

const bundle = await loadTowerAiKbArtifactBundle({
  provider: DEFAULT_TOWER_AI_KB_ARTIFACT_PROVIDER,
  fetchImpl: fetch,
  publicBasePath: '/knowledge/trackerai-kb',
})

if (!bundle) {
  throw new Error('Knowledge bundle unavailable')
}

console.log(bundle.version)
console.log(bundle.metadata)
```

## Publishing

The package is configured to publish to GitHub Packages under the `@tmrxjd` scope.

## KB Artifacts

The shared TrackerAI knowledge bundle publishes through this repository.

- artifact manifest: `artifacts/kb/manifest.json`
- versioned semantic bundle: `artifacts/kb/gte-small/<version>/...`
- cached `gte-small` model assets: `artifacts/models/gte-small/...`
- remote manifest and artifact URLs must be pinned to an immutable commit hash or release tag, never `main`

Clone with Git LFS enabled before working with the tracked ONNX model payload:

```bash
git lfs install
git lfs pull
```

The local playground reads the knowledge bundle from the checked-in `artifacts/kb/manifest.json`, so a clone can be tested immediately after install.

## License

This repository is licensed under the MIT License. See the LICENSE file for the full terms.
