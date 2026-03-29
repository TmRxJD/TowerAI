export const GIVEAWAY_PAGE_OVERVIEW_FACTS = [
  'Monthly Giveaways is the dedicated page at /giveaway for viewing the current community giveaway program, confirming giveaway eligibility, managing referral participation, and reading the official rules and prize terms.',
  'The route is a mixed public and authenticated page rather than a calculator workspace. Public visitors can read how the program works, see current prize information, and review the official rules, while signed-in users get an additional progress dashboard for their own monthly giveaway state.',
  'This page-layer knowledge is specifically about how the site giveaway page behaves for users, not a generic sweepstakes policy document or the raw backend database structure by itself.',
] as const

export const GIVEAWAY_PAGE_PROGRESS_FACTS = [
  'When a user is signed in, the page shows a Your Progress section for the current month with cards for verified runs, qualified referrals, total tickets, and the current ticket pool size.',
  'Those progress values are not just raw upload counts. The page distinguishes verified and qualified giveaway activity from ordinary site activity, so giveaway totals can depend on verification state, eligibility timing, and referral qualification status rather than every uploaded run counting immediately.',
  'If the account has an eligible start month in the future, the page shows an info callout explaining when ticket earnings begin instead of pretending the user is already active for the current month.',
] as const

export const GIVEAWAY_PAGE_PLAYER_ID_FACTS = [
  'Player ID is a first-class giveaway requirement on the page. Users without a stored Player ID see an entry form and cannot fully participate in giveaways until they confirm that in-game identifier.',
  'Once a Player ID is on file, the page switches into a confirmed-entry state and offers a Remove Player ID action through a confirmation dialog rather than instantly clearing participation data with one click.',
  'The removal dialog explicitly warns that taking the Player ID off file disqualifies the user from current and future giveaways until it is added again, while still preserving uploaded monthly progress if they re-enter within the same month.',
] as const

export const GIVEAWAY_PAGE_REFERRAL_FACTS = [
  'The referral area supports two different workflows: generating your own referral code once you qualify, and entering someone else\'s referral code if you are still inside your first eligible giveaway period and have not already been referred.',
  'Referral-code generation is gated by three page-visible requirements: the user must be in an eligible giveaway month, must have a Player ID on file, and must have uploaded at least the minimum required verified runs before the Generate Referral Code button becomes truly available.',
  'Submitting a referral code is also guarded. The page blocks self-referrals, duplicate applied referrals, and expired referral-entry windows, and it clears the inline form only after the relationship is successfully created.',
] as const

export const GIVEAWAY_PAGE_CURRENT_FACTS = [
  'The Current Giveaways section shows the active giveaway pool for the month, including a live countdown to the next drawing, a prize summary card, and the prize tiers rendered as separate cards.',
  'Signed-in users with loaded giveaway stats also see per-prize chance chips there, so the page provides a personalized odds estimate on top of the generic prize display. Those chips divide the overall ticket odds across the listed prize count instead of presenting the same number as a generic one-size-fits-all percentage.',
  'The countdown is a live page element that updates on an interval and can switch into a Drawing in progress state once the month-end target is reached.',
  'If no giveaways are active for the month, the page swaps that section into a no-active-giveaways empty state instead of leaving stale prize cards visible.',
] as const

export const GIVEAWAY_PAGE_RULES_FACTS = [
  'The lower half of the page includes an Official Rules and Terms section with expansion panels for eligibility requirements, ticket rules, winner selection, prize distribution, and referral-program rules.',
  'Those rules are followed by stacked legal and sponsor notices such as No Purchase Necessary, odds-of-winning language, void-where-prohibited notice, disqualification rights, website-terms acknowledgement, Player ID privacy, and a community best-effort disclaimer.',
  'The prize-distribution and legal notice copy is part of the live route behavior too: it tells winners that delivery is fulfilled through the game webstore, highlights the Player ID privacy promise, and includes the Friendly Promise notice about best-effort handling if store or gifting systems fail.',
  'Because those rules live directly on the route rather than on a separate legal page, the giveaway page acts as both the participation dashboard and the main rules reference for the program.',
] as const

export const GIVEAWAY_PAGE_PROCESSING_FACTS = [
  'Giveaway ticket totals on the page are driven by giveaway-specific processing, not simply by a raw run counter. Qualifying runs need to meet the configured wave threshold, avoid duplicate or too-soon submissions, and can be marked pending review when screenshot proof is missing or not yet verified.',
  'Run tickets are milestone-based and can gain a streak bonus after enough tightly spaced qualifying uploads, while referral tickets can be awarded to both the referred account and the referrer according to the referral milestone rules shown on the page.',
  'The giveaway services also auto-seed the month\'s giveaway pool if none exists yet and auto-finalize the previous month\'s active giveaways when later giveaway processing detects they are still pending, which is why the page can surface current-month data without a separate manual setup step.',
] as const

export const GIVEAWAY_PAGE_LEADERBOARD_FACTS = [
  'Leaderboards are not a public giveaway feature. The page only renders the leaderboard section for admins and moderators after the permission checks resolve.',
  'That means normal participants can use the page to track their own progress and odds, but they do not get the same global leaderboard visibility that staff accounts see.',
  'When staff visibility is allowed, the leaderboard section loads giveaway-specific boards and even has its own loading and error states rather than reusing the standard public site leaderboard page.',
] as const

export const GIVEAWAY_PAGE_AI_FACTS = [
  'TrackerAI can help explain the giveaway requirements, why a referral action is blocked, how run tickets and referral tickets are being described on the page, and where to find the official rules or current prize information.',
  'It is especially useful when a user knows they are missing eligibility somewhere but is not sure whether the blocker is Player ID, first-month referral timing, verified runs, or the start month for ticket earnings.',
  'Actions that affect giveaway participation, such as removing a Player ID or applying a referral code, should still be described through the page controls and guardrails instead of being presented as silent hidden state mutations.',
] as const
