import {
  ELITE_ENEMY_FACTS,
  ENEMIES_OVERVIEW_FACTS,
  ENEMY_LAB_FACTS,
  ENEMY_TYPE_SUMMARIES,
  FLEET_ENEMY_FACTS,
  FLEET_ENEMY_TYPE_FACTS,
  FLEET_REWARD_ROWS,
  FLEET_SPAWN_ROWS,
  NORMAL_AND_BOSS_ENEMY_FACTS,
  type EnemyTypeSummary,
  type FleetRewardRow,
  type FleetSpawnRow,
} from '@tmrxjd/platform/tools'

export interface EnemiesSourceDocument {
  overviewFacts: string[]
  normalAndBossFacts: string[]
  eliteFacts: string[]
  fleetFacts: string[]
  fleetTypeFacts: string[]
  fleetRewards: readonly FleetRewardRow[]
  fleetSpawns: readonly FleetSpawnRow[]
  enemyTypeSummaries: readonly EnemyTypeSummary[]
  labFacts: string[]
}

export function loadEnemiesSourceDocument(): EnemiesSourceDocument {
  return {
    overviewFacts: [...ENEMIES_OVERVIEW_FACTS],
    normalAndBossFacts: [...NORMAL_AND_BOSS_ENEMY_FACTS],
    eliteFacts: [...ELITE_ENEMY_FACTS],
    fleetFacts: [...FLEET_ENEMY_FACTS],
    fleetTypeFacts: [...FLEET_ENEMY_TYPE_FACTS],
    fleetRewards: FLEET_REWARD_ROWS,
    fleetSpawns: FLEET_SPAWN_ROWS,
    enemyTypeSummaries: ENEMY_TYPE_SUMMARIES,
    labFacts: [...ENEMY_LAB_FACTS],
  }
}
