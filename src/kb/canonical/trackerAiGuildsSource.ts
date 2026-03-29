export const GUILDS_OVERVIEW_FACTS = [
  'Guilds are a social site feature that let users group up, review member activity, and coordinate around shared run progress.',
  'For normal users, guild access shows up mainly through the Guild tab inside Run Tracker and through the Guild Chat button when guild features are enabled and the user belongs to at least one guild.',
  'The feature is designed around a few practical workflows: finding a guild, joining or creating one, checking member activity, and coordinating through guild chat.',
] as const

export const GUILDS_MEMBERSHIP_FACTS = [
  'Users can belong to up to three guilds at once, and non-admin users can only own one guild at a time.',
  'The guild interface uses slots so joined guilds can be switched quickly without searching again each time.',
  'If a user leaves a guild or loses access, the cached guild view is cleaned up and the remaining guild slots stay usable.',
] as const

export const GUILDS_SEARCH_JOINING_FACTS = [
  'Guild search supports looking up guilds by name, by guild ID, or by a member username.',
  'Public guilds can usually be joined directly, while private guilds create a pending join request instead of adding the user immediately.',
  'Users can also create a guild from the same overall surface by entering a name, optional description, and whether the guild should be private.',
] as const

export const GUILDS_ROLES_FACTS = [
  'Guild roles matter because owners and officers can manage more of the guild than regular members can.',
  'Owners can rename the guild, transfer ownership, delete the guild, and control member-management settings, while officers can help manage members and invite requests.',
  'Regular members can still view guild activity and leave the guild, but they do not get the same management controls as officers or owners.',
] as const

export const GUILDS_ACTIVITY_FACTS = [
  'A guild snapshot shows member rows with recent upload activity, role labels, recent runs, and quick ways to drill into charts, screenshots, or extended run stats.',
  'This makes guilds useful for more than membership tracking, because the page can also answer practical questions like who uploaded recently or how a member is progressing.',
  'The table is customizable, so users can keep the guild view focused on the run columns that matter most to them.',
] as const

export const GUILDS_CHAT_FACTS = [
  'Guild Chat lives in a header drawer and is only shown when guild features are enabled, the user is signed in, and the user has at least one guild.',
  'The drawer keeps separate tabs per guild, tracks unread counts, remembers the last opened guild, and caches recent messages locally for convenience.',
  'Users can send normal guild messages there, and guild chat also supports TrackerAI-style prompts through message prefixes or slash-command flows.',
] as const

export const GUILDS_LEADERBOARD_FACTS = [
  'Guild leaderboard visibility is not automatic for every guild. A guild needs at least three members before it can appear in leaderboard filters.',
  'Leaderboard participation can also be toggled for the active guild, so being large enough and being opted in are two separate things.',
  'That distinction matters when a user asks why a guild is missing from leaderboard filters, because the answer may be member count, participation settings, or both.',
] as const

export const GUILDS_AI_FACTS = [
  'TrackerAI can be useful around guilds for explaining guild screens, helping users understand join and role rules, interpreting activity views, and guiding them through chat or leaderboard questions.',
  'Routine navigation and non-destructive updates fit that model well, while heavier guild changes should still be handled carefully under the site guardrails.',
  'Friendly guild answers should focus on what a user is trying to accomplish, such as joining a guild, fixing leaderboard visibility, or understanding what a role can do.',
] as const
