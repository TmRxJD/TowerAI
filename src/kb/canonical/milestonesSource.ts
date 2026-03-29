import {
  MILESTONE_KEY_UNLOCK_ROWS,
  MILESTONE_TIER_TRACKS,
  MILESTONE_TIER_UNLOCK_ROWS,
  MILESTONE_TIERS,
  MILESTONE_TOTAL_ROWS,
  type MilestoneRewardRow,
  type MilestoneTierTrackData,
  type MilestoneTrackTotalRow,
} from '@tmrxjd/platform/tools'

export interface MilestonesSourceDocument {
  overviewParagraphs: string[]
  tierTracks: readonly MilestoneTierTrackData[]
  keyUnlockRows: readonly MilestoneRewardRow[]
  tierUnlockRows: readonly MilestoneRewardRow[]
  totalRows: readonly MilestoneTrackTotalRow[]
}

const TIER_PROGRESSION_SUMMARY = 'Tier progression unlocks the next tier at wave 100 through Tier 14, then shifts to wave 300 from Tier 15 onward.'

export function loadMilestonesSourceDocument(): MilestonesSourceDocument {
  return {
    overviewParagraphs: [
      `Milestones span Tier ${Math.min(...MILESTONE_TIERS)} through Tier ${Math.max(...MILESTONE_TIERS)} with a separate standard and premium reward track at each wave threshold.`,
      'Standard track milestone rewards carry most permanent system unlocks, while premium track milestones lean harder into extra resources, cosmetics, and end-of-tier relic payouts.',
      TIER_PROGRESSION_SUMMARY,
      'Milestone totals are tracked separately per tier and per track, so standard rewards and premium rewards should not be merged into one unlock list.',
    ],
    tierTracks: MILESTONE_TIER_TRACKS,
    keyUnlockRows: MILESTONE_KEY_UNLOCK_ROWS,
    tierUnlockRows: MILESTONE_TIER_UNLOCK_ROWS,
    totalRows: MILESTONE_TOTAL_ROWS,
  }
}
