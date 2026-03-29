export const SHARD_SPLITTER_OVERVIEW_FACTS = [
  'Shard Splitter is the dedicated page at /calculators/shard-splitter for splitting module shards between primary and assist upgrade paths and for reviewing an effective module damage path in the same workspace.',
  'The page is organized into Shard Splitter and Effective Module Damage Path tabs, so it acts like a paired optimization workspace instead of a single static recommendation table.',
  'This page-layer knowledge is specifically about how the site shard-splitter tool behaves for users, not the broader module encyclopedia or raw upgrade datasets by themselves.',
] as const

export const SHARD_SPLITTER_INPUT_FACTS = [
  'On the Shard Splitter side, users choose module type, shard discount, assist efficiency, unspent shards, primary rarity and level, and assist rarity and level inside a collapsible Module Configuration panel.',
  'The same page also shows current total budget and current total cost, so users can compare their available shard budget against the current state before evaluating candidates.',
  'Because module type has its own tab set, the splitter behaves like a per-type optimizer rather than a single shared input form across all module families.',
  'Those splitter inputs are not limited to one recommendation pass. Users can keep refining discount, efficiency, rarity, and level assumptions until the highlighted recommendation and the comparison tables match the plan they actually want to test.',
] as const

export const SHARD_SPLITTER_OUTPUT_FACTS = [
  'The splitter surfaces a Best Result card, a Next Split card, an Alternative Candidates table, and a Next Alternative Candidates table.',
  'Those results are not just one opaque recommendation. They show projected primary and assist targets, shard usage, remaining shards, total bonus, and customizable comparison columns for deeper candidate review.',
  'The Best Result card also includes a Set action so users can apply the suggested target levels back into the current splitter inputs instead of copying values manually.',
  'That layout gives users both an immediate answer and a near-future answer: Best Result explains the strongest current split, while Next Split and the next-alternative table show what the next shard milestone would unlock after the current recommendation.',
] as const

export const SHARD_SPLITTER_DAMAGE_PATH_FACTS = [
  'The Effective Module Damage Path tab is a second optimization mode on the same page, not a separate tool disguised as a link-out.',
  'It uses collapsible sections for global settings, module settings, efficiency levels, and a values-used table before the final upgrade-path table is shown.',
  'That upgrade-path table is ordered by best ROI and can be customized with columns for step number, shard cost, cumulative cost, primary and assist levels, multipliers, damage gain, and damage-per-stone style metrics.',
  'The damage-path setup is split between Cannon and Core module pairs, with separate primary and assist rarity, current level, unspent-shard, assist-efficiency, and lab-efficiency inputs for each side.',
  'The values-used panel matters because it exposes the exact multipliers, effective efficiency totals, and total damage numbers the ROI path is built from instead of leaving the final ordering unexplained.',
] as const

export const SHARD_SPLITTER_DAMAGE_PATH_CONFIG_FACTS = [
  'Effective Module Damage Path has its own configuration workflow instead of reusing the simpler split-target inputs. Users set a global shard discount, then configure separate Cannon and Core primary and assist rarity, level, shard, and efficiency values.',
  'Assist efficiency and lab efficiency are combined into visible total-efficiency readouts for both Cannon and Core, so users can see the assumptions behind the damage path before reading the upgrade order.',
  'Because that configuration is shown in collapsible panels and echoed again in the values-used table, the page behaves like a transparent ROI workspace rather than a black-box optimizer.',
] as const

export const SHARD_SPLITTER_STATE_FACTS = [
  'Shard Splitter is persistent rather than disposable. It remembers the active page tab, whether the input and values panels are expanded, visible result columns, module-type selections, and the current optimization inputs.',
  'That persistence matters because users often move between the splitter and damage-path modes or step away mid-planning without wanting to rebuild the whole setup.',
  'The same state also links into the broader module calculator workspace when shard splitter is opened there, so module-planning assumptions can stay aligned across related tabs.',
  'That shared-state behavior is especially important because the standalone shard-splitter page and the embedded module-calculator shard-splitter tab are meant to feel like the same planning workspace, not two disconnected versions of the tool.',
] as const

export const SHARD_SPLITTER_AI_FACTS = [
  'TrackerAI can help explain what the best result means, clarify the difference between the splitter and damage-path modes, and explain which inputs are changing shard recommendations versus damage-path ROI tables.',
  'It is especially useful when a user knows they want better module shard efficiency but is not sure whether the question belongs in split targets or in the upgrade-order damage path.',
  'Applying suggestions, changing inputs, and other stateful planning edits should still happen through the page controls instead of being treated like silent conversational changes.',
] as const
