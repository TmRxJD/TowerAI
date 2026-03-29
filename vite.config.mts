import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv, type Plugin } from 'vite'

const repoRoot = path.dirname(fileURLToPath(import.meta.url))
const artifactsRoot = path.resolve(repoRoot, 'artifacts')

function getArtifactContentType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase()
  switch (extension) {
    case '.json':
      return 'application/json; charset=utf-8'
    case '.txt':
      return 'text/plain; charset=utf-8'
    case '.js':
    case '.mjs':
      return 'text/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.html':
      return 'text/html; charset=utf-8'
    default:
      return 'application/octet-stream'
  }
}

function resolveArtifactPath(url: string | undefined): string | null {
  const pathname = String(url || '').split('?')[0] || ''
  if (!pathname.startsWith('/artifacts/')) {
    return null
  }

  const relativePath = pathname.slice('/artifacts/'.length)
  const filePath = path.resolve(artifactsRoot, relativePath)
  const relativeToRoot = path.relative(artifactsRoot, filePath)
  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    return null
  }

  return filePath
}

function serveArtifact(url: string | undefined, response: NodeJS.WritableStream & {
  statusCode: number
  setHeader(name: string, value: string): void
  end(chunk?: string | Buffer): void
}): boolean {
  const filePath = resolveArtifactPath(url)
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return false
  }

  response.statusCode = 200
  response.setHeader('Content-Type', getArtifactContentType(filePath))
  response.end(fs.readFileSync(filePath))
  return true
}

function serveArtifactsPlugin(): Plugin {
  return {
    name: 'towerai-serve-artifacts',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (serveArtifact(request.url, response)) {
          return
        }
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        if (serveArtifact(request.url, response)) {
          return
        }
        next()
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [serveArtifactsPlugin()],
    define: {
      'import.meta.env.VITE_TOWERAI_CLOUD_AI_ENDPOINT': JSON.stringify(String(env.TOWERAI_CLOUD_AI_ENDPOINT || env.VITE_TOWERAI_CLOUD_AI_ENDPOINT || '').trim()),
      'import.meta.env.VITE_TOWERAI_CLOUD_AI_API_KEY': JSON.stringify(String(env.TOWERAI_CLOUD_AI_API_KEY || env.VITE_TOWERAI_CLOUD_AI_API_KEY || '').trim()),
      'import.meta.env.VITE_TOWERAI_SEMANTIC_MODEL': JSON.stringify(String(env.TOWERAI_SEMANTIC_MODEL || env.VITE_TOWERAI_SEMANTIC_MODEL || '').trim()),
      'import.meta.env.VITE_TOWERAI_CLOUD_REASONING_MODEL': JSON.stringify(String(env.TOWERAI_CLOUD_REASONING_MODEL || env.VITE_TOWERAI_CLOUD_REASONING_MODEL || '').trim()),
      'import.meta.env.VITE_TOWERAI_CLOUD_DEEP_REASONING_MODEL': JSON.stringify(String(env.TOWERAI_CLOUD_DEEP_REASONING_MODEL || env.VITE_TOWERAI_CLOUD_DEEP_REASONING_MODEL || '').trim()),
      'import.meta.env.VITE_TOWERAI_CLOUD_FALLBACK_REASONING_MODEL': JSON.stringify(String(env.TOWERAI_CLOUD_FALLBACK_REASONING_MODEL || env.VITE_TOWERAI_CLOUD_FALLBACK_REASONING_MODEL || '').trim()),
      'import.meta.env.VITE_TOWERAI_CLOUD_VISION_MODEL': JSON.stringify(String(env.TOWERAI_CLOUD_VISION_MODEL || env.VITE_TOWERAI_CLOUD_VISION_MODEL || '').trim()),
      'import.meta.env.VITE_TOWERAI_CLOUD_RANKING_MODEL': JSON.stringify(String(env.TOWERAI_CLOUD_RANKING_MODEL || env.VITE_TOWERAI_CLOUD_RANKING_MODEL || '').trim()),
      'import.meta.env.VITE_TOWERAI_CLOUD_INTENT_MODEL': JSON.stringify(String(env.TOWERAI_CLOUD_INTENT_MODEL || env.VITE_TOWERAI_CLOUD_INTENT_MODEL || '').trim()),
      'import.meta.env.VITE_TOWERAI_CLOUD_ANSWER_SYNTHESIS_MODEL': JSON.stringify(String(env.TOWERAI_CLOUD_ANSWER_SYNTHESIS_MODEL || env.VITE_TOWERAI_CLOUD_ANSWER_SYNTHESIS_MODEL || '').trim()),
    },
    server: {
      port: 4173,
      open: true,
    },
    preview: {
      port: 4173,
    },
    build: {
      outDir: 'playground-dist',
      chunkSizeWarningLimit: 2200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalizedId = id.replaceAll('\\', '/')
            if (!normalizedId.includes('/node_modules/')) return undefined
            if (normalizedId.includes('/node_modules/openai/')) return 'openai'
            if (normalizedId.includes('/node_modules/@tmrxjd/platform/')) return 'tower-platform'
            if (normalizedId.includes('/node_modules/pako/')) return 'pako'
            return 'vendor'
          },
        },
      },
    },
  }
})