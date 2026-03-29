export const UPTIME_CALCULATOR_OVERVIEW_FACTS = [
  'Uptime Calculator is the dedicated page at /calculators/uptime for modeling active time, cooldown compression, overlap windows, and practical sync behavior across Ultimate Weapons, bots, guardians, and related modifiers.',
  'The page is a single saved calculator workspace rather than a one-off formula input. It combines large grouped input panels, a customizable uptime-results table, and a separate uptime visualizer in one route.',
  'This page-layer knowledge is specifically about how the site uptime calculator behaves for users, not the broader encyclopedia of Ultimate Weapon stats or standalone sync theory outside the tool workflow.',
] as const

export const UPTIME_CALCULATOR_INPUT_FACTS = [
  'The main input card is organized into expansion panels for Golden Tower and Black Hole and Death Wave, Chrono Field and Poison Swamp and Smart Missiles and Inner Land Mines and Spotlight, Bots, Guardians, Labs, and Modifiers.',
  'Those panels let users model cooldown levels, duration levels, primary and assist substats, lab bonuses, module effects such as Multiverse Nexus and Galaxy Compressor, guardian cooldown and duration levels, and modifier toggles such as tournament, perks, assist efficiency, and UW battle condition settings.',
  'Because the calculator spans weapons, bots, guardians, and labs in one place, it acts as a combined uptime-planning workspace rather than a single-weapon calculator.',
] as const

export const UPTIME_CALCULATOR_RESET_FACTS = [
  'The page includes a Reset All Inputs action at the top of the calculator. That reset restores the current uptime workspace back to its default input state across modules, weapons, bots, guardians, labs, modifiers, and table preferences tied to the current session data.',
  'This is a calculator-state reset, not a destructive change to trackers elsewhere on the site, and it does not imply that external guardian or relic progress is being deleted.',
  'Because the calculator is persisted locally, the reset matters as a quick way to clear the saved modeling state before building a new uptime scenario.',
] as const

export const UPTIME_CALCULATOR_RESULTS_FACTS = [
  'The Uptime Results section is a table view for comparing computed duration, cooldown, wave-time, uptime, and permanence-style outputs across enabled rows such as GT, BH, DW, bots, and supported guardians.',
  'Users can customize which rows are enabled, drag-reorder them, toggle whether the Death Wave kill wave is included, and separately customize which result columns are visible and in what order they appear.',
  'Because the row menu stores both row visibility and the Death Wave kill-wave toggle together, the table doubles as the place where users decide whether the calculator should treat Death Wave as a shorter overlap-only window or as a fuller kill-wave-inclusive duration model.',
  'That makes the table the dense comparison surface for exact calculator output, while the visualizer below focuses on activation-overlap interpretation rather than row-by-row numeric scanning.',
] as const

export const UPTIME_CALCULATOR_COLUMNS_FACTS = [
  'The results table supports saved column selection and ordering instead of a fixed schema. Available fields include stone, primary, assist, substat, and lab contributions together with duration total, cooldown total, effective cooldown, wave time, uptime seconds, uptime percent, and perma-style status.',
  'Customize Columns lets the user toggle those fields on or off, reset them to defaults, and drag-reorder the displayed calculation columns.',
  'This is important because different uptime questions need different evidence: some users care about raw duration and cooldown components, while others only want effective uptime and permanence indicators.',
] as const

export const UPTIME_CALCULATOR_VISUALIZER_FACTS = [
  'The Uptime per Activation Visualizer is the chart-driven interpretation surface for the same uptime state. It can switch between landscape and portrait orientations and between segmented and linear views.',
  'The visualizer also has a built-in guide plus a Customize Chart menu that controls the reference comparator, activation-count mode, gap size and color, faded-opacity level, grid lines, enabled rows, chart order, and per-series colors.',
  'That chart is organized around a chosen reference comparator such as a bot or weapon cycle. The selected comparator is pinned as the comparison anchor for overlap analysis, and auto activation count can expand or shrink the displayed cycle count based on the actual sync relationships in the current model.',
  'Below the canvas it shows average uptime percentages and a legend, so the chart is not only visual decoration. It is the page\'s main overlap-analysis tool for seeing how sync offset affects value across activations.',
] as const

export const UPTIME_CALCULATOR_PERSISTENCE_FACTS = [
  'Uptime calculator state is local-first and persisted in Dexie-backed settings storage rather than treated as throwaway page state. The route hydrates saved calculator data before showing the full page shell.',
  'That saved state includes the main calculator inputs, visible results columns, row order, row enablement, panel-open state, and the separate chart workspace settings such as orientation, view, comparator, chart order, and color choices.',
  'It also preserves whether the chart is collapsed, whether the calculator is using automatic activation-count sizing, and the specific row-menu choice about including the Death Wave kill wave in uptime modeling.',
  'Because the calculator and chart each persist their own workspace state, returning to the page can restore both the numeric model and the visualizer setup a user was previously analyzing.',
] as const

export const UPTIME_CALCULATOR_AI_FACTS = [
  'TrackerAI can help explain which uptime inputs belong to weapons, bots, guardians, labs, modules, or modifiers, clarify the difference between the results table and the visualizer, and help interpret how a changed cooldown or duration input affects the current uptime outputs.',
  'It is especially useful when the user knows the sync question they care about but is not sure whether the right evidence will appear in the main table, the perma indicators, or the activation visualizer.',
  'Input edits and reset actions should still happen through the page controls and guardrails instead of being described as silent conversational rewrites of the calculator state.',
] as const
