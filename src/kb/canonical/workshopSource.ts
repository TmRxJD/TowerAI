import fs from 'node:fs'
import { getCanonicalSourcePath } from './sourceText'

export type WorkshopEnhancementCategory = 'attack' | 'defense' | 'utility'

export interface WorkshopEnhancementSourceEntry {
  category: WorkshopEnhancementCategory
  categoryTitle: string
  name: string
  description: string
}

export interface WorkshopReferenceSection {
  title: string
  paragraphs: string[]
}

export interface WorkshopDeterministicStatEntry {
  stat: string
  sections: Record<string, string>
}

export interface WorkshopSourceDocument {
  overviewParagraphs: string[]
  externalModifierSections: WorkshopReferenceSection[]
  deterministicStatEntries: WorkshopDeterministicStatEntry[]
  enhancementOverviewParagraph: string
  unlockParagraph: string
  enhancementEntries: WorkshopEnhancementSourceEntry[]
}

const CATEGORY_BY_TITLE: Record<string, WorkshopEnhancementCategory> = {
  'Attack Enhancement': 'attack',
  'Defense Enhancement': 'defense',
  'Utility Enhancement': 'utility',
}

const EXTERNAL_MODIFIER_SECTION_TITLES = new Set([
  'Modules and Assist Modules',
  'Cannon Module Substats',
  'Armor Module Substats',
  'Generator Module Substats',
  'Core Module Substats',
  'Vault Power Tree',
  'Relics',
  'Perks',
])

const STRUCTURED_STAT_FIELDS = new Set([
  'Mechanic',
  'Type',
  'Category',
  'Aliases',
  'Disambiguation',
  'Definition',
  'Description',
  'Formula',
  'Workshop',
  'Enhancements',
  'Labs',
  'Cards',
  'Masteries',
  'Modules',
  'Relics',
  'Vault',
  'Perks',
  'Footguns',
])

function parseDeterministicStatEntries(lines: string[]): WorkshopDeterministicStatEntry[] {
  const enhancementIndex = lines.indexOf('Workshop Enhancement')

  if (enhancementIndex < 0) {
    return []
  }

  const entries: WorkshopDeterministicStatEntry[] = []
  let currentEntry: WorkshopDeterministicStatEntry | null = null
  let currentField: string | null = null

  const appendToField = (line: string) => {
    if (!currentEntry || !currentField) {
      return
    }

    const currentValue = currentEntry.sections[currentField] ?? ''
    currentEntry.sections[currentField] = currentValue ? `${currentValue}\n${line}` : line
  }

  const commitEntry = () => {
    if (!currentEntry?.stat) {
      return
    }

    if (!currentEntry.sections.Definition && currentEntry.sections.Description) {
      currentEntry.sections.Definition = currentEntry.sections.Description
    }

    entries.push(currentEntry)
  }

  for (let index = 0; index < enhancementIndex; index += 1) {
    const line = lines[index]
    const separatorIndex = line.indexOf(':')

    if (separatorIndex < 0) {
      appendToField(line)
      continue
    }

    const sectionName = line.slice(0, separatorIndex).trim()
    const sectionValue = line.slice(separatorIndex + 1).trim()

    if (!STRUCTURED_STAT_FIELDS.has(sectionName)) {
      appendToField(line)
      continue
    }

    if (sectionName === 'Mechanic') {
      if (currentEntry) {
        commitEntry()
      }

      currentEntry = {
        stat: sectionValue,
        sections: {
          Mechanic: sectionValue,
        },
      }
      currentField = 'Mechanic'
      continue
    }

    if (!currentEntry) {
      continue
    }

    currentEntry.sections[sectionName] = sectionValue
    currentField = sectionName
  }

  if (currentEntry) {
    commitEntry()
  }

  return entries
}

function readWorkshopSourceText(): string {
  const sourcePath = getCanonicalSourcePath('workshop')
  return fs.readFileSync(sourcePath, 'utf8')
}

function normalizeLines(sourceText: string): string[] {
  return sourceText
    .split(/\r?\n/)
    .map(line => line.trim().replace(/^#+\s*/, ''))
    .filter(Boolean)
}

export function loadWorkshopSourceDocument(): WorkshopSourceDocument {
  const lines = normalizeLines(readWorkshopSourceText())
  const firstMechanicIndex = lines.findIndex(line => line.startsWith('Mechanic: '))
  const enhancementIndex = lines.indexOf('Workshop Enhancement')
  const unlockIndex = lines.indexOf('Unlock')
  const unlocksIndex = lines.indexOf('Workshop Enhancement Unlocks')
  const externalModifiersIndex = lines.indexOf('External Modifiers Reference')

  if (firstMechanicIndex < 0 || enhancementIndex < 0 || unlockIndex < 0 || unlocksIndex < 0) {
    throw new Error('Workshop source document is missing required headings.')
  }

  const overviewParagraphs = lines.slice(1, firstMechanicIndex)
  const externalModifierSections: WorkshopReferenceSection[] = []
  const deterministicStatEntries = parseDeterministicStatEntries(lines)

  if (externalModifiersIndex > 0 && externalModifiersIndex < firstMechanicIndex) {
    let currentSection: WorkshopReferenceSection | null = null

    for (let index = externalModifiersIndex + 1; index < firstMechanicIndex; index += 1) {
      const line = lines[index]

      if (EXTERNAL_MODIFIER_SECTION_TITLES.has(line)) {
        if (currentSection) {
          externalModifierSections.push(currentSection)
        }
        currentSection = {
          title: line,
          paragraphs: [],
        }
        continue
      }

      if (currentSection) {
        currentSection.paragraphs.push(line)
      }
    }

    if (currentSection) {
      externalModifierSections.push(currentSection)
    }
  }

  const enhancementOverviewParagraph = lines[enhancementIndex + 1] ?? ''
  const unlockParagraph = lines[unlockIndex + 1] ?? ''
  const enhancementEntries: WorkshopEnhancementSourceEntry[] = []

  let currentCategoryTitle = ''
  for (let index = unlocksIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]
    if (line in CATEGORY_BY_TITLE) {
      currentCategoryTitle = line
      continue
    }

    if (!currentCategoryTitle || /^Level\s+Time\s+Cost\s+Value$/i.test(line) || /^\d+\s/.test(line)) {
      continue
    }

    const description = lines[index + 1] ?? ''
    if (!description || description in CATEGORY_BY_TITLE) {
      continue
    }

    enhancementEntries.push({
      category: CATEGORY_BY_TITLE[currentCategoryTitle],
      categoryTitle: currentCategoryTitle,
      name: line,
      description,
    })
    index += 1
  }

  return {
    overviewParagraphs,
    externalModifierSections,
    deterministicStatEntries,
    enhancementOverviewParagraph,
    unlockParagraph,
    enhancementEntries,
  }
}
