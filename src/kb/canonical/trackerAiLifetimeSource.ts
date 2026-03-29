export const LIFETIME_TRACKER_OVERVIEW_FACTS = [
  'Lifetime Stats Tracker is a dedicated page at /trackers/lifetime where users log long-term Tower totals and review how their account has grown over time.',
  'The route is treated as its own tracker page rather than a hidden leaderboard helper, so users can open it directly from site navigation when they want to update or review lifetime progress.',
  'Its page description matches that purpose clearly: review lifetime performance metrics and visualize long-term Tower progress instead of only storing one static screenshot.',
] as const

export const LIFETIME_TRACKER_ENTRY_FACTS = [
  'Users can add lifetime entries in two main ways: upload one or more screenshots for OCR review, or open the manual-entry form and type the values themselves.',
  'The OCR flow is review-first instead of blind import. Each uploaded screenshot is shown beside an editable form so the user can correct values before saving, skip a screenshot, or cancel the batch.',
  'The tracker covers a broad lifetime stat set, including coins, cash, stones, keys, cells, dice, damage dealt, enemies destroyed, waves completed, research completed, and several upgrade-related totals.',
] as const

export const LIFETIME_TRACKER_TABLE_FACTS = [
  'Saved lifetime entries appear in a data table where users can edit entries, delete one or many entries, open attached screenshots, and control which columns are visible.',
  'The table also supports column reordering and remembered UI preferences, so the page can reopen with the user’s preferred lifetime layout instead of resetting every session.',
  'This makes the lifetime tracker useful as an ongoing logbook, not just a one-time import screen.',
] as const

export const LIFETIME_TRACKER_ANALYSIS_FACTS = [
  'The lifetime tracker does more than store rows. It calculates average coins, cash, stones, and keys using the latest entry and the account age since the recorded game-start date.',
  'Those averages can be viewed across different periods such as minute, hour, day, week, month, three months, six months, or year, which helps users translate a giant lifetime total into a more readable pace.',
  'The same page also includes a Progress Over Time chart with customizable Y-axes, timeline columns, line styles, colors, and dot size so users can focus on the lifetime trends they actually care about.',
] as const

export const LIFETIME_TRACKER_INTERPRETATION_FACTS = [
  'Lifetime entries are most useful when users think of them as checkpoints in a long-running history, not as a stream of noisy micro-updates. The page sorts by most recent entry and uses the latest saved totals as the anchor for its average cards.',
  'That means the quality of the tracker depends more on consistent, believable snapshots than on constant spam. A clear before-and-after rhythm usually makes the averages and chart easier to trust and easier to explain later.',
  'The chart and averages are best read as progress context rather than as a substitute for raw rows. If a number looks strange, the saved entry table is still the place to confirm what was actually entered.',
] as const

export const LIFETIME_TRACKER_SYNC_FACTS = [
  'Lifetime tracker data is stored locally and can also sync through the site’s cloud flow when the user is signed in.',
  'The page supports conflict-aware syncing through a sync dialog, and it also respects the site settings that control automatic cloud load and automatic cloud save.',
  'That means the page is designed to stay useful offline or locally first, while still offering cloud continuity for users who want their lifetime log to follow their account.',
] as const

export const LIFETIME_TRACKER_SCREENSHOT_FACTS = [
  'Screenshots are part of the lifetime workflow, but they are handled selectively rather than kept forever on every synced entry.',
  'When entries are pushed through the sync path, the latest entry is the one that keeps screenshot-backed verification support, while older entries are normalized into plain historical rows without the same screenshot emphasis.',
  'For users, that matters most when they are asking why one lifetime row has stronger screenshot or verification context than another.',
] as const

export const LIFETIME_TRACKER_LEADERBOARD_FACTS = [
  'Lifetime tracker is closely tied to the lifetime section of Leaderboard, but the two pages do different jobs.',
  'The tracker page is where users build and maintain their lifetime history, while the leaderboard page turns selected lifetime metrics into a shared comparison view for coins, cells, dice, stones, keys, damage dealt, enemies destroyed, waves completed, and research completed.',
  'That makes the lifetime tracker the maintenance side of the experience and the lifetime leaderboard the comparison side of the same broader feature area.',
] as const

export const LIFETIME_TRACKER_AI_FACTS = [
  'TrackerAI can help explain lifetime fields, chart controls, OCR review expectations, sync behavior, and how the lifetime tracker connects to the lifetime leaderboard view.',
  'It is especially useful when a user knows what number they see but is not sure whether they should add it manually, verify it from OCR, compare it on the chart, or expect it to show on leaderboard.',
  'More sensitive changes still belong inside the page’s normal edit, sync, and confirmation flows instead of being treated like casual conversational shortcuts.',
] as const
