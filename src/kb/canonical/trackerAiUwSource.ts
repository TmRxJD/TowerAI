export const UW_TRACKER_OVERVIEW_FACTS = [
  'Ultimate Weapons Tracker is the dedicated page at /trackers/uw for tracking owned Ultimate Weapon progress, reviewing all weapon rows in one place, and keeping the Ultimate Weapon calculator aligned with saved progress.',
  'The page is organized into Progress, All Ultimate Weapons, Calculator, and Upload tabs. That makes it a management workspace rather than just a single cost table.',
  'It sits next to the general Ultimate Weapon reference knowledge in TrackerAI, but this page layer is specifically about how the site tools behave for users.',
] as const

export const UW_TRACKER_PROGRESS_FACTS = [
  'The Progress tab is a planning table for saved Ultimate Weapon levels and targets. It can sort rows, hide completed items, lock the name column, reorder rows, and let users choose which progress columns are visible.',
  'Those progress columns go beyond simple current and target levels. They include stones spent, remaining stones, progress toward target or max, tournaments needed, estimated time to target, and estimated finish dates.',
  'The tracker also lets users enter an average stones-per-tournament value so those tournament and finish-date estimates stay personal instead of pretending every account earns the same amount.',
  'That tab is also where hidden-versus-finished planning gets cleaned up, because the table keeps target-focused columns, sort order, and completed-row visibility in one place.',
] as const

export const UW_TRACKER_OVERVIEW_TAB_FACTS = [
  'The All Ultimate Weapons tab acts like a roster editor. Users can mark weapons unlocked or locked, review spent versus remaining stones for each weapon, and edit saved starting levels directly from the weapon cards.',
  'That tab also exposes an advanced toggle for extra stat rows after the base roster is unlocked, which keeps the broader weapon view manageable instead of throwing every control at the user immediately.',
  'In practice that means some deeper controls are intentionally gated until the basic roster is marked unlocked, so the overview does not present advanced rows as if every account should already have them.',
  'In practice, this is the fastest place to scan the whole Ultimate Weapon roster before drilling into detailed cost planning.',
] as const

export const UW_TRACKER_SYNC_FACTS = [
  'Ultimate Weapons tracker data is local-first and also supports signed-in cloud sync through the normal tracker sync flow.',
  'The page uses the same conflict-aware sync pattern as other trackers, including explicit load-versus-save decisions when local and cloud snapshots disagree.',
  'Because the tracker also carries calculator defaults and saved progress ranges, syncing the tracker preserves both planning state and progress state together.',
] as const

export const UW_TRACKER_UPLOAD_FACTS = [
  'The Upload tab currently exists as a placeholder, not as a real OCR workflow.',
  'The page is explicit about that boundary: Ultimate Weapon OCR is not available yet.',
  'That matters for TrackerAI answers because users should not be told to expect screenshot import behavior that the page does not currently provide.',
] as const

export const UW_CALCULATOR_OVERVIEW_FACTS = [
  'Ultimate Weapon Calculator is available at /calculators/uw and is also embedded inside the tracker page as the Calculator tab.',
  'Its job is to answer stone-planning questions for one weapon at a time by comparing starting levels, target levels, and the resulting costs across that weapon’s stats.',
  'That makes it the focused planning surface while the tracker remains the broader roster-management surface.',
] as const

export const UW_CALCULATOR_INPUT_FACTS = [
  'The calculator is weapon-driven. Users switch between weapons with tabs, then set starting levels and target levels for each stat on that weapon.',
  'The page supports filtering down to selected stats, hiding already completed rows, and optionally showing cumulative totals so the same weapon can be read as either a quick summary or a full level-by-level path.',
  'The calculator also remembers key viewing state like the selected weapon, stat filter, completed-row visibility, cumulative toggle, and expanded level panels so users can keep their place while moving around the page.',
  'When the calculator is embedded inside the tracker, it also offers Save to Progress so the current plan can become tracked progress.',
] as const

export const UW_CALCULATOR_OUTPUT_FACTS = [
  'The calculator table shows level rows with stat values, per-level stone costs, and optional cumulative totals.',
  'It also summarizes stones spent, remaining stones, and total stones in header chips, so users can answer both “what is left” and “what does the full path cost” without leaving the page.',
  'For multi-stat weapons, the calculator keeps the per-stat pairs together so users can compare how each stat contributes to the total rather than reading a single flattened number.',
] as const

export const UW_TRACKER_CALCULATOR_LINK_FACTS = [
  'The Ultimate Weapons tracker and calculator share saved progress and calculator state so users do not have to rebuild the same weapon context each time they switch views.',
  'The tracker can open a weapon directly in the calculator, and the embedded calculator can save the current plan back into tracker progress.',
  'That shared flow is why a calculator session can feel like it already knows the weapon and filters the tracker was using instead of starting from a blank page every time.',
  'That shared workflow is the key difference between “looking up stone costs” and actually maintaining a long-term Ultimate Weapon plan on the site.',
] as const

export const UW_TRACKER_AI_FACTS = [
  'TrackerAI can help explain the difference between the Ultimate Weapons tracker and calculator, clarify stone-planning columns, and explain why a saved tracker target and a calculator total are related.',
  'It is especially useful when a user knows the weapon they care about but is not sure whether to update it in the roster view, inspect it in the progress table, or calculate it in the dedicated calculator.',
  'Saved edits and sync decisions should still stay inside the page controls rather than being treated like silent conversational changes.',
] as const
