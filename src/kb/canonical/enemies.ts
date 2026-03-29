import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import { loadEnemiesSourceDocument } from './enemiesSource'

function buildFleetRewardParagraphs(): string[] {
  const sourceDocument = loadEnemiesSourceDocument()
  return [
    'Fleet drops are 80% reroll shards and 20% module shards.',
    `Fleet reward table: ${sourceDocument.fleetRewards.map(row => `Tier ${row.tier}: ${row.rerollShards} reroll shards and ${row.moduleShardsPerType} module shards per type`).join('. ')}.`,
  ]
}

function buildFleetSpawnParagraphs(): string[] {
  const sourceDocument = loadEnemiesSourceDocument()
  return [
    `Fleet spawn timing: ${sourceDocument.fleetSpawns.map(row => `Tier ${row.tier}: first wave ${row.firstWave}, every ${row.repeatEveryWaves} waves${row.fleetsPerSpawn > 1 ? ` with ${row.fleetsPerSpawn} fleets` : ''}`).join('. ')}.`,
  ]
}

function buildEnemyTypeSummaryParagraphs(): string[] {
  const sourceDocument = loadEnemiesSourceDocument()
  return [
    `Enemy type summaries: ${sourceDocument.enemyTypeSummaries.map(entry => `${entry.name}: ${entry.summary}`).join('. ')}.`,
  ]
}

export function buildEnemiesCanonicalKbChunks(): KBChunkRecord[] {
  const sourceDocument = loadEnemiesSourceDocument()
  const enemiesEntry = getRequiredNamingRegistryEntryBySource('enemies', 'Enemies')

  return [
    buildAtomicKbChunk({
      chunk_id: 'enemies_overview_01',
      source: 'Enemies Platform Reference',
      section: 'Enemies',
      topic: 'Enemy Categories',
      title: 'Enemies Overview and Categories',
      disambiguation: 'This chunk is about the Enemies mechanic itself, not its interactions. It is not about specific farming guides or tracker filters.',
      data_source: enemiesEntry.data_source,
      is_base_mechanic: true,
      mechanics: ['Enemies'],
      tags: ['enemies', 'normal', 'elite', 'fleet', 'boss'],
      paragraphs: sourceDocument.overviewFacts,
    }),
    buildAtomicKbChunk({
      chunk_id: 'enemies_normal_boss_rules_01',
      source: 'Enemies Platform Reference',
      section: 'Enemies',
      topic: 'Normal and Boss Enemies',
      title: 'Normal and Boss Enemy Rules',
      disambiguation: 'This chunk is about the Normal and Boss Enemies mechanic itself, not its interactions. It is not about elite-only or fleet-only behavior.',
      data_source: getRequiredNamingRegistryEntryBySource('enemies', 'Normal and Boss Enemies').data_source,
      mechanics: ['Normal and Boss Enemies'],
      tags: ['enemies', 'bosses', 'normal enemies', 'protector'],
      paragraphs: sourceDocument.normalAndBossFacts,
    }),
    buildAtomicKbChunk({
      chunk_id: 'enemies_elite_rules_01',
      source: 'Enemies Platform Reference',
      section: 'Enemies',
      topic: 'Elite Enemies',
      title: 'Elite Enemy Rules',
      disambiguation: 'This chunk is about the Elite Enemies mechanic itself, not its interactions. It is not about general enemy caps or fleet rewards.',
      data_source: getRequiredNamingRegistryEntryBySource('enemies', 'Elite Enemies').data_source,
      mechanics: ['Elite Enemies'],
      tags: ['enemies', 'elite enemies', 'vampire', 'ray', 'scatter', 'elite cells'],
      paragraphs: sourceDocument.eliteFacts,
    }),
    buildAtomicKbChunk({
      chunk_id: 'enemies_fleet_core_01',
      source: 'Enemies Platform Reference',
      section: 'Enemies',
      topic: 'Fleet Enemies',
      title: 'Fleet Enemy Mechanics',
      disambiguation: 'This chunk is about the Fleet Enemies mechanic itself, not its interactions. It is not about the specific stats of each fleet type or their reward table.',
      data_source: getRequiredNamingRegistryEntryBySource('enemies', 'Fleet Enemies').data_source,
      mechanics: ['Fleet Enemies'],
      tags: ['enemies', 'fleet', 'saboteur', 'commander', 'overcharge'],
      paragraphs: sourceDocument.fleetFacts,
    }),
    buildAtomicKbChunk({
      chunk_id: 'enemies_fleet_types_01',
      source: 'Enemies Platform Reference',
      section: 'Enemies',
      topic: 'Fleet Enemy Types',
      title: 'Fleet Enemy Type Overview',
      disambiguation: 'This chunk is about the Fleet Enemy Types mechanic itself, not its interactions. It is not about the generic fleet rule set or spawn schedule.',
      data_source: getRequiredNamingRegistryEntryBySource('enemies', 'Fleet Enemy Types').data_source,
      mechanics: ['Fleet Enemy Types'],
      tags: ['enemies', 'fleet', 'saboteur', 'commander', 'overcharge'],
      paragraphs: sourceDocument.fleetTypeFacts,
    }),
    buildAtomicKbChunk({
      chunk_id: 'enemies_fleet_rewards_01',
      source: 'Enemies Platform Reference',
      section: 'Enemies',
      topic: 'Fleet Rewards',
      title: 'Fleet Enemy Reward Table',
      disambiguation: 'This chunk is about the Fleet Rewards mechanic itself, not its interactions. It is not about elite cells, boss drops, or module upgrade costs.',
      data_source: getRequiredNamingRegistryEntryBySource('enemies', 'Fleet Rewards').data_source,
      mechanics: ['Fleet Rewards'],
      tags: ['enemies', 'fleet', 'rewards', 'reroll shards', 'module shards'],
      paragraphs: buildFleetRewardParagraphs(),
    }),
    buildAtomicKbChunk({
      chunk_id: 'enemies_fleet_spawns_01',
      source: 'Enemies Platform Reference',
      section: 'Enemies',
      topic: 'Fleet Spawn Timing',
      title: 'Fleet Spawn Timing Table',
      disambiguation: 'This chunk is about the Fleet Spawn Timing mechanic itself, not its interactions. It is not about what fleets do once spawned.',
      data_source: getRequiredNamingRegistryEntryBySource('enemies', 'Fleet Spawn Timing').data_source,
      mechanics: ['Fleet Spawn Timing'],
      tags: ['enemies', 'fleet', 'spawn timing', 'tiers'],
      paragraphs: buildFleetSpawnParagraphs(),
    }),
    buildAtomicKbChunk({
      chunk_id: 'enemies_type_summaries_01',
      source: 'Enemies Platform Reference',
      section: 'Enemies',
      topic: 'Enemy Type Summaries',
      title: 'Enemy Type Summaries',
      disambiguation: 'This chunk is about the Enemy Type Summaries mechanic itself, not its interactions. It is not about the deeper rule tables for boss cadence or fleet resistance.',
      data_source: getRequiredNamingRegistryEntryBySource('enemies', 'Enemy Type Summaries').data_source,
      mechanics: ['Enemies'],
      tags: ['enemies', 'enemy types', 'basic', 'protector', 'vampire', 'ray', 'scatter'],
      paragraphs: buildEnemyTypeSummaryParagraphs(),
    }),
    buildAtomicKbChunk({
      chunk_id: 'enemies_lab_notes_01',
      source: 'Enemies Platform Reference',
      section: 'Enemies',
      topic: 'Enemy Labs',
      title: 'Enemy Lab Notes',
      disambiguation: 'This chunk is about the Enemy Labs mechanic itself, not its interactions. It is not about direct spawn rules or stat tables.',
      data_source: getRequiredNamingRegistryEntryBySource('enemies', 'Enemy Labs').data_source,
      mechanics: ['Enemy Labs'],
      tags: ['enemies', 'labs', 'elite enemies', 'vampire', 'ray', 'scatter'],
      paragraphs: sourceDocument.labFacts,
    }),
    buildRelationalKbChunk({
      chunk_id: 'enemies_elites_elite_cells_01',
      source: 'Enemies Platform Reference',
      section: 'Enemies',
      topic: 'Elite Enemies with Elite Cells',
      title: 'Elite Enemies with Elite Cells',
      disambiguation: 'This chunk is about the interaction between Elite Enemies and Elite Cells, not the individual mechanics. It is not about fleet rewards, gems, or unrelated lab timers.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('enemies', 'Elite Enemies').data_source,
        getRequiredNamingRegistryEntryBySource('currency', 'Elite Cells').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Elite Enemies', 'Elite Cells'],
      interaction_type: 'conditional',
      interaction_summary: 'Elite Enemies are the live combat source for Elite Cells, so elite spawn behavior directly determines elite-cell income.',
      tags: ['enemies', 'elite enemies', 'elite cells', 'currency'],
      paragraphs: [
        'Elite Enemies are the enemies that drop Elite Cells when defeated.',
        'Because Elite Cells are tied to those Vampire, Ray, and Scatter kills, elite spawn behavior and kill consistency directly control the lab-boosting currency flow.',
        'That makes Elite Enemies the combat source layer behind the Elite Cells economy.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'enemies_fleet_rewards_module_currency_01',
      source: 'Enemies Platform Reference',
      section: 'Enemies',
      topic: 'Fleet Rewards with Module Currency',
      title: 'Fleet Rewards with Module Currency',
      disambiguation: 'This chunk is about the interaction between Fleet Rewards and Module Currency, not the individual mechanics. It is not about elite cells, tournament prizes, or unrelated reroll advice.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('enemies', 'Fleet Rewards').data_source,
        getRequiredNamingRegistryEntryBySource('currency', 'Module Currency').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Fleet Rewards', 'Module Currency'],
      interaction_type: 'cross_system',
      interaction_summary: 'Fleet Rewards are one of the enemy-side sources of Module Currency because fleets drop reroll shards and module shards directly.',
      tags: ['enemies', 'fleet', 'module currency', 'reroll shards', 'module shards'],
      paragraphs: [
        'Fleet Rewards pay out reroll shards and module shards, which are the two parts of Module Currency.',
        'That means Fleet Rewards feed module progression directly instead of only acting as a generic loot table.',
        'In practice, fleets are one of the high-tier enemy systems that convert combat progression into Module Currency growth.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'enemies_fleet_spawns_tiers_01',
      source: 'Enemies Platform Reference',
      section: 'Enemies',
      topic: 'Fleet Spawn Timing with Tiers',
      title: 'Fleet Spawn Timing with Tiers',
      disambiguation: 'This chunk is about the interaction between Fleet Spawn Timing and Tiers, not the individual mechanics. It is not about battle-condition formulas, milestone unlocks, or unrelated reward systems.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('enemies', 'Fleet Spawn Timing').data_source,
        getRequiredNamingRegistryEntryBySource('tiers', 'tiers').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Fleet Spawn Timing', 'Tiers'],
      interaction_type: 'scaling',
      interaction_summary: 'Fleet Spawn Timing scales by Tiers, with higher tiers introducing fleets earlier and repeating them more often.',
      tags: ['enemies', 'fleet', 'tiers', 'spawn timing'],
      paragraphs: [
        'Fleet Spawn Timing is not fixed across all Tiers.',
        'Higher Tiers move the first fleet wave much earlier and shorten the repeat interval, which is why fleets become a much larger part of the run profile in late-tier play.',
        'That makes Tiers the system that controls how quickly Fleet Spawn Timing starts affecting combat and farming expectations.',
      ],
    }),
  ]
}
