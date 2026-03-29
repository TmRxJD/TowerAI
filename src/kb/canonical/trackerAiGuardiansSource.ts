export const GUARDIANS_TRACKER_OVERVIEW_FACTS = [
  'Guardians Tracker is the dedicated page at /trackers/guardians for saving guardian progress, reviewing guardian presets, and opening the guardians calculator from tracker context.',
  'The page is organized into Progress, All Guardians, and Calculator tabs, so it behaves like one guardian workspace instead of a single upgrade table.',
  'This page-layer knowledge is specifically about how the site guardians tracker and calculator behave for users, not the broader guardian encyclopedia or raw guardian stat definitions outside the tool workflow.',
] as const

export const GUARDIANS_TRACKER_PROGRESS_FACTS = [
  'The Progress tab is a planning table for whole guardians and their individual stat lines. It starts with average bits per week, sort controls, hide-completed, row reordering, customizable columns, and a lockable guardian column.',
  'Each guardian row can collapse or expand to reveal the underlying stat rows, and those stat rows let users set current and target levels directly inside the tracker instead of forcing every edit through a separate form.',
  'Progress outputs are built for planning rather than simple note taking. The tracker can show current totals, target totals, max totals, progress to target or max, bits spent, remaining bits, weeks to target or max, and estimated finish dates.',
  'The progress view also includes destructive reset-all behavior with confirmation and an Open in Calculator action that hands the current guardian context into the calculator tab.',
  'That table can also sort by custom row order or calculated planning metrics such as remaining bits, finish date, weeks to target or max, total bits, and progress percent, so it behaves like a planning board instead of one fixed guardian list.',
  'Disabled guardians are treated as intentionally inactive for that preset, so they collapse out of the main progress workflow and their calculator shortcut is blocked until the guardian is re-enabled.',
] as const

export const GUARDIANS_TRACKER_OVERVIEW_TAB_FACTS = [
  'The All Guardians tab is a preset-based overview rather than a read-only glossary. Users switch among three presets, rename the active preset, enable or disable guardians per preset, and edit current levels from guardian stat cards.',
  'Each guardian card shows the current tracked stat value, the current level selector, and the max level reference for that stat, so the overview tab behaves like a broader guardian-control board instead of a passive description list.',
  'Because preset state includes disabled guardians, levels, targets, and collapsed rows, the overview tab is where a user can shape which guardians are active for one saved setup before returning to the progress table or calculator.',
] as const

export const GUARDIANS_TRACKER_SYNC_FACTS = [
  'Guardians tracker data is local-first and also supports signed-in cloud sync through the same conflict-aware tracker sync flow used by other trackers.',
  'The page restores local state on load, can prompt for load-versus-save decisions when local and remote data differ, supports post-auth restore, and can auto-save to cloud when the relevant site setting is enabled.',
  'Because the tracker stores levels, targets, active tab, column choices, disabled guardians, collapsed state, row order, sort state, average bits pace, and preset names together, syncing preserves the broader workspace rather than only raw guardian levels.',
] as const

export const GUARDIANS_CALCULATOR_OVERVIEW_FACTS = [
  'Guardians Calculator is available at /calculators/guardians and is also embedded inside the tracker page as the Calculator tab.',
  'It is a two-mode workspace rather than one flat table. The main modes are Chips and Effective Paths, and each mode then breaks into per-guardian tabs such as Attack, Ally, Bounty, Fetch, Scout, or Summon.',
  'That makes it the focused guardian math surface while the tracker remains the broader saved-progress and preset-management surface.',
] as const

export const GUARDIANS_CALCULATOR_CHIPS_FACTS = [
  'The Chips mode lets users pick a guardian, open Starting Levels and Target Levels panels, and set per-stat levels with selectors that show both the stat value and bit cost for each level.',
  'It summarizes bits spent, remaining bits, and total bits at the top, then shows a level table that can switch between single-stat and multi-stat views with stat filtering, cumulative displays, and hide-completed behavior.',
  'Because stat filters, cumulative toggles, and the open state of the starting and target panels are persisted, Chips mode can reopen in the same inspection state a user was using in the previous planning session.',
  'That makes Chips the direct guardian-upgrade planning view for bit costs and stat ladders rather than a generic tracker summary.',
] as const

export const GUARDIANS_CALCULATOR_PATH_FACTS = [
  'The Effective Paths mode reuses the same guardian, starting levels, and target levels but changes the output into a step-by-step upgrade route.',
  'Instead of only showing the raw level tables, it summarizes total steps and total bit cost, then lists each recommended step with the stat upgraded, from and to levels, stat increase, ROI, total bonus, and cumulative cost.',
  'That makes Effective Paths the better mode when a user wants an ordered guardian-upgrade path instead of just seeing the bit ladder for each stat.',
] as const

export const GUARDIANS_CALCULATOR_STATE_FACTS = [
  'The guardians calculator persists its own main tab, active guardian tab, stat filters, cumulative toggle, hide-completed toggle, and panel-open state instead of resetting everything on every visit.',
  'It also pulls in tracker progress as the default starting state. When saved tracker levels change, the calculator can hydrate its starting levels from those guardian rows and make sure target levels never fall below the current saved start.',
  'That means tracker-side edits can quietly reshape the calculator defaults, while calculator-side tab or filter choices stay saved as calculator workspace preferences rather than tracker progress fields.',
  'That shared-state behavior is why the tracker and calculator feel connected: the calculator is not a blank scratchpad unless the saved guardian context is blank.',
] as const

export const GUARDIANS_TRACKER_CALCULATOR_LINK_FACTS = [
  'The guardians tracker and guardians calculator are linked on purpose instead of acting like isolated pages. The tracker embeds the same calculator found on /calculators/guardians inside its Calculator tab.',
  'The progress table also includes an Open in Calculator action that copies the selected guardian\'s saved levels and targets into calculator state, selects that guardian tab, and switches the tracker to its embedded calculator view.',
  'Because calculator persistence also hydrates from tracker progress when appropriate, moving between the standalone calculator page and the tracker-embedded calculator keeps the workflow continuous.',
] as const

export const GUARDIANS_TRACKER_AI_FACTS = [
  'TrackerAI can help explain the difference between the guardians Progress, All Guardians, and Calculator tabs, clarify which columns depend on the saved bits-per-week pace, and explain when Chips versus Effective Paths is the better calculator mode.',
  'It is especially useful when a user knows the guardian they care about but is not sure whether the task belongs in preset activation, saved progress planning, or effective-path analysis.',
  'Saved resets, disable toggles, preset renames, and sync decisions should still happen through the normal page controls and confirmations instead of being treated like silent conversational changes.',
] as const
