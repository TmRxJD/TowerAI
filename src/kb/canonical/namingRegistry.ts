import fs from 'node:fs'

import {
  BOT_UPGRADES_DATA as bots,
  buildGuardianDefinitions,
  labs as LABS,
} from '@tmrxjd/platform/tools'
import workshopData from '@tmrxjd/platform/tools/workshop.json'
import { CARD_TEMPLATES } from '../../game-data/card-data'
import { MODULE_TEMPLATES, type ModuleCategory } from '../../game-data/module-data'
import { getWorkshopEnhancementDefinitions } from '../../game-data/workshop-enhancement-tracker-definitions'
import { getCanonicalSourcePath } from './sourceText'

export type BaseMechanicSection = 'enemies' | 'faq' | 'guides' | 'workshop' | 'ultimate_weapons' | 'bots' | 'cards' | 'currency' | 'daily_missions' | 'events' | 'footguns' | 'guilds' | 'labs' | 'milestones' | 'modules' | 'perks' | 'relics' | 'tiers' | 'tournaments' | 'themes' | 'vault'

export interface RawMechanicSource {
  section: string
  key: string
  data_path: string
}

export interface NamingRegistryEntry {
  mechanic_id: string
  section: string
  key: string
  data_source: string
  is_base_mechanic: boolean
}

export type NamingRegistry = Record<string, NamingRegistryEntry>

const BASE_MECHANIC_SECTIONS = new Set<BaseMechanicSection>(['enemies', 'faq', 'guides', 'workshop', 'ultimate_weapons', 'bots', 'cards', 'currency', 'daily_missions', 'events', 'footguns', 'guilds', 'labs', 'milestones', 'modules', 'perks', 'relics', 'tiers', 'tournaments', 'themes', 'vault'])

function normalizeSnakeCase(value: string): string {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .toLowerCase()
}

function buildQuotedObjectPath(section: string, key: string): string {
  return `${section}[${JSON.stringify(key)}]`
}

function buildQuotedConstantPath(constantName: string, key: string): string {
  return `${constantName}[${JSON.stringify(key)}]`
}

function readUltimateWeaponsSourceText(): string {
  const sourcePath = getCanonicalSourcePath('ultimate_weapons_structured')
  return fs.readFileSync(sourcePath, 'utf8')
}

function extractUltimateWeaponNamesFromSourceText(sourceText: string): string[] {
  const mechanicNames = sourceText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('Mechanic: '))
    .map(line => line.slice('Mechanic: '.length).trim())
    .filter(name => name && name.toLowerCase() !== 'ultimate weapons')

  return Array.from(new Set(mechanicNames))
}

export function deriveMechanicId(section: string, key: string): string {
  return normalizeSnakeCase(`${section}_${key}`)
}

export function deriveNamingRegistryEntry(source: RawMechanicSource): NamingRegistryEntry {
  return {
    mechanic_id: deriveMechanicId(source.section, source.key),
    section: source.section,
    key: source.key,
    data_source: source.data_path,
    is_base_mechanic: BASE_MECHANIC_SECTIONS.has(source.section as BaseMechanicSection),
  }
}

export function buildNamingRegistry(sources: RawMechanicSource[]): NamingRegistry {
  return sources.reduce<NamingRegistry>((registry, source) => {
    const entry = deriveNamingRegistryEntry(source)
    registry[entry.mechanic_id] = entry
    return registry
  }, {})
}

export function extractWorkshopRawMechanicSources(): RawMechanicSource[] {
  const workshopSources: RawMechanicSource[] = [
    { section: 'workshop', key: 'workshop', data_path: 'workshop' },
  ]

  for (const key of Object.keys(workshopData as Record<string, unknown>)) {
    workshopSources.push({
      section: 'workshop',
      key,
      data_path: buildQuotedObjectPath('workshop', key),
    })
  }

  return workshopSources
}

export function extractWorkshopEnhancementRawMechanicSources(): RawMechanicSource[] {
  return getWorkshopEnhancementDefinitions().map(definition => ({
    section: 'workshop_enhancements',
    key: definition.key,
    data_path: buildQuotedConstantPath('WSP_WORKSHOP_COST_LEVELS', definition.key),
  }))
}

export function extractBotRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'bots', key: 'bots', data_path: 'bots' },
    { section: 'bots', key: 'Coin Bot', data_path: 'bots' },
    ...bots.map(bot => ({
      section: 'bots',
      key: bot.name,
      data_path: 'bots',
    })),
  ]
}

export function extractCardRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'cards', key: 'cards', data_path: 'cards' },
    ...CARD_TEMPLATES.map(card => ({
      section: 'cards',
      key: card.name,
      data_path: buildQuotedConstantPath('CARD_TEMPLATE_MAP', card.id),
    })),
  ]
}

export function extractCurrencyRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'currency', key: 'currency', data_path: 'CURRENCY_DEFINITIONS' },
    { section: 'currency', key: 'Cash', data_path: 'CASH_ENEMY_VALUE_RULES' },
    { section: 'currency', key: 'Coins', data_path: 'COIN_ACQUISITION_FACTS' },
    { section: 'currency', key: 'Gems', data_path: 'GEM_ACQUISITION_FACTS' },
    { section: 'currency', key: 'Power Stones', data_path: 'POWER_STONE_FACTS' },
    { section: 'currency', key: 'Medals', data_path: 'MEDAL_FACTS' },
    { section: 'currency', key: 'Elite Cells', data_path: 'ELITE_CELL_TIER_ROWS' },
    { section: 'currency', key: 'Keys', data_path: 'KEY_FACTS' },
    { section: 'currency', key: 'Bits', data_path: 'BIT_FACTS' },
    { section: 'currency', key: 'Tokens', data_path: 'TOKEN_FACTS' },
    { section: 'currency', key: 'Module Currency', data_path: 'MODULE_CURRENCY_FACTS' },
  ]
}

export function extractDailyMissionRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'daily_missions', key: 'Daily Missions', data_path: 'DAILY_MISSION_DESCRIPTION_FACTS' },
    { section: 'daily_missions', key: 'Daily Mission Challenges', data_path: 'DAILY_MISSION_CHALLENGE_FACTS' },
    { section: 'daily_missions', key: 'Daily Mission Rewards', data_path: 'DAILY_MISSION_REWARD_FACTS' },
    { section: 'daily_missions', key: 'Daily Mission Tier Rewards', data_path: 'DAILY_MISSION_TIER_REWARDS' },
    { section: 'daily_missions', key: 'Weekly Mission Rewards', data_path: 'DAILY_MISSION_WEEKLY_REWARDS' },
    { section: 'daily_missions', key: 'Reroll Daily Mission', data_path: 'DAILY_MISSION_REROLL_LAB_LEVELS' },
  ]
}

export function extractEventRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'events', key: 'events', data_path: 'events' },
    { section: 'events', key: 'Events', data_path: 'events' },
    { section: 'events', key: 'Event Cycle', data_path: 'events' },
    { section: 'events', key: 'Event Missions', data_path: 'events' },
    { section: 'events', key: 'Event Mission Tiers', data_path: 'events' },
    { section: 'events', key: 'Event Mission Rollout', data_path: 'events' },
    { section: 'events', key: 'Event Rewards', data_path: 'events' },
    { section: 'events', key: 'Event Booster', data_path: 'events' },
    { section: 'events', key: 'Event Relic Progress', data_path: 'events' },
    { section: 'events', key: 'Event Shop', data_path: 'events' },
    { section: 'events', key: 'Event Shop Currency Purchases', data_path: 'events' },
    { section: 'events', key: 'Event Themes', data_path: 'events' },
    { section: 'events', key: 'Event Relics', data_path: 'events' },
    { section: 'events', key: 'Event Songs', data_path: 'events' },
    { section: 'events', key: 'Event Store Bots', data_path: 'events' },
    { section: 'events', key: 'Event Bot Unlock Costs', data_path: 'events' },
    { section: 'events', key: 'Bot Respec', data_path: 'events' },
  ]
}

export function extractEnemyRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'enemies', key: 'Enemies', data_path: 'enemies' },
    { section: 'enemies', key: 'Normal and Boss Enemies', data_path: 'NORMAL_AND_BOSS_ENEMY_FACTS' },
    { section: 'enemies', key: 'Elite Enemies', data_path: 'ELITE_ENEMY_FACTS' },
    { section: 'enemies', key: 'Fleet Enemies', data_path: 'FLEET_ENEMY_FACTS' },
    { section: 'enemies', key: 'Fleet Enemy Types', data_path: 'FLEET_ENEMY_TYPE_FACTS' },
    { section: 'enemies', key: 'Fleet Rewards', data_path: 'FLEET_REWARD_ROWS' },
    { section: 'enemies', key: 'Fleet Spawn Timing', data_path: 'FLEET_SPAWN_ROWS' },
    { section: 'enemies', key: 'Enemy Type Summaries', data_path: 'ENEMY_TYPE_SUMMARIES' },
    { section: 'enemies', key: 'Enemy Labs', data_path: 'ENEMY_LAB_FACTS' },
  ]
}

export function extractFaqRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'faq', key: 'faq', data_path: 'FAQ_OVERVIEW_FACTS' },
    { section: 'faq', key: 'Which UW Should I Select?', data_path: 'FAQ_UW_SELECTION_FACTS' },
    { section: 'faq', key: 'Why Do Coin Breakouts Not Equal Total Coins?', data_path: 'FAQ_COIN_OVERLAP_EXAMPLE' },
    { section: 'faq', key: 'Why Is (BH, GB, SL) Negative?', data_path: 'FAQ_NEGATIVE_BREAKOUT_FACTS' },
    { section: 'faq', key: 'Is Perk Math Correct in Game?', data_path: 'FAQ_PERK_MATH_FACTS' },
    { section: 'faq', key: 'Do Themes or Skins Stack?', data_path: 'FAQ_THEME_STACKING_FACTS' },
    { section: 'faq', key: 'What Does a Certain Abbreviation Mean?', data_path: 'FAQ_ABBREVIATION_FACTS' },
    { section: 'faq', key: 'When Should I Get Wall?', data_path: 'FAQ_WALL_READINESS_GUIDANCE' },
    { section: 'faq', key: 'Why Did I Die with Enough Absolute Defense?', data_path: 'FAQ_HEAT_UP_FACTS' },
  ]
}

export function extractFootgunRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'footguns', key: 'footguns', data_path: 'FOOTGUN_OVERVIEW_FACTS' },
    { section: 'footguns', key: 'Footgun Non-Examples', data_path: 'FOOTGUN_NON_EXAMPLE_FACTS' },
    { section: 'footguns', key: 'Ultimate Weapon Footguns', data_path: 'FOOTGUN_UW_OVERVIEW_FACTS' },
    { section: 'footguns', key: 'Choosing an Ultimate Weapon', data_path: 'FOOTGUN_ENTRIES["Choosing an Ultimate Weapon"]' },
    { section: 'footguns', key: 'Black Hole Cooldown', data_path: 'FOOTGUN_ENTRIES["Black Hole Cooldown"]' },
    { section: 'footguns', key: 'Changing the Cooldown of any Ultimate Weapon', data_path: 'FOOTGUN_ENTRIES["Changing the Cooldown of any Ultimate Weapon"]' },
    { section: 'footguns', key: 'Natural GT/BH Sync', data_path: 'FOOTGUN_ENTRIES["Natural GT/BH Sync"]' },
    { section: 'footguns', key: 'Lab Footguns', data_path: 'FOOTGUN_LAB_OVERVIEW_FACTS' },
    { section: 'footguns', key: 'Bot Cooldowns', data_path: 'FOOTGUN_ENTRIES["Bot Cooldowns"]' },
    { section: 'footguns', key: 'Chrono Field Range', data_path: 'FOOTGUN_ENTRIES["Chrono Field Range"]' },
  ]
}

export function extractGuideRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'guides', key: 'guides', data_path: 'GUIDE_OVERVIEW_FACTS' },
    { section: 'guides', key: 'Coin Guide Overview', data_path: 'COIN_GUIDE_OVERVIEW_FACTS' },
    { section: 'guides', key: 'Coin Guide Coins/Wave', data_path: 'COIN_GUIDE_CPW_FACTS' },
    { section: 'guides', key: 'Coin Guide Coins/Kill', data_path: 'COIN_GUIDE_CPK_FACTS' },
    { section: 'guides', key: 'Coin Guide Multipliers', data_path: 'COIN_GUIDE_MULTIPLIER_FACTS' },
    { section: 'guides', key: 'Coin Guide Syncing', data_path: 'COIN_GUIDE_SYNC_FACTS' },
    { section: 'guides', key: 'Coin Guide Coin Sources', data_path: 'COIN_GUIDE_SOURCE_ROWS' },
    { section: 'guides', key: 'Coin Guide Daily Missions', data_path: 'COIN_GUIDE_DAILY_MISSION_FACTS' },
    { section: 'guides', key: 'eHP Guide Overview', data_path: 'EHP_GUIDE_OVERVIEW_FACTS' },
    { section: 'guides', key: 'eHP Guide Starting Setup', data_path: 'EHP_GUIDE_UNLOCK_SECTIONS' },
    { section: 'guides', key: 'eHP Guide Workshop Priorities', data_path: 'EHP_GUIDE_WORKSHOP_FACTS' },
    { section: 'guides', key: 'eHP Guide Lab Priorities', data_path: 'EHP_GUIDE_LAB_TRACKS' },
    { section: 'guides', key: 'eHP Guide Card Priorities', data_path: 'EHP_GUIDE_CARD_ROWS' },
    { section: 'guides', key: 'eHP Guide Ultimate Weapon Support', data_path: 'EHP_GUIDE_UW_FACTS' },
    { section: 'guides', key: 'eHP Guide Round Triage', data_path: 'EHP_GUIDE_ROUND_ADJUSTMENT_ROWS' },
    { section: 'guides', key: 'eHP Guide Transition Tools', data_path: 'EHP_GUIDE_TRANSITION_FACTS' },
    { section: 'guides', key: 'Event Guide Overview', data_path: 'EVENT_GUIDE_OVERVIEW_FACTS' },
    { section: 'guides', key: 'Event Guide Event Context', data_path: 'EVENT_GUIDE_EVENT_CONTEXT_FACTS' },
    { section: 'guides', key: 'Event Guide General Methods', data_path: 'EVENT_GUIDE_GENERAL_METHOD_FACTS' },
    { section: 'guides', key: 'Event Guide Core Quests', data_path: 'EVENT_GUIDE_CORE_QUEST_ROWS' },
    { section: 'guides', key: 'Event Guide Survival Quests', data_path: 'EVENT_GUIDE_SURVIVAL_QUEST_ROWS' },
    { section: 'guides', key: 'Event Guide Active Quests', data_path: 'EVENT_GUIDE_ACTIVE_QUEST_ROWS' },
    { section: 'guides', key: 'Event Guide Ultimate Weapon Quests', data_path: 'EVENT_GUIDE_UW_QUEST_ROWS' },
    { section: 'guides', key: 'Gems Guide Overview', data_path: 'GEMS_GUIDE_OVERVIEW_FACTS' },
    { section: 'guides', key: 'Gems Guide Lab Slots', data_path: 'GEMS_GUIDE_LAB_SLOT_FACTS' },
    { section: 'guides', key: 'Gems Guide Early Cards and Slots', data_path: 'GEMS_GUIDE_CARD_STAGE_ROWS' },
    { section: 'guides', key: 'Gems Guide First Epic Modules', data_path: 'GEMS_GUIDE_MODULE_FACTS' },
    { section: 'guides', key: 'Gems Guide Ongoing Spending Loop', data_path: 'GEMS_GUIDE_SPENDING_LOOP_FACTS' },
    { section: 'guides', key: 'Gems Guide Lab Rushing', data_path: 'GEMS_GUIDE_LAB_RUSH_FACTS' },
    { section: 'guides', key: 'Medals Guide Overview', data_path: 'MEDALS_GUIDE_OVERVIEW_FACTS' },
    { section: 'guides', key: 'Medals Guide Past Relics', data_path: 'MEDALS_GUIDE_PAST_RELIC_FACTS' },
    { section: 'guides', key: 'Medals Guide Songs and Themes', data_path: 'MEDALS_GUIDE_SONGS_AND_THEMES_FACTS' },
    { section: 'guides', key: 'Medals Guide Stones and Gems', data_path: 'MEDALS_GUIDE_CURRENCY_FACTS' },
    { section: 'guides', key: 'Medals Guide Bot Progression', data_path: 'MEDALS_GUIDE_BOT_PROGRESS_FACTS' },
    { section: 'guides', key: 'Medals Guide Coin Bot Priorities', data_path: 'MEDALS_GUIDE_COIN_BOT_FACTS' },
    { section: 'guides', key: 'Medals Guide Later Bot Priorities', data_path: 'MEDALS_GUIDE_LATER_BOTS' },
    { section: 'guides', key: 'Orb Devo Guide Overview', data_path: 'ORB_DEVO_GUIDE_OVERVIEW_FACTS' },
    { section: 'guides', key: 'Orb Devo Guide Requirements', data_path: 'ORB_DEVO_GUIDE_REQUIREMENT_FACTS' },
    { section: 'guides', key: 'Orb Devo Guide Workshop Devo', data_path: 'ORB_DEVO_GUIDE_WORKSHOP_ROWS' },
    { section: 'guides', key: 'Orb Devo Guide Cards and Support', data_path: 'ORB_DEVO_GUIDE_CARD_ROWS' },
    { section: 'guides', key: 'Orb Devo Guide Run Plan', data_path: 'ORB_DEVO_GUIDE_RUN_PLAN_FACTS' },
    { section: 'guides', key: 'Orb Devo Guide Perk Priorities', data_path: 'ORB_DEVO_GUIDE_PERK_ROWS' },
    { section: 'guides', key: 'Orb Devo Guide Survival Priorities', data_path: 'ORB_DEVO_GUIDE_SURVIVAL_ROWS' },
    { section: 'guides', key: 'Orb Devo Guide Protector and Thorns Control', data_path: 'ORB_DEVO_GUIDE_PITFALL_FACTS' },
    { section: 'guides', key: 'Orbless Guide Overview', data_path: 'ORBLESS_GUIDE_OVERVIEW_FACTS' },
    { section: 'guides', key: 'Orbless Guide Requirements', data_path: 'ORBLESS_GUIDE_REQUIREMENT_FACTS' },
    { section: 'guides', key: 'Orbless Guide Survival Modes', data_path: 'ORBLESS_GUIDE_SURVIVAL_ROWS' },
    { section: 'guides', key: 'Orbless Guide Kill Methods', data_path: 'ORBLESS_GUIDE_KILL_ROWS' },
    { section: 'guides', key: 'Orbless Guide Nice-to-Haves', data_path: 'ORBLESS_GUIDE_SUPPORT_FACTS' },
    { section: 'guides', key: 'Orbless Guide Run Phases', data_path: 'ORBLESS_GUIDE_RUN_PHASE_ROWS' },
    { section: 'guides', key: 'Orbless Guide Workshop Setup', data_path: 'ORBLESS_GUIDE_WORKSHOP_FACTS' },
    { section: 'guides', key: 'Orbless Guide Module Choices', data_path: 'ORBLESS_GUIDE_MODULE_ROWS' },
    { section: 'guides', key: 'Orbless Guide Perk Plan', data_path: 'ORBLESS_GUIDE_PERK_FACTS' },
    { section: 'guides', key: 'Orbless Guide Strategy Tips', data_path: 'ORBLESS_GUIDE_STRATEGY_ROWS' },
    { section: 'guides', key: 'Perks Guide Overview', data_path: 'PERKS_GUIDE_OVERVIEW_FACTS' },
    { section: 'guides', key: 'Perks Guide Early Priorities', data_path: 'PERKS_GUIDE_EARLY_FACTS' },
    { section: 'guides', key: 'Perks Guide Established Towers', data_path: 'PERKS_GUIDE_ESTABLISHED_FACTS' },
    { section: 'guides', key: 'Perks Guide Coin Runs', data_path: 'PERKS_GUIDE_COIN_RUN_FACTS' },
    { section: 'guides', key: 'Perks Guide Milestone Runs', data_path: 'PERKS_GUIDE_MILESTONE_FACTS' },
    { section: 'guides', key: 'Perks Guide Perk Reduction', data_path: 'PERKS_GUIDE_REDUCTION_FACTS' },
    { section: 'guides', key: 'Perks Guide Priority Routes', data_path: 'PERKS_GUIDE_PRIORITY_ROWS' },
    { section: 'guides', key: 'Perks Guide Common Pitfalls', data_path: 'PERKS_GUIDE_PITFALL_FACTS' },
    { section: 'guides', key: 'SMAX Devo Guide Overview', data_path: 'SMAX_DEVO_GUIDE_OVERVIEW_FACTS' },
    { section: 'guides', key: 'SMAX Devo Guide Requirements', data_path: 'SMAX_DEVO_GUIDE_REQUIREMENT_FACTS' },
    { section: 'guides', key: 'SMAX Devo Guide Workshop Devo', data_path: 'SMAX_DEVO_GUIDE_WORKSHOP_ROWS' },
    { section: 'guides', key: 'SMAX Devo Guide Cards and Support', data_path: 'SMAX_DEVO_GUIDE_CARD_ROWS' },
    { section: 'guides', key: 'SMAX Devo Guide Run Plan', data_path: 'SMAX_DEVO_GUIDE_RUN_PLAN_FACTS' },
    { section: 'guides', key: 'SMAX Devo Guide Improvement Paths', data_path: 'SMAX_DEVO_GUIDE_IMPROVEMENT_FACTS' },
    { section: 'guides', key: 'SMAX Devo Guide Perk Priorities', data_path: 'SMAX_DEVO_GUIDE_PERK_ROWS' },
    { section: 'guides', key: 'SMAX Devo Guide Survival Priorities', data_path: 'SMAX_DEVO_GUIDE_SURVIVAL_ROWS' },
    { section: 'guides', key: 'SMAX Devo Guide Thorns Trimming', data_path: 'SMAX_DEVO_GUIDE_THORNS_FACTS' },
    { section: 'guides', key: 'SMAX Devo Guide Common Pitfalls', data_path: 'SMAX_DEVO_GUIDE_PITFALL_FACTS' },
    { section: 'guides', key: 'Tier 1 Beginner Guide Overview', data_path: 'TIER1_BEGINNER_GUIDE_OVERVIEW_FACTS' },
    { section: 'guides', key: 'Tier 1 Beginner Guide Step 1 Economy', data_path: 'TIER1_BEGINNER_GUIDE_STEP_ONE_ECONOMY_FACTS' },
    { section: 'guides', key: 'Tier 1 Beginner Guide Step 1 Turtle Shell', data_path: 'TIER1_BEGINNER_GUIDE_STEP_ONE_DEFENSE_FACTS' },
    { section: 'guides', key: 'Tier 1 Beginner Guide Step 1 Run Loop', data_path: 'TIER1_BEGINNER_GUIDE_STEP_ONE_RUN_FACTS' },
    { section: 'guides', key: 'Tier 1 Beginner Guide Step 2 Health Pivot', data_path: 'TIER1_BEGINNER_GUIDE_STEP_TWO_ROWS' },
    { section: 'guides', key: 'Tier 1 Beginner Guide Tier 2 Transition', data_path: 'TIER1_BEGINNER_GUIDE_TRANSITION_FACTS' },
    { section: 'guides', key: 'Tier Rushing Guide Overview', data_path: 'TIER_RUSHING_GUIDE_OVERVIEW_FACTS' },
    { section: 'guides', key: 'Tier Rushing Guide Survival Layers', data_path: 'TIER_RUSHING_GUIDE_SUPPORT_ROWS' },
    { section: 'guides', key: 'Tier Rushing Guide Timing Control', data_path: 'TIER_RUSHING_GUIDE_TIMING_ROWS' },
    { section: 'guides', key: 'Tier Rushing Guide Run Sequence', data_path: 'TIER_RUSHING_GUIDE_RUN_PLAN_FACTS' },
    { section: 'guides', key: 'Tier Rushing Guide Breakpoints and Limits', data_path: 'TIER_RUSHING_GUIDE_BREAKPOINT_FACTS' },
    { section: 'guides', key: 'Ultimate Weapon Pick Order Guide Overview', data_path: 'UW_PICK_ORDER_GUIDE_OVERVIEW_FACTS' },
    { section: 'guides', key: 'Ultimate Weapon Pick Order Guide Economy Core', data_path: 'UW_PICK_ORDER_GUIDE_ECONOMY_FACTS' },
    { section: 'guides', key: 'Ultimate Weapon Pick Order Guide Damage and Coin Follow-Ups', data_path: 'UW_PICK_ORDER_GUIDE_DAMAGE_FACTS' },
    { section: 'guides', key: 'Ultimate Weapon Pick Order Guide Control and Midgame Damage', data_path: 'UW_PICK_ORDER_GUIDE_CONTROL_FACTS' },
    { section: 'guides', key: 'Ultimate Weapon Pick Order Guide Late-Game Specialists', data_path: 'UW_PICK_ORDER_GUIDE_LATE_FACTS' },
  ]
}

export function extractGuildRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'guilds', key: 'guilds', data_path: 'guilds' },
    { section: 'guilds', key: 'Guilds', data_path: 'guilds' },
    { section: 'guilds', key: 'Guild Seasons', data_path: 'guilds' },
    { section: 'guilds', key: 'Guild Shop', data_path: 'guilds' },
    { section: 'guilds', key: 'Guild Shop Currency Purchases', data_path: 'guilds' },
    { section: 'guilds', key: 'Guild Themes', data_path: 'guilds' },
    { section: 'guilds', key: 'Guild Relics', data_path: 'guilds' },
    { section: 'guilds', key: 'Guild Token Cashout', data_path: 'guilds' },
    ...buildGuardianDefinitions().map(guardian => ({
      section: 'guilds',
      key: `${guardian.label} Guardian`,
      data_path: buildQuotedConstantPath('guardianUpgrades', guardian.key),
    })),
  ]
}

export function extractLabRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'labs', key: 'labs', data_path: 'labs' },
    ...LABS.map(lab => ({
      section: 'labs',
      key: lab.name,
      data_path: 'labs',
    })),
  ]
}

export function extractMilestoneRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'milestones', key: 'milestones', data_path: 'MILESTONE_TIER_DATA' },
    { section: 'milestones', key: 'Milestone Standard Track', data_path: 'MILESTONE_TIER_TRACKS' },
    { section: 'milestones', key: 'Milestone Premium Track', data_path: 'MILESTONE_TIER_TRACKS' },
    { section: 'milestones', key: 'Milestone Tier Progression', data_path: 'MILESTONE_REWARD_ROWS' },
    { section: 'milestones', key: 'Milestone Tier Totals', data_path: 'MILESTONE_TOTAL_ROWS' },
  ]
}

export function extractPerkRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'perks', key: 'perks', data_path: 'ALL_PERKS' },
    { section: 'perks', key: 'Perk Wave Requirement', data_path: 'PERK_WAVE_REQUIREMENT_BRACKETS' },
    { section: 'perks', key: 'Perk Choice', data_path: 'PERK_CHOICE_FACTS' },
    { section: 'perks', key: 'Standard Perk Math', data_path: 'STANDARD_PERK_MATH_FACTS' },
    { section: 'perks', key: 'Standard Perks', data_path: 'STANDARD_PERKS' },
    { section: 'perks', key: 'Ultimate Weapon Perks', data_path: 'UW_PERKS' },
    { section: 'perks', key: 'Random Ultimate Weapon Perk', data_path: 'RANDOM_UW_PERK_STATS' },
    { section: 'perks', key: 'Trade-off Perks', data_path: 'TRADE_OFF_PERKS' },
    { section: 'perks', key: 'Perk Labs', data_path: 'PERK_LABS' },
  ]
}

export function extractRelicRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'relics', key: 'relics', data_path: 'RELIC_OVERVIEW_FACTS' },
    { section: 'relics', key: 'Relic Usage', data_path: 'RELIC_USAGE_FACTS' },
    { section: 'relics', key: 'Relic Unlock Methods', data_path: 'RELIC_UNLOCK_METHODS' },
    { section: 'relics', key: 'Total Relic Bonuses', data_path: 'RELIC_TOTAL_BONUS_CATEGORIES' },
    { section: 'relics', key: 'Misc Relic Totals', data_path: 'RELIC_MISC_TOTALS' },
    { section: 'relics', key: 'Damage Relic Totals', data_path: 'RELIC_DAMAGE_TOTALS' },
    { section: 'relics', key: 'Defense Relic Totals', data_path: 'RELIC_DEFENSE_TOTALS' },
    { section: 'relics', key: 'Utility Relic Totals', data_path: 'RELIC_UTILITY_TOTALS' },
  ]
}

export function extractTierRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'tiers', key: 'tiers', data_path: 'TIER_DATA' },
    { section: 'tiers', key: 'Tier Coin Bonus', data_path: 'TIER_COIN_BONUS_ROWS' },
    { section: 'tiers', key: 'Tier Unlock Requirement', data_path: 'TIER_UNLOCK_REQUIREMENT_ROWS' },
    { section: 'tiers', key: 'Tier Battle Conditions', data_path: 'TIER_BATTLE_CONDITION_ROWS' },
    { section: 'tiers', key: 'Battle Condition Definitions', data_path: 'TIER_BATTLE_CONDITION_DEFINITIONS' },
  ]
}

export function extractTournamentRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'tournaments', key: 'tournaments', data_path: 'TOURNAMENT_LEAGUES' },
    { section: 'tournaments', key: 'Tournament Entry', data_path: 'TOURNAMENT_UNLOCK_REQUIREMENT' },
    { section: 'tournaments', key: 'Tournament Tickets', data_path: 'TOURNAMENT_TICKET_MODEL' },
    { section: 'tournaments', key: 'Tournament Promotion', data_path: 'TOURNAMENT_PROMOTION_RULES' },
    { section: 'tournaments', key: 'Tournament Difficulty', data_path: 'TOURNAMENT_DIFFICULTY_FACTS' },
    { section: 'tournaments', key: 'Tournament Heat', data_path: 'TOURNAMENT_HEAT_PROFILES' },
    { section: 'tournaments', key: 'Tournament Battle Condition Definitions', data_path: 'TOURNAMENT_BATTLE_CONDITION_DEFINITIONS' },
    { section: 'tournaments', key: 'Tournament Rewards', data_path: 'TOURNAMENT_REWARD_ROWS' },
  ]
}

export function extractThemeRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'themes', key: 'themes', data_path: 'THEME_OVERVIEW_FACTS' },
    { section: 'themes', key: 'Theme Categories', data_path: 'THEME_CATEGORY_DEFINITIONS' },
    { section: 'themes', key: 'Theme Passive Coin Bonus', data_path: 'THEME_PASSIVE_FORMULA_TERMS' },
    { section: 'themes', key: 'Theme Songs', data_path: 'THEME_SONG_FACTS' },
    { section: 'themes', key: 'Theme Relic Menu', data_path: 'THEME_RELIC_MENU_FACTS' },
  ]
}

export function extractVaultRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'vault', key: 'vault', data_path: 'VAULT_TREE_DEFINITIONS' },
    { section: 'vault', key: 'Vault Visibility', data_path: 'VAULT_VISIBILITY_FACTS' },
    { section: 'vault', key: 'Vault Keys', data_path: 'VAULT_KEY_FACTS' },
    { section: 'vault', key: 'Power Tree', data_path: 'POWER_VAULT_TREE' },
    { section: 'vault', key: 'Harmony Tree', data_path: 'HARMONY_VAULT_TREE' },
    { section: 'vault', key: 'Vault Tracker Progress', data_path: 'vault_tracker' },
  ]
}

function getModuleSubstatFamilyKeys(): string[] {
  const families: ModuleCategory[] = ['Cannon', 'Armor', 'Generator', 'Core']
  return families.map(family => `${family} Module Substats`)
}

export function extractModuleRawMechanicSources(): RawMechanicSource[] {
  return [
    { section: 'modules', key: 'modules', data_path: 'modules' },
    ...getModuleSubstatFamilyKeys().map(key => ({
      section: 'modules',
      key,
      data_path: 'modules',
    })),
    ...MODULE_TEMPLATES.map(module => ({
      section: 'modules',
      key: module.name,
      data_path: buildQuotedConstantPath('MODULE_TEMPLATE_MAP', module.id),
    })),
  ]
}

export function extractUltimateWeaponRawMechanicSources(): RawMechanicSource[] {
  const weaponNames = extractUltimateWeaponNamesFromSourceText(readUltimateWeaponsSourceText())
  return [
    { section: 'ultimate_weapons', key: 'list', data_path: 'ultimate_weapons_structured' },
    ...weaponNames.map(name => ({
      section: 'ultimate_weapons',
      key: name,
      data_path: buildQuotedObjectPath('ultimate_weapons_structured', name),
    })),
  ]
}

export function buildBaseMechanicNamingRegistry(): NamingRegistry {
  return buildNamingRegistry([
    ...extractWorkshopRawMechanicSources(),
    ...extractWorkshopEnhancementRawMechanicSources(),
    ...extractUltimateWeaponRawMechanicSources(),
    ...extractBotRawMechanicSources(),
    ...extractCardRawMechanicSources(),
    ...extractCurrencyRawMechanicSources(),
    ...extractDailyMissionRawMechanicSources(),
    ...extractEnemyRawMechanicSources(),
    ...extractEventRawMechanicSources(),
    ...extractFaqRawMechanicSources(),
    ...extractFootgunRawMechanicSources(),
    ...extractGuideRawMechanicSources(),
    ...extractGuildRawMechanicSources(),
    ...extractLabRawMechanicSources(),
    ...extractMilestoneRawMechanicSources(),
    ...extractModuleRawMechanicSources(),
    ...extractPerkRawMechanicSources(),
    ...extractRelicRawMechanicSources(),
    ...extractTierRawMechanicSources(),
    ...extractTournamentRawMechanicSources(),
    ...extractThemeRawMechanicSources(),
    ...extractVaultRawMechanicSources(),
  ])
}

export const BASE_MECHANIC_NAMING_REGISTRY = buildBaseMechanicNamingRegistry()

export function getNamingRegistryEntry(mechanicId: string): NamingRegistryEntry | null {
  return BASE_MECHANIC_NAMING_REGISTRY[mechanicId] ?? null
}

export function getRequiredNamingRegistryEntry(mechanicId: string): NamingRegistryEntry {
  const entry = getNamingRegistryEntry(mechanicId)
  if (!entry) {
    throw new Error(`Missing naming registry entry for mechanic_id: ${mechanicId}`)
  }
  return entry
}

export function getRequiredNamingRegistryEntryBySource(section: string, key: string): NamingRegistryEntry {
  return getRequiredNamingRegistryEntry(deriveMechanicId(section, key))
}
