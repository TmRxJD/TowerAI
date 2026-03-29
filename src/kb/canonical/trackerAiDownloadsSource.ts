export const DOWNLOADS_PAGE_OVERVIEW_FACTS = [
  'Downloads is the dedicated page at /downloads for choosing between the site\'s desktop app installers, mobile-store links, and Discord bot invite links.',
  'The route is organized as a downloads hub instead of a single one-button download page. It separates the available delivery paths by platform so users can decide whether they want the desktop app, a mobile install path, or a Discord bot entry point.',
  'This page-layer knowledge is specifically about how the site downloads page behaves for users, not the full deployment architecture or internal packaging code by itself.',
] as const

export const DOWNLOADS_PAGE_DESKTOP_FACTS = [
  'The Desktop App section presents platform-specific cards for Windows, macOS, and Linux, each with a Daemon Edition selector before the final download button.',
  'Those desktop installers already include the daemon. Changing the edition does not choose a different app shell; it changes which daemon bundle ships inside the desktop installer package for that platform.',
  'The download URLs are built from the shared release base and platform-specific installer filenames, with Windows using Setup.exe, macOS using zip archives, and Linux using deb packages on the page.',
  'The same section also includes a Build It Yourself expansion panel with clone, install, build, and output-folder instructions plus copy buttons for the shell commands, so the page supports both direct download and source-build workflows.',
] as const

export const DOWNLOADS_PAGE_DAEMON_FACTS = [
  'The Daemon section is the standalone runtime path for users who want the tray, MCP bridge, and local background services without installing the full desktop shell.',
  'This area is separate from the desktop installer cards because the daemon bundle is presented as its own runtime surface rather than as a platform-specific app wrapper. Users should read it as the headless companion/runtime option, not as a second copy of the full desktop UI.',
  'When TrackerAI explains the daemon downloads, it should frame them as the dedicated background-service package for bridge and tray workflows, not as the same thing as the packaged desktop app installers or the Discord bot invites.',
] as const

export const DOWNLOADS_PAGE_MOBILE_FACTS = [
  'The Mobile section is intentionally simpler than the desktop and daemon areas. It exposes a live Android button to the Google Play listing and a disabled iOS Coming Soon button rather than a matrix of installer variants.',
  'That means the page currently treats mobile as a store-link surface, not as a manual sideload or build-it-yourself workflow on the route itself.',
  'Unlike the desktop or daemon cards, the mobile section does not expose edition selectors, installer file types, or copyable shell commands. It is purely a quick store-access surface.',
  'Because iOS is shown as coming soon instead of omitted completely, the page signals planned support while still clearly marking that it is not downloadable yet.',
] as const

export const DOWNLOADS_PAGE_BOTS_FACTS = [
  'The Discord Bots section is an invite hub rather than a binary download area. It currently exposes invite buttons for Tracker Bot and Tools Bot with short captions explaining their roles.',
  'Tracker Bot is described as the Discord-side run and stats tracking path, while Tools Bot is described as the Discord-side calculators and optimization-tools path.',
  'This section currently does not list ModBot or any daemon-side bot management package, so the bot breakdown on the downloads page is specifically the two end-user Discord bot invites shown on the route today.',
  'This is why the downloads page groups bot access beside app installers: it is treating all entry points into the ecosystem as installation or access surfaces, even when the underlying action is an OAuth invite instead of a file download.',
] as const

export const DOWNLOADS_PAGE_EDITION_FACTS = [
  'The desktop section keeps the download flow simple by presenting platform-specific installers directly rather than adding edition-specific runtime packaging choices on the page.',
  'The current page copy focuses on installer type and build-from-source transparency instead of exposing multiple bundled runtime tiers.',
  'Because the desktop cards link straight to the latest release assets, the user can pick a platform without managing a second packaging decision on the route itself.',
] as const

export const DOWNLOADS_PAGE_UI_FACTS = [
  'The route includes a shared Copied snackbar used by the copy-to-clipboard buttons in the build-it-yourself panels, so command copying has lightweight inline feedback instead of silent clipboard writes.',
  'This means the downloads page is not only a list of outbound links. It also has a small amount of interactive helper UI for source-build users comparing commands across sections.',
  'Because the same helper is reused across the desktop build commands, the page keeps a consistent copy interaction instead of inventing separate feedback patterns for each step.',
] as const

export const DOWNLOADS_PAGE_AI_FACTS = [
  'TrackerAI can help explain which download surface fits a user\'s goal, such as whether they want the desktop app, whether mobile is already available, or which Discord bot invite is appropriate for their workflow.',
  'It is especially useful when a user knows they want local desktop access but is not sure whether they should install the desktop app or just use the mobile or Discord entry points instead.',
  'Downloads still happen through the page links and copyable commands rather than through silent background installation steps described as if they were already executed.',
] as const
