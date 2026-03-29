export const BEMERGED_OVERVIEW_FACTS = [
  'BeMerged is a standalone game page at /games/bemerged, and users can open it directly from the Games menu in the main site header.',
  'It is framed as a self-contained browser game inside the tracker site rather than as a hidden side tool, so users can move between the main tracker pages and BeMerged without leaving the site experience.',
  'The page description and in-game guide both treat it as a module-themed merge challenge where the run objective is to push all 24 unique modules to 5★ Ancestral.',
  'In practice, BeMerged plays like a pressure-based puzzle run: clear space, upgrade pieces, protect key uniques, and keep the board stable long enough to finish every module line.',
] as const

export const BEMERGED_GOALS_FACTS = [
  'The BeMerged rules panel explains the win condition in plain language: raise all 24 unique modules to 5★ Ancestral before hazards and board pressure overwhelm the run.',
  'Those 24 uniques are spread across the four module families Cannon, Armor, Generator, and Core, so a strong run has to progress the whole roster instead of tunneling on one lucky piece.',
  'During a run, the page shows practical run stats like Time, Move #, Total Merges, Total Shatters, Total Shards, and shard progress by module type, so users can tell whether a run is improving or stalling.',
  'That makes BeMerged easier to discuss with users because the page already exposes the metrics they care about while they play, instead of hiding progress behind internal debug output.',
] as const

export const BEMERGED_TURN_FLOW_FACTS = [
  'A normal BeMerged turn is a loop of clearing space, upgrading a target piece, repositioning around hazards, and then setting up the next clear or merge.',
  'That means efficient play is not only about making the largest visible combo. Players usually need to balance board cleanup with steady progress on their unfinished uniques.',
  'The in-game guide summarizes the rhythm well: clear, merge, avoid hazards, and repeat before mines or bosses turn a manageable board into a trapped one.',
] as const

export const BEMERGED_SHATTER_FACTS = [
  'Shattering is the board-clearing action in BeMerged. A shatter combo is any horizontal or vertical match of three or more matching modules.',
  'Successful shatters clear tiles, award shards, trigger cascades, and open room for new spawns, which is one of the main ways fresh upgrade material and potential uniques enter the board.',
  'Only shatter combos have to be aligned on the board, so this mechanic is the main answer when the user needs breathing room rather than a direct upgrade.',
] as const

export const BEMERGED_MERGE_FACTS = [
  'Merging is the upgrade action in BeMerged. Players long-press a module to enter merge mode, then feed it matching fodder modules from anywhere on the board.',
  'Merges do not require adjacency or a straight line, which is a major difference from shattering and one of the most important rules for new players to understand quickly.',
  'Common modules cannot be merge bases, regular modules stop at Legendary+, and only unique modules continue through Mythic, Mythic+, and Ancestral stars.',
] as const

export const BEMERGED_HAZARDS_FACTS = [
  'Mines and bosses are the two main pressure systems that stop BeMerged from becoming a slow, risk-free builder.',
  'Mines spawn over time, block tiles, and explode when their timers expire, while bosses appear every 100 moves, chase nearby uniques, and eventually start destroying modules faster and faster if not handled.',
  'That is why a run can collapse even when the player understands merging: the board is only safe for as long as the player keeps space open and keeps hazards away from important uniques.',
] as const

export const BEMERGED_INVENTORY_FACTS = [
  'Inventory acts as the active loadout. Equipping a unique removes it from the board and stores it safely in one of four type slots: Cannon, Armor, Generator, or Core.',
  'Only one unique of each type can be equipped at a time, and returning one to the board requires swapping with another unique of the same type that is already on the board.',
  'This matters because users often think of inventory as simple storage, but in practice it is a strategic safety and effect-management system tied directly to boss timing and board position.',
] as const

export const BEMERGED_SHARDS_FACTS = [
  'Shards come from shattering modules, and they are a real strategy resource rather than a decorative score counter.',
  'Players can spend shards to boost spawn chances for a module type, or hold them to support PF-style scaling that benefits from unspent shards staying on hand.',
  'That tradeoff makes shard decisions meaningful: spending can smooth the next few turns, while saving can improve longer-run scaling if the board is stable enough to support it.',
] as const

export const BEMERGED_UNIQUES_FACTS = [
  'Unique modules define the character of a BeMerged run because each family leans into a different kind of advantage instead of giving one generic stat bonus.',
  'Cannons lean toward boss damage and kill pressure, Armors help with mine safety and destruction mitigation, Generators push spawn quality and shard growth, and Cores reshape board tempo and hazard behavior.',
  'Because only equipped uniques grant their effects, BeMerged strategy is partly about upgrading uniques and partly about choosing which family effects need to be active for the next phase of the run.',
] as const

export const BEMERGED_PHASE_STRATEGY_FACTS = [
  'Early in a BeMerged run, the safest priority is usually board space and setup, not greed. Players want enough room to keep shattering, enough upgrade material to start key uniques, and enough stability that the first boss does not arrive into a cramped board.',
  'Once bosses start appearing regularly, the run shifts from simple growth into phase management. Good play becomes more about entering each boss cycle with safe unique positions, a planned loadout, and enough clearing tools to keep hazards from pinning the board.',
  'Late-run mistakes are usually not about forgetting the rules. They come from falling behind on one family, spending too many moves fixing clutter, or letting hazards trap uniques that still need major upgrades.',
] as const

export const BEMERGED_BOSS_PREP_FACTS = [
  'Boss preparation in BeMerged starts before the boss is on screen. Because bosses appear every 100 moves and equipped uniques cannot be swapped while a boss is alive, players get the best results when they set their loadout and board shape ahead of time.',
  'The in-game guide also makes two practical boss habits clear: keep important uniques away from likely trap zones, and kite the boss toward safer parts of the board instead of letting it path directly through critical upgrade pieces.',
  'That turns boss handling into a preparation problem as much as a damage problem. A run that enters the boss cycle organized can keep progressing, while a run that enters cluttered often loses tempo even if the player understands the damage rules.',
] as const

export const BEMERGED_FAMILY_STRATEGY_FACTS = [
  'The four unique families support different recovery plans. Cannons are the cleanest answer when bosses are the main threat, Armors help when hazard damage and mine pressure are ruining board control, Generators help when the run needs better spawn quality or shard income, and Cores help when tempo and board behavior need to be reshaped.',
  'That does not mean players should force one family and ignore the others. The win condition still requires all 24 uniques, so family strategy is mostly about deciding which effects need to be active right now while the rest of the roster catches up.',
  'In practice, family planning is a triage tool: pick the equipped set that solves the current problem, then rotate attention once the run is stable again.',
] as const

export const BEMERGED_ELIGIBILITY_FACTS = [
  'BeMerged tracks personal progress locally, but leaderboard eligibility has an extra boundary on top of simple score tracking.',
  'The in-game guide says that using AI or dev tools during a run disqualifies that attempt from leaderboard placement, even if the page still shows run stats or personal best context locally.',
  'That distinction matters because players can still experiment, learn, or test settings on the page without assuming every assisted run should appear as a normal ranked result.',
] as const

export const BEMERGED_SETTINGS_FACTS = [
  'BeMerged includes a visible settings panel where users can change orientation, background, hint behavior, and a few convenience options like auto-shattering rares.',
  'Those settings are there to make the page easier to play and read on different screens, not to force everyone into one fixed layout.',
  'The same panel also exposes autoplay-related preferences when users want the BeMerged page to use AI-assisted autoplay on that page.',
] as const

export const BEMERGED_PERSONAL_BESTS_FACTS = [
  'The BeMerged page tracks a local Best Shards value on the page itself, so users can reopen the game and still see their personal high-water mark even before thinking about leaderboard.',
  'When a run finishes or is restarted after real progress, the page sends an attempt summary that includes time, moves, merges, shards, and completion progress into the site-side BeMerged stats service.',
  'Signed-in users can then have their BeMerged best metrics published into the site leaderboard data, while the local page still keeps working even when cloud publishing is not part of the current session.',
  'That means local progress and shared leaderboard visibility are related but not identical: the page can remember personal best context even when a session is not eligible to publish online.',
] as const

export const BEMERGED_LEADERBOARD_FACTS = [
  'BeMerged is tied to its own leaderboard mode rather than being mixed into normal Tower tiers.',
  'That dedicated mode compares BeMerged attempts with BeMerged-specific columns such as Time, 5★ Mods (24), Moves, Merges, and Shards.',
  'For users, the important part is that a BeMerged result should be interpreted as a BeMerged run summary, not as a normal Tower run wearing different labels.',
  'The in-game guide also makes one boundary clear to users: AI-assisted or dev-assisted runs are not meant to qualify for leaderboard placement, so the leaderboard is intended to reflect normal play results.',
] as const

export const BEMERGED_AI_FACTS = [
  'TrackerAI can help explain BeMerged rules, progress terms, and the way BeMerged leaderboard numbers map back to a run.',
  'On the BeMerged page itself, the visible Autoplay control can initialize an AI model and run AI-assisted autoplay when the related AI features are enabled.',
  'That makes BeMerged a place where the assistant is useful for explanation and guidance, while still keeping sensitive or unusual actions inside the page controls and normal guardrails.',
] as const
