export const WORKSHOP_TRACKER_OVERVIEW_FACTS = [
  'Workshop Tracker is the dedicated page at /trackers/workshop for managing workshop levels, workshop enhancement levels, planning upgrade targets, and opening the Workshop calculator from saved tracker context.',
  'The page is organized into Progress, All Workshop, and Calculator tabs, so it acts like one workshop workspace instead of a single static table.',
  'This page-layer knowledge is specifically about how the site tools behave for users, not the broader game-reference workshop encyclopedia that TrackerAI also carries.',
] as const

export const WORKSHOP_TRACKER_PROGRESS_FACTS = [
  'The Progress tab is split into Workshop and Enhancements sub-tabs so users can plan base workshop stats and enhancement stats without mixing those tables together.',
  'On the Workshop side, users can set attack, defense, and utility discount levels, enter an average coins-per-hour rate, filter by category, choose sorting, hide completed rows, reorder rows, and customize visible progress columns.',
  'Those workshop progress rows track coin and cash current levels, target levels, progress toward target or max, remaining costs, and time-to-target estimates based on the user’s own coins-per-hour pace.',
  'On the Enhancements side, the same tab becomes a separate progress table with attack, defense, utility, and vault discount controls plus enhancement-specific current, target, progress, remaining-cost, and time columns.',
  'Both progress views also support sticky name-column behavior, collapsible category group rows, direct row-level Open in Calculator actions, and explicit reset-all-progress actions guarded by confirmation prompts.',
  'Disabled stats stay visibly inactive in those planning tables, so the tracker can preserve saved levels while making it clear which stats are intentionally out of the active planning workflow.',
] as const

export const WORKSHOP_TRACKER_OVERVIEW_TAB_FACTS = [
  'The All Workshop tab works like a roster-and-preset editor for both Workshop and Enhancements. Users can switch presets, rename the active preset, choose whether they are editing Workshop or Enhancements, and change the layout density of the stat cards.',
  'Within each category panel, users can edit saved levels directly, set a stat to its max level, and disable or re-enable stats they do not want in the active planning views.',
  'The overview is organized with expandable category panels and compact stat blocks, so broad maintenance stays faster than editing one progress-row select at a time.',
  'That disable-or-enable control is not just cosmetic. It drives whether a stat feels active in the rest of the tracker workflow while still keeping the saved preset data available.',
  'That makes All Workshop the fastest place to maintain broad saved state before drilling into the Progress table or the calculator.',
] as const

export const WORKSHOP_TRACKER_SYNC_FACTS = [
  'Workshop tracker state is local-first and also supports the normal signed-in cloud sync flow used by other trackers.',
  'The page uses conflict-aware sync decisions, post-auth restore behavior, and optional auto-save to cloud when the relevant site setting is enabled.',
  'Because the tracker stores both workshop progress and workshop UI planning state, syncing it preserves more than just raw levels.',
] as const

export const WORKSHOP_CALCULATOR_OVERVIEW_FACTS = [
  'Workshop Calculator is available at /calculators/workshop and is also embedded inside the tracker page as the Calculator tab.',
  'Its main split is between Workshop and Enhancements, so users can plan base workshop upgrades and enhancement upgrades from the same calculator page without treating them as the same cost system.',
  'That makes it the focused math-and-breakdown surface while the tracker remains the broader saved-progress and preset-management surface.',
] as const

export const WORKSHOP_CALCULATOR_INPUT_FACTS = [
  'On the Workshop side, the calculator lets users choose section and stat, set section discount levels, and set current and target coin and cash levels for the selected stat.',
  'On the Enhancements side, the calculator switches to enhancement section and stat selection, attack-defense-utility discount levels, vault discount, and current and target enhancement levels.',
  'The page also keeps calculator-view state like the active tab, row pagination, and Workshop coin-versus-cash breakdown visibility in persistent calculator state so users can keep their reading context.',
  'Because Workshop costs can cross coin and cash phases, the calculator keeps separate selectors for coin and cash level ranges instead of flattening everything into one input pair.',
] as const

export const WORKSHOP_CALCULATOR_OUTPUT_FACTS = [
  'The calculator summarizes total costs and target values in top cards before showing a paginated level breakdown table.',
  'For Workshop stats, that breakdown can separate Coin rows from Cash rows and show base cost, discounted cost, cumulative cost, and target stat value across the selected range.',
  'For Enhancements, the breakdown focuses on enhancement upgrade rows, total discounted cost, and the target bonus or target stat value reached at the chosen level.',
  'Workshop mode also lets users independently show or hide Coin rows and Cash rows, which matters when a user wants to inspect only one currency path without losing the overall summary totals.',
] as const

export const WORKSHOP_TRACKER_CALCULATOR_LINK_FACTS = [
  'The Workshop tracker and calculator are linked on purpose rather than acting like isolated pages. The tracker includes an embedded calculator tab and can open a specific workshop stat or enhancement directly in calculator context.',
  'That means users can move from a progress row into calculator planning without rebuilding the same stat selection and mode by hand.',
  'Because the calculator also persists its own view state, switching between the standalone calculator and the tracker-embedded calculator keeps the workflow feeling continuous instead of disposable.',
] as const

export const WORKSHOP_TRACKER_AI_FACTS = [
  'TrackerAI can help explain the difference between Workshop and Enhancements, clarify what discount fields affect, interpret remaining-cost and time columns, and explain when to use the tracker versus the calculator.',
  'It is especially useful when a user knows the stat they care about but is not sure whether to edit it in All Workshop, review it in Progress, or inspect its full cost path in the calculator.',
  'Saved edits, sync actions, and destructive tracker resets should still stay inside the normal page controls and confirmations.',
] as const
