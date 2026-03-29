#!/usr/bin/env node

import { readFile, access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST_DIR = path.join(ROOT_DIR, 'dist')
const PLAYGROUND_DIST_DIR = path.join(ROOT_DIR, 'playground-dist')
const MANIFEST_PATH = path.join(ROOT_DIR, 'artifacts', 'kb', 'manifest.json')
const PROVIDER = 'gte-small'
const MUTABLE_REFS = new Set(['', 'head', 'latest', 'main', 'master'])

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function ensurePathExists(targetPath) {
  await access(targetPath)
}

function isCommitHash(value) {
  return /^[0-9a-f]{40}$/i.test(String(value || '').trim())
}

function isTagLike(value) {
  return /^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/i.test(String(value || '').trim())
}

function assertImmutableRef(ref, label) {
  const normalized = String(ref || '').trim()
  assert(normalized.length > 0, `${label} is missing`) 
  assert(!MUTABLE_REFS.has(normalized.toLowerCase()), `${label} must be commit- or tag-pinned. Received mutable ref: ${normalized}`)
  assert(isCommitHash(normalized) || isTagLike(normalized), `${label} must be a 40-character commit hash or a release tag. Received: ${normalized}`)
}

function toArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
}

function createFileFetch() {
  return async (input) => {
    const url = new URL(String(input))
    if (url.protocol !== 'file:') {
      throw new Error(`Standalone validation only supports file URLs. Received: ${url.href}`)
    }

    try {
      const buffer = await readFile(fileURLToPath(url))
      return {
        ok: true,
        status: 200,
        arrayBuffer: async () => toArrayBuffer(buffer),
      }
    } catch (error) {
      const code = error && typeof error === 'object' && 'code' in error
        ? String(error.code)
        : ''
      if (code === 'ENOENT') {
        return {
          ok: false,
          status: 404,
          arrayBuffer: async () => new ArrayBuffer(0),
        }
      }
      throw error
    }
  }
}

function buildLocalManifest(manifest) {
  const providers = Object.fromEntries(
    Object.entries(manifest.providers || {}).map(([provider, value]) => {
      const version = String(value?.version || '').trim()
      const providerRoot = path.join(ROOT_DIR, 'artifacts', 'kb', provider, version)
      return [provider, {
        ...value,
        files: {
          versionUrl: pathToFileURL(path.join(providerRoot, 'trackerai-kb.version.txt')).href,
          metadataUrl: pathToFileURL(path.join(providerRoot, 'trackerai-kb.metadata.json')).href,
          chunksUrl: pathToFileURL(path.join(providerRoot, 'trackerai-kb.chunks.json')).href,
          indexUrl: pathToFileURL(path.join(providerRoot, 'trackerai-kb.index.json')).href,
        },
        modelAsset: value?.modelAsset
          ? {
              ...value.modelAsset,
              rootUrl: pathToFileURL(path.join(ROOT_DIR, 'artifacts', 'models', provider)).href,
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

async function main() {
  await ensurePathExists(path.join(DIST_DIR, 'index.js'))
  await ensurePathExists(path.join(DIST_DIR, 'core', 'index.js'))
  await ensurePathExists(path.join(DIST_DIR, 'tools', 'index.js'))
  await ensurePathExists(path.join(PLAYGROUND_DIST_DIR, 'index.html'))

  const core = require(path.join(DIST_DIR, 'core'))
  const tools = require(path.join(DIST_DIR, 'tools'))
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8'))
  const providerEntry = manifest?.providers?.[PROVIDER]

  assert(providerEntry, `Manifest is missing provider ${PROVIDER}`)
  assertImmutableRef(manifest?.repo?.ref, 'Manifest repo.ref')
  assertImmutableRef(core.DEFAULT_TOWER_AI_KB_ARTIFACT_REPO_REF, 'TowerAI default repo ref')
  assert(
    String(core.DEFAULT_TOWER_AI_KB_ARTIFACT_REPO_MANIFEST_URL || '').includes(`/${core.DEFAULT_TOWER_AI_KB_ARTIFACT_REPO_REF}/artifacts/kb/manifest.json`),
    'TowerAI default manifest URL is not pinned to the default immutable ref',
  )

  const bundle = await core.loadTowerAiKbArtifactBundle({
    provider: PROVIDER,
    skipLocalArtifacts: true,
    repoManifest: buildLocalManifest(manifest),
    repoConfig: { manifestUrl: pathToFileURL(MANIFEST_PATH).href },
    fetchImpl: createFileFetch(),
  })

  assert(bundle, 'TowerAI KB bundle failed to load from local artifact files')
  assert(bundle.version === providerEntry.version, `TowerAI KB bundle version mismatch. Expected ${providerEntry.version}, received ${bundle.version}`)

  const chunkCount = Array.isArray(bundle.chunks?.chunks)
    ? bundle.chunks.chunks.length
    : 0
  assert(chunkCount > 0, 'TowerAI KB bundle did not expose any chunks after load')

  const toolResult = tools.executeTowerAiPlatformTool({
    tool: 'chart.catalog.list',
    args: {},
  })
  assert(toolResult?.success === true, `Deterministic tool execution failed: ${toolResult?.reason || 'unknown error'}`)

  const toolData = toolResult.data && typeof toolResult.data === 'object'
    ? toolResult.data
    : null
  const categoryCount = Array.isArray(toolData?.categories) ? toolData.categories.length : 0
  assert(categoryCount > 0, 'Deterministic tool validation returned no chart categories')

  process.stdout.write(`${JSON.stringify({
    packageBuild: path.join(DIST_DIR, 'index.js'),
    playgroundBuild: path.join(PLAYGROUND_DIST_DIR, 'index.html'),
    kbProvider: PROVIDER,
    kbVersion: bundle.version,
    kbChunkCount: chunkCount,
    tool: toolResult.tool,
    toolSummary: toolResult.summary,
    chartCategoryCount: categoryCount,
  }, null, 2)}\n`)
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})