import fs from 'node:fs'
import { getCanonicalSourcePath } from './sourceText'

export interface BotDeterministicEntry {
  mechanic: string
  sections: Record<string, string>
}

export interface BotsSourceDocument {
  overviewParagraphs: string[]
  deterministicEntries: BotDeterministicEntry[]
}

const STRUCTURED_ENTRY_FIELDS = new Set([
  'Mechanic',
  'Type',
  'Domain',
  'Section',
  'Category',
  'Aliases',
  'Disambiguation',
  'Definition',
  'Description',
  'Behavior',
  'Unlock Costs',
  'Shared Upgrade Costs',
  'Bot Respec',
  'Unlocking/Upgrading',
  'Upgrade Stats',
  'Costs',
  'Labs',
  'Interactions',
  'Footguns',
])

function readBotsStructuredSourceText(): string {
  const sourcePath = getCanonicalSourcePath('bots_structured')
  return fs.readFileSync(sourcePath, 'utf8')
}

function normalizeLines(sourceText: string): string[] {
  return sourceText
    .split(/\r?\n/)
    .map(line => line.trim().replace(/^#+\s*/, ''))
    .filter(Boolean)
}

function parseDeterministicEntries(lines: string[]): BotDeterministicEntry[] {
  const entries: BotDeterministicEntry[] = []
  let currentEntry: BotDeterministicEntry | null = null
  let currentField: string | null = null

  const appendToField = (line: string) => {
    if (!currentEntry || !currentField) {
      return
    }

    const currentValue = currentEntry.sections[currentField] ?? ''
    currentEntry.sections[currentField] = currentValue ? `${currentValue}\n${line}` : line
  }

  const commitEntry = () => {
    if (!currentEntry?.mechanic) {
      return
    }

    if (!currentEntry.sections.Definition && currentEntry.sections.Description) {
      currentEntry.sections.Definition = currentEntry.sections.Description
    }

    entries.push(currentEntry)
  }

  for (const line of lines) {
    const separatorIndex = line.indexOf(':')

    if (separatorIndex < 0) {
      appendToField(line)
      continue
    }

    const fieldName = line.slice(0, separatorIndex).trim()
    const fieldValue = line.slice(separatorIndex + 1).trim()

    if (!STRUCTURED_ENTRY_FIELDS.has(fieldName)) {
      appendToField(line)
      continue
    }

    if (fieldName === 'Mechanic') {
      if (currentEntry) {
        commitEntry()
      }

      currentEntry = {
        mechanic: fieldValue,
        sections: {
          Mechanic: fieldValue,
        },
      }
      currentField = 'Mechanic'
      continue
    }

    if (!currentEntry) {
      continue
    }

    currentEntry.sections[fieldName] = fieldValue
    currentField = fieldName
  }

  if (currentEntry) {
    commitEntry()
  }

  return entries
}

export function loadBotsSourceDocument(): BotsSourceDocument {
  const lines = normalizeLines(readBotsStructuredSourceText())
  const firstMechanicIndex = lines.findIndex(line => line.startsWith('Mechanic: '))

  if (firstMechanicIndex < 0) {
    throw new Error('Bots structured source document is missing mechanic entries.')
  }

  return {
    overviewParagraphs: lines.slice(1, firstMechanicIndex),
    deterministicEntries: parseDeterministicEntries(lines.slice(firstMechanicIndex)),
  }
}
