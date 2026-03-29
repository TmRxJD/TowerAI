import {
  COIN_GUIDE_CPK_FACTS,
  COIN_GUIDE_CPW_FACTS,
  COIN_GUIDE_DAILY_MISSION_FACTS,
  COIN_GUIDE_MULTIPLIER_EXAMPLE,
  COIN_GUIDE_MULTIPLIER_FACTS,
  COIN_GUIDE_MVN_FACTS,
  COIN_GUIDE_OVERVIEW_FACTS,
  COIN_GUIDE_SOURCE_ROWS,
  COIN_GUIDE_SUMMARY_FACTS,
  COIN_GUIDE_SYNC_CONSTRAINT_FACTS,
  COIN_GUIDE_SYNC_EXAMPLE,
  COIN_GUIDE_SYNC_FACTS,
  COIN_GUIDE_SYNC_HEATMAP_FACTS,
  type CoinGuideMultiplierExample,
  type CoinGuideSourceRow,
  type CoinGuideSyncExample,
  EHP_GUIDE_CARD_ROWS,
  EHP_GUIDE_LAB_CORE_FACTS,
  EHP_GUIDE_LAB_TRACKS,
  EHP_GUIDE_OVERVIEW_FACTS,
  EHP_GUIDE_ROUND_ADJUSTMENT_ROWS,
  EHP_GUIDE_STRENGTHS,
  EHP_GUIDE_TRANSITION_FACTS,
  EHP_GUIDE_UNLOCK_SECTIONS,
  EHP_GUIDE_UW_FACTS,
  EHP_GUIDE_WEAKNESSES,
  EHP_GUIDE_WORKSHOP_FACTS,
  type EhpGuideCardRow,
  type EhpGuideLabTrack,
  type EhpGuideRoundAdjustmentRow,
  type EhpGuideUnlockSection,
  EVENT_GUIDE_ACTIVE_QUEST_ROWS,
  EVENT_GUIDE_CORE_QUEST_ROWS,
  EVENT_GUIDE_EVENT_CONTEXT_FACTS,
  EVENT_GUIDE_GENERAL_METHOD_FACTS,
  EVENT_GUIDE_OVERVIEW_FACTS,
  EVENT_GUIDE_SURVIVAL_QUEST_ROWS,
  EVENT_GUIDE_UW_QUEST_ROWS,
  type EventGuideQuestRow,
  GEMS_GUIDE_CARD_STAGE_ROWS,
  GEMS_GUIDE_LAB_RUSH_FACTS,
  GEMS_GUIDE_LAB_SLOT_FACTS,
  GEMS_GUIDE_MODULE_FACTS,
  GEMS_GUIDE_OVERVIEW_FACTS,
  GEMS_GUIDE_SPENDING_LOOP_FACTS,
  type GemsGuideStageRow,
  GUIDE_DEFINITIONS,
  GUIDE_OVERVIEW_FACTS,
  type GuideDefinition,
  MEDALS_GUIDE_BOT_PROGRESS_FACTS,
  MEDALS_GUIDE_COIN_BOT_FACTS,
  MEDALS_GUIDE_CURRENCY_FACTS,
  MEDALS_GUIDE_LATER_BOTS,
  MEDALS_GUIDE_OVERVIEW_FACTS,
  MEDALS_GUIDE_PAST_RELIC_FACTS,
  MEDALS_GUIDE_SONGS_AND_THEMES_FACTS,
  type MedalsGuideBotRow,
  ORB_DEVO_GUIDE_CARD_ROWS,
  ORB_DEVO_GUIDE_OVERVIEW_FACTS,
  ORB_DEVO_GUIDE_PERK_ROWS,
  ORB_DEVO_GUIDE_PITFALL_FACTS,
  ORB_DEVO_GUIDE_REQUIREMENT_FACTS,
  ORB_DEVO_GUIDE_RUN_PLAN_FACTS,
  ORB_DEVO_GUIDE_SUPPORT_FACTS,
  ORB_DEVO_GUIDE_SURVIVAL_ROWS,
  ORB_DEVO_GUIDE_WORKSHOP_ROWS,
  type OrbDevoGuideGroupRow,
  ORBLESS_GUIDE_KILL_ROWS,
  ORBLESS_GUIDE_MODULE_ROWS,
  ORBLESS_GUIDE_OVERVIEW_FACTS,
  ORBLESS_GUIDE_PERK_FACTS,
  ORBLESS_GUIDE_REQUIREMENT_FACTS,
  ORBLESS_GUIDE_RUN_PHASE_ROWS,
  ORBLESS_GUIDE_STRATEGY_ROWS,
  ORBLESS_GUIDE_SUPPORT_FACTS,
  ORBLESS_GUIDE_SURVIVAL_ROWS,
  ORBLESS_GUIDE_WORKSHOP_FACTS,
  type OrblessGuideGroupRow,
  PERKS_GUIDE_COIN_RUN_FACTS,
  PERKS_GUIDE_EARLY_FACTS,
  PERKS_GUIDE_ESTABLISHED_FACTS,
  PERKS_GUIDE_MILESTONE_FACTS,
  PERKS_GUIDE_OVERVIEW_FACTS,
  PERKS_GUIDE_PITFALL_FACTS,
  PERKS_GUIDE_PRIORITY_FACTS,
  PERKS_GUIDE_PRIORITY_ROWS,
  PERKS_GUIDE_REDUCTION_FACTS,
  type PerksGuideGroupRow,
  SMAX_DEVO_GUIDE_CARD_ROWS,
  SMAX_DEVO_GUIDE_IMPROVEMENT_FACTS,
  SMAX_DEVO_GUIDE_OVERVIEW_FACTS,
  SMAX_DEVO_GUIDE_PERK_ROWS,
  SMAX_DEVO_GUIDE_PITFALL_FACTS,
  SMAX_DEVO_GUIDE_REQUIREMENT_FACTS,
  SMAX_DEVO_GUIDE_RUN_PLAN_FACTS,
  SMAX_DEVO_GUIDE_SUPPORT_FACTS,
  SMAX_DEVO_GUIDE_SURVIVAL_ROWS,
  SMAX_DEVO_GUIDE_THORNS_FACTS,
  SMAX_DEVO_GUIDE_WORKSHOP_ROWS,
  type SmaxDevoGuideGroupRow,
  TIER1_BEGINNER_GUIDE_OVERVIEW_FACTS,
  TIER1_BEGINNER_GUIDE_STEP_ONE_DEFENSE_FACTS,
  TIER1_BEGINNER_GUIDE_STEP_ONE_ECONOMY_FACTS,
  TIER1_BEGINNER_GUIDE_STEP_ONE_RUN_FACTS,
  TIER1_BEGINNER_GUIDE_STEP_TWO_ROWS,
  TIER1_BEGINNER_GUIDE_TRANSITION_FACTS,
  type Tier1BeginnerGuideGroupRow,
  TIER_RUSHING_GUIDE_BREAKPOINT_FACTS,
  TIER_RUSHING_GUIDE_OVERVIEW_FACTS,
  TIER_RUSHING_GUIDE_RUN_PLAN_FACTS,
  TIER_RUSHING_GUIDE_SUPPORT_ROWS,
  TIER_RUSHING_GUIDE_TIMING_ROWS,
  type TierRushingGuideGroupRow,
  UW_PICK_ORDER_GUIDE_CONTROL_FACTS,
  UW_PICK_ORDER_GUIDE_DAMAGE_FACTS,
  UW_PICK_ORDER_GUIDE_ECONOMY_FACTS,
  UW_PICK_ORDER_GUIDE_LATE_FACTS,
  UW_PICK_ORDER_GUIDE_OVERVIEW_FACTS,
} from '@tmrxjd/platform/tools'

export interface EhpGuideSourceDocument {
  overviewFacts: string[]
  strengths: string[]
  weaknesses: string[]
  startingUnlockSections: readonly EhpGuideUnlockSection[]
  workshopFacts: string[]
  labCoreFacts: string[]
  labTracks: readonly EhpGuideLabTrack[]
  cardRows: readonly EhpGuideCardRow[]
  uwFacts: string[]
  roundAdjustmentRows: readonly EhpGuideRoundAdjustmentRow[]
  transitionFacts: string[]
}

export interface CoinGuideSourceDocument {
  overviewFacts: string[]
  coinsPerWaveFacts: string[]
  coinsPerKillFacts: string[]
  multiplierFacts: string[]
  multiplierExample: CoinGuideMultiplierExample
  syncFacts: string[]
  syncExample: CoinGuideSyncExample
  syncHeatmapFacts: string[]
  multiverseNexusFacts: string[]
  syncConstraintFacts: string[]
  sourceRows: readonly CoinGuideSourceRow[]
  summaryFacts: string[]
  dailyMissionFacts: string[]
}

export interface EventGuideSourceDocument {
  overviewFacts: string[]
  eventContextFacts: string[]
  generalMethodFacts: string[]
  coreQuestRows: readonly EventGuideQuestRow[]
  survivalQuestRows: readonly EventGuideQuestRow[]
  activeQuestRows: readonly EventGuideQuestRow[]
  ultimateWeaponQuestRows: readonly EventGuideQuestRow[]
}

export interface GemsGuideSourceDocument {
  overviewFacts: string[]
  labSlotFacts: string[]
  cardStageRows: readonly GemsGuideStageRow[]
  moduleFacts: string[]
  spendingLoopFacts: string[]
  labRushFacts: string[]
}

export interface MedalsGuideSourceDocument {
  overviewFacts: string[]
  pastRelicFacts: string[]
  songsAndThemesFacts: string[]
  currencyFacts: string[]
  botProgressFacts: string[]
  coinBotFacts: string[]
  laterBotRows: readonly MedalsGuideBotRow[]
}

export interface OrbDevoGuideSourceDocument {
  overviewFacts: string[]
  requirementFacts: string[]
  workshopRows: readonly OrbDevoGuideGroupRow[]
  cardRows: readonly OrbDevoGuideGroupRow[]
  supportFacts: string[]
  runPlanFacts: string[]
  perkRows: readonly OrbDevoGuideGroupRow[]
  survivalRows: readonly OrbDevoGuideGroupRow[]
  pitfallFacts: string[]
}

export interface OrblessGuideSourceDocument {
  overviewFacts: string[]
  requirementFacts: string[]
  survivalRows: readonly OrblessGuideGroupRow[]
  killRows: readonly OrblessGuideGroupRow[]
  supportFacts: string[]
  runPhaseRows: readonly OrblessGuideGroupRow[]
  workshopFacts: string[]
  moduleRows: readonly OrblessGuideGroupRow[]
  perkFacts: string[]
  strategyRows: readonly OrblessGuideGroupRow[]
}

export interface PerksGuideSourceDocument {
  overviewFacts: string[]
  earlyFacts: string[]
  establishedFacts: string[]
  coinRunFacts: string[]
  milestoneFacts: string[]
  reductionFacts: string[]
  priorityFacts: string[]
  priorityRows: readonly PerksGuideGroupRow[]
  pitfallFacts: string[]
}

export interface SmaxDevoGuideSourceDocument {
  overviewFacts: string[]
  requirementFacts: string[]
  workshopRows: readonly SmaxDevoGuideGroupRow[]
  cardRows: readonly SmaxDevoGuideGroupRow[]
  supportFacts: string[]
  runPlanFacts: string[]
  improvementFacts: string[]
  perkRows: readonly SmaxDevoGuideGroupRow[]
  survivalRows: readonly SmaxDevoGuideGroupRow[]
  thornsFacts: string[]
  pitfallFacts: string[]
}

export interface Tier1BeginnerGuideSourceDocument {
  overviewFacts: string[]
  stepOneEconomyFacts: string[]
  stepOneDefenseFacts: string[]
  stepOneRunFacts: string[]
  stepTwoRows: readonly Tier1BeginnerGuideGroupRow[]
  transitionFacts: string[]
}

export interface TierRushingGuideSourceDocument {
  overviewFacts: string[]
  supportRows: readonly TierRushingGuideGroupRow[]
  timingRows: readonly TierRushingGuideGroupRow[]
  runPlanFacts: string[]
  breakpointFacts: string[]
}

export interface UltimateWeaponPickOrderGuideSourceDocument {
  overviewFacts: string[]
  economyFacts: string[]
  damageFacts: string[]
  controlFacts: string[]
  lateFacts: string[]
}

export interface GuidesSourceDocument {
  overviewFacts: string[]
  guides: readonly GuideDefinition[]
  coinGuide: CoinGuideSourceDocument
  ehpGuide: EhpGuideSourceDocument
  eventGuide: EventGuideSourceDocument
  gemsGuide: GemsGuideSourceDocument
  medalsGuide: MedalsGuideSourceDocument
  orbDevoGuide: OrbDevoGuideSourceDocument
  orblessGuide: OrblessGuideSourceDocument
  perksGuide: PerksGuideSourceDocument
  smaxDevoGuide: SmaxDevoGuideSourceDocument
  tier1BeginnerGuide: Tier1BeginnerGuideSourceDocument
  tierRushingGuide: TierRushingGuideSourceDocument
  ultimateWeaponPickOrderGuide: UltimateWeaponPickOrderGuideSourceDocument
}

export function loadGuidesSourceDocument(): GuidesSourceDocument {
  return {
    overviewFacts: [...GUIDE_OVERVIEW_FACTS],
    guides: GUIDE_DEFINITIONS,
    coinGuide: {
      overviewFacts: [...COIN_GUIDE_OVERVIEW_FACTS],
      coinsPerWaveFacts: [...COIN_GUIDE_CPW_FACTS],
      coinsPerKillFacts: [...COIN_GUIDE_CPK_FACTS],
      multiplierFacts: [...COIN_GUIDE_MULTIPLIER_FACTS],
      multiplierExample: COIN_GUIDE_MULTIPLIER_EXAMPLE,
      syncFacts: [...COIN_GUIDE_SYNC_FACTS],
      syncExample: COIN_GUIDE_SYNC_EXAMPLE,
      syncHeatmapFacts: [...COIN_GUIDE_SYNC_HEATMAP_FACTS],
      multiverseNexusFacts: [...COIN_GUIDE_MVN_FACTS],
      syncConstraintFacts: [...COIN_GUIDE_SYNC_CONSTRAINT_FACTS],
      sourceRows: COIN_GUIDE_SOURCE_ROWS,
      summaryFacts: [...COIN_GUIDE_SUMMARY_FACTS],
      dailyMissionFacts: [...COIN_GUIDE_DAILY_MISSION_FACTS],
    },
    ehpGuide: {
      overviewFacts: [...EHP_GUIDE_OVERVIEW_FACTS],
      strengths: [...EHP_GUIDE_STRENGTHS],
      weaknesses: [...EHP_GUIDE_WEAKNESSES],
      startingUnlockSections: EHP_GUIDE_UNLOCK_SECTIONS,
      workshopFacts: [...EHP_GUIDE_WORKSHOP_FACTS],
      labCoreFacts: [...EHP_GUIDE_LAB_CORE_FACTS],
      labTracks: EHP_GUIDE_LAB_TRACKS,
      cardRows: EHP_GUIDE_CARD_ROWS,
      uwFacts: [...EHP_GUIDE_UW_FACTS],
      roundAdjustmentRows: EHP_GUIDE_ROUND_ADJUSTMENT_ROWS,
      transitionFacts: [...EHP_GUIDE_TRANSITION_FACTS],
    },
    eventGuide: {
      overviewFacts: [...EVENT_GUIDE_OVERVIEW_FACTS],
      eventContextFacts: [...EVENT_GUIDE_EVENT_CONTEXT_FACTS],
      generalMethodFacts: [...EVENT_GUIDE_GENERAL_METHOD_FACTS],
      coreQuestRows: EVENT_GUIDE_CORE_QUEST_ROWS,
      survivalQuestRows: EVENT_GUIDE_SURVIVAL_QUEST_ROWS,
      activeQuestRows: EVENT_GUIDE_ACTIVE_QUEST_ROWS,
      ultimateWeaponQuestRows: EVENT_GUIDE_UW_QUEST_ROWS,
    },
    gemsGuide: {
      overviewFacts: [...GEMS_GUIDE_OVERVIEW_FACTS],
      labSlotFacts: [...GEMS_GUIDE_LAB_SLOT_FACTS],
      cardStageRows: GEMS_GUIDE_CARD_STAGE_ROWS,
      moduleFacts: [...GEMS_GUIDE_MODULE_FACTS],
      spendingLoopFacts: [...GEMS_GUIDE_SPENDING_LOOP_FACTS],
      labRushFacts: [...GEMS_GUIDE_LAB_RUSH_FACTS],
    },
    medalsGuide: {
      overviewFacts: [...MEDALS_GUIDE_OVERVIEW_FACTS],
      pastRelicFacts: [...MEDALS_GUIDE_PAST_RELIC_FACTS],
      songsAndThemesFacts: [...MEDALS_GUIDE_SONGS_AND_THEMES_FACTS],
      currencyFacts: [...MEDALS_GUIDE_CURRENCY_FACTS],
      botProgressFacts: [...MEDALS_GUIDE_BOT_PROGRESS_FACTS],
      coinBotFacts: [...MEDALS_GUIDE_COIN_BOT_FACTS],
      laterBotRows: MEDALS_GUIDE_LATER_BOTS,
    },
    orbDevoGuide: {
      overviewFacts: [...ORB_DEVO_GUIDE_OVERVIEW_FACTS],
      requirementFacts: [...ORB_DEVO_GUIDE_REQUIREMENT_FACTS],
      workshopRows: ORB_DEVO_GUIDE_WORKSHOP_ROWS,
      cardRows: ORB_DEVO_GUIDE_CARD_ROWS,
      supportFacts: [...ORB_DEVO_GUIDE_SUPPORT_FACTS],
      runPlanFacts: [...ORB_DEVO_GUIDE_RUN_PLAN_FACTS],
      perkRows: ORB_DEVO_GUIDE_PERK_ROWS,
      survivalRows: ORB_DEVO_GUIDE_SURVIVAL_ROWS,
      pitfallFacts: [...ORB_DEVO_GUIDE_PITFALL_FACTS],
    },
    orblessGuide: {
      overviewFacts: [...ORBLESS_GUIDE_OVERVIEW_FACTS],
      requirementFacts: [...ORBLESS_GUIDE_REQUIREMENT_FACTS],
      survivalRows: ORBLESS_GUIDE_SURVIVAL_ROWS,
      killRows: ORBLESS_GUIDE_KILL_ROWS,
      supportFacts: [...ORBLESS_GUIDE_SUPPORT_FACTS],
      runPhaseRows: ORBLESS_GUIDE_RUN_PHASE_ROWS,
      workshopFacts: [...ORBLESS_GUIDE_WORKSHOP_FACTS],
      moduleRows: ORBLESS_GUIDE_MODULE_ROWS,
      perkFacts: [...ORBLESS_GUIDE_PERK_FACTS],
      strategyRows: ORBLESS_GUIDE_STRATEGY_ROWS,
    },
    perksGuide: {
      overviewFacts: [...PERKS_GUIDE_OVERVIEW_FACTS],
      earlyFacts: [...PERKS_GUIDE_EARLY_FACTS],
      establishedFacts: [...PERKS_GUIDE_ESTABLISHED_FACTS],
      coinRunFacts: [...PERKS_GUIDE_COIN_RUN_FACTS],
      milestoneFacts: [...PERKS_GUIDE_MILESTONE_FACTS],
      reductionFacts: [...PERKS_GUIDE_REDUCTION_FACTS],
      priorityFacts: [...PERKS_GUIDE_PRIORITY_FACTS],
      priorityRows: PERKS_GUIDE_PRIORITY_ROWS,
      pitfallFacts: [...PERKS_GUIDE_PITFALL_FACTS],
    },
    smaxDevoGuide: {
      overviewFacts: [...SMAX_DEVO_GUIDE_OVERVIEW_FACTS],
      requirementFacts: [...SMAX_DEVO_GUIDE_REQUIREMENT_FACTS],
      workshopRows: SMAX_DEVO_GUIDE_WORKSHOP_ROWS,
      cardRows: SMAX_DEVO_GUIDE_CARD_ROWS,
      supportFacts: [...SMAX_DEVO_GUIDE_SUPPORT_FACTS],
      runPlanFacts: [...SMAX_DEVO_GUIDE_RUN_PLAN_FACTS],
      improvementFacts: [...SMAX_DEVO_GUIDE_IMPROVEMENT_FACTS],
      perkRows: SMAX_DEVO_GUIDE_PERK_ROWS,
      survivalRows: SMAX_DEVO_GUIDE_SURVIVAL_ROWS,
      thornsFacts: [...SMAX_DEVO_GUIDE_THORNS_FACTS],
      pitfallFacts: [...SMAX_DEVO_GUIDE_PITFALL_FACTS],
    },
    tier1BeginnerGuide: {
      overviewFacts: [...TIER1_BEGINNER_GUIDE_OVERVIEW_FACTS],
      stepOneEconomyFacts: [...TIER1_BEGINNER_GUIDE_STEP_ONE_ECONOMY_FACTS],
      stepOneDefenseFacts: [...TIER1_BEGINNER_GUIDE_STEP_ONE_DEFENSE_FACTS],
      stepOneRunFacts: [...TIER1_BEGINNER_GUIDE_STEP_ONE_RUN_FACTS],
      stepTwoRows: TIER1_BEGINNER_GUIDE_STEP_TWO_ROWS,
      transitionFacts: [...TIER1_BEGINNER_GUIDE_TRANSITION_FACTS],
    },
    tierRushingGuide: {
      overviewFacts: [...TIER_RUSHING_GUIDE_OVERVIEW_FACTS],
      supportRows: TIER_RUSHING_GUIDE_SUPPORT_ROWS,
      timingRows: TIER_RUSHING_GUIDE_TIMING_ROWS,
      runPlanFacts: [...TIER_RUSHING_GUIDE_RUN_PLAN_FACTS],
      breakpointFacts: [...TIER_RUSHING_GUIDE_BREAKPOINT_FACTS],
    },
    ultimateWeaponPickOrderGuide: {
      overviewFacts: [...UW_PICK_ORDER_GUIDE_OVERVIEW_FACTS],
      economyFacts: [...UW_PICK_ORDER_GUIDE_ECONOMY_FACTS],
      damageFacts: [...UW_PICK_ORDER_GUIDE_DAMAGE_FACTS],
      controlFacts: [...UW_PICK_ORDER_GUIDE_CONTROL_FACTS],
      lateFacts: [...UW_PICK_ORDER_GUIDE_LATE_FACTS],
    },
  }
}
