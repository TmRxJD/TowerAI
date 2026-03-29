import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import { loadGuidesSourceDocument } from './guidesSource'

type CoinGuideSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

type EhpGuideSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

type EventGuideSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

type GemsGuideSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

type MedalsGuideSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

type OrbDevoGuideSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

type OrblessGuideSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

type PerksGuideSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

type SmaxDevoGuideSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

type Tier1BeginnerGuideSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

type TierRushingGuideSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

type UltimateWeaponPickOrderGuideSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

const COIN_GUIDE_SPECS: CoinGuideSpec[] = [
  { mechanic: 'Coin Guide Overview', chunkId: 'guides_coin_01', title: 'Coin Guide Overview', tags: ['guides', 'coins', 'economy', 'overview'] },
  { mechanic: 'Coin Guide Coins/Wave', chunkId: 'guides_coin_cpw_01', title: 'Coin Guide Coins / Wave', tags: ['guides', 'coins', 'coins per wave', 'cpw'] },
  { mechanic: 'Coin Guide Coins/Kill', chunkId: 'guides_coin_cpk_01', title: 'Coin Guide Coins / Kill', tags: ['guides', 'coins', 'coins per kill', 'cpk'] },
  { mechanic: 'Coin Guide Multipliers', chunkId: 'guides_coin_multipliers_01', title: 'Coin Guide Multipliers', tags: ['guides', 'coins', 'multipliers', 'golden tower', 'black hole'] },
  { mechanic: 'Coin Guide Syncing', chunkId: 'guides_coin_sync_01', title: 'Coin Guide Syncing', tags: ['guides', 'coins', 'sync', 'golden tower', 'black hole', 'death wave'] },
  { mechanic: 'Coin Guide Coin Sources', chunkId: 'guides_coin_sources_01', title: 'Coin Guide Coins / Kill Sources', tags: ['guides', 'coins', 'coin sources', 'coin bot', 'spotlight', 'relics'] },
  { mechanic: 'Coin Guide Daily Missions', chunkId: 'guides_coin_daily_missions_01', title: 'Coin Guide Daily Missions', tags: ['guides', 'coins', 'daily missions', 'tiers'] },
]

const EHP_GUIDE_SPECS: EhpGuideSpec[] = [
  { mechanic: 'eHP Guide Overview', chunkId: 'guides_ehp_overview_01', title: 'eHP Guide Overview', tags: ['guides', 'ehp', 'effective hp', 'effective health', 'health', 'overview', 'hp build'] },
  { mechanic: 'eHP Guide Starting Setup', chunkId: 'guides_ehp_setup_01', title: 'eHP Guide Starting Setup', tags: ['guides', 'ehp', 'effective hp', 'effective health', 'setup', 'hp setup', 'orbs', 'free upgrades'] },
  { mechanic: 'eHP Guide Workshop Priorities', chunkId: 'guides_ehp_workshop_01', title: 'eHP Guide Workshop Priorities', tags: ['guides', 'ehp', 'effective hp', 'effective health', 'workshop', 'health', 'enemy level skip'] },
  { mechanic: 'eHP Guide Lab Priorities', chunkId: 'guides_ehp_labs_01', title: 'eHP Guide Lab Priorities', tags: ['guides', 'ehp', 'labs', 'orbs', 'black hole'] },
  { mechanic: 'eHP Guide Card Priorities', chunkId: 'guides_ehp_cards_01', title: 'eHP Guide Card Priorities', tags: ['guides', 'ehp', 'cards', 'plasma cannon', 'berserker'] },
  { mechanic: 'eHP Guide Ultimate Weapon Support', chunkId: 'guides_ehp_uws_01', title: 'eHP Guide Ultimate Weapon Support', tags: ['guides', 'ehp', 'ultimate weapons', 'black hole', 'chrono field'] },
  { mechanic: 'eHP Guide Round Triage', chunkId: 'guides_ehp_rounds_01', title: 'eHP Guide Round Triage', tags: ['guides', 'ehp', 'bosses', 'protectors', 'triage'] },
  { mechanic: 'eHP Guide Transition Tools', chunkId: 'guides_ehp_transition_01', title: 'eHP Guide Transition Tools', tags: ['guides', 'ehp', 'transition', 'garlic thorns', 'plasma cannon'] },
]

const EVENT_GUIDE_SPECS: EventGuideSpec[] = [
  { mechanic: 'Event Guide Overview', chunkId: 'guides_event_overview_01', title: 'Event Guide Overview', tags: ['guides', 'events', 'quests', 'medals', 'overview'] },
  { mechanic: 'Event Guide Event Context', chunkId: 'guides_event_context_01', title: 'Event Guide Event Context', tags: ['guides', 'events', 'medals', 'relics', 'shop'] },
  { mechanic: 'Event Guide General Methods', chunkId: 'guides_event_general_01', title: 'Event Guide General Methods', tags: ['guides', 'events', 'wawsis', 'enemy balance', 'random ultimate weapon perk'] },
  { mechanic: 'Event Guide Core Quests', chunkId: 'guides_event_core_01', title: 'Event Guide Core Quests', tags: ['guides', 'events', 'kill quests', 'wave quests'] },
  { mechanic: 'Event Guide Survival Quests', chunkId: 'guides_event_survival_01', title: 'Event Guide Survival Quests', tags: ['guides', 'events', 'defense absolute', 'death defy', 'energy shield'] },
  { mechanic: 'Event Guide Active Quests', chunkId: 'guides_event_active_01', title: 'Event Guide Active Quests', tags: ['guides', 'events', 'demon mode', 'nuke', 'land mines'] },
  { mechanic: 'Event Guide Ultimate Weapon Quests', chunkId: 'guides_event_uw_01', title: 'Event Guide Ultimate Weapon Quests', tags: ['guides', 'events', 'smart missiles', 'spotlight', 'black hole', 'poison swamp', 'chain lightning'] },
]

const GEMS_GUIDE_SPECS: GemsGuideSpec[] = [
  { mechanic: 'Gems Guide Overview', chunkId: 'guides_gems_overview_01', title: 'Gems Guide Overview', tags: ['guides', 'gems', 'overview', 'progression'] },
  { mechanic: 'Gems Guide Lab Slots', chunkId: 'guides_gems_lab_slots_01', title: 'Gems Guide Lab Slots', tags: ['guides', 'gems', 'labs', 'slots'] },
  { mechanic: 'Gems Guide Early Cards and Slots', chunkId: 'guides_gems_cards_01', title: 'Gems Guide Early Cards and Slots', tags: ['guides', 'gems', 'cards', 'slots', 'enemy balance'] },
  { mechanic: 'Gems Guide First Epic Modules', chunkId: 'guides_gems_modules_01', title: 'Gems Guide First Epic Modules', tags: ['guides', 'gems', 'modules', 'epics'] },
  { mechanic: 'Gems Guide Ongoing Spending Loop', chunkId: 'guides_gems_loop_01', title: 'Gems Guide Ongoing Spending Loop', tags: ['guides', 'gems', 'cards', 'modules', 'plasma cannon', 'wave accelerator'] },
  { mechanic: 'Gems Guide Lab Rushing', chunkId: 'guides_gems_rushing_01', title: 'Gems Guide Lab Rushing', tags: ['guides', 'gems', 'labs', 'rushing', 'chrono field'] },
]

const MEDALS_GUIDE_SPECS: MedalsGuideSpec[] = [
  { mechanic: 'Medals Guide Overview', chunkId: 'guides_medals_overview_01', title: 'Medals Guide Overview', tags: ['guides', 'medals', 'overview', 'event shop'] },
  { mechanic: 'Medals Guide Past Relics', chunkId: 'guides_medals_relics_01', title: 'Medals Guide Past Relics', tags: ['guides', 'medals', 'relics', 'reruns'] },
  { mechanic: 'Medals Guide Songs and Themes', chunkId: 'guides_medals_songs_themes_01', title: 'Medals Guide Songs and Themes', tags: ['guides', 'medals', 'songs', 'themes', 'coins'] },
  { mechanic: 'Medals Guide Stones and Gems', chunkId: 'guides_medals_currency_01', title: 'Medals Guide Stones and Gems', tags: ['guides', 'medals', 'stones', 'gems', 'labs'] },
  { mechanic: 'Medals Guide Bot Progression', chunkId: 'guides_medals_bots_01', title: 'Medals Guide Bot Progression', tags: ['guides', 'medals', 'bots', 'unlock costs'] },
  { mechanic: 'Medals Guide Coin Bot Priorities', chunkId: 'guides_medals_coin_bot_01', title: 'Medals Guide Coin Bot Priorities', tags: ['guides', 'medals', 'coin bot', 'golden tower', 'black hole'] },
  { mechanic: 'Medals Guide Later Bot Priorities', chunkId: 'guides_medals_later_bots_01', title: 'Medals Guide Later Bot Priorities', tags: ['guides', 'medals', 'amplify bot', 'thunder bot', 'flame bot'] },
]

const ORB_DEVO_GUIDE_SPECS: OrbDevoGuideSpec[] = [
  { mechanic: 'Orb Devo Guide Overview', chunkId: 'guides_orb_devo_overview_01', title: 'Orb Devo Guide Overview', tags: ['guides', 'orb devo', 'orbdevo', 'devo', 'devo guide', 'overview', 'black hole', 'golden tower'] },
  { mechanic: 'Orb Devo Guide Requirements', chunkId: 'guides_orb_devo_requirements_01', title: 'Orb Devo Guide Requirements', tags: ['guides', 'orb devo', 'orbdevo', 'devo setup', 'range', 'min range', 'minimum range', 'extra orb', 'black hole'] },
  { mechanic: 'Orb Devo Guide Workshop Devo', chunkId: 'guides_orb_devo_workshop_01', title: 'Orb Devo Guide Workshop Devo', tags: ['guides', 'orb devo', 'orbdevo', 'devo setup', 'workshop', 'thorns', 'free upgrades'] },
  { mechanic: 'Orb Devo Guide Cards and Support', chunkId: 'guides_orb_devo_cards_01', title: 'Orb Devo Guide Cards and Support', tags: ['guides', 'orb devo', 'cards', 'death wave', 'spotlight'] },
  { mechanic: 'Orb Devo Guide Run Plan', chunkId: 'guides_orb_devo_run_plan_01', title: 'Orb Devo Guide Run Plan', tags: ['guides', 'orb devo', 'run plan', 'enemy attack level skip', 'blender', 'blender phase', 'blender endgame'] },
  { mechanic: 'Orb Devo Guide Perk Priorities', chunkId: 'guides_orb_devo_perks_01', title: 'Orb Devo Guide Perk Priorities', tags: ['guides', 'orb devo', 'perks', 'perk wave requirement', 'coins'] },
  { mechanic: 'Orb Devo Guide Survival Priorities', chunkId: 'guides_orb_devo_survival_01', title: 'Orb Devo Guide Survival Priorities', tags: ['guides', 'orb devo', 'survival', 'wormhole redirector', 'defense absolute'] },
  { mechanic: 'Orb Devo Guide Protector and Thorns Control', chunkId: 'guides_orb_devo_pitfalls_01', title: 'Orb Devo Guide Protector and Thorns Control', tags: ['guides', 'orb devo', 'protectors', 'thorns', 'black hole damage'] },
]

const ORBLESS_GUIDE_SPECS: OrblessGuideSpec[] = [
  { mechanic: 'Orbless Guide Overview', chunkId: 'guides_orbless_overview_01', title: 'Orbless Guide Overview', tags: ['guides', 'orbless', 'overview', 'spotlight', 'golden tower', 'black hole'] },
  { mechanic: 'Orbless Guide Requirements', chunkId: 'guides_orbless_requirements_01', title: 'Orbless Guide Requirements', tags: ['guides', 'orbless', 'requirements', 'uptime', 'spotlight', 'black hole'] },
  { mechanic: 'Orbless Guide Survival Modes', chunkId: 'guides_orbless_survival_01', title: 'Orbless Guide Survival Modes', tags: ['guides', 'orbless', 'survival', 'wall', 'permanent black hole', 'chrono field'] },
  { mechanic: 'Orbless Guide Kill Methods', chunkId: 'guides_orbless_kills_01', title: 'Orbless Guide Kill Methods', tags: ['guides', 'orbless', 'kills', 'bullet', 'chain lightning', 'spotlight missiles'] },
  { mechanic: 'Orbless Guide Nice-to-Haves', chunkId: 'guides_orbless_support_01', title: 'Orbless Guide Nice-to-Haves', tags: ['guides', 'orbless', 'death wave', 'galaxy compressor', 'gc', 'singularity harness', 'coin bot'] },
  { mechanic: 'Orbless Guide Run Phases', chunkId: 'guides_orbless_run_01', title: 'Orbless Guide Run Phases', tags: ['guides', 'orbless', 'run plan', 'death wave', 'enemy level skip', 'blender', 'blender phase'] },
  { mechanic: 'Orbless Guide Workshop Setup', chunkId: 'guides_orbless_workshop_01', title: 'Orbless Guide Workshop Setup', tags: ['guides', 'orbless', 'workshop', 'devo', 'shockwave', 'card presets'] },
  { mechanic: 'Orbless Guide Module Choices', chunkId: 'guides_orbless_modules_01', title: 'Orbless Guide Module Choices', tags: ['guides', 'orbless', 'modules', 'astral deliverance', 'anti-cube portal', 'multiverse nexus'] },
  { mechanic: 'Orbless Guide Perk Plan', chunkId: 'guides_orbless_perks_01', title: 'Orbless Guide Perk Plan', tags: ['guides', 'orbless', 'perks', 'perk wave requirement', 'coin trade-off', 'standard perk bonus'] },
  { mechanic: 'Orbless Guide Strategy Tips', chunkId: 'guides_orbless_tips_01', title: 'Orbless Guide Strategy Tips', tags: ['guides', 'orbless', 'bullet', 'chain lightning', 'spotlight missiles', 'target priority 2'] },
]

const PERKS_GUIDE_SPECS: PerksGuideSpec[] = [
  { mechanic: 'Perks Guide Overview', chunkId: 'guides_perks_overview_01', title: 'Perks Guide Overview', tags: ['guides', 'perks', 'overview', 'perk labs'] },
  { mechanic: 'Perks Guide Early Priorities', chunkId: 'guides_perks_early_01', title: 'Perks Guide Early Priorities', tags: ['guides', 'perks', 'perk option quantity', 'ban perks', 'first perk choice'] },
  { mechanic: 'Perks Guide Established Towers', chunkId: 'guides_perks_established_01', title: 'Perks Guide Established Towers', tags: ['guides', 'perks', 'midgame', 'run goals'] },
  { mechanic: 'Perks Guide Coin Runs', chunkId: 'guides_perks_coin_runs_01', title: 'Perks Guide Coin Runs', tags: ['guides', 'perks', 'coin runs', 'perk wave requirement', 'golden tower bonus'] },
  { mechanic: 'Perks Guide Milestone Runs', chunkId: 'guides_perks_milestones_01', title: 'Perks Guide Milestone Runs', tags: ['guides', 'perks', 'milestones', 'free upgrades', 'enemy attack level skip'] },
  { mechanic: 'Perks Guide Perk Reduction', chunkId: 'guides_perks_reduction_01', title: 'Perks Guide Perk Reduction', tags: ['guides', 'perks', 'perk wave requirement', 'random ultimate weapon perk', 'perk labs'] },
  { mechanic: 'Perks Guide Priority Routes', chunkId: 'guides_perks_routes_01', title: 'Perks Guide Priority Routes', tags: ['guides', 'perks', 'routes', 'perk wave requirement', 'trade-off perks'] },
  { mechanic: 'Perks Guide Common Pitfalls', chunkId: 'guides_perks_pitfalls_01', title: 'Perks Guide Common Pitfalls', tags: ['guides', 'perks', 'pitfalls', 'auto pick perks', 'first perk choice'] },
]

const SMAX_DEVO_GUIDE_SPECS: SmaxDevoGuideSpec[] = [
  { mechanic: 'SMAX Devo Guide Overview', chunkId: 'guides_smax_devo_overview_01', title: 'SMAX Devo Guide Overview', tags: ['guides', 'smax devo', 'overview', 'smart missiles', 'black hole', 'golden tower'] },
  { mechanic: 'SMAX Devo Guide Requirements', chunkId: 'guides_smax_devo_requirements_01', title: 'SMAX Devo Guide Requirements', tags: ['guides', 'smax devo', 'requirements', 'sync', 'multiverse nexus', 'shockwave'] },
  { mechanic: 'SMAX Devo Guide Workshop Devo', chunkId: 'guides_smax_devo_workshop_01', title: 'SMAX Devo Guide Workshop Devo', tags: ['guides', 'smax devo', 'workshop', 'devo', 'thorns', 'shockwave'] },
  { mechanic: 'SMAX Devo Guide Cards and Support', chunkId: 'guides_smax_devo_cards_01', title: 'SMAX Devo Guide Cards and Support', tags: ['guides', 'smax devo', 'cards', 'enemy balance', 'ultimate crit', 'galaxy compressor'] },
  { mechanic: 'SMAX Devo Guide Run Plan', chunkId: 'guides_smax_devo_run_01', title: 'SMAX Devo Guide Run Plan', tags: ['guides', 'smax devo', 'run plan', 'smart missiles', 'enemy level skip', 'orb devo'] },
  { mechanic: 'SMAX Devo Guide Improvement Paths', chunkId: 'guides_smax_devo_improvements_01', title: 'SMAX Devo Guide Improvement Paths', tags: ['guides', 'smax devo', 'improvements', 'missile amplifier', 'missile radius', 'sync'] },
  { mechanic: 'SMAX Devo Guide Perk Priorities', chunkId: 'guides_smax_devo_perks_01', title: 'SMAX Devo Guide Perk Priorities', tags: ['guides', 'smax devo', 'perks', 'perk wave requirement', 'golden tower bonus', 'black hole duration'] },
  { mechanic: 'SMAX Devo Guide Survival Priorities', chunkId: 'guides_smax_devo_survival_01', title: 'SMAX Devo Guide Survival Priorities', tags: ['guides', 'smax devo', 'survival', 'defense absolute', 'wormhole redirector', 'defense percent'] },
  { mechanic: 'SMAX Devo Guide Thorns Trimming', chunkId: 'guides_smax_devo_thorns_01', title: 'SMAX Devo Guide Thorns Trimming', tags: ['guides', 'smax devo', 'thorns', 'shockwave', 'stack control'] },
  { mechanic: 'SMAX Devo Guide Common Pitfalls', chunkId: 'guides_smax_devo_pitfalls_01', title: 'SMAX Devo Guide Common Pitfalls', tags: ['guides', 'smax devo', 'pitfalls', 'protectors', 'land mine stun', 'transition'] },
]

const TIER1_BEGINNER_GUIDE_SPECS: Tier1BeginnerGuideSpec[] = [
  { mechanic: 'Tier 1 Beginner Guide Overview', chunkId: 'guides_tier1_beginner_overview_01', title: 'Tier 1 Beginner Guide Overview', tags: ['guides', 'tier 1', 'beginner', 'overview', 'tier progression'] },
  { mechanic: 'Tier 1 Beginner Guide Step 1 Economy', chunkId: 'guides_tier1_beginner_step1_economy_01', title: 'Tier 1 Beginner Guide Step 1 Economy', tags: ['guides', 'tier 1', 'beginner', 'cash', 'coins', 'interest'] },
  { mechanic: 'Tier 1 Beginner Guide Step 1 Turtle Shell', chunkId: 'guides_tier1_beginner_step1_shell_01', title: 'Tier 1 Beginner Guide Step 1 Turtle Shell', tags: ['guides', 'tier 1', 'beginner', 'defense absolute', 'defense percent', 'thorns'] },
  { mechanic: 'Tier 1 Beginner Guide Step 1 Run Loop', chunkId: 'guides_tier1_beginner_step1_run_01', title: 'Tier 1 Beginner Guide Step 1 Run Loop', tags: ['guides', 'tier 1', 'beginner', 'cash wave', 'coins wave', 'run plan'] },
  { mechanic: 'Tier 1 Beginner Guide Step 2 Health Pivot', chunkId: 'guides_tier1_beginner_step2_01', title: 'Tier 1 Beginner Guide Step 2 Health Pivot', tags: ['guides', 'tier 1', 'beginner', 'health', 'lifesteal', 'knockback', 'orbs'] },
  { mechanic: 'Tier 1 Beginner Guide Tier 2 Transition', chunkId: 'guides_tier1_beginner_transition_01', title: 'Tier 1 Beginner Guide Tier 2 Transition', tags: ['guides', 'tier 1', 'beginner', 'tier 2', 'coins', 'transition'] },
]

const TIER_RUSHING_GUIDE_SPECS: TierRushingGuideSpec[] = [
  { mechanic: 'Tier Rushing Guide Overview', chunkId: 'guides_tier_rushing_overview_01', title: 'Tier Rushing Guide Overview', tags: ['guides', 'tier rushing', 'overview', 'milestones', 'tier progression'] },
  { mechanic: 'Tier Rushing Guide Survival Layers', chunkId: 'guides_tier_rushing_survival_01', title: 'Tier Rushing Guide Survival Layers', tags: ['guides', 'tier rushing', 'death defy', 'energy shield', 'second wind', 'plasma cannon'] },
  { mechanic: 'Tier Rushing Guide Timing Control', chunkId: 'guides_tier_rushing_timing_01', title: 'Tier Rushing Guide Timing Control', tags: ['guides', 'tier rushing', 'intro sprint', 'wave accelerator', 'slow aura', 'chrono field'] },
  { mechanic: 'Tier Rushing Guide Run Sequence', chunkId: 'guides_tier_rushing_run_01', title: 'Tier Rushing Guide Run Sequence', tags: ['guides', 'tier rushing', 'run plan', 'missile barrage', 'demon mode', 'nuke'] },
  { mechanic: 'Tier Rushing Guide Breakpoints and Limits', chunkId: 'guides_tier_rushing_limits_01', title: 'Tier Rushing Guide Breakpoints and Limits', tags: ['guides', 'tier rushing', 'tier 14', 'battle conditions', 'plasma cannon', 'thorns'] },
]

const UW_PICK_ORDER_GUIDE_SPECS: UltimateWeaponPickOrderGuideSpec[] = [
  { mechanic: 'Ultimate Weapon Pick Order Guide Overview', chunkId: 'guides_uw_pick_order_overview_01', title: 'Ultimate Weapon Pick Order Guide Overview', tags: ['guides', 'ultimate weapons', 'overview', 'power stones', 'permanent choices'] },
  { mechanic: 'Ultimate Weapon Pick Order Guide Economy Core', chunkId: 'guides_uw_pick_order_economy_01', title: 'Ultimate Weapon Pick Order Guide Economy Core', tags: ['guides', 'ultimate weapons', 'golden tower', 'black hole', 'death wave', 'sync'] },
  { mechanic: 'Ultimate Weapon Pick Order Guide Damage and Coin Follow-Ups', chunkId: 'guides_uw_pick_order_damage_01', title: 'Ultimate Weapon Pick Order Guide Damage and Coin Follow-Ups', tags: ['guides', 'ultimate weapons', 'spotlight', 'spotlight missiles', 'smart missiles'] },
  { mechanic: 'Ultimate Weapon Pick Order Guide Control and Midgame Damage', chunkId: 'guides_uw_pick_order_control_01', title: 'Ultimate Weapon Pick Order Guide Control and Midgame Damage', tags: ['guides', 'ultimate weapons', 'chrono field', 'chain lightning', 'shock'] },
  { mechanic: 'Ultimate Weapon Pick Order Guide Late-Game Specialists', chunkId: 'guides_uw_pick_order_late_01', title: 'Ultimate Weapon Pick Order Guide Late-Game Specialists', tags: ['guides', 'ultimate weapons', 'smart missiles', 'inner land mines', 'poison swamp'] },
]

function getGemsGuideParagraphs(mechanic: string): string[] {
  const { gemsGuide } = loadGuidesSourceDocument()

  switch (mechanic) {
    case 'Gems Guide Overview':
      return [...gemsGuide.overviewFacts]
    case 'Gems Guide Lab Slots':
      return [...gemsGuide.labSlotFacts]
    case 'Gems Guide Early Cards and Slots':
      return gemsGuide.cardStageRows.map(row => `${row.stage}: ${row.priorities.join(' ')}`)
    case 'Gems Guide First Epic Modules':
      return [...gemsGuide.moduleFacts]
    case 'Gems Guide Ongoing Spending Loop':
      return [...gemsGuide.spendingLoopFacts]
    case 'Gems Guide Lab Rushing':
      return [...gemsGuide.labRushFacts]
    default:
      return []
  }
}

function getMedalsGuideParagraphs(mechanic: string): string[] {
  const { medalsGuide } = loadGuidesSourceDocument()

  switch (mechanic) {
    case 'Medals Guide Overview':
      return [...medalsGuide.overviewFacts]
    case 'Medals Guide Past Relics':
      return [...medalsGuide.pastRelicFacts]
    case 'Medals Guide Songs and Themes':
      return [...medalsGuide.songsAndThemesFacts]
    case 'Medals Guide Stones and Gems':
      return [...medalsGuide.currencyFacts]
    case 'Medals Guide Bot Progression':
      return [...medalsGuide.botProgressFacts]
    case 'Medals Guide Coin Bot Priorities':
      return [...medalsGuide.coinBotFacts]
    case 'Medals Guide Later Bot Priorities':
      return medalsGuide.laterBotRows.map(row => `${row.bot}: ${row.priorities.join(' ')}`)
    default:
      return []
  }
}

function getOrbDevoGuideParagraphs(mechanic: string): string[] {
  const { orbDevoGuide } = loadGuidesSourceDocument()

  const formatRows = (rows: readonly { label: string; entries: readonly string[] }[]) => rows.map(row => `${row.label}: ${row.entries.join(' ')}`)

  switch (mechanic) {
    case 'Orb Devo Guide Overview':
      return [...orbDevoGuide.overviewFacts]
    case 'Orb Devo Guide Requirements':
      return [...orbDevoGuide.requirementFacts]
    case 'Orb Devo Guide Workshop Devo':
      return formatRows(orbDevoGuide.workshopRows)
    case 'Orb Devo Guide Cards and Support':
      return [...formatRows(orbDevoGuide.cardRows), ...orbDevoGuide.supportFacts]
    case 'Orb Devo Guide Run Plan':
      return [...orbDevoGuide.runPlanFacts]
    case 'Orb Devo Guide Perk Priorities':
      return formatRows(orbDevoGuide.perkRows)
    case 'Orb Devo Guide Survival Priorities':
      return formatRows(orbDevoGuide.survivalRows)
    case 'Orb Devo Guide Protector and Thorns Control':
      return [...orbDevoGuide.pitfallFacts]
    default:
      return []
  }
}

function getOrblessGuideParagraphs(mechanic: string): string[] {
  const { orblessGuide } = loadGuidesSourceDocument()

  const formatRows = (rows: readonly { label: string; entries: readonly string[] }[]) => rows.map(row => `${row.label}: ${row.entries.join(' ')}`)

  switch (mechanic) {
    case 'Orbless Guide Overview':
      return [...orblessGuide.overviewFacts]
    case 'Orbless Guide Requirements':
      return [...orblessGuide.requirementFacts]
    case 'Orbless Guide Survival Modes':
      return formatRows(orblessGuide.survivalRows)
    case 'Orbless Guide Kill Methods':
      return formatRows(orblessGuide.killRows)
    case 'Orbless Guide Nice-to-Haves':
      return [...orblessGuide.supportFacts]
    case 'Orbless Guide Run Phases':
      return formatRows(orblessGuide.runPhaseRows)
    case 'Orbless Guide Workshop Setup':
      return [...orblessGuide.workshopFacts]
    case 'Orbless Guide Module Choices':
      return formatRows(orblessGuide.moduleRows)
    case 'Orbless Guide Perk Plan':
      return [...orblessGuide.perkFacts]
    case 'Orbless Guide Strategy Tips':
      return formatRows(orblessGuide.strategyRows)
    default:
      return []
  }
}

function getPerksGuideParagraphs(mechanic: string): string[] {
  const { perksGuide } = loadGuidesSourceDocument()

  const formatRows = (rows: readonly { label: string; entries: readonly string[] }[]) => rows.map(row => `${row.label}: ${row.entries.join(' ')}`)

  switch (mechanic) {
    case 'Perks Guide Overview':
      return [...perksGuide.overviewFacts]
    case 'Perks Guide Early Priorities':
      return [...perksGuide.earlyFacts]
    case 'Perks Guide Established Towers':
      return [...perksGuide.establishedFacts]
    case 'Perks Guide Coin Runs':
      return [...perksGuide.coinRunFacts]
    case 'Perks Guide Milestone Runs':
      return [...perksGuide.milestoneFacts]
    case 'Perks Guide Perk Reduction':
      return [...perksGuide.reductionFacts]
    case 'Perks Guide Priority Routes':
      return [...perksGuide.priorityFacts, ...formatRows(perksGuide.priorityRows)]
    case 'Perks Guide Common Pitfalls':
      return [...perksGuide.pitfallFacts]
    default:
      return []
  }
}

function getSmaxDevoGuideParagraphs(mechanic: string): string[] {
  const { smaxDevoGuide } = loadGuidesSourceDocument()

  const formatRows = (rows: readonly { label: string; entries: readonly string[] }[]) => rows.map(row => `${row.label}: ${row.entries.join(' ')}`)

  switch (mechanic) {
    case 'SMAX Devo Guide Overview':
      return [...smaxDevoGuide.overviewFacts]
    case 'SMAX Devo Guide Requirements':
      return [...smaxDevoGuide.requirementFacts]
    case 'SMAX Devo Guide Workshop Devo':
      return formatRows(smaxDevoGuide.workshopRows)
    case 'SMAX Devo Guide Cards and Support':
      return [...formatRows(smaxDevoGuide.cardRows), ...smaxDevoGuide.supportFacts]
    case 'SMAX Devo Guide Run Plan':
      return [...smaxDevoGuide.runPlanFacts]
    case 'SMAX Devo Guide Improvement Paths':
      return [...smaxDevoGuide.improvementFacts]
    case 'SMAX Devo Guide Perk Priorities':
      return formatRows(smaxDevoGuide.perkRows)
    case 'SMAX Devo Guide Survival Priorities':
      return formatRows(smaxDevoGuide.survivalRows)
    case 'SMAX Devo Guide Thorns Trimming':
      return [...smaxDevoGuide.thornsFacts]
    case 'SMAX Devo Guide Common Pitfalls':
      return [...smaxDevoGuide.pitfallFacts]
    default:
      return []
  }
}

function getTierRushingGuideParagraphs(mechanic: string): string[] {
  const { tierRushingGuide } = loadGuidesSourceDocument()

  const formatRows = (rows: readonly { label: string; entries: readonly string[] }[]) => rows.map(row => `${row.label}: ${row.entries.join(' ')}`)

  switch (mechanic) {
    case 'Tier Rushing Guide Overview':
      return [...tierRushingGuide.overviewFacts]
    case 'Tier Rushing Guide Survival Layers':
      return formatRows(tierRushingGuide.supportRows)
    case 'Tier Rushing Guide Timing Control':
      return formatRows(tierRushingGuide.timingRows)
    case 'Tier Rushing Guide Run Sequence':
      return [...tierRushingGuide.runPlanFacts]
    case 'Tier Rushing Guide Breakpoints and Limits':
      return [...tierRushingGuide.breakpointFacts]
    default:
      return []
  }
}

function getTier1BeginnerGuideParagraphs(mechanic: string): string[] {
  const { tier1BeginnerGuide } = loadGuidesSourceDocument()

  const formatRows = (rows: readonly { label: string; entries: readonly string[] }[]) => rows.map(row => `${row.label}: ${row.entries.join(' ')}`)

  switch (mechanic) {
    case 'Tier 1 Beginner Guide Overview':
      return [...tier1BeginnerGuide.overviewFacts]
    case 'Tier 1 Beginner Guide Step 1 Economy':
      return [...tier1BeginnerGuide.stepOneEconomyFacts]
    case 'Tier 1 Beginner Guide Step 1 Turtle Shell':
      return [...tier1BeginnerGuide.stepOneDefenseFacts]
    case 'Tier 1 Beginner Guide Step 1 Run Loop':
      return [...tier1BeginnerGuide.stepOneRunFacts]
    case 'Tier 1 Beginner Guide Step 2 Health Pivot':
      return formatRows(tier1BeginnerGuide.stepTwoRows)
    case 'Tier 1 Beginner Guide Tier 2 Transition':
      return [...tier1BeginnerGuide.transitionFacts]
    default:
      return []
  }
}

function getUltimateWeaponPickOrderGuideParagraphs(mechanic: string): string[] {
  const { ultimateWeaponPickOrderGuide } = loadGuidesSourceDocument()

  switch (mechanic) {
    case 'Ultimate Weapon Pick Order Guide Overview':
      return [...ultimateWeaponPickOrderGuide.overviewFacts]
    case 'Ultimate Weapon Pick Order Guide Economy Core':
      return [...ultimateWeaponPickOrderGuide.economyFacts]
    case 'Ultimate Weapon Pick Order Guide Damage and Coin Follow-Ups':
      return [...ultimateWeaponPickOrderGuide.damageFacts]
    case 'Ultimate Weapon Pick Order Guide Control and Midgame Damage':
      return [...ultimateWeaponPickOrderGuide.controlFacts]
    case 'Ultimate Weapon Pick Order Guide Late-Game Specialists':
      return [...ultimateWeaponPickOrderGuide.lateFacts]
    default:
      return []
  }
}

function getCoinGuideParagraphs(mechanic: string): string[] {
  const { coinGuide } = loadGuidesSourceDocument()

  switch (mechanic) {
    case 'Coin Guide Overview':
      return [...coinGuide.overviewFacts, ...coinGuide.summaryFacts]
    case 'Coin Guide Coins/Wave':
      return [...coinGuide.coinsPerWaveFacts]
    case 'Coin Guide Coins/Kill':
      return [...coinGuide.coinsPerKillFacts]
    case 'Coin Guide Multipliers': {
      const example = coinGuide.multiplierExample
      return [
        ...coinGuide.multiplierFacts,
        `Example: Black Hole can reach x${example.blackHoleMultiplier} and Golden Tower can reach x${example.goldenTowerMultiplier}. When both are active on the same kill window, enemies drop x${example.combinedMultiplier} the normal coins.`,
      ]
    }
    case 'Coin Guide Syncing': {
      const example = coinGuide.syncExample
      return [
        ...coinGuide.syncFacts,
        `Example: Golden Tower starts at ${example.goldenTowerStartingCooldownSeconds} seconds and Black Hole starts at ${example.blackHoleStartingCooldownSeconds} seconds. A 1:1 sync happens when Golden Tower is reduced to ${example.oneToOneTargetCooldownSeconds} seconds so it always activates with Black Hole.`,
        `A 2:1 sync alternative is reducing Black Hole to ${example.twoToOneBlackHoleCooldownSeconds} seconds so Black Hole activates twice for each Golden Tower activation.`,
        ...coinGuide.syncHeatmapFacts,
        ...coinGuide.multiverseNexusFacts,
        ...coinGuide.syncConstraintFacts,
      ]
    }
    case 'Coin Guide Coin Sources':
      return [
        'This guide lists the major unlocks that increase Coins / Kill, either by raising coin bonus directly or by increasing the underlying Coins / Kill stat.',
        ...coinGuide.sourceRows.map(row => `${row.source}: ${row.description}${row.alsoAffectsCoinsPerWave ? ' Also increases Coins / Wave.' : ''}`),
      ]
    case 'Coin Guide Daily Missions':
      return [...coinGuide.dailyMissionFacts]
    default:
      return []
  }
}

function getEhpGuideParagraphs(mechanic: string): string[] {
  const { ehpGuide } = loadGuidesSourceDocument()

  switch (mechanic) {
    case 'eHP Guide Overview':
      return [
        ...ehpGuide.overviewFacts,
        `Strengths: ${ehpGuide.strengths.join(' ')}`,
        `Weaknesses: ${ehpGuide.weaknesses.join(' ')}`,
      ]
    case 'eHP Guide Starting Setup':
      return ehpGuide.startingUnlockSections.map(section => `${section.category}: ${section.entries.join(' ')}`)
    case 'eHP Guide Workshop Priorities':
      return [...ehpGuide.workshopFacts]
    case 'eHP Guide Lab Priorities':
      return [
        ...ehpGuide.labCoreFacts,
        ...ehpGuide.labTracks.map(track => `${track.slot}: ${track.priorities.join(' ')}`),
      ]
    case 'eHP Guide Card Priorities':
      return ehpGuide.cardRows.map(row => `${row.card}: ${row.reason}`)
    case 'eHP Guide Ultimate Weapon Support':
      return [...ehpGuide.uwFacts]
    case 'eHP Guide Round Triage':
      return ehpGuide.roundAdjustmentRows.map(row => `${row.situation}: ${row.response}`)
    case 'eHP Guide Transition Tools':
      return [...ehpGuide.transitionFacts]
    default:
      return []
  }
}

function getEventGuideParagraphs(mechanic: string): string[] {
  const { eventGuide } = loadGuidesSourceDocument()

  const formatRows = (rows: readonly { objective: string; strategy: string }[]) => rows.map(row => `${row.objective}: ${row.strategy}`)

  switch (mechanic) {
    case 'Event Guide Overview':
      return [...eventGuide.overviewFacts]
    case 'Event Guide Event Context':
      return [...eventGuide.eventContextFacts]
    case 'Event Guide General Methods':
      return [...eventGuide.generalMethodFacts]
    case 'Event Guide Core Quests':
      return formatRows(eventGuide.coreQuestRows)
    case 'Event Guide Survival Quests':
      return formatRows(eventGuide.survivalQuestRows)
    case 'Event Guide Active Quests':
      return formatRows(eventGuide.activeQuestRows)
    case 'Event Guide Ultimate Weapon Quests':
      return formatRows(eventGuide.ultimateWeaponQuestRows)
    default:
      return []
  }
}

export function buildGuidesCanonicalKbChunks(): KBChunkRecord[] {
  const sourceDocument = loadGuidesSourceDocument()
  const guidesEntry = getRequiredNamingRegistryEntryBySource('guides', 'guides')

  const atomicChunks = [
    buildAtomicKbChunk({
      chunk_id: 'guides_overview_01',
      source: 'Guides Platform Reference',
      section: 'Guides',
      topic: 'Guides',
      title: 'Guides Overview',
      disambiguation: 'This chunk is about the Guides mechanic itself, not its interactions. It is not about one specific build, a single stat row, or tracker-specific UI behavior.',
      data_source: guidesEntry.data_source,
      is_base_mechanic: true,
      mechanics: ['Guides'],
      tags: ['guides', 'strategy', 'overview'],
      paragraphs: sourceDocument.overviewFacts,
    }),
    ...EHP_GUIDE_SPECS.map(guide => {
      const namingEntry = getRequiredNamingRegistryEntryBySource('guides', guide.mechanic)
      return buildAtomicKbChunk({
        chunk_id: guide.chunkId,
        source: 'eHP Guide Platform Reference',
        section: 'Guides',
        topic: guide.title,
        title: guide.title,
        disambiguation: `This chunk is about the ${guide.title} mechanic itself, not its interactions. It is not a run log, tracker-specific UI behavior, or a generic summary outside the eHP guide.`,
        data_source: namingEntry.data_source,
        is_base_mechanic: false,
        mechanics: [guide.mechanic],
        tags: guide.tags,
        paragraphs: getEhpGuideParagraphs(guide.mechanic),
      })
    }),
    ...GEMS_GUIDE_SPECS.map(guide => {
      const namingEntry = getRequiredNamingRegistryEntryBySource('guides', guide.mechanic)
      return buildAtomicKbChunk({
        chunk_id: guide.chunkId,
        source: 'Gems Guide Platform Reference',
        section: 'Guides',
        topic: guide.title,
        title: guide.title,
        disambiguation: `This chunk is about the ${guide.title} mechanic itself, not its interactions. It is not a generic gem-spending summary outside the gems guide, a live inventory state, or a shop calculator output.`,
        data_source: namingEntry.data_source,
        is_base_mechanic: false,
        mechanics: [guide.mechanic],
        tags: guide.tags,
        paragraphs: getGemsGuideParagraphs(guide.mechanic),
      })
    }),
    ...MEDALS_GUIDE_SPECS.map(guide => {
      const namingEntry = getRequiredNamingRegistryEntryBySource('guides', guide.mechanic)
      return buildAtomicKbChunk({
        chunk_id: guide.chunkId,
        source: 'Medals Guide Platform Reference',
        section: 'Guides',
        topic: guide.title,
        title: guide.title,
        disambiguation: `This chunk is about the ${guide.title} mechanic itself, not its interactions. It is not a generic medal-spending summary outside the medals guide, a current-event inventory readout, or a weekly reward table.`,
        data_source: namingEntry.data_source,
        is_base_mechanic: false,
        mechanics: [guide.mechanic],
        tags: guide.tags,
        paragraphs: getMedalsGuideParagraphs(guide.mechanic),
      })
    }),
    ...ORB_DEVO_GUIDE_SPECS.map(guide => {
      const namingEntry = getRequiredNamingRegistryEntryBySource('guides', guide.mechanic)
      return buildAtomicKbChunk({
        chunk_id: guide.chunkId,
        source: 'Orb Devo Guide Platform Reference',
        section: 'Guides',
        topic: guide.title,
        title: guide.title,
        disambiguation: `This chunk is about the ${guide.title} mechanic itself, not its interactions. It is not a generic devo summary outside the Orb Devo guide, a live tracker state, or a single stat formula page.`,
        data_source: namingEntry.data_source,
        is_base_mechanic: false,
        mechanics: [guide.mechanic],
        tags: guide.tags,
        paragraphs: getOrbDevoGuideParagraphs(guide.mechanic),
      })
    }),
    ...ORBLESS_GUIDE_SPECS.map(guide => {
      const namingEntry = getRequiredNamingRegistryEntryBySource('guides', guide.mechanic)
      return buildAtomicKbChunk({
        chunk_id: guide.chunkId,
        source: 'Orbless Guide Platform Reference',
        section: 'Guides',
        topic: guide.title,
        title: guide.title,
        disambiguation: `This chunk is about the ${guide.title} mechanic itself, not its interactions. It is not a generic orbless one-liner, a live tracker state, or a single stat definition page.`,
        data_source: namingEntry.data_source,
        is_base_mechanic: false,
        mechanics: [guide.mechanic],
        tags: guide.tags,
        paragraphs: getOrblessGuideParagraphs(guide.mechanic),
      })
    }),
    ...PERKS_GUIDE_SPECS.map(guide => {
      const namingEntry = getRequiredNamingRegistryEntryBySource('guides', guide.mechanic)
      return buildAtomicKbChunk({
        chunk_id: guide.chunkId,
        source: 'Perks Guide Platform Reference',
        section: 'Guides',
        topic: guide.title,
        title: guide.title,
        disambiguation: `This chunk is about the ${guide.title} mechanic itself, not its interactions. It is not the base perks rules page, a single perk definition, or a generic one-line pick order.`,
        data_source: namingEntry.data_source,
        is_base_mechanic: false,
        mechanics: [guide.mechanic],
        tags: guide.tags,
        paragraphs: getPerksGuideParagraphs(guide.mechanic),
      })
    }),
    ...SMAX_DEVO_GUIDE_SPECS.map(guide => {
      const namingEntry = getRequiredNamingRegistryEntryBySource('guides', guide.mechanic)
      return buildAtomicKbChunk({
        chunk_id: guide.chunkId,
        source: 'SMAX Devo Guide Platform Reference',
        section: 'Guides',
        topic: guide.title,
        title: guide.title,
        disambiguation: `This chunk is about the ${guide.title} mechanic itself, not its interactions. It is not a generic devo one-liner, a single stat definition, or a live build readout.`,
        data_source: namingEntry.data_source,
        is_base_mechanic: false,
        mechanics: [guide.mechanic],
        tags: guide.tags,
        paragraphs: getSmaxDevoGuideParagraphs(guide.mechanic),
      })
    }),
    ...TIER1_BEGINNER_GUIDE_SPECS.map(guide => {
      const namingEntry = getRequiredNamingRegistryEntryBySource('guides', guide.mechanic)
      return buildAtomicKbChunk({
        chunk_id: guide.chunkId,
        source: 'Tier 1 Beginner Guide Platform Reference',
        section: 'Guides',
        topic: guide.title,
        title: guide.title,
        disambiguation: `This chunk is about the ${guide.title} mechanic itself, not its interactions. It is not a generic beginner summary, a single stat definition, or a live tracker build readout.`,
        data_source: namingEntry.data_source,
        is_base_mechanic: false,
        mechanics: [guide.mechanic],
        tags: guide.tags,
        paragraphs: getTier1BeginnerGuideParagraphs(guide.mechanic),
      })
    }),
    ...TIER_RUSHING_GUIDE_SPECS.map(guide => {
      const namingEntry = getRequiredNamingRegistryEntryBySource('guides', guide.mechanic)
      return buildAtomicKbChunk({
        chunk_id: guide.chunkId,
        source: 'Tier Rushing Guide Platform Reference',
        section: 'Guides',
        topic: guide.title,
        title: guide.title,
        disambiguation: `This chunk is about the ${guide.title} mechanic itself, not its interactions. It is not a generic milestone summary, a one-card explainer, or a live run state readout.`,
        data_source: namingEntry.data_source,
        is_base_mechanic: false,
        mechanics: [guide.mechanic],
        tags: guide.tags,
        paragraphs: getTierRushingGuideParagraphs(guide.mechanic),
      })
    }),
    ...UW_PICK_ORDER_GUIDE_SPECS.map(guide => {
      const namingEntry = getRequiredNamingRegistryEntryBySource('guides', guide.mechanic)
      return buildAtomicKbChunk({
        chunk_id: guide.chunkId,
        source: 'Ultimate Weapon Pick Order Guide Platform Reference',
        section: 'Guides',
        topic: guide.title,
        title: guide.title,
        disambiguation: `This chunk is about the ${guide.title} mechanic itself, not its interactions. It is not a stone-cost table, a single Ultimate Weapon stat sheet, or a live account recommendation.` ,
        data_source: namingEntry.data_source,
        is_base_mechanic: false,
        mechanics: [guide.mechanic],
        tags: guide.tags,
        paragraphs: getUltimateWeaponPickOrderGuideParagraphs(guide.mechanic),
      })
    }),
    ...EVENT_GUIDE_SPECS.map(guide => {
      const namingEntry = getRequiredNamingRegistryEntryBySource('guides', guide.mechanic)
      return buildAtomicKbChunk({
        chunk_id: guide.chunkId,
        source: 'Event Guide Platform Reference',
        section: 'Guides',
        topic: guide.title,
        title: guide.title,
        disambiguation: `This chunk is about the ${guide.title} mechanic itself, not its interactions. It is not a mission reward table, a live event state readout, or a generic summary outside the event guide.`,
        data_source: namingEntry.data_source,
        is_base_mechanic: false,
        mechanics: [guide.mechanic],
        tags: guide.tags,
        paragraphs: getEventGuideParagraphs(guide.mechanic),
      })
    }),
    ...COIN_GUIDE_SPECS.map(guide => {
      const namingEntry = getRequiredNamingRegistryEntryBySource('guides', guide.mechanic)
      return buildAtomicKbChunk({
        chunk_id: guide.chunkId,
        source: 'Coin Guide Platform Reference',
        section: 'Guides',
        topic: guide.title,
        title: guide.title,
        disambiguation: `This chunk is about the ${guide.title} mechanic itself, not its interactions. It is not a calculator output, tracker-specific UI behavior, or an unrelated game-system summary outside the coin guide.`,
        data_source: namingEntry.data_source,
        is_base_mechanic: false,
        mechanics: [guide.mechanic],
        tags: guide.tags,
        paragraphs: getCoinGuideParagraphs(guide.mechanic),
      })
    }),
  ]

  return [
    ...atomicChunks,
    buildRelationalKbChunk({
      chunk_id: 'guides_tier1_beginner_early_economy_01',
      source: 'Tier 1 Beginner Guide Platform Reference',
      section: 'Guides',
      topic: 'Tier 1 Beginner Guide Step 1 Economy with Cash Bonus, Cash / Wave, Coins / Kill Bonus, Coins / Wave, Interest / Wave, Max Interest, and Milestone Tier Progression',
      title: 'Tier 1 Beginner Guide Step 1 Economy with Cash Bonus, Cash / Wave, Coins / Kill Bonus, Coins / Wave, Interest / Wave, Max Interest, and Milestone Tier Progression',
      disambiguation: 'This chunk is about the interaction between the Tier 1 beginner economy loop and the workshop or milestone systems behind it, not the individual mechanics. It is not a universal endgame economy plan or a pure formula page.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Tier 1 Beginner Guide Step 1 Economy').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Cash Bonus').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Cash / Wave').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Coins / Kill Bonus').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Coins / Wave').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Interest / Wave').data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'Milestone Tier Progression').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Tier 1 Beginner Guide Step 1 Economy', 'Cash Bonus', 'Cash / Wave', 'Coins / Kill Bonus', 'Coins / Wave', 'Interest / Wave', 'Milestone Tier Progression'],
      interaction_type: 'cross_system',
      interaction_summary: 'Tier 1 Beginner Guide Step 1 Economy begins with flat per-wave income because early runs lack kill density, then shifts toward Cash Bonus and Coins / Kill Bonus as waves lengthen. Interest / Wave is useful only lightly at first because Max Interest stays capped until later milestone progression expands that ceiling.',
      tags: ['guides', 'tier 1', 'beginner', 'cash bonus', 'cash wave', 'coins wave', 'interest'],
      paragraphs: [
        'Tier 1 Beginner Guide Step 1 Economy starts on Cash / Wave and Coins / Wave because those flat rows pay out immediately in short early runs when enemy kills are still sparse.',
        'Cash Bonus and Coins / Kill Bonus take over later because the guide expects enemy density to rise after roughly wave 100, which is the point where kill-based scaling starts beating the flat per-wave rows.',
        'Interest / Wave is still part of the plan, but only in moderation. Max Interest is the limiting rule early on, and Milestone Tier Progression is what eventually relaxes that cap so the guide can stop treating interest as a small early-game bonus.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_tier1_beginner_turtle_shell_01',
      source: 'Tier 1 Beginner Guide Platform Reference',
      section: 'Guides',
      topic: 'Tier 1 Beginner Guide Overview, Step 1 Turtle Shell, and Step 1 Run Loop with Defense Absolute, Health, Defense %, and Thorns',
      title: 'Tier 1 Beginner Guide Overview, Step 1 Turtle Shell, and Step 1 Run Loop with Defense Absolute, Health, Defense %, and Thorns',
      disambiguation: 'This chunk is about the interaction between the Tier 1 beginner turtle shell and its core defensive rows, not the individual mechanics. It is not a general EHP guide or a final-tier tanking recommendation.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Tier 1 Beginner Guide Overview').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'Tier 1 Beginner Guide Step 1 Turtle Shell').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'Tier 1 Beginner Guide Step 1 Run Loop').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Defense Absolute').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Health').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Defense Percent').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Thorns').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Tier 1 Beginner Guide Overview', 'Tier 1 Beginner Guide Step 1 Turtle Shell', 'Tier 1 Beginner Guide Step 1 Run Loop', 'Defense Absolute', 'Health', 'Defense %', 'Thorns'],
      interaction_type: 'conditional',
      interaction_summary: 'The early Tier 1 shell works because Defense Absolute removes most normal chip damage, Health supplies a small buffer, Defense % strengthens that buffer, and Thorns converts enemy contact into the actual kill method. Tier 1 Beginner Guide Step 1 Run Loop keeps reinvesting into whichever part of that shell is currently failing.',
      tags: ['guides', 'tier 1', 'beginner', 'defense absolute', 'health', 'defense percent', 'thorns'],
      paragraphs: [
        'Tier 1 Beginner Guide Overview says Tier 1 is the only tier where a true turtle shell is reliable, and Tier 1 Beginner Guide Step 1 Turtle Shell explains why: Defense Absolute is allowed to erase most incoming normal-wave chip damage while the build is still weak.',
        'Health and Defense % matter even in that shell because the guide does not want Defense Absolute treated as a fully isolated stat. Small Health growth and later Defense % levels keep the tower from collapsing the moment enemy damage rises above the flat Defense Absolute threshold.',
        'Thorns is the actual damage engine inside the shell, which is why Tier 1 Beginner Guide Step 1 Run Loop keeps telling the player to buy clean thorn breakpoints in-run when those upgrades reduce enemy contact more efficiently than another Defense Absolute purchase.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_tier1_beginner_health_pivot_01',
      source: 'Tier 1 Beginner Guide Platform Reference',
      section: 'Guides',
      topic: 'Tier 1 Beginner Guide Step 2 Health Pivot with Health, Defense %, Lifesteal, Attack Speed, Damage, Critical Chance, Critical Factor, and Damage / Meter',
      title: 'Tier 1 Beginner Guide Step 2 Health Pivot with Health, Defense %, Lifesteal, Attack Speed, Damage, Critical Chance, Critical Factor, and Damage / Meter',
      disambiguation: 'This chunk is about the interaction between the Tier 1 beginner health pivot and the projectile-damage systems that support it, not the individual mechanics. It is not a late-game damage guide or a standalone lifesteal formula page.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Tier 1 Beginner Guide Step 2 Health Pivot').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Health').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Defense Percent').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Lifesteal').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Attack Speed').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Damage').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Critical Chance').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Critical Factor').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Damage / Meter').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Tier 1 Beginner Guide Step 2 Health Pivot', 'Health', 'Defense %', 'Lifesteal', 'Attack Speed', 'Damage', 'Critical Chance', 'Critical Factor', 'Damage / Meter'],
      interaction_type: 'cross_system',
      interaction_summary: 'Tier 1 Beginner Guide Step 2 Health Pivot replaces flat turtle defense with a Health and Defense % shell that is sustained by Lifesteal. Attack Speed raises heal frequency, while Damage, Critical Chance, Critical Factor, and Damage / Meter all raise the projectile damage that Lifesteal scales from.',
      tags: ['guides', 'tier 1', 'beginner', 'health', 'lifesteal', 'attack speed', 'damage'],
      paragraphs: [
        'Tier 1 Beginner Guide Step 2 Health Pivot is explicit that Defense Absolute should stop being the main plan once real progression starts, because Health and Defense % scale more naturally into higher tiers.',
        'Lifesteal becomes the central recovery mechanic in that same pivot, but only because Health gives the tower something worth refilling and because Lifesteal works from projectile damage instead of from thorn contact.',
        'Attack Speed improves how often Lifesteal can trigger, while Damage, Critical Chance, Critical Factor, and Damage / Meter all make each heal larger by increasing projectile damage per hit. The guide therefore treats those attack rows as support for survivability first, not as a pure damage-race package.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_tier1_beginner_orb_control_01',
      source: 'Tier 1 Beginner Guide Platform Reference',
      section: 'Guides',
      topic: 'Tier 1 Beginner Guide Step 2 Health Pivot and Tier 2 Transition with Knockback Chance, Knockback Force, Orb Speed, Orbs, Health, and Lifesteal',
      title: 'Tier 1 Beginner Guide Step 2 Health Pivot and Tier 2 Transition with Knockback Chance, Knockback Force, Orb Speed, Orbs, Health, and Lifesteal',
      disambiguation: 'This chunk is about the interaction between the Tier 1 beginner crowd-control package and the survival shell it supports, not the individual mechanics. It is not a general orb farming guide or a boss-control claim.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Tier 1 Beginner Guide Step 2 Health Pivot').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'Tier 1 Beginner Guide Tier 2 Transition').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Knockback Chance').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Knockback Force').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Orb Speed').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Orbs').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Health').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Lifesteal').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Tier 1 Beginner Guide Step 2 Health Pivot', 'Tier 1 Beginner Guide Tier 2 Transition', 'Knockback Chance', 'Knockback Force', 'Orb Speed', 'Orbs', 'Health', 'Lifesteal'],
      interaction_type: 'conditional',
      interaction_summary: 'The post-turtle survival shell still gets hit by bosses, so Tier 1 Beginner Guide Step 2 Health Pivot uses Knockback Chance, Knockback Force, Orb Speed, and Orbs to thin normal enemies before they ever reach the tower. That keeps Health and Lifesteal focused on boss or leak recovery instead of constant chip cleanup.',
      tags: ['guides', 'tier 1', 'beginner', 'knockback', 'orbs', 'orb speed', 'lifesteal'],
      paragraphs: [
        'Tier 1 Beginner Guide Step 2 Health Pivot ties Knockback Chance and Knockback Force directly to Orbs. The point is not generic crowd control by itself; it is to keep enemies in orbital kill range so fewer bodies ever make contact with the tower.',
        'Orb Speed matters to that same plan because faster orbits make those Orbs connect more reliably, which turns knockback from a stall tool into a real kill-delivery system for normal enemies.',
        'Tier 1 Beginner Guide Tier 2 Transition keeps that package intact because Health and Lifesteal are still needed for boss hits, but the guide wants Knockback Chance, Knockback Force, Orb Speed, and Orbs doing most of the normal-wave cleanup before those resources are spent.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_tier1_beginner_tier2_transition_01',
      source: 'Tier 1 Beginner Guide Platform Reference',
      section: 'Guides',
      topic: 'Tier 1 Beginner Guide Overview and Tier 2 Transition with Tier Unlock Requirement, Tier Coin Bonus, Milestone Tier Progression, Defense Absolute, Health, and Defense %',
      title: 'Tier 1 Beginner Guide Overview and Tier 2 Transition with Tier Unlock Requirement, Tier Coin Bonus, Milestone Tier Progression, Defense Absolute, Health, and Defense %',
      disambiguation: 'This chunk is about the interaction between the Tier 1 beginner transition rules and the tier systems behind them, not the individual mechanics. It is not a universal tier-pushing guide or a pure milestone table summary.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Tier 1 Beginner Guide Overview').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'Tier 1 Beginner Guide Tier 2 Transition').data_source,
        getRequiredNamingRegistryEntryBySource('tiers', 'Tier Unlock Requirement').data_source,
        getRequiredNamingRegistryEntryBySource('tiers', 'Tier Coin Bonus').data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'Milestone Tier Progression').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Defense Absolute').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Health').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Defense Percent').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Tier 1 Beginner Guide Overview', 'Tier 1 Beginner Guide Tier 2 Transition', 'Tier Unlock Requirement', 'Tier Coin Bonus', 'Milestone Tier Progression', 'Defense Absolute', 'Health', 'Defense %'],
      interaction_type: 'cross_system',
      interaction_summary: 'Tier 1 Beginner Guide Overview treats Tier 2 access as an early milestone goal, but Tier 1 Beginner Guide Tier 2 Transition warns that the account should not fully move over until the Health shell is ready. Tier Unlock Requirement and Milestone Tier Progression open the tier, Tier Coin Bonus makes it eventually more profitable, and the guide drops Defense Absolute in favor of Health and Defense % once that move happens.',
      tags: ['guides', 'tier 1', 'beginner', 'tier 2', 'tier unlock', 'tier coin bonus', 'transition'],
      paragraphs: [
        'Tier 1 Beginner Guide Overview treats the first Tier Unlock Requirement as a progression checkpoint rather than a signal to abandon Tier 1 immediately. Unlocking Tier 2 matters because it opens the next milestone table, but the guide still expects more farming on Tier 1 first.',
        'Tier 1 Beginner Guide Tier 2 Transition makes the tradeoff explicit: Tier Coin Bonus is better in Tier 2, yet the raw guide still calls Tier 2 much harder, so the account waits until shorter Tier 2 runs can actually beat long Tier 1 farms for coins.',
        'Milestone Tier Progression is why that move is still worth testing early. The first successful Tier 2 pushes begin unlocking future account power, but once the move is real the guide stops leaning on Defense Absolute and instead expects Health and Defense % to carry the new tier.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_tier_rushing_boss_shell_01',
      source: 'Tier Rushing Guide Platform Reference',
      section: 'Guides',
      topic: 'Tier Rushing Guide Survival Layers and Run Sequence with Death Defy, Energy Shield, Plasma Cannon, Second Wind, and eHP Guide Round Triage',
      title: 'Tier Rushing Guide Survival Layers and Run Sequence with Death Defy, Energy Shield, Plasma Cannon, Second Wind, and eHP Guide Round Triage',
      disambiguation: 'This chunk is about the interaction between Tier Rushing boss survival order and the core defensive tools it stacks, not the individual mechanics. It is not a generic eHP guide or a boss damage formula page.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Tier Rushing Guide Survival Layers').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'Tier Rushing Guide Run Sequence').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'eHP Guide Round Triage').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Death Defy').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Energy Shield').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Plasma Cannon').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Second Wind').data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'milestones').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Tier Rushing Guide Survival Layers', 'Tier Rushing Guide Run Sequence', 'eHP Guide Round Triage', 'Death Defy', 'Energy Shield', 'Plasma Cannon', 'Second Wind', 'Energy Shield Extra Hits'],
      interaction_type: 'conditional',
      interaction_summary: 'Tier Rushing begins with passive survivability if possible, then spends layered boss protections in order: Death Defy rolls first, Energy Shield plus Plasma Cannon buys clean boss kills, and Second Wind is the once-per-rush buffer that extends the sequence after shield charges are gone.',
      tags: ['guides', 'tier rushing', 'death defy', 'energy shield', 'plasma cannon', 'second wind', 'bosses'],
      paragraphs: [
        'Tier Rushing Guide Survival Layers is built around ordering, not just owning strong cards. Death Defy rolls before most other death prevention, so the guide treats it as the first passive extension layer rather than as a final emergency button.',
        'Energy Shield and Plasma Cannon then act as one boss package. Plasma Cannon pushes the boss low enough that Thorns can finish it cleanly, while Energy Shield buys the protected contact needed to cash in that boss kill without immediately consuming the rest of the rush shell. Energy Shield Extra Hits is the specific milestone support that can extend that same layer beyond a single protected boss contact.',
        'Tier Rushing Guide Run Sequence closes that defensive ladder with Second Wind after normal shield charges are gone. The guide is explicit that eHP Guide Round Triage still matters at the very start because if the tower can tank the first boss normally, the remaining one-time layers can be saved for later waves where the rush actually needs them.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_tier_rushing_manual_tools_01',
      source: 'Tier Rushing Guide Platform Reference',
      section: 'Guides',
      topic: 'Tier Rushing Guide Run Sequence with Missile Barrage, Missile Amplifier, Demon Mode, Nuke, and Milestones',
      title: 'Tier Rushing Guide Run Sequence with Missile Barrage, Missile Amplifier, Demon Mode, Nuke, and Milestones',
      disambiguation: 'This chunk is about the interaction between Tier Rushing manual finishers and their unlock or support systems, not the individual mechanics. It is not a Smart Missiles build guide or a card unlock table.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Tier Rushing Guide Run Sequence').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Smart Missiles').data_source,
        getRequiredNamingRegistryEntryBySource('labs', 'labs').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Demon Mode').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Nuke').data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'milestones').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Tier Rushing Guide Run Sequence', 'Missile Barrage', 'Missile Amplifier', 'Demon Mode', 'Nuke', 'Milestones'],
      interaction_type: 'conditional',
      interaction_summary: 'Tier Rushing spends manual boss-kill tools only after earlier passive layers are gone: Missile Barrage is the first manual save if unlocked, Demon Mode is the long invulnerability bridge after Intro Sprint ends, and Nuke is the final forgiving cleanup tool once the other layers have already been committed.',
      tags: ['guides', 'tier rushing', 'missile barrage', 'missile amplifier', 'demon mode', 'nuke', 'milestones'],
      paragraphs: [
        'Tier Rushing Guide Run Sequence uses Missile Barrage as the first manual boss answer because it can preserve an Energy Shield charge on an early boss wave instead of spending one of the more limited defensive layers immediately.',
        'Missile Amplifier matters to that same route because the raw guide only recommends Missile Barrage confidently when the missile shell is strong enough to finish the boss instead of partially softening it. The guide still treats Missile Barrage as an unlocked option, not as a baseline requirement, because Milestones and labs gate when it exists at all.',
        'Demon Mode and Nuke come later in the sequence for different reasons. Demon Mode is the manual invulnerability bridge once Intro Sprint is already off, while Nuke is intentionally saved as the final forgiving boss cleanup tool after the rest of the rush shell has already been spent.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_tier_rushing_timing_windows_01',
      source: 'Tier Rushing Guide Platform Reference',
      section: 'Guides',
      topic: 'Tier Rushing Guide Timing Control and Run Sequence with Intro Sprint, Wave Accelerator, Slow Aura, Chrono Field, Demon Mode, and Second Wind',
      title: 'Tier Rushing Guide Timing Control and Run Sequence with Intro Sprint, Wave Accelerator, Slow Aura, Chrono Field, Demon Mode, and Second Wind',
      disambiguation: 'This chunk is about the interaction between Tier Rushing timing control and its duration-based tools, not the individual mechanics. It is not a generic crowd-control guide or a Chrono Field upgrade page.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Tier Rushing Guide Timing Control').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'Tier Rushing Guide Run Sequence').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Intro Sprint').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Wave Accelerator').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Slow Aura').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chrono Field').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Demon Mode').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Second Wind').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Tier Rushing Guide Timing Control', 'Tier Rushing Guide Run Sequence', 'Intro Sprint', 'Wave Accelerator', 'Slow Aura', 'Chrono Field', 'Demon Mode', 'Second Wind'],
      interaction_type: 'conditional',
      interaction_summary: 'Tier Rushing gets value from manipulating when bosses arrive, not just whether they die: Intro Sprint compresses retries, Wave Accelerator can stretch one invulnerability card across two boss waves, and Slow Aura or Chrono Field are used as timing levers so Second Wind and Demon Mode land on the boss hits that matter most.',
      tags: ['guides', 'tier rushing', 'intro sprint', 'wave accelerator', 'slow aura', 'chrono field', 'boss timing'],
      paragraphs: [
        'Tier Rushing Guide Timing Control treats Intro Sprint as a retry-speed tool first and a reach-extension tool second. It gets the run back to the breakpoint quickly, and if the card is strong enough it can also let Second Wind span into a second boss wave before the rush shell is spent.',
        'Wave Accelerator works on that same timing problem by shortening the gap between waves. The guide uses it only when that timing compression helps Second Wind or Demon Mode touch an extra boss instead of leaving their duration partly wasted between waves.',
        'Slow Aura and Chrono Field are not just generic slows here. Tier Rushing Guide Timing Control uses them as boss-position tools so the player can delay one boss hit for Second Wind or Demon Mode, then release the next boss faster by turning the slow off before the following wave arrives. Tier Rushing Guide Run Sequence depends on that timing control because the whole rush order only works if those one-time layers are spent on the boss hits that matter most.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_tier_rushing_breakpoints_01',
      source: 'Tier Rushing Guide Platform Reference',
      section: 'Guides',
      topic: 'Tier Rushing Guide Overview and Breakpoints and Limits with Milestone Tier Progression, Tier Unlock Requirement, Tier Battle Conditions, Plasma Cannon, and Thorns',
      title: 'Tier Rushing Guide Overview and Breakpoints and Limits with Milestone Tier Progression, Tier Unlock Requirement, Tier Battle Conditions, Plasma Cannon, and Thorns',
      disambiguation: 'This chunk is about the interaction between Tier Rushing progression goals and its hard tier breakpoints, not the individual mechanics. It is not a generic tier ladder summary or a full battle-condition explainer.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Tier Rushing Guide Overview').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'Tier Rushing Guide Breakpoints and Limits').data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'Milestone Tier Progression').data_source,
        getRequiredNamingRegistryEntryBySource('tiers', 'Tier Unlock Requirement').data_source,
        getRequiredNamingRegistryEntryBySource('tiers', 'Tier Battle Conditions').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Plasma Cannon').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Thorns').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Tier Rushing Guide Overview', 'Tier Rushing Guide Breakpoints and Limits', 'Milestone Tier Progression', 'Tier Unlock Requirement', 'Tier Battle Conditions', 'Plasma Cannon', 'Thorns'],
      interaction_type: 'cross_system',
      interaction_summary: 'Tier Rushing exists to clear early tier-unlock waves quickly, but it stops scaling once tier conditions start directly reducing the boss-kill shell. The guide therefore treats wave-100 milestone progression as the main target and marks Tier 14 as the point where Plasma Cannon and Thorns lose too much reliability under battle-condition resistance.',
      tags: ['guides', 'tier rushing', 'tier progression', 'tier battle conditions', 'plasma cannon', 'thorns', 'tier 14'],
      paragraphs: [
        'Tier Rushing Guide Overview frames the strategy as a short-range unlock tactic, not a farming build. Milestone Tier Progression and Tier Unlock Requirement are the real reason it exists: early tiers are opened by wave-100 clears, so a run that only survives a few extra bosses can still unlock the next tier and its milestone table.',
        'That same short-range logic is why the guide says the strategy is mostly worthless far past wave 100. Once the rush shell has spent its one-time layers, the build does not have a real long-run economy or survivability engine behind it.',
        'Tier Rushing Guide Breakpoints and Limits makes Tier 14 the main failure point because Tier Battle Conditions start applying fixed resistance packages there. Plasma Cannon and Thorns are both hit by that change, so the classic Plasma Cannon plus Thorns boss finish becomes much less reliable exactly where the guide says the strategy stops being worth building around.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_orbless_core_overlap_01',
      source: 'Orbless Guide Platform Reference',
      section: 'Guides',
      topic: 'Orbless Guide Overview with Spotlight, Golden Tower, Black Hole, Spotlight Coin Bonus, and Black Hole Coin Bonus',
      title: 'Orbless Guide Overview with Spotlight, Golden Tower, Black Hole, Spotlight Coin Bonus, and Black Hole Coin Bonus',
      disambiguation: 'This chunk is about the interaction between Orbless Guide Overview and its core overlapping multiplier systems, not the individual mechanics. It is not a generic Ultimate Weapon overview or a one-weapon upgrade plan.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Orbless Guide Overview').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Spotlight').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('labs', 'labs').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Orbless Guide Overview', 'Spotlight', 'Golden Tower', 'Black Hole', 'Spotlight Coin Bonus', 'Black Hole Coin Bonus'],
      interaction_type: 'cross_system',
      interaction_summary: 'Orbless stacks Spotlight, Golden Tower, and Black Hole coin windows by concentrating kills inside the overlapping zone, then relies on Spotlight Coin Bonus and Black Hole Coin Bonus to multiply those localized kills instead of accepting broader screen-wide clears.',
      tags: ['guides', 'orbless', 'spotlight', 'golden tower', 'black hole', 'coins'],
      paragraphs: [
        'Orbless is built around overlap, not raw damage. Spotlight marks the preferred kill zone while Golden Tower and Black Hole provide the economy window that makes those localized kills worth more than general clearing.',
        'Spotlight Coin Bonus and Black Hole Coin Bonus both matter because each one scales kills made inside its own zone, so the guide is really trying to maximize the count of enemies that die while all three systems are lined up at once.',
        'That is why the guide treats spillage as the enemy: every kill outside the overlapping Spotlight, Golden Tower, and Black Hole window is a kill that spent enemy density without collecting the full multiplier stack.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_orbless_uptime_modules_01',
      source: 'Orbless Guide Platform Reference',
      section: 'Guides',
      topic: 'Orbless Guide Requirements and Nice-to-Haves with Black Hole, Golden Tower, Death Wave, Multiverse Nexus, Galaxy Compressor, Singularity Harness, and Coin Bot',
      title: 'Orbless Guide Requirements and Nice-to-Haves with Black Hole, Golden Tower, Death Wave, Multiverse Nexus, Galaxy Compressor, Singularity Harness, and Coin Bot',
      disambiguation: 'This chunk is about the interaction between Orbless guide uptime planning and its main sync-support modules, not the individual mechanics. It is not a generic sync chart or a module pull recommendation.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Orbless Guide Requirements').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'Orbless Guide Nice-to-Haves').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Multiverse Nexus').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Galaxy Compressor').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Singularity Harness').data_source,
        getRequiredNamingRegistryEntryBySource('bots', 'Coin Bot').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Orbless Guide Requirements', 'Orbless Guide Nice-to-Haves', 'Black Hole', 'Golden Tower', 'Death Wave', 'Multiverse Nexus', 'Galaxy Compressor', 'Singularity Harness', 'Coin Bot'],
      interaction_type: 'cross_system',
      interaction_summary: 'Orbless wants high Black Hole and Golden Tower uptime first, can use Multiverse Nexus as the bridge to that state, then chooses between Galaxy Compressor or Singularity Harness plus Coin Bot depending on whether more cooldown compression or more multiplier overlap will produce better farming.',
      tags: ['guides', 'orbless', 'uptime', 'multiverse nexus', 'galaxy compressor', 'singularity harness', 'coin bot'],
      paragraphs: [
        'The guide treats Black Hole and Golden Tower uptime as the base requirement because Orbless needs enough overlap time to justify suppressing kills outside Spotlight in the first place.',
        'Multiverse Nexus is the bridge module when natural sync is not ready, but the guide still warns that weak MVN uptime can leave Orbless behind stronger devo variants if the shared cooldown penalty is not offset by enough overlap time.',
        'Orbless Guide Nice-to-Haves adds the late tuning layer on top of those base requirements: Galaxy Compressor is the preferred late-state module once cooldown compression is already strong, while Singularity Harness plus a synced Coin Bot is the lower-uptime alternative that can win before permanent GT and BH are truly online. Death Wave joins that same overlap discussion because it adds another multiplier and another uptime target without respecting Spotlight as cleanly as the main Orbless shells do.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_orbless_survival_controls_01',
      source: 'Orbless Guide Platform Reference',
      section: 'Guides',
      topic: 'Orbless Guide Survival Modes with Wall Health, Wall Regen, Wall Fortification, Wall Thorns, Black Hole Disable Ranged Enemies, and Chrono Field',
      title: 'Orbless Guide Survival Modes with Wall Health, Wall Regen, Wall Fortification, Wall Thorns, Black Hole Disable Ranged Enemies, and Chrono Field',
      disambiguation: 'This chunk is about the interaction between Orbless survival modes and the main survival mechanics they depend on, not the individual mechanics. It is not a general wall readiness guide or a full Chrono Field build.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Orbless Guide Survival Modes').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Wall Health').data_source,
        getRequiredNamingRegistryEntryBySource('labs', 'labs').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chrono Field').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Orbless Guide Survival Modes', 'Wall Health', 'Wall Regen', 'Wall Fortification', 'Wall Thorns', 'Black Hole Disable Ranged Enemies', 'Chrono Field'],
      interaction_type: 'conditional',
      interaction_summary: 'Orbless survival is modular: the wall branch depends on the wall package, the permanent Black Hole branch depends on Black Hole Disable Ranged Enemies, and the glass-cannon branch leans on Chrono Field to manage chips while the kill shell stays localized.',
      tags: ['guides', 'orbless', 'survival', 'wall', 'black hole', 'chrono field'],
      paragraphs: [
        'Wall-based Orbless is not just one row. Wall Health, Wall Regen, Wall Fortification, and Wall Thorns act as one package because the build needs the wall to survive repeated long-wave contact without letting early chip deaths break the kill zone.',
        'Permanent Black Hole is a separate survival branch, but the guide insists on Black Hole Disable Ranged Enemies because the hole does not solve ranged pressure if enemies can keep shooting from inside it.',
        'Chrono Field anchors the glass-cannon branch by making juggling workable enough that bullets or missiles can stay focused on localized kills instead of constantly being diverted into emergency survival clearing.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_orbless_damage_tools_01',
      source: 'Orbless Guide Platform Reference',
      section: 'Guides',
      topic: 'Orbless Guide Kill Methods and Strategy Tips with Target Priority 2, Rend Armor, Astral Deliverance, Chain Lightning, Spotlight Missiles, Smart Missiles, and Anti-Cube Portal',
      title: 'Orbless Guide Kill Methods and Strategy Tips with Target Priority 2, Rend Armor, Astral Deliverance, Chain Lightning, Spotlight Missiles, Smart Missiles, and Anti-Cube Portal',
      disambiguation: 'This chunk is about the interaction between Orbless kill shells and their main damage tools, not the individual mechanics. It is not a single-module tier list or a general Chain Lightning guide.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Orbless Guide Kill Methods').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'Orbless Guide Strategy Tips').data_source,
        getRequiredNamingRegistryEntryBySource('labs', 'labs').data_source,
        getRequiredNamingRegistryEntryBySource('workshop_enhancements', 'WSP_REND_ARMOR').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Astral Deliverance').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chain Lightning').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Spotlight').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Smart Missiles').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Anti-Cube Portal').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Orbless Guide Kill Methods', 'Orbless Guide Strategy Tips', 'Target Priority 2', 'Rend Armor', 'Astral Deliverance', 'Chain Lightning', 'Spotlight Missiles', 'Smart Missiles', 'Anti-Cube Portal'],
      interaction_type: 'cross_system',
      interaction_summary: 'Orbless kill shells stay viable by localizing damage: Target Priority 2 keeps bullets inside Spotlight, Rend Armor and Astral Deliverance make bullet shells strong enough to matter, Chain Lightning extends that bullet shell carefully, Spotlight Missiles inherits Smart Missiles damage for cleaner beam-only kills, and Anti-Cube Portal widens the damage window without needing more random kills.',
      tags: ['guides', 'orbless', 'target priority 2', 'astral deliverance', 'chain lightning', 'spotlight missiles', 'anti-cube portal'],
      paragraphs: [
        'Bullet Orbless depends on localization more than on raw damage. Target Priority 2 keeps projectile aim in Spotlight, while Rend Armor and Astral Deliverance create enough concentrated damage that bullets can finish enemies there instead of spraying kills everywhere else.',
        'Orbless Guide Strategy Tips then defines how that shell is upgraded over time: Chain Lightning is described as the extension of the bullet shell, not a completely separate philosophy, which is why the guide keeps warning that too much CL damage or quantity can undo the same localization Target Priority 2 created.',
        'Spotlight Missiles is the cleanest kill shell because the targeting rule is built into the lab itself, but it still inherits Smart Missiles damage and gains even more value when Anti-Cube Portal or similar amplification keeps enemies inside the eventual beam kill window long enough to matter.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_orbless_perks_control_01',
      source: 'Orbless Guide Platform Reference',
      section: 'Guides',
      topic: 'Orbless Guide Perk Plan and Run Phases with Perk Wave Requirement, Standard Perk Bonus, Improve Trade-Off Perks, Enemy Health Level Skip, and Enemy Attack Level Skip',
      title: 'Orbless Guide Perk Plan and Run Phases with Perk Wave Requirement, Standard Perk Bonus, Improve Trade-Off Perks, Enemy Health Level Skip, and Enemy Attack Level Skip',
      disambiguation: 'This chunk is about the interaction between Orbless perk timing and the support systems behind it, not the individual mechanics. It is not a universal perk order for every build.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Orbless Guide Perk Plan').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'Orbless Guide Run Phases').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Perk Wave Requirement').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Perk Labs').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Enemy Health Level Skip').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Enemy Attack Level Skip').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Orbless Guide Perk Plan', 'Orbless Guide Run Phases', 'Perk Wave Requirement', 'Standard Perk Bonus', 'Improve Trade-Off Perks', 'Enemy Health Level Skip', 'Enemy Attack Level Skip'],
      interaction_type: 'conditional',
      interaction_summary: 'Orbless perk timing is phase-dependent: Perk Wave Requirement and its Standard Perk Bonus scaling are taken early, Improve Trade-Off Perks strengthens the guide’s preferred coin and survival trade-offs, and Enemy Level Skip rows define the long early phase where the build delays damage picks to preserve the localized kill zone.',
      tags: ['guides', 'orbless', 'perks', 'perk wave requirement', 'enemy health level skip', 'enemy attack level skip'],
      paragraphs: [
        'Perk Wave Requirement comes first because long Orbless runs gain disproportionate value from earlier perk access, and Standard Perk Bonus makes each copy of that perk stronger through additive standard-perk math.',
        'Improve Trade-Off Perks matters because the guide leans on trade-off value like Coin Trade-Off and selective defensive trade-offs, but it still wants those perks delayed or accelerated based on the current Orbless phase rather than auto-picked on appearance.',
        'Orbless Guide Run Phases makes the timing rule explicit: Enemy Health Level Skip and Enemy Attack Level Skip define the early management phase of the run because the guide keeps investing there while intentionally delaying many damage perks and damage rows until the localized kill shell actually needs more power.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_perks_early_shell_01',
      source: 'Perks Guide Platform Reference',
      section: 'Guides',
      topic: 'Perks Guide Early Priorities with Perk Choice and Perk Labs',
      title: 'Perks Guide Early Priorities with Perk Choice and Perk Labs',
      disambiguation: 'This chunk is about the interaction between the early perks guide shell and the underlying perk systems, not the individual mechanics. It is not a full perks rules reference or a late-game perk order.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Perks Guide Early Priorities').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Perk Choice').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Perk Labs').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Perks Guide Early Priorities', 'Perk Choice', 'Perk Labs'],
      interaction_type: 'cross_system',
      interaction_summary: 'The early perks guide is fundamentally a Perk Choice and Perk Labs problem: more choices, bans, and first-offer control are what turn perks from a run-killing gamble into a reliable support system.',
      tags: ['guides', 'perks', 'perk choice', 'perk labs', 'early game'],
      paragraphs: [
        'Perks Guide Early Priorities starts from the fact that Perk Choice begins at only 2 options, which makes bad trade-off pairings common enough to kill underdeveloped runs outright.',
        'Perk Labs are the fix, not better luck. Perk Option Quantity expands Perk Choice to 3 and then 4 choices, while Ban Perks and First Perk Choice reshape the opening pool into something the guide considers actually usable.',
        'That is why the guide treats early perk investment as structural support: once Perk Choice and Perk Labs are working together, later perk picks become strategy instead of damage control.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_perks_coin_scaling_01',
      source: 'Perks Guide Platform Reference',
      section: 'Guides',
      topic: 'Perks Guide Coin Runs and Priority Routes with Perk Wave Requirement, Standard Perk Math, Trade-off Perks, and Ultimate Weapon Perks',
      title: 'Perks Guide Coin Runs and Priority Routes with Perk Wave Requirement, Standard Perk Math, Trade-off Perks, and Ultimate Weapon Perks',
      disambiguation: 'This chunk is about the interaction between the perks guide coin-routing advice and the mechanics behind it, not the individual mechanics. It is not a universal economy route for every build.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Perks Guide Coin Runs').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'Perks Guide Priority Routes').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Perk Wave Requirement').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Standard Perk Math').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Trade-off Perks').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Ultimate Weapon Perks').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Perks Guide Coin Runs', 'Perks Guide Priority Routes', 'Perk Wave Requirement', 'Standard Perk Math', 'Trade-off Perks', 'Ultimate Weapon Perks'],
      interaction_type: 'cross_system',
      interaction_summary: 'The perks guide coin path revolves around Perk Wave Requirement first, uses Standard Perk Math to explain why that perk scales so hard, then layers Trade-off Perks and Ultimate Weapon Perks only when the run goal and survival shell can actually convert them into better income.',
      tags: ['guides', 'perks', 'coin runs', 'perk wave requirement', 'trade-off perks', 'ultimate weapon perks'],
      paragraphs: [
        'Perks Guide Coin Runs starts with Perk Wave Requirement because long runs gain more from earlier access to every later perk than from almost any single greedy pickup taken in isolation.',
        'Standard Perk Math explains why that advice is so strong: Perk Wave Requirement is on the additive side of the formula, so Standard Perk Bonus directly amplifies each copy instead of leaving it at a flat listed value.',
        'Perks Guide Priority Routes then shows where Trade-off Perks and Ultimate Weapon Perks fit into that economy shell. The guide is willing to take coin-facing Trade-off Perks or powerful Ultimate Weapon Perks, but only after the run has enough survival and timing support that those perks improve income instead of collapsing the run.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_perks_milestone_push_01',
      source: 'Perks Guide Platform Reference',
      section: 'Guides',
      topic: 'Perks Guide Milestone Runs with Standard Perks, Enemy Attack Level Skip, Enemy Health Level Skip, and Cash',
      title: 'Perks Guide Milestone Runs with Standard Perks, Enemy Attack Level Skip, Enemy Health Level Skip, and Cash',
      disambiguation: 'This chunk is about the interaction between the perks guide milestone advice and the main systems it references, not the individual mechanics. It is not a milestone unlock table or a general cash guide.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Perks Guide Milestone Runs').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Standard Perks').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Enemy Attack Level Skip').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Enemy Health Level Skip').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Cash').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Perks Guide Milestone Runs', 'Standard Perks', 'Enemy Attack Level Skip', 'Enemy Health Level Skip', 'Cash'],
      interaction_type: 'conditional',
      interaction_summary: 'Milestone runs use Standard Perks for survivability and free-upgrade scaling, then lean on Enemy Attack Level Skip, Enemy Health Level Skip, and Cash support to reach battle-upgrade breakpoints that manual income alone would miss.',
      tags: ['guides', 'perks', 'milestones', 'standard perks', 'enemy attack level skip', 'enemy health level skip', 'cash'],
      paragraphs: [
        'Perks Guide Milestone Runs treats Standard Perks as the main perk pool for survival because that is where Defense Percent, Health, Damage, and the Free Upgrade perk all live.',
        'Enemy Attack Level Skip and Enemy Health Level Skip matter in the same section because the guide specifically calls them out as rows whose price ramps fast enough that earlier perk help changes whether the milestone push stabilizes or stalls.',
        'Cash is the early-run execution tool behind that plan. The guide recommends Cash support during the opening waves so expensive rows can be finished before Standard Perks and skip rows become too costly to catch up manually.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_perks_pool_control_01',
      source: 'Perks Guide Platform Reference',
      section: 'Guides',
      topic: 'Perks Guide Perk Reduction and Common Pitfalls with Perk Labs, Perk Wave Requirement, Random Ultimate Weapon Perk, and Perk Choice',
      title: 'Perks Guide Perk Reduction and Common Pitfalls with Perk Labs, Perk Wave Requirement, Random Ultimate Weapon Perk, and Perk Choice',
      disambiguation: 'This chunk is about the interaction between the perks guide pool-control advice and the mechanics behind it, not the individual mechanics. It is not a full perk odds model or a lab cost calculator.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Perks Guide Perk Reduction').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'Perks Guide Common Pitfalls').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Perk Labs').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Perk Wave Requirement').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Random Ultimate Weapon Perk').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Perk Choice').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Perks Guide Perk Reduction', 'Perks Guide Common Pitfalls', 'Perk Labs', 'Perk Wave Requirement', 'Random Ultimate Weapon Perk', 'Perk Choice'],
      interaction_type: 'conditional',
      interaction_summary: 'The perks guide reduces bad offerings through Perk Labs and Perk Wave Requirement over the long term, then uses run-level pool cleanup such as taking a low-value Random Ultimate Weapon Perk result when it improves future Perk Choice quality. The same section also warns against overinvesting in the wrong perk labs.',
      tags: ['guides', 'perks', 'perk labs', 'perk wave requirement', 'random ultimate weapon perk', 'perk choice', 'pitfalls'],
      paragraphs: [
        'Perks Guide Perk Reduction begins with Perk Labs because Ban Perks, Perk Option Quantity, First Perk Choice, Standard Perk Bonus, and the Waves Required lab all improve future offerings before the run even starts.',
        'Perk Wave Requirement is the guide’s main in-run acceleration tool, but the guide also highlights a second form of control: using Random Ultimate Weapon Perk logic to consume a low-value one-time perk so it stops polluting later Perk Choice offerings.',
        'Perks Guide Common Pitfalls closes the loop by warning that not every perk lab is worth heavy investment. The guide specifically pushes back on over-leveling Waves Required too far, relying on Auto Pick too early, or assuming First Perk Choice can force a trade-off perk that is not actually guaranteed by Perk Choice rules.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_smax_devo_core_sync_01',
      source: 'SMAX Devo Guide Platform Reference',
      section: 'Guides',
      topic: 'SMAX Devo Guide Overview, Requirements, and Run Plan with Smart Missiles, Black Hole, Golden Tower, and Multiverse Nexus',
      title: 'SMAX Devo Guide Overview, Requirements, and Run Plan with Smart Missiles, Black Hole, Golden Tower, and Multiverse Nexus',
      disambiguation: 'This chunk is about the interaction between SMAX Devo timing and its core synced Ultimate Weapon shell, not the individual mechanics. It is not a generic sync chart or a stone-spending calculator.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'SMAX Devo Guide Overview').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'SMAX Devo Guide Requirements').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'SMAX Devo Guide Run Plan').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Smart Missiles').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Multiverse Nexus').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['SMAX Devo Guide Overview', 'SMAX Devo Guide Requirements', 'SMAX Devo Guide Run Plan', 'Smart Missiles', 'Black Hole', 'Golden Tower', 'Multiverse Nexus'],
      interaction_type: 'cross_system',
      interaction_summary: 'SMAX Devo is built around one synced payout window: Black Hole and Golden Tower create the bonus timing, Smart Missiles is deliberately delayed so it hits the fully collected stack, and Multiverse Nexus is only the temporary bridge when natural sync is not ready yet.',
      tags: ['guides', 'smax devo', 'smart missiles', 'black hole', 'golden tower', 'multiverse nexus', 'sync'],
      paragraphs: [
        'SMAX Devo Guide Requirements says the build only works if Smart Missiles, Black Hole, and Golden Tower are treated as one timing family rather than as separate upgrades. Black Hole and Golden Tower define the economic window, and Smart Missiles is the shell that actually spends the stack inside that window.',
        'The guide therefore delays Smart Missiles slightly after Black Hole instead of firing it on the same frame. Black Hole needs time to collect the enemies into a tighter clump first, which makes the missile volley more likely to clear the valuable part of the pile instead of scattering damage inefficiently.',
        'SMAX Devo Guide Run Plan allows Multiverse Nexus as the bridge module while natural sync is still missing, but it still treats real synchronized timing as the durable goal because the whole run plan depends on repeated clean overlap between the Smart Missiles clear and the Black Hole plus Golden Tower payout window.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_smax_devo_control_shell_01',
      source: 'SMAX Devo Guide Platform Reference',
      section: 'Guides',
      topic: 'SMAX Devo Guide Workshop Devo and Cards and Support with Thorn Damage, Shockwave Size, Enemy Balance, Recovery Package Chance, Galaxy Compressor, and Wormhole Redirector',
      title: 'SMAX Devo Guide Workshop Devo and Cards and Support with Thorn Damage, Shockwave Size, Enemy Balance, Recovery Package Chance, Galaxy Compressor, and Wormhole Redirector',
      disambiguation: 'This chunk is about the interaction between SMAX Devo control rows and the support shell around them, not the individual mechanics. It is not a full card tier list or a general module ranking.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'SMAX Devo Guide Workshop Devo').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'SMAX Devo Guide Cards and Support').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Shockwave Size').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'workshop').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Enemy Balance').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Recovery Package Chance').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Galaxy Compressor').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Wormhole Redirector').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['SMAX Devo Guide Workshop Devo', 'SMAX Devo Guide Cards and Support', 'Thorn Damage', 'Shockwave Size', 'Enemy Balance', 'Recovery Package Chance', 'Galaxy Compressor', 'Wormhole Redirector'],
      interaction_type: 'conditional',
      interaction_summary: 'The SMAX Devo control shell works by keeping kill rows suppressed, using Shockwave Size and Thorn Damage as careful trim controls, and then choosing survival support around whether the build is leaning on Wall, Recovery Package Chance, Galaxy Compressor, or Wormhole Redirector.',
      tags: ['guides', 'smax devo', 'thorns', 'shockwave', 'enemy balance', 'recovery package chance', 'wormhole redirector'],
      paragraphs: [
        'SMAX Devo Guide Workshop Devo keeps the normal devo rows at zero for the same reason as the other devo branches: Attack Speed, multishot, bounce behavior, free upgrades, and untuned land mines all create kills before the real payout window is ready.',
        'Shockwave Size and Thorn Damage are the exceptions because the guide uses them as control tools, not as free damage. Shockwave Size shuffles basics downward in the pile, and Thorn Damage trims those basics without deleting too many tanks when it is raised slowly instead of maxed blindly.',
        'SMAX Devo Guide Cards and Support then builds the survival shell around that same control problem. Enemy Balance helps create the dense stack the build wants, while Recovery Package Chance matters more when package-driven support such as Galaxy Compressor is active. If the run is instead leaning on Regen-based survival, Wormhole Redirector is the named module that makes that approach scale much harder later on.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_smax_devo_transition_01',
      source: 'SMAX Devo Guide Platform Reference',
      section: 'Guides',
      topic: 'SMAX Devo Guide Run Plan, Cards and Support, and Common Pitfalls with Black Hole Damage, Extra Black Hole, Orb Devo Guide Run Plan, and Free Upgrade Rows',
      title: 'SMAX Devo Guide Run Plan, Cards and Support, and Common Pitfalls with Black Hole Damage, Extra Black Hole, Orb Devo Guide Run Plan, and Free Upgrade Rows',
      disambiguation: 'This chunk is about the interaction between SMAX Devo transition timing and the systems that support it, not the individual mechanics. It is not an Orb Devo replacement guide or a standalone protector explainer.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'SMAX Devo Guide Run Plan').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'SMAX Devo Guide Cards and Support').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'SMAX Devo Guide Common Pitfalls').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('labs', 'labs').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'Orb Devo Guide Run Plan').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Free Attack Upgrade').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Free Defense Upgrade').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Free Utility Upgrade').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['SMAX Devo Guide Run Plan', 'SMAX Devo Guide Cards and Support', 'SMAX Devo Guide Common Pitfalls', 'Black Hole Damage', 'Extra Black Hole', 'Orb Devo Guide Run Plan', 'Free Attack Upgrade', 'Free Defense Upgrade', 'Free Utility Upgrade'],
      interaction_type: 'conditional',
      interaction_summary: 'SMAX stays stable only while Black Hole support keeps the missile shell productive; Black Hole Damage and Extra Black Hole keep the stack manageable, then the build hands off into Orb Devo once missiles stop one-volleying, and finally into the three Free Upgrade rows for the last blender phase.',
      tags: ['guides', 'smax devo', 'black hole damage', 'extra black hole', 'orb devo', 'free upgrades', 'transition'],
      paragraphs: [
        'SMAX Devo Guide Cards and Support gives the protector answer directly: maxed Black Hole Damage plus enough duration support is what keeps protectors from stalling the stack during the late missile phase, and Extra Black Hole improves that same hold-and-burn shell by adding more total coverage.',
        'SMAX Devo Guide Run Plan then defines the transition rule. The build is not meant to force Smart Missiles forever; once Smart Missiles can no longer clear the stack in one volley, the guide explicitly moves into Orb Devo Guide Run Plan instead of continuing to over-invest in a shell that is already breaking down.',
        'SMAX Devo Guide Common Pitfalls explains why that handoff matters. The build is less vulnerable to protectors than Orb Devo while missiles are still strong, but when that damage check fails the run can collapse quickly. That is why the last emergency layer is still Free Attack Upgrade, Free Defense Upgrade, and Free Utility Upgrade, which convert the run from controlled devo play into a normal blender endgame instead of letting the tower die with cash unused.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_smax_devo_perks_survival_01',
      source: 'SMAX Devo Guide Platform Reference',
      section: 'Guides',
      topic: 'SMAX Devo Guide Perk Priorities and Survival Priorities with Perk Wave Requirement, Standard Perk Bonus, Defense %, Defense Absolute, Enemy Attack Level Skip, and Enemy Health Level Skip',
      title: 'SMAX Devo Guide Perk Priorities and Survival Priorities with Perk Wave Requirement, Standard Perk Bonus, Defense %, Defense Absolute, Enemy Attack Level Skip, and Enemy Health Level Skip',
      disambiguation: 'This chunk is about the interaction between SMAX Devo perk timing and its survival ladder, not the individual mechanics. It is not a universal devo perk order or a raw stat formula page.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'SMAX Devo Guide Perk Priorities').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'SMAX Devo Guide Survival Priorities').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Perk Wave Requirement').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Standard Perk Math').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'workshop').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Defense Absolute').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Enemy Attack Level Skip').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Enemy Health Level Skip').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['SMAX Devo Guide Perk Priorities', 'SMAX Devo Guide Survival Priorities', 'Perk Wave Requirement', 'Standard Perk Bonus', 'Defense %', 'Defense Absolute', 'Enemy Attack Level Skip', 'Enemy Health Level Skip'],
      interaction_type: 'conditional',
      interaction_summary: 'SMAX perk timing is split between economy first and survival second: Perk Wave Requirement accelerates the whole run, Standard Perk Bonus strengthens the later defensive shell, Defense Absolute carries the youngest accounts, and Enemy Level Skip rows define the expensive offense and survival bridge once the run is stable.',
      tags: ['guides', 'smax devo', 'perks', 'perk wave requirement', 'defense percent', 'defense absolute', 'enemy level skip'],
      paragraphs: [
        'SMAX Devo Guide Perk Priorities opens like the other late devo guides with Perk Wave Requirement because long farming runs gain more from earlier perk access than from most single greedy picks taken in isolation. Standard Perk Bonus matters in the same shell because it strengthens the additive side of those standard perk effects as the run deepens.',
        'The survival side is staged, not universal. SMAX Devo Guide Survival Priorities uses Defense Absolute first on very early accounts, then shifts into Health and later Defense % once the account has enough cards, modules, and perk support to approach the real defensive cap the guide is aiming for.',
        'Enemy Health Level Skip and Enemy Attack Level Skip connect those two halves. Enemy Health Level Skip belongs to the offense-first cash phase because SMAX still needs missiles to clear, while Enemy Attack Level Skip becomes part of the defensive phase because the build eventually stops dying to cheap early damage and starts dying to late-wave scaling instead.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_smax_devo_improvements_rel_01',
      source: 'SMAX Devo Guide Platform Reference',
      section: 'Guides',
      topic: 'SMAX Devo Guide Improvement Paths with Smart Missiles, Missile Amplifier, Missile Radius, Galaxy Compressor, Coin Bot, and Ultimate Crit',
      title: 'SMAX Devo Guide Improvement Paths with Smart Missiles, Missile Amplifier, Missile Radius, Galaxy Compressor, Coin Bot, and Ultimate Crit',
      disambiguation: 'This chunk is about the interaction between SMAX Devo improvement planning and the specific mechanics it leans on, not the individual mechanics. It is not a raw Smart Missiles stat dump or a bot priority guide.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'SMAX Devo Guide Improvement Paths').data_source,
        getRequiredNamingRegistryEntryBySource('guides', 'SMAX Devo Guide Cards and Support').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Smart Missiles').data_source,
        getRequiredNamingRegistryEntryBySource('labs', 'labs').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Galaxy Compressor').data_source,
        getRequiredNamingRegistryEntryBySource('bots', 'Coin Bot').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Ultimate Crit').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['SMAX Devo Guide Improvement Paths', 'SMAX Devo Guide Cards and Support', 'Smart Missiles', 'Missile Amplifier', 'Missile Radius', 'Galaxy Compressor', 'Coin Bot', 'Ultimate Crit'],
      interaction_type: 'cross_system',
      interaction_summary: 'The SMAX guide improves the missile shell through Smart Missiles support systems more than through raw damage alone: Missile Amplifier and Missile Radius improve real stack clears, Galaxy Compressor changes the package-driven cooldown path, Coin Bot is the fallback support when Galaxy Compressor is absent, and Ultimate Crit is one of the extra damage levers once the base shell already works.',
      tags: ['guides', 'smax devo', 'smart missiles', 'missile amplifier', 'missile radius', 'galaxy compressor', 'coin bot', 'ultimate crit'],
      paragraphs: [
        'SMAX Devo Guide Improvement Paths explicitly says the best missile upgrades are not just more Smart Missiles damage stones. The guide prefers Missile Amplifier, some Missile Radius, and more missile quantity because those upgrades improve how well each Smart Missiles volley actually clears the stacked clump.',
        'Galaxy Compressor changes the same improvement discussion because package-driven cooldown compression can create more frequent Ultimate Weapon windows than a simple static cooldown comparison would imply. When Galaxy Compressor is not the chosen support path, the guide names a synced Coin Bot as the alternate multiplier support that helps the run keep pace.',
        'SMAX Devo Guide Cards and Support also leaves room for Ultimate Crit as one of the late extra damage levers once the shell is already stable. The guide is not claiming Ultimate Crit alone makes the build work; it is part of the broader pattern that mature SMAX improvements come from synchronized support layers rather than from one isolated stat spike.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_gems_slots_gems_labs_01',
      source: 'Gems Guide Platform Reference',
      section: 'Guides',
      topic: 'Gems Guide Lab Slots with Gems, Lab Slots, Lab Slot Costs, and Milestones',
      title: 'Gems Guide Lab Slots with Gems, Lab Slots, Lab Slot Costs, and Milestones',
      disambiguation: 'This chunk is about the interaction between Gems Guide Lab Slots and the main capacity-gating systems it depends on, not the individual mechanics. It is not a general milestone walkthrough or a gem-income guide.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Gems Guide Lab Slots').data_source,
        getRequiredNamingRegistryEntryBySource('currency', 'Gems').data_source,
        getRequiredNamingRegistryEntryBySource('labs', 'labs').data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'Milestones').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Gems Guide Lab Slots', 'Gems', 'Lab Slots', 'Lab Slot Costs', 'Milestones'],
      interaction_type: 'cross_system',
      interaction_summary: 'Gems Guide Lab Slots treats Gems as the price for permanent Lab Slots capacity, uses Lab Slot Costs to explain the exact early ladder, and depends on Milestones because the first lab slot access does not exist before Tier 1 Wave 30.',
      tags: ['guides', 'gems', 'labs', 'slots', 'milestones'],
      paragraphs: [
        'Gems Guide Lab Slots treats Gems as the resource that unlocks permanent Lab Slots instead of as temporary power.',
        'Lab Slot Costs are the reason the guide keeps returning to lab capacity after each early card checkpoint: slots 2 through 5 cost 100, 400, 1400, and 3000 Gems, so the full Lab Slots ladder is a real medium-term project rather than a trivial detour.',
        'Milestones still matter because Lab Slots do not start until Tier 1 Wave 30, which means the guide is optimizing post-unlock gem sequencing rather than bypassing the Milestones gate itself.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_gems_cards_core_shell_01',
      source: 'Gems Guide Platform Reference',
      section: 'Guides',
      topic: 'Gems Guide Early Cards and Slots with Attack Speed, Enemy Balance, Coins, Card Slots, and Card Slot Costs',
      title: 'Gems Guide Early Cards and Slots with Attack Speed, Enemy Balance, Coins, Card Slots, and Card Slot Costs',
      disambiguation: 'This chunk is about the interaction between Gems Guide Early Cards and Slots and its first card-shell mechanics, not the individual mechanics. It is not a card rarity table or a full loadout optimizer.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Gems Guide Early Cards and Slots').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Attack Speed').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Enemy Balance').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Coins').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'cards').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Gems Guide Early Cards and Slots', 'Attack Speed', 'Enemy Balance', 'Coins', 'Card Slots', 'Card Slot Costs'],
      interaction_type: 'cross_system',
      interaction_summary: 'Gems Guide Early Cards and Slots uses Attack Speed, Enemy Balance, and Coins as the first real card shell, then buys Card Slots only fast enough to keep those cards equipped, while Card Slot Costs explain why the guide avoids overspending on empty loadout capacity.',
      tags: ['guides', 'gems', 'cards', 'slots', 'attack speed', 'enemy balance', 'coins'],
      paragraphs: [
        'Gems Guide Early Cards and Slots begins with Attack Speed, Enemy Balance, and Coins because those three cards raise early run tempo, enemy volume, and economy at the same time.',
        'Card Slots are bought only to the point where Attack Speed, Enemy Balance, and Coins can all be equipped together, which keeps the early shell live instead of leaving one of the guide priorities on the bench.',
        'Card Slot Costs support that restraint because each extra Card Slots purchase competes with labs and future cards, so the guide wants immediate loadout value before spending another step on the slot ladder.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_gems_cards_expansion_01',
      source: 'Gems Guide Platform Reference',
      section: 'Guides',
      topic: 'Gems Guide Early Cards and Slots with Health, Cash, Critical Coin, Wave Skip, Extra Orb, and Card Slots',
      title: 'Gems Guide Early Cards and Slots with Health, Cash, Critical Coin, Wave Skip, Extra Orb, and Card Slots',
      disambiguation: 'This chunk is about the interaction between Gems Guide Early Cards and Slots and its follow-up card additions, not the individual mechanics. It is not a card mastery guide or a late-game farming build.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Gems Guide Early Cards and Slots').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Health').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Cash').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Critical Coin').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Wave Skip').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Extra Orb').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'cards').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Gems Guide Early Cards and Slots', 'Health', 'Cash', 'Critical Coin', 'Wave Skip', 'Extra Orb', 'Card Slots'],
      interaction_type: 'cross_system',
      interaction_summary: 'Gems Guide Early Cards and Slots expands the first shell by adding Health and Cash after Lab slot 3, then adds two of Critical Coin, Wave Skip, and Extra Orb after Lab slot 4, with Card Slots increasing only when those new cards would actually enter the loadout.',
      tags: ['guides', 'gems', 'cards', 'health', 'cash', 'critical coin', 'wave skip', 'extra orb'],
      paragraphs: [
        'Gems Guide Early Cards and Slots adds Health and Cash first because Health stabilizes early survival while Cash helps the live run economy keep up with new tiers and workshop costs.',
        'After that, the guide moves into Critical Coin, Wave Skip, and Extra Orb, but it only asks for two of those three at the Lab slot 4 stage so Card Slots spending does not outrun actual card value.',
        'Card Slots therefore act as the execution layer for Health, Cash, Critical Coin, Wave Skip, and Extra Orb rather than as a separate gem sink with its own independent priority.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_gems_modules_floor_01',
      source: 'Gems Guide Platform Reference',
      section: 'Guides',
      topic: 'Gems Guide First Epic Modules with Module Acquisition, Module Types, Module Sub-Module Effects, Unique Effects, Havoc Bringer, Rend Armor Enhancement, and Chrono Field',
      title: 'Gems Guide First Epic Modules with Module Acquisition, Module Types, Module Sub-Module Effects, Unique Effects, Havoc Bringer, Rend Armor Enhancement, and Chrono Field',
      disambiguation: 'This chunk is about the interaction between Gems Guide First Epic Modules and the module systems it references, not the individual mechanics. It is not a featured-banner plan or a unique-module tier list.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Gems Guide First Epic Modules').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'modules').data_source,
        getRequiredNamingRegistryEntryBySource('workshop_enhancements', 'WSP_REND_ARMOR').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chrono Field').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Gems Guide First Epic Modules', 'Module Acquisition', 'Module Types', 'Module Sub-Module Effects', 'Unique Effects', 'Havoc Bringer', 'Rend Armor Enhancement', 'Chrono Field'],
      interaction_type: 'cross_system',
      interaction_summary: 'Gems Guide First Epic Modules uses Module Acquisition to reach one Epic across the Module Types first, prioritizes Module Sub-Module Effects over perfect Unique Effects, and warns that examples such as Havoc Bringer, Rend Armor Enhancement, and Chrono Field show why many uniques are progression-gated on younger accounts.',
      tags: ['guides', 'gems', 'modules', 'epics', 'havoc bringer', 'rend armor', 'chrono field'],
      paragraphs: [
        'Gems Guide First Epic Modules uses Module Acquisition to establish one Epic in each of the four Module Types before trying to optimize banners or chase one favorite unique.',
        'That first Epic floor matters because Epic rarity opens stronger Module Sub-Module Effects, while Unique Effects are still inconsistent for a young account that has not unlocked every dependency.',
        'Havoc Bringer is the guide example for that problem because Havoc Bringer depends on Rend Armor Enhancement being relevant, and Chrono Field shows the same issue on the Core side because many Core bonuses do not matter until the matching Ultimate Weapon exists at all.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_gems_loop_cards_modules_01',
      source: 'Gems Guide Platform Reference',
      section: 'Guides',
      topic: 'Gems Guide Ongoing Spending Loop with Card Slots, Card Slot Costs, Modules, Plasma Cannon, and Wave Accelerator',
      title: 'Gems Guide Ongoing Spending Loop with Card Slots, Card Slot Costs, Modules, Plasma Cannon, and Wave Accelerator',
      disambiguation: 'This chunk is about the interaction between Gems Guide Ongoing Spending Loop and the main card-versus-module tradeoffs it names, not the individual mechanics. It is not a complete card draw-odds reference or a module pull-rate calculator.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Gems Guide Ongoing Spending Loop').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'cards').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'modules').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Plasma Cannon').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Wave Accelerator').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Gems Guide Ongoing Spending Loop', 'Card Slots', 'Card Slot Costs', 'Modules', 'Plasma Cannon', 'Wave Accelerator'],
      interaction_type: 'cross_system',
      interaction_summary: 'Gems Guide Ongoing Spending Loop treats Plasma Cannon and Wave Accelerator as strong card hits, but it uses Card Slots and Card Slot Costs to decide when another slot is justified and keeps Modules on a standing budget instead of abandoning them completely.',
      tags: ['guides', 'gems', 'cards', 'modules', 'plasma cannon', 'wave accelerator', 'slots'],
      paragraphs: [
        'Gems Guide Ongoing Spending Loop calls out Plasma Cannon and Wave Accelerator as strong cards, but it still refuses to let one attractive draw override the broader loadout plan.',
        'The guide uses Card Slots as a yes-or-no question: if Plasma Cannon, Wave Accelerator, or another already-owned card would improve the current build immediately, buy the slot; if not, keep improving the card pool first.',
        'Card Slot Costs keep that rule honest because later slots get expensive fast, and Modules therefore remain in the loop through a steady side budget instead of being paused until every card goal is finished.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_gems_rushing_labs_01',
      source: 'Gems Guide Platform Reference',
      section: 'Guides',
      topic: 'Gems Guide Lab Rushing with Gems, Lab Rushing, and Chrono Field',
      title: 'Gems Guide Lab Rushing with Gems, Lab Rushing, and Chrono Field',
      disambiguation: 'This chunk is about the interaction between Gems Guide Lab Rushing and the named rush mechanics it references, not the individual mechanics. It is not a full Chrono Field upgrade plan or a gem-income estimate.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Gems Guide Lab Rushing').data_source,
        getRequiredNamingRegistryEntryBySource('currency', 'Gems').data_source,
        getRequiredNamingRegistryEntryBySource('labs', 'labs').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chrono Field').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Gems Guide Lab Rushing', 'Gems', 'Lab Rushing', 'Chrono Field'],
      interaction_type: 'conditional',
      interaction_summary: 'Gems Guide Lab Rushing treats Gems as a late-stage time-skip resource, uses Lab Rushing only when timers are long enough to justify the spend, and points to Chrono Field as the clearest example of a powerful later lab family whose duration lab can become worth rushing once unlocked.',
      tags: ['guides', 'gems', 'labs', 'rushing', 'chrono field'],
      paragraphs: [
        'Gems Guide Lab Rushing turns Gems into time only after the main lab-slot foundation already exists.',
        'Lab Rushing is the tool for that conversion, but the guide keeps it selective by naming long researches such as Lab Speed, Attack Speed, and Chrono Field Duration instead of recommending blanket rushing on every short timer.',
        'Chrono Field is the late-game example because Chrono Field labs do not even exist until Tier 7 Wave 90, which reinforces the guide point that rushing comes after the account already has enough depth to value those long timers.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_coin_multipliers_currency_01',
      source: 'Coin Guide Platform Reference',
      section: 'Guides',
      topic: 'Coin Guide Multipliers with Coins, Tier Coin Bonus, Theme Passive Coin Bonus, and Coin Bonus Enhancement',
      title: 'Coin Guide Multipliers with Coins, Tier Coin Bonus, Theme Passive Coin Bonus, and Coin Bonus Enhancement',
      disambiguation: 'This chunk is about the interaction between Coin Guide Multipliers and the main permanent coin-scaling systems, not the individual mechanics. It is not a run simulator or a raw shop-price table.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Coin Guide Multipliers').data_source,
        getRequiredNamingRegistryEntryBySource('currency', 'Coins').data_source,
        getRequiredNamingRegistryEntryBySource('tiers', 'Tier Coin Bonus').data_source,
        getRequiredNamingRegistryEntryBySource('themes', 'Theme Passive Coin Bonus').data_source,
        getRequiredNamingRegistryEntryBySource('workshop_enhancements', 'WSP_COIN_BONUS').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Coin Guide Multipliers', 'Coins', 'Tier Coin Bonus', 'Theme Passive Coin Bonus', 'Coin Bonus Enhancement'],
      interaction_type: 'multiplicative',
      interaction_summary: 'Coin Guide Multipliers explains that long-term coin growth comes from stacking the base Coins economy with Tier Coin Bonus, Theme Passive Coin Bonus, and Coin Bonus Enhancement rather than overfocusing one multiplier in isolation.',
      tags: ['guides', 'coins', 'tiers', 'themes', 'workshop enhancements'],
      paragraphs: [
        'Coin Guide Multipliers treats Coins as a stacking economy rather than a single workshop number.',
        'Tier Coin Bonus raises the base value for harder tiers, Theme Passive Coin Bonus adds permanent ownership-based coin scaling, and Coin Bonus Enhancement further multiplies the same economy from the Workshop Enhancements side.',
        'That is why Coin Guide Multipliers recommends seeking new multipliers and overlap instead of pushing one already-inflated coin source alone.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_coin_syncing_uw_modules_01',
      source: 'Coin Guide Platform Reference',
      section: 'Guides',
      topic: 'Coin Guide Syncing with Golden Tower, Black Hole, Death Wave, and Multiverse Nexus',
      title: 'Coin Guide Syncing with Golden Tower, Black Hole, Death Wave, and Multiverse Nexus',
      disambiguation: 'This chunk is about the interaction between Coin Guide Syncing and the core sync-sensitive mechanics, not the individual mechanics. It is not a full stone-planning spreadsheet or a general module tier list.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Coin Guide Syncing').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Multiverse Nexus').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Coin Guide Syncing', 'Golden Tower', 'Black Hole', 'Death Wave', 'Multiverse Nexus'],
      interaction_type: 'cross_system',
      interaction_summary: 'Coin Guide Syncing is centered on keeping Golden Tower and Black Hole aligned, optionally extending that timing to Death Wave, while Multiverse Nexus offers an averaged-cooldown shortcut with tradeoffs.',
      tags: ['guides', 'coins', 'sync', 'golden tower', 'black hole', 'death wave', 'multiverse nexus'],
      paragraphs: [
        'Coin Guide Syncing uses Golden Tower and Black Hole as the core example because their overlap is one of the largest coin multipliers in the game.',
        'Death Wave can be folded into the same sync family for coin strategies, while Multiverse Nexus can temporarily synchronize Death Wave, Golden Tower, and Black Hole by averaging their cooldowns with a modifier.',
        'The guide also emphasizes that higher-ratio syncs are harder to maintain because Golden Tower and Black Hole upgrades must be saved in the right proportions before either cooldown is changed.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_coin_sources_uw_bots_relics_01',
      source: 'Coin Guide Platform Reference',
      section: 'Guides',
      topic: 'Coin Guide Coin Sources with Golden Tower, Black Hole, Spotlight, Death Wave, Coin Bot, Theme Passive Coin Bonus, and Relics',
      title: 'Coin Guide Coin Sources with Golden Tower, Black Hole, Spotlight, Death Wave, Coin Bot, Theme Passive Coin Bonus, and Relics',
      disambiguation: 'This chunk is about the interaction between Coin Guide Coin Sources and the main named coin multipliers, not the individual mechanics. It is not a complete medal-budget guide or a relic catalog.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Coin Guide Coin Sources').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Spotlight').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave').data_source,
        getRequiredNamingRegistryEntryBySource('bots', 'Coin Bot').data_source,
        getRequiredNamingRegistryEntryBySource('themes', 'Theme Passive Coin Bonus').data_source,
        getRequiredNamingRegistryEntryBySource('relics', 'relics').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Coin Guide Coin Sources', 'Golden Tower', 'Black Hole', 'Spotlight', 'Death Wave', 'Coin Bot', 'Theme Passive Coin Bonus', 'Relics'],
      interaction_type: 'multiplicative',
      interaction_summary: 'Coin Guide Coin Sources groups permanent sources like Theme Passive Coin Bonus and Relics with timed sources like Golden Tower, Black Hole, Spotlight, Death Wave, and Coin Bot because coin value comes from stacking all of them on the same kills.',
      tags: ['guides', 'coins', 'golden tower', 'black hole', 'spotlight', 'death wave', 'coin bot', 'themes', 'relics'],
      paragraphs: [
        'Coin Guide Coin Sources does not treat Golden Tower, Black Hole, Spotlight, Death Wave, and Coin Bot as isolated bonuses because their best value comes from overlapping the same kill windows.',
        'Theme Passive Coin Bonus and Relics are the permanent side of that same economy, adding account-level multipliers that remain valuable before the timed systems even activate.',
        'That is why the guide lists both permanent ownership bonuses and timed activation bonuses together under one coin-source strategy instead of splitting them into unrelated buckets.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_coin_daily_missions_tiers_01',
      source: 'Coin Guide Platform Reference',
      section: 'Guides',
      topic: 'Coin Guide Daily Missions with Daily Mission Rewards and Tiers',
      title: 'Coin Guide Daily Missions with Daily Mission Rewards and Tiers',
      disambiguation: 'This chunk is about the interaction between Coin Guide Daily Missions, Daily Mission Rewards, and Tiers, not the individual mechanics. It is not a weekly mission ladder or a milestone unlock table.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Coin Guide Daily Missions').data_source,
        getRequiredNamingRegistryEntryBySource('daily_missions', 'Daily Mission Rewards').data_source,
        getRequiredNamingRegistryEntryBySource('tiers', 'tiers').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Coin Guide Daily Missions', 'Daily Mission Rewards', 'Tiers'],
      interaction_type: 'conditional',
      interaction_summary: 'Coin Guide Daily Missions notes that Daily Mission Rewards scale from unlocked Tiers, which makes early tier pushing a valid temporary coin strategy before the main kill-based economy takes over.',
      tags: ['guides', 'coins', 'daily missions', 'tiers'],
      paragraphs: [
        'Coin Guide Daily Missions treats Daily Mission Rewards as an early supplement rather than the main economy engine.',
        'Because Daily Mission Rewards scale from unlocked Tiers, pushing higher Tiers early can raise those coin payouts even before the account has a strong Coins / Kill setup.',
        'The guide still frames that as temporary because Daily Mission Rewards eventually become tiny compared with the main kill-based economy once Tiers and multipliers are stable.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_ehp_setup_foundations_01',
      source: 'eHP Guide Platform Reference',
      section: 'Guides',
      topic: 'eHP Guide Starting Setup with Orbs, Free Upgrade Rows, Core Cards, Coin Bot, and Wormhole Redirector',
      title: 'eHP Guide Starting Setup with Orbs, Free Upgrade Rows, Core Cards, Coin Bot, and Wormhole Redirector',
      disambiguation: 'This chunk is about the interaction between the eHP Guide Starting Setup and its main enabling mechanics, not the individual mechanics. It is not a full medal-spending guide, a module tier list, or a card-slot cost table.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'eHP Guide Starting Setup').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Orbs').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Free Attack Upgrade').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Free Defense Upgrade').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Free Utility Upgrade').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Enemy Balance').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Health').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Attack Speed').data_source,
        getRequiredNamingRegistryEntryBySource('bots', 'Coin Bot').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Wormhole Redirector').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['eHP Guide Starting Setup', 'Orbs', 'Free Attack Upgrade', 'Free Defense Upgrade', 'Free Utility Upgrade', 'Enemy Balance', 'Health', 'Attack Speed', 'Coin Bot', 'Wormhole Redirector'],
      interaction_type: 'cross_system',
      interaction_summary: 'The eHP opener works because Orbs and the three Free Upgrade rows provide baseline survival while Health, Attack Speed, and Enemy Balance cards stabilize early runs, with Coin Bot and Wormhole Redirector acting as optional power spikes.',
      tags: ['guides', 'ehp', 'setup', 'orbs', 'free upgrades', 'coin bot', 'wormhole redirector'],
      paragraphs: [
        'eHP Guide Starting Setup is intentionally light on hard requirements because it leans on widely available foundations instead of needing a specific Ultimate Weapon opener.',
        'Orbs plus the Free Attack Upgrade, Free Defense Upgrade, and Free Utility Upgrade rows are the main workshop enablers, while Health, Attack Speed, and Enemy Balance are part of the early card shell that helps the build survive and keep basic economy moving.',
        'Coin Bot and Wormhole Redirector are optional accelerants rather than prerequisites, which fits the guide emphasis on a cheap start with scalable add-ons later.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_ehp_workshop_skips_01',
      source: 'eHP Guide Platform Reference',
      section: 'Guides',
      topic: 'eHP Guide Workshop Priorities with Health, Damage, Free Upgrade Rows, Enemy Attack Level Skip, Enemy Health Level Skip, and Normal and Boss Enemies',
      title: 'eHP Guide Workshop Priorities with Health, Damage, Free Upgrade Rows, Enemy Attack Level Skip, Enemy Health Level Skip, and Normal and Boss Enemies',
      disambiguation: 'This chunk is about the interaction between the eHP Guide Workshop Priorities and the main workshop and enemy systems it references, not the individual mechanics. It is not a complete workshop cost table or a general enemy primer.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'eHP Guide Workshop Priorities').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Health').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Damage').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Free Attack Upgrade').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Free Defense Upgrade').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Free Utility Upgrade').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Enemy Attack Level Skip').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Enemy Health Level Skip').data_source,
        getRequiredNamingRegistryEntryBySource('enemies', 'Normal and Boss Enemies').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['eHP Guide Workshop Priorities', 'Health', 'Damage', 'Free Attack Upgrade', 'Free Defense Upgrade', 'Free Utility Upgrade', 'Enemy Attack Level Skip', 'Enemy Health Level Skip', 'Normal and Boss Enemies'],
      interaction_type: 'cross_system',
      interaction_summary: 'The eHP workshop plan uses the Free Upgrade rows to bias growth into Health early, then adds Damage and both Enemy Level Skip stats later to survive bosses longer and keep protector clearing from collapsing.',
      tags: ['guides', 'ehp', 'workshop', 'health', 'damage', 'enemy level skip', 'protectors'],
      paragraphs: [
        'eHP Guide Workshop Priorities starts by shortening the Free Attack Upgrade, Free Defense Upgrade, and Free Utility Upgrade target pool so those free upgrades land on Health more often during live runs.',
        'Later, the guide intentionally balances Health and Damage instead of overstacking only one side, because protectors and boss waves punish builds that can survive but not clear.',
        'Enemy Attack Level Skip extends survival against Normal and Boss Enemies, while Enemy Health Level Skip specifically helps preserve damage pace against high-health targets such as protectors.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_ehp_labs_coin_support_01',
      source: 'eHP Guide Platform Reference',
      section: 'Guides',
      topic: 'eHP Guide Lab Priorities with Golden Tower, Black Hole, Spotlight, and Perk Labs',
      title: 'eHP Guide Lab Priorities with Golden Tower, Black Hole, Spotlight, and Perk Labs',
      disambiguation: 'This chunk is about the interaction between the eHP Guide Lab Priorities and the named guide-supported lab systems, not the individual mechanics. It is not a general lab slot-cost guide or a coin-build replacement.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'eHP Guide Lab Priorities').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Spotlight').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Perk Labs').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['eHP Guide Lab Priorities', 'Golden Tower', 'Black Hole', 'Spotlight', 'Perk Labs'],
      interaction_type: 'cross_system',
      interaction_summary: 'The eHP lab plan mixes survival with Golden Tower, Black Hole, Spotlight, and Perk support so the build keeps farming and scaling instead of becoming a dead-end pure tank plan.',
      tags: ['guides', 'ehp', 'labs', 'golden tower', 'black hole', 'spotlight', 'perks'],
      paragraphs: [
        'eHP Guide Lab Priorities is not only about staying alive; it also keeps long-term economy alive through Golden Tower, Black Hole, and Spotlight coin-support labs.',
        'That is why Golden Tower Duration is prioritized over Golden Tower Bonus early, and why Black Hole Damage sits beside Black Hole Coin Bonus in the same plan: eHP needs protectors to die while coin windows keep scaling.',
        'Perk Labs stay in the same recommendation set because stronger perk access improves both survivability and farming consistency for long eHP runs.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_ehp_cards_boss_control_01',
      source: 'eHP Guide Platform Reference',
      section: 'Guides',
      topic: 'eHP Guide Card Priorities with Health, Extra Defense, Extra Orbs, Attack Speed, Plasma Cannon, Damage, Berserker, Energy Net, and Normal and Boss Enemies',
      title: 'eHP Guide Card Priorities with Health, Extra Defense, Extra Orbs, Attack Speed, Plasma Cannon, Damage, Berserker, Energy Net, and Normal and Boss Enemies',
      disambiguation: 'This chunk is about the interaction between the eHP Guide Card Priorities and the named card and enemy systems, not the individual mechanics. It is not a card rarity guide or a slot-purchase recommendation.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'eHP Guide Card Priorities').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Health').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Extra Defense').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Extra Orb').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Attack Speed').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Plasma Cannon').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Damage').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Berzerker').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Energy Net').data_source,
        getRequiredNamingRegistryEntryBySource('enemies', 'Normal and Boss Enemies').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['eHP Guide Card Priorities', 'Health', 'Extra Defense', 'Extra Orb', 'Attack Speed', 'Plasma Cannon', 'Damage', 'Berzerker', 'Energy Net', 'Normal and Boss Enemies'],
      interaction_type: 'cross_system',
      interaction_summary: 'The eHP card shell uses Health and Extra Defense to tank, Extra Orb and Attack Speed to control normal waves, Plasma Cannon to reduce boss-hit requirements, and Damage plus Berzerker to stop protectors from stalling the run, while Energy Net is avoided because it can worsen crowd-control timing.',
      tags: ['guides', 'ehp', 'cards', 'bosses', 'protectors', 'plasma cannon', 'energy net'],
      paragraphs: [
        'eHP Guide Card Priorities splits the card set into survival cards, crowd-control cards, and emergency boss or protector support instead of treating every useful card as equally important.',
        'The named card shell in this guide is Health, Extra Defense, Extra Orb, Attack Speed, Plasma Cannon, Damage, Berzerker, and Energy Net.',
        'Extra Orb and Attack Speed help keep Normal and Boss Enemies from turning into chip-damage piles, while Plasma Cannon reduces how many thorn-assisted boss hits must be tanked.',
        'The guide also rejects Energy Net specifically because holding bosses in place can create worse screen geometry for an eHP build that expects to kill bosses by taking hits rather than trapping them.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_ehp_uws_modules_01',
      source: 'eHP Guide Platform Reference',
      section: 'Guides',
      topic: 'eHP Guide Ultimate Weapon Support with Spotlight, Black Hole, Death Wave, Chrono Field, and Wormhole Redirector',
      title: 'eHP Guide Ultimate Weapon Support with Spotlight, Black Hole, Death Wave, Chrono Field, and Wormhole Redirector',
      disambiguation: 'This chunk is about the interaction between the eHP Guide Ultimate Weapon Support and its named support mechanics, not the individual mechanics. It is not a full Ultimate Weapon pick-order guide or a module ranking.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'eHP Guide Ultimate Weapon Support').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Spotlight').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chrono Field').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Wormhole Redirector').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['eHP Guide Ultimate Weapon Support', 'Spotlight', 'Black Hole', 'Death Wave', 'Chrono Field', 'Wormhole Redirector'],
      interaction_type: 'cross_system',
      interaction_summary: 'The eHP guide treats Spotlight, Black Hole, and Death Wave as immediate support weapons, keeps Chrono Field as a later transition investment, and pairs that survivability arc well with Wormhole Redirector once module support exists.',
      tags: ['guides', 'ehp', 'ultimate weapons', 'spotlight', 'black hole', 'death wave', 'chrono field', 'wormhole redirector'],
      paragraphs: [
        'eHP Guide Ultimate Weapon Support does not make Ultimate Weapons mandatory, but it strongly prefers support weapons that solve the build’s two biggest problems: protectors surviving too long and chip damage becoming overwhelming.',
        'Spotlight and Black Hole are the early support pair because one improves focused damage and the other adds percent-health damage against hard targets, while Death Wave extends the same health-build support pattern.',
        'Chrono Field is pushed later because it is expensive but powerful, and Wormhole Redirector fits the same late-support theme by adding another strong survivability layer once modules are available.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_ehp_round_triage_enemies_01',
      source: 'eHP Guide Platform Reference',
      section: 'Guides',
      topic: 'eHP Guide Round Triage with Normal and Boss Enemies and Elite Enemies',
      title: 'eHP Guide Round Triage with Normal and Boss Enemies and Elite Enemies',
      disambiguation: 'This chunk is about the interaction between the eHP Guide Round Triage and the enemy families it diagnoses, not the individual mechanics. It is not a full enemy taxonomy or a run-simulator output.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'eHP Guide Round Triage').data_source,
        getRequiredNamingRegistryEntryBySource('enemies', 'Normal and Boss Enemies').data_source,
        getRequiredNamingRegistryEntryBySource('enemies', 'Elite Enemies').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['eHP Guide Round Triage', 'Normal and Boss Enemies', 'Elite Enemies'],
      interaction_type: 'conditional',
      interaction_summary: 'The eHP guide diagnoses failures by separating boss one-shots, repeated boss chains, normal-wave crowd-control leaks, protector stalls, and elite pressure such as vampires into different upgrade responses.',
      tags: ['guides', 'ehp', 'triage', 'bosses', 'elites', 'vampires', 'protectors'],
      paragraphs: [
        'eHP Guide Round Triage treats run failures as different enemy problems instead of one generic survivability issue.',
        'Boss one-shots point toward more health, repeated boss chains point toward more sustain and damage support, and normal-wave leaks point toward more crowd control such as Attack Speed or Orbs.',
        'Protector stalls and elite pressure, especially from vampires, are called out separately because they often look like generic survivability failures even though they need more targeted answers.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_event_context_events_shop_01',
      source: 'Event Guide Platform Reference',
      section: 'Guides',
      topic: 'Event Guide Event Context with Events, Event Missions, Event Rewards, Event Relic Progress, Event Shop, and Medals',
      title: 'Event Guide Event Context with Events, Event Missions, Event Rewards, Event Relic Progress, Event Shop, and Medals',
      disambiguation: 'This chunk is about the interaction between the Event Guide Event Context and the main event progression systems, not the individual mechanics. It is not a per-item shop pricing table or a bot-upgrade walkthrough.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Event Guide Event Context').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'events').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Missions').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Rewards').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Relic Progress').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Shop').data_source,
        getRequiredNamingRegistryEntryBySource('currency', 'Medals').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Event Guide Event Context', 'Events', 'Event Missions', 'Event Rewards', 'Event Relic Progress', 'Event Shop', 'Medals'],
      interaction_type: 'conditional',
      interaction_summary: 'The event guide frames quest routing around the full Events economy, where Event Missions produce Event Rewards in Medals that feed Event Relic Progress and later compete for Event Shop spending.',
      tags: ['guides', 'events', 'missions', 'rewards', 'relics', 'shop', 'medals'],
      paragraphs: [
        'Event Guide Event Context is not a separate progression system; it is a routing layer on top of Events and their Event Missions.',
        'Event Missions create Event Rewards paid in Medals, those Medals feed current-event Event Relic Progress thresholds, and remaining Medals compete for Event Shop purchases after the most valuable mission tiers are cleared.',
        'That is why the guide prioritizes efficient medal coverage across the whole event instead of treating each awkward quest as an isolated puzzle.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_event_general_speed_tools_01',
      source: 'Event Guide Platform Reference',
      section: 'Guides',
      topic: 'Event Guide General Methods with Enemy Balance, Wave Accelerator, Wave Skip, Intro Sprint, and Random Ultimate Weapon Perk',
      title: 'Event Guide General Methods with Enemy Balance, Wave Accelerator, Wave Skip, Intro Sprint, and Random Ultimate Weapon Perk',
      disambiguation: 'This chunk is about the interaction between the Event Guide General Methods and the main speed and coverage tools it recommends, not the individual mechanics. It is not a mastery chart or a perk odds table.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Event Guide General Methods').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Enemy Balance').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Wave Accelerator').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Wave Skip').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Intro Sprint').data_source,
        getRequiredNamingRegistryEntryBySource('perks', 'Random Ultimate Weapon Perk').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Event Guide General Methods', 'Enemy Balance', 'Wave Accelerator', 'Wave Skip', 'Intro Sprint', 'Random Ultimate Weapon Perk'],
      interaction_type: 'cross_system',
      interaction_summary: 'The event guide uses Enemy Balance plus the WAWSIS trio to compress quest time, while Random Ultimate Weapon Perk covers weapon-gated quests that would otherwise be impossible for the account.',
      tags: ['guides', 'events', 'enemy balance', 'wave accelerator', 'wave skip', 'intro sprint', 'random ultimate weapon perk'],
      paragraphs: [
        'Event Guide General Methods treats Enemy Balance, Wave Accelerator, Wave Skip, and Intro Sprint as tempo tools rather than ordinary farming preferences.',
        'Enemy Balance increases target volume, Wave Accelerator shortens dead time, and Wave Skip plus Intro Sprint are the backbone of WAWSIS when the guide wants to reach useful waves quickly.',
        'Random Ultimate Weapon Perk fills the other major gap by letting event quests reference a missing weapon without forcing permanent unlock order changes just to finish one event objective.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_event_survival_boss_loops_01',
      source: 'Event Guide Platform Reference',
      section: 'Guides',
      topic: 'Event Guide Survival Quests with Extra Defense, Fortress, Death Wave, Death Defy, Energy Shield, Second Wind, and Intro Sprint',
      title: 'Event Guide Survival Quests with Extra Defense, Fortress, Death Wave, Death Defy, Energy Shield, Second Wind, and Intro Sprint',
      disambiguation: 'This chunk is about the interaction between the Event Guide Survival Quests and the main survivability tools it names, not the individual mechanics. It is not a defense card tier list or a boss-spawn formula table.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Event Guide Survival Quests').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Extra Defense').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Fortress').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Death Defy').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Energy Shield').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Second Wind').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Intro Sprint').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Event Guide Survival Quests', 'Extra Defense', 'Fortress', 'Death Wave', 'Death Defy', 'Energy Shield', 'Second Wind', 'Intro Sprint'],
      interaction_type: 'conditional',
      interaction_summary: 'The event guide solves no-damage and boss-hit quests by swapping between passive tank tools such as Extra Defense and Fortress, outside-range boss killing via Death Wave, and intentional boss-hit loops built around Death Defy, Energy Shield, Second Wind, and Intro Sprint.',
      tags: ['guides', 'events', 'extra defense', 'fortress', 'death wave', 'death defy', 'energy shield', 'second wind', 'intro sprint'],
      paragraphs: [
        'Event Guide Survival Quests separates passive no-damage routing from deliberate boss-hit routing because they want opposite run conditions.',
        'Extra Defense and Fortress support the no-damage path, Death Wave trivializes bosses-outside-range when it is available, and Death Defy, Energy Shield, Second Wind, and Intro Sprint form the deliberate retry loop for quests that only progress when the tower actually gets hit.',
        'That split is why the guide treats survival quests as loadout problems rather than one universal defensive setup.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_event_active_quests_cards_01',
      source: 'Event Guide Platform Reference',
      section: 'Guides',
      topic: 'Event Guide Active Quests with Demon Mode, Nuke, Land Mine Stun, Enemy Balance, Wave Accelerator, Wave Skip, Intro Sprint, Spotlight, and Extra Orb',
      title: 'Event Guide Active Quests with Demon Mode, Nuke, Land Mine Stun, Enemy Balance, Wave Accelerator, Wave Skip, Intro Sprint, Spotlight, and Extra Orb',
      disambiguation: 'This chunk is about the interaction between the Event Guide Active Quests and the loadout tools it names, not the individual mechanics. It is not a card mastery table or a spotlight damage formula reference.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Event Guide Active Quests').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Demon Mode').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Nuke').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Land Mine Stun').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Enemy Balance').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Wave Accelerator').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Wave Skip').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Intro Sprint').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Spotlight').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Extra Orb').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Event Guide Active Quests', 'Demon Mode', 'Nuke', 'Land Mine Stun', 'Enemy Balance', 'Wave Accelerator', 'Wave Skip', 'Intro Sprint', 'Spotlight', 'Extra Orb'],
      interaction_type: 'cross_system',
      interaction_summary: 'The active-quest loop builds a target-rich screen with Enemy Balance and WAWSIS tools, then controls kill timing by removing fast-clear tools such as Extra Orb while using Demon Mode, Nuke, Land Mine Stun, and selective Spotlight uptime to funnel quest credit correctly.',
      tags: ['guides', 'events', 'demon mode', 'nuke', 'land mine stun', 'enemy balance', 'spotlight', 'extra orb'],
      paragraphs: [
        'Event Guide Active Quests is built around loadout control rather than raw power because several event quests fail when enemies die too early or in the wrong zone.',
        'Enemy Balance plus Wave Accelerator, Wave Skip, and Intro Sprint help create the right wave tempo, while Extra Orb is specifically removed from Demon Mode and Nuke setups so enemies remain alive long enough to be cashed out on command.',
        'The land-mine section follows the same idea: Land Mine Stun and workshop landmine quests want a crowded screen, and Spotlight is one of the few damage sources the guide keeps because it improves landmine kills instead of spoiling them.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_event_uw_routes_01',
      source: 'Event Guide Platform Reference',
      section: 'Guides',
      topic: 'Event Guide Ultimate Weapon Quests with Smart Missiles, Spotlight, Inner Land Mines, Black Hole, Poison Swamp, Chain Lightning, Missile Barrage, Energy Shield, Second Wind, Enemy Balance, and Wave Accelerator',
      title: 'Event Guide Ultimate Weapon Quests with Smart Missiles, Spotlight, Inner Land Mines, Black Hole, Poison Swamp, Chain Lightning, Missile Barrage, Energy Shield, Second Wind, Enemy Balance, and Wave Accelerator',
      disambiguation: 'This chunk is about the interaction between the Event Guide Ultimate Weapon Quests and the named weapon-routing tools, not the individual mechanics. It is not a complete Ultimate Weapon pick guide or a module-only setup reference.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Event Guide Ultimate Weapon Quests').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Smart Missiles').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Spotlight').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Inner Land Mines').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Poison Swamp').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chain Lightning').data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'Milestone Tier Progression').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Energy Shield').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Second Wind').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Enemy Balance').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Wave Accelerator').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Event Guide Ultimate Weapon Quests', 'Smart Missiles', 'Spotlight', 'Inner Land Mines', 'Black Hole', 'Poison Swamp', 'Chain Lightning', 'Missile Barrage', 'Energy Shield', 'Second Wind', 'Enemy Balance', 'Wave Accelerator'],
      interaction_type: 'cross_system',
      interaction_summary: 'The event guide routes Ultimate Weapon quests by matching each weapon to the right support shell, from Smart Missiles plus Missile Barrage boss setups to passive Spotlight farming, high-density Black Hole and Poison Swamp runs, and rapid-hit Chain Lightning screens.',
      tags: ['guides', 'events', 'smart missiles', 'spotlight', 'inner land mines', 'black hole', 'poison swamp', 'chain lightning', 'missile barrage'],
      paragraphs: [
        'Event Guide Ultimate Weapon Quests does not assume every weapon quest wants the same run shape.',
        'Smart Missiles quests are routed through Missile Barrage timing against bosses, which is why Energy Shield and Second Wind matter there, while Spotlight is mostly passive and Black Hole, Poison Swamp, and Chain Lightning care more about enemy density and screen tempo from Enemy Balance and Wave Accelerator.',
        'Inner Land Mines is the odd case because the guide expects higher tiers and positional help to matter more than raw damage when the goal is actually getting enemies onto the mines.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_medals_overview_shop_01',
      source: 'Medals Guide Platform Reference',
      section: 'Guides',
      topic: 'Medals Guide Overview with Medals, Event Shop, and Event Shop Currency Purchases',
      title: 'Medals Guide Overview with Medals, Event Shop, and Event Shop Currency Purchases',
      disambiguation: 'This chunk is about the interaction between Medals Guide Overview and the shared medal-spending surfaces it references, not the individual mechanics. It is not a mission-reward payout table or a one-event shopping list.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Medals Guide Overview').data_source,
        getRequiredNamingRegistryEntryBySource('currency', 'Medals').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Shop').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Shop Currency Purchases').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Medals Guide Overview', 'Medals', 'Event Shop', 'Event Shop Currency Purchases'],
      interaction_type: 'cross_system',
      interaction_summary: 'Medals Guide Overview starts from Medals as a constrained Event Shop budget, and Event Shop Currency Purchases are one of several branches competing for that same budget.',
      tags: ['guides', 'medals', 'event shop', 'currency purchases'],
      paragraphs: [
        'Medals Guide Overview is built around Medals scarcity rather than around one favorite shop category.',
        'Event Shop is the shared parent system for relics, songs, themes, currency exchanges, and bots, so the guide has to decide which branch creates the strongest permanent value first.',
        'Event Shop Currency Purchases matter in that comparison because they translate the same Medals pool into immediate stones, gems, or shards, which is why the guide explicitly ranks them below stronger permanent medal sinks in many cases.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_medals_relics_paths_01',
      source: 'Medals Guide Platform Reference',
      section: 'Guides',
      topic: 'Medals Guide Past Relics with Event Relics, Event Relic Progress, and Relic Unlock Methods',
      title: 'Medals Guide Past Relics with Event Relics, Event Relic Progress, and Relic Unlock Methods',
      disambiguation: 'This chunk is about the interaction between Medals Guide Past Relics and the event-relic systems it references, not the individual mechanics. It is not a relic stat catalog or a threshold-only event explainer.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Medals Guide Past Relics').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Relics').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Relic Progress').data_source,
        getRequiredNamingRegistryEntryBySource('relics', 'relics').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Medals Guide Past Relics', 'Event Relics', 'Event Relic Progress', 'Relic Unlock Methods'],
      interaction_type: 'cross_system',
      interaction_summary: 'Medals Guide Past Relics prioritizes high-impact Event Relics because purchased rerun relics are a different acquisition path from current-event Event Relic Progress and can represent rare chances to buy permanent relic value directly.',
      tags: ['guides', 'medals', 'relics', 'event relics', 'reruns'],
      paragraphs: [
        'Medals Guide Past Relics draws a hard line between Event Relics and Event Relic Progress.',
        'Event Relic Progress is the current-event threshold path, while Event Relics are direct medal-shop purchases that can return on reruns, so the guide treats a strong past relic as a rare purchase opportunity instead of as a repeatable store exchange.',
        'That is why relic picks tied to broad account growth, especially coin and lab-speed style value, outrank more replaceable uses of the same medal budget.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_medals_songs_themes_bonus_01',
      source: 'Medals Guide Platform Reference',
      section: 'Guides',
      topic: 'Medals Guide Songs and Themes with Event Songs, Event Themes, and Theme Passive Coin Bonus',
      title: 'Medals Guide Songs and Themes with Event Songs, Event Themes, and Theme Passive Coin Bonus',
      disambiguation: 'This chunk is about the interaction between Medals Guide Songs and Themes and the permanent coin-bonus systems it names, not the individual mechanics. It is not a cosmetic inventory view or a themes menu guide.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Medals Guide Songs and Themes').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Songs').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Themes').data_source,
        getRequiredNamingRegistryEntryBySource('themes', 'Theme Passive Coin Bonus').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Medals Guide Songs and Themes', 'Event Songs', 'Event Themes', 'Theme Passive Coin Bonus'],
      interaction_type: 'multiplicative',
      interaction_summary: 'Medals Guide Songs and Themes values Event Songs and Event Themes because both feed permanent coin growth, with Theme Passive Coin Bonus explaining why even small owned-theme percentages keep compounding over time.',
      tags: ['guides', 'medals', 'songs', 'themes', 'coin bonus'],
      paragraphs: [
        'Medals Guide Songs and Themes is not treating these purchases as appearance-only extras.',
        'Event Songs provide fixed permanent coin bonuses, Event Themes add owned-theme value through Theme Passive Coin Bonus, and both remain on the account after purchase instead of disappearing with the current event rotation.',
        'That is why the guide places songs and themes above repeatable currency buys once the strongest relic opportunities are accounted for.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_medals_currency_labs_01',
      source: 'Medals Guide Platform Reference',
      section: 'Guides',
      topic: 'Medals Guide Stones and Gems with Event Shop Currency Purchases, Power Stones, Gems, and Lab Slots',
      title: 'Medals Guide Stones and Gems with Event Shop Currency Purchases, Power Stones, Gems, and Lab Slots',
      disambiguation: 'This chunk is about the interaction between Medals Guide Stones and Gems and the currency and lab systems it references, not the individual mechanics. It is not a full stone-planning guide or a gem-income breakdown.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Medals Guide Stones and Gems').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Shop Currency Purchases').data_source,
        getRequiredNamingRegistryEntryBySource('currency', 'Power Stones').data_source,
        getRequiredNamingRegistryEntryBySource('currency', 'Gems').data_source,
        getRequiredNamingRegistryEntryBySource('labs', 'labs').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Medals Guide Stones and Gems', 'Event Shop Currency Purchases', 'Power Stones', 'Gems', 'Lab Slots'],
      interaction_type: 'conditional',
      interaction_summary: 'Medals Guide Stones and Gems allows a small amount of Event Shop Currency Purchases for Power Stones, treats Gems as a temporary lab-acceleration exception only before all Lab Slots are unlocked, and rejects ongoing medal-to-gem spending after that foundation is finished.',
      tags: ['guides', 'medals', 'stones', 'gems', 'labs', 'currency'],
      paragraphs: [
        'Medals Guide Stones and Gems treats Event Shop Currency Purchases as a diminishing-value ladder rather than as a flat exchange table.',
        'Power Stones stay viable for a small number of early buys because stones are still strategically valuable, but the guide caps them once the rising medal ladder starts erasing the value of later purchases.',
        'Gems are the stricter exception because their only endorsed use here is speeding up Lab Slots progress before all five labs exist. Once that lab foundation is complete, medal-bought gems fall behind the permanent value of other medal sinks.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_medals_bots_unlocks_01',
      source: 'Medals Guide Platform Reference',
      section: 'Guides',
      topic: 'Medals Guide Bot Progression with Event Store Bots, Event Bot Unlock Costs, and Bot Respec',
      title: 'Medals Guide Bot Progression with Event Store Bots, Event Bot Unlock Costs, and Bot Respec',
      disambiguation: 'This chunk is about the interaction between Medals Guide Bot Progression and the permanent bot-progression systems it names, not the individual mechanics. It is not a per-stat upgrade table or a full bot lab guide.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Medals Guide Bot Progression').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Store Bots').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Event Bot Unlock Costs').data_source,
        getRequiredNamingRegistryEntryBySource('events', 'Bot Respec').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Medals Guide Bot Progression', 'Event Store Bots', 'Event Bot Unlock Costs', 'Bot Respec'],
      interaction_type: 'cross_system',
      interaction_summary: 'Medals Guide Bot Progression avoids unlocking every Event Store Bot immediately because Event Bot Unlock Costs escalate hard and Bot Respec is a limited gem cleanup tool rather than permission to spend medals carelessly.',
      tags: ['guides', 'medals', 'bots', 'unlock costs', 'respec'],
      paragraphs: [
        'Medals Guide Bot Progression treats bots as permanent systems that start weak and become valuable only after deliberate medal investment.',
        'Event Bot Unlock Costs are the reason the guide does not approve filling out the whole Event Store Bots roster on sight: each new unlock permanently raises the price of the next one from 150 up to 900 medals.',
        'Bot Respec softens mistakes, but because it costs Gems and only refunds medal-side bot spending once per event, the guide still prefers good unlock order and upgrade focus over trial-and-error cooldown changes.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_medals_coin_bot_sync_01',
      source: 'Medals Guide Platform Reference',
      section: 'Guides',
      topic: 'Medals Guide Coin Bot Priorities with Coin Bot, Golden Tower, and Black Hole',
      title: 'Medals Guide Coin Bot Priorities with Coin Bot, Golden Tower, and Black Hole',
      disambiguation: 'This chunk is about the interaction between Medals Guide Coin Bot Priorities and the sync-sensitive economy systems it names, not the individual mechanics. It is not a complete cooldown spreadsheet or a general ultimate-weapon guide.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Medals Guide Coin Bot Priorities').data_source,
        getRequiredNamingRegistryEntryBySource('bots', 'Coin Bot').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Medals Guide Coin Bot Priorities', 'Coin Bot', 'Golden Tower', 'Black Hole'],
      interaction_type: 'conditional',
      interaction_summary: 'Medals Guide Coin Bot Priorities pushes Coin Bot Range and Bonus first and leaves cooldown alone by default because cooldown only becomes worth the medal risk when there is a deliberate Golden Tower or Black Hole synchronization plan.',
      tags: ['guides', 'medals', 'coin bot', 'golden tower', 'black hole', 'sync'],
      paragraphs: [
        'Medals Guide Coin Bot Priorities narrows the Coin Bot upgrade problem down to Range and Bonus first because those stats create the clearest immediate improvement in normal farming value.',
        'Golden Tower and Black Hole are why cooldown becomes dangerous: once the player starts touching cooldown, the real question is no longer whether Coin Bot activates more often, but whether it can be aligned with stronger timed economy windows.',
        'That is why the guide calls cooldown a specialized optimization step instead of a default early upgrade target.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_medals_coin_bot_footgun_01',
      source: 'Medals Guide Platform Reference',
      section: 'Guides',
      topic: 'Medals Guide Coin Bot Priorities with Bot Cooldowns',
      title: 'Medals Guide Coin Bot Priorities with Bot Cooldowns',
      disambiguation: 'This chunk is about the interaction between the medals guide Coin Bot cooldown advice and the dedicated bot cooldown footgun warning, not the full event shop or a complete timing calculator.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Medals Guide Coin Bot Priorities').data_source,
        getRequiredNamingRegistryEntryBySource('footguns', 'Bot Cooldowns').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Medals Guide Coin Bot Priorities', 'Bot Cooldowns'],
      interaction_type: 'cross_system',
      interaction_summary: 'Medals Guide Coin Bot Priorities and Bot Cooldowns both warn that early Coin Bot cooldown edits are usually a trap because they can lock the account out of cleaner future sync breakpoints.',
      tags: ['guides', 'medals', 'coin bot', 'bot cooldowns', 'footguns', 'sync'],
      paragraphs: [
        'Medals Guide Coin Bot Priorities already treats cooldown as a specialist upgrade rather than a default medal sink, and the Bot Cooldowns footgun explains why that caution matters long term.',
        'Once cooldown labs or medal upgrades move Coin Bot off an easy target breakpoint, later synchronization planning becomes narrower and more expensive to fix.',
        'The guide and the footgun therefore reinforce the same progression rule: take the easy Range and Bonus value first, and only touch cooldown when there is a deliberate sync destination worth preserving.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_medals_later_bots_order_01',
      source: 'Medals Guide Platform Reference',
      section: 'Guides',
      topic: 'Medals Guide Later Bot Priorities with Amplify Bot, Thunder Bot, and Flame Bot',
      title: 'Medals Guide Later Bot Priorities with Amplify Bot, Thunder Bot, and Flame Bot',
      disambiguation: 'This chunk is about the interaction between Medals Guide Later Bot Priorities and the follow-up bots it sequences, not the individual mechanics. It is not a full stat-table reference or a burn-control tutorial.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Medals Guide Later Bot Priorities').data_source,
        getRequiredNamingRegistryEntryBySource('bots', 'Amplify Bot').data_source,
        getRequiredNamingRegistryEntryBySource('bots', 'Thunder Bot').data_source,
        getRequiredNamingRegistryEntryBySource('bots', 'Flame Bot').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Medals Guide Later Bot Priorities', 'Amplify Bot', 'Thunder Bot', 'Flame Bot'],
      interaction_type: 'cross_system',
      interaction_summary: 'Medals Guide Later Bot Priorities sets Amplify Bot ahead of Thunder Bot and Flame Bot because Amplify Bot scales into boss damage earlier, while Thunder Bot needs heavier investment to stop being awkward and Flame Bot is treated as last-pass cleanup.',
      tags: ['guides', 'medals', 'amplify bot', 'thunder bot', 'flame bot'],
      paragraphs: [
        'Medals Guide Later Bot Priorities keeps the post-Coin Bot order simple: Amplify Bot second, Thunder Bot third, Flame Bot last.',
        'Amplify Bot is the first follow-up because more Range and then Bonus can create real boss-damage value without demanding a full maxed build first.',
        'Thunder Bot is delayed because it is mainly useful when heavily developed, and Flame Bot is delayed even further because the guide treats it as the least urgent medal destination once stronger bots and broader event-shop gains are already in place.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_orb_devo_sync_setup_01',
      source: 'Orb Devo Guide Platform Reference',
      section: 'Guides',
      topic: 'Orb Devo Guide Overview with Golden Tower, Black Hole, Multiverse Nexus, Extra Orb, and Range',
      title: 'Orb Devo Guide Overview with Golden Tower, Black Hole, Multiverse Nexus, Extra Orb, and Range',
      disambiguation: 'This chunk is about the interaction between Orb Devo Guide Overview and its sync-and-positioning shell, not the individual mechanics. It is not a full cooldown calculator or a generic devo-family essay.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Orb Devo Guide Overview').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Multiverse Nexus').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Extra Orb').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Range').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Orb Devo Guide Overview', 'Golden Tower', 'Black Hole', 'Multiverse Nexus', 'Extra Orb', 'Range'],
      interaction_type: 'cross_system',
      interaction_summary: 'Orb Devo only works once Golden Tower and Black Hole share the same payout window, Extra Orb is positioned to hit that stack cleanly, and Tower Range is pushed to the guide’s 69.5m target without breaking pickup coverage.',
      tags: ['guides', 'orb devo', 'golden tower', 'black hole', 'multiverse nexus', 'extra orb', 'range'],
      paragraphs: [
        'Orb Devo Guide Overview treats synchronized Golden Tower and Black Hole as the non-negotiable income window because the build only pays off when the hoarded stack dies during that overlap.',
        'Multiverse Nexus is allowed as a bridge, but the real positioning work still depends on Range and Extra Orb placement. The guide specifically wants Tower Range pushed to 69.5m during the run and the Extra Orb card placed at 60m so the Orb pass lines up with the Black Hole pile instead of stripping enemies too early.',
        'That is why Orb Devo is presented as a controlled setup problem first and a farming build second.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_orb_devo_workshop_control_01',
      source: 'Orb Devo Guide Platform Reference',
      section: 'Guides',
      topic: 'Orb Devo Guide Workshop Devo with Shockwave Size, Thorn Damage, Orbs, Free Upgrade Rows, and Enemy Attack Level Skip',
      title: 'Orb Devo Guide Workshop Devo with Shockwave Size, Thorn Damage, Orbs, Free Upgrade Rows, and Enemy Attack Level Skip',
      disambiguation: 'This chunk is about the interaction between Orb Devo Guide Workshop Devo and the named workshop control rows, not the individual mechanics. It is not a full workshop cost chart or a standalone thorn guide.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Orb Devo Guide Workshop Devo').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Shockwave Size').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'workshop').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Orbs').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Free Attack Upgrade').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Free Defense Upgrade').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Free Utility Upgrade').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Enemy Attack Level Skip').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Orb Devo Guide Workshop Devo', 'Shockwave Size', 'Thorn Damage', 'Orbs', 'Free Attack Upgrade', 'Free Defense Upgrade', 'Free Utility Upgrade', 'Enemy Attack Level Skip'],
      interaction_type: 'cross_system',
      interaction_summary: 'The Orb Devo workshop shell works by suppressing Orbs and the three Free Upgrade rows, keeping Shockwave Size at a narrow shuffle value, and only raising Thorn Damage or Enemy Attack Level Skip when they extend the stack instead of dissolving it.',
      tags: ['guides', 'orb devo', 'workshop', 'shockwave size', 'thorns', 'enemy attack level skip', 'free upgrades'],
      paragraphs: [
        'Orb Devo Guide Workshop Devo deliberately removes most automatic kill pressure. Orbs, Free Attack Upgrade, Free Defense Upgrade, and Free Utility Upgrade are held down because free levels and passive clears ruin the timed cash-out window.',
        'Shockwave Size is tuned instead of maxed so basics get shuffled into trim positions without blowing the stack apart, while Thorn Damage is only raised gradually to trim low-value basics as spawn rates rise.',
        'Enemy Attack Level Skip then enters later as part of the survival spend, not as a replacement for the devo shell itself.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_orb_devo_cards_modules_01',
      source: 'Orb Devo Guide Platform Reference',
      section: 'Guides',
      topic: 'Orb Devo Guide Cards and Support with Extra Orb, Enemy Balance, Recovery Package Chance, Wormhole Redirector, Galaxy Compressor, Death Wave, and Spotlight',
      title: 'Orb Devo Guide Cards and Support with Extra Orb, Enemy Balance, Recovery Package Chance, Wormhole Redirector, Galaxy Compressor, Death Wave, and Spotlight',
      disambiguation: 'This chunk is about the interaction between Orb Devo Guide Cards and Support and the loadout and module systems it names, not the individual mechanics. It is not a general card tier list or a module rarity ranking.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Orb Devo Guide Cards and Support').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Extra Orb').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Enemy Balance').data_source,
        getRequiredNamingRegistryEntryBySource('cards', 'Recovery Package Chance').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Wormhole Redirector').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Galaxy Compressor').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Spotlight').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Orb Devo Guide Cards and Support', 'Extra Orb', 'Enemy Balance', 'Recovery Package Chance', 'Wormhole Redirector', 'Galaxy Compressor', 'Death Wave', 'Spotlight'],
      interaction_type: 'cross_system',
      interaction_summary: 'Orb Devo uses Extra Orb and Enemy Balance to feed the stack, swaps between Wormhole Redirector and Galaxy Compressor survival shells through Recovery Package Chance pressure, and scales much harder once Death Wave and Spotlight join the same farming window.',
      tags: ['guides', 'orb devo', 'cards', 'enemy balance', 'wormhole redirector', 'galaxy compressor', 'death wave', 'spotlight'],
      paragraphs: [
        'Orb Devo Guide Cards and Support starts with Extra Orb and Enemy Balance because one localizes the cash-out and the other fills the screen fast enough for the Black Hole window to matter.',
        'Recovery Package Chance is the defensive branch for non-Wall or Galaxy Compressor setups, while Wormhole Redirector shifts the guide toward Regen-backed Wall survival once that module path exists.',
        'Death Wave and Spotlight are then treated as major upgrades because they add more value to the same controlled kill window instead of asking the build to farm in a completely different way.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_orb_devo_black_hole_control_01',
      source: 'Orb Devo Guide Platform Reference',
      section: 'Guides',
      topic: 'Orb Devo Guide Protector and Thorns Control with Black Hole Damage, Extra Black Hole, Garlic Thorns, Death Wave, and Thorn Damage',
      title: 'Orb Devo Guide Protector and Thorns Control with Black Hole Damage, Extra Black Hole, Garlic Thorns, Death Wave, and Thorn Damage',
      disambiguation: 'This chunk is about the interaction between Orb Devo Guide Protector and Thorns Control and the named cleanup tools, not the individual mechanics. It is not a complete protector formula page or a wall-thorns build guide.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Orb Devo Guide Protector and Thorns Control').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('labs', 'labs').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'workshop').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Orb Devo Guide Protector and Thorns Control', 'Black Hole', 'Black Hole Damage', 'Extra Black Hole', 'Garlic Thorns', 'Death Wave', 'Thorn Damage'],
      interaction_type: 'cross_system',
      interaction_summary: 'Orb Devo control breaks most often on protectors and late-wave chip damage, so the guide leans on Black Hole Damage, Extra Black Hole, Garlic Thorns, and carefully staged Thorn Damage instead of trying to solve everything with the weak projectile shell.',
      tags: ['guides', 'orb devo', 'black hole damage', 'extra black hole', 'garlic thorns', 'death wave', 'thorns'],
      paragraphs: [
        'Orb Devo Guide Protector and Thorns Control calls protectors the main nuisance because they hold the stack together in the wrong way and can stall the payout window entirely if they survive too long.',
        'The named fix is maxed Black Hole Damage plus enough duration support that two Black Hole cycles kill protectors, with Extra Black Hole giving more reliable coverage on that same plan.',
        'Garlic Thorns and controlled Thorn Damage then clean up the rest of the survival pressure, while Death Wave remains a major support tool because it adds health and more value to the same stacked wave plan.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_orb_devo_survival_stack_01',
      source: 'Orb Devo Guide Platform Reference',
      section: 'Guides',
      topic: 'Orb Devo Guide Survival Priorities with Defense Absolute, Health, Health Regen, Defense %, Enemy Attack Level Skip, Wall Health, Wall Regen, Wall Fortification, and Wormhole Redirector',
      title: 'Orb Devo Guide Survival Priorities with Defense Absolute, Health, Health Regen, Defense %, Enemy Attack Level Skip, Wall Health, Wall Regen, Wall Fortification, and Wormhole Redirector',
      disambiguation: 'This chunk is about the interaction between Orb Devo Guide Survival Priorities and the named tank layers, not the individual mechanics. It is not a pure wall guide or a universal defense breakpoint table.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Orb Devo Guide Survival Priorities').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Defense Absolute').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Health').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Health Regen').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'workshop').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Enemy Attack Level Skip').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Wall Health').data_source,
        getRequiredNamingRegistryEntryBySource('labs', 'labs').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Wormhole Redirector').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Orb Devo Guide Survival Priorities', 'Defense Absolute', 'Health', 'Health Regen', 'Defense %', 'Enemy Attack Level Skip', 'Wall Health', 'Wall Regen', 'Wall Fortification', 'Wormhole Redirector'],
      interaction_type: 'cross_system',
      interaction_summary: 'The Orb Devo survival ladder starts with Defense Absolute and Health on young accounts, then shifts into Defense %, Enemy Attack Level Skip, Wall scaling, and Wormhole Redirector-style Regen support as the account gains module depth.',
      tags: ['guides', 'orb devo', 'survival', 'defense absolute', 'health', 'defense percent', 'wall', 'wormhole redirector'],
      paragraphs: [
        'Orb Devo Guide Survival Priorities is staged by account depth rather than one static tank formula. Early accounts use Defense Absolute and then Health because they need a cheap way to survive the first real devo tiers.',
        'Later, Defense %, Enemy Attack Level Skip, Wall Health, Wall Regen, and Wall Fortification become more important because the build is no longer dying to one simple damage source.',
        'Wormhole Redirector fits that later stage especially well because the guide treats Regen as weak early but very strong once the tower has enough supporting stats and module scaling to make it real.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_uw_pick_order_permanence_01',
      source: 'Ultimate Weapon Pick Order Guide Platform Reference',
      section: 'Guides',
      topic: 'Ultimate Weapon Pick Order Guide Overview with Ultimate Weapons and Power Stones',
      title: 'Ultimate Weapon Pick Order Guide Overview with Ultimate Weapons and Power Stones',
      disambiguation: 'This chunk is about the interaction between the UW pick-order overview, the permanent Ultimate Weapon roster, and the Power Stone unlock economy, not an individual weapon definition.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Ultimate Weapon Pick Order Guide Overview').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'list').data_source,
        getRequiredNamingRegistryEntryBySource('currency', 'Power Stones').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Ultimate Weapon Pick Order Guide Overview', 'Ultimate Weapons', 'Power Stones'],
      interaction_type: 'cross_system',
      interaction_summary: 'Ultimate Weapon Pick Order Guide Overview exists because Ultimate Weapons are permanent Power Stone purchases whose opportunity cost compounds over time. The guide therefore ranks the roster around long-term economy, sync value, and support requirements rather than around isolated first-impression strength.',
      tags: ['guides', 'ultimate weapons', 'power stones', 'permanent choices', 'golden tower', 'black hole'],
      paragraphs: [
        'Ultimate Weapon Pick Order Guide Overview is built on permanence. Ultimate Weapons cost Power Stones, later selections are more expensive than earlier ones, and each weak early choice delays a future pick that may have created stronger sync or farm value instead.',
        'That is why the guide ranks the whole Ultimate Weapons roster instead of judging each weapon only by its first unlocked state. Golden Tower, Black Hole, and Death Wave rise because their overlap value starts compounding earlier than the later damage or control specialists.',
        'The guide is therefore a strategic ordering layer for Ultimate Weapons and Power Stone spending, not a standalone stat description for one weapon at a time.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_uw_pick_order_footguns_01',
      source: 'Ultimate Weapon Pick Order Guide Platform Reference',
      section: 'Guides',
      topic: 'Ultimate Weapon Pick Order Guide Overview with Choosing an Ultimate Weapon and Natural GT/BH Sync',
      title: 'Ultimate Weapon Pick Order Guide Overview with Choosing an Ultimate Weapon and Natural GT/BH Sync',
      disambiguation: 'This chunk is about the interaction between the UW pick-order guide and the matching footgun warnings around irreversible weapon picks and early sync mistakes, not a general ultimate-weapon glossary.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Ultimate Weapon Pick Order Guide Overview').data_source,
        getRequiredNamingRegistryEntryBySource('footguns', 'Choosing an Ultimate Weapon').data_source,
        getRequiredNamingRegistryEntryBySource('footguns', 'Natural GT/BH Sync').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Ultimate Weapon Pick Order Guide Overview', 'Choosing an Ultimate Weapon', 'Natural GT/BH Sync'],
      interaction_type: 'cross_system',
      interaction_summary: 'Ultimate Weapon Pick Order Guide Overview pairs with the Choosing an Ultimate Weapon and Natural GT/BH Sync footguns because the guide’s ranking logic is largely about avoiding permanent early picks that also sabotage later Golden Tower and Black Hole timing.',
      tags: ['guides', 'ultimate weapons', 'footguns', 'golden tower', 'black hole', 'sync'],
      paragraphs: [
        'Ultimate Weapon Pick Order Guide Overview exists to stop the same mistakes the footguns call out in warning form. Choosing an Ultimate Weapon explains why a weak early pick can delay stronger economy and support paths for a long time, while the guide translates that warning into an actual roster order.',
        'Natural GT/BH Sync covers the other half of the same risk profile: even a strong early roster loses value if Golden Tower and Black Hole timing is handled carelessly before natural overlap is established.',
        'Together, the guide and those footguns frame UW selection as a permanence problem, not a short-term damage taste test. Pick order matters because roster value and sync value compound together.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_uw_pick_order_economy_sync_01',
      source: 'Ultimate Weapon Pick Order Guide Platform Reference',
      section: 'Guides',
      topic: 'Ultimate Weapon Pick Order Guide Economy Core with Golden Tower, Black Hole, Death Wave, Golden Tower Bonus, Black Hole Damage, Black Hole Coin Bonus, Death Wave Health, Death Wave Coins Bonus, Death Wave Cell Bonus, and Multiverse Nexus',
      title: 'Ultimate Weapon Pick Order Guide Economy Core with Golden Tower, Black Hole, Death Wave, Golden Tower Bonus, Black Hole Damage, Black Hole Coin Bonus, Death Wave Health, Death Wave Coins Bonus, Death Wave Cell Bonus, and Multiverse Nexus',
      disambiguation: 'This chunk is about the interaction between the early UW economy shell and the lab or sync systems that make it scale, not the individual mechanics in isolation.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Ultimate Weapon Pick Order Guide Economy Core').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Golden Tower').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Black Hole').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Death Wave').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Multiverse Nexus').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Ultimate Weapon Pick Order Guide Economy Core', 'Golden Tower', 'Black Hole', 'Death Wave', 'Golden Tower Bonus', 'Black Hole Damage', 'Black Hole Coin Bonus', 'Death Wave Health', 'Death Wave Coins Bonus', 'Death Wave Cell Bonus', 'Multiverse Nexus'],
      interaction_type: 'cross_system',
      interaction_summary: 'The guide front-loads Golden Tower, Black Hole, and Death Wave because they create the strongest early economy shell once their labs and timing overlap are developed. Golden Tower starts the income engine immediately, Black Hole adds both coin and protector-clearing value, Death Wave adds coins, health, and cells on hit, and Multiverse Nexus can temporarily force shared timing while natural sync is still being built.',
      tags: ['guides', 'ultimate weapons', 'golden tower', 'black hole', 'death wave', 'multiverse nexus', 'economy'],
      paragraphs: [
        'Ultimate Weapon Pick Order Guide Economy Core treats Golden Tower as the first purchase because its value is immediate, then puts Black Hole second because current site data shows Black Hole Coin Bonus and Black Hole Damage unlocking a much stronger economy-and-protector shell once the labs are online.',
        'Death Wave stays in that same early group because its reward package is broader than raw damage. The guide specifically values coins, health, and cells arriving on hit, and current site data confirms Death Wave Health, Death Wave Coins Bonus, and Death Wave Cell Bonus as real progression levers that keep paying even after clean one-shots stop being normal.',
        'Multiverse Nexus fits this shell as a temporary sync aid rather than a permanent excuse to ignore natural timing. It can line up Golden Tower, Black Hole, and Death Wave earlier, but the guide still ranks those weapons highly because the shared economy window is the real prize, not the module by itself.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_uw_pick_order_damage_followups_01',
      source: 'Ultimate Weapon Pick Order Guide Platform Reference',
      section: 'Guides',
      topic: 'Ultimate Weapon Pick Order Guide Damage and Coin Follow-Ups with Spotlight, Spotlight Coin Bonus, Spotlight Missiles, Smart Missiles, Missile Amplifier, and Missile Radius',
      title: 'Ultimate Weapon Pick Order Guide Damage and Coin Follow-Ups with Spotlight, Spotlight Coin Bonus, Spotlight Missiles, Smart Missiles, Missile Amplifier, and Missile Radius',
      disambiguation: 'This chunk is about the interaction between the mid-rank damage follow-up picks and their support systems, not any one weapon or lab alone.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Ultimate Weapon Pick Order Guide Damage and Coin Follow-Ups').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Spotlight').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Spotlight').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Spotlight').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Smart Missiles').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Smart Missiles').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Smart Missiles').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Ultimate Weapon Pick Order Guide Damage and Coin Follow-Ups', 'Spotlight', 'Spotlight Coin Bonus', 'Spotlight Missiles', 'Smart Missiles', 'Missile Amplifier', 'Missile Radius'],
      interaction_type: 'cross_system',
      interaction_summary: 'Spotlight comes before Smart Missiles because it adds both another coin multiplier and a broad damage-taken bonus with less setup. Smart Missiles eventually becomes the larger damage ceiling, but its real payoff depends on missile labs and on Spotlight-derived kill windows that are already mature.',
      tags: ['guides', 'ultimate weapons', 'spotlight', 'spotlight coin bonus', 'spotlight missiles', 'smart missiles', 'missile amplifier'],
      paragraphs: [
        'Ultimate Weapon Pick Order Guide Damage and Coin Follow-Ups puts Spotlight first because it solves two problems at once: Spotlight Coin Bonus adds another farming multiplier, and the base Spotlight bonus improves non-percent-health damage without needing a pure damage account on day one.',
        'Spotlight Missiles is the bridge between that early value and later missile builds. It gives Spotlight a real offensive lab shell before Smart Missiles is fully mature, which is why the raw guide still likes Spotlight as the fourth pick even when damage is not yet the tower main focus.',
        'Smart Missiles stays later because Missile Amplifier and Missile Radius are what convert it from a theoretical endgame weapon into a practical one. The guide therefore treats Spotlight as the earlier follow-up and Smart Missiles as the expensive ceiling that Spotlight eventually supports.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_uw_pick_order_control_bridge_01',
      source: 'Ultimate Weapon Pick Order Guide Platform Reference',
      section: 'Guides',
      topic: 'Ultimate Weapon Pick Order Guide Control and Midgame Damage with Chrono Field, Chrono Field Duration, Chain Lightning, Chain Lightning Shock, Shock Chance, Shock Multiplier, and Dimension Core',
      title: 'Ultimate Weapon Pick Order Guide Control and Midgame Damage with Chrono Field, Chrono Field Duration, Chain Lightning, Chain Lightning Shock, Shock Chance, Shock Multiplier, and Dimension Core',
      disambiguation: 'This chunk is about the interaction between the control pivot of the UW guide and the lab or module systems behind it, not the individual mechanics alone.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Ultimate Weapon Pick Order Guide Control and Midgame Damage').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chrono Field').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chrono Field').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chain Lightning').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chain Lightning').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chain Lightning').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chain Lightning').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Dimension Core').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Ultimate Weapon Pick Order Guide Control and Midgame Damage', 'Chrono Field', 'Chrono Field Duration', 'Chain Lightning', 'Chain Lightning Shock', 'Shock Chance', 'Shock Multiplier', 'Dimension Core'],
      interaction_type: 'conditional',
      interaction_summary: 'Chrono Field is the guide’s main crowd-control pivot because duration investment can make it effectively permanent, while Chain Lightning is the cheaper midgame damage bridge that helps with elites during that buildout. The guide’s 5th-pick timing changes according to lab-boost capacity because Chrono Field Duration is a grind, and Dimension Core amplifies Chain Lightning’s Shock package once the account is ready for more damage.',
      tags: ['guides', 'ultimate weapons', 'chrono field', 'chain lightning', 'shock chance', 'shock multiplier', 'dimension core'],
      paragraphs: [
        'Ultimate Weapon Pick Order Guide Control and Midgame Damage treats Chrono Field as the real control milestone because current site data confirms that Chrono Field Duration can push the weapon toward permanent uptime, which dramatically changes survival and enemy pacing.',
        'That same section makes the ranking conditional instead of rigid. If the account cannot keep a 3x lab boost running, Chrono Field should be taken earlier so the long duration grind starts sooner; if lab acceleration is already strong, Chain Lightning can move ahead because its useful damage spike arrives faster.',
        'Chain Lightning fills that bridge role through Chain Lightning Shock, Shock Chance, and Shock Multiplier, while Dimension Core turns the same package into a much stronger damage engine by expanding Shock stacking and doubling the key Shock stats.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'guides_uw_pick_order_late_specialists_01',
      source: 'Ultimate Weapon Pick Order Guide Platform Reference',
      section: 'Guides',
      topic: 'Ultimate Weapon Pick Order Guide Late-Game Specialists with Smart Missiles, Inner Land Mines, Inner Mine Stun, Magnetic Hook, Space Displacer, Poison Swamp, Swamp Radius, Poison Swamp Stun, Chrono Field, and Chrono Loop',
      title: 'Ultimate Weapon Pick Order Guide Late-Game Specialists with Smart Missiles, Inner Land Mines, Inner Mine Stun, Magnetic Hook, Space Displacer, Poison Swamp, Swamp Radius, Poison Swamp Stun, Chrono Field, and Chrono Loop',
      disambiguation: 'This chunk is about the interaction between the late specialist picks in the UW guide and their support systems, not the individual mechanics or module pages in isolation.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('guides', 'Ultimate Weapon Pick Order Guide Late-Game Specialists').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Smart Missiles').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Inner Land Mines').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Inner Land Mines').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Magnetic Hook').data_source,
        getRequiredNamingRegistryEntryBySource('modules', 'Space Displacer').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Poison Swamp').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Poison Swamp').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Poison Swamp').data_source,
        getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chrono Field').data_source,
          getRequiredNamingRegistryEntryBySource('ultimate_weapons', 'Chrono Field').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Ultimate Weapon Pick Order Guide Late-Game Specialists', 'Smart Missiles', 'Inner Land Mines', 'Inner Mine Stun', 'Magnetic Hook', 'Space Displacer', 'Poison Swamp', 'Swamp Radius', 'Poison Swamp Stun', 'Chrono Field', 'Chrono Loop'],
      interaction_type: 'conditional',
      interaction_summary: 'The guide leaves Smart Missiles, Inner Land Mines, and Poison Swamp for later because each one needs a support shell before its real value appears. Smart Missiles wants mature missile scaling, Inner Land Mines wants stun or module delivery support, and Poison Swamp wants Chrono Field-level control depth so the ramping damage profile can actually matter.',
      tags: ['guides', 'ultimate weapons', 'smart missiles', 'inner land mines', 'magnetic hook', 'space displacer', 'poison swamp'],
      paragraphs: [
        'Ultimate Weapon Pick Order Guide Late-Game Specialists puts Smart Missiles ahead of the final two weapons because it still becomes the main late-game damage engine once its lab shell is funded, even though it arrives later than Spotlight and Chain Lightning in practical account growth.',
        'Inner Land Mines is ranked near the bottom for timing reasons, not because the weapon is useless. Inner Mine Stun, Magnetic Hook, and Space Displacer all reinforce the same idea from the raw guide: ILM is strongest as a boss-and-elite control specialist once the account can support how those mines actually connect and hold targets in place, even though it is comparatively cheap to upgrade into visible impact.',
        'Poison Swamp remains the final recommendation because its payoff depends on enemies staying controlled long enough for the damage profile to ramp. Swamp Radius and Poison Swamp Stun are the first shell, but the raw guide is explicit that Poison Swamp is better after Chrono Field and preferably Chrono Loop support already exist, not before.',
      ],
    }),
  ]
}
