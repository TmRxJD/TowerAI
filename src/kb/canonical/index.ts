import type { KBChunkRecord } from './shared'
import { buildBotsCanonicalKbChunks } from './bots'
import { buildCardsCanonicalKbChunks } from './cards'
import { buildCurrencyCanonicalKbChunks } from './currency'
import { buildDailyMissionsCanonicalKbChunks } from './dailyMissions'
import { buildEnemiesCanonicalKbChunks } from './enemies'
import { buildEventsCanonicalKbChunks } from './events'
import { buildFaqCanonicalKbChunks } from './faq'
import { buildFootgunsCanonicalKbChunks } from './footguns'
import { buildGuidesCanonicalKbChunks } from './guides'
import { buildGuildsCanonicalKbChunks } from './guilds'
import { buildLabsCanonicalKbChunks } from './labs'
import { buildMilestonesCanonicalKbChunks } from './milestones'
import { buildModulesCanonicalKbChunks } from './modules'
import { buildPerksCanonicalKbChunks } from './perks'
import { buildRelicsCanonicalKbChunks } from './relics'
import { buildTrackerAiShardSplitterCanonicalKbChunks } from './trackerAiShardSplitter'
import { buildTiersCanonicalKbChunks } from './tiers'
import { buildTournamentsCanonicalKbChunks } from './tournaments'
import { buildThemesCanonicalKbChunks } from './themes'
import { buildTrackerAiAccessCanonicalKbChunks } from './trackerAiAccess'
import { buildTrackerAiBemergedCanonicalKbChunks } from './trackerAiBemerged'
import { buildTrackerAiBotsCanonicalKbChunks } from './trackerAiBots'
import { buildTrackerAiCalculatorDatasetCanonicalKbChunks } from './trackerAiCalculatorDatasets'
import { buildTrackerAiCardsCanonicalKbChunks } from './trackerAiCards'
import { buildTrackerAiDamageReductionCanonicalKbChunks } from './trackerAiDamageReduction'
import { buildTrackerAiChartsCanonicalKbChunks } from './trackerAiCharts'
import { buildTrackerAiDownloadsCanonicalKbChunks } from './trackerAiDownloads'
import { buildTrackerAiEulaCanonicalKbChunks } from './trackerAiEula'
import { buildTrackerAiGiveawayCanonicalKbChunks } from './trackerAiGiveaway'
import { buildTrackerAiLifetimeCanonicalKbChunks } from './trackerAiLifetime'
import { buildTrackerAiLabsCanonicalKbChunks } from './trackerAiLabs'
import { buildTrackerAiLeaderboardCanonicalKbChunks } from './trackerAiLeaderboard'
import { buildTrackerAiModulesCanonicalKbChunks } from './trackerAiModules'
import { buildTrackerAiRelicsCanonicalKbChunks } from './trackerAiRelics'
import { buildTrackerAiThornsCanonicalKbChunks } from './trackerAiThorns'
import { buildTrackerAiUptimeCanonicalKbChunks } from './trackerAiUptime'
import { buildTrackerAiUwCanonicalKbChunks } from './trackerAiUw'
import { buildTrackerAiWorkshopCanonicalKbChunks } from './trackerAiWorkshop'
import { buildTrackerAiGuildsCanonicalKbChunks } from './trackerAiGuilds'
import { buildTrackerAiGuardiansCanonicalKbChunks } from './trackerAiGuardians'
import { buildTrackerAiUserRunsCanonicalKbChunks } from './trackerAiUserRuns'
import { buildUltimateWeaponsCanonicalKbChunks } from './ultimateWeapons'
import { buildVaultCanonicalKbChunks } from './vault'
import { buildWorkshopCanonicalKbChunks } from './workshop'

export function buildTrackerAiCanonicalKbChunks(): KBChunkRecord[] {
  return [
    ...buildWorkshopCanonicalKbChunks(),
    ...buildUltimateWeaponsCanonicalKbChunks(),
    ...buildBotsCanonicalKbChunks(),
    ...buildCardsCanonicalKbChunks(),
    ...buildCurrencyCanonicalKbChunks(),
    ...buildDailyMissionsCanonicalKbChunks(),
    ...buildEnemiesCanonicalKbChunks(),
    ...buildEventsCanonicalKbChunks(),
    ...buildFootgunsCanonicalKbChunks(),
    ...buildGuidesCanonicalKbChunks(),
    ...buildGuildsCanonicalKbChunks(),
    ...buildLabsCanonicalKbChunks(),
    ...buildMilestonesCanonicalKbChunks(),
    ...buildModulesCanonicalKbChunks(),
    ...buildPerksCanonicalKbChunks(),
    ...buildRelicsCanonicalKbChunks(),
    ...buildTiersCanonicalKbChunks(),
    ...buildTournamentsCanonicalKbChunks(),
    ...buildThemesCanonicalKbChunks(),
    ...buildTrackerAiAccessCanonicalKbChunks(),
    ...buildTrackerAiBemergedCanonicalKbChunks(),
    ...buildTrackerAiBotsCanonicalKbChunks(),
    ...buildTrackerAiCalculatorDatasetCanonicalKbChunks(),
    ...buildTrackerAiCardsCanonicalKbChunks(),
    ...buildTrackerAiChartsCanonicalKbChunks(),
    ...buildTrackerAiDamageReductionCanonicalKbChunks(),
    ...buildTrackerAiDownloadsCanonicalKbChunks(),
    ...buildTrackerAiEulaCanonicalKbChunks(),
    ...buildTrackerAiGiveawayCanonicalKbChunks(),
    ...buildTrackerAiGuardiansCanonicalKbChunks(),
    ...buildTrackerAiLabsCanonicalKbChunks(),
    ...buildTrackerAiLifetimeCanonicalKbChunks(),
    ...buildTrackerAiLeaderboardCanonicalKbChunks(),
    ...buildTrackerAiModulesCanonicalKbChunks(),
    ...buildTrackerAiRelicsCanonicalKbChunks(),
    ...buildTrackerAiShardSplitterCanonicalKbChunks(),
    ...buildTrackerAiThornsCanonicalKbChunks(),
    ...buildTrackerAiUptimeCanonicalKbChunks(),
    ...buildTrackerAiUwCanonicalKbChunks(),
    ...buildTrackerAiWorkshopCanonicalKbChunks(),
    ...buildTrackerAiGuildsCanonicalKbChunks(),
    ...buildTrackerAiUserRunsCanonicalKbChunks(),
    ...buildVaultCanonicalKbChunks(),
    ...buildFaqCanonicalKbChunks(),
  ]
}
