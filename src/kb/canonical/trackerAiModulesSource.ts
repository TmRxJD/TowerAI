export const MODULES_TRACKER_OVERVIEW_FACTS = [
  'Module Tracker is the dedicated page at /trackers/modules for tracking owned module copies, managing equipped loadout presets, reviewing the full module catalog, and opening the module calculator workspace from tracker context.',
  'The page is organized into Progress, Equipped, All Modules, and Calculators tabs, so it acts like one module workspace instead of a single list of owned copies.',
  'This page-layer knowledge is specifically about how the site module tools behave for users, not the broader module encyclopedia or the raw module stat datasets.',
] as const

export const MODULES_TRACKER_PROGRESS_FACTS = [
  'The Progress tab starts with an Add Module form where users choose module type, a specific module, rarity, and owned quantity before adding it to the tracker.',
  'After that, the page becomes a planning table with search, type and rarity filters, sort controls, weekly-gem estimates, hide-completed behavior, row reordering, customizable visible columns, and optional grouping by type or rarity.',
  'Progress rows are not just static ownership notes. They show tracked rarity and quantity, copies remaining, progress toward the relevant copy goal, percent-of-total and percent-by-type views, pull chance, and estimated time to next or time to max when that timing makes sense for the module.',
  'That same progress workflow also includes destructive row removal, reset-all behavior, and collapsible grouped sections, so the tracker is handling both long-term planning and inventory cleanup in one place.',
  'That makes the progress table a long-term copy-planning view rather than a simple inventory snapshot.',
] as const

export const MODULES_TRACKER_EQUIPPED_FACTS = [
  'The Equipped tab is a preset-based loadout editor with per-slot module selection, rarity, level, and substat management.',
  'Users can switch equipped presets, edit the preset name, reset the active preset slots, toggle description visibility, toggle substat visibility, and expand or collapse the edit controls for every equipped slot.',
  'That tab also includes assist-efficiency controls by module category, so equipped planning and assist assumptions stay in the same workflow instead of being split across separate screens.',
  'In practice, Equipped is where users manage active loadout presentation as well as data, because substat summaries, descriptions, and slot edit menus can all be shown or hidden without leaving the tab.',
] as const

export const MODULES_TRACKER_OVERVIEW_TAB_FACTS = [
  'The All Modules tab is the broad catalog view grouped by module type. It shows artwork, quantities, highest tracked rarity, and unique-effect descriptions for tracked modules.',
  'Category sections can collapse and expand, which makes it easier to browse large module families without losing the overall structure.',
  'That makes All Modules the fastest place to review the whole collection before drilling into progress math or equipped-slot editing.',
] as const

export const MODULES_TRACKER_SYNC_FACTS = [
  'Module tracker data is local-first and also supports signed-in cloud sync through the normal tracker sync flow used by other trackers.',
  'The page uses conflict-aware sync decisions, post-auth restore behavior, and optional auto-save when the relevant site setting is enabled.',
  'Because the tracker stores copy progress, equipped presets, UI preferences, and grouped view state together, syncing it preserves more than just owned quantities.',
] as const

export const MODULES_CALCULATOR_OVERVIEW_FACTS = [
  'Module Calculator is available at /calculators/modules and is also embedded inside the tracker page as the Calculators tab.',
  'It is a multi-tool workspace rather than a single calculator. The shared tabs are Module Cost, Assist Module Cost, Shard Splitter, and Effective Paths.',
  'That makes it the focused module math-and-optimization surface while the tracker remains the broader ownership, preset, and loadout-management surface.',
] as const

export const MODULES_CALCULATOR_COST_FACTS = [
  'The Module Cost tab lets users pick a module type, shard and coin discounts, assist efficiency, primary and assist rarities, and primary and assist current and target levels.',
  'It summarizes primary and assist shard and coin totals in top metrics, then shows separate customizable tables for primary costs and assist costs with level-by-level rows.',
  'The module type selection matters because those cost controls and rarity memories persist by type instead of pretending one cannon setup should overwrite a core or generator setup.',
  'Those tables are meant for upgrade-path planning, not just one final total, because users can compare level rows, cumulative costs, and bonus growth across the chosen range.',
] as const

export const MODULES_CALCULATOR_ASSIST_FACTS = [
  'The Assist Module Cost tab focuses on multiplier and substat stone planning instead of normal level-up costs.',
  'Users set current and target stone levels for multiplier and substat paths, then review separate customizable tables with level, stones, cumulative stones, and invested totals.',
  'That makes this tab a dedicated stone-investment planner rather than a duplicate of the main module-cost tab.',
] as const

export const MODULES_CALCULATOR_PATH_FACTS = [
  'The Shard Splitter and Effective Paths tabs are surfaced inside the module calculator workspace instead of living as unrelated tools.',
  'Those tabs reuse shared module inputs and sync key state with the module-cost side, so moving between direct cost planning and broader shard-path optimization keeps related module assumptions aligned.',
  'In practice, that means the module calculator page is also a gateway into shard and path optimization, not only level-cost lookups.',
] as const

export const MODULES_CALCULATOR_SYNC_FACTS = [
  'The module calculator workspace shares state across its subtools instead of treating every tab as disposable. Module-cost inputs can feed shard-splitter assumptions, and shard-path changes can flow back into module-cost context when those tabs are active.',
  'That cross-tab behavior is especially important for module type, rarity, assist efficiency, and selected levels, because users often move between cost tables and optimization tabs as part of one planning session.',
  'The result is a calculator workspace that behaves more like one connected module-planning system than four unrelated pages.',
] as const

export const MODULES_TRACKER_CALCULATOR_LINK_FACTS = [
  'The module tracker and module calculator workspace are linked on purpose instead of acting like isolated pages. The tracker embeds the same calculator tabs found on /calculators/modules inside its own Calculators tab.',
  'That means users can move from ownership and equipped-state management into module-cost, assist-cost, shard-splitting, and effective-path planning without leaving the broader module workflow.',
  'Because the calculator tabs also share persistent state across module-cost and shard-path views, switching between the standalone calculator page and the tracker-embedded calculator keeps the workflow continuous.',
] as const

export const MODULES_TRACKER_AI_FACTS = [
  'TrackerAI can help explain the difference between the Module tracker tabs, clarify copy-progress and time columns, and explain which module calculator tab is relevant for normal costs, assist stones, shard splitting, or effective-path questions.',
  'It is especially useful when a user knows they are working on modules but is not sure whether the task belongs in Progress, Equipped, All Modules, or one of the calculator subtools.',
  'Saved edits, destructive removals, slot resets, and sync decisions should still stay inside the normal page controls and confirmations.',
] as const
