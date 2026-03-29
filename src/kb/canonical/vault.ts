import {
  HARMONY_VAULT_TREE,
  POWER_VAULT_TREE,
  VAULT_KEY_FACTS,
  VAULT_OVERVIEW_FACTS,
  VAULT_VISIBILITY_FACTS,
  type VaultTreeDefinition,
} from '@tmrxjd/platform/tools'

import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'

type SystemSpec = {
  mechanic: string
  chunkId: string
  title: string
  tags: string[]
}

const SYSTEM_SPECS: SystemSpec[] = [
  { mechanic: 'Vault', chunkId: 'vault_overview_01', title: 'Vault Overview', tags: ['vault', 'keys', 'tech tree'] },
  { mechanic: 'Vault Visibility', chunkId: 'vault_visibility_01', title: 'Vault Visibility', tags: ['vault', 'visibility', 'legend'] },
  { mechanic: 'Vault Keys', chunkId: 'vault_keys_01', title: 'Vault Keys', tags: ['vault', 'keys', 'currency'] },
  { mechanic: 'Power Tree', chunkId: 'vault_power_tree_01', title: 'Power Tree', tags: ['vault', 'power tree', 'tower buffs'] },
  { mechanic: 'Harmony Tree', chunkId: 'vault_harmony_tree_01', title: 'Harmony Tree', tags: ['vault', 'harmony tree', 'qol'] },
  { mechanic: 'Vault Tracker Progress', chunkId: 'vault_tracker_progress_01', title: 'Vault Tracker Stats and Spent Keys', tags: ['vault', 'tracker', 'stats', 'spent keys', 'user data'] },
]

function buildTreeParagraphs(tree: VaultTreeDefinition): string[] {
  const sampleNodes = tree.nodes.slice(0, 5).map(node => node.name).join(', ')
  return [
    tree.description,
    `${tree.label} contains ${tree.nodeCount} nodes, starts from ${tree.rootNodeLabels.join(', ')}, and has node costs ranging from ${tree.minimumNodeCost} to ${tree.maximumNodeCost} keys.`,
    `${tree.label} total listed key cost across all node tiers is ${tree.totalKeyCost}. Example nodes include ${sampleNodes}.`,
  ]
}

function buildAtomicParagraphs(mechanic: string): string[] {
  switch (mechanic) {
    case 'Vault':
      return [...VAULT_OVERVIEW_FACTS]
    case 'Vault Visibility':
      return [...VAULT_VISIBILITY_FACTS]
    case 'Vault Keys':
      return [...VAULT_KEY_FACTS]
    case 'Power Tree':
      return buildTreeParagraphs(POWER_VAULT_TREE)
    case 'Harmony Tree':
      return buildTreeParagraphs(HARMONY_VAULT_TREE)
    case 'Vault Tracker Progress':
      return [
        'The Vault tracker stores the player recorded vault state, including tracked levels, spent keys, flips, and the active tracker tab.',
        'Questions about current vault stats or how many keys have already been invested should be grounded in the vault tracker record rather than answered as generic wiki knowledge.',
        'This chunk is about user-recorded vault state, not general Vault unlock rules or the content of the Power Tree and Harmony Tree themselves.',
      ]
    default:
      return []
  }
}

export function buildVaultCanonicalKbChunks(): KBChunkRecord[] {
  const vaultEntry = getRequiredNamingRegistryEntryBySource('vault', 'vault')

  const atomicChunks = SYSTEM_SPECS.map(spec => {
    const namingEntry = spec.mechanic === 'Vault'
      ? vaultEntry
      : getRequiredNamingRegistryEntryBySource('vault', spec.mechanic)

    return buildAtomicKbChunk({
      chunk_id: spec.chunkId,
      source: spec.mechanic === 'Vault Tracker Progress' ? 'Tracker Website Vault Tracker' : 'Vault Platform Reference',
      section: 'Vault',
      topic: spec.mechanic,
      title: spec.title,
      disambiguation: `This chunk is about the ${spec.mechanic} mechanic itself, not its interactions. It is not about unrelated tracker pages, generic currencies, or non-vault systems outside this mechanic.`,
      data_source: namingEntry.data_source,
      is_base_mechanic: spec.mechanic === 'Vault',
      mechanics: [spec.mechanic],
      tags: spec.tags,
      paragraphs: buildAtomicParagraphs(spec.mechanic),
    })
  })

  return [
    ...atomicChunks,
    buildRelationalKbChunk({
      chunk_id: 'vault_power_harmony_trees_01',
      source: 'Vault Platform Reference',
      section: 'Vault',
      topic: 'Vault with Power Tree and Harmony Tree',
      title: 'Vault with Power Tree and Harmony Tree',
      disambiguation: 'This chunk is about the interaction between Vault, Power Tree, and Harmony Tree, not the individual mechanics. It is not about tracker state, unrelated currencies, or non-vault upgrade systems.',
      data_source: [
        vaultEntry.data_source,
        getRequiredNamingRegistryEntryBySource('vault', 'Power Tree').data_source,
        getRequiredNamingRegistryEntryBySource('vault', 'Harmony Tree').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Vault', 'Power Tree', 'Harmony Tree'],
      interaction_type: 'conditional',
      interaction_summary: 'Vault is the parent system that contains both the Power Tree and Harmony Tree, with each tree specializing in a different upgrade role.',
      tags: ['vault', 'power tree', 'harmony tree', 'tech tree'],
      paragraphs: [
        'Vault is the umbrella system that contains both the Power Tree and the Harmony Tree.',
        'Power Tree is the tower-buff side of Vault, while Harmony Tree focuses on non-tower utility, automation, discounts, and quality-of-life unlocks.',
        'Together they form one branching key-spend system rather than two unrelated upgrade menus.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'vault_keys_tournament_rewards_01',
      source: 'Vault Platform Reference',
      section: 'Vault',
      topic: 'Vault with Vault Keys and Tournament Rewards',
      title: 'Vault with Vault Keys and Tournament Rewards',
      disambiguation: 'This chunk is about the interaction between Vault, Vault Keys, and Tournament Rewards, not the individual mechanics. It is not about gems, stones, or unrelated guild currencies.',
      data_source: [
        vaultEntry.data_source,
        getRequiredNamingRegistryEntryBySource('vault', 'Vault Keys').data_source,
        getRequiredNamingRegistryEntryBySource('tournaments', 'Tournament Rewards').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Vault', 'Vault Keys', 'Tournament Rewards'],
      interaction_type: 'cross_system',
      interaction_summary: 'Vault spends Keys, and Tournament Rewards in Legends League are the progression path that supplies those Keys.',
      tags: ['vault', 'keys', 'tournaments', 'legend'],
      paragraphs: [
        'Vault upgrades consume Vault Keys inside the Power Tree and Harmony Tree.',
        'Tournament Rewards from Legends League placement are the progression path that supplies those Keys.',
        'That makes top-end tournament performance the external resource gate on long-term Vault progression.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'vault_visibility_tournaments_01',
      source: 'Vault Platform Reference',
      section: 'Vault',
      topic: 'Vault Visibility with Tournaments',
      title: 'Vault Visibility with Tournaments',
      disambiguation: 'This chunk is about the interaction between Vault Visibility and Tournaments, not the individual mechanics. It is not about key costs, tracker state, or unrelated home-screen menus.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('vault', 'Vault Visibility').data_source,
        getRequiredNamingRegistryEntryBySource('tournaments', 'tournaments').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Vault Visibility', 'Tournaments'],
      interaction_type: 'conditional',
      interaction_summary: 'Vault Visibility is gated by promotion into Legends League, so the menu appears only after high-end tournament progression is reached.',
      tags: ['vault', 'visibility', 'tournaments', 'legend'],
      paragraphs: [
        'Vault Visibility is not available from the start of account progression.',
        'Instead, Tournaments gate the menu because the Vault becomes visible only after promotion into Legends League.',
        'This means the home-screen Vault entry is unlocked by competitive tournament progression, not by coins, gems, or milestone wave clears.',
      ],
    }),
  ]
}
