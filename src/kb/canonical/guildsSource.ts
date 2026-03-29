import fs from 'node:fs'
import { getCanonicalSourcePath } from './sourceText'

export interface GuildSourceEntry {
  mechanic: string
  sections: Record<string, string>
}

export interface GuildsSourceDocument {
  overviewParagraphs: string[]
  deterministicEntries: GuildSourceEntry[]
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
  'Costs',
  'Unlock Requirement',
  'Interactions',
  'Footguns',
])

function readGuildsStructuredSourceText(): string {
  const sourcePath = getCanonicalSourcePath('guilds_structured')
  return fs.readFileSync(sourcePath, 'utf8')
}

function normalizeLines(sourceText: string): string[] {
  return sourceText
    .split(/\r?\n/)
    .map(line => line.trim().replace(/^#+\s*/, ''))
    .filter(Boolean)
}

function parseDeterministicEntries(lines: string[]): GuildSourceEntry[] {
  const entries: GuildSourceEntry[] = []
  let currentEntry: GuildSourceEntry | null = null
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

export function loadGuildsSourceDocument(): GuildsSourceDocument {
  const lines = normalizeLines(readGuildsStructuredSourceText())
  const firstMechanicIndex = lines.findIndex(line => line.startsWith('Mechanic: '))

  if (firstMechanicIndex < 0) {
    throw new Error('Guilds structured source document is missing mechanic entries.')
  }

  return {
    overviewParagraphs: lines.slice(1, firstMechanicIndex),
    deterministicEntries: parseDeterministicEntries(lines.slice(firstMechanicIndex)),
  }
}
