#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const CANONICAL_PATH = path.resolve('artifacts', 'kb-source', 'trackerai-canonical-kb.json')

const kbModule = await import('../dist/kb/index.js')
const chunks = kbModule.buildTrackerAiCanonicalKbChunks()
const validated = kbModule.validateCanonicalKbArray(chunks, {
  sourceName: 'towerai canonical KB validation build',
})

await fs.mkdir(path.dirname(CANONICAL_PATH), { recursive: true })
await fs.writeFile(CANONICAL_PATH, `${JSON.stringify(validated, null, 2)}\n`, 'utf8')

const records = await kbModule.loadCanonicalKbFromFile(CANONICAL_PATH, {
  sourceName: 'towerai canonical KB',
})

console.log(`TowerAI canonical KB validation passed (${records.length} chunks).`)
