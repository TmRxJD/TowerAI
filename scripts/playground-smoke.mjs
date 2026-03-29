#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST_DIR = path.join(ROOT_DIR, 'dist')
const PLAYGROUND_DIST_DIR = path.join(ROOT_DIR, 'playground-dist')
const HOST = '127.0.0.1'
const PORT = 4174
const BASE_URL = `http://${HOST}:${PORT}`
const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
])

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function ensurePathExists(targetPath) {
  await access(targetPath)
}

function resolveSafePath(baseDir, relativePath) {
  const resolved = path.resolve(baseDir, relativePath)
  const normalizedBase = `${path.resolve(baseDir)}${path.sep}`
  if (resolved !== path.resolve(baseDir) && !resolved.startsWith(normalizedBase)) {
    return null
  }
  return resolved
}

function getServedFilePath(urlPath) {
  const pathname = String(urlPath || '/').split('?')[0]
  if (pathname === '/' || pathname === '/index.html') {
    return path.join(PLAYGROUND_DIST_DIR, 'index.html')
  }

  if (pathname.startsWith('/assets/')) {
    return resolveSafePath(PLAYGROUND_DIST_DIR, pathname.slice(1))
  }

  if (pathname.startsWith('/artifacts/')) {
    return resolveSafePath(ROOT_DIR, pathname.slice(1))
  }

  return null
}

function rewriteManifestForPreview(manifest) {
  const providers = Object.fromEntries(
    Object.entries(manifest.providers || {}).map(([provider, value]) => {
      const version = String(value?.version || '').trim()
      return [provider, {
        ...value,
        files: {
          versionUrl: `${BASE_URL}/artifacts/kb/${provider}/${version}/trackerai-kb.version.txt`,
          metadataUrl: `${BASE_URL}/artifacts/kb/${provider}/${version}/trackerai-kb.metadata.json`,
          chunksUrl: `${BASE_URL}/artifacts/kb/${provider}/${version}/trackerai-kb.chunks.json`,
          indexUrl: `${BASE_URL}/artifacts/kb/${provider}/${version}/trackerai-kb.index.json`,
        },
        modelAsset: value?.modelAsset
          ? {
              ...value.modelAsset,
              rootUrl: `${BASE_URL}/artifacts/models/${provider}`,
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

function extractAssetPaths(html) {
  const matches = html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)
  return Array.from(new Set(Array.from(matches, match => String(match[1] || ''))))
}

async function fetchJson(url) {
  const response = await fetch(url)
  assert(response.ok, `Request failed for ${url} (${response.status})`)
  return await response.json()
}

async function fetchText(url) {
  const response = await fetch(url)
  assert(response.ok, `Request failed for ${url} (${response.status})`)
  return await response.text()
}

async function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const filePath = getServedFilePath(request.url)
      if (!filePath) {
        response.writeHead(404)
        response.end('Not found')
        return
      }

      const payload = await readFile(filePath)
      const contentType = MIME_TYPES.get(path.extname(filePath)) || 'application/octet-stream'
      response.writeHead(200, { 'content-type': contentType })
      response.end(payload)
    } catch {
      response.writeHead(404)
      response.end('Not found')
    }
  })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(PORT, HOST, () => resolve())
  })

  return server
}

async function main() {
  await ensurePathExists(path.join(DIST_DIR, 'index.js'))
  await ensurePathExists(path.join(DIST_DIR, 'core', 'index.js'))
  await ensurePathExists(path.join(DIST_DIR, 'tools', 'index.js'))
  await ensurePathExists(path.join(PLAYGROUND_DIST_DIR, 'index.html'))

  const core = require(path.join(DIST_DIR, 'core'))
  const tools = require(path.join(DIST_DIR, 'tools'))
  const server = await startStaticServer()

  try {
    const html = await fetchText(BASE_URL)
    assert(html.includes('<div id="app"></div>'), 'Preview HTML is missing the expected app root')

    const assetPaths = extractAssetPaths(html)
    assert(assetPaths.length > 0, 'Preview HTML did not reference any built asset files')

    for (const assetPath of assetPaths) {
      const assetResponse = await fetch(`${BASE_URL}${assetPath}`)
      assert(assetResponse.ok, `Built asset request failed for ${assetPath} (${assetResponse.status})`)
    }

    const manifest = await fetchJson(`${BASE_URL}/artifacts/kb/manifest.json`)
    const provider = core.DEFAULT_TOWER_AI_KB_ARTIFACT_PROVIDER
    const rewrittenManifest = rewriteManifestForPreview(manifest)
    const providerEntry = rewrittenManifest?.providers?.[provider]
    assert(providerEntry, `Preview manifest is missing provider ${provider}`)

    const bundle = await core.loadTowerAiKbArtifactBundle({
      provider,
      skipLocalArtifacts: true,
      repoManifest: rewrittenManifest,
      repoConfig: { manifestUrl: `${BASE_URL}/artifacts/kb/manifest.json` },
      fetchImpl: (input, init) => fetch(String(input), init),
    })

    assert(bundle, 'Preview smoke failed to load the KB bundle over HTTP')
    const chunkCount = Array.isArray(bundle.chunks?.chunks) ? bundle.chunks.chunks.length : 0
    assert(chunkCount > 0, 'Preview smoke loaded a KB bundle with no chunks')

    const toolResult = tools.executeTowerAiPlatformTool({
      tool: 'chart.catalog.list',
      args: {},
    })
    assert(toolResult.success === true, `Preview smoke tool execution failed: ${toolResult.reason || 'unknown error'}`)

    const categoryCount = Array.isArray(toolResult.data?.categories) ? toolResult.data.categories.length : 0
    assert(categoryCount > 0, 'Preview smoke tool execution returned no chart categories')

    process.stdout.write(`${JSON.stringify({
      previewUrl: BASE_URL,
      assetCount: assetPaths.length,
      kbProvider: provider,
      kbVersion: bundle.version,
      kbChunkCount: chunkCount,
      tool: toolResult.tool,
      toolSummary: toolResult.summary,
      chartCategoryCount: categoryCount,
    }, null, 2)}\n`)
  } finally {
    await new Promise(resolve => server.close(() => resolve()))
  }
}

void main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})