import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import { loadUltimateWeaponsSourceDocument, type UltimateWeaponDeterministicEntry } from './ultimateWeaponsSource'

function formatSectionParagraph(entry: UltimateWeaponDeterministicEntry, key: string): string | null {
  const value = entry.sections[key]
  if (!value || /^none\.?$/i.test(value.trim())) {
    return null
  }

  return `${key}: ${value}`
}

function createWeaponChunkId(mechanic: string): string {
  return `uw_${mechanic.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}_01`
}

function extractAliases(entry: UltimateWeaponDeterministicEntry): string[] {
  return String(entry.sections.Aliases || '')
    .split(';')
    .map(alias => alias.trim().toLowerCase())
    .filter(alias => alias && alias !== 'none.')
}

function buildMetadataParagraph(entry: UltimateWeaponDeterministicEntry): string | null {
  const parts = [
    entry.sections.Type ? `Type: ${entry.sections.Type}` : '',
    entry.sections.Domain ? `Domain: ${entry.sections.Domain}` : '',
    entry.sections.Section ? `Section: ${entry.sections.Section}` : '',
    entry.sections.Category ? `Category: ${entry.sections.Category}` : '',
    entry.sections.Aliases && !/^none\.?$/i.test(entry.sections.Aliases) ? `Aliases: ${entry.sections.Aliases}` : '',
  ].filter(Boolean)

  return parts.length > 0 ? `${parts.join('. ')}.` : null
}

const BASE_METADATA_KEYS = new Set([
  'Mechanic',
  'Type',
  'Domain',
  'Section',
  'Category',
  'Aliases',
  'Disambiguation',
])

const NON_ATOMIC_SECTION_KEYS = new Set([
  'Interactions',
  'Relative Income Tables',
])

function buildOrderedParagraphs(entry: UltimateWeaponDeterministicEntry, preferredKeys: string[]): string[] {
  const paragraphs: string[] = []
  const usedKeys = new Set<string>()

  const pushParagraph = (key: string) => {
    const paragraph = formatSectionParagraph(entry, key)
    if (!paragraph) {
      return
    }

    paragraphs.push(paragraph)
    usedKeys.add(key)
  }

  pushParagraph('Definition')

  const metadataParagraph = buildMetadataParagraph(entry)
  if (metadataParagraph) {
    paragraphs.push(metadataParagraph)
  }

  for (const key of preferredKeys) {
    pushParagraph(key)
  }

  for (const key of Object.keys(entry.sections)) {
    if (
      usedKeys.has(key)
      || BASE_METADATA_KEYS.has(key)
      || NON_ATOMIC_SECTION_KEYS.has(key)
      || key === 'Definition'
      || key === 'Description'
    ) {
      continue
    }

    pushParagraph(key)
  }

  return paragraphs
}

function buildGoldenTowerRelationalChunks(entry: UltimateWeaponDeterministicEntry): KBChunkRecord[] {
  const goldenTowerEntry = getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower')
  const gtDataSource = goldenTowerEntry.data_source
  const formulaParagraph = formatSectionParagraph(entry, 'Formula') ?? ''
  const behaviorParagraph = formatSectionParagraph(entry, 'Behavior') ?? ''
  const uptimeParagraph = formatSectionParagraph(entry, '100% GT Uptime') ?? ''
  const labsParagraph = formatSectionParagraph(entry, 'Labs') ?? ''
  const definitionParagraph = formatSectionParagraph(entry, 'Definition') ?? ''

  return [
    buildRelationalKbChunk({
      chunk_id: 'uw_golden_tower_golden_combo_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Golden Tower and Golden Combo',
      title: 'Golden Tower and Golden Combo Interaction',
      disambiguation: 'This chunk describes the interaction between Golden Tower and Golden Combo, not the Golden Tower mechanic by itself. It is not a general optimization guide or a comparison against other Ultimate Weapons.',
      data_source: [gtDataSource, `${gtDataSource}#Ultimate Weapon Plus`, `${gtDataSource}#Formula`, `${gtDataSource}#Behavior`],
      mechanics: ['Golden Tower', 'Golden Combo'],
      interaction_type: 'scaling',
      interaction_summary: 'Golden Combo scales Golden Tower post-activation income using kill count during the activation window.',
      tags: ['ultimate weapons', 'golden tower', 'golden combo', 'income', 'scaling'],
      paragraphs: [
        'Golden Tower and Golden Combo Interaction. Golden Combo is the Golden Tower Ultimate Weapon Plus row and increases cash and coins earned after Golden Tower finishes by x% per kill.',
        formulaParagraph,
        behaviorParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_golden_tower_duration_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Golden Tower and Duration',
      title: 'Golden Tower Duration Interaction',
      disambiguation: 'This chunk describes the interaction between Golden Tower and its Duration stat, not Golden Tower in isolation. It is not a scenario comparison table or a strategy recommendation.',
      data_source: [gtDataSource, `${gtDataSource}#Behavior`, `${gtDataSource}#100% GT Uptime`],
      mechanics: ['Golden Tower', 'Golden Tower Duration'],
      interaction_type: 'scaling',
      interaction_summary: 'Golden Tower duration changes both kills counted during the activation window and the final Golden Combo income result.',
      tags: ['ultimate weapons', 'golden tower', 'duration', 'golden combo', 'income'],
      paragraphs: [
        'Golden Tower Duration Interaction. Golden Combo final bonus depends on Golden Tower duration because kills during the activation window scale with kills per second times duration.',
        behaviorParagraph,
        uptimeParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_golden_tower_cooldown_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Golden Tower and Cooldown',
      title: 'Golden Tower Cooldown Interaction',
      disambiguation: 'This chunk describes the interaction between Golden Tower and its Cooldown stat, not Golden Tower by itself. It is not a module tier comparison or a farming recommendation.',
      data_source: [gtDataSource, `${gtDataSource}#Behavior`, `${gtDataSource}#100% GT Uptime`],
      mechanics: ['Golden Tower', 'Golden Tower Cooldown'],
      interaction_type: 'order_of_operations',
      interaction_summary: 'Golden Tower cooldown controls how often activations occur and therefore how the total income formula is evaluated over time.',
      tags: ['ultimate weapons', 'golden tower', 'cooldown', 'activation', 'income'],
      paragraphs: [
        'Golden Tower Cooldown Interaction. In the Golden Tower behavior rules, T is the number of activations and is defined from total duration divided by cooldown, so cooldown changes how often Golden Tower can generate activation-based income windows.',
        behaviorParagraph,
        uptimeParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_golden_tower_labs_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Golden Tower and Labs',
      title: 'Golden Tower Lab Interactions',
      disambiguation: 'This chunk describes the interaction between Golden Tower and its Golden Tower Bonus and Golden Tower Duration labs, not the Golden Tower mechanic by itself. It is not a lab priority guide.',
      data_source: [gtDataSource, `${gtDataSource}#Labs`],
      mechanics: ['Golden Tower', 'Golden Tower Bonus', 'Golden Tower Duration'],
      interaction_type: 'synergy',
      interaction_summary: 'Golden Tower Bonus and Golden Tower Duration labs directly increase Golden Tower base values and therefore modify its income behavior.',
      tags: ['ultimate weapons', 'golden tower', 'labs', 'golden tower bonus', 'golden tower duration'],
      paragraphs: [
        'Golden Tower Lab Interactions. Golden Tower interacts with Golden Tower Bonus and Golden Tower Duration. Golden Tower Bonus increases the base bonus stat, and Golden Tower Duration increases the base duration stat.',
        labsParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_golden_tower_income_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Golden Tower and Income Mechanics',
      title: 'Golden Tower Income Interactions',
      disambiguation: 'This chunk describes the interaction between Golden Tower and kill-based cash and coin income, not the Golden Tower mechanic by itself. It is not a comparative income table or a strategy chunk.',
      data_source: [gtDataSource, `${gtDataSource}#Definition`, `${gtDataSource}#Behavior`],
      mechanics: ['Golden Tower', 'Cash Income', 'Coin Income'],
      interaction_type: 'cross_system',
      interaction_summary: 'Golden Tower modifies kill-based cash and coin income during its active window and Golden Combo extends that income interaction after the window ends.',
      tags: ['ultimate weapons', 'golden tower', 'cash', 'coins', 'income'],
      paragraphs: [
        'Golden Tower Income Interactions. Golden Tower modifies Cash Income and Coin Income from enemy kills while it is active. Golden Combo then converts kills during the activation window into an additional post-activation multiplier on that Cash Income and Coin Income flow.',
        definitionParagraph,
        behaviorParagraph,
      ],
    }),
  ]
}

function buildPoisonSwampRelationalChunks(entry: UltimateWeaponDeterministicEntry): KBChunkRecord[] {
  const poisonSwampEntry = getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Poison Swamp')
  const psDataSource = poisonSwampEntry.data_source
  const formulaParagraph = formatSectionParagraph(entry, 'Formula') ?? ''
  const labsParagraph = formatSectionParagraph(entry, 'Labs') ?? ''
  const modulesParagraph = formatSectionParagraph(entry, 'Modules') ?? ''
  const perksParagraph = formatSectionParagraph(entry, 'Perks') ?? ''
  const interactionsParagraph = formatSectionParagraph(entry, 'Interactions') ?? ''
  const uwPlusParagraph = formatSectionParagraph(entry, 'Ultimate Weapon Plus') ?? ''

  return [
    buildRelationalKbChunk({
      chunk_id: 'uw_poison_swamp_death_creep_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Poison Swamp and Death Creep',
      title: 'Poison Swamp and Death Creep Interaction',
      disambiguation: 'This chunk describes the interaction between Poison Swamp and the Death Creep Ultimate Weapon Plus row, not the Poison Swamp mechanic by itself. It is not a scaling table or optimization guide.',
      data_source: [psDataSource, `${psDataSource}#Ultimate Weapon Plus`],
      mechanics: ['Poison Swamp', 'Death Creep'],
      interaction_type: 'scaling',
      interaction_summary: 'Death Creep scales later Poison Swamp ticks from the base Poison Swamp damage value.',
      tags: ['ultimate weapons', 'poison swamp', 'death creep', 'damage over time', 'scaling'],
      paragraphs: [
        'Poison Swamp and Death Creep Interaction. Death Creep is the Poison Swamp Ultimate Weapon Plus row and increases damage dealt by Poison Swamp for each tick by x% of Poison Swamp damage.',
        uwPlusParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_poison_swamp_harmony_conductor_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Poison Swamp and Harmony Conductor',
      title: 'Poison Swamp and Harmony Conductor Interaction',
      disambiguation: 'This chunk describes the interaction between Poison Swamp and the Harmony Conductor unique module, not the Poison Swamp mechanic by itself. It is not a module tier recommendation.',
      data_source: [psDataSource, `${psDataSource}#Modules`],
      mechanics: ['Poison Swamp', 'Harmony Conductor'],
      interaction_type: 'synergy',
      interaction_summary: 'Harmony Conductor adds miss-chance utility to poisoned enemies and therefore extends Poison Swamp beyond damage-over-time alone.',
      tags: ['ultimate weapons', 'poison swamp', 'harmony conductor', 'module', 'poisoned'],
      paragraphs: [
        'Poison Swamp and Harmony Conductor Interaction. Harmony Conductor is the Poison Swamp unique module hook and gives poisoned enemies a chance to miss attacks, with bosses using half chance.',
        modulesParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_poison_swamp_labs_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Poison Swamp and Labs',
      title: 'Poison Swamp Lab Interactions',
      disambiguation: 'This chunk describes the interaction between Poison Swamp and its Swamp Radius, Stun, and Rend labs, not the Poison Swamp mechanic by itself. It is not a lab priority recommendation.',
      data_source: [psDataSource, `${psDataSource}#Labs`],
      mechanics: ['Poison Swamp', 'Swamp Radius', 'Poison Swamp Stun', 'Swamp Rend'],
      interaction_type: 'synergy',
      interaction_summary: 'Poison Swamp labs extend the swamp through radius, stun, and rend-based follow-up behavior.',
      tags: ['ultimate weapons', 'poison swamp', 'labs', 'swamp radius', 'stun', 'rend'],
      paragraphs: [
        'Poison Swamp Lab Interactions. Poison Swamp labs expand the mechanic through radius growth, stun behavior, and rend-linked follow-up damage rules.',
        labsParagraph,
        perksParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_poison_swamp_damage_scaling_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Poison Swamp Damage Scaling',
      title: 'Poison Swamp Damage Scaling Interactions',
      disambiguation: 'This chunk describes the interaction between Poison Swamp, Ultimate Weapons, Critical Factor, Super Crit Chance, and Ultimate Weapon Damage, not the individual mechanics. It is not the global Ultimate Weapon damage formula chunk.',
      data_source: [psDataSource, `${psDataSource}#Formula`, `${psDataSource}#Interactions`],
      mechanics: ['Poison Swamp', 'Ultimate Weapons', 'Critical Factor', 'Super Crit Chance', 'Ultimate Weapon Damage'],
      interaction_type: 'multiplicative',
      interaction_summary: 'Poison Swamp tower-damage-based ticks inherit shared Ultimate Weapon damage scaling from crit, super crit, and global Ultimate Weapon damage bonuses.',
      tags: ['ultimate weapons', 'poison swamp', 'critical factor', 'super crit', 'ultimate weapon damage'],
      paragraphs: [
        'Poison Swamp Damage Scaling Interactions. Poison Swamp uses the shared Ultimate Weapons damage formula for its tower-damage-based ticks. Critical Factor, Super Crit Chance, and Ultimate Weapon Damage therefore all contribute to Poison Swamp scaling through that shared Ultimate Weapons path.',
        formulaParagraph,
        interactionsParagraph,
      ],
    }),
  ]
}

function buildBlackHoleRelationalChunks(entry: UltimateWeaponDeterministicEntry): KBChunkRecord[] {
  const blackHoleEntry = getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole')
  const bhDataSource = blackHoleEntry.data_source
  const formulaParagraph = formatSectionParagraph(entry, 'Formula') ?? ''
  const labsParagraph = formatSectionParagraph(entry, 'Labs') ?? ''
  const modulesParagraph = formatSectionParagraph(entry, 'Modules') ?? ''
  const interactionsParagraph = formatSectionParagraph(entry, 'Interactions') ?? ''
  const uwPlusParagraph = formatSectionParagraph(entry, 'Ultimate Weapon Plus') ?? ''

  return [
    buildRelationalKbChunk({
      chunk_id: 'uw_black_hole_consume_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Black Hole and Consume',
      title: 'Black Hole and Consume Interaction',
      disambiguation: 'This chunk describes the interaction between Black Hole and the Consume Ultimate Weapon Plus row, not the Black Hole mechanic by itself. It is not a strategy recommendation.',
      data_source: [bhDataSource, `${bhDataSource}#Ultimate Weapon Plus`],
      mechanics: ['Black Hole', 'Consume'],
      interaction_type: 'scaling',
      interaction_summary: 'Consume adds a current-wave-HP end-of-activation damage effect to Black Hole and also changes pull behavior.',
      tags: ['ultimate weapons', 'black hole', 'consume', 'current wave hp'],
      paragraphs: [
        'Black Hole and Consume Interaction. Consume is the Black Hole Ultimate Weapon Plus row and causes each Black Hole to deal a multiple of current wave HP to affected enemies at the end of its activation.',
        uwPlusParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_black_hole_labs_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Black Hole and Labs',
      title: 'Black Hole Lab Interactions',
      disambiguation: 'This chunk describes the interaction between Black Hole and its Black Hole Damage, Coin Bonus, Extra Black Hole, and Disable Ranged Enemies labs, not the Black Hole mechanic by itself. It is not a lab priority guide.',
      data_source: [bhDataSource, `${bhDataSource}#Labs`, `${bhDataSource}#Formula`],
      mechanics: ['Black Hole', 'Black Hole Damage', 'Black Hole Coin Bonus', 'Extra Black Hole', 'Black Hole Disable Ranged Enemies'],
      interaction_type: 'synergy',
      interaction_summary: 'Black Hole labs extend the mechanic through percent-health damage, extra coin payout, extra holes, and ranged-enemy denial.',
      tags: ['ultimate weapons', 'black hole', 'labs', 'black hole damage', 'coin bonus', 'extra black hole'],
      paragraphs: [
        'Black Hole Lab Interactions. Black Hole labs add a percent-health damage rider, extra coins, an extra hole, and ranged-enemy denial behavior.',
        formulaParagraph,
        labsParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_black_hole_primordial_collapse_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Black Hole and Primordial Collapse',
      title: 'Black Hole and Primordial Collapse Interaction',
      disambiguation: 'This chunk describes the interaction between Black Hole and the Primordial Collapse unique module, not the Black Hole mechanic by itself. It is not a module tier recommendation.',
      data_source: [bhDataSource, `${bhDataSource}#Modules`],
      mechanics: ['Black Hole', 'Primordial Collapse'],
      interaction_type: 'synergy',
      interaction_summary: 'Primordial Collapse adds an extra Black Hole and reduces damage from enemies inside a Black Hole.',
      tags: ['ultimate weapons', 'black hole', 'primordial collapse', 'module'],
      paragraphs: [
        'Black Hole and Primordial Collapse Interaction. Primordial Collapse is the Black Hole-specific unique module hook and adds one extra Black Hole while reducing damage from enemies within a Black Hole.',
        modulesParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_black_hole_positioning_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Black Hole Positioning and Sync Interactions',
      title: 'Black Hole Positioning and Sync Interactions',
      disambiguation: 'This chunk describes the interaction between Black Hole, Tower Range, Multiverse Nexus, and Galaxy Compressor, not the individual mechanics. It is not a general sync guide.',
      data_source: [bhDataSource, `${bhDataSource}#Interactions`],
      mechanics: ['Black Hole', 'Tower Range', 'Multiverse Nexus', 'Galaxy Compressor'],
      interaction_type: 'cross_system',
      interaction_summary: 'Black Hole positioning depends on Tower Range, while Multiverse Nexus and Galaxy Compressor alter Black Hole cooldown timing.',
      tags: ['ultimate weapons', 'black hole', 'tower range', 'multiverse nexus', 'galaxy compressor'],
      paragraphs: [
        'Black Hole Positioning and Sync Interactions. Black Hole distance from the tower depends on Tower Range, and Black Hole cooldown behavior can also be altered by Multiverse Nexus and Galaxy Compressor.',
        interactionsParagraph,
      ],
    }),
  ]
}

function buildSpotlightRelationalChunks(entry: UltimateWeaponDeterministicEntry): KBChunkRecord[] {
  const spotlightEntry = getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Spotlight')
  const slDataSource = spotlightEntry.data_source
  const labsParagraph = formatSectionParagraph(entry, 'Labs') ?? ''
  const modulesParagraph = formatSectionParagraph(entry, 'Modules') ?? ''
  const interactionsParagraph = formatSectionParagraph(entry, 'Interactions') ?? ''
  const perksParagraph = formatSectionParagraph(entry, 'Perks') ?? ''
  const uwPlusParagraph = formatSectionParagraph(entry, 'Ultimate Weapon Plus') ?? ''
  const behaviorParagraph = formatSectionParagraph(entry, 'Behavior') ?? ''

  return [
    buildRelationalKbChunk({
      chunk_id: 'uw_spotlight_light_range_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Spotlight and Light Range',
      title: 'Spotlight and Light Range Interaction',
      disambiguation: 'This chunk describes the interaction between Spotlight and the Light Range Ultimate Weapon Plus row, not the Spotlight mechanic by itself. It is not a scaling optimization guide.',
      data_source: [slDataSource, `${slDataSource}#Ultimate Weapon Plus`, `${slDataSource}#Interactions`],
      mechanics: ['Spotlight', 'Light Range', 'Damage / Meter', 'Tower Range'],
      interaction_type: 'scaling',
      interaction_summary: 'Light Range scales Spotlight bonus from Damage / Meter and is affected by Tower Range.',
      tags: ['ultimate weapons', 'spotlight', 'light range', 'damage per meter', 'tower range'],
      paragraphs: [
        'Spotlight and Light Range Interaction. Light Range is the Spotlight Ultimate Weapon Plus row and boosts Spotlight damage bonus through Damage / Meter rather than through a standalone Spotlight-only scalar.',
        uwPlusParagraph,
        interactionsParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_spotlight_om_chip_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Spotlight and Om Chip',
      title: 'Spotlight and Om Chip Interaction',
      disambiguation: 'This chunk describes the interaction between Spotlight and the Om Chip unique module, not the Spotlight mechanic by itself. It is not a module tier recommendation.',
      data_source: [slDataSource, `${slDataSource}#Modules`],
      mechanics: ['Spotlight', 'Om Chip'],
      interaction_type: 'synergy',
      interaction_summary: 'Om Chip changes Spotlight targeting behavior and adds reflected nearby-enemy damage amplification.',
      tags: ['ultimate weapons', 'spotlight', 'om chip', 'module'],
      paragraphs: [
        'Spotlight and Om Chip Interaction. Om Chip is the Spotlight-specific unique module hook and changes Spotlight rotation to focus bosses while increasing nearby-enemy damage taken through reflected light.',
        modulesParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_spotlight_missiles_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Spotlight Missiles and Smart Missiles',
      title: 'Spotlight Missiles and Smart Missiles Interaction',
      disambiguation: 'This chunk describes the interaction between the Spotlight Missiles lab and Smart Missiles damage, not the Spotlight mechanic by itself. It is not a Smart Missiles base-stat chunk.',
      data_source: [slDataSource, `${slDataSource}#Labs`, `${slDataSource}#Interactions`],
      mechanics: ['Spotlight', 'Spotlight Missiles', 'Smart Missiles'],
      interaction_type: 'cross_system',
      interaction_summary: 'Spotlight Missiles uses Smart Missiles damage and falls back to base missile damage when Smart Missiles is not unlocked.',
      tags: ['ultimate weapons', 'spotlight', 'spotlight missiles', 'smart missiles'],
      paragraphs: [
        'Spotlight Missiles and Smart Missiles Interaction. Spotlight Missiles is a Spotlight lab, but its missile damage is determined by Smart Missiles damage and falls back to a base damage value when Smart Missiles is not unlocked.',
        labsParagraph,
        interactionsParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_spotlight_bonus_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Spotlight Bonus Interactions',
      title: 'Spotlight Bonus Interactions',
      disambiguation: 'This chunk describes the interaction between Spotlight, Spotlight Coin Bonus, and Spotlight Damage Bonus x1.5, not the individual mechanics. It is not a farming guide.',
      data_source: [slDataSource, `${slDataSource}#Behavior`, `${slDataSource}#Labs`, `${slDataSource}#Perks`],
      mechanics: ['Spotlight', 'Spotlight Coin Bonus', 'Spotlight Damage Bonus x1.5'],
      interaction_type: 'synergy',
      interaction_summary: 'Spotlight amplifies non-percent damage sources and can be further extended through its coin bonus lab and weapon-specific damage bonus perk.',
      tags: ['ultimate weapons', 'spotlight', 'coin bonus', 'perk', 'damage amplification'],
      paragraphs: [
        'Spotlight Bonus Interactions. Spotlight multiplies damage taken for non-percent-health damage sources, and that bonus can be extended through the Spotlight Coin Bonus lab and the Spotlight Damage Bonus x1.5 perk.',
        behaviorParagraph,
        labsParagraph,
        perksParagraph,
      ],
    }),
  ]
}

function buildChainLightningRelationalChunks(entry: UltimateWeaponDeterministicEntry): KBChunkRecord[] {
  const chainLightningEntry = getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chain Lightning')
  const clDataSource = chainLightningEntry.data_source
  const formulaParagraph = formatSectionParagraph(entry, 'Formula') ?? ''
  const labsParagraph = formatSectionParagraph(entry, 'Labs') ?? ''
  const modulesParagraph = formatSectionParagraph(entry, 'Modules') ?? ''
  const interactionsParagraph = formatSectionParagraph(entry, 'Interactions') ?? ''
  const perksParagraph = formatSectionParagraph(entry, 'Perks') ?? ''
  const uwPlusParagraph = formatSectionParagraph(entry, 'Ultimate Weapon Plus') ?? ''

  return [
    buildRelationalKbChunk({
      chunk_id: 'uw_chain_lightning_smite_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Chain Lightning and Smite',
      title: 'Chain Lightning and Smite Interaction',
      disambiguation: 'This chunk describes the interaction between Chain Lightning and the Smite Ultimate Weapon Plus row, not the Chain Lightning mechanic by itself. It is not a scaling recommendation.',
      data_source: [clDataSource, `${clDataSource}#Ultimate Weapon Plus`],
      mechanics: ['Chain Lightning', 'Smite'],
      interaction_type: 'scaling',
      interaction_summary: 'Smite adds a current-wave-HP damage rider based on Chain Lightning chance and hit count limits.',
      tags: ['ultimate weapons', 'chain lightning', 'smite', 'current wave hp'],
      paragraphs: [
        'Chain Lightning and Smite Interaction. Smite is the Chain Lightning Ultimate Weapon Plus row and gives each Chain Lightning hit a chance equal to Chain Lightning Chance to deal extra damage based on current wave HP, up to 100 hits per enemy.',
        uwPlusParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_chain_lightning_shock_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Chain Lightning and Shock Labs',
      title: 'Chain Lightning Shock Interactions',
      disambiguation: 'This chunk describes the interaction between Chain Lightning and its Shock-related labs, not the Chain Lightning mechanic by itself. It is not a lab priority guide.',
      data_source: [clDataSource, `${clDataSource}#Labs`],
      mechanics: ['Chain Lightning', 'Chain Lightning Shock', 'Shock Chance', 'Shock Multiplier'],
      interaction_type: 'synergy',
      interaction_summary: 'Shock labs add a damage-taken debuff layer and follow-on scaling to Chain Lightning hits.',
      tags: ['ultimate weapons', 'chain lightning', 'shock', 'labs'],
      paragraphs: [
        'Chain Lightning Shock Interactions. Chain Lightning labs add Shock application, Shock Chance, Shock Multiplier, enemy damage reduction scaling, and extra consecutive-hit scatter damage.',
        labsParagraph,
        perksParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_chain_lightning_dimension_core_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Chain Lightning and Dimension Core',
      title: 'Chain Lightning and Dimension Core Interaction',
      disambiguation: 'This chunk describes the interaction between Chain Lightning and the Dimension Core unique module, not the Chain Lightning mechanic by itself. It is not a module tier recommendation.',
      data_source: [clDataSource, `${clDataSource}#Modules`],
      mechanics: ['Chain Lightning', 'Dimension Core'],
      interaction_type: 'synergy',
      interaction_summary: 'Dimension Core changes Chain Lightning target behavior and expands Shock stacking behavior.',
      tags: ['ultimate weapons', 'chain lightning', 'dimension core', 'module'],
      paragraphs: [
        'Chain Lightning and Dimension Core Interaction. Dimension Core is the Chain Lightning-specific unique module hook and changes target behavior while expanding Shock stacking limits and doubling Shock chance and multiplier.',
        modulesParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_chain_lightning_damage_scaling_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Chain Lightning Damage Scaling',
      title: 'Chain Lightning Damage Scaling Interactions',
      disambiguation: 'This chunk describes the interaction between Chain Lightning, Ultimate Weapons, Critical Factor, Super Crit Chance, and Ultimate Weapon Damage, not the individual mechanics. It is not the global Ultimate Weapon damage formula chunk.',
      data_source: [clDataSource, `${clDataSource}#Formula`, `${clDataSource}#Interactions`],
      mechanics: ['Chain Lightning', 'Ultimate Weapons', 'Critical Factor', 'Super Crit Chance', 'Ultimate Weapon Damage'],
      interaction_type: 'multiplicative',
      interaction_summary: 'Chain Lightning inherits shared Ultimate Weapon damage scaling from crit, super crit, and global Ultimate Weapon damage bonuses.',
      tags: ['ultimate weapons', 'chain lightning', 'critical factor', 'super crit', 'ultimate weapon damage'],
      paragraphs: [
        'Chain Lightning Damage Scaling Interactions. Chain Lightning uses the shared Ultimate Weapons damage formula. Critical Factor, Super Crit Chance, and Ultimate Weapon Damage therefore all contribute to Chain Lightning scaling through that shared Ultimate Weapons path.',
        formulaParagraph,
        interactionsParagraph,
      ],
    }),
  ]
}

function buildSmartMissilesRelationalChunks(entry: UltimateWeaponDeterministicEntry): KBChunkRecord[] {
  const smartMissilesEntry = getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Smart Missiles')
  const smDataSource = smartMissilesEntry.data_source
  const formulaParagraph = formatSectionParagraph(entry, 'Formula') ?? ''
  const labsParagraph = formatSectionParagraph(entry, 'Labs') ?? ''
  const modulesParagraph = formatSectionParagraph(entry, 'Modules') ?? ''
  const interactionsParagraph = formatSectionParagraph(entry, 'Interactions') ?? ''
  const perksParagraph = formatSectionParagraph(entry, 'Perks') ?? ''
  const uwPlusParagraph = formatSectionParagraph(entry, 'Ultimate Weapon Plus') ?? ''

  return [
    buildRelationalKbChunk({
      chunk_id: 'uw_smart_missiles_cover_fire_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Smart Missiles and Cover Fire',
      title: 'Smart Missiles and Cover Fire Interaction',
      disambiguation: 'This chunk describes the interaction between Smart Missiles and the Cover Fire Ultimate Weapon Plus row, not the Smart Missiles mechanic by itself. It is not an optimization recommendation.',
      data_source: [smDataSource, `${smDataSource}#Ultimate Weapon Plus`],
      mechanics: ['Smart Missiles', 'Cover Fire'],
      interaction_type: 'scaling',
      interaction_summary: 'Cover Fire adds an extra Smart Missile launch cadence on top of the base cooldown-driven activation.',
      tags: ['ultimate weapons', 'smart missiles', 'cover fire'],
      paragraphs: [
        'Smart Missiles and Cover Fire Interaction. Cover Fire is the Smart Missiles Ultimate Weapon Plus row and launches an additional Smart Missile every set number of seconds after the upgrade is unlocked.',
        uwPlusParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_smart_missiles_labs_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Smart Missiles and Missile Labs',
      title: 'Smart Missiles Missile Lab Interactions',
      disambiguation: 'This chunk describes the interaction between Smart Missiles and its lab upgrades, not the Smart Missiles mechanic by itself. It is not a lab priority guide.',
      data_source: [smDataSource, `${smDataSource}#Behavior`],
      mechanics: ['Smart Missiles', 'Missile Despawn Time', 'Missile Amplifier', 'Missile Explosions', 'Missile Radius', 'Missile Barrage'],
      interaction_type: 'synergy',
      interaction_summary: 'Smart Missiles labs change persistence, repeated-hit scaling, area damage, and once-per-run barrage behavior.',
      tags: ['ultimate weapons', 'smart missiles', 'labs', 'missile barrage'],
      paragraphs: [
        'Smart Missiles Missile Lab Interactions. Smart Missiles labs expand missile persistence, repeated-hit amplification, splash damage, explosion radius, and manually activated Missile Barrage behavior.',
        labsParagraph,
        perksParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_smart_missiles_galaxy_compressor_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Smart Missiles and Galaxy Compressor',
      title: 'Smart Missiles and Galaxy Compressor Interaction',
      disambiguation: 'This chunk describes the interaction between Smart Missiles and the Galaxy Compressor module effect, not the Smart Missiles mechanic by itself. It is not a module ranking.',
      data_source: [smDataSource, `${smDataSource}#Modules`],
      mechanics: ['Smart Missiles', 'Galaxy Compressor'],
      interaction_type: 'conditional',
      interaction_summary: 'Galaxy Compressor reduces Smart Missiles cooldown on package pickup even though Smart Missiles has no dedicated core unique module.',
      tags: ['ultimate weapons', 'smart missiles', 'galaxy compressor', 'module', 'cooldown'],
      paragraphs: [
        'Smart Missiles and Galaxy Compressor Interaction. Smart Missiles does not have a dedicated core unique module, but Galaxy Compressor still reduces Smart Missiles cooldown on package pickup.',
        modulesParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_smart_missiles_spotlight_missiles_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Smart Missiles and Spotlight Missiles',
      title: 'Smart Missiles and Spotlight Missiles Interaction',
      disambiguation: 'This chunk describes the interaction between Smart Missiles and the Spotlight Missiles lab, not the Smart Missiles mechanic by itself. It is not a Spotlight base-stat chunk.',
      data_source: [smDataSource, `${smDataSource}#Interactions`],
      mechanics: ['Smart Missiles', 'Spotlight Missiles', 'Spotlight'],
      interaction_type: 'cross_system',
      interaction_summary: 'Spotlight Missiles inherits Smart Missiles damage when Smart Missiles is unlocked and otherwise falls back to a base damage value.',
      tags: ['ultimate weapons', 'smart missiles', 'spotlight missiles', 'spotlight'],
      paragraphs: [
        'Smart Missiles and Spotlight Missiles Interaction. Spotlight Missiles uses Smart Missiles damage when Smart Missiles is unlocked; otherwise Spotlight Missiles falls back to the base damage value of 14x.',
        interactionsParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_smart_missiles_damage_scaling_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Smart Missiles Damage Scaling',
      title: 'Smart Missiles Damage Scaling Interactions',
      disambiguation: 'This chunk describes the interaction between Smart Missiles, Ultimate Weapons, Critical Factor, Super Crit Chance, and Ultimate Weapon Damage, not the individual mechanics. It is not the global Ultimate Weapon damage formula chunk.',
      data_source: [smDataSource, `${smDataSource}#Formula`, `${smDataSource}#Interactions`],
      mechanics: ['Smart Missiles', 'Ultimate Weapons', 'Critical Factor', 'Super Crit Chance', 'Ultimate Weapon Damage'],
      interaction_type: 'multiplicative',
      interaction_summary: 'Smart Missiles inherits shared Ultimate Weapon damage scaling from crit, super crit, and global Ultimate Weapon damage bonuses.',
      tags: ['ultimate weapons', 'smart missiles', 'critical factor', 'super crit', 'ultimate weapon damage'],
      paragraphs: [
        'Smart Missiles Damage Scaling Interactions. Smart Missiles uses the shared Ultimate Weapons damage formula. Critical Factor, Super Crit Chance, and Ultimate Weapon Damage therefore all contribute to Smart Missiles scaling through that shared Ultimate Weapons path.',
        formulaParagraph,
        interactionsParagraph,
      ],
    }),
  ]
}

function buildDeathWaveRelationalChunks(entry: UltimateWeaponDeterministicEntry): KBChunkRecord[] {
  const deathWaveEntry = getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave')
  const dwDataSource = deathWaveEntry.data_source
  const formulaParagraph = formatSectionParagraph(entry, 'Formula') ?? ''
  const modulesParagraph = formatSectionParagraph(entry, 'Modules') ?? ''
  const interactionsParagraph = formatSectionParagraph(entry, 'Interactions') ?? ''
  const perksParagraph = formatSectionParagraph(entry, 'Perks') ?? ''
  const uwPlusParagraph = formatSectionParagraph(entry, 'Ultimate Weapon Plus') ?? ''

  return [
    buildRelationalKbChunk({
      chunk_id: 'uw_death_wave_kill_wall_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Death Wave and Kill Wall',
      title: 'Death Wave and Kill Wall Interaction',
      disambiguation: 'This chunk describes the interaction between Death Wave and the Kill Wall Ultimate Weapon Plus row, not the Death Wave mechanic by itself. It is not a scaling recommendation.',
      data_source: [dwDataSource, `${dwDataSource}#Ultimate Weapon Plus`],
      mechanics: ['Death Wave', 'Kill Wall', 'Effect Waves'],
      interaction_type: 'additive',
      interaction_summary: 'Kill Wall additively increases the Death Wave damage store based on Effect Wave hits.',
      tags: ['ultimate weapons', 'death wave', 'kill wall', 'effect waves'],
      paragraphs: [
        'Death Wave and Kill Wall Interaction. Kill Wall is the Death Wave Ultimate Weapon Plus row, and Effect Waves are the hits that additively increase the Death Wave damage store.',
        uwPlusParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_death_wave_multiverse_nexus_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Death Wave and Multiverse Nexus',
      title: 'Death Wave and Multiverse Nexus Interaction',
      disambiguation: 'This chunk describes the interaction between Death Wave and the Multiverse Nexus unique module, not the Death Wave mechanic by itself. It is not a full sync guide.',
      data_source: [dwDataSource, `${dwDataSource}#Interactions`],
      mechanics: ['Death Wave', 'Black Hole', 'Golden Tower', 'Multiverse Nexus'],
      interaction_type: 'cross_system',
      interaction_summary: 'Multiverse Nexus synchronizes Death Wave with Black Hole and Golden Tower and replaces their cooldowns with a shared averaged cooldown.',
      tags: ['ultimate weapons', 'death wave', 'multiverse nexus', 'black hole', 'golden tower'],
      paragraphs: [
        'Death Wave and Multiverse Nexus Interaction. Multiverse Nexus synchronizes Death Wave with Black Hole and Golden Tower and sets their shared cooldown to the average of the three with a rarity-based modifier.',
        interactionsParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_death_wave_galaxy_compressor_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Death Wave and Galaxy Compressor',
      title: 'Death Wave and Galaxy Compressor Interaction',
      disambiguation: 'This chunk describes the interaction between Death Wave and Galaxy Compressor, not the Death Wave mechanic by itself. It is not a module ranking.',
      data_source: [dwDataSource, `${dwDataSource}#Interactions`, `${dwDataSource}#Modules`],
      mechanics: ['Death Wave', 'Galaxy Compressor'],
      interaction_type: 'conditional',
      interaction_summary: 'Galaxy Compressor reduces Death Wave cooldown on package pickup.',
      tags: ['ultimate weapons', 'death wave', 'galaxy compressor', 'cooldown', 'module'],
      paragraphs: [
        'Death Wave and Galaxy Compressor Interaction. Galaxy Compressor is not a dedicated Death Wave core unique module, but it still reduces Death Wave cooldown on package pickup.',
        modulesParagraph,
        interactionsParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_death_wave_damage_scaling_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Death Wave Damage Scaling',
      title: 'Death Wave Damage Scaling Interactions',
      disambiguation: 'This chunk describes the interaction between Death Wave, Ultimate Weapons, Critical Factor, Super Crit Chance, and Ultimate Weapon Damage, not the individual mechanics. It is not the global Ultimate Weapon damage formula chunk.',
      data_source: [dwDataSource, `${dwDataSource}#Formula`, `${dwDataSource}#Interactions`],
      mechanics: ['Death Wave', 'Ultimate Weapons', 'Critical Factor', 'Super Crit Chance', 'Ultimate Weapon Damage'],
      interaction_type: 'multiplicative',
      interaction_summary: 'Death Wave inherits shared Ultimate Weapon damage scaling from crit, super crit, and global Ultimate Weapon damage bonuses.',
      tags: ['ultimate weapons', 'death wave', 'critical factor', 'super crit', 'ultimate weapon damage'],
      paragraphs: [
        'Death Wave Damage Scaling Interactions. Death Wave uses the shared Ultimate Weapons damage formula while consuming its own persistent damage pool over time. Critical Factor, Super Crit Chance, and Ultimate Weapon Damage therefore all contribute to Death Wave scaling through that shared Ultimate Weapons path.',
        formulaParagraph,
        interactionsParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_death_wave_random_uw_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Death Wave and Random Ultimate Weapon Perk',
      title: 'Death Wave Random Ultimate Weapon Perk Interaction',
      disambiguation: 'This chunk describes the interaction between Death Wave and the Random Ultimate Weapon perk version, not the Death Wave mechanic by itself. It is not a perk-tier recommendation.',
      data_source: [dwDataSource, `${dwDataSource}#Perks`],
      mechanics: ['Death Wave', 'Random Ultimate Weapon Perk'],
      interaction_type: 'conditional',
      interaction_summary: 'The random-perk version of Death Wave keeps only part of the full Effect Wave utility set.',
      tags: ['ultimate weapons', 'death wave', 'random ultimate weapon perk', 'perks'],
      paragraphs: [
        'Death Wave Random Ultimate Weapon Perk Interaction. The Random Ultimate Weapon version of Death Wave keeps the base health bonus, coin bonus, and damage amplification, but does not include the Cell Bonus or Armor Stripping features.',
        perksParagraph,
      ],
    }),
  ]
}

function buildChronoFieldRelationalChunks(entry: UltimateWeaponDeterministicEntry): KBChunkRecord[] {
  const chronoFieldEntry = getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chrono Field')
  const cfDataSource = chronoFieldEntry.data_source
  const interactionsParagraph = formatSectionParagraph(entry, 'Interactions') ?? ''
  const modulesParagraph = formatSectionParagraph(entry, 'Modules') ?? ''
  const uwPlusParagraph = formatSectionParagraph(entry, 'Ultimate Weapon Plus') ?? ''

  return [
    buildRelationalKbChunk({
      chunk_id: 'uw_chrono_field_chrono_loop_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Chrono Field and Chrono Loop',
      title: 'Chrono Field and Chrono Loop Interaction',
      disambiguation: 'This chunk describes the interaction between Chrono Field and the Chrono Loop Ultimate Weapon Plus row, not the Chrono Field mechanic by itself. It is not a motion-optimization guide.',
      data_source: [cfDataSource, `${cfDataSource}#Ultimate Weapon Plus`],
      mechanics: ['Chrono Field', 'Chrono Loop'],
      interaction_type: 'conditional',
      interaction_summary: 'Chrono Loop adds a tangential pull that makes enemies spiral around the tower while they remain inside Chrono Field.',
      tags: ['ultimate weapons', 'chrono field', 'chrono loop'],
      paragraphs: [
        'Chrono Field and Chrono Loop Interaction. Chrono Loop is the Chrono Field Ultimate Weapon Plus row and adds tangential motion so enemies affected by Chrono Field spiral around the tower while approaching.',
        uwPlusParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_chrono_field_galaxy_compressor_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Chrono Field and Galaxy Compressor',
      title: 'Chrono Field and Galaxy Compressor Interaction',
      disambiguation: 'This chunk describes the interaction between Chrono Field and Galaxy Compressor, not the Chrono Field mechanic by itself. It is not a module ranking.',
      data_source: [cfDataSource, `${cfDataSource}#Interactions`, `${cfDataSource}#Modules`],
      mechanics: ['Chrono Field', 'Galaxy Compressor'],
      interaction_type: 'conditional',
      interaction_summary: 'Galaxy Compressor reduces Chrono Field cooldown on package pickup even though Chrono Field has no dedicated core unique module.',
      tags: ['ultimate weapons', 'chrono field', 'galaxy compressor', 'cooldown', 'module'],
      paragraphs: [
        'Chrono Field and Galaxy Compressor Interaction. Chrono Field does not have a dedicated core unique module, but Galaxy Compressor still reduces its cooldown on package pickup.',
        modulesParagraph,
        interactionsParagraph,
      ],
    }),
  ]
}

function buildInnerLandMinesRelationalChunks(entry: UltimateWeaponDeterministicEntry): KBChunkRecord[] {
  const innerLandMinesEntry = getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Inner Land Mines')
  const ilmDataSource = innerLandMinesEntry.data_source
  const formulaParagraph = formatSectionParagraph(entry, 'Formula') ?? ''
  const modulesParagraph = formatSectionParagraph(entry, 'Modules') ?? ''
  const interactionsParagraph = formatSectionParagraph(entry, 'Interactions') ?? ''
  const uwPlusParagraph = formatSectionParagraph(entry, 'Ultimate Weapon Plus') ?? ''

  return [
    buildRelationalKbChunk({
      chunk_id: 'uw_inner_land_mines_charged_mine_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Inner Land Mines and Charged Mine',
      title: 'Inner Land Mines and Charged Mine Interaction',
      disambiguation: 'This chunk describes the interaction between Inner Land Mines and the Charged Mine Ultimate Weapon Plus row, not the Inner Land Mines mechanic by itself. It is not a scaling recommendation.',
      data_source: [ilmDataSource, `${ilmDataSource}#Ultimate Weapon Plus`],
      mechanics: ['Inner Land Mines', 'Charged Mine'],
      interaction_type: 'scaling',
      interaction_summary: 'Charged Mine increases each active mine’s damage over time until that specific mine detonates.',
      tags: ['ultimate weapons', 'inner land mines', 'charged mine'],
      paragraphs: [
        'Inner Land Mines and Charged Mine Interaction. Charged Mine is the Inner Land Mines Ultimate Weapon Plus row and increases each active mine’s damage every second until that mine detonates.',
        uwPlusParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_inner_land_mines_magnetic_hook_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Inner Land Mines and Magnetic Hook',
      title: 'Inner Land Mines and Magnetic Hook Interaction',
      disambiguation: 'This chunk describes the interaction between Inner Land Mines and the Magnetic Hook unique module, not the Inner Land Mines mechanic by itself. It is not a module ranking.',
      data_source: [ilmDataSource, `${ilmDataSource}#Modules`],
      mechanics: ['Inner Land Mines', 'Magnetic Hook'],
      interaction_type: 'synergy',
      interaction_summary: 'Magnetic Hook converts Inner Land Mines into triggered boss and elite responses when targets enter tower range.',
      tags: ['ultimate weapons', 'inner land mines', 'magnetic hook', 'module'],
      paragraphs: [
        'Inner Land Mines and Magnetic Hook Interaction. Magnetic Hook is the dedicated Inner Land Mines unique module hook and fires Inner Land Mines at bosses entering tower range, with a separate elite trigger chance.',
        modulesParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_inner_land_mines_space_displacer_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Inner Land Mines and Space Displacer',
      title: 'Inner Land Mines and Space Displacer Interaction',
      disambiguation: 'This chunk describes the interaction between Inner Land Mines and Space Displacer, not the Inner Land Mines mechanic by itself. It is not a standalone landmine-system chunk.',
      data_source: [ilmDataSource, `${ilmDataSource}#Interactions`, `${ilmDataSource}#Modules`],
      mechanics: ['Inner Land Mines', 'Space Displacer', 'Land Mines'],
      interaction_type: 'cross_system',
      interaction_summary: 'Space Displacer can convert spawned landmines into autonomous Inner Land Mines.',
      tags: ['ultimate weapons', 'inner land mines', 'space displacer', 'land mines'],
      paragraphs: [
        'Inner Land Mines and Space Displacer Interaction. Space Displacer is an Armor unique module rather than a Core unique module, and it can convert spawned landmines into autonomous Inner Land Mines.',
        modulesParagraph,
        interactionsParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_inner_land_mines_galaxy_compressor_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Inner Land Mines and Galaxy Compressor',
      title: 'Inner Land Mines and Galaxy Compressor Interaction',
      disambiguation: 'This chunk describes the interaction between Inner Land Mines and Galaxy Compressor, not the Inner Land Mines mechanic by itself. It is not a module ranking.',
      data_source: [ilmDataSource, `${ilmDataSource}#Interactions`, `${ilmDataSource}#Modules`],
      mechanics: ['Inner Land Mines', 'Galaxy Compressor'],
      interaction_type: 'conditional',
      interaction_summary: 'Galaxy Compressor reduces Inner Land Mines cooldown on package pickup.',
      tags: ['ultimate weapons', 'inner land mines', 'galaxy compressor', 'cooldown', 'module'],
      paragraphs: [
        'Inner Land Mines and Galaxy Compressor Interaction. Galaxy Compressor is not a dedicated Inner Land Mines core unique module, but it still reduces Inner Land Mines cooldown on package pickup.',
        modulesParagraph,
        interactionsParagraph,
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_inner_land_mines_damage_scaling_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Inner Land Mines Damage Scaling',
      title: 'Inner Land Mines Damage Scaling Interactions',
      disambiguation: 'This chunk describes the interaction between Inner Land Mines, Ultimate Weapons, Critical Factor, Super Crit Chance, and Ultimate Weapon Damage, not the individual mechanics. It is not the global Ultimate Weapon damage formula chunk.',
      data_source: [ilmDataSource, `${ilmDataSource}#Formula`, `${ilmDataSource}#Interactions`],
      mechanics: ['Inner Land Mines', 'Ultimate Weapons', 'Critical Factor', 'Super Crit Chance', 'Ultimate Weapon Damage'],
      interaction_type: 'multiplicative',
      interaction_summary: 'Inner Land Mines inherits shared Ultimate Weapon damage scaling from crit, super crit, and global Ultimate Weapon damage bonuses.',
      tags: ['ultimate weapons', 'inner land mines', 'critical factor', 'super crit', 'ultimate weapon damage'],
      paragraphs: [
        'Inner Land Mines Damage Scaling Interactions. Inner Land Mines uses the shared Ultimate Weapons damage formula. Critical Factor, Super Crit Chance, and Ultimate Weapon Damage therefore all contribute to Inner Land Mines scaling through that shared Ultimate Weapons path.',
        formulaParagraph,
        interactionsParagraph,
      ],
    }),
  ]
}

function readDeterministicDisambiguation(entry: UltimateWeaponDeterministicEntry | undefined, fallback: string): string {
  const value = entry?.sections.Disambiguation
  return value ? value.replace(/\n+/g, ' ') : fallback
}

function ensureAtomicDisambiguation(value: string): string {
  if (/mechanic itself, not its interactions/i.test(value)) {
    return value
  }

  return `${value} This chunk describes the mechanic itself, not its interactions.`
}

export function buildUltimateWeaponsCanonicalKbChunks(): KBChunkRecord[] {
  const sourceDocument = loadUltimateWeaponsSourceDocument()
  const entryByMechanic = new Map(sourceDocument.deterministicEntries.map(entry => [entry.mechanic, entry]))
  const overviewEntry = entryByMechanic.get('Ultimate Weapons')
  const weaponRoster = sourceDocument.deterministicEntries
    .map(entry => entry.mechanic)
    .filter(mechanic => mechanic !== 'Ultimate Weapons')

  if (!overviewEntry) {
    throw new Error('Ultimate Weapons structured source is missing the overview mechanic entry.')
  }

  const ultimateWeaponsEntry = getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'list')
  const criticalFactorEntry = getRequiredNamingRegistryEntryBySource('workshop', 'Critical Factor')
  const superCritChanceEntry = getRequiredNamingRegistryEntryBySource('workshop', 'Super Crit Chance')
  const goldenTowerStructuredEntry = entryByMechanic.get('Golden Tower')
  const poisonSwampStructuredEntry = entryByMechanic.get('Poison Swamp')
  const blackHoleStructuredEntry = entryByMechanic.get('Black Hole')
  const spotlightStructuredEntry = entryByMechanic.get('Spotlight')
  const chainLightningStructuredEntry = entryByMechanic.get('Chain Lightning')
  const smartMissilesStructuredEntry = entryByMechanic.get('Smart Missiles')
  const deathWaveStructuredEntry = entryByMechanic.get('Death Wave')
  const chronoFieldStructuredEntry = entryByMechanic.get('Chrono Field')
  const innerLandMinesStructuredEntry = entryByMechanic.get('Inner Land Mines')

  const weaponChunks = sourceDocument.deterministicEntries
    .filter(entry => entry.mechanic !== 'Ultimate Weapons')
    .map(entry => {
      const namingEntry = getRequiredNamingRegistryEntryBySource('ultimate_weapons', entry.mechanic)
      const paragraphs = buildOrderedParagraphs(entry, [
        'Basic Upgrades',
        'Costs',
        'Ultimate Weapon Plus',
        'Formula',
        'Workshop',
        'Enhancements',
        'Behavior',
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

      return buildAtomicKbChunk({
        chunk_id: createWeaponChunkId(entry.mechanic),
        source: 'Ultimate Weapons Structured Reference',
        section: 'Ultimate Weapons',
        topic: entry.mechanic,
        title: `${entry.mechanic} Ultimate Weapon`,
        disambiguation: ensureAtomicDisambiguation(readDeterministicDisambiguation(entry, `This chunk is about ${entry.mechanic} as an individual Ultimate Weapon, not about the overall Ultimate Weapon system, unrelated workshop stats, or another weapon's UW+ effect.`)),
        data_source: namingEntry.data_source,
        is_base_mechanic: namingEntry.is_base_mechanic,
        mechanics: [entry.mechanic],
        tags: ['ultimate weapons', 'uw', entry.mechanic.toLowerCase(), ...extractAliases(entry)],
        paragraphs,
      })
    })

  return [
    buildAtomicKbChunk({
      chunk_id: 'uw_overview_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Ultimate Weapons Overview',
      title: 'Ultimate Weapons Overview',
      disambiguation: ensureAtomicDisambiguation(readDeterministicDisambiguation(overviewEntry, 'This chunk is about the Ultimate Weapons mechanic itself, not its interactions. It is not about individual weapon stat tables, Ultimate Weapon Plus abilities, or exact purchase costs.')),
      data_source: ultimateWeaponsEntry.data_source,
      is_base_mechanic: ultimateWeaponsEntry.is_base_mechanic,
      mechanics: ['Ultimate Weapons'],
      tags: ['ultimate weapons', 'uw', 'power stones', 'cooldown', 'activation'],
      paragraphs: [
        ...sourceDocument.overviewParagraphs,
        ...buildOrderedParagraphs(overviewEntry, [
          'Basic Upgrades',
          'Costs',
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
        ]),
      ],
    }),
    buildAtomicKbChunk({
      chunk_id: 'uw_purchasing_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Purchasing Rules',
      title: 'Purchasing Ultimate Weapons',
      disambiguation: 'This chunk is about the Ultimate Weapon Purchasing Rules mechanic itself, not its interactions. It is not about cooldown behavior, in-run toggling, or Ultimate Weapon Plus abilities.',
      data_source: ultimateWeaponsEntry.data_source,
      is_base_mechanic: ultimateWeaponsEntry.is_base_mechanic,
      mechanics: ['Ultimate Weapons'],
      tags: ['ultimate weapons', 'uw', 'power stones', 'cost', 'purchasing'],
      paragraphs: [
        formatSectionParagraph(overviewEntry, 'Workshop') ?? '',
        formatSectionParagraph(overviewEntry, 'Enhancements') ?? '',
      ],
    }),
    buildAtomicKbChunk({
      chunk_id: 'uw_roster_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Ultimate Weapons Roster',
      title: 'All Ultimate Weapons Roster',
      disambiguation: 'This chunk describes the full Ultimate Weapons roster mechanic itself, not its interactions. It is not a pick-order guide, a UW+ list, or a stat comparison table.',
      data_source: ultimateWeaponsEntry.data_source,
      is_base_mechanic: ultimateWeaponsEntry.is_base_mechanic,
      mechanics: ['Ultimate Weapons'],
      tags: ['ultimate weapons', 'uw', 'roster', 'list', 'all ultimate weapons'],
      paragraphs: [
        `The current Ultimate Weapons roster is: ${weaponRoster.join(', ')}.`,
        'This roster names base Ultimate Weapons only. Ultimate Weapon Plus rows such as Golden Combo or Chrono Loop are upgrades attached to a weapon, not separate Ultimate Weapons.',
      ],
    }),
    buildAtomicKbChunk({
      chunk_id: 'uw_usage_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Usage Rules',
      title: 'Using Ultimate Weapons in a Run',
      disambiguation: 'This chunk is about the Ultimate Weapon Usage Rules mechanic itself, not its interactions. It is not about Power Stone purchase offers, damage formulas, or Ultimate Weapon Plus unlock requirements.',
      data_source: ultimateWeaponsEntry.data_source,
      is_base_mechanic: ultimateWeaponsEntry.is_base_mechanic,
      mechanics: ['Ultimate Weapons'],
      tags: ['ultimate weapons', 'uw', 'cooldown', 'toggle', 'usage'],
      paragraphs: [
        formatSectionParagraph(overviewEntry, 'Workshop') ?? '',
        formatSectionParagraph(overviewEntry, 'Perks') ?? '',
        formatSectionParagraph(overviewEntry, 'Footguns') ?? '',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'uw_damage_formula_01',
      source: 'Ultimate Weapons Structured Reference',
      section: 'Ultimate Weapons',
      topic: 'Damage Formula',
      title: 'Ultimate Weapon Damage Formula',
      disambiguation: 'This chunk describes the interaction between Ultimate Weapons, Critical Factor, and Super Crit Chance, not the individual mechanics. It is not about purchase costs, toggle rules, or non-damaging Ultimate Weapon effects.',
      data_source: [
        ultimateWeaponsEntry.data_source,
        criticalFactorEntry.data_source,
        superCritChanceEntry.data_source,
      ],
      mechanics: ['Ultimate Weapons', 'Critical Factor', 'Super Crit Chance'],
      interaction_type: 'multiplicative',
      interaction_summary: 'Damage-dealing Ultimate Weapons multiply base damage by critical and super critical workshop factors.',
      tags: ['ultimate weapons', 'uw', 'damage formula', 'critical', 'super crit'],
      paragraphs: [
        formatSectionParagraph(overviewEntry, 'Formula') ?? '',
        formatSectionParagraph(overviewEntry, 'Cards') ?? '',
        formatSectionParagraph(overviewEntry, 'Modules') ?? '',
        formatSectionParagraph(overviewEntry, 'Relics') ?? '',
        formatSectionParagraph(overviewEntry, 'Vault') ?? '',
      ],
    }),
    ...(goldenTowerStructuredEntry ? buildGoldenTowerRelationalChunks(goldenTowerStructuredEntry) : []),
    ...(poisonSwampStructuredEntry ? buildPoisonSwampRelationalChunks(poisonSwampStructuredEntry) : []),
    ...(blackHoleStructuredEntry ? buildBlackHoleRelationalChunks(blackHoleStructuredEntry) : []),
    ...(spotlightStructuredEntry ? buildSpotlightRelationalChunks(spotlightStructuredEntry) : []),
    ...(chainLightningStructuredEntry ? buildChainLightningRelationalChunks(chainLightningStructuredEntry) : []),
    ...(smartMissilesStructuredEntry ? buildSmartMissilesRelationalChunks(smartMissilesStructuredEntry) : []),
    ...(deathWaveStructuredEntry ? buildDeathWaveRelationalChunks(deathWaveStructuredEntry) : []),
    ...(chronoFieldStructuredEntry ? buildChronoFieldRelationalChunks(chronoFieldStructuredEntry) : []),
    ...(innerLandMinesStructuredEntry ? buildInnerLandMinesRelationalChunks(innerLandMinesStructuredEntry) : []),
    ...weaponChunks,
  ]
}
