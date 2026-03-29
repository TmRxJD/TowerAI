import { type Lab, type LabLevel, labs as LABS } from '@tmrxjd/platform/tools'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { type LabSourceEntry, loadLabsSourceDocument } from './labsSource'

type SystemSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
  preferredKeys: string[]
}

const SYSTEM_SPECS: SystemSpec[] = [
  { mechanic: 'Labs', chunkId: 'labs_overview_01', title: 'Labs Overview', tags: ['labs', 'research', 'progression'], preferredKeys: ['Behavior'] },
  { mechanic: 'Lab Switching', chunkId: 'labs_switching_01', title: 'Lab Switching', tags: ['labs', 'switching', 'research progress'], preferredKeys: ['Behavior'] },
  { mechanic: 'Auto Research', chunkId: 'labs_auto_research_01', title: 'Auto Research', tags: ['labs', 'automation', 'queue'], preferredKeys: ['Behavior'] },
  { mechanic: 'Lab Search', chunkId: 'labs_search_01', title: 'Lab Search', tags: ['labs', 'search', 'quality of life'], preferredKeys: ['Behavior'] },
  { mechanic: 'Lab History', chunkId: 'labs_history_01', title: 'Lab History', tags: ['labs', 'history', 'quality of life'], preferredKeys: ['Behavior'] },
  { mechanic: 'Lab Slots', chunkId: 'labs_slots_01', title: 'Lab Slots', tags: ['labs', 'slots', 'gems'], preferredKeys: ['Behavior'] },
  { mechanic: 'Lab Slot Costs', chunkId: 'labs_slot_costs_01', title: 'Lab Slot Costs', tags: ['labs', 'slot costs', 'gems'], preferredKeys: ['Costs'] },
  { mechanic: 'Lab Rushing', chunkId: 'labs_rushing_01', title: 'Lab Rushing', tags: ['labs', 'rushing', 'gems'], preferredKeys: ['Behavior'] },
  { mechanic: 'Lab Boosting', chunkId: 'labs_boosting_01', title: 'Lab Boosting', tags: ['labs', 'boosting', 'elite cells'], preferredKeys: ['Behavior'] },
  { mechanic: 'Lab Boost Costs', chunkId: 'labs_boost_costs_01', title: 'Lab Boost Costs', tags: ['labs', 'boost costs', 'elite cells'], preferredKeys: ['Costs'] },
]

function createChunkId(prefix: string, value: string): string {
  return `${prefix}_${value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}_01`
}

function buildMetadataParagraph(entry: LabSourceEntry): string | null {
  const parts = [
    entry.sections.Type ? `Type: ${entry.sections.Type}` : '',
    entry.sections.Domain ? `Domain: ${entry.sections.Domain}` : '',
    entry.sections.Section ? `Section: ${entry.sections.Section}` : '',
    entry.sections.Category ? `Category: ${entry.sections.Category}` : '',
    entry.sections.Aliases && !/^none\.?$/i.test(entry.sections.Aliases) ? `Aliases: ${entry.sections.Aliases}` : '',
  ].filter(Boolean)

  return parts.length > 0 ? `${parts.join('. ')}.` : null
}

function ensureAtomicDisambiguation(value: string): string {
  if (/mechanic itself,? not its interactions/i.test(value)) {
    return value
  }

  return `${value} This chunk describes the mechanic itself, not its interactions.`
}

function readAtomicDisambiguation(entry: LabSourceEntry | undefined, fallback: string): string {
  const value = entry?.sections.Disambiguation
  return ensureAtomicDisambiguation(value ? value.replace(/\n+/g, ' ') : fallback)
}

function buildSystemParagraphs(entry: LabSourceEntry, preferredKeys: string[]): string[] {
  const paragraphs: string[] = []
  if (entry.sections.Definition) {
    paragraphs.push(`Definition: ${entry.sections.Definition}`)
  }

  const metadataParagraph = buildMetadataParagraph(entry)
  if (metadataParagraph) {
    paragraphs.push(metadataParagraph)
  }

  for (const key of preferredKeys) {
    const value = entry.sections[key]
    if (value && !/^none\.?$/i.test(value.trim())) {
      paragraphs.push(`${key}: ${value}`)
    }
  }

  return paragraphs
}

function formatLabNumericValue(value: number, kind: Lab['unit'] | LabLevel['valueType'] | undefined): string {
  if (!Number.isFinite(value)) {
    return 'unknown'
  }

  if (kind === 'multi') {
    return `x${value}`
  }

  if (kind === 'percent') {
    return `${value > 0 ? '+' : ''}${value}%`
  }

  if (kind === 'duration') {
    return `${value}s`
  }

  return `${value}`
}

function resolveLevelValue(level: LabLevel): number | null {
  const record = level.value[0]
  if (!record || typeof record !== 'object') {
    return null
  }

  const exact = Number((record as Record<number, number>)[level.level])
  return Number.isFinite(exact) ? exact : null
}

function getResearchableLevels(lab: Lab): LabLevel[] {
  return lab.levels.filter(level => level.level > 0)
}

function buildLabAtomicParagraphs(lab: Lab): string[] {
  const researchableLevels = getResearchableLevels(lab)
  const firstLevel = researchableLevels[0]
  const lastLevel = researchableLevels[researchableLevels.length - 1]
  const baselineLevel = lab.levels.find(level => level.level === 0) ?? null
  const firstValue = firstLevel ? resolveLevelValue(firstLevel) : null
  const lastValue = lastLevel ? resolveLevelValue(lastLevel) : null
  const baselineValue = baselineLevel ? resolveLevelValue(baselineLevel) : null
  const levelType = firstLevel?.valueType ?? lab.unit
  const currencyLabel = lab.currency === 'q' ? 'q' : lab.currency

  return [
    `Definition: ${lab.name} is a ${lab.category} lab. ${lab.description}`,
    `Lab metadata: Category ${lab.category}. Currency key ${currencyLabel}. ${baselineLevel ? 'This lab includes a level 0 baseline before research starts.' : `This lab has ${researchableLevels.length} researchable levels.`}`,
    baselineLevel && baselineValue !== null
      ? `Baseline and progression: ${lab.name} starts at level 0 with value ${formatLabNumericValue(baselineValue, levelType)} and can be researched through level ${lastLevel?.level ?? baselineLevel.level}.`
      : `Progression: ${lab.name} can be researched from level ${firstLevel?.level ?? 1} through level ${lastLevel?.level ?? firstLevel?.level ?? 1}.`,
    firstLevel && lastLevel && firstValue !== null && lastValue !== null
      ? `Research scale: first researchable level is L${firstLevel.level} with value ${formatLabNumericValue(firstValue, levelType)}, cost ${firstLevel.cost}, and time ${firstLevel.time}; max shown level is L${lastLevel.level} with value ${formatLabNumericValue(lastValue, levelType)}, cost ${lastLevel.cost}, and time ${lastLevel.time}.`
      : `Research scale: ${lab.name} uses ${levelType ?? 'flat'} scaling across its research levels.`,
  ]
}

function buildMasteryRelationChunk(lab: Lab): KBChunkRecord | null {
  if (!lab.name.endsWith(' Mastery')) {
    return null
  }

  const cardMechanic = lab.name.slice(0, -' Mastery'.length)
  const namingEntry = getRequiredNamingRegistryEntryBySource('labs', lab.name)

  return buildRelationalKbChunk({
    chunk_id: createChunkId('labs_relation_mastery', lab.name),
    source: 'Labs Structured Reference',
    section: 'Labs',
    topic: `${lab.name} with ${cardMechanic}`,
    title: `${lab.name} with ${cardMechanic}`,
    disambiguation: `This chunk is about the interaction between ${lab.name}, ${cardMechanic}, and Card Mastery Unlock, not the individual mechanics. It is not about unrelated lab boosts, slot unlocks, or other lab families.`,
    data_source: [namingEntry.data_source, 'cards'],
    is_base_mechanic: false,
    mechanics: [lab.name, cardMechanic, 'Card Mastery Unlock'],
    interaction_type: 'conditional',
    interaction_summary: `${lab.name} only matters after Card Mastery Unlock and while ${cardMechanic} is equipped.`,
    tags: ['labs', 'card mastery', cardMechanic.toLowerCase(), lab.name.toLowerCase()],
    paragraphs: [
      `${lab.name} is the lab-side progression path for the card mechanic ${cardMechanic}.`,
      `Card Mastery Unlock is required before ${lab.name} can matter in practice, because ${lab.name} extends the mastery tied to ${cardMechanic}.`,
      `${cardMechanic} must still be equipped for the effects unlocked through ${lab.name} to apply during a run.`,
    ],
  })
}

export function buildLabsCanonicalKbChunks(): KBChunkRecord[] {
  const sourceDocument = loadLabsSourceDocument()
  const labsEntry = getRequiredNamingRegistryEntryBySource('labs', 'labs')
  const entryByMechanic = new Map(sourceDocument.deterministicEntries.map(entry => [entry.mechanic, entry]))

  const systemChunks = SYSTEM_SPECS.map(spec => {
    const entry = entryByMechanic.get(spec.mechanic)
    if (!entry) {
      throw new Error(`Labs structured source is missing the ${spec.mechanic} mechanic entry.`)
    }

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'Labs Structured Reference',
      section: 'Labs',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: readAtomicDisambiguation(entry, `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about unrelated tracker state, other game systems, or implementation details.`),
      data_source: labsEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Labs',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: spec.mechanic === 'Labs'
        ? [...sourceDocument.overviewParagraphs, ...buildSystemParagraphs(entry, spec.preferredKeys)]
        : buildSystemParagraphs(entry, spec.preferredKeys),
    })
  })

  const labAtomicChunks = LABS.map(lab => {
    const namingEntry = getRequiredNamingRegistryEntryBySource('labs', lab.name)

    return buildAtomicKbChunk({
      chunk_id: createChunkId('labs', lab.name),
      source: 'Tracker Website Lab Data',
      section: 'Labs',
      topic: lab.name,
      title: lab.name,
      disambiguation: `This chunk is about ${lab.name} as a lab mechanic itself, not its interactions. It is not about unrelated labs, generic rush rules, or tracker implementation details.`,
      data_source: namingEntry.data_source,
      is_base_mechanic: namingEntry.is_base_mechanic,
      mechanics: [lab.name],
      tags: ['labs', lab.category.toLowerCase(), lab.name.toLowerCase()],
      paragraphs: buildLabAtomicParagraphs(lab),
    })
  })

  const masteryRelations = LABS
    .map(buildMasteryRelationChunk)
    .filter((chunk): chunk is KBChunkRecord => chunk !== null)

  return [
    ...systemChunks,
    buildRelationalKbChunk({
      chunk_id: 'labs_slots_milestones_01',
      source: 'Labs Structured Reference',
      section: 'Labs',
      topic: 'Lab Slots and Milestones',
      title: 'Lab Slots and Milestones',
      disambiguation: 'This chunk is about the interaction between Lab Slots and Milestones, not the individual mechanics. It is not about boost costs, rushing formulas, or unrelated research families.',
      data_source: labsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Lab Slots', 'Milestones'],
      interaction_type: 'conditional',
      interaction_summary: 'Milestones unlock the first Lab Slots access and gate many labs before those slots can research them.',
      tags: ['labs', 'slots', 'milestones'],
      paragraphs: [
        'Lab Slots begin only after the Milestones unlock at Tier 1 Wave 30.',
        'Milestones also gate many individual labs, so more Lab Slots do not bypass Milestones requirements by themselves.',
        'This means Milestones control when Lab Slots become useful and when those slots can be filled with more advanced labs.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'labs_rushing_gems_01',
      source: 'Labs Structured Reference',
      section: 'Labs',
      topic: 'Lab Rushing and Gems',
      title: 'Lab Rushing and Gems',
      disambiguation: 'This chunk is about the interaction between Lab Rushing and Gems, not the individual mechanics. It is not about Elite Cells boosts, slot purchases, or unrelated progression systems.',
      data_source: labsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Lab Rushing', 'Gems'],
      interaction_type: 'conditional',
      interaction_summary: 'Lab Rushing spends Gems to skip the entire remaining research time, with better gem efficiency on longer labs.',
      tags: ['labs', 'rushing', 'gems'],
      paragraphs: [
        'Lab Rushing consumes Gems to finish the whole remaining timer at once.',
        'Because Gem efficiency improves on longer timers, the Gem cost per unit time is better on long researches than on short ones.',
        'Gold boxing further improves the Gems side of Lab Rushing by lowering Gem cost for the same remaining time.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'labs_boosting_elite_cells_01',
      source: 'Labs Structured Reference',
      section: 'Labs',
      topic: 'Lab Boosting and Elite Cells',
      title: 'Lab Boosting and Elite Cells',
      disambiguation: 'This chunk is about the interaction between Lab Boosting and Elite Cells, not the individual mechanics. It is not about Gem rushing, slot unlocks, or unrelated currencies.',
      data_source: labsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Lab Boosting', 'Elite Cells'],
      interaction_type: 'scaling',
      interaction_summary: 'Lab Boosting spends Elite Cells on flat-rate multiplier and duration packages, with high multipliers scaling in cost much faster than speed gained.',
      tags: ['labs', 'boosting', 'elite cells'],
      paragraphs: [
        'Lab Boosting uses Elite Cells as its fuel for 1.5x through 8x research speed packages.',
        'Elite Cells costs are flat by multiplier and duration pair, but those Elite Cells costs rise far faster than the extra speed gained at the highest multipliers.',
        'This makes Elite Cells budgeting a major part of Lab Boosting decisions, especially when comparing one powerful boost against several lower boosts.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'labs_boosting_slotted_research_01',
      source: 'Labs Structured Reference',
      section: 'Labs',
      topic: 'Lab Boosting and Slotted Research',
      title: 'Lab Boosting and Slotted Research',
      disambiguation: 'This chunk is about the interaction between Lab Boosting and Slotted Research, not the individual mechanics. It is not about Gem rush pricing, slot purchases, or unrelated automation systems.',
      data_source: labsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Lab Boosting', 'Slotted Research'],
      interaction_type: 'conditional',
      interaction_summary: 'Lab Boosting only advances timers while the boosted lab remains actively slotted for research.',
      tags: ['labs', 'boosting', 'slotted research'],
      paragraphs: [
        'Lab Boosting does not advance idle labs; it only ticks when that lab is actively slotted for research.',
        'This means Slotted Research status is the live gate on whether Lab Boosting is actually producing progress.',
        'If a lab is unslotted, the purchased Lab Boosting time exists but does not convert into research progress until the lab is slotted again.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'labs_switching_coins_progress_01',
      source: 'Labs Structured Reference',
      section: 'Labs',
      topic: 'Lab Switching with Coins and Research Progress',
      title: 'Lab Switching with Coins and Research Progress',
      disambiguation: 'This chunk is about the interaction between Lab Switching, Coins, and Research Progress, not the individual mechanics. It is not about boost costs, slot counts, or unrelated lab families.',
      data_source: labsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Lab Switching', 'Coins', 'Research Progress'],
      interaction_type: 'conditional',
      interaction_summary: 'Lab Switching refunds Coins immediately but preserves Research Progress so the lab can resume later after Coins are paid again.',
      tags: ['labs', 'switching', 'coins', 'progress'],
      paragraphs: [
        'Lab Switching returns the currently spent Coins when the player swaps to another lab.',
        'Research Progress is preserved instead of erased, so the unfinished lab can be resumed later from its stored green time.',
        'When that saved Research Progress is resumed, Coins must be paid again before the lab continues.',
      ],
    }),
    ...labAtomicChunks,
    ...masteryRelations,
  ]
}
