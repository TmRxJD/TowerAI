export const USER_RUNS_OVERVIEW_FACTS = [
  'Run Tracker is the main page at / where users log, review, and manage their Tower runs.',
  'Signed-in users can keep runs in sync with their account, while guest users can still use the page locally without cloud sync.',
  'The page is built around three main areas: the Run Tracker tab for adding and managing runs, the Guild tab when guild features are enabled, and the Analysis tab for charts and summaries.',
] as const

export const USER_RUNS_ADD_RUNS_FACTS = [
  'Users can add runs in several ways: upload screenshots for OCR review, paste a game summary, use fast upload from the clipboard, import a CSV, or fill in a run manually.',
  'When OCR or pasted parsing is used, the page lets the user review the extracted values before saving so obvious mistakes can be fixed first.',
  'The page also checks for likely duplicate runs and warns before saving another copy with the same core results.',
] as const

export const USER_RUNS_MANAGE_FACTS = [
  'Users can edit saved runs, change run type, add notes, attach or remove screenshots, export runs to CSV, and delete one or many runs.',
  'Bulk actions are available for selected runs, including deleting multiple entries or changing the run type for several runs at once.',
  'The main run table is customizable, so users can choose which columns matter most and keep the page focused on the stats they actually care about.',
] as const

export const USER_RUNS_ANALYSIS_FACTS = [
  'The Analysis tab summarizes runs with charts, averages, best values, and category breakdowns so users can see trends instead of only raw rows.',
  'The Progress area includes a timeline chart with customizable metrics, visible tiers, axis choices, line styles, and fullscreen viewing.',
  'Date filters, run-type filters, and chart toggles help users narrow the page down to the runs that match the question they are trying to answer.',
] as const

export const USER_RUNS_GUILD_FACTS = [
  'When guild features are enabled, the Guild tab connects Run Tracker data to guild search, guild membership, and guild leaderboard participation tools.',
  'That means the same page can be used both for personal run tracking and for guild-oriented coordination when the user has that feature turned on.',
  'If guilds are disabled in settings, the Guild tab disappears and the rest of the Run Tracker page still works normally.',
] as const

export const USER_RUNS_SYNC_FACTS = [
  'Run Tracker is local-first, so the page can load saved runs from local storage first and keep working even when cloud access is unavailable.',
  'Signed-in users can load from cloud, save to cloud, or use sync options, and settings can automatically load or save cloud data in the background.',
  'This makes the page practical for everyday use: users can keep entering runs quickly, then let sync catch up when they are online and authenticated.',
] as const

export const USER_RUNS_SCREENSHOT_FACTS = [
  'Screenshots are optional for some entry methods, but they matter when users want OCR help, proof for review, or stronger confidence in uploaded results.',
  'The page can verify run details against a screenshot, flag large mismatches for review, and keep screenshot links attached to a run when available.',
  'Verified screenshots can matter for related site features such as giveaway processing and leaderboard-ready run handling, so the screenshot flow is more than just a picture viewer.',
] as const

export const USER_RUNS_AI_FACTS = [
  'For AI help, the most useful Run Tracker tasks are reading current runs, explaining tabs or filters, helping interpret charts, updating existing fields, and guiding users through add, import, export, or sync steps.',
  'Because adding or deleting run records changes tracker data, those actions should be treated more carefully than simple read-only questions or normal field edits.',
  'The page is a good fit for conversational help because users often ask practical questions such as how to add a run, why a chart looks strange, whether sync will overwrite local data, or what a screenshot is used for.',
] as const
