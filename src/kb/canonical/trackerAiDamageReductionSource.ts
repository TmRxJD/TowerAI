export const DAMAGE_REDUCTION_CALCULATOR_OVERVIEW_FACTS = [
  'Damage Reduction Calculator is the dedicated page at /calculators/damage-reduction for modeling how stacked defensive effects change incoming enemy damage and, when Chain Thunder is enabled, how much enemy HP is shaved before the damage reduction step finishes.',
  'The page behaves like a saved calculator workspace instead of a single static formula. It combines top-level wave inputs, optional reduction toggles, perk assumptions, summary cards, and a drill-down enemy breakdown table in one route.',
  'This page-layer knowledge is specifically about how the site damage reduction calculator behaves for users, not a full encyclopedia of every combat reduction mechanic outside the tool workflow.',
] as const

export const DAMAGE_REDUCTION_CALCULATOR_INPUT_FACTS = [
  'The primary inputs at the top of the page are Wave Health, Wave Damage, and Max Tower Health, each entered as notation-friendly text such as B, T, q, or higher suffixes rather than requiring raw whole numbers.',
  'Below those fields the page exposes enable switches for Defense percent, Defense Absolute, Chrono Field, Flamebot, NMP orb reduction, Primordial Collapse, and Chain Thunder, with each enabled mechanic revealing its own percent selector, flat-value field, or hit-count selector.',
  'Those inputs are modeled as guarded calculator state rather than free-form notes. The stored state clamps defense, Chrono Field, Flamebot, NMP, PC, CT, CL+, and hit-count values into supported page ranges so revisiting the calculator restores a valid setup.',
] as const

export const DAMAGE_REDUCTION_CALCULATOR_CT_FACTS = [
  'Chain Thunder is its own conditional branch inside the page. Turning it on reveals CT level, CL+ level, average CL+ hits, and the Assume Max CL Damage toggle instead of treating CT as just another flat percent field.',
  'Assume Max CL Damage changes that branch from HP-loss-based scaling into a forced max-reduction assumption, so CT can model either a calculated reduction path or a best-case ceiling without changing the rest of the page inputs.',
  'When CT is enabled, the calculator adds a second summary row for Starting HP, HP After CL+, and Total HP Reduction so users can read the HP-side effect separately from the main incoming-damage summary cards.',
  'The results table also reacts to that branch. HP After Reduction, Total HP Reduction percent, and Total DMG Reduction percent columns are automatically hidden from the displayed column set when CT is off, then become available again when CT is enabled.',
] as const

export const DAMAGE_REDUCTION_CALCULATOR_PERKS_FACTS = [
  'An Active Perks expansion panel sits below the reduction controls and above the Reset action. It lets users toggle enemy-damage and enemy-HP modifiers such as Enemies Damage -50%, Enemies Damage x2.5, Ranged Damage x3, Enemy HP -55%, Boss HP x8, and Boss HP -70%.',
  'Those perk toggles are not just annotations. The calculator folds them into the adjusted enemy HP and damage values before the reduction sequence is replayed across each enemy type.',
  'Because the perk panel is separated into its own expansion section, users can keep it collapsed for routine reduction testing or expand it when they need to model a perk-heavy run state.',
] as const

export const DAMAGE_REDUCTION_CALCULATOR_RESULTS_FACTS = [
  'The first outputs are summary cards for Starting Damage, Final Damage, and Total Reduction, giving the user a quick top-line read of the current modeled reduction stack.',
  'Below that, the main analysis surface is the Reduction Breakdown by Enemy Type expansion panel, which renders a table across multiple enemy classes rather than only one enemy example.',
  'Each enemy row can show base HP, base damage, adjusted HP, adjusted damage, HP after reduction, damage after reduction, total HP reduction percent, total damage reduction percent, and max hits depending on which columns are currently selected.',
] as const

export const DAMAGE_REDUCTION_CALCULATOR_BREAKDOWN_FACTS = [
  'Reduction Breakdown by Enemy Type includes a Customize Columns menu where users can toggle columns on or off, reset them to defaults, and optionally enable drag-based column reordering.',
  'Every enemy row is collapsible and starts collapsed when the list is refreshed. Expanding a row opens a nested step table that replays the applied reduction sequence for that specific enemy, including the per-step reduction percent, running total reduction percent, damage reduced by that step, and damage remaining after the step.',
  'Because the page keeps enemy rows collapsed by default and turns the lower table into an on-demand drill-down, it works as both a compact overview and a detailed audit surface for reduction order.',
] as const

export const DAMAGE_REDUCTION_CALCULATOR_PERSISTENCE_FACTS = [
  'Damage Reduction calculator state is local-first and persisted in Dexie-backed settings storage through its own damage-redux-calcs record. The route waits for the persisted store to hydrate before showing the calculator shell, which avoids a default-value flash.',
  'That saved state includes the top-level wave inputs, all reduction toggles and values, the perk toggles, CT settings, selected columns, column order, whether drag reorder is enabled, which expansion panels are open, and whether the perks panel is expanded.',
  'The page Reset action clears the current notation inputs, disables the optional reduction toggles, resets supported selector values back to their guarded minima, and re-enables the perk toggles, but it is still a calculator-state reset for this route rather than deletion of tracker progress elsewhere on the site.',
] as const

export const DAMAGE_REDUCTION_CALCULATOR_AI_FACTS = [
  'TrackerAI can help explain which reductions are currently active, why the CT branch changes both HP and damage surfaces, and how to interpret the summary cards versus the per-enemy breakdown rows.',
  'It is especially useful when a user knows the final number looks wrong but is not sure whether the culprit is perks, the reduction order, the CT assumptions, or a hidden column-selection choice in the enemy table.',
  'State changes and resets should still be described through the page controls and guardrails instead of being presented as silent conversational rewrites of the stored reduction workspace.',
] as const
