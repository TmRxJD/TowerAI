import {
  FAQ_ABBREVIATION_FACTS,
  FAQ_COIN_BREAKOUT_FACTS,
  FAQ_COIN_OVERLAP_EXAMPLE,
  FAQ_HEAT_UP_FACTS,
  FAQ_HEAT_UP_MULTIPLIER_PER_HIT,
  FAQ_NEGATIVE_BREAKOUT_FACTS,
  FAQ_OVERVIEW_FACTS,
  FAQ_PERK_MATH_FACTS,
  FAQ_THEME_STACKING_FACTS,
  FAQ_UW_SELECTION_FACTS,
  FAQ_WALL_READINESS_FACTS,
  FAQ_WALL_READINESS_GUIDANCE,
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
  { mechanic: 'FAQ', chunkId: 'faq_overview_01', title: 'FAQ Overview', tags: ['faq', 'interpretation', 'bugs'] },
  { mechanic: 'Which UW Should I Select?', chunkId: 'faq_uw_selection_01', title: 'FAQ: Which UW Should I Select?', tags: ['faq', 'ultimate weapons', 'guides'] },
  { mechanic: 'Why Do Coin Breakouts Not Equal Total Coins?', chunkId: 'faq_coin_breakouts_01', title: 'FAQ: Why Coin Breakouts Do Not Equal Total Coins', tags: ['faq', 'coins', 'golden tower', 'black hole', 'stats page'] },
  { mechanic: 'Why Is (BH, GB, SL) Negative?', chunkId: 'faq_negative_breakouts_01', title: 'FAQ: Why BH, GB, or SL Can Look Negative', tags: ['faq', 'black hole', 'coin bot', 'spotlight', 'visual bug'] },
  { mechanic: 'Is Perk Math Correct in Game?', chunkId: 'faq_perk_math_01', title: 'FAQ: Is Perk Math Correct in Game?', tags: ['faq', 'perks', 'math'] },
  { mechanic: 'Do Themes or Skins Stack?', chunkId: 'faq_theme_stacking_01', title: 'FAQ: Do Themes or Skins Stack?', tags: ['faq', 'themes', 'skins', 'stacking'] },
  { mechanic: 'What Does a Certain Abbreviation Mean?', chunkId: 'faq_abbreviations_01', title: 'FAQ: What Does a Certain Abbreviation Mean?', tags: ['faq', 'abbreviations', 'glossary'] },
  { mechanic: 'When Should I Get Wall?', chunkId: 'faq_wall_timing_01', title: 'FAQ: When Should I Get Wall?', tags: ['faq', 'wall', 'coins', 'labs'] },
  { mechanic: 'Why Did I Die with Enough Absolute Defense?', chunkId: 'faq_heat_up_01', title: 'FAQ: Why Did I Die with Enough Absolute Defense?', tags: ['faq', 'defense absolute', 'thorns', 'heat up'] },
]

function buildCoinBreakoutParagraphs(): string[] {
  const example = FAQ_COIN_OVERLAP_EXAMPLE
  return [
    ...FAQ_COIN_BREAKOUT_FACTS,
    `Example: start with ${example.baseCoins} coins, ${example.goldenTowerMultiplier}x Golden Tower, and ${example.blackHoleMultiplier}x Black Hole with full overlap. Total coins = ${example.baseCoins} x ${example.goldenTowerMultiplier} x ${example.blackHoleMultiplier} = ${example.totalCoins.toLocaleString()}.`,
    `Without Golden Tower the same kill window would be ${example.coinsWithoutGoldenTower.toLocaleString()} coins, so Golden Tower gets credited with ${example.coinsAttributedToGoldenTower.toLocaleString()}. Without Black Hole it would be ${example.coinsWithoutBlackHole.toLocaleString()} coins, so Black Hole gets credited with ${example.coinsAttributedToBlackHole.toLocaleString()}.`,
    `If those attributed values are added together, the result is ${example.combinedAttributionIfAdded.toLocaleString()} even though the run only earned ${example.totalCoins.toLocaleString()}, which is exactly why overlapping breakout lines should not be treated as independent totals.`,
    'The FAQ also notes that real runs are messier because some kills happen with only one source active while Spotlight, Death Wave, and Golden Bot style effects can widen the mismatch further.',
  ]
}

function buildWallTimingParagraphs(): string[] {
  return [
    ...FAQ_WALL_READINESS_FACTS,
    `The readiness guidance calls for ${FAQ_WALL_READINESS_GUIDANCE.dailyCoinIncome} and at least ${FAQ_WALL_READINESS_GUIDANCE.minimumLabSlots} free lab slots so Wall upgrades do not stall the rest of the account.`,
    `Priority support labs are ${FAQ_WALL_READINESS_GUIDANCE.priorityLabs.join(', ')}.`,
    `The FAQ frames Wall as a ${FAQ_WALL_READINESS_GUIDANCE.longTermInvestmentLabel} investment rather than an early cheap unlock.`,
  ]
}

function buildHeatUpParagraphs(): string[] {
  return [
    ...FAQ_HEAT_UP_FACTS,
    `The specific FAQ number is a ${FAQ_HEAT_UP_MULTIPLIER_PER_HIT}x damage multiplier per surviving hit.`,
  ]
}

function buildAtomicParagraphs(mechanic: string): string[] {
  switch (mechanic) {
    case 'FAQ':
      return [...FAQ_OVERVIEW_FACTS]
    case 'Which UW Should I Select?':
      return [...FAQ_UW_SELECTION_FACTS]
    case 'Why Do Coin Breakouts Not Equal Total Coins?':
      return buildCoinBreakoutParagraphs()
    case 'Why Is (BH, GB, SL) Negative?':
      return [...FAQ_NEGATIVE_BREAKOUT_FACTS]
    case 'Is Perk Math Correct in Game?':
      return [...FAQ_PERK_MATH_FACTS]
    case 'Do Themes or Skins Stack?':
      return [...FAQ_THEME_STACKING_FACTS]
    case 'What Does a Certain Abbreviation Mean?':
      return [...FAQ_ABBREVIATION_FACTS]
    case 'When Should I Get Wall?':
      return buildWallTimingParagraphs()
    case 'Why Did I Die with Enough Absolute Defense?':
      return buildHeatUpParagraphs()
    default:
      return []
  }
}

export function buildFaqCanonicalKbChunks(): KBChunkRecord[] {
  const faqEntry = getRequiredNamingRegistryEntryBySource('faq', 'faq')

  const atomicChunks = SYSTEM_SPECS.map(spec => {
    const namingEntry = spec.mechanic === 'FAQ'
      ? faqEntry
      : getRequiredNamingRegistryEntryBySource('faq', spec.mechanic)

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'FAQ Platform Reference',
      section: 'FAQ',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about unrelated UI bugs, off-topic strategy advice, or tracker implementation details outside this answer.`,
      data_source: namingEntry.data_source,
      is_base_mechanic: spec.mechanic === 'FAQ',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: buildAtomicParagraphs(spec.mechanic),
    })
  })

  return [
    ...atomicChunks,
    buildRelationalKbChunk({
      chunk_id: 'faq_uw_selection_guides_01',
      source: 'FAQ Platform Reference',
      section: 'FAQ',
      topic: 'Which UW Should I Select? with Ultimate Weapon Pick Order Guide',
      title: 'Which UW Should I Select? with Ultimate Weapon Pick Order Guide',
      disambiguation: 'This chunk is about the interaction between the FAQ UW-selection answer and the existing Ultimate Weapon guide content, not the individual mechanics. It is not a new pick-order recommendation beyond the linked guide context.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('faq', 'Which UW Should I Select?').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'Ultimate Weapon Pick Order Guide Overview').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'list').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Which UW Should I Select?', 'Ultimate Weapon Pick Order Guide Overview', 'Ultimate Weapons'],
      interaction_type: 'cross_system',
        interaction_summary: 'The FAQ answer is a redirect layer that points players into Ultimate Weapon Pick Order Guide Overview and the broader Ultimate Weapons progression guidance rather than duplicating it.',
      tags: ['faq', 'ultimate weapons', 'guides'],
      paragraphs: [
          'Which UW Should I Select? is intentionally short because the FAQ treats it as an entry point into Ultimate Weapon Pick Order Guide Overview rather than a standalone decision tree.',
          'That is consistent with the rest of the knowledge base, where Ultimate Weapon Pick Order Guide Overview and Ultimate Weapons both frame picks as permanent long-term progression decisions with synergy and cost-order consequences.',
          'The FAQ therefore works best as a redirect to Ultimate Weapon Pick Order Guide Overview instead of an isolated one-paragraph pick rule.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'faq_coin_breakouts_currency_overlap_01',
      source: 'FAQ Platform Reference',
      section: 'FAQ',
      topic: 'Why Do Coin Breakouts Not Equal Total Coins? with Coins, Golden Tower, Black Hole, Spotlight, Death Wave, and Coin Bot',
      title: 'Why Do Coin Breakouts Not Equal Total Coins? with Coins, Golden Tower, Black Hole, Spotlight, Death Wave, and Coin Bot',
      disambiguation: 'This chunk is about the interaction between the FAQ coin-breakout answer and overlapping coin systems, not the individual mechanics. It is not a bug report about lost coins or a replacement for full economy guides.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('faq', 'Why Do Coin Breakouts Not Equal Total Coins?').data_source,
        getRequiredNamingRegistryEntryBySource('currency', 'Coins').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Spotlight').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave').data_source,
        getRequiredNamingRegistryEntryBySource('bots', 'Coin Bot').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Why Do Coin Breakouts Not Equal Total Coins?', 'Coins', 'Golden Tower', 'Black Hole', 'Spotlight', 'Death Wave', 'Coin Bot'],
      interaction_type: 'multiplicative',
      interaction_summary: 'The FAQ answer exists because overlapping coin multipliers can all claim attribution for the same kill window, so breakout lines duplicate value instead of partitioning it cleanly.',
      tags: ['faq', 'coins', 'golden tower', 'black hole', 'spotlight', 'death wave', 'coin bot'],
      paragraphs: [
        'Why Do Coin Breakouts Not Equal Total Coins? is fundamentally an overlap-attribution problem rather than a coin-loss bug.',
        'Golden Tower, Black Hole, Spotlight, Death Wave, and Coin Bot can all contribute to the same kill window, so each breakout line can inherit value from a shared stack instead of owning a unique slice of the total alone.',
        'That is why the FAQ example can show 37,000 attributed coins from breakout lines while the actual total earned remains 20,000.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'faq_negative_breakouts_visual_bug_01',
      source: 'FAQ Platform Reference',
      section: 'FAQ',
      topic: 'Why Is (BH, GB, SL) Negative? with Coin Breakout Display',
      title: 'Why Is (BH, GB, SL) Negative? with Coin Breakout Display',
      disambiguation: 'This chunk is about the interaction between the FAQ negative-breakout answer and the coin-breakout display context, not the individual mechanics. It is not a claim that Black Hole, Coin Bot, or Spotlight become harmful mechanics.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('faq', 'Why Is (BH, GB, SL) Negative?').data_source,
        getRequiredNamingRegistryEntryBySource('faq', 'Why Do Coin Breakouts Not Equal Total Coins?').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Why Is (BH, GB, SL) Negative?', 'Why Do Coin Breakouts Not Equal Total Coins?'],
      interaction_type: 'cross_system',
      interaction_summary: 'The negative BH/GB/SL answer is a display-bug clarification layered on top of an already confusing overlapping breakout system.',
      tags: ['faq', 'visual bug', 'black hole', 'coin bot', 'spotlight'],
      paragraphs: [
        'Why Is (BH, GB, SL) Negative? is a UI clarification, not a gameplay warning.',
        'Because Why Do Coin Breakouts Not Equal Total Coins? already establishes that coin-breakout attribution is non-intuitive when multiple systems overlap, a negative display line can easily look like a real economy loss even when the FAQ says coins earned are unchanged.',
        'The answer therefore belongs next to the breakout-overlap explanation instead of being treated as a separate balance mechanic.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'faq_perk_math_perks_01',
      source: 'FAQ Platform Reference',
      section: 'FAQ',
      topic: 'Is Perk Math Correct in Game? with Perks',
      title: 'Is Perk Math Correct in Game? with Perks',
      disambiguation: 'This chunk is about the interaction between the FAQ perk-math answer and the Perks system, not the individual mechanics. It is not a new perk formula derivation beyond the existing Perks reference.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('faq', 'Is Perk Math Correct in Game?').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'perks').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Is Perk Math Correct in Game?', 'Perks'],
      interaction_type: 'cross_system',
      interaction_summary: 'The FAQ answer is a redirect to the dedicated Perks domain because perk correctness questions depend on the actual perk formulas and pool rules, not a simple yes-or-no line.',
      tags: ['faq', 'perks', 'math'],
      paragraphs: [
        'Is Perk Math Correct in Game? does not try to restate perk formulas in miniature.',
        'Instead, it redirects to Perks because perk correctness depends on additive versus multiplicative behavior, perk pools, perk labs, and run-state context that already live in the dedicated perk reference.',
        'The FAQ answer is therefore acting as a routing layer into the fuller perk explanation.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'faq_themes_stack_themes_01',
      source: 'FAQ Platform Reference',
      section: 'FAQ',
      topic: 'Do Themes or Skins Stack? with Themes',
      title: 'Do Themes or Skins Stack? with Themes',
      disambiguation: 'This chunk is about the interaction between the FAQ theme-stacking answer and the Themes system, not the individual mechanics. It is not a cosmetic fashion recommendation or an event shop inventory note.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('faq', 'Do Themes or Skins Stack?').data_source,
        getRequiredNamingRegistryEntryBySource('themes', 'themes').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Do Themes or Skins Stack?', 'Themes'],
      interaction_type: 'cross_system',
      interaction_summary: 'The FAQ redirects to Themes because ownership-based theme bonuses stack independently of what cosmetic is currently equipped.',
      tags: ['faq', 'themes', 'skins', 'stacking'],
      paragraphs: [
        'Do Themes or Skins Stack? exists because players often confuse equipped cosmetics with owned-bonus accounting.',
        'The Themes domain clarifies that passive coin bonuses come from owned categories, not only from the single theme visibly equipped at the moment.',
        'That makes the FAQ answer a pointer into the actual ownership-and-stacking rules rather than a separate alternate explanation.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'faq_wall_timing_wall_enemies_milestones_01',
      source: 'FAQ Platform Reference',
      section: 'FAQ',
      topic: 'When Should I Get Wall? with Wall Systems, Enemies, and Milestones',
      title: 'When Should I Get Wall? with Wall Systems, Enemies, and Milestones',
      disambiguation: 'This chunk is about the interaction between the FAQ wall-timing answer, wall support systems, enemy heat-up, and wall progression unlocks, not the individual mechanics. It is not a universal one-wave Wall unlock rule for every account.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('faq', 'When Should I Get Wall?').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Wall Health').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Wall Rebuild').data_source,
        getRequiredNamingRegistryEntryBySource('enemies', 'Enemies').data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'milestones').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['When Should I Get Wall?', 'Wall Health', 'Wall Rebuild', 'Enemies', 'Milestones'],
      interaction_type: 'conditional',
      interaction_summary: 'The FAQ wall-timing answer depends on enemy heat-up pressure, the cost of building out the wall support package, and the later milestone/lab investment path needed to make Wall stop being a liability.',
      tags: ['faq', 'wall', 'enemies', 'milestones', 'labs'],
      paragraphs: [
        'When Should I Get Wall? is not answered by the unlock alone because early Wall can become harmful if enemies survive repeated contacts and heat up while the wall support package is still underbuilt.',
        'That is why the FAQ ties readiness to coin income and at least three lab slots, not just to the moment the player is first allowed to start buying Wall Health and Wall Rebuild progress.',
        'Milestone data also shows that core Wall support pieces such as Wall Health, Wall Rebuild, Wall Thorns, Wall Regen, and Wall Fortification arrive over time rather than all at once, which reinforces the FAQ advice to treat Wall as a later investment package instead of an immediate power spike.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'faq_abs_defense_heat_up_enemies_01',
      source: 'FAQ Platform Reference',
      section: 'FAQ',
      topic: 'Why Did I Die with Enough Absolute Defense? with Enemies, Defense Absolute, and Thorns',
      title: 'Why Did I Die with Enough Absolute Defense? with Enemies, Defense Absolute, and Thorns',
      disambiguation: 'This chunk is about the interaction between the FAQ heat-up answer, enemy heat-up behavior, Defense Absolute, and Thorns, not the individual mechanics. It is not a claim that Defense Absolute is bugged or useless in all progression stages.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('faq', 'Why Did I Die with Enough Absolute Defense?').data_source,
        getRequiredNamingRegistryEntryBySource('enemies', 'Enemies').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Defense Absolute').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Thorns').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Why Did I Die with Enough Absolute Defense?', 'Enemies', 'Defense Absolute', 'Thorns'],
      interaction_type: 'scaling',
      interaction_summary: 'Enemy heat-up scales incoming damage upward on repeated surviving hits, so low Thorns can let enemies grow past Defense Absolute expectations even when static tooltip math looks safe.',
      tags: ['faq', 'enemies', 'defense absolute', 'thorns', 'heat up'],
      paragraphs: [
        'Why Did I Die with Enough Absolute Defense? is answered by enemy heat-up, not by a hidden nerf to Defense Absolute.',
        'The Enemies reference already states that shared enemy mechanics include a 4% damage heat-up per hit, and the FAQ applies that rule to the common early-game situation where enemies survive repeated hits because thorn damage is still too low.',
        'In other words, static Defense Absolute can still be overwhelmed if live enemy damage is being repeatedly re-scaled upward faster than the player expects from tooltip-only reading.',
      ],
    }),
  ]
}
