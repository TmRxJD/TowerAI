import { BOT_UPGRADES_DATA as bots } from '@tmrxjd/platform/tools'
import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import { type EventSourceEntry, loadEventsSourceDocument } from './eventsSource'

type SystemSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
  preferredKeys: string[]
}

const EVENT_BOT_NAMES = bots.map(bot => bot.name)

const SYSTEM_SPECS: SystemSpec[] = [
  { mechanic: 'Events', chunkId: 'events_overview_01', title: 'Events Overview', tags: ['events', 'medals', 'progression'], preferredKeys: ['Behavior'] },
  { mechanic: 'Event Cycle', chunkId: 'events_cycle_01', title: 'Event Cycle', tags: ['events', 'schedule'], preferredKeys: ['Behavior'] },
  { mechanic: 'Event Missions', chunkId: 'events_missions_01', title: 'Event Missions', tags: ['events', 'missions'], preferredKeys: ['Behavior'] },
  { mechanic: 'Event Mission Tiers', chunkId: 'events_mission_tiers_01', title: 'Event Mission Tiers', tags: ['events', 'missions', 'medals'], preferredKeys: ['Behavior'] },
  { mechanic: 'Event Mission Rollout', chunkId: 'events_mission_rollout_01', title: 'Event Mission Rollout', tags: ['events', 'missions', 'schedule'], preferredKeys: ['Behavior'] },
  { mechanic: 'Event Rewards', chunkId: 'events_rewards_01', title: 'Event Rewards', tags: ['events', 'rewards', 'medals'], preferredKeys: ['Behavior'] },
  { mechanic: 'Event Booster', chunkId: 'events_booster_01', title: 'Event Booster', tags: ['events', 'booster', 'medals'], preferredKeys: ['Behavior'] },
  { mechanic: 'Event Relic Progress', chunkId: 'events_relic_progress_01', title: 'Event Relic Progress', tags: ['events', 'relics', 'thresholds'], preferredKeys: ['Behavior'] },
  { mechanic: 'Event Shop', chunkId: 'events_shop_01', title: 'Event Shop', tags: ['events', 'shop', 'medals'], preferredKeys: ['Behavior'] },
  { mechanic: 'Event Shop Currency Purchases', chunkId: 'events_shop_currency_01', title: 'Event Shop Currency Purchases', tags: ['events', 'shop', 'medals', 'gems', 'stones', 'shards'], preferredKeys: ['Behavior', 'Costs'] },
  { mechanic: 'Event Themes', chunkId: 'events_themes_01', title: 'Event Themes', tags: ['events', 'themes', 'medals'], preferredKeys: ['Behavior'] },
  { mechanic: 'Event Relics', chunkId: 'events_relics_01', title: 'Event Relics', tags: ['events', 'relics', 'medals'], preferredKeys: ['Behavior'] },
  { mechanic: 'Event Songs', chunkId: 'events_songs_01', title: 'Event Songs', tags: ['events', 'songs', 'medals'], preferredKeys: ['Behavior'] },
  { mechanic: 'Event Store Bots', chunkId: 'events_store_bots_01', title: 'Event Store Bots', tags: ['events', 'bots', 'shop', 'medals'], preferredKeys: ['Behavior'] },
  { mechanic: 'Event Bot Unlock Costs', chunkId: 'events_bot_unlock_costs_01', title: 'Event Bot Unlock Costs', tags: ['events', 'bots', 'unlock costs', 'medals'], preferredKeys: ['Behavior'] },
  { mechanic: 'Bot Respec', chunkId: 'events_bot_respec_01', title: 'Bot Respec', tags: ['events', 'bots', 'respec', 'gems'], preferredKeys: ['Behavior'] },
]

function buildMetadataParagraph(entry: EventSourceEntry): string | null {
  const parts = [
    entry.sections.Type ? `Type: ${entry.sections.Type}` : '',
    entry.sections.Domain ? `Domain: ${entry.sections.Domain}` : '',
    entry.sections.Section ? `Section: ${entry.sections.Section}` : '',
    entry.sections.Category ? `Category: ${entry.sections.Category}` : '',
    entry.sections.Aliases && !/^none\.?$/i.test(entry.sections.Aliases) ? `Aliases: ${entry.sections.Aliases}` : '',
  ].filter(Boolean)

  return parts.length > 0 ? `${parts.join('. ')}.` : null
}

function ensureAtomicDisambiguation(value: string): string {
  if (/mechanic itself,? not its interactions/i.test(value)) {
    return value
  }

  return `${value} This chunk describes the mechanic itself, not its interactions.`
}

function readAtomicDisambiguation(entry: EventSourceEntry | undefined, fallback: string): string {
  const value = entry?.sections.Disambiguation
  return ensureAtomicDisambiguation(value ? value.replace(/\n+/g, ' ') : fallback)
}

function buildParagraphs(entry: EventSourceEntry, preferredKeys: string[]): string[] {
  const paragraphs: string[] = []

  if (entry.sections.Definition) {
    paragraphs.push(`Definition: ${entry.sections.Definition}`)
  }

  const metadataParagraph = buildMetadataParagraph(entry)
  if (metadataParagraph) {
    paragraphs.push(metadataParagraph)
  }

  for (const key of preferredKeys) {
    const value = entry.sections[key]
    if (value && !/^none\.?$/i.test(value.trim())) {
      paragraphs.push(`${key}: ${value}`)
    }
  }

  return paragraphs
}

export function buildEventsCanonicalKbChunks(): KBChunkRecord[] {
  const sourceDocument = loadEventsSourceDocument()
  const eventsEntry = getRequiredNamingRegistryEntryBySource('events', 'events')
  const entryByMechanic = new Map(sourceDocument.deterministicEntries.map(entry => [entry.mechanic, entry]))

  const systemChunks = SYSTEM_SPECS.map(spec => {
    const entry = entryByMechanic.get(spec.mechanic)
    if (!entry) {
      throw new Error(`Events structured source is missing the ${spec.mechanic} mechanic entry.`)
    }

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: 'Events Structured Reference',
      section: 'Events',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: readAtomicDisambiguation(entry, `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about unrelated tracker state, implementation details, or other game systems.`),
      data_source: eventsEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Events',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: spec.mechanic === 'Events'
        ? [...sourceDocument.overviewParagraphs, ...buildParagraphs(entry, spec.preferredKeys)]
        : buildParagraphs(entry, spec.preferredKeys),
    })
  })

  return [
    ...systemChunks,
    buildRelationalKbChunk({
      chunk_id: 'events_unlock_milestones_01',
      source: 'Events Structured Reference',
      section: 'Events',
      topic: 'Events with Milestones',
      title: 'Events with Milestones',
      disambiguation: 'This chunk is about the interaction between Events and Milestones, not the individual mechanics. It is not about mission rewards, bot upgrade values, or unrelated unlock systems.',
      data_source: eventsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Events', 'Milestones'],
      interaction_type: 'conditional',
      interaction_summary: 'Milestones gate when Events become available by unlocking the system at Tier 1 Wave 70.',
      tags: ['events', 'milestones', 'unlock'],
      paragraphs: [
        'Events do not exist for a run until the Milestones unlock at Tier 1 Wave 70 has been reached.',
        'That makes Milestones the gate that turns on the entire Events system, including missions, medal rewards, relic thresholds, and the event shop.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'events_cycle_missions_rollout_01',
      source: 'Events Structured Reference',
      section: 'Events',
      topic: 'Event Cycle with Event Missions and Event Mission Rollout',
      title: 'Event Cycle with Event Missions and Event Mission Rollout',
      disambiguation: 'This chunk is about the interaction between Event Cycle, Event Missions, and Event Mission Rollout, not the individual mechanics. It is not about medal thresholds, bot respec, or unrelated schedules.',
      data_source: eventsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Event Cycle', 'Event Missions', 'Event Mission Rollout'],
      interaction_type: 'conditional',
      interaction_summary: 'Event Cycle determines when Event Missions are active, and Event Mission Rollout decides how many of those missions appear across the first eight days.',
      tags: ['events', 'missions', 'schedule'],
      paragraphs: [
        'Event Missions are only meaningful inside the active Event Cycle window.',
        'During that cycle, Event Mission Rollout starts with seven missions on day one and then adds two more missions per day for the next seven days.',
        'The final six days keep the same Event Missions list without adding new missions, so Event Cycle timing controls how much mission inventory is available at any given point.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'events_rewards_booster_relic_progress_01',
      source: 'Events Structured Reference',
      section: 'Events',
      topic: 'Event Rewards with Event Booster and Event Relic Progress',
      title: 'Event Rewards with Event Booster and Event Relic Progress',
      disambiguation: 'This chunk is about the interaction between Event Rewards, Event Booster, and Event Relic Progress, not the individual mechanics. It is not about shop purchases, bot stat lines, or unrelated premium systems.',
      data_source: eventsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Event Rewards', 'Event Booster', 'Event Relic Progress'],
      interaction_type: 'conditional',
      interaction_summary: 'Event Rewards generate the medals, Event Booster doubles those medals for the active event, and both feed the current-event thresholds used by Event Relic Progress.',
      tags: ['events', 'rewards', 'booster', 'relics', 'medals'],
      paragraphs: [
        'Event Rewards are the medal payouts earned from completing mission tiers.',
        'If Event Booster is active, those earned medals are doubled for that event instead of staying at the base tier values.',
        'Those current-event earned medals then push Event Relic Progress toward the 350, 550, 700, and 1100 medal thresholds, while carried-over medals and daily mission box medals do not count for that threshold track.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'events_shop_currency_medals_01',
      source: 'Events Structured Reference',
      section: 'Events',
      topic: 'Event Shop with Event Shop Currency Purchases and Medals',
      title: 'Event Shop with Event Shop Currency Purchases and Medals',
      disambiguation: 'This chunk is about the interaction between Event Shop, Event Shop Currency Purchases, and Medals, not the individual mechanics. It is not about relic threshold progress, bot cooldown stats, or unrelated currencies.',
      data_source: eventsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Event Shop', 'Event Shop Currency Purchases', 'Medals'],
      interaction_type: 'conditional',
      interaction_summary: 'Event Shop spends Medals, and Event Shop Currency Purchases define the exchange outputs and escalating medal costs for those currency buys.',
      tags: ['events', 'shop', 'medals', 'gems', 'stones', 'shards'],
      paragraphs: [
        'The Event Shop is the place where Medals are spent rather than merely accumulated for thresholds.',
        'Event Shop Currency Purchases define the actual exchange outputs such as 150 gems, 15 stones, or 250 shards together with the rising medal-cost ladder.',
        'Because shard purchases increase costs across shard types, the value of Medals inside the Event Shop changes as more Event Shop Currency Purchases are made during the current event cycle.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'events_shop_themes_relics_songs_01',
      source: 'Events Structured Reference',
      section: 'Events',
      topic: 'Event Shop with Event Themes, Event Relics, and Event Songs',
      title: 'Event Shop with Event Themes, Event Relics, and Event Songs',
      disambiguation: 'This chunk is about the interaction between Event Shop, Event Themes, Event Relics, and Event Songs, not the individual mechanics. It is not about bot unlock costs, mission tiers, or unrelated cosmetic systems.',
      data_source: eventsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Event Shop', 'Event Themes', 'Event Relics', 'Event Songs'],
      interaction_type: 'conditional',
      interaction_summary: 'Event Shop is the store layer that sells Event Themes, Event Relics, and Event Songs for medals, with each category following its own availability and permanence rules.',
      tags: ['events', 'shop', 'themes', 'relics', 'songs'],
      paragraphs: [
        'Event Themes, Event Relics, and Event Songs are all medal sinks inside the Event Shop rather than threshold rewards from Event Relic Progress.',
        'Event Themes rotate by event and remain permanently available once purchased, Event Relics can be limited to the sponsoring event, and Event Songs stay non-rotating with a fixed coin-bonus role.',
        'That means the Event Shop is the shared parent system, while each of those three purchase categories applies its own permanence and rotation rules to how medals are converted into long-term account value.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'events_store_bots_bots_medals_01',
      source: 'Events Structured Reference',
      section: 'Events',
      topic: 'Event Store Bots with Bots and Medals',
      title: 'Event Store Bots with Bots and Medals',
      disambiguation: 'This chunk is about the interaction between Event Store Bots, Bots, and Medals, not the individual mechanics. It is not about per-bot stat breakpoints, relic progress thresholds, or unrelated stores.',
      data_source: ['events', 'bots'],
      is_base_mechanic: false,
      mechanics: ['Event Store Bots', 'Bots', 'Medals'],
      interaction_type: 'conditional',
      interaction_summary: 'Event Store Bots is the medal-purchase path, while Bots is the actual permanent progression system those purchases unlock.',
      tags: ['events', 'bots', 'shop', 'medals', ...EVENT_BOT_NAMES.map(name => name.toLowerCase())],
      paragraphs: [
        `Event Store Bots is the event-shop category that sells the permanent bot roster: ${EVENT_BOT_NAMES.join(', ')}.`,
        'Medals are the resource consumed to unlock those bots from the event store.',
        'Once unlocked, the purchased bot moves into the Bots progression system instead of resetting away with the current event.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'events_store_bots_unlock_costs_01',
      source: 'Events Structured Reference',
      section: 'Events',
      topic: 'Event Store Bots with Event Bot Unlock Costs',
      title: 'Event Store Bots with Event Bot Unlock Costs',
      disambiguation: 'This chunk is about the interaction between Event Store Bots and Event Bot Unlock Costs, not the individual mechanics. It is not about upgrade-medal costs after unlock, relic shop pricing, or unrelated trackers.',
      data_source: eventsEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Event Store Bots', 'Event Bot Unlock Costs'],
      interaction_type: 'scaling',
      interaction_summary: 'Event Store Bots uses Event Bot Unlock Costs to scale each new bot unlock higher than the previous one.',
      tags: ['events', 'bots', 'unlock costs', 'medals'],
      paragraphs: [
        'Event Store Bots is not priced with a flat unlock fee for every bot.',
        'Instead, Event Bot Unlock Costs climbs from 150 to 300 to 600 to 900 medals as more bot unlocks are purchased.',
        'That makes the order of bot unlocks matter because each new Event Store Bots purchase permanently raises the medal cost of the next unlock.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'events_bots_respec_gems_01',
      source: 'Events Structured Reference',
      section: 'Events',
      topic: 'Bot Respec with Event Store Bots and Gems',
      title: 'Bot Respec with Event Store Bots and Gems',
      disambiguation: 'This chunk is about the interaction between Bot Respec, Event Store Bots, and Gems, not the individual mechanics. It is not about mission payouts, event booster value, or unrelated refund systems.',
      data_source: ['events', 'bots'],
      is_base_mechanic: false,
      mechanics: ['Bot Respec', 'Event Store Bots', 'Gems'],
      interaction_type: 'conditional',
      interaction_summary: 'Bot Respec spends Gems once per event to refund medal-based Event Store Bots unlocks and medal-based upgrades without refunding bot labs.',
      tags: ['events', 'bots', 'respec', 'gems'],
      paragraphs: [
        'Bot Respec is the reset path for the permanent bot progression that originally came from Event Store Bots purchases.',
        'The reset costs 300 Gems and is limited to once per event.',
        'Only medal-based unlocks and medal-based bot upgrades are refunded, while bot labs remain outside the Bot Respec refund path.',
      ],
    }),
  ]
}
