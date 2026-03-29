export const LEADERBOARD_OVERVIEW_FACTS = [
  'Leaderboard is a standalone tracker page at /leaderboard where users compare top scores and performance metrics against other submitted entries.',
  'It is also available from the main site header, so users can move between Run Tracker and Leaderboard without digging through hidden menus.',
  'The page is built for practical comparison rather than raw data export: users pick a tier or mode, browse the visible metrics, and open entries for more detail when something looks interesting.',
] as const

export const LEADERBOARD_FILTERS_FACTS = [
  'The page supports tier selection, search, column customization, verified-only viewing, and a guild filter when the selected mode supports guild filtering.',
  'Tower tiers, lifetime stats, and BeMerged do not behave exactly the same, so some controls lock or change when the selected tier changes.',
  'This helps the page stay focused on the kind of leaderboard the user is actually looking at instead of pretending every metric and filter applies everywhere.',
] as const

export const LEADERBOARD_MODES_FACTS = [
  'Leaderboard has three broad viewing modes: normal Tower tiers, Lifetime Stats, and BeMerged.',
  'Each mode shows a different metric mix, so the visible columns and titles shift to match that mode instead of forcing one rigid table across everything.',
  'That means a user asking about Leaderboard often needs a mode-aware answer first, especially when they are switching between Tower runs, lifetime totals, and BeMerged results.',
] as const

export const LEADERBOARD_BEMERGED_FACTS = [
  'When users switch Leaderboard to BeMerged, the table changes to BeMerged-specific metrics instead of reusing Tower labels that would be misleading.',
  'That BeMerged view focuses on Time, 5★ Mods (24), Moves, Merges, and Shards, and the time value is shown as a readable duration rather than a raw number of seconds.',
  'Guild filtering and verified-only filtering are deliberately locked there, so users compare BeMerged attempts in one shared BeMerged pool instead of mixing in Tower-only controls.',
  'The result is a mode that is meant to be read as a BeMerged run summary: how far the attempt got, how efficiently it played, and how many shards it produced, all without pretending those numbers are normal Tower metrics.',
] as const

export const LEADERBOARD_LIFETIME_FACTS = [
  'When users switch Leaderboard to Lifetime Stats, the table changes to lifetime-only totals instead of showing normal run metrics.',
  'That lifetime view focuses on Coins, Cells, Dice, Stones, Keys, Damage Dealt, Enemies Destroyed, Waves Completed, and Research Completed.',
  'Verified-only viewing and guild filtering are locked there, which keeps the lifetime leaderboard focused on the lifetime comparison set rather than mixing in controls that belong to supported tower views.',
  'In practice, users should read this mode as a long-term account comparison table: it is about accumulated lifetime progress, not one specific tower run.',
] as const

export const LEADERBOARD_PARTICIPATION_FACTS = [
  'Signed-in users can choose whether they participate in the leaderboard through a leaderboard setting rather than being forced in silently.',
  'That participation setting matters because the page is meant to be useful for browsing even when a user is not actively publishing their own results.',
  'When users ask why they do not appear, the answer may involve participation settings, source data quality, verification state, or whether the relevant runs were actually published into leaderboard-ready form.',
] as const

export const LEADERBOARD_USER_RANK_FACTS = [
  'When enabled, the page can show a personal rank summary row so users can quickly see where they stand without hunting through the full table.',
  'That summary is metric-specific, which matters because a user may rank well for one stat and not for another.',
  'This makes the page more practical for questions like how a user ranks in coins, waves, or lifetime totals without forcing a full manual scan every time.',
] as const

export const LEADERBOARD_ENTRY_FACTS = [
  'Most visible leaderboard cells can be opened for more detail, especially when a screenshot or linked run can be resolved for that entry.',
  'That dialog flow is useful because users often want proof, context, or a closer look at the run behind a score rather than only the number shown in the table.',
  'Users can also report suspicious entries from that flow, which makes the leaderboard page part of the site review process instead of a read-only scoreboard.',
] as const

export const LEADERBOARD_GUILD_FACTS = [
  'Leaderboard can filter by guild for supported tower views, using eligible guild options instead of exposing every guild in every mode.',
  'Guild filtering is not available for lifetime or BeMerged views, so the page deliberately locks that filter when it would not make sense.',
  'This keeps guild-based leaderboard browsing tied to the guild rules that actually exist rather than implying that every leaderboard has the same guild context.',
] as const

export const LEADERBOARD_CACHE_FACTS = [
  'Leaderboard keeps local cache data and UI preferences so the page can reopen faster and remain usable when fresh cloud data is temporarily unavailable.',
  'If a user already has cached leaderboard data, the page can fall back to that while a refresh is attempted in the background or while the user is offline.',
  'There is also an explicit cache-clear action for cases where the user wants to force a fresh reload instead of trusting stale local data.',
] as const

export const LEADERBOARD_AI_FACTS = [
  'TrackerAI can be helpful on Leaderboard for explaining filters and modes, finding what a metric means, clarifying why a user or guild is missing, and walking through what a visible score is showing.',
  'It can also help compare what changes between Tower, Lifetime Stats, and BeMerged views, which is often where user confusion starts.',
  'More sensitive changes should still stay inside the normal permission and confirmation boundaries instead of being treated like casual page help.',
] as const
