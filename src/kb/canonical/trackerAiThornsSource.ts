export const THORNS_CALCULATOR_OVERVIEW_FACTS = [
  'Thorns Calculator is the dedicated page at /calculators/thorns for estimating how many thorn hits are needed to kill elites, fleets, and bosses under different thorns, plasma cannon, tier, and battle-condition setups.',
  'The page is a persisted calculator workspace with one main scenario, one optional comparison scenario, and two side-by-side output tables rather than a single formula result card.',
  'This page-layer knowledge is specifically about how the site thorns calculator behaves for users, not the broader encyclopedia of thorns mechanics or the raw combat formulas outside the tool workflow.',
] as const

export const THORNS_CALCULATOR_INPUT_FACTS = [
  'The main calculator inputs cover base thorns percent, tier or tournament tier selection, plasma cannon level, plasma cannon mastery level, BC lab levels, heat wave, wall thorns starting level, and the Sharp Fortitude toggle.',
  'Those inputs are clamped into valid ranges inside the persisted calculator state, so the page behaves like a guarded modeling tool rather than a free-form text worksheet.',
  'The tier selector can switch between normal tiers and tournament presets such as T11+, T14+, and T17+, which is why Heat can become tournament-specific instead of always behaving like a normal-tier field.',
] as const

export const THORNS_CALCULATOR_RULES_FACTS = [
  'The calculator enforces a dependency between Plasma Cannon and Plasma Cannon Mastery. If Plasma Cannon is not maxed, mastery cannot stay active, and selecting a mastery level can force Plasma Cannon to its max level.',
  'That means the page is not just displaying raw user inputs back. It normalizes related combat inputs to keep the model in a valid thorns-calculation state.',
  'The same guarded-state approach also applies to persisted values for tiers, lab levels, heat wave, and wall thorns ranges, including clamping wall thorns start level into the page\'s supported 1 through 20 range.',
] as const

export const THORNS_CALCULATOR_COMPARISON_FACTS = [
  'A separate Comparison Settings panel holds a second thorns scenario instead of overwriting the main one. It mirrors the main inputs for base thorns, tier, plasma cannon, BC reductions, heat wave, and Sharp Fortitude.',
  'The comparison panel includes its own Reset action that copies the main scenario into the comparison scenario, so users can branch from the current model and then change only a few fields.',
  'When the comparison scenario differs, the result cells can display both the main and comparison outcomes together instead of forcing users to switch back and forth between two pages.',
] as const

export const THORNS_CALCULATOR_RESULTS_FACTS = [
  'The output area is split into two tables: Thorns Hits to Kill for base-thorns scaling and Wall Thorns Hits to Kill for wall-thorns scaling. They render side by side on wider screens and stack on smaller layouts.',
  'Each table focuses on hit counts against elites, fleets, and bosses, with optional plasma-cannon-assisted columns appearing when the current main scenario has Plasma Cannon or Plasma Cannon Mastery active.',
  'The wall-thorns table is also filtered by the selected starting wall-thorns level, so it acts like a ranged lookup from the chosen floor instead of always showing the full 1 through 20 list.',
  'That makes the page a comparative lookup surface rather than a single one-line answer. Users can scan how kill-hit counts change across multiple thorns breakpoints and wall-thorns levels at once.',
] as const

export const THORNS_CALCULATOR_SUMMARY_FACTS = [
  'The main inputs and the comparison inputs each show a summary chip that condenses the current Plasma Cannon, mastery, BC reduction, tournament tier and heat, and Sharp Fortitude state.',
  'Those summary chips act as quick verification surfaces so users can confirm which modeled assumptions are active before reading the tables.',
  'This is especially useful once the comparison panel diverges from the main scenario, because it keeps both assumption sets readable without reopening every dropdown.',
] as const

export const THORNS_CALCULATOR_PERSISTENCE_FACTS = [
  'Thorns calculator state is local-first and persisted in Dexie-backed settings storage. The route waits for the persisted thorns store to hydrate before showing the main calculator shell.',
  'That saved state includes the main scenario, the comparison scenario, and the open state of the comparison expansion panel rather than only a few raw numeric inputs.',
  'Because both scenarios persist together, returning to the page can restore the exact comparison workflow a user was using instead of only restoring the primary thorns values.',
] as const

export const THORNS_CALCULATOR_AI_FACTS = [
  'TrackerAI can help explain which thorns inputs affect the main and comparison scenarios, clarify why some plasma-cannon columns appear or disappear, and explain how the dual-table layout should be read.',
  'It is especially useful when a user knows they want to compare two thorn setups but is not sure whether to change the main scenario, the comparison scenario, or the wall-thorns starting level.',
  'State edits and comparison resets should still happen through the page controls instead of being described as silent conversational rewrites of the stored thorns scenarios.',
] as const
