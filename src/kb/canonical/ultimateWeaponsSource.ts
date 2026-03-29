import fs from 'node:fs'
import { getCanonicalSourcePath } from './sourceText'

export interface UltimateWeaponDeterministicEntry {
  mechanic: string
  sections: Record<string, string>
}

export interface UltimateWeaponSourceDocument {
  overviewParagraphs: string[]
  deterministicEntries: UltimateWeaponDeterministicEntry[]
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
  'Basic Upgrades',
  'Costs',
  'Ultimate Weapon Plus',
  'Formula',
  'Workshop',
  'Enhancements',
  'Behavior',
  'Interactions',
  'Relative Income Tables',
  '100% GT Uptime',
  'Labs',
  'Cards',
  'Masteries',
  'Modules',
  'Relics',
  'Vault',
  'Perks',
  'Footguns',
])

function readUltimateWeaponsStructuredSourceText(): string {
  const sourcePath = getCanonicalSourcePath('ultimate_weapons_structured')
  return fs.readFileSync(sourcePath, 'utf8')
}

function normalizeLines(sourceText: string): string[] {
  return sourceText
    .split(/\r?\n/)
    .map(line => line.trim().replace(/^#+\s*/, ''))
    .filter(Boolean)
}

function parseDeterministicEntries(lines: string[]): UltimateWeaponDeterministicEntry[] {
  const entries: UltimateWeaponDeterministicEntry[] = []
  let currentEntry: UltimateWeaponDeterministicEntry | null = null
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

export function loadUltimateWeaponsSourceDocument(): UltimateWeaponSourceDocument {
  const lines = normalizeLines(readUltimateWeaponsStructuredSourceText())
  const firstMechanicIndex = lines.findIndex(line => line.startsWith('Mechanic: '))

  if (firstMechanicIndex < 0) {
    throw new Error('Ultimate Weapons structured source document is missing mechanic entries.')
  }

  return {
    overviewParagraphs: lines.slice(1, firstMechanicIndex),
    deterministicEntries: parseDeterministicEntries(lines.slice(firstMechanicIndex)),
  }
}
