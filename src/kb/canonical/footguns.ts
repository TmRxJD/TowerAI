import {
  FOOTGUN_BOT_COOLDOWN_ROWS,
  FOOTGUN_ENTRIES,
  FOOTGUN_LAB_OVERVIEW_FACTS,
  FOOTGUN_MVN_RARITY_ROWS,
  FOOTGUN_NON_EXAMPLE_FACTS,
  FOOTGUN_OVERVIEW_FACTS,
  FOOTGUN_UW_OVERVIEW_FACTS,
  type FootgunEntry,
} from '@tmrxjd/platform/tools'

import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'

type SystemSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

const SYSTEM_SPECS: SystemSpec[] = [
  { mechanic: 'Footguns', chunkId: 'footguns_overview_01', title: 'Footguns Overview', tags: ['footguns', 'long-term mistakes', 'progression'] },
  { mechanic: 'Footgun Non-Examples', chunkId: 'footguns_non_examples_01', title: 'What Is Not a Footgun', tags: ['footguns', 'scope', 'non-examples'] },
  { mechanic: 'Ultimate Weapon Footguns', chunkId: 'footguns_uw_overview_01', title: 'Ultimate Weapon Footguns Overview', tags: ['footguns', 'ultimate weapons', 'permanent upgrades'] },
  { mechanic: 'Choosing an Ultimate Weapon', chunkId: 'footguns_uw_pick_01', title: 'Choosing an Ultimate Weapon Footgun', tags: ['footguns', 'ultimate weapons', 'picks', 'stones'] },
  { mechanic: 'Black Hole Cooldown', chunkId: 'footguns_black_hole_cooldown_01', title: 'Black Hole Cooldown Footgun', tags: ['footguns', 'black hole', 'golden tower', 'sync'] },
  { mechanic: 'Changing the Cooldown of any Ultimate Weapon', chunkId: 'footguns_uw_cooldown_changes_01', title: 'Ultimate Weapon Cooldown Changes Footgun', tags: ['footguns', 'ultimate weapons', 'cooldown', 'sync', 'smart missiles'] },
  { mechanic: 'Natural GT/BH Sync', chunkId: 'footguns_natural_sync_01', title: 'Natural GT/BH Sync Footgun', tags: ['footguns', 'golden tower', 'black hole', 'multiverse nexus', 'sync'] },
  { mechanic: 'Lab Footguns', chunkId: 'footguns_lab_overview_01', title: 'Lab Footguns Overview', tags: ['footguns', 'labs', 'permanent upgrades'] },
  { mechanic: 'Bot Cooldowns', chunkId: 'footguns_bot_cooldowns_01', title: 'Bot Cooldown Footgun', tags: ['footguns', 'bots', 'cooldowns', 'sync'] },
  { mechanic: 'Chrono Field Range', chunkId: 'footguns_chrono_field_range_01', title: 'Chrono Field Range Footgun', tags: ['footguns', 'chrono field', 'labs', 'tournaments', 'cph'] },
]

function getFootgunEntry(mechanic: string): FootgunEntry {
  const entry = FOOTGUN_ENTRIES.find(candidate => candidate.key === mechanic)
  if (!entry) {
    throw new Error(`Missing footgun entry for mechanic: ${mechanic}`)
  }
  return entry
}

function buildEntryParagraphs(entry: FootgunEntry): string[] {
  const paragraphs = [
    entry.summary,
    `Why: ${entry.why}`,
  ]

  if (entry.avoidance && entry.avoidance.length > 0) {
    paragraphs.push(`To avoid: ${entry.avoidance.join(' ')}`)
  }

  paragraphs.push(`Solution: ${entry.solution}`)

  if (entry.key === 'Natural GT/BH Sync') {
    paragraphs.push(`Current site module data for Multiverse Nexus shows average cooldown offsets of ${FOOTGUN_MVN_RARITY_ROWS.map(row => `${row.rarity} ${row.averageCooldownOffsetSeconds >= 0 ? '+' : ''}${row.averageCooldownOffsetSeconds}s`).join(', ')}.`)
  }

  if (entry.key === 'Bot Cooldowns') {
    paragraphs.push(`Current site bot data for the non-Flame sync bots is ${FOOTGUN_BOT_COOLDOWN_ROWS.map(row => `${row.botName} base ${row.baseCooldownSeconds}s, medal floor ${row.medalFloorSeconds}s, lab reduction ${row.labReductionSeconds}s, final ${row.finalCooldownSeconds}s`).join('; ')}.`)
  }

  if (entry.key === 'Chrono Field Range') {
    paragraphs.push('Current milestone data places Chrono Field Range at Tier 7 wave 90, which reinforces that the warning shows up late enough to matter mainly for developed farming and tournament setups rather than opening progression.')
  }

  return paragraphs
}

function buildAtomicParagraphs(mechanic: string): string[] {
  switch (mechanic) {
    case 'Footguns':
      return [...FOOTGUN_OVERVIEW_FACTS]
    case 'Footgun Non-Examples':
      return [...FOOTGUN_NON_EXAMPLE_FACTS]
    case 'Ultimate Weapon Footguns':
      return [...FOOTGUN_UW_OVERVIEW_FACTS]
    case 'Lab Footguns':
      return [...FOOTGUN_LAB_OVERVIEW_FACTS]
    default:
      return buildEntryParagraphs(getFootgunEntry(mechanic))
  }
}

export function buildFootgunsCanonicalKbChunks(): KBChunkRecord[] {
  const footgunsEntry = getRequiredNamingRegistryEntryBySource('footguns', 'footguns')

  const atomicChunks = SYSTEM_SPECS.map(spec => {
    const namingEntry = spec.mechanic === 'Footguns'
      ? footgunsEntry
      : getRequiredNamingRegistryEntryBySource('footguns', spec.mechanic)

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'Footguns Structured Reference',
      section: 'Footguns',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about general play efficiency, temporary resource mistakes, or unrelated tracker state outside this warning context.`,
      data_source: namingEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Footguns',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: buildAtomicParagraphs(spec.mechanic),
    })
  })

  return [
    ...atomicChunks,
    buildRelationalKbChunk({
      chunk_id: 'footguns_black_hole_golden_tower_sync_01',
      source: 'Footguns Structured Reference',
      section: 'Footguns',
      topic: 'Black Hole Cooldown with Golden Tower',
      title: 'Black Hole Cooldown with Golden Tower',
      disambiguation: 'This chunk is about the interaction between the Black Hole Cooldown footgun, Black Hole, and Golden Tower, not the individual mechanics. It is not a general farming guide or a generic cooldown table.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('footguns', 'Black Hole Cooldown').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Black Hole Cooldown', 'Black Hole', 'Golden Tower'],
      interaction_type: 'conditional',
      interaction_summary: 'Lowering Black Hole cooldown before natural Golden Tower sync changes the stone path needed to reach the long-term GT/BH overlap targets.',
      tags: ['footguns', 'black hole', 'golden tower', 'sync', 'cooldown'],
      paragraphs: [
        'The Black Hole Cooldown footgun exists because Black Hole and Golden Tower are one of the key economy sync pairs in the game.',
        'When Black Hole cooldown is lowered ahead of plan, the account has to spend more to bring Golden Tower back to the desired overlap breakpoint instead of inheriting that ratio naturally.',
        'That makes the mistake reversible in theory, but expensive enough that the source still treats it as a long-term account setback rather than a harmless temporary detour.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'footguns_uw_cooldowns_strategy_sync_01',
      source: 'Footguns Structured Reference',
      section: 'Footguns',
      topic: 'Ultimate Weapon Cooldown Changes with Smart Missiles, Golden Tower, and Black Hole',
      title: 'Ultimate Weapon Cooldown Changes with Smart Missiles, Golden Tower, and Black Hole',
      disambiguation: 'This chunk is about the interaction between the Ultimate Weapon cooldown-change footgun and sync-sensitive Ultimate Weapons, not the individual mechanics. It is not a tier list or a one-size-fits-all build order.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('footguns', 'Changing the Cooldown of any Ultimate Weapon').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Smart Missiles').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Changing the Cooldown of any Ultimate Weapon', 'Smart Missiles', 'Golden Tower', 'Black Hole'],
      interaction_type: 'conditional',
      interaction_summary: 'Cooldown edits on one Ultimate Weapon can matter to broader strategy sync plans because Ultimate Weapon pairings are often functional rather than obvious from the UI alone.',
      tags: ['footguns', 'ultimate weapons', 'smart missiles', 'golden tower', 'black hole', 'sync'],
      paragraphs: [
        'Changing the Cooldown of any Ultimate Weapon is broader than Black Hole and Golden Tower alone.',
        'The source example uses Smart Missiles timing inside a devo variant, which shows that even a weapon that does not look like a primary economy pair can still require exact sync timing to keep a strategy valid.',
        'Because of that, cooldown upgrades should be checked against strategy requirements first and not treated as isolated linear progression choices.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'footguns_natural_sync_mvn_01',
      source: 'Footguns Structured Reference',
      section: 'Footguns',
      topic: 'Natural GT/BH Sync with Multiverse Nexus, Golden Tower, Black Hole, and Death Wave',
      title: 'Natural GT/BH Sync with Multiverse Nexus, Golden Tower, Black Hole, and Death Wave',
      disambiguation: 'This chunk is about the interaction between the Natural GT/BH Sync footgun, Multiverse Nexus, and the affected Ultimate Weapons, not the individual mechanics. It is not a module rarity tier list or a generic uptime explainer.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('footguns', 'Natural GT/BH Sync').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Multiverse Nexus').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Natural GT/BH Sync', 'Multiverse Nexus', 'Golden Tower', 'Black Hole', 'Death Wave'],
      interaction_type: 'cross_system',
      interaction_summary: 'Multiverse Nexus forces shared activation timing, but its average-cooldown offsets mean it does not replace the long-term value of natural Golden Tower and Black Hole sync.',
      tags: ['footguns', 'multiverse nexus', 'golden tower', 'black hole', 'death wave', 'sync'],
      paragraphs: [
        'The source treats Multiverse Nexus as a temporary sync aid rather than a permanent excuse to ignore natural Golden Tower and Black Hole sync.',
        'Current site module data reinforces that point because MVN still modifies the average cooldown by +20 seconds at Epic, +10 at Legendary, +1 at Mythic, and only reaches -10 at Ancestral.',
        'That means natural sync remains the durable long-run target even for accounts using MVN as a bridge while Golden Tower, Black Hole, and sometimes Death Wave are still being aligned.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'footguns_bot_cooldowns_bots_vault_01',
      source: 'Footguns Structured Reference',
      section: 'Footguns',
      topic: 'Bot Cooldowns with Bots, Golden Tower, Death Wave, and Vault',
      title: 'Bot Cooldowns with Bots, Golden Tower, Death Wave, and Vault',
      disambiguation: 'This chunk is about the interaction between the Bot Cooldowns footgun, bots, sync targets, and the Vault mitigation path, not the individual mechanics. It is not a full bot upgrade guide or a medals-spending priority list.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('footguns', 'Bot Cooldowns').data_source,
        getRequiredNamingRegistryEntryBySource('bots', 'bots').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave').data_source,
        getRequiredNamingRegistryEntryBySource('vault', 'vault').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Bot Cooldowns', 'Bots', 'Golden Tower', 'Death Wave', 'Vault'],
      interaction_type: 'cross_system',
      interaction_summary: 'Bot cooldown labs create permanent sync constraints against bot and Ultimate Weapon timings, while Vault later adds a Bot Cooldown Slider mitigation path.',
      tags: ['footguns', 'bots', 'golden tower', 'death wave', 'vault', 'sync'],
      paragraphs: [
        'The bot cooldown footgun matters because bot timings often want to sit at clean ratios relative to Golden Tower and Death Wave.',
        'Current site bot data shows Coin Bot, Amplify Bot, and Thunder Bot all move from 120-second base cooldown to a 75-second medal floor and then to 50 seconds after the full lab reduction, which is exactly why breakpoint planning matters before permanent lab levels are locked in.',
        'The source also points to a later Bot Cooldown Slider tech tree upgrade, and current vault data confirms that slider exists as a Vault node, so the mitigation path is real but late enough that the early lab mistake still qualifies as a footgun.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'footguns_chrono_field_range_tournaments_01',
      source: 'Footguns Structured Reference',
      section: 'Footguns',
      topic: 'Chrono Field Range with Chrono Field, Tournaments, and Milestones',
      title: 'Chrono Field Range with Chrono Field, Tournaments, and Milestones',
      disambiguation: 'This chunk is about the interaction between the Chrono Field Range footgun, Chrono Field, tournaments, and its unlock context, not the individual mechanics. It is not a generic lab priority guide or a farming walkthrough.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('footguns', 'Chrono Field Range').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chrono Field').data_source,
        getRequiredNamingRegistryEntryBySource('tournaments', 'tournaments').data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'milestones').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Chrono Field Range', 'Chrono Field', 'Tournaments', 'Milestones'],
      interaction_type: 'conditional',
      interaction_summary: 'Chrono Field Range can hurt some farming kill timing while still being worth maxing because its tournament value usually outweighs the coins-per-hour downside.',
      tags: ['footguns', 'chrono field', 'tournaments', 'milestones', 'cph'],
      paragraphs: [
        'Chrono Field Range is a contextual footgun instead of a blanket do-not-upgrade warning.',
        'The source says the extra zoom-out can lower coins per hour by pushing enemy spawns further away, but it also says the downside is usually minor compared with tournament value.',
        'Current milestone data places Chrono Field Range at Tier 7 wave 90, which fits that warning profile: by the time the lab appears, players are far enough into progression that tournament performance and specialized farm tuning both matter.',
      ],
    }),
  ]
}
