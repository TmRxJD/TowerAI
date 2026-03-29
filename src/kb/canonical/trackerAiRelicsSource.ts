export const RELICS_TRACKER_OVERVIEW_FACTS = [
  'Relics and Themes Tracker is the dedicated page at /trackers/relics for managing collected relics, collected themes and skins, and the combined permanent-bonus overview that those collections create.',
  'The page is organized into Progress, Relics, and Themes and Skins tabs, so it behaves like one combined collection tracker instead of a single relic checklist.',
  'This page-layer knowledge is specifically about how the site relics tracker behaves for users, not the broader encyclopedia of relic stats, event reward rules, or theme data outside the tracker workflow.',
] as const

export const RELICS_TRACKER_PROGRESS_FACTS = [
  'The Progress tab is split into Relics Progress and Themes Progress panels rather than one blended table. Each section shows tracked collection progress with bulk actions for removing selected collected entries or toggling individual collected state.',
  'The relic progress section reports percent complete and collected versus total counts, while the themes progress section separately reports owned themes against total theme availability.',
  'That separation matters because relic-only progress percent and theme ownership totals are intentionally tracked as different collection measures even though the page combines them into one workspace.',
] as const

export const RELICS_TRACKER_TOTALS_FACTS = [
  'A shared Total Bonuses panel sits directly below the top tabs and changes what it shows based on the active page tab.',
  'On the Relics tab it shows aggregate bonus totals across all relic templates, on the Progress tab it shows totals only from the currently collected relics plus the active theme category breakdown, and on the Themes tab it pivots to theme totals and category summaries.',
  'That makes the totals panel a live interpretation surface for the current tracker context rather than a fixed static summary block.',
] as const

export const RELICS_TRACKER_RELICS_TAB_FACTS = [
  'The Relics tab is the browse-and-collect surface for relic templates. It supports search, sorting, ascending or descending order, per-row layout density, hide-collected filtering, and display toggles for value, rarity and type, description, and requirements.',
  'Users can bulk-select visible relics, use the Select all then Add selected flow, or toggle collected state directly from the relic cards or list rows.',
  'Because templates are grouped and the layout can switch between list and multi-column card views, the tab works as both a collection browser and a batch update surface.',
] as const

export const RELICS_TRACKER_THEMES_FACTS = [
  'The Themes and Skins tab mirrors the relic browsing workflow for theme items. It supports search, sorting, per-row layout density, hide-collected filtering, bulk selection, and direct collected toggles for theme names.',
  'That tab also exposes theme total count, percent, and multiplier summaries above the list, so users can review category-wide theme bonus value while deciding what to mark collected.',
  'In practice, Themes and Skins is not just a cosmetic catalog. It is the part of the tracker that decides which theme bonuses count toward the shared collection and bonus summaries.',
] as const

export const RELICS_TRACKER_BATCH_FACTS = [
  'Bulk collection on this page is intentionally a two-step workflow instead of one immediate mass-toggle. If nothing is selected yet, the Add selected button first becomes a Select all helper that stages all currently visible uncollected relics or themes so the user can still deselect items before committing the add.',
  'Only after that staged selection exists does Add selected actually mark those relics or themes as collected, which keeps bulk add behavior aligned with the site-wide confirmation philosophy around tracker additions.',
  'That means search, hide-collected filters, and the active tab all affect what the staged bulk-add set contains before the final collection write happens.',
] as const

export const RELICS_TRACKER_SYNC_FACTS = [
  'Relics tracker data is local-first and also supports signed-in cloud sync through the same conflict-aware tracker sync flow used by other trackers.',
  'The page restores local state on load, can prompt for load-versus-save decisions when local and remote relic and theme collections differ, supports post-auth restore, and can auto-save to cloud when the relevant site setting is enabled.',
  'Because the sync contract tracks collected relic IDs, collected theme names, and saved UI options together, syncing preserves both collection progress and the current tracker browsing preferences.',
] as const

export const RELICS_TRACKER_MERGE_FACTS = [
  'Automatic cloud restore is not a blind overwrite by default. When auto-load is allowed, the tracker can merge remote and local collection state by taking the union of collected relic IDs and collected theme names during restore.',
  'That behavior protects local progress that has not been pushed yet while still pulling down remote collection state from the signed-in account.',
  'Manual sync decisions remain explicit through the load-versus-save dialog, but auto-load restore is designed to be additive when both sides already contain progress.',
] as const

export const RELICS_TRACKER_UI_FACTS = [
  'The relics tracker remembers per-tab UI state instead of treating every tab switch as a reset. Sort keys, sort direction, list density, visible metadata toggles, hide-collected state, and expansion-panel state are saved by tab.',
  'That means the Progress tab can reopen with its progress panels and totals state, while the Relics and Themes tabs can each remember their own sort and display preferences independently.',
  'This makes the page feel like a maintained collection workspace rather than a disposable search screen.',
] as const

export const RELICS_TRACKER_AI_FACTS = [
  'TrackerAI can help explain the difference between the Progress, Relics, and Themes and Skins tabs, clarify why the Total Bonuses panel changes by tab, and explain how collected relics and collected themes affect the tracker summaries.',
  'It is especially useful when a user knows they want to update collection state or interpret total bonuses but is not sure whether the task belongs in the progress tables or in one of the browsing tabs.',
  'Saved collection edits, removals, and sync decisions should still happen through the normal page controls and confirmations instead of being treated like silent conversational changes.',
] as const
