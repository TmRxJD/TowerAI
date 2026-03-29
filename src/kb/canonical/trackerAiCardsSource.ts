export const CARDS_TRACKER_OVERVIEW_FACTS = [
  'Cards Tracker is the dedicated page at /trackers/cards for saving card progress, reviewing card effects, and managing equipped-card presets in one workspace.',
  'The page is organized into Progress, Equipped, and All Cards tabs, so it behaves like a saved tracker and reference surface instead of a one-purpose checklist.',
  'This page-layer knowledge is specifically about how the site cards tracker behaves for users, not the broader game explanation of card mechanics outside the tracker.',
] as const

export const CARDS_TRACKER_PROGRESS_FACTS = [
  'The Progress tab starts with an Add Card panel where users choose a card, level, mastery, copies owned, and completed state before adding the entry to the tracker.',
  'That planning table supports search, sorting, sort direction changes, estimated weekly gems, hide-completed, hide-descriptions, row reordering, customizable visible columns, and a lockable name column.',
  'Tracked rows can be edited inline for level, mastery, quantity, and completed state, while row actions also support a fuller edit dialog or entry removal and the page also exposes a Reset All action for wiping the tracked list after confirmation.',
  'Progress columns go beyond simple ownership. They can show copies remaining, progress percent, level and mastery values, gems spent, gems remaining, time to next, and time to max based on the saved weekly gem pace.',
  'The edit dialog is not just cosmetic. It rebuilds the level and mastery choices for the selected card and keeps level, copies owned, mastery availability, and completed state synchronized so the saved row stays internally consistent.',
] as const

export const CARDS_TRACKER_OVERVIEW_TAB_FACTS = [
  'The All Cards tab works like a browsable reference gallery for the tracker. It shows each card with its current tracked level, dynamic description, star display, and expandable level-effect and mastery-effect panels.',
  'Those descriptions are not static flavor text. The tracker replaces the placeholder values with the current saved level or mastery effect, and the card frame and star styling also change to reflect tracked progression and mastery unlock state.',
  'Because those effect panels highlight the current tracked level or mastery inside the lists, users can compare where they are now against the rest of the card progression without leaving the tracker page.',
  'That makes All Cards the better surface for browsing and reading card progression details after Progress has already captured the saved ownership state.',
] as const

export const CARDS_TRACKER_EQUIPPED_FACTS = [
  'The Equipped tab is a preset-based loadout planner rather than a passive checklist. Users can switch presets, rename the active preset, set available card slots, clear a preset, and toggle cards equipped directly from the card grid.',
  'The equipped view also supports different layout modes, placeholder slots for unused capacity, and a compact roster grid that marks already equipped cards with a visible check state.',
  'That means the tab can work either as a denser grid planner or as a scroll-oriented roster view while still preserving the same preset, slot-count, and equipped-card state underneath.',
  'That separation matters because equipped-card planning is different from ownership progress: one part answers what cards you own and how upgraded they are, while the other answers what cards are currently slotted into a saved setup.',
] as const

export const CARDS_TRACKER_SYNC_FACTS = [
  'Cards tracker data is local-first and also supports signed-in cloud sync through the same conflict-aware tracker sync flow used by other trackers.',
  'The page restores local state on load, can prompt for load-versus-save decisions when local and remote data differ, and supports optional auto-load and auto-save behavior through the relevant site settings.',
  'Because cards tracker data includes more than raw entries, syncing preserves tracked rows, equipped presets, active equipped preset choice, slot-count assumptions, layout mode, active tabs, weekly-gem assumptions, and related saved view choices together.',
] as const

export const CARDS_TRACKER_RULE_FACTS = [
  'The tracker enforces relationships between card level, copies owned, mastery, and completed state instead of treating them as four unrelated fields.',
  'Mastery is only enabled when a card reaches the max level threshold, and completed state can force the entry to the maxed quantity and level values to keep the saved row internally consistent.',
  'That means users can edit cards quickly without manually recalculating every dependent field each time they change copies or mark a card complete.',
] as const

export const CARDS_TRACKER_VISUAL_FACTS = [
  'Cards Tracker uses the saved row state to drive more than the progress table. Level and mastery values also feed the All Cards descriptions, highlighted effect rows, frame colors, and star-color styling.',
  'That makes the gallery and equipped views read like live status surfaces tied to tracked progress, not like detached card art panels with unrelated visuals.',
  'In practice, if a user changes a card level or unlocks mastery, the tracker can reflect that change across progress rows, gallery descriptions, and card-frame presentation in the same saved workspace.',
] as const

export const CARDS_TRACKER_AI_FACTS = [
  'TrackerAI can help explain the difference between Progress, Equipped, and All Cards, clarify weekly-gem timing columns, and explain why mastery or completed-state fields change together.',
  'It is especially useful when a user knows the card they care about but is not sure whether the task belongs in saved ownership progress, preset loadouts, or the browseable card reference view.',
  'Saved edits, resets, removals, and sync decisions should still happen through the normal page controls and confirmations instead of being treated like silent conversational changes.',
] as const
