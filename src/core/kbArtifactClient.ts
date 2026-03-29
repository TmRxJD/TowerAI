import { ungzip } from 'pako'

export const DEFAULT_TOWER_AI_KB_ARTIFACT_PROVIDER = 'gte-small' as const

export type TowerAiKbArtifactProviderId = typeof DEFAULT_TOWER_AI_KB_ARTIFACT_PROVIDER

export type TowerAiKbArtifactBundle = {
  contractVersion: 'trackerai-kb-artifact-cache-v1'
  version: string
  metadata: unknown
  chunks: unknown
  index: unknown
  syncedAtIso: string
}

export type TowerAiKbLocalArtifactConfig = {
  versionUrl: string
  metadataUrl: string
  chunksUrl: string
  indexUrl: string
}

export type TowerAiKbArtifactRemoteFileSet = {
  versionUrl: string
  metadataUrl: string
  chunksUrl: string
  indexUrl: string
}

export type TowerAiKbArtifactModelAssetManifest = {
  sourceModelId: string
  rootUrl: string
  files: string[]
  primaryFile: string
  lfs: boolean
}

export type TowerAiKbArtifactRepoProviderManifest = {
  version: string
  updatedAtIso: string
  knowledgeBundleVersion?: string
  embeddingModel?: string
  embeddingSource?: string
  vectorSize?: number
  chunkCount?: number
  files: TowerAiKbArtifactRemoteFileSet
  modelAsset?: TowerAiKbArtifactModelAssetManifest
}

export type TowerAiKbArtifactRepoManifest = {
  contractVersion: 'towerai-kb-repo-manifest-v1'
  updatedAtIso: string
  repo?: {
    owner: string
    name: string
    ref: string
  }
  providers: Record<string, TowerAiKbArtifactRepoProviderManifest>
}

export type TowerAiKbArtifactRepoConfig = {
  manifestUrl: string
}

export type TowerAiKbArtifactFetchResponse = {
  ok: boolean
  status: number
  arrayBuffer?: () => Promise<ArrayBuffer>
  text?: () => Promise<string>
}

export type TowerAiKbArtifactFetch = (
  input: string,
  init?: { credentials?: 'include' | 'same-origin' | 'omit' },
) => Promise<TowerAiKbArtifactFetchResponse>

export type TowerAiKbArtifactCacheReader = (cacheId: string) => Promise<unknown>
export type TowerAiKbArtifactCacheWriter = (cacheId: string, bundle: TowerAiKbArtifactBundle) => Promise<void>

export type TowerAiKbArtifactLogger = {
  warn?: (...args: unknown[]) => void
}

export type TowerAiLoadKbArtifactBundleOptions = {
  forceRefresh?: boolean
  provider?: TowerAiKbArtifactProviderId | string
  skipLocalArtifacts?: boolean
  repoConfig?: TowerAiKbArtifactRepoConfig | null
  repoManifest?: TowerAiKbArtifactRepoManifest | null
  readCache?: TowerAiKbArtifactCacheReader
  writeCache?: TowerAiKbArtifactCacheWriter
  publicBasePath?: string
  fetchImpl?: TowerAiKbArtifactFetch
  logger?: TowerAiKbArtifactLogger
  cacheIdPrefix?: string
}

export const DEFAULT_TOWER_AI_KB_ARTIFACT_CACHE_ID_PREFIX = 'tracker-ai-kb-artifact-cache-v1'
export const DEFAULT_TOWER_AI_KB_ARTIFACT_PUBLIC_BASE_PATH = '/knowledge/trackerai-kb'
export const DEFAULT_TOWER_AI_KB_ARTIFACT_REPO_OWNER = 'TmRxJD'
export const DEFAULT_TOWER_AI_KB_ARTIFACT_REPO_NAME = 'TowerAI'
export const DEFAULT_TOWER_AI_KB_ARTIFACT_REPO_REF = '5afa9b71d9b5c8bd43b71c43b21d8b1861119054'
export const DEFAULT_TOWER_AI_KB_ARTIFACT_REPO_MANIFEST_URL = `https://raw.githubusercontent.com/${DEFAULT_TOWER_AI_KB_ARTIFACT_REPO_OWNER}/${DEFAULT_TOWER_AI_KB_ARTIFACT_REPO_NAME}/${DEFAULT_TOWER_AI_KB_ARTIFACT_REPO_REF}/artifacts/kb/manifest.json`
export const DEFAULT_TOWER_AI_KB_ARTIFACT_REPO_CONFIG: TowerAiKbArtifactRepoConfig = {
  manifestUrl: DEFAULT_TOWER_AI_KB_ARTIFACT_REPO_MANIFEST_URL,
}

function getLogger(logger?: TowerAiKbArtifactLogger): TowerAiKbArtifactLogger {
  return logger || console
}

function getFetchImpl(fetchImpl?: TowerAiKbArtifactFetch): TowerAiKbArtifactFetch {
  const resolved = fetchImpl || globalThis.fetch
  if (typeof resolved !== 'function') {
    throw new Error('TowerAI KB artifact loader requires a fetch implementation for public artifact reads')
  }
  return resolved as TowerAiKbArtifactFetch
}

function resolveTowerAiKbArtifactProvider(providerLike?: string): TowerAiKbArtifactProviderId {
  const normalizedProvider = String(providerLike || '').trim()
  if (!normalizedProvider) {
    return DEFAULT_TOWER_AI_KB_ARTIFACT_PROVIDER
  }

  if (normalizedProvider !== DEFAULT_TOWER_AI_KB_ARTIFACT_PROVIDER) {
    throw new Error(`TowerAI only supports ${DEFAULT_TOWER_AI_KB_ARTIFACT_PROVIDER} semantic artifacts. Received: ${normalizedProvider}`)
  }

  return DEFAULT_TOWER_AI_KB_ARTIFACT_PROVIDER
}

export function getTowerAiKbArtifactCacheId(
  provider: TowerAiKbArtifactProviderId | string,
  cacheIdPrefix = DEFAULT_TOWER_AI_KB_ARTIFACT_CACHE_ID_PREFIX,
): string {
  return `${cacheIdPrefix}:${resolveTowerAiKbArtifactProvider(provider)}`
}

export function buildTowerAiKbLocalArtifactConfig(
  provider: TowerAiKbArtifactProviderId | string,
  basePath = DEFAULT_TOWER_AI_KB_ARTIFACT_PUBLIC_BASE_PATH,
): TowerAiKbLocalArtifactConfig {
  const normalizedBasePath = String(basePath || DEFAULT_TOWER_AI_KB_ARTIFACT_PUBLIC_BASE_PATH).replace(/[\\/]+$/, '')
  const normalizedProvider = resolveTowerAiKbArtifactProvider(provider)
  const providerBasePath = `${normalizedBasePath}/${normalizedProvider}`
  return {
    versionUrl: `${providerBasePath}/trackerai-kb.version.txt`,
    metadataUrl: `${providerBasePath}/trackerai-kb.metadata.json`,
    chunksUrl: `${providerBasePath}/trackerai-kb.chunks.json`,
    indexUrl: `${providerBasePath}/trackerai-kb.index.json`,
  }
}

export function unwrapTowerAiCachedKbArtifactBundle(record: unknown): TowerAiKbArtifactBundle | null {
  if (!record || typeof record !== 'object') return null

  const container = record as Record<string, unknown>
  const data = container['data'] && typeof container['data'] === 'object'
    ? container['data'] as Record<string, unknown>
    : container

  if (data['contractVersion'] !== 'trackerai-kb-artifact-cache-v1') return null

  const version = String(data['version'] || '').trim()
  const syncedAtIso = String(data['syncedAtIso'] || '').trim()
  if (!version || !syncedAtIso) return null

  return {
    contractVersion: 'trackerai-kb-artifact-cache-v1',
    version,
    metadata: data['metadata'],
    chunks: data['chunks'],
    index: data['index'],
    syncedAtIso,
  }
}

// Some hosts serve the artifact JSON files with gzip content regardless of the
// file extension, so bundle loading must inspect bytes instead of assuming text.
function decodeTowerAiDownloadPayload(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const isGzip = bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b
  const decodedValue = isGzip ? ungzip(bytes) : bytes
  const decodedBytes: Uint8Array = typeof decodedValue === 'string'
    ? new TextEncoder().encode(decodedValue)
    : decodedValue instanceof Uint8Array
      ? decodedValue
      : new Uint8Array(0)
  return new TextDecoder('utf-8').decode(decodedBytes)
}

async function readPublicFileText(url: string, fetchImpl: TowerAiKbArtifactFetch): Promise<string | null> {
  const response = await fetchImpl(url, { credentials: 'same-origin' })
  if (response.status === 404) return null
  if (!response.ok || typeof response.arrayBuffer !== 'function') {
    throw new Error(`TowerAI KB public artifact request failed (${response.status})`)
  }
  return decodeTowerAiDownloadPayload(await response.arrayBuffer())
}

async function readPublicFileJson(url: string, fetchImpl: TowerAiKbArtifactFetch): Promise<unknown | null> {
  const text = await readPublicFileText(url, fetchImpl)
  return text ? JSON.parse(text) : null
}

function isStringRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function normalizeRemoteFileSet(value: unknown): TowerAiKbArtifactRemoteFileSet | null {
  if (!isStringRecord(value)) return null

  const versionUrl = String(value['versionUrl'] || '').trim()
  const metadataUrl = String(value['metadataUrl'] || '').trim()
  const chunksUrl = String(value['chunksUrl'] || '').trim()
  const indexUrl = String(value['indexUrl'] || '').trim()
  if (!versionUrl || !metadataUrl || !chunksUrl || !indexUrl) {
    return null
  }

  return {
    versionUrl,
    metadataUrl,
    chunksUrl,
    indexUrl,
  }
}

function normalizeRepoProviderManifest(value: unknown): TowerAiKbArtifactRepoProviderManifest | null {
  if (!isStringRecord(value)) return null

  const version = String(value['version'] || '').trim()
  const updatedAtIso = String(value['updatedAtIso'] || '').trim()
  const files = normalizeRemoteFileSet(value['files'])
  if (!version || !updatedAtIso || !files) {
    return null
  }

  const modelAsset = isStringRecord(value['modelAsset'])
    ? {
        sourceModelId: String(value['modelAsset']['sourceModelId'] || '').trim(),
        rootUrl: String(value['modelAsset']['rootUrl'] || '').trim(),
        files: Array.isArray(value['modelAsset']['files'])
          ? value['modelAsset']['files'].map(item => String(item || '').trim()).filter(Boolean)
          : [],
        primaryFile: String(value['modelAsset']['primaryFile'] || '').trim(),
        lfs: value['modelAsset']['lfs'] === true,
      }
    : null

  return {
    version,
    updatedAtIso,
    knowledgeBundleVersion: String(value['knowledgeBundleVersion'] || '').trim() || undefined,
    embeddingModel: String(value['embeddingModel'] || '').trim() || undefined,
    embeddingSource: String(value['embeddingSource'] || '').trim() || undefined,
    vectorSize: Number.isFinite(Number(value['vectorSize'])) ? Number(value['vectorSize']) : undefined,
    chunkCount: Number.isFinite(Number(value['chunkCount'])) ? Number(value['chunkCount']) : undefined,
    files,
    modelAsset: modelAsset && modelAsset.sourceModelId && modelAsset.rootUrl && modelAsset.primaryFile
      ? modelAsset
      : undefined,
  }
}

async function readRepoManifest(
  fetchImpl: TowerAiKbArtifactFetch,
  manifestUrl: string,
): Promise<TowerAiKbArtifactRepoManifest | null> {
  const parsed = await readPublicFileJson(manifestUrl, fetchImpl)
  if (!isStringRecord(parsed)) return null

  const contractVersion = String(parsed['contractVersion'] || '').trim()
  const updatedAtIso = String(parsed['updatedAtIso'] || '').trim()
  const providersRecord = isStringRecord(parsed['providers']) ? parsed['providers'] : null
  if (contractVersion !== 'towerai-kb-repo-manifest-v1' || !updatedAtIso || !providersRecord) {
    return null
  }

  const providers = Object.fromEntries(
    Object.entries(providersRecord)
      .map(([provider, value]) => [provider, normalizeRepoProviderManifest(value)] as const)
      .filter((entry): entry is [string, TowerAiKbArtifactRepoProviderManifest] => Boolean(entry[1])),
  )

  return {
    contractVersion: 'towerai-kb-repo-manifest-v1',
    updatedAtIso,
    repo: isStringRecord(parsed['repo'])
      ? {
          owner: String(parsed['repo']['owner'] || '').trim(),
          name: String(parsed['repo']['name'] || '').trim(),
          ref: String(parsed['repo']['ref'] || '').trim(),
        }
      : undefined,
    providers,
  }
}

async function readCachedBundle(
  provider: TowerAiKbArtifactProviderId,
  readCache: TowerAiKbArtifactCacheReader | undefined,
  cacheIdPrefix: string,
): Promise<TowerAiKbArtifactBundle | null> {
  if (!readCache) return null

  try {
    return unwrapTowerAiCachedKbArtifactBundle(await readCache(getTowerAiKbArtifactCacheId(provider, cacheIdPrefix)))
  } catch {
    return null
  }
}

async function writeCachedBundle(
  provider: TowerAiKbArtifactProviderId,
  bundle: TowerAiKbArtifactBundle,
  writeCache: TowerAiKbArtifactCacheWriter | undefined,
  cacheIdPrefix: string,
): Promise<void> {
  if (!writeCache) return
  await writeCache(getTowerAiKbArtifactCacheId(provider, cacheIdPrefix), bundle)
}

async function tryLoadLocalBundle(
  provider: TowerAiKbArtifactProviderId,
  forceRefresh: boolean,
  cachedBundle: TowerAiKbArtifactBundle | null,
  fetchImpl: TowerAiKbArtifactFetch,
  publicBasePath: string,
  writeCache: TowerAiKbArtifactCacheWriter | undefined,
  cacheIdPrefix: string,
): Promise<TowerAiKbArtifactBundle | null> {
  const config = buildTowerAiKbLocalArtifactConfig(provider, publicBasePath)
  const version = (await readPublicFileText(config.versionUrl, fetchImpl))?.trim()
  if (!version) return null

  if (!forceRefresh && cachedBundle?.version === version) {
    return cachedBundle
  }

  const [metadata, chunks, index] = await Promise.all([
    readPublicFileJson(config.metadataUrl, fetchImpl),
    readPublicFileJson(config.chunksUrl, fetchImpl),
    readPublicFileJson(config.indexUrl, fetchImpl),
  ])
  if (!metadata || !chunks || !index) {
    throw new Error(`TowerAI local KB artifact bundle for ${provider} is incomplete.`)
  }

  const bundle: TowerAiKbArtifactBundle = {
    contractVersion: 'trackerai-kb-artifact-cache-v1',
    version,
    metadata,
    chunks,
    index,
    syncedAtIso: new Date().toISOString(),
  }
  await writeCachedBundle(provider, bundle, writeCache, cacheIdPrefix)
  return bundle
}

async function tryLoadRepoBundle(
  provider: TowerAiKbArtifactProviderId,
  forceRefresh: boolean,
  cachedBundle: TowerAiKbArtifactBundle | null,
  fetchImpl: TowerAiKbArtifactFetch,
  repoManifestUrl: string,
  repoManifestOverride: TowerAiKbArtifactRepoManifest | null | undefined,
  writeCache: TowerAiKbArtifactCacheWriter | undefined,
  cacheIdPrefix: string,
): Promise<TowerAiKbArtifactBundle | null> {
  const manifest = repoManifestOverride || await readRepoManifest(fetchImpl, repoManifestUrl)
  const providerEntry = manifest?.providers?.[provider]
  if (!providerEntry) return null

  if (!forceRefresh && cachedBundle?.version === providerEntry.version) {
    return cachedBundle
  }

  const version = (await readPublicFileText(providerEntry.files.versionUrl, fetchImpl))?.trim() || providerEntry.version
  if (!version) {
    throw new Error(`TowerAI repo KB artifact version for ${provider} is missing.`)
  }

  const [metadata, chunks, index] = await Promise.all([
    readPublicFileJson(providerEntry.files.metadataUrl, fetchImpl),
    readPublicFileJson(providerEntry.files.chunksUrl, fetchImpl),
    readPublicFileJson(providerEntry.files.indexUrl, fetchImpl),
  ])
  if (!metadata || !chunks || !index) {
    throw new Error(`TowerAI repo KB artifact bundle for ${provider} is incomplete.`)
  }

  const bundle: TowerAiKbArtifactBundle = {
    contractVersion: 'trackerai-kb-artifact-cache-v1',
    version,
    metadata,
    chunks,
    index,
    syncedAtIso: new Date().toISOString(),
  }
  await writeCachedBundle(provider, bundle, writeCache, cacheIdPrefix)
  return bundle
}

export async function loadTowerAiKbArtifactBundle(options: TowerAiLoadKbArtifactBundleOptions = {}): Promise<TowerAiKbArtifactBundle | null> {
  const provider = resolveTowerAiKbArtifactProvider(options.provider)
  const cacheIdPrefix = String(options.cacheIdPrefix || DEFAULT_TOWER_AI_KB_ARTIFACT_CACHE_ID_PREFIX).trim() || DEFAULT_TOWER_AI_KB_ARTIFACT_CACHE_ID_PREFIX
  const fetchImpl = getFetchImpl(options.fetchImpl)
  const logger = getLogger(options.logger)
  const cachedBundle = await readCachedBundle(provider, options.readCache, cacheIdPrefix)

  if (options.skipLocalArtifacts !== true) {
    try {
      const localBundle = await tryLoadLocalBundle(
        provider,
        options.forceRefresh === true,
        cachedBundle,
        fetchImpl,
        options.publicBasePath || DEFAULT_TOWER_AI_KB_ARTIFACT_PUBLIC_BASE_PATH,
        options.writeCache,
        cacheIdPrefix,
      )
      if (localBundle) {
        return localBundle
      }
    } catch (error) {
      logger.warn?.(`[towerai] Failed to sync local KB artifact bundle for ${provider}. Falling back to repo bundle handling.`, error)
    }
  }

  const repoManifestUrl = String(
    options.repoConfig?.manifestUrl
      || DEFAULT_TOWER_AI_KB_ARTIFACT_REPO_CONFIG.manifestUrl,
  ).trim()
  if (!repoManifestUrl) return cachedBundle

  try {
    const repoBundle = await tryLoadRepoBundle(
      provider,
      options.forceRefresh === true,
      cachedBundle,
      fetchImpl,
      repoManifestUrl,
      options.repoManifest,
      options.writeCache,
      cacheIdPrefix,
    )
    if (repoBundle) {
      return repoBundle
    }
  } catch (error) {
    if (cachedBundle) {
      logger.warn?.('[towerai] Falling back to cached KB artifact after repo sync failure.', error)
      return cachedBundle
    }
    logger.warn?.('[towerai] KB artifact repo sync failed and no local cache is available.', error)
    return null
  }

  return cachedBundle
}
