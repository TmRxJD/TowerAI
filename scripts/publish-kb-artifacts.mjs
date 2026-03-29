#!/usr/bin/env node

import { execFile as execFileCallback } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { gzipSync } from 'node:zlib'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const execFile = promisify(execFileCallback)

const DEFAULT_CANONICAL_KB_PATH = path.resolve('artifacts', 'kb-source', 'trackerai-canonical-kb.json')
const DEFAULT_ARTIFACT_OUTPUT_DIR = path.resolve('artifacts', 'kb-build')
const DEFAULT_TOWERAI_REPO_DIR = path.resolve(SCRIPT_DIR, '..')
const DEFAULT_TOWERAI_REPO_OWNER = 'TmRxJD'
const DEFAULT_TOWERAI_REPO_NAME = 'TowerAI'
const DEFAULT_TOWERAI_REPO_REF = ''
const DEFAULT_TOWERAI_KB_MANIFEST_RELATIVE_PATH = path.join('artifacts', 'kb', 'manifest.json')
const DEFAULT_TOWERAI_KB_RELATIVE_DIR = path.join('artifacts', 'kb')
const DEFAULT_TOWERAI_MODEL_RELATIVE_DIR = path.join('artifacts', 'models')
const DEFAULT_EMBED_MODEL = 'Xenova/gte-small'
const DEFAULT_EMBED_MODELS = [DEFAULT_EMBED_MODEL]
const DEFAULT_EMBED_CACHE_DIR = path.resolve('.towerai', 'models', 'transformers-cache')
const DEFAULT_EMBED_BATCH_SIZE = 32
const MUTABLE_REPO_REFS = new Set(['', 'head', 'latest', 'main', 'master'])

function parsePositiveInt(value, label) {
  const normalized = Number.parseInt(String(value || '').trim(), 10)
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error(`${label} must be a positive integer`)
  }
  return normalized
}

function parseArgs(argv) {
  const options = {
    canonicalKbPath: DEFAULT_CANONICAL_KB_PATH,
    outputDir: DEFAULT_ARTIFACT_OUTPUT_DIR,
    embedModels: [...DEFAULT_EMBED_MODELS],
    repoDir: DEFAULT_TOWERAI_REPO_DIR,
    repoOwner: DEFAULT_TOWERAI_REPO_OWNER,
    repoName: DEFAULT_TOWERAI_REPO_NAME,
    repoRef: DEFAULT_TOWERAI_REPO_REF,
    dryRun: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = String(argv[index] || '').trim()
    if (!arg) continue

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg.startsWith('--repo-dir=')) {
      options.repoDir = path.resolve(arg.slice('--repo-dir='.length).trim())
      continue
    }

    if (arg === '--repo-dir') {
      options.repoDir = path.resolve(String(argv[index + 1] || '').trim())
      index += 1
      continue
    }

    if (arg.startsWith('--repo-owner=')) {
      options.repoOwner = arg.slice('--repo-owner='.length).trim() || DEFAULT_TOWERAI_REPO_OWNER
      continue
    }

    if (arg === '--repo-owner') {
      options.repoOwner = String(argv[index + 1] || '').trim() || DEFAULT_TOWERAI_REPO_OWNER
      index += 1
      continue
    }

    if (arg.startsWith('--repo-name=')) {
      options.repoName = arg.slice('--repo-name='.length).trim() || DEFAULT_TOWERAI_REPO_NAME
      continue
    }

    if (arg === '--repo-name') {
      options.repoName = String(argv[index + 1] || '').trim() || DEFAULT_TOWERAI_REPO_NAME
      index += 1
      continue
    }

    if (arg.startsWith('--repo-ref=')) {
      options.repoRef = arg.slice('--repo-ref='.length).trim() || DEFAULT_TOWERAI_REPO_REF
      continue
    }

    if (arg === '--repo-ref') {
      options.repoRef = String(argv[index + 1] || '').trim() || DEFAULT_TOWERAI_REPO_REF
      index += 1
      continue
    }

    if (arg.startsWith('--canonical=')) {
      options.canonicalKbPath = path.resolve(arg.slice('--canonical='.length).trim())
      continue
    }

    if (arg === '--canonical') {
      options.canonicalKbPath = path.resolve(String(argv[index + 1] || '').trim())
      index += 1
      continue
    }

    if (arg.startsWith('--output-dir=')) {
      options.outputDir = path.resolve(arg.slice('--output-dir='.length).trim())
      continue
    }

    if (arg === '--output-dir') {
      options.outputDir = path.resolve(String(argv[index + 1] || '').trim())
      index += 1
      continue
    }

    if (arg.startsWith('--embed-model=')) {
      options.embedModels = [arg.slice('--embed-model='.length).trim()].filter(Boolean)
      continue
    }

    if (arg === '--embed-model') {
      options.embedModels = [String(argv[index + 1] || '').trim()].filter(Boolean)
      index += 1
      continue
    }

    if (arg.startsWith('--embed-models=')) {
      options.embedModels = arg.slice('--embed-models='.length).split(',').map(item => item.trim()).filter(Boolean)
      continue
    }

    if (arg === '--embed-models') {
      options.embedModels = String(argv[index + 1] || '').split(',').map(item => item.trim()).filter(Boolean)
      index += 1
      continue
    }
  }

  if (!Array.isArray(options.embedModels) || options.embedModels.length === 0) {
    options.embedModels = [...DEFAULT_EMBED_MODELS]
  }

  return options
}

function sha256Text(value) {
  return createHash('sha256').update(value).digest('hex')
}

function stableVersionFromArtifacts({ knowledgeVersion, embeddingModel, metadataJson, chunksJson, indexJson }) {
  const bundleHash = sha256Text([metadataJson, chunksJson, indexJson].join('\n'))
  return `${knowledgeVersion}-${String(embeddingModel || 'unknown').replace(/[^a-z0-9._-]+/gi, '-').toLowerCase()}-${bundleHash.slice(0, 12)}`
}

function normalizeEmbeddingRows(value) {
  if (!Array.isArray(value)) return []
  return value.map(row => Array.isArray(row)
    ? row.map(item => Number(item)).filter(item => Number.isFinite(item))
    : [])
}

function buildPackagedKbIndex({ knowledgeBundleVersion, embeddingModel, embeddings }) {
  const rows = Array.isArray(embeddings)
    ? embeddings.map(row => Array.isArray(row) ? row.map(value => Number(value)).filter(value => Number.isFinite(value)) : [])
    : []
  const dimensions = rows[0]?.length || 0

  if (rows.length === 0 || dimensions === 0) {
    throw new Error('KB index embeddings are required to publish TowerAI KB artifacts')
  }

  if (rows.some(row => row.length !== dimensions)) {
    throw new Error('Packaged KB index rows must all share the same dimensions')
  }

  return {
    contractVersion: 'trackerai-packaged-kb-index-v1',
    generatedAtIso: new Date().toISOString(),
    knowledgeBundleVersion,
    sourceFile: 'trackerai-canonical-kb.json',
    embeddingModel: String(embeddingModel || '').trim(),
    embeddingTaskType: 'RETRIEVAL_DOCUMENT',
    dimensions,
    chunkCount: rows.length,
    embeddings: rows,
  }
}

async function readCanonicalRuntimeRecord(canonicalKbPath) {
  const kbModule = await import('../dist/kb/index.js')
  const canonicalRaw = await readFile(canonicalKbPath, 'utf8')
  const canonicalRecords = kbModule.loadCanonicalKbFromJson(canonicalRaw, { sourceName: path.basename(canonicalKbPath) })
  return kbModule.toCanonicalRuntimeKnowledgeRecord(canonicalRecords, {
    sourceFile: path.basename(canonicalKbPath),
  })
}

async function configureTransformersEnvironment(cacheDir) {
  await mkdir(cacheDir, { recursive: true })
  const transformers = await import('@huggingface/transformers')
  if (transformers?.env) {
    transformers.env.cacheDir = cacheDir
    transformers.env.useFS = true
    transformers.env.useFSCache = true
    transformers.env.allowLocalModels = true
    transformers.env.allowRemoteModels = true
  }
  return transformers
}

function buildChunkTexts(runtimeRecord) {
  return runtimeRecord.chunks.map(chunk => [chunk.title, chunk.category, chunk.text].filter(Boolean).join('\n\n'))
}

async function fileExists(targetPath) {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

function toPosixPath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '')
}

function assertImmutableRepoRef(ref, label) {
  const normalized = String(ref || '').trim()
  if (MUTABLE_REPO_REFS.has(normalized.toLowerCase())) {
    throw new Error(`${label} must be commit- or tag-pinned, not ${normalized || '(empty)'}`)
  }
  return normalized
}

function buildRawGitHubUrl(repoInfo, relativePath) {
  const owner = encodeURIComponent(String(repoInfo.owner || '').trim())
  const name = encodeURIComponent(String(repoInfo.name || '').trim())
  const ref = encodeURIComponent(assertImmutableRepoRef(repoInfo.ref, 'repo ref'))
  const normalizedPath = toPosixPath(relativePath)
  return `https://raw.githubusercontent.com/${owner}/${name}/${ref}/${normalizedPath}`
}

async function resolveImmutableRepoRef(repoDir, explicitRef) {
  const normalizedExplicitRef = String(explicitRef || '').trim()
  if (normalizedExplicitRef) {
    return assertImmutableRepoRef(normalizedExplicitRef, 'repo ref')
  }

  const { stdout } = await execFile('git', ['-C', repoDir, 'rev-parse', 'HEAD'])
  return assertImmutableRepoRef(String(stdout || '').trim(), 'repo ref')
}

async function listRelativeFilesRecursive(baseDir, currentDir = baseDir) {
  const entries = await readdir(currentDir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await listRelativeFilesRecursive(baseDir, absolutePath))
      continue
    }

    if (entry.isFile()) {
      files.push(toPosixPath(path.relative(baseDir, absolutePath)))
    }
  }

  return files.sort((left, right) => left.localeCompare(right))
}

function resolveEmbedBatchSize() {
  const value = String(process.env.TRACKERAI_KB_PUBLISH_EMBED_BATCH_SIZE || '').trim()
  if (!value) return DEFAULT_EMBED_BATCH_SIZE
  return parsePositiveInt(value, 'TRACKERAI_KB_PUBLISH_EMBED_BATCH_SIZE')
}

function resolveProviderIdFromEmbedModel(embedModel) {
  const normalized = String(embedModel || '').trim().toLowerCase()
  if (normalized.endsWith('/gte-small') || normalized === 'gte-small') return 'gte-small'
  if (normalized.endsWith('/gte-base') || normalized === 'gte-base') return 'gte-base'
  return normalized.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '') || 'custom'
}

async function resolveEmbeddingsForRuntimeRecord(runtimeRecord, embedModelOverride) {
  const embedModel = String(embedModelOverride || process.env.TRACKERAI_KB_PUBLISH_EMBED_MODEL || DEFAULT_EMBED_MODEL).trim() || DEFAULT_EMBED_MODEL
  const cacheDir = String(process.env.TRACKERAI_EMBEDDING_CACHE_DIR || DEFAULT_EMBED_CACHE_DIR).trim() || DEFAULT_EMBED_CACHE_DIR
  const chunkTexts = buildChunkTexts(runtimeRecord)
  const batchSize = resolveEmbedBatchSize()
  process.stdout.write(`[towerai-kb] Rebuilding KB embeddings with local transformers (${embedModel}) for ${chunkTexts.length} chunks.\n`)
  const transformers = await configureTransformersEnvironment(cacheDir)
  const extractor = await transformers.pipeline('feature-extraction', embedModel, {
    device: 'cpu',
  })
  const embeddings = []
  for (let start = 0; start < chunkTexts.length; start += batchSize) {
    const batch = chunkTexts.slice(start, start + batchSize)
    const rawOutput = await extractor(batch, {
      pooling: 'mean',
      normalize: true,
    })
    const rows = normalizeEmbeddingRows(rawOutput?.tolist?.() ?? rawOutput?.data ?? rawOutput)
    if (rows.length !== batch.length) {
      throw new Error(`Local embedding runtime returned ${rows.length} rows for ${batch.length} KB chunks in batch starting at ${start}`)
    }
    embeddings.push(...rows)
    process.stdout.write(`[towerai-kb] Embedded ${Math.min(start + batch.length, chunkTexts.length)}/${chunkTexts.length} chunks for ${embedModel}.\n`)
  }

  return {
    embedModel,
    providerId: resolveProviderIdFromEmbedModel(embedModel),
    cacheDir,
    embeddings,
    vectorSize: Number(embeddings[0]?.length || 0),
    source: `local-${resolveProviderIdFromEmbedModel(embedModel)}-rebuild`,
  }
}

function buildArtifactPayloads(runtimeRecord, embeddingPayload) {
  const runtimeChunkIds = runtimeRecord.chunks.map(chunk => String(chunk.id || '').trim())
  if (embeddingPayload.embeddings.length !== runtimeChunkIds.length) {
    throw new Error(`KB embedding row mismatch: expected ${runtimeChunkIds.length}, received ${embeddingPayload.embeddings.length}`)
  }

  const metadata = {
    knowledgeBundleVersion: runtimeRecord.version,
    generatedAtIso: runtimeRecord.generatedAt,
    source: runtimeRecord.source,
    totalPages: runtimeRecord.totalPages,
    totalChunks: runtimeRecord.totalChunks,
  }

  const chunks = {
    version: runtimeRecord.version,
    source: runtimeRecord.source,
    generatedAt: runtimeRecord.generatedAt,
    totalPages: runtimeRecord.totalPages,
    totalChunks: runtimeRecord.totalChunks,
    entries: runtimeRecord.entries,
    chunks: runtimeRecord.chunks,
  }

  const index = buildPackagedKbIndex({
    knowledgeBundleVersion: runtimeRecord.version,
    embeddingModel: embeddingPayload.embedModel,
    embeddings: embeddingPayload.embeddings,
  })

  const metadataJson = `${JSON.stringify(metadata, null, 2)}\n`
  const chunksJson = JSON.stringify(chunks)
  const indexJson = JSON.stringify(index)
  const version = stableVersionFromArtifacts({
    knowledgeVersion: runtimeRecord.version,
    embeddingModel: embeddingPayload.embedModel,
    metadataJson,
    chunksJson,
    indexJson,
  })

  return {
    version,
    metadataJson,
    chunksJson,
    indexJson,
    embedModel: embeddingPayload.embedModel,
    vectorSize: embeddingPayload.vectorSize,
    chunkCount: runtimeChunkIds.length,
    embeddingSource: embeddingPayload.source,
  }
}

async function writeArtifactFiles(outputDir, payloads) {
  await mkdir(outputDir, { recursive: true })
  const versionPath = path.join(outputDir, 'trackerai-kb.version.txt')
  const metadataPath = path.join(outputDir, 'trackerai-kb.metadata.json')
  const chunksPath = path.join(outputDir, 'trackerai-kb.chunks.json')
  const indexPath = path.join(outputDir, 'trackerai-kb.index.json')

  await writeFile(versionPath, `${payloads.version}\n`, 'utf8')
  await writeFile(metadataPath, payloads.metadataJson, 'utf8')
  await writeFile(chunksPath, gzipSync(Buffer.from(payloads.chunksJson, 'utf8')))
  await writeFile(indexPath, gzipSync(Buffer.from(payloads.indexJson, 'utf8')))

  return { versionPath, metadataPath, chunksPath, indexPath }
}

function createEmptyRepoManifest(repoInfo) {
  return {
    contractVersion: 'towerai-kb-repo-manifest-v1',
    updatedAtIso: new Date().toISOString(),
    repo: {
      owner: repoInfo.owner,
      name: repoInfo.name,
      ref: repoInfo.ref,
    },
    providers: {},
  }
}

async function readExistingRepoManifest(manifestPath, repoInfo) {
  if (!await fileExists(manifestPath)) {
    return createEmptyRepoManifest(repoInfo)
  }

  try {
    const parsed = JSON.parse(await readFile(manifestPath, 'utf8'))
    if (!parsed || typeof parsed !== 'object' || parsed.contractVersion !== 'towerai-kb-repo-manifest-v1') {
      return createEmptyRepoManifest(repoInfo)
    }

    return {
      ...parsed,
      updatedAtIso: String(parsed.updatedAtIso || '').trim() || new Date().toISOString(),
      repo: {
        owner: repoInfo.owner,
        name: repoInfo.name,
        ref: repoInfo.ref,
      },
      providers: parsed.providers && typeof parsed.providers === 'object' ? parsed.providers : {},
    }
  } catch {
    return createEmptyRepoManifest(repoInfo)
  }
}

function resolveModelCacheRoot(cacheDir, embedModel) {
  const segments = String(embedModel || '').trim().split('/').filter(Boolean)
  return path.join(cacheDir, ...segments)
}

async function syncModelAssetToRepo(repoDir, repoInfo, payloads) {
  if (payloads.providerId !== 'gte-small') return null

  const sourceModelDir = resolveModelCacheRoot(payloads.cacheDir, payloads.embedModel)
  if (!await fileExists(sourceModelDir)) {
    throw new Error(`Expected cached model directory was not found: ${sourceModelDir}`)
  }

  const repoModelDir = path.join(repoDir, DEFAULT_TOWERAI_MODEL_RELATIVE_DIR, payloads.providerId)
  await mkdir(path.dirname(repoModelDir), { recursive: true })
  await cp(sourceModelDir, repoModelDir, { recursive: true, force: true })

  const files = await listRelativeFilesRecursive(repoModelDir)
  return {
    sourceModelId: payloads.embedModel,
    rootUrl: buildRawGitHubUrl(repoInfo, path.relative(repoDir, repoModelDir)),
    files,
    primaryFile: 'onnx/model.onnx',
    lfs: true,
  }
}

async function syncProviderArtifactsToRepo(repoDir, repoInfo, payloads) {
  const providerVersionDir = path.join(repoDir, DEFAULT_TOWERAI_KB_RELATIVE_DIR, payloads.providerId, payloads.version)
  await mkdir(providerVersionDir, { recursive: true })
  const filePaths = await writeArtifactFiles(providerVersionDir, payloads)
  const modelAsset = await syncModelAssetToRepo(repoDir, repoInfo, payloads)

  return {
    version: payloads.version,
    updatedAtIso: new Date().toISOString(),
    knowledgeBundleVersion: payloads.knowledgeBundleVersion,
    embeddingModel: payloads.embedModel,
    embeddingSource: payloads.embeddingSource,
    vectorSize: payloads.vectorSize,
    chunkCount: payloads.chunkCount,
    files: {
      versionUrl: buildRawGitHubUrl(repoInfo, path.relative(repoDir, filePaths.versionPath)),
      metadataUrl: buildRawGitHubUrl(repoInfo, path.relative(repoDir, filePaths.metadataPath)),
      chunksUrl: buildRawGitHubUrl(repoInfo, path.relative(repoDir, filePaths.chunksPath)),
      indexUrl: buildRawGitHubUrl(repoInfo, path.relative(repoDir, filePaths.indexPath)),
    },
    modelAsset: modelAsset || undefined,
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const runtimeRecord = await readCanonicalRuntimeRecord(options.canonicalKbPath)
  const repoRef = await resolveImmutableRepoRef(options.repoDir, options.repoRef)
  const repoInfo = {
    owner: options.repoOwner,
    name: options.repoName,
    ref: repoRef,
  }
  const summaries = []
  const providerManifestEntries = {}

  for (const embedModel of options.embedModels) {
    const embeddingPayload = await resolveEmbeddingsForRuntimeRecord(runtimeRecord, embedModel)
    const payloads = {
      ...buildArtifactPayloads(runtimeRecord, embeddingPayload),
      providerId: embeddingPayload.providerId,
      cacheDir: embeddingPayload.cacheDir,
      knowledgeBundleVersion: runtimeRecord.version,
    }
    await writeArtifactFiles(path.join(options.outputDir, payloads.providerId), payloads)

    if (!options.dryRun) {
      providerManifestEntries[payloads.providerId] = await syncProviderArtifactsToRepo(options.repoDir, repoInfo, payloads)
    }

    summaries.push({
      providerId: payloads.providerId,
      version: payloads.version,
      embedModel: payloads.embedModel,
      embeddingSource: payloads.embeddingSource,
      vectorSize: payloads.vectorSize,
      chunkCount: payloads.chunkCount,
    })
  }

  const manifestPath = path.join(options.repoDir, DEFAULT_TOWERAI_KB_MANIFEST_RELATIVE_PATH)
  if (!options.dryRun) {
    const nextManifest = await readExistingRepoManifest(manifestPath, repoInfo)
    nextManifest.updatedAtIso = new Date().toISOString()
    nextManifest.repo = repoInfo
    nextManifest.providers = {
      ...nextManifest.providers,
      ...providerManifestEntries,
    }
    await mkdir(path.dirname(manifestPath), { recursive: true })
    await writeFile(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`, 'utf8')
  }

  process.stdout.write(`${JSON.stringify({
    repoDir: options.repoDir,
    manifestPath,
    variants: summaries,
    dryRun: options.dryRun,
  }, null, 2)}\n`)
}

void main().catch(error => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
