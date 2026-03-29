#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const OUTPUT_PATH = path.resolve('artifacts', 'kb-source', 'trackerai-canonical-kb.json')

async function main() {
  const kbModule = await import('../dist/kb/index.js')
  const chunks = kbModule.buildTrackerAiCanonicalKbChunks()
  const validated = kbModule.validateCanonicalKbArray(chunks, {
    sourceName: 'towerai canonical KB build',
  })

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(validated, null, 2)}\n`, 'utf8')
  process.stdout.write(`Built TowerAI canonical KB with ${validated.length} chunks at ${OUTPUT_PATH}\n`)
}

await main()
