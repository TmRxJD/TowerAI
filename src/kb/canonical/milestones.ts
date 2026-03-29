import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import { loadMilestonesSourceDocument } from './milestonesSource'

type SystemSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

const SYSTEM_SPECS: SystemSpec[] = [
  { mechanic: 'Milestones', chunkId: 'milestones_overview_01', title: 'Milestones Overview', tags: ['milestones', 'progression', 'unlock'] },
  { mechanic: 'Milestone Standard Track', chunkId: 'milestones_standard_track_01', title: 'Milestone Standard Track', tags: ['milestones', 'standard', 'unlock'] },
  { mechanic: 'Milestone Premium Track', chunkId: 'milestones_premium_track_01', title: 'Milestone Premium Track', tags: ['milestones', 'premium', 'rewards'] },
  { mechanic: 'Milestone Tier Progression', chunkId: 'milestones_tier_progression_01', title: 'Milestone Tier Progression', tags: ['milestones', 'tiers', 'unlock'] },
  { mechanic: 'Milestone Tier Totals', chunkId: 'milestones_tier_totals_01', title: 'Milestone Tier Totals', tags: ['milestones', 'totals', 'coins', 'gems', 'stones'] },
]

function formatTrackLabel(track: 'standard' | 'premium'): string {
  return track === 'standard' ? 'Standard' : 'Premium'
}

function buildMilestonesOverviewParagraphs(): string[] {
  const sourceDocument = loadMilestonesSourceDocument()
  const importantUnlocks = [
    ['Labs', 'T1 W30'],
    ['Tournaments', 'T1 W60'],
    ['Events', 'T1 W70'],
    ['Modules', 'T2 W90'],
    ['Unlock Perks', 'T2 W150'],
    ['Guilds', 'T3 W10'],
    ['Workshop Respec', 'T4 W30'],
    ['Ban Perks', 'T5 W40'],
    ['Extra Orb Adjuster', 'T6 W50'],
    ['Wall Health', 'T8 W10'],
    ['Workshop Enhancement', 'T12 W60'],
    ['Shatter Shards', 'T16 W40'],
    ['Card Mastery Unlock', 'T16 W100'],
    ['Assist Module', 'T19 W40'],
    ['Group 4 BC Labs', 'T21 W100'],
  ]

  return [
    ...sourceDocument.overviewParagraphs,
    `Core system unlocks on the standard track include ${importantUnlocks.map(([reward, location]) => `${reward} (${location})`).join(', ')}.`,
  ]
}

function buildStandardTrackParagraphs(): string[] {
  const sourceDocument = loadMilestonesSourceDocument()
  const standardUnlockRows = sourceDocument.keyUnlockRows.filter(row => row.track === 'standard')
  const earlyUnlocks = standardUnlockRows
    .filter(row => row.tier <= 6)
    .slice(0, 12)
    .map(row => `${row.reward} at T${row.tier} W${row.wave}`)

  const lateUnlocks = standardUnlockRows
    .filter(row => row.tier >= 12)
    .slice(0, 8)
    .map(row => `${row.reward} at T${row.tier} W${row.wave}`)

  return [
    'The standard milestone track is the main progression path for permanent feature unlocks, tier advancement, and many system-level power spikes.',
    `Early standard-track unlocks include ${earlyUnlocks.join(', ')}.`,
    `Later standard-track unlocks continue with ${lateUnlocks.join(', ')}.`,
  ]
}

function buildPremiumTrackParagraphs(): string[] {
  const sourceDocument = loadMilestonesSourceDocument()
  const premiumCosmetics = sourceDocument.tierTracks
    .filter(track => track.track === 'premium')
    .flatMap(track => track.waveRewards
      .filter(waveReward => waveReward.wave === 2500)
      .flatMap(waveReward => waveReward.rewards
        .filter(reward => !/(coins|gems|stones)$/i.test(reward))
        .map(reward => `${reward} (T${track.tier})`)))
    .slice(0, 8)

  const tier21PremiumTotals = sourceDocument.totalRows.find(row => row.tier === 21 && row.track === 'premium')
  return [
    'The premium milestone track stays separate from the standard unlock path and mainly adds extra resource payouts, cosmetics, and end-of-tier relic-style rewards.',
    tier21PremiumTotals
      ? `At the top end, Tier 21 premium alone totals ${tier21PremiumTotals.coinsText}, ${tier21PremiumTotals.gemsText}, and ${tier21PremiumTotals.stonesText}.`
      : 'Premium milestone totals stay materially higher than standard totals at the same tier.',
    `Premium cosmetic rewards include ${premiumCosmetics.join(', ')}.`,
  ]
}

function buildTierProgressionParagraphs(): string[] {
  const sourceDocument = loadMilestonesSourceDocument()
  const earlyTierUnlocks = sourceDocument.tierUnlockRows
    .filter(row => row.tier <= 14 && row.track === 'standard')
    .map(row => `${row.reward} at T${row.tier} W${row.wave}`)

  const lateTierUnlocks = sourceDocument.tierUnlockRows
    .filter(row => row.tier >= 15 && row.track === 'standard')
    .map(row => `${row.reward} at T${row.tier} W${row.wave}`)

  return [
    'Milestone tier progression determines when the next tier becomes playable, so it controls when the account can start accessing that next tier\'s unlock table.',
    `Early tier progression follows ${earlyTierUnlocks.join(', ')}.`,
    `Late tier progression shifts to wave 300 and follows ${lateTierUnlocks.join(', ')}.`,
  ]
}

function buildTierTotalsParagraphs(): string[] {
  const sourceDocument = loadMilestonesSourceDocument()
  const showcaseTiers = [1, 10, 16, 21]
  return showcaseTiers.flatMap(tier => {
    const standardRow = sourceDocument.totalRows.find(row => row.tier === tier && row.track === 'standard')
    const premiumRow = sourceDocument.totalRows.find(row => row.tier === tier && row.track === 'premium')
    if (!standardRow || !premiumRow) return []

    return [
      `Tier ${tier} totals: ${formatTrackLabel('standard')} gives ${standardRow.coinsText}, ${standardRow.gemsText}, and ${standardRow.stonesText}, while ${formatTrackLabel('premium')} gives ${premiumRow.coinsText}, ${premiumRow.gemsText}, and ${premiumRow.stonesText}.`,
    ]
  })
}

function buildAtomicParagraphs(mechanic: string): string[] {
  switch (mechanic) {
    case 'Milestones':
      return buildMilestonesOverviewParagraphs()
    case 'Milestone Standard Track':
      return buildStandardTrackParagraphs()
    case 'Milestone Premium Track':
      return buildPremiumTrackParagraphs()
    case 'Milestone Tier Progression':
      return buildTierProgressionParagraphs()
    case 'Milestone Tier Totals':
      return buildTierTotalsParagraphs()
    default:
      return []
  }
}

export function buildMilestonesCanonicalKbChunks(): KBChunkRecord[] {
  const milestonesEntry = getRequiredNamingRegistryEntryBySource('milestones', 'milestones')

  const systemChunks = SYSTEM_SPECS.map(spec => {
    const namingEntry = spec.mechanic === 'Milestones'
      ? milestonesEntry
      : getRequiredNamingRegistryEntryBySource('milestones', spec.mechanic)

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'Milestones Platform Reference',
      section: 'Milestones',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about unrelated tracker state, individual lab formulas, or non-milestone reward systems.`,
      data_source: namingEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Milestones',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: buildAtomicParagraphs(spec.mechanic),
    })
  })

  return [
    ...systemChunks,
    buildRelationalKbChunk({
      chunk_id: 'milestones_standard_premium_tracks_01',
      source: 'Milestones Platform Reference',
      section: 'Milestones',
      topic: 'Milestone Standard Track with Milestone Premium Track',
      title: 'Milestone Standard Track with Milestone Premium Track',
      disambiguation: 'This chunk is about the interaction between the Standard and Premium milestone tracks, not the individual mechanics. It is not about unrelated event boosters, lab costs, or tracker UI features.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('milestones', 'Milestone Standard Track').data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'Milestone Premium Track').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Milestone Standard Track', 'Milestone Premium Track'],
      interaction_type: 'conditional',
      interaction_summary: 'Each milestone tier has separate Standard and Premium tracks, with Standard carrying most unlocks and Premium adding extra resources and cosmetics.',
      tags: ['milestones', 'standard', 'premium', 'rewards'],
      paragraphs: [
        'Every milestone tier has both a Standard track and a Premium track at the same wave breakpoints.',
        'The Standard track is where most permanent gameplay unlocks live, including tier advancement and major system unlocks.',
        'The Premium track does not replace those unlocks. It adds extra coins, gems, stones, cosmetics, and high-tier relic-style rewards on top of the Standard ladder.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'milestones_progression_totals_01',
      source: 'Milestones Platform Reference',
      section: 'Milestones',
      topic: 'Milestone Tier Progression with Milestone Tier Totals',
      title: 'Milestone Tier Progression with Milestone Tier Totals',
      disambiguation: 'This chunk is about the interaction between Milestone Tier Progression and Milestone Tier Totals, not the individual mechanics. It is not about event medals, guild tokens, or unrelated unlock trees.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('milestones', 'Milestone Tier Progression').data_source,
        getRequiredNamingRegistryEntryBySource('milestones', 'Milestone Tier Totals').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Milestone Tier Progression', 'Milestone Tier Totals'],
      interaction_type: 'scaling',
      interaction_summary: 'Higher milestone tiers both unlock later progression and increase the total resource payouts available on each track.',
      tags: ['milestones', 'tiers', 'totals', 'progression'],
      paragraphs: [
        'Milestone Tier Progression controls when the next tier opens, while Milestone Tier Totals describe how much resource value each tier pays out on Standard and Premium.',
        'Early progression uses wave 100 tier unlocks, but late progression moves to wave 300 before the next tier opens.',
        'As tiers rise, total coins, gems, and stones per track also rise, which is why late milestone tiers matter for both account progression and long-run resource income.',
      ],
    }),
  ]
}
