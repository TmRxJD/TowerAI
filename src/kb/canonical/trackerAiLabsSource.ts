export const LAB_TRACKER_OVERVIEW_FACTS = [
  'Lab Tracker is a dedicated page at /trackers/labs where users track lab progress, manage active lab slots, review all known labs, calculate upgrade costs, and import lab progress from screenshots.',
  'The page is organized as one lab workspace with several tabs instead of scattering lab tasks across unrelated pages. Users move between Progress, Active, All Labs, Calculator, and Upload based on what they are trying to do.',
  'That structure matters because the tracker is not only a list of current lab levels. It is also a planning surface that shares state with the lab calculator.',
] as const

export const LAB_TRACKER_OVERVIEW_TAB_FACTS = [
  'The All Labs tab works like a browse-and-maintain view. Users can search labs, group them by type, hide completed labs, favorite important labs, and edit current levels directly on each card.',
  'Favorites are surfaced separately so users can keep a shorter personal list near the top instead of scrolling through the full lab catalog every time.',
  'This makes the overview tab the fastest place to clean up broad lab state before switching into deeper planning.',
] as const

export const LAB_TRACKER_ACTIVE_FACTS = [
  'The Active tab is for the up-to-five labs that are currently running. Each slot can pick a lab, choose a speedup, pause or start ticking, and track remaining time with a slider.',
  'The page can show time in two modes, choose a next-level target for each slot, and automatically advance progress, so the Active tab behaves like a live progress desk instead of a static checklist.',
  'Users can also jump from an active slot into the calculator when they want to understand the cost and duration behind the lab they are currently running.',
] as const

export const LAB_TRACKER_PROGRESS_FACTS = [
  'The Progress tab is the planning table for saved lab goals. It supports search, hide-completed behavior, configurable columns, and gem-oriented progress fields like gems spent, gems to next, remaining target gems, remaining max gems, and gems to max.',
  'The tracker also applies an automatic gem discount multiplier based on how many labs are already completed, so the gem-facing numbers reflect the tracker’s current completion state rather than staying totally raw.',
  'For users, this is the tab that turns scattered lab levels into a practical upgrade queue.',
] as const

export const LAB_TRACKER_UPLOAD_FACTS = [
  'The Upload tab lets users import lab progress from screenshots instead of typing every lab by hand.',
  'That OCR flow is review-first. The page shows detected lab rows with editable type, name, and next-level selections, plus simple feedback like how many labs were detected and how many are ready to save.',
  'This keeps screenshot import useful without pretending that OCR should be trusted blindly on its own.',
] as const

export const LAB_TRACKER_SYNC_FACTS = [
  'Lab tracker state is local-first and also supports signed-in sync through the normal site sync flow.',
  'The page uses conflict-aware sync prompts and can auto-save when the relevant site setting is enabled, so users can keep their lab setup consistent across sessions without losing the local-first feel.',
  'Because the tracker also feeds lab calculator defaults, keeping the tracker in sync affects more than one page surface.',
] as const

export const LAB_CALCULATOR_OVERVIEW_FACTS = [
  'Lab Calculator is available as a standalone page at /calculators/labs and also as the Calculator tab inside the lab tracker.',
  'Its job is to answer planning questions for one selected lab at a time: current level, target level, total time, gem cost, coin cost, and per-level versus cumulative growth.',
  'That makes it the focused planning side of the lab feature area while the tracker remains the broader management side.',
] as const

export const LAB_CALCULATOR_INPUT_FACTS = [
  'The calculator lets users choose lab speed level, relic discount, coin discount level, gem discount multiplier, lab type, lab name, current level, target level, and speedup.',
  'When the calculator is used on the tracker page, it can also mark the chosen lab as active, favorite it, mark it completed, hide completed labs, and save the chosen range back into tracker progress.',
  'This means the embedded calculator is not just read-only math. It is part of the same lab workflow.',
] as const

export const LAB_CALCULATOR_OUTPUT_FACTS = [
  'The calculator summarizes totals in a compact header and then shows two tables: one table for per-level costs and values, and another for cumulative totals through each level.',
  'Those tables cover time, gems, coins, and the lab value at each level, which makes the page useful for both quick totals and more granular level-by-level planning.',
  'If no lab is selected, the calculator stays explicit about that instead of pretending it has meaningful data to show.',
] as const

export const LAB_CALCULATOR_VIEW_FACTS = [
  'The calculator is not locked to one presentation style. Users can narrow the table to selected stats, hide already completed rows, and switch between per-level and cumulative reading depending on how much detail they need.',
  'That matters because the same lab question can be either a quick “how much to finish this” question or a slower “what happens level by level” question.',
  'The page keeps those views in the same calculator instead of forcing users into separate tools for summary versus detail.',
] as const

export const LAB_TRACKER_CALCULATOR_LINK_FACTS = [
  'The lab tracker and lab calculator share selection state and calculator defaults so users do not have to rebuild the same context every time they switch surfaces.',
  'Current lab selections, calculator modifiers, and saved progress ranges can flow between the tracker and the calculator, and the tracker can open the calculator directly from active slots or progress rows.',
  'When the calculator is embedded inside the tracker, the Save to Progress action turns a one-lab plan into tracked progress without forcing the user to re-enter the same target elsewhere.',
  'That shared-state design is one of the most important user-facing ideas in the lab system: tracking and planning are connected on purpose.',
] as const

export const LAB_TRACKER_AI_FACTS = [
  'TrackerAI can help explain the difference between lab tabs, clarify speedup and discount inputs, interpret gem totals, and explain why the calculator and tracker are showing related data.',
  'It is especially useful when a user knows which lab they care about but is not sure whether to update it in All Labs, run it in Active, plan it in Progress, import it from Upload, or inspect it in the Calculator.',
  'Edits, sync actions, and saved progress changes should still stay inside the normal page controls and confirmations.',
] as const
