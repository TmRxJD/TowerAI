export const EULA_PAGE_OVERVIEW_FACTS = [
  'The EULA page is the dedicated route at /eula, titled Terms of Service & Privacy Policy in the live page heading.',
  'It is a lightweight informational route rather than a tool, tracker, or calculator. The page is primarily a structured legal and policy reference for using the site and related services.',
  'This page-layer knowledge is specifically about how the site EULA and policy page is presented to users, not a generalized legal interpretation outside the route text.',
] as const

export const EULA_PAGE_SCOPE_FACTS = [
  'The introduction section states that the terms govern the website and related services, explicitly including the Discord bots Tracker Bot and Tower Tools Bot rather than limiting the page to the website alone.',
  'Because the page ties both the site and bots into the same terms heading, it acts as a shared policy surface for multiple user-facing access paths in the ecosystem.',
  'This also means questions about whether the bots are covered by the site terms should be answered from the page as yes, not as a separate undocumented assumption.',
] as const

export const EULA_PAGE_ACCEPTABLE_USE_FACTS = [
  'The Acceptable Use section forbids illegal activity, harassment, reverse engineering, scraping, and other service abuse.',
  'It also specifically points users back to Discord community-guideline expectations when they are using the bot features, so the acceptable-use policy is framed across both the website and Discord context.',
  'This section is presented as a short list of behavioral boundaries rather than a long technical-enforcement description.',
] as const

export const EULA_PAGE_ACCOUNTS_FACTS = [
  'The Accounts and Verification section says some features require an account and verification and places responsibility on the user for the accuracy of information they provide.',
  'It also reserves the right to suspend or remove accounts that violate the terms, so the page does describe account-impacting enforcement even though it remains a simple informational route.',
  'This section is important for users asking whether every feature is anonymous or whether policy enforcement exists for verified accounts.',
] as const

export const EULA_PAGE_CONTENT_FACTS = [
  'The Content and Submissions section covers uploaded runs, screenshots, and other content, stating that the user grants the site a non-exclusive license to host and display that content.',
  'It also warns users not to upload content they do not have rights to share, which is the page\'s main content-rights boundary for submissions.',
  'Because this page is where the submission license is spelled out, it serves as the route-level answer for questions about what the site can do with uploaded run evidence and screenshots.',
] as const

export const EULA_PAGE_GIVEAWAY_BOT_FACTS = [
  'Separate sections cover Giveaways and Promotions and Discord Bot Use. The giveaway section says promotions are subject to separate rules posted on the site, while the bot section explains that bot behavior depends partly on the permissions a server owner grants in Discord.',
  'The bot section also states that outages or changes in Discord or third-party services can affect bot availability and that Discord-linked bot data follows the privacy handling described later on the page.',
  'That means this route connects policy coverage for giveaways and bot operations back into the rest of the site rather than leaving those features without terms context.',
] as const

export const EULA_PAGE_PRIVACY_FACTS = [
  'The Privacy and Data Handling section says the site does not sell or share personal data and describes retained data as limited to what is required for app functionality and operations.',
  'It also states that data may be used to improve the app and that account or data deletion requests will be honored through removal or anonymization where feasible.',
  'The following Data Retention and Cookies section adds that the site uses cookies and browser storage for persistence and experience improvements, and that cached assets may refresh automatically when a new site version is deployed.',
] as const

export const EULA_PAGE_LIABILITY_FACTS = [
  'The Liability section disclaims indirect, incidental, or consequential damages to the fullest extent permitted by law for the site, bots, and related services.',
  'The Changes to These Terms section then states that the terms may be updated over time and that continued use after a change constitutes acceptance of the updated version.',
  'Together, those sections form the page\'s main limitation-of-liability and policy-update contract rather than hiding those terms in a footer-only link.',
] as const

export const EULA_PAGE_CONTACT_FACTS = [
  'The Contact section tells users to reach site administrators through the reporting system or by messaging JD on Discord, and it includes JD\'s Discord user ID directly in the page text.',
  'That makes the route not only a policy document but also the canonical on-page escalation pointer for questions about terms or privacy practices.',
  'Because the contact guidance is part of the main page body, users do not need to leave the EULA page to know how policy questions should be raised.',
] as const

export const EULA_PAGE_AI_FACTS = [
  'TrackerAI can help summarize the sections of the EULA and Terms page, explain whether a specific site or bot behavior is mentioned there, and point users to the relevant section heading for acceptable use, privacy, giveaways, bot use, liability, or contact.',
  'It is especially useful when a user remembers a policy topic but not which section of the page covers it.',
  'The assistant should describe the live route text faithfully instead of pretending to offer binding legal advice beyond what the page actually states.',
] as const
