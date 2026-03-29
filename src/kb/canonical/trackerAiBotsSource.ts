export const BOTS_TRACKER_OVERVIEW_FACTS = [
  'Bots Tracker is the dedicated page at /trackers/bots for tracking saved bot levels, planning target levels, reviewing medal costs, and opening the Bot calculator from tracker context.',
  'The page is organized into Progress, All Bots, and Calculator tabs, so it acts like a saved planning workspace instead of a single calculator table.',
  'This page-layer knowledge is specifically about how the site bot tools behave for users, not the broader game explanation of what each bot does.',
] as const

export const BOTS_TRACKER_PROGRESS_FACTS = [
  'The Progress tab is a bot-by-bot planning table built around medal costs and target progress. Users can enter an average medals-per-two-weeks pace, sort rows, flip sort direction, hide completed bots, reorder rows, and lock the bot-name column.',
  'That table also supports customizable visible columns, collapsible bot rows, row-level current and target selectors for each bot stat, and direct Open in Calculator actions from active rows.',
  'Its progress columns go beyond simple current and target levels. They include medals spent, medals remaining to target or max, total medal cost, events needed, time-to-target, and estimated finish dates.',
  'Because the medals-per-two-weeks field is capped and converted into event-based timing, those time and finish-date columns stay tied to the user\'s own pacing instead of pretending every account earns the same medals.',
] as const

export const BOTS_TRACKER_OVERVIEW_TAB_FACTS = [
  'The All Bots tab works like a preset-based roster editor. Users can switch between three presets, rename the active preset, and review each bot as its own card with per-stat current level selectors.',
  'Each bot card can also be disabled or re-enabled, which changes whether that bot stays active in the planning workflow while preserving its saved levels inside the preset.',
  'That makes All Bots the faster place to maintain broad saved state before drilling into medal projections on the Progress table.',
] as const

export const BOTS_TRACKER_SYNC_FACTS = [
  'Bots tracker data is local-first and also supports signed-in cloud sync through the normal tracker sync flow used by other trackers.',
  'The page uses conflict-aware load-versus-save decisions, post-auth restore behavior, and optional auto-save when the relevant site setting is enabled.',
  'Because the tracker stores more than raw levels, syncing it preserves bot targets, column choices, row ordering, collapsed and disabled bot state, average medal pacing, and preset names together.',
] as const

export const BOTS_CALCULATOR_OVERVIEW_FACTS = [
  'Bot Calculator is available at /calculators/bots and is also embedded inside the tracker page as the Calculator tab.',
  'It is organized by bot tabs rather than one mixed list, so users plan one bot at a time while still keeping all bot calculators on the same page.',
  'That makes it the focused medal-planning surface while the tracker remains the broader saved-progress and preset-management surface.',
] as const

export const BOTS_CALCULATOR_INPUT_FACTS = [
  'Each bot calculator has separate Lab Levels, Starting Levels, and Target Levels panels, so users can adjust derived bot behavior before reading medal costs.',
  'Lab Levels are part of the calculator workflow because bot stat rows are normalized from those lab settings rather than being treated as fixed static values.',
  'The calculator also supports stat filtering, a Hide Completed toggle, and an optional Show Cumulative toggle so the same bot can be read as a quick summary or a more complete medal path.',
  'Its persistent calculator state keeps the selected bot tab, expanded panels, lab levels, starting levels, target levels, and stat filters, so users can leave and return without losing context.',
] as const

export const BOTS_CALCULATOR_VIEW_FACTS = [
  'The bot calculator changes presentation based on how many stats are selected. With one filtered stat, the table becomes a focused level-by-level path with cost and cumulative columns for that stat only.',
  'With multiple stats active, the page keeps each stat in paired columns so users can compare cost and value across several bot stats in the same table instead of flattening everything into one number.',
  'That makes the calculator useful for both narrow one-stat medal questions and broader whole-bot planning without switching to a different tool.',
] as const

export const BOTS_CALCULATOR_OUTPUT_FACTS = [
  'The calculator summarizes medals spent, remaining medals, and total medals in header chips before the detailed table.',
  'When a single stat is filtered, the table becomes a focused level-by-level path with cost and cumulative columns for that stat alone.',
  'When multiple stats stay active, the table keeps each stat\'s value and cost columns paired together, with optional per-stat cumulative columns and total rows so users can compare how each stat contributes to the overall medal path.',
] as const

export const BOTS_TRACKER_CALCULATOR_LINK_FACTS = [
  'The Bots tracker and calculator are linked on purpose instead of acting like isolated tools. The tracker can open a bot directly in calculator context and seed that calculator with the current saved start and target levels for that bot.',
  'That means users can move from medal projections on the tracker into detailed per-level calculator planning without rebuilding the same bot context by hand.',
  'Because the calculator also persists its own view state, switching between the standalone calculator and the tracker-embedded calculator keeps the workflow feeling continuous instead of disposable.',
] as const

export const BOTS_TRACKER_AI_FACTS = [
  'TrackerAI can help explain the difference between the Bots tracker and calculator, clarify medal, event, and finish-date columns, and explain how lab levels affect the calculator\'s bot stat rows.',
  'It is especially useful when a user knows which bot they care about but is not sure whether to update saved levels in the tracker, change presets in All Bots, or inspect a detailed medal path in the calculator.',
  'Saved edits, destructive resets, and sync decisions should still stay inside the normal page controls and confirmations instead of being treated like silent conversational changes.',
] as const
