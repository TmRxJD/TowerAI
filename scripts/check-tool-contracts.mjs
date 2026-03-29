import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const readmePath = path.join(rootDir, 'README.md')
const playgroundPath = path.join(rootDir, 'playground', 'app.ts')

const { towerAiPlatformToolNames } = require(path.join(rootDir, 'dist', 'tools', 'contracts.js'))
const { towerAiExecutedToolNames } = require(path.join(rootDir, 'dist', 'tools', 'platformExecutor.js'))

const readmeText = fs.readFileSync(readmePath, 'utf8')
const playgroundText = fs.readFileSync(playgroundPath, 'utf8')

const missingExecutor = towerAiPlatformToolNames.filter(toolName => !towerAiExecutedToolNames.includes(toolName))
if (missingExecutor.length > 0) {
  throw new Error(`Executor is missing authoritative tool handlers: ${missingExecutor.join(', ')}`)
}

const missingReadme = towerAiPlatformToolNames.filter(toolName => !readmeText.includes(`\`${toolName}\``))
if (missingReadme.length > 0) {
  throw new Error(`README is missing authoritative tool docs: ${missingReadme.join(', ')}`)
}

for (const requiredToken of ['calc.run', 'chart.browse']) {
  if (!playgroundText.includes(requiredToken)) {
    throw new Error(`Playground parser must reference ${requiredToken}`)
  }
}

console.log(`Validated ${towerAiPlatformToolNames.length} authoritative tool contracts.`)