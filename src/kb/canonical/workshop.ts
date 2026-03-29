import {
  MODULE_SUBSTAT_CANONICAL_DATA,
  powerTreeNodes,
  STANDARD_PERKS,
  TRADE_OFF_PERKS,
  type ModuleSubstatCanonicalCategory,
  type ModuleSubstatCanonicalDefinition,
} from '@tmrxjd/platform/tools'
import { getRequiredNamingRegistryEntryBySource } from './namingRegistry'
import { buildAtomicKbChunk, buildRelationalKbChunk, type KBChunkRecord } from './shared'
import {
  loadWorkshopSourceDocument,
  type WorkshopDeterministicStatEntry,
  type WorkshopEnhancementCategory,
  type WorkshopEnhancementSourceEntry,
} from './workshopSource'
import { getWorkshopSiteStatDefinitions, type WorkshopCategory, type WorkshopStatDefinition } from './workshopSiteData'
import RELIC_TEMPLATES from '../../game-data/relic-data'
import { type Lab, labs as LABS } from '@tmrxjd/platform/tools'
import { CARD_TEMPLATES, type CardTemplate } from '../../game-data/card-data'
import {
  COMMON_MODULE_TEMPLATES,
  type ModuleCategory,
  type ModuleTemplate,
  RARE_MODULE_TEMPLATES,
  UNIQUE_MODULE_TEMPLATES,
} from '../../game-data/module-data'

type EnhancementDefinition = {
  sourceName: string
  title: string
  mechanic: string
  key: string
}

const ENHANCEMENT_DEFINITIONS: EnhancementDefinition[] = [
  { sourceName: 'Damage', title: 'Damage Enhancement', mechanic: 'Damage Enhancement', key: 'WSP_DAMAGE' },
  { sourceName: 'Rend Armor', title: 'Rend Armor Enhancement', mechanic: 'Rend Armor Enhancement', key: 'WSP_REND_ARMOR' },
  { sourceName: 'Critical Factor', title: 'Critical Factor Enhancement', mechanic: 'Critical Factor Enhancement', key: 'WSP_CRITICAL_FACTOR' },
  { sourceName: 'Damage/Meter', title: 'Damage / Meter Enhancement', mechanic: 'Damage / Meter Enhancement', key: 'WSP_DAMAGE_PER_METER' },
  { sourceName: 'Super Crit Multi', title: 'Super Crit Mult Enhancement', mechanic: 'Super Crit Mult Enhancement', key: 'WSP_SUPER_CRIT_MULTI' },
  { sourceName: 'Attack Speed', title: 'Attack Speed Enhancement', mechanic: 'Attack Speed Enhancement', key: 'WSP_ATTACK_SPEED' },
  { sourceName: 'Health', title: 'Health Enhancement', mechanic: 'Health Enhancement', key: 'WSP_HEALTH' },
  { sourceName: 'Health Regen', title: 'Health Regen Enhancement', mechanic: 'Health Regen Enhancement', key: 'WSP_HEALTH_REGEN' },
  { sourceName: 'Defense Absolute', title: 'Defense Absolute Enhancement', mechanic: 'Defense Absolute Enhancement', key: 'WSP_DEFENSE_ABSOLUTE' },
  { sourceName: 'Land Mine Damage', title: 'Land Mine Damage Enhancement', mechanic: 'Land Mine Damage Enhancement', key: 'WSP_LAND_MINE_DAMAGE' },
  { sourceName: 'Wall Health', title: 'Wall Health Enhancement', mechanic: 'Wall Health Enhancement', key: 'WSP_WALL_HEALTH' },
  { sourceName: 'Orb Size', title: 'Orb Size Enhancement', mechanic: 'Orb Size Enhancement', key: 'WSP_ORB_SIZE' },
  { sourceName: 'Cash Bonus', title: 'Cash Bonus Enhancement', mechanic: 'Cash Bonus Enhancement', key: 'WSP_CASH_BONUS' },
  { sourceName: 'Coin Bonus', title: 'Coin Bonus Enhancement', mechanic: 'Coin Bonus Enhancement', key: 'WSP_COIN_BONUS' },
  { sourceName: 'Cells/Kill Bonus', title: 'Cells / Kill Bonus Enhancement', mechanic: 'Cells / Kill Bonus Enhancement', key: 'WSP_CELLS_PER_KILL_BONUS' },
  { sourceName: 'Free Upgrades', title: 'Free Upgrades Enhancement', mechanic: 'Free Upgrades Enhancement', key: 'WSP_FREE_UPGRADES' },
  { sourceName: 'Packages', title: 'Recovery Package Enhancement', mechanic: 'Recovery Package Enhancement', key: 'WSP_RECOVERY_PACKAGE' },
  { sourceName: 'Enemy Level Skips', title: 'Enemy Level Skip Enhancement', mechanic: 'Enemy Level Skip Enhancement', key: 'WSP_ENEMY_LEVEL_SKIP' },
]

const CATEGORY_TITLES: Record<WorkshopEnhancementCategory, string> = {
  attack: 'Attack',
  defense: 'Defense',
  utility: 'Utility',
}

const WORKSHOP_CATEGORY_TITLES: Record<WorkshopCategory, string> = {
  attack: 'Attack',
  defense: 'Defense',
  utility: 'Utility',
}

const MODULE_FAMILY_TITLES: Record<ModuleSubstatCanonicalCategory, string> = {
  Cannon: 'Cannon',
  Defense: 'Armor',
  Generator: 'Generator',
  Core: 'Core',
}

type WorkshopSupportPerkMatch = {
  pool: 'standard' | 'tradeoff'
  sourcePerk: string
  displayName: string
}

type SupportTextEntry = {
  label: string
  description: string
  dataSource: string
}

const MODULE_SUBSTAT_SUPPORT: Partial<Record<string, { category: ModuleSubstatCanonicalCategory; label: string }>> = {
  'Attack Speed': { category: 'Cannon', label: 'Attack Speed' },
  'Critical Chance': { category: 'Cannon', label: 'Critical Chance' },
  'Critical Factor': { category: 'Cannon', label: 'Critical Factor' },
  Range: { category: 'Cannon', label: 'Attack Range' },
  'Damage / Meter': { category: 'Cannon', label: 'Damage / Meter' },
  'Multishot Chance': { category: 'Cannon', label: 'Multishot Chance' },
  'Multishot Targets': { category: 'Cannon', label: 'Multishot Targets' },
  'Rapid Fire Chance': { category: 'Cannon', label: 'Rapid Fire Chance' },
  'Rapid Fire Duration': { category: 'Cannon', label: 'Rapid Fire Duration' },
  'Bounce Shot Chance': { category: 'Cannon', label: 'Bounce Shot Chance' },
  'Bounce Shot Targets': { category: 'Cannon', label: 'Bounce Shot Targets' },
  'Bounce Shot Range': { category: 'Cannon', label: 'Bounce Shot Range' },
  'Super Crit Chance': { category: 'Cannon', label: 'Super Crit Chance' },
  'Super Crit Mult': { category: 'Cannon', label: 'Super Crit Multi' },
  'Rend Armor Chance': { category: 'Cannon', label: 'Rend Armor Chance' },
  'Rend Armor Mult': { category: 'Cannon', label: 'Rend Armor Multi' },
  'Health Regen': { category: 'Defense', label: 'Health Regen' },
  'Defense %': { category: 'Defense', label: 'Defense' },
  'Defense Absolute': { category: 'Defense', label: 'Defense Absolute' },
  'Thorn Damage': { category: 'Defense', label: 'Thorns Damage' },
  Lifesteal: { category: 'Defense', label: 'Lifesteal' },
  'Knockback Chance': { category: 'Defense', label: 'Knockback Chance' },
  'Knockback Force': { category: 'Defense', label: 'Knockback Force' },
  'Orb Speed': { category: 'Defense', label: 'Orb Speed' },
  Orbs: { category: 'Defense', label: 'Orbs' },
  'Shockwave Size': { category: 'Defense', label: 'Shockwave Size' },
  'Shockwave Frequency': { category: 'Defense', label: 'Shockwave Frequency' },
  'Land Mine Chance': { category: 'Defense', label: 'Land Mine Chance' },
  'Land Mine Damage': { category: 'Defense', label: 'Land Mine Damage' },
  'Land Mine Radius': { category: 'Defense', label: 'Land Mine Radius' },
  'Death Defy': { category: 'Defense', label: 'Death Defy' },
  'Wall Health': { category: 'Defense', label: 'Wall Health' },
  'Wall Rebuild': { category: 'Defense', label: 'Wall Rebuild' },
  'Cash Bonus': { category: 'Generator', label: 'Cash Bonus' },
  'Cash / Wave': { category: 'Generator', label: 'Cash / Wave' },
  'Coins / Kill Bonus': { category: 'Generator', label: 'Coins / Kill Bonus' },
  'Coins / Wave': { category: 'Generator', label: 'Coins / Wave' },
  'Free Attack Upgrade': { category: 'Generator', label: 'Free Attack Upgrade' },
  'Free Defense Upgrade': { category: 'Generator', label: 'Free Defense Upgrade' },
  'Free Utility Upgrade': { category: 'Generator', label: 'Free Utility Upgrade' },
  'Interest / Wave': { category: 'Generator', label: 'Interest / Wave' },
  'Recovery Amount': { category: 'Generator', label: 'Recovery Amount' },
  'Max Recovery': { category: 'Generator', label: 'Max Recovery' },
  'Package Chance': { category: 'Generator', label: 'Package Chance' },
  'Enemy Health Level Skip': { category: 'Generator', label: 'Enemy Health Level Skip' },
  'Enemy Attack Level Skip': { category: 'Generator', label: 'Enemy Attack Level Skip' },
}

const VAULT_NODE_SUPPORT: Partial<Record<string, string[]>> = {
  Damage: ['dmg'],
  'Attack Speed': ['attackspeed'],
  'Critical Chance': ['crit1'],
  'Critical Factor': ['critfactor'],
  'Damage / Meter': ['dmgmeter'],
  'Multishot Chance': ['multichance'],
  'Rapid Fire Chance': ['rapidfire'],
  'Bounce Shot Chance': ['bouncchance'],
  'Super Crit Chance': ['supercrit'],
  'Super Crit Mult': ['supercritmult'],
  'Rend Armor Chance': ['rendarmorchance'],
  'Rend Armor Mult': ['rendarmormult'],
  Health: ['health'],
  'Health Regen': ['healthregen'],
  'Defense %': ['defperc'],
  'Defense Absolute': ['defabs'],
  'Thorn Damage': ['thorn'],
  'Knockback Chance': ['knockbackchance'],
  'Knockback Force': ['knockback'],
  'Orb Speed': ['orbspeed'],
  Orbs: ['orbs'],
  'Shockwave Frequency': ['shockwave'],
  'Death Defy': ['deathdefy'],
  'Wall Rebuild': ['wallrebuild'],
  'Cash Bonus': ['cash'],
  'Cash / Wave': ['cashwave'],
  'Coins / Kill Bonus': ['coinskill'],
  'Coins / Wave': ['coinswave'],
  'Free Attack Upgrade': ['freeatk'],
  'Free Defense Upgrade': ['freedef'],
  'Free Utility Upgrade': ['freeutil'],
  'Interest / Wave': ['interest'],
  'Recovery Amount': ['recovery'],
  'Max Recovery': ['maxrecovery'],
  'Enemy Health Level Skip': ['enemyhealth'],
  'Enemy Attack Level Skip': ['enemyatk'],
}

const RELIC_BONUS_TYPE_SUPPORT: Partial<Record<string, string[]>> = {
  Damage: ['Damage'],
  'Attack Speed': ['Attack Speed'],
  'Critical Chance': ['Crit Chance'],
  'Critical Factor': ['Crit Factor'],
  'Damage / Meter': ['Damage / Meter'],
  'Super Crit Chance': ['Super Critical Chance'],
  'Super Crit Mult': ['Super Critical Mult'],
  'Rend Armor Mult': ['Rend Armor Multi'],
  Health: ['Health'],
  'Health Regen': ['Health Regen'],
  'Defense %': ['Defense %'],
  'Defense Absolute': ['Defense Absolute'],
  'Thorn Damage': ['Thorns'],
  'Knockback Force': ['Knockback Force'],
  'Orb Speed': ['Orb Speed'],
  'Wall Rebuild': ['Wall Rebuild'],
  'Cash Bonus': ['Cash'],
  'Cash / Wave': ['Cash'],
  'Coins / Kill Bonus': ['Coins'],
  'Coins / Wave': ['Coins'],
  'Free Attack Upgrade': ['Free Attack Upgrade'],
  'Free Defense Upgrade': ['Free Defense Upgrade'],
  'Free Utility Upgrade': ['Free Utility Upgrade'],
  'Recovery Amount': ['Recovery Amount'],
  'Enemy Attack Level Skip': ['Enemy Attack Level Skip'],
  'Enemy Health Level Skip': ['Enemy Health Level Skip'],
}

const PERK_SUPPORT: Partial<Record<string, WorkshopSupportPerkMatch[]>> = {
  Damage: [
    { pool: 'standard', sourcePerk: 'x1.15 Damage', displayName: 'Damage standard perk' },
    { pool: 'tradeoff', sourcePerk: 'x1.50 Tower Damage, but Bosses Have 8x Health', displayName: 'Tower Damage trade-off perk' },
  ],
  Health: [
    { pool: 'standard', sourcePerk: 'x1.20 Max Health', displayName: 'Max Health standard perk' },
    { pool: 'tradeoff', sourcePerk: 'x1.80 Coins, but Tower Max Health -70%', displayName: 'Coins trade-off perk that reduces Max Health' },
    { pool: 'tradeoff', sourcePerk: 'Tower Health Regen x8.00, but Tower Max Health -60%', displayName: 'Tower Health Regen trade-off perk that reduces Max Health' },
  ],
  'Health Regen': [
    { pool: 'standard', sourcePerk: 'x1.75 Health Regen', displayName: 'Health Regen standard perk' },
    { pool: 'tradeoff', sourcePerk: 'Tower Health Regen x8.00, but Tower Max Health -60%', displayName: 'Tower Health Regen trade-off perk' },
    { pool: 'tradeoff', sourcePerk: 'Enemies Have -50% Health, but Tower Health Regen and Lifesteal -90%', displayName: 'Enemy Health trade-off perk that reduces Health Regen and Lifesteal' },
  ],
  'Defense %': [
    { pool: 'standard', sourcePerk: 'Defense Percent +4.00', displayName: 'Defense Percent standard perk' },
  ],
  'Defense Absolute': [
    { pool: 'standard', sourcePerk: 'x1.15 Defense Absolute', displayName: 'Defense Absolute standard perk' },
  ],
  Lifesteal: [
    { pool: 'tradeoff', sourcePerk: 'Lifesteal x2.50, but Knockback Force -70%', displayName: 'Lifesteal trade-off perk' },
    { pool: 'tradeoff', sourcePerk: 'Enemies Have -50% Health, but Tower Health Regen and Lifesteal -90%', displayName: 'Enemy Health trade-off perk that reduces Health Regen and Lifesteal' },
  ],
  'Knockback Force': [
    { pool: 'tradeoff', sourcePerk: 'Lifesteal x2.50, but Knockback Force -70%', displayName: 'Lifesteal trade-off perk that reduces Knockback Force' },
  ],
  Orbs: [
    { pool: 'standard', sourcePerk: 'Orbs +1', displayName: 'Orbs standard perk' },
  ],
  'Land Mine Damage': [
    { pool: 'standard', sourcePerk: 'Land Mine Damage x3.50', displayName: 'Land Mine Damage standard perk' },
  ],
  'Cash Bonus': [
    { pool: 'standard', sourcePerk: 'x1.15 Cash Bonus', displayName: 'Cash Bonus standard perk' },
  ],
  'Cash / Wave': [
    { pool: 'tradeoff', sourcePerk: 'x12.00 Cash Per Wave, but Enemy Kills Don\'t Give Cash', displayName: 'Cash Per Wave trade-off perk' },
  ],
  'Coins / Kill Bonus': [
    { pool: 'standard', sourcePerk: 'x1.15 All Coin Bonuses', displayName: 'All Coin Bonuses standard perk' },
    { pool: 'tradeoff', sourcePerk: 'x1.80 Coins, but Tower Max Health -70%', displayName: 'Coins trade-off perk' },
  ],
  'Coins / Wave': [
    { pool: 'standard', sourcePerk: 'x1.15 All Coin Bonuses', displayName: 'All Coin Bonuses standard perk' },
    { pool: 'tradeoff', sourcePerk: 'x1.80 Coins, but Tower Max Health -70%', displayName: 'Coins trade-off perk' },
  ],
  'Free Attack Upgrade': [
    { pool: 'standard', sourcePerk: 'Free Upgrade Chance for All +5.0%', displayName: 'Free Upgrade Chance for All standard perk' },
  ],
  'Free Defense Upgrade': [
    { pool: 'standard', sourcePerk: 'Free Upgrade Chance for All +5.0%', displayName: 'Free Upgrade Chance for All standard perk' },
  ],
  'Free Utility Upgrade': [
    { pool: 'standard', sourcePerk: 'Free Upgrade Chance for All +5.0%', displayName: 'Free Upgrade Chance for All standard perk' },
  ],
  'Interest / Wave': [
    { pool: 'standard', sourcePerk: 'Interest x1.50', displayName: 'Interest standard perk' },
  ],
  'Bounce Shot Chance': [
    { pool: 'standard', sourcePerk: 'Bounce Shot +2', displayName: 'Bounce Shot standard perk' },
  ],
  'Bounce Shot Targets': [
    { pool: 'standard', sourcePerk: 'Bounce Shot +2', displayName: 'Bounce Shot standard perk' },
  ],
  'Bounce Shot Range': [
    { pool: 'standard', sourcePerk: 'Bounce Shot +2', displayName: 'Bounce Shot standard perk' },
  ],
}

const ENHANCEMENT_SUPPORT: Partial<Record<string, string[]>> = {
  Damage: ['Damage'],
  'Attack Speed': ['Attack Speed'],
  'Critical Factor': ['Critical Factor'],
  'Damage / Meter': ['Damage/Meter'],
  'Super Crit Mult': ['Super Crit Multi'],
  'Rend Armor Chance': ['Rend Armor'],
  'Rend Armor Mult': ['Rend Armor'],
  Health: ['Health'],
  'Health Regen': ['Health Regen'],
  'Defense Absolute': ['Defense Absolute'],
  'Land Mine Damage': ['Land Mine Damage'],
  'Wall Health': ['Wall Health'],
  'Cash Bonus': ['Cash Bonus'],
  'Coins / Kill Bonus': ['Coin Bonus'],
  'Coins / Wave': ['Coin Bonus'],
  'Free Attack Upgrade': ['Free Upgrades'],
  'Free Defense Upgrade': ['Free Upgrades'],
  'Free Utility Upgrade': ['Free Upgrades'],
  'Recovery Amount': ['Packages'],
  'Max Recovery': ['Packages'],
  'Package Chance': ['Packages'],
  'Enemy Attack Level Skip': ['Enemy Level Skips'],
  'Enemy Health Level Skip': ['Enemy Level Skips'],
}

const CARD_SUPPORT: Partial<Record<string, string[]>> = {
  Damage: ['Damage', 'Super Tower', 'Berzerker'],
  'Attack Speed': ['Attack Speed'],
  'Critical Chance': ['Critical Chance'],
  Health: ['Health'],
  'Health Regen': ['Health Regen'],
  Range: ['Range'],
  'Defense %': ['Extra Defense'],
  'Defense Absolute': ['Fortress'],
  'Cash Bonus': ['Cash'],
  'Coins / Kill Bonus': ['Coins'],
  'Coins / Wave': ['Coins'],
  'Free Attack Upgrade': ['Free Upgrades'],
  'Free Defense Upgrade': ['Free Upgrades'],
  'Free Utility Upgrade': ['Free Upgrades'],
  Orbs: ['Extra Orb'],
  'Package Chance': ['Recovery Package Chance'],
}

const LAB_SUPPORT: Partial<Record<string, string[]>> = {
  Damage: ['Damage Mastery'],
  'Attack Speed': ['Attack Speed Mastery'],
  'Critical Chance': ['Critical Chance Mastery'],
  Health: ['Health Mastery'],
  'Health Regen': ['Health Regen Mastery'],
  Range: ['Range Mastery'],
  'Damage / Meter': ['Range Mastery'],
  'Defense %': ['Extra Defense Mastery'],
  'Defense Absolute': ['Fortress Mastery'],
  'Cash Bonus': ['Cash Mastery'],
  'Coins / Kill Bonus': ['Coins Mastery'],
  'Coins / Wave': ['Coins Mastery'],
  'Free Attack Upgrade': ['Free Upgrades Mastery'],
  'Free Defense Upgrade': ['Free Upgrades Mastery'],
  'Free Utility Upgrade': ['Free Upgrades Mastery'],
  Orbs: ['Extra Orb Mastery'],
  'Package Chance': ['Recovery Package Chance Mastery'],
  'Land Mine Chance': ['Land Mine Stun Mastery'],
  'Land Mine Damage': ['Area of Effect Mastery'],
  'Wall Rebuild': ['Fortress Mastery'],
}

const SOURCE_LAB_SUPPORT: Partial<Record<string, SupportTextEntry[]>> = {
  Damage: [
    {
      label: 'Damage Research',
      description: 'Workshop source ties Damage to the Damage lab that increases the workshop increments and maximum value.',
      dataSource: 'public/knowledge/workshop:Damage > Labs > Damage Research',
    },
    {
      label: 'Super Tower Bonus',
      description: 'Workshop source also links Damage to the Super Tower Bonus lab.',
      dataSource: 'public/knowledge/workshop:Damage > Labs > Super Tower Bonus',
    },
  ],
  'Attack Speed': [
    {
      label: 'Attack Speed',
      description: 'Workshop source links Attack Speed to the Attack Speed lab.',
      dataSource: 'public/knowledge/workshop:Attack Speed > Lab Upgrades > Attack Speed',
    },
    {
      label: 'Light Speed Shots',
      description: 'Workshop source links Attack Speed to Light Speed Shots.',
      dataSource: 'public/knowledge/workshop:Attack Speed > Lab Upgrades > Light Speed Shots',
    },
  ],
  'Critical Factor': [
    {
      label: 'Critical Factor',
      description: 'Workshop source links Critical Factor to the Critical Factor lab.',
      dataSource: 'public/knowledge/workshop:Critical Hits > Lab > Critical Factor',
    },
  ],
  Range: [
    {
      label: 'Range',
      description: 'Workshop source links Range to the Range lab and its adjuster behavior.',
      dataSource: 'public/knowledge/workshop:Range > Lab > Range',
    },
  ],
  'Rend Armor Chance': [
    {
      label: 'Rend Armor Max',
      description: 'Workshop source links Rend Armor to the Rend Armor Max lab unlock.',
      dataSource: 'public/knowledge/workshop:Rend Armor > Rend Armor Max',
    },
  ],
  'Rend Armor Mult': [
    {
      label: 'Rend Armor Max',
      description: 'Workshop source links Rend Armor to the Rend Armor Max lab unlock.',
      dataSource: 'public/knowledge/workshop:Rend Armor > Rend Armor Max',
    },
  ],
}

const UNIQUE_MODULE_SUPPORT: Partial<Record<string, string[]>> = {
  Damage: ['amplifying-strike', 'project-funding'],
  'Attack Speed': ['restorative-bonus'],
  Range: ['astral-deliverance'],
  'Bounce Shot Range': ['astral-deliverance'],
  'Super Crit Chance': ['being-annihilator'],
  'Rend Armor Chance': ['havoc-bringer'],
  'Rend Armor Mult': ['havoc-bringer'],
  'Health Regen': ['wormhole-redirector'],
  'Thorn Damage': ['sharp-fortitude'],
  'Shockwave Size': ['anti-cube-portal'],
  'Shockwave Frequency': ['anti-cube-portal'],
  'Land Mine Chance': ['space-displacer', 'magnetic-hook'],
  'Land Mine Damage': ['space-displacer', 'magnetic-hook'],
  'Land Mine Radius': ['space-displacer', 'magnetic-hook'],
  'Wall Health': ['sharp-fortitude'],
  'Coins / Kill Bonus': ['black-hole-digestor'],
  'Free Attack Upgrade': ['black-hole-digestor'],
  'Free Defense Upgrade': ['black-hole-digestor'],
  'Free Utility Upgrade': ['black-hole-digestor'],
  'Max Recovery': ['wormhole-redirector'],
  'Package Chance': ['galaxy-compressor', 'restorative-bonus'],
  'Enemy Attack Level Skip': ['pulsar-harvester'],
  'Enemy Health Level Skip': ['pulsar-harvester'],
}

const FOOTGUN_SUPPORT: Partial<Record<string, string[]>> = {
  Damage: ['Displayed damage mixes additive Berserker contribution with multiplicative terms, so treating Berserker as a pure multiplier will misread the stat.'],
  'Attack Speed': ['Attack Speed does not stay a clean shots-per-second value at higher values, and projectile travel changes again once Light Speed Shots is active.'],
  'Critical Chance': ['Values above 100% only matter for Ultimate Weapon damage.'],
  Range: ['More range also changes enemy firing distance, not just the tower\'s reach.'],
  'Damage / Meter': ['Damage / Meter depends on range context, so the row value alone does not tell the whole damage story.'],
  'Health Regen': ['Large regen values are still constrained by healing context and can be undermined by trade-off perks that cut health or regen.'],
  Lifesteal: ['Trade-off perks can cut Lifesteal and Health Regen together.'],
  Orbs: ['Perks and module effects can push orb count above the base workshop cap.'],
  'Shockwave Frequency': ['Lower is better here because the stat behaves like an interval between pulses.'],
  'Wall Rebuild': ['Lower rebuild time is better, so negative-looking reductions are beneficial rather than harmful.'],
  'Cash / Wave': ['Cash-per-wave trade-offs change the economy mix rather than acting as free value.'],
  'Coins / Wave': ['Wave income and kill income can move in different directions under coin trade-off setups.'],
  'Free Attack Upgrade': ['Free upgrades can force unwanted stat growth unless you deliberately lock or constrain targets.'],
  'Free Defense Upgrade': ['Free upgrades can force unwanted stat growth unless you deliberately lock or constrain targets.'],
  'Free Utility Upgrade': ['Free upgrades can force unwanted stat growth unless you deliberately lock or constrain targets.'],
  'Package Chance': ['Package-driven effects are bursty, so proc chance should not be read as guaranteed value every wave.'],
  'Enemy Attack Level Skip': ['Skip stats are probabilistic, so displayed percentages do not translate to a fixed skip on each wave.'],
  'Enemy Health Level Skip': ['Skip stats are probabilistic, so displayed percentages do not translate to a fixed skip on each wave.'],
}

const MODULE_FAMILY_BY_WORKSHOP_CATEGORY: Record<WorkshopCategory, Exclude<ModuleCategory, 'Core'>> = {
  attack: 'Cannon',
  defense: 'Armor',
  utility: 'Generator',
}

const MODULE_SUBSTAT_DEFINITION_MAP = new Map<string, ModuleSubstatCanonicalDefinition>()
for (const [category, data] of Object.entries(MODULE_SUBSTAT_CANONICAL_DATA) as Array<[ModuleSubstatCanonicalCategory, (typeof MODULE_SUBSTAT_CANONICAL_DATA)[ModuleSubstatCanonicalCategory]]>) {
  for (const definition of data.substats) {
    MODULE_SUBSTAT_DEFINITION_MAP.set(`${category}:${definition.label}`, definition)
  }
}

const POWER_TREE_NODE_MAP = new Map(powerTreeNodes.map(node => [node.id, node]))
const STANDARD_PERK_SET = new Set(STANDARD_PERKS.map(entry => entry.perk))
const TRADE_OFF_PERK_SET = new Set(TRADE_OFF_PERKS.map(entry => entry.perk))
const CARD_TEMPLATE_MAP = new Map(CARD_TEMPLATES.map(card => [card.name, card]))
const LAB_MAP = new Map(LABS.map(lab => [lab.name, lab]))
const UNIQUE_MODULE_MAP = new Map(UNIQUE_MODULE_TEMPLATES.map(module => [module.id, module]))

function normalizeChunkSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function formatNumericValue(value: number): string {
  if (!Number.isFinite(value)) return '0'
  if (value === 0) return '0'
  const absoluteValue = Math.abs(value)
  if (absoluteValue >= 1_000_000 || absoluteValue < 0.001) {
    return value.toExponential(2).replace(/\.00e/, 'e')
  }
  return value.toFixed(4).replace(/\.0+$|(?<=\.[0-9]*?)0+$/g, '')
}

function buildWorkshopStatMechanicName(definition: WorkshopStatDefinition): string {
  return `${definition.label} Workshop Stat`
}

function selectIndefiniteArticle(value: string): 'a' | 'an' {
  return /^[aeiou]/i.test(value.trim()) ? 'an' : 'a'
}

function buildWorkshopStatSummaryParagraph(definition: WorkshopStatDefinition): string {
  const firstLevel = definition.levels[0]
  const lastLevel = definition.levels[definition.levels.length - 1]
  const categoryTitle = WORKSHOP_CATEGORY_TITLES[definition.category]
  return `${definition.label} is ${selectIndefiniteArticle(categoryTitle)} ${categoryTitle} Workshop stat in the site data. The ${definition.key} row spans levels ${definition.minLevel} through ${definition.maxLevel}, starts at value ${formatNumericValue(firstLevel?.value ?? 0)} on level ${definition.minLevel}, and reaches value ${formatNumericValue(lastLevel?.value ?? 0)} on level ${definition.maxLevel}.`
}

function buildWorkshopStatCostParagraph(definition: WorkshopStatDefinition): string {
  const coinCostLevels = definition.levels.filter(level => level.coins > 0)
  const cashCostLevels = definition.levels.filter(level => level.cash > 0)
  const firstCoinLevel = coinCostLevels[0]?.level
  const lastCoinLevel = coinCostLevels[coinCostLevels.length - 1]?.level
  const firstCashLevel = cashCostLevels[0]?.level
  const lastCashLevel = cashCostLevels[cashCostLevels.length - 1]?.level

  return `${definition.label} includes cash and coin cost fields in site data. Cash cost entries run from level ${firstCashLevel ?? definition.minLevel} through level ${lastCashLevel ?? definition.maxLevel}, and coin cost entries run from level ${firstCoinLevel ?? definition.minLevel} through level ${lastCoinLevel ?? definition.maxLevel}.`
}

function formatSourcePointer(sourcePath: string, selector: string): string {
  return `${sourcePath}:${selector}`
}

function parseScalarValue(value: string): { amount: number; unit: string } | null {
  const normalized = value.trim().replace(/^\+/, '')
  const match = normalized.match(/^(-?\d+(?:\.\d+)?)(.*)$/)
  if (!match) return null
  return {
    amount: Number(match[1]),
    unit: match[2].trim(),
  }
}

function formatScalarValue(amount: number, unit: string): string {
  const numeric = Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')
  return `${numeric}${unit}`
}

function formatModuleValue(module: ModuleTemplate): string {
  const lastBonus = module.rarityBonuses?.[module.rarityBonuses.length - 1]?.value
  return module.description(lastBonus)
}

function formatModuleRarityEffects(module: ModuleTemplate): string {
  if (!module.rarityBonuses || module.rarityBonuses.length === 0) {
    return formatModuleValue(module)
  }

  return module.rarityBonuses
    .map(bonus => `${bonus.rarity}: ${module.description(bonus.value)}`)
    .join(' ')
}

function getDefinedSubstatRarityValues(substat: ModuleSubstatCanonicalDefinition): Array<{ rarity: string; value: string }> {
  return substat.availableRarities
    .map(rarity => ({
      rarity,
      value: substat.valuesByRarity[rarity] ?? '',
    }))
    .filter(entry => entry.value.trim().length > 0)
}

function buildWorkshopSubstatsSupport(definition: WorkshopStatDefinition): { paragraph: string; dataSources: string[] } {
  const mapping = MODULE_SUBSTAT_SUPPORT[definition.label]
  if (!mapping) {
    return {
      paragraph: `Substats. Only modules have substats, and those substats belong to the four module families Cannon, Armor, Generator, and Core. None of those module substat tables expose a direct entry for ${definition.label}, while Core substats stay focused on Ultimate Weapon effects rather than normal Workshop-stat rows.`,
      dataSources: [],
    }
  }

  const substat = MODULE_SUBSTAT_DEFINITION_MAP.get(`${mapping.category}:${mapping.label}`)
  if (!substat) {
    return {
      paragraph: `Substats. The ${MODULE_FAMILY_TITLES[mapping.category]} module substat table does not expose a direct ${mapping.label} entry for ${definition.label}.`,
      dataSources: [],
    }
  }

  const definedValues = getDefinedSubstatRarityValues(substat)
  const firstDefinedValue = definedValues[0]
  const lastDefinedValue = definedValues[definedValues.length - 1]
  const availabilityLabel = firstDefinedValue && lastDefinedValue
    ? `The entry is available from ${firstDefinedValue.rarity} through ${lastDefinedValue.rarity}, ranging from ${firstDefinedValue.value} to ${lastDefinedValue.value}.`
    : `The source table lists ${mapping.label} for this module family, but its rarity values are blank in the current site data.`

  return {
    paragraph: `Substats. The ${MODULE_FAMILY_TITLES[mapping.category]} module substat table includes ${mapping.label} for this stat. ${availabilityLabel}`,
    dataSources: [formatSourcePointer('packages/platform/src/tools/module-substats-data.ts', `MODULE_SUBSTAT_CANONICAL_DATA.${mapping.category}.substats[label="${mapping.label}"]`)],
  }
}

function buildWorkshopSection(definition: WorkshopStatDefinition): { paragraph: string; dataSources: string[] } {
  const registryEntry = getRequiredNamingRegistryEntryBySource('workshop', definition.key)
  return {
    paragraph: `Workshop. ${buildWorkshopStatSummaryParagraph(definition)} ${buildWorkshopStatCostParagraph(definition)}`,
    dataSources: [registryEntry.data_source],
  }
}

function buildWorkshopEnhancementSupport(definition: WorkshopStatDefinition): { paragraph: string; dataSources: string[] } {
  const sourceNames = ENHANCEMENT_SUPPORT[definition.label] ?? []
  const enhancementDefinitions = sourceNames
    .map(sourceName => ENHANCEMENT_DEFINITIONS.find(candidate => candidate.sourceName === sourceName))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  if (enhancementDefinitions.length === 0) {
    return {
      paragraph: `Enhancements. WORKSHOP enhancement data has no direct enhancement row mapped for ${definition.label}.`,
      dataSources: [],
    }
  }

  return {
    paragraph: `Enhancements. ${enhancementDefinitions.map(entry => `${entry.title} is the direct Workshop Enhancement row tied to this stat`).join('; ')}.`,
    dataSources: enhancementDefinitions.map(entry => getRequiredNamingRegistryEntryBySource('workshop_enhancements', entry.key).data_source),
  }
}

function buildWorkshopLabSupport(definition: WorkshopStatDefinition): { paragraph: string; dataSources: string[] } {
  const labEntries = (LAB_SUPPORT[definition.label] ?? [])
    .map(name => LAB_MAP.get(name))
    .filter((entry): entry is Lab => Boolean(entry))
    .map(lab => ({
      label: lab.name,
      description: `${lab.name} (${lab.category}) is a structured lab entry for this stat.`,
      dataSource: formatSourcePointer('src/utils/lab-data.ts', `labs[name="${lab.name}"]`),
    }))

  const family = MODULE_FAMILY_BY_WORKSHOP_CATEGORY[definition.category]
  const moduleLabNames = [`Assist Module Substats - ${family}`, `Assist Module Bonus - ${family}`]
  const familyLabEntries = moduleLabNames
    .map(name => LAB_MAP.get(name))
    .filter((entry): entry is Lab => Boolean(entry))
    .map(lab => ({
      label: lab.name,
      description: `${lab.name} (${lab.category}) affects the ${family} module family tied to this stat.`,
      dataSource: formatSourcePointer('src/utils/lab-data.ts', `labs[name="${lab.name}"]`),
    }))

  const enhancementDiscountName = `Enhancement ${WORKSHOP_CATEGORY_TITLES[definition.category]} - Coin Discount`
  const enhancementDiscountLab = LAB_MAP.get(enhancementDiscountName)
  const enhancementLabEntries = enhancementDiscountLab
    ? [{
      label: enhancementDiscountLab.name,
      description: `${enhancementDiscountLab.name} reduces enhancement costs in this Workshop category.`,
      dataSource: formatSourcePointer('src/utils/lab-data.ts', `labs[name="${enhancementDiscountLab.name}"]`),
    }]
    : []

  const sourceEntries = SOURCE_LAB_SUPPORT[definition.label] ?? []
  const entries = [...labEntries, ...familyLabEntries, ...enhancementLabEntries, ...sourceEntries]

  if (entries.length === 0) {
    return {
      paragraph: `Labs. No structured or curated lab entry is currently mapped for ${definition.label}.`,
      dataSources: [],
    }
  }

  return {
    paragraph: `Labs. ${entries.map(entry => entry.description).join(' ')}`,
    dataSources: entries.map(entry => entry.dataSource),
  }
}

function buildWorkshopCardSupport(definition: WorkshopStatDefinition): { paragraph: string; dataSources: string[] } {
  const cards = (CARD_SUPPORT[definition.label] ?? [])
    .map(name => CARD_TEMPLATE_MAP.get(name))
    .filter((entry): entry is CardTemplate => Boolean(entry))

  if (cards.length === 0) {
    return {
      paragraph: `Cards. CARD_TEMPLATES has no direct card entry mapped for ${definition.label}.`,
      dataSources: [],
    }
  }

  return {
    paragraph: `Cards. ${cards.map(card => `${card.name} (${card.description})`).join(' ')}`,
    dataSources: cards.map(card => formatSourcePointer('src/utils/card-data.ts', `CARD_TEMPLATES[name="${card.name}"]`)),
  }
}

function buildWorkshopModuleSupport(definition: WorkshopStatDefinition): { paragraph: string; dataSources: string[] } {
  const family = MODULE_FAMILY_BY_WORKSHOP_CATEGORY[definition.category]
  const familyModules = [...COMMON_MODULE_TEMPLATES, ...RARE_MODULE_TEMPLATES].filter(module => module.type === family)

  return {
    paragraph: `Modules. ${family} is the relevant non-Core module family for this stat. The non-unique ${family} templates are ${familyModules.map(module => module.name).join(', ')}.`,
    dataSources: [
      formatSourcePointer('src/utils/module-data.ts', `${family === 'Cannon' || family === 'Armor' || family === 'Generator' ? 'COMMON_MODULE_TEMPLATES' : 'MODULE_TEMPLATES'}[type="${family}"]`),
      formatSourcePointer('src/utils/module-data.ts', `RARE_MODULE_TEMPLATES[type="${family}"]`),
    ],
  }
}

function buildWorkshopUniqueModuleSupport(definition: WorkshopStatDefinition): { paragraph: string; dataSources: string[] } {
  const modules = (UNIQUE_MODULE_SUPPORT[definition.label] ?? [])
    .map(id => UNIQUE_MODULE_MAP.get(id))
    .filter((entry): entry is ModuleTemplate => Boolean(entry))

  if (modules.length === 0) {
    return {
      paragraph: `Unique Modules. UNIQUE_MODULE_TEMPLATES has no directly mapped unique-module effect for ${definition.label}.`,
      dataSources: [],
    }
  }

  return {
    paragraph: `Unique Modules. ${modules.map(module => `${module.name}. ${formatModuleRarityEffects(module)}`).join(' ')}`,
    dataSources: modules.map(module => formatSourcePointer('src/utils/module-data.ts', `UNIQUE_MODULE_TEMPLATES[id="${module.id}"]`)),
  }
}

function buildWorkshopVaultSupport(definition: WorkshopStatDefinition): { paragraph: string; dataSources: string[] } {
  const nodeIds = VAULT_NODE_SUPPORT[definition.label] ?? []
  const nodes = nodeIds
    .map(nodeId => POWER_TREE_NODE_MAP.get(nodeId))
    .filter((node): node is NonNullable<typeof node> => Boolean(node))

  if (nodes.length === 0) {
    return {
      paragraph: `Vault. powerTreeNodes has no direct Power-tree node for ${definition.label}.`,
      dataSources: [],
    }
  }

  return {
    paragraph: `Vault. ${nodes.map(node => `${node.name} via node ${node.id} with key costs ${Array.isArray(node.cost) ? node.cost.join(' / ') : node.cost}`).join('; ')}.`,
    dataSources: nodes.map(node => formatSourcePointer('packages/platform/src/tools/vault-tree-chart-data.ts', `powerTreeNodes[id="${node.id}"]`)),
  }
}

function buildWorkshopRelicSupport(definition: WorkshopStatDefinition): { paragraph: string; dataSources: string[] } {
  const bonusTypes = RELIC_BONUS_TYPE_SUPPORT[definition.label] ?? []
  const matches = RELIC_TEMPLATES.filter(relic => relic.bonusType && bonusTypes.includes(relic.bonusType))

  if (matches.length === 0) {
    return {
      paragraph: `Relics. RELIC_TEMPLATES has no direct bonusType entry for ${definition.label}.`,
      dataSources: [],
    }
  }

  const totals = matches
    .map(relic => relic.value ? parseScalarValue(relic.value) : null)
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

  const units = new Set(totals.map(entry => entry.unit))
  const totalLabel = units.size === 1
    ? formatScalarValue(totals.reduce((sum, entry) => sum + entry.amount, 0), totals[0]?.unit ?? '')
    : `${matches.length} entries`

  return {
    paragraph: `Relics. RELIC_TEMPLATES matches ${bonusTypes.join(', ')} for ${matches.length} entries, totalling ${totalLabel}.`,
    dataSources: bonusTypes.map(bonusType => formatSourcePointer('src/utils/relic-data.ts', `RELIC_TEMPLATES[bonusType="${bonusType}"]`)),
  }
}

function buildWorkshopPerkSupport(definition: WorkshopStatDefinition): { paragraph: string; dataSources: string[] } {
  const matches = PERK_SUPPORT[definition.label] ?? []
  if (matches.length === 0) {
    return {
      paragraph: `Perks. STANDARD_PERKS and TRADE_OFF_PERKS have no direct entry for ${definition.label}.`,
      dataSources: [],
    }
  }

  const validMatches = matches.filter(match => (
    match.pool === 'standard' ? STANDARD_PERK_SET.has(match.sourcePerk) : TRADE_OFF_PERK_SET.has(match.sourcePerk)
  ))

  const displayNames = validMatches.map(match => match.displayName)
  return {
    paragraph: `Perks. ${displayNames.join('; ')}. Effective perk strength depends on perk-lab scaling, so this section keeps perk names rather than fixed values.`,
    dataSources: validMatches.map(match => formatSourcePointer(
      'packages/platform/src/tools/perks.ts',
      `${match.pool === 'standard' ? 'STANDARD_PERKS' : 'TRADE_OFF_PERKS'}[perk="${match.sourcePerk}"]`,
    )),
  }
}

function buildWorkshopFootgunSupport(definition: WorkshopStatDefinition): { paragraph: string; dataSources: string[] } {
  const notes = FOOTGUN_SUPPORT[definition.label] ?? []
  if (notes.length === 0) {
    return {
      paragraph: `Footguns. No stat-specific footgun is currently curated for ${definition.label}.`,
      dataSources: [],
    }
  }

  return {
    paragraph: `Footguns. ${notes.join(' ')}`,
    dataSources: [],
  }
}

function readDeterministicSection(entry: WorkshopDeterministicStatEntry | undefined, sectionName: string, fallback: string): string {
  const sourceValue = entry?.sections[sectionName]
  if (!sourceValue) {
    return fallback
  }

  return `${sectionName}. ${sourceValue.replace(/\n+/g, ' ')}`
}

function readDeterministicDefinition(entry: WorkshopDeterministicStatEntry | undefined, fallback: string): string {
  const sourceValue = entry?.sections.Definition ?? entry?.sections.Description
  if (!sourceValue) {
    return fallback
  }

  return `Definition. ${sourceValue.replace(/\n+/g, ' ')}`
}

function readDeterministicDisambiguation(entry: WorkshopDeterministicStatEntry | undefined, fallback: string): string {
  const sourceValue = entry?.sections.Disambiguation
  if (!sourceValue) {
    return fallback
  }

  return sourceValue.replace(/\n+/g, ' ')
}

function buildDeterministicMetadataParagraph(entry: WorkshopDeterministicStatEntry | undefined): string {
  if (!entry) {
    return ''
  }

  const parts = [
    entry.sections.Type ? `Type: ${entry.sections.Type}` : '',
    entry.sections.Category ? `Category: ${entry.sections.Category}` : '',
    entry.sections.Aliases && !/^none\.?$/i.test(entry.sections.Aliases) ? `Aliases: ${entry.sections.Aliases}` : '',
  ].filter(Boolean)

  return parts.length > 0 ? `${parts.join('. ')}.` : ''
}

function extractDeterministicAliases(entry: WorkshopDeterministicStatEntry | undefined): string[] {
  return String(entry?.sections.Aliases || '')
    .split(';')
    .map(alias => alias.trim().toLowerCase())
    .filter(alias => alias && alias !== 'none.')
}

function buildWorkshopCategoryOverviewChunk(definitions: WorkshopStatDefinition[], category: WorkshopCategory): KBChunkRecord {
  const categoryTitle = WORKSHOP_CATEGORY_TITLES[category]
  const statList = definitions.map(definition => definition.label).join(', ')
  const moduleFamilyNote = 'Only modules have substats in site data, and those substats are grouped into exactly four module families: Cannon, Armor, Generator, and Core. Core module substats focus on Ultimate Weapon effects rather than normal Workshop rows, so Workshop stat chunks only cite the relevant Cannon, Armor, or Generator entries.'

  return buildAtomicKbChunk({
    chunk_id: `workshop_${category}_stats_overview_01`,
    source: 'Workshop Site Data',
    section: 'Workshop',
    topic: `${categoryTitle} Workshop Stats`,
    title: `${categoryTitle} Workshop Stats Overview`,
    disambiguation: `This chunk is about the ${categoryTitle} Workshop Stats mechanic itself, not its interactions. It is not about ${categoryTitle.toLowerCase()} Workshop Enhancements, unrelated categories, or build recommendations.`,
    data_source: definitions.map(definition => getRequiredNamingRegistryEntryBySource('workshop', definition.key).data_source),
    is_base_mechanic: false,
    mechanics: [`${categoryTitle} Workshop Stats`],
    tags: ['workshop', 'site data', category, 'stats'],
    paragraphs: [
      `The site Workshop data exposes the following ${categoryTitle.toLowerCase()} stats: ${statList}.`,
      `${categoryTitle} Workshop stats are the normal cash-and-coin upgrade rows from workshop.json, not the separate ${categoryTitle} enhancement ladder unlocked later through Workshop Enhancements.`,
      moduleFamilyNote,
    ],
  })
}

type WorkshopRelationalSectionSpec = {
  sectionName: 'Enhancements' | 'Labs' | 'Cards' | 'Masteries' | 'Modules' | 'Relics' | 'Vault' | 'Perks' | 'Footguns'
  titleSuffix: string
  topicSuffix: string
  counterpartLabel: string
  interactionType: NonNullable<KBChunkRecord['interaction_type']>
  interactionSummary: (label: string) => string
  disambiguation: (mechanic: string, label: string) => string
  mechanics: (mechanic: string, label: string) => string[]
  tags: string[]
}

const WORKSHOP_RELATIONAL_SECTION_SPECS: WorkshopRelationalSectionSpec[] = [
  {
    sectionName: 'Enhancements',
    titleSuffix: 'Enhancement Interactions',
    topicSuffix: 'Enhancement Interactions',
    counterpartLabel: 'Workshop Enhancements',
    interactionType: 'scaling',
    interactionSummary: label => `${label} overlaps with Workshop Enhancement rows that modify or extend that stat.`,
    disambiguation: (mechanic, label) => `This chunk describes the interaction between ${mechanic} and its related Workshop Enhancement rows, not the ${mechanic} mechanic by itself. It is not about unrelated Workshop stats, unrelated ${label} questions, or tracker recommendations.`,
    mechanics: mechanic => [mechanic, 'Workshop Enhancements'],
    tags: ['workshop', 'enhancement', 'scaling'],
  },
  {
    sectionName: 'Labs',
    titleSuffix: 'Lab Interactions',
    topicSuffix: 'Lab Interactions',
    counterpartLabel: 'Labs',
    interactionType: 'synergy',
    interactionSummary: label => `${label} has lab interactions that change its effective values, unlocks, or attached behavior.`,
    disambiguation: mechanic => `This chunk describes the interaction between ${mechanic} and its related labs, not the ${mechanic} mechanic by itself. It is not a lab priority guide.`,
    mechanics: mechanic => [mechanic, 'Labs'],
    tags: ['workshop', 'labs', 'synergy'],
  },
  {
    sectionName: 'Cards',
    titleSuffix: 'Card Interactions',
    topicSuffix: 'Card Interactions',
    counterpartLabel: 'Cards',
    interactionType: 'conditional',
    interactionSummary: label => `${label} changes when related cards are active.`,
    disambiguation: mechanic => `This chunk describes the interaction between ${mechanic} and related cards, not the ${mechanic} mechanic by itself. It is not a card tier list.`,
    mechanics: mechanic => [mechanic, 'Cards'],
    tags: ['workshop', 'cards', 'conditional'],
  },
  {
    sectionName: 'Masteries',
    titleSuffix: 'Mastery Interactions',
    topicSuffix: 'Mastery Interactions',
    counterpartLabel: 'Card Masteries',
    interactionType: 'conditional',
    interactionSummary: label => `${label} has mastery-related interactions that apply only when the mastery layer is unlocked.`,
    disambiguation: mechanic => `This chunk describes the interaction between ${mechanic} and related card masteries, not the ${mechanic} mechanic by itself. It is not a mastery progression guide.`,
    mechanics: mechanic => [mechanic, 'Card Masteries'],
    tags: ['workshop', 'masteries', 'conditional'],
  },
  {
    sectionName: 'Modules',
    titleSuffix: 'Module Interactions',
    topicSuffix: 'Module Interactions',
    counterpartLabel: 'Modules',
    interactionType: 'synergy',
    interactionSummary: label => `${label} overlaps with module families, module substats, or unique module behavior.`,
    disambiguation: mechanic => `This chunk describes the interaction between ${mechanic} and related module effects, not the ${mechanic} mechanic by itself. It is not a module ranking.`,
    mechanics: mechanic => [mechanic, 'Modules'],
    tags: ['workshop', 'modules', 'synergy'],
  },
  {
    sectionName: 'Relics',
    titleSuffix: 'Relic Interactions',
    topicSuffix: 'Relic Interactions',
    counterpartLabel: 'Relics',
    interactionType: 'additive',
    interactionSummary: label => `${label} can be modified by relic bonuses outside the base workshop row.`,
    disambiguation: mechanic => `This chunk describes the interaction between ${mechanic} and related relic bonuses, not the ${mechanic} mechanic by itself. It is not a relic collection guide.`,
    mechanics: mechanic => [mechanic, 'Relics'],
    tags: ['workshop', 'relics', 'additive'],
  },
  {
    sectionName: 'Vault',
    titleSuffix: 'Vault Interactions',
    topicSuffix: 'Vault Interactions',
    counterpartLabel: 'Vault',
    interactionType: 'additive',
    interactionSummary: label => `${label} overlaps with Vault upgrades that modify the stat outside the base workshop row.`,
    disambiguation: mechanic => `This chunk describes the interaction between ${mechanic} and related Vault upgrades, not the ${mechanic} mechanic by itself. It is not a Vault priority guide.`,
    mechanics: mechanic => [mechanic, 'Vault'],
    tags: ['workshop', 'vault', 'additive'],
  },
  {
    sectionName: 'Perks',
    titleSuffix: 'Perk Interactions',
    topicSuffix: 'Perk Interactions',
    counterpartLabel: 'Perks',
    interactionType: 'conditional',
    interactionSummary: label => `${label} changes when relevant run perks are active.`,
    disambiguation: mechanic => `This chunk describes the interaction between ${mechanic} and related perks, not the ${mechanic} mechanic by itself. It is not a perk selection guide.`,
    mechanics: mechanic => [mechanic, 'Perks'],
    tags: ['workshop', 'perks', 'conditional'],
  },
  {
    sectionName: 'Footguns',
    titleSuffix: 'Constraints and Footguns',
    topicSuffix: 'Constraints and Footguns',
    counterpartLabel: 'Constraints and Edge Cases',
    interactionType: 'conflict',
    interactionSummary: label => `${label} has constraints or misleading edge cases that affect interpretation.`,
    disambiguation: mechanic => `This chunk describes the interaction between ${mechanic} and its constraints, edge cases, and misleading behavior, not the ${mechanic} mechanic by itself. It is not a strategy recommendation.`,
    mechanics: mechanic => [mechanic, 'Constraints and Edge Cases'],
    tags: ['workshop', 'footguns', 'constraints'],
  },
]

function isMeaningfulDeterministicSection(value: string | undefined): boolean {
  if (!value) {
    return false
  }

  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > 0 && !/^none\.?$/i.test(normalized)
}

function isUsefulWorkshopRelationalFallback(paragraph: string): boolean {
  const normalized = paragraph.replace(/\s+/g, ' ').trim()

  if (!normalized) {
    return false
  }

  return !(
    /^.+\. no\b/i.test(normalized)
    || /has no direct/i.test(normalized)
    || /has no directly mapped/i.test(normalized)
    || /no structured or curated/i.test(normalized)
    || /no stat-specific footgun/i.test(normalized)
    || /none of those module substat tables expose a direct entry/i.test(normalized)
  )
}

function buildWorkshopStatRelationalChunks(definition: WorkshopStatDefinition, deterministicEntry?: WorkshopDeterministicStatEntry): KBChunkRecord[] {
  const mechanic = buildWorkshopStatMechanicName(definition)
  const registryEntry = getRequiredNamingRegistryEntryBySource('workshop', definition.key)
  const enhancementSupport = buildWorkshopEnhancementSupport(definition)
  const labSupport = buildWorkshopLabSupport(definition)
  const cardSupport = buildWorkshopCardSupport(definition)
  const moduleSupport = buildWorkshopModuleSupport(definition)
  const uniqueModuleSupport = buildWorkshopUniqueModuleSupport(definition)
  const substatsSupport = buildWorkshopSubstatsSupport(definition)
  const relicSupport = buildWorkshopRelicSupport(definition)
  const vaultSupport = buildWorkshopVaultSupport(definition)
  const perkSupport = buildWorkshopPerkSupport(definition)
  const footgunSupport = buildWorkshopFootgunSupport(definition)

  const fallbackBySection: Record<WorkshopRelationalSectionSpec['sectionName'], { paragraph: string; dataSources: string[] }> = {
    Enhancements: enhancementSupport,
    Labs: labSupport,
    Cards: cardSupport,
    Masteries: { paragraph: '', dataSources: [] },
    Modules: {
      paragraph: [moduleSupport.paragraph, uniqueModuleSupport.paragraph, substatsSupport.paragraph].filter(Boolean).join(' '),
      dataSources: [...moduleSupport.dataSources, ...uniqueModuleSupport.dataSources, ...substatsSupport.dataSources],
    },
    Relics: relicSupport,
    Vault: vaultSupport,
    Perks: perkSupport,
    Footguns: footgunSupport,
  }

  return WORKSHOP_RELATIONAL_SECTION_SPECS.flatMap(spec => {
    const sourceValue = deterministicEntry?.sections[spec.sectionName]
    const fallback = fallbackBySection[spec.sectionName]
    const paragraph = isMeaningfulDeterministicSection(sourceValue)
      ? `${spec.sectionName}. ${sourceValue!.replace(/\n+/g, ' ')}`
      : fallback.paragraph
    const dataSources = fallback.dataSources.length > 0 ? fallback.dataSources : registryEntry.data_source
    const shouldUseDeterministic = isMeaningfulDeterministicSection(sourceValue)

    if (!shouldUseDeterministic && !isUsefulWorkshopRelationalFallback(paragraph)) {
      return []
    }

    if (!isMeaningfulDeterministicSection(paragraph)) {
      return []
    }

    const leadParagraph = `${mechanic} and ${spec.counterpartLabel} Interaction. ${paragraph}`

    return [
      buildRelationalKbChunk({
        chunk_id: `workshop_${normalizeChunkSlug(definition.key)}_${normalizeChunkSlug(spec.sectionName)}_01`,
        source: 'Workshop Wiki',
        section: 'Workshop',
        topic: `${definition.label} ${spec.topicSuffix}`,
        title: `${mechanic} ${spec.titleSuffix}`,
        disambiguation: spec.disambiguation(mechanic, definition.label),
        data_source: dataSources,
        is_base_mechanic: false,
        mechanics: spec.mechanics(mechanic, definition.label),
        interaction_type: spec.interactionType,
        interaction_summary: spec.interactionSummary(definition.label),
        tags: ['workshop', definition.category, normalizeChunkSlug(definition.label).replace(/_/g, ' '), ...spec.tags],
        paragraphs: [leadParagraph],
      }),
    ]
  })
}

function buildWorkshopStatChunk(definition: WorkshopStatDefinition, deterministicEntry?: WorkshopDeterministicStatEntry): KBChunkRecord {
  const mechanic = buildWorkshopStatMechanicName(definition)
  const definitionParagraph = buildWorkshopStatSummaryParagraph(definition)
  const workshopSupport = buildWorkshopSection(definition)
  const formulaParagraph = deterministicEntry?.sections.Formula
    ? `Formula. ${deterministicEntry.sections.Formula.replace(/\n+/g, ' ')}`
    : ''

  return buildAtomicKbChunk({
    chunk_id: `workshop_${normalizeChunkSlug(definition.key)}_stat_01`,
    source: 'Workshop Site Data',
    section: 'Workshop',
    topic: `${WORKSHOP_CATEGORY_TITLES[definition.category]} Workshop Stats`,
    title: mechanic,
    disambiguation: readDeterministicDisambiguation(deterministicEntry, `This chunk is about the ${mechanic} mechanic itself, not its interactions. It is not about the ${definition.label} Enhancement row, unrelated ${WORKSHOP_CATEGORY_TITLES[definition.category]} stats, or tracker recommendations.`),
    data_source: workshopSupport.dataSources,
    is_base_mechanic: false,
    mechanics: [mechanic],
    tags: ['workshop', 'site data', definition.category, normalizeChunkSlug(definition.label).replace(/_/g, ' '), ...extractDeterministicAliases(deterministicEntry)],
    paragraphs: [
      readDeterministicDefinition(deterministicEntry, definitionParagraph),
      buildDeterministicMetadataParagraph(deterministicEntry),
      formulaParagraph,
      readDeterministicSection(deterministicEntry, 'Workshop', workshopSupport.paragraph),
    ].filter(Boolean),
  })
}

function getEnhancementDefinition(entry: WorkshopEnhancementSourceEntry): EnhancementDefinition {
  const definition = ENHANCEMENT_DEFINITIONS.find(candidate => candidate.sourceName === entry.name)
  if (!definition) {
    throw new Error(`Missing Workshop enhancement definition for source entry: ${entry.name}`)
  }
  return definition
}

function buildCategorySummaryParagraph(entries: WorkshopEnhancementSourceEntry[], categoryTitle: string): string {
  const statNames = entries.map(entry => entry.name).join(', ')
  return `${categoryTitle} Enhancements follow a spend ladder within their own category. The ${categoryTitle.toLowerCase()} row on the workshop page lists ${statNames}, and each new unlock requires more coins spent on earlier ${categoryTitle.toLowerCase()} enhancements of the same type.`
}

function buildCategoryThresholdParagraph(entries: WorkshopEnhancementSourceEntry[]): string {
  return entries
    .map(entry => `${entry.name}: ${entry.description}`)
    .join(' ')
}

export function buildWorkshopCanonicalKbChunks(): KBChunkRecord[] {
  const document = loadWorkshopSourceDocument()
  const workshopEntry = getRequiredNamingRegistryEntryBySource('workshop', 'workshop')
  const workshopStatDefinitions = getWorkshopSiteStatDefinitions()
  const deterministicStatEntryMap = new Map(document.deterministicStatEntries.map(entry => [entry.stat, entry]))
  const workshopCategoryChunks = (Object.keys(WORKSHOP_CATEGORY_TITLES) as WorkshopCategory[])
    .map(category => buildWorkshopCategoryOverviewChunk(
      workshopStatDefinitions.filter(definition => definition.category === category),
      category,
    ))
  const workshopStatChunks = workshopStatDefinitions.map(definition => buildWorkshopStatChunk(
    definition,
    deterministicStatEntryMap.get(definition.label),
  ))
  const workshopStatRelationalChunks = workshopStatDefinitions.flatMap(definition => buildWorkshopStatRelationalChunks(
    definition,
    deterministicStatEntryMap.get(definition.label),
  ))

  const categoryChunks = (Object.entries(CATEGORY_TITLES) as Array<[WorkshopEnhancementCategory, string]>).map(([category, categoryTitle]) => {
    const entries = document.enhancementEntries.filter(entry => entry.category === category)
    const dataSources = entries.map(entry => getRequiredNamingRegistryEntryBySource('workshop_enhancements', getEnhancementDefinition(entry).key).data_source)

    return buildAtomicKbChunk({
      chunk_id: `workshop_${category}_enhancement_ladder_01`,
      source: 'Workshop Wiki',
      section: 'Workshop',
      topic: `${categoryTitle} Enhancement Ladder`,
      title: `${categoryTitle} Enhancement Ladder`,
      disambiguation: `This chunk is about the ${categoryTitle} Enhancement Ladder mechanic itself, not its interactions. It is not about normal ${categoryTitle.toLowerCase()} workshop upgrades, unrelated categories, or a recommendation about which enhancement to buy first.`,
      data_source: dataSources,
      is_base_mechanic: false,
      mechanics: [`${categoryTitle} Enhancement Ladder`],
      tags: ['workshop', 'enhancement', category, 'unlock ladder'],
      paragraphs: [
        buildCategorySummaryParagraph(entries, categoryTitle),
        buildCategoryThresholdParagraph(entries),
      ],
    })
  })

  const enhancementChunks = document.enhancementEntries.map(entry => {
    const definition = getEnhancementDefinition(entry)
    const registryEntry = getRequiredNamingRegistryEntryBySource('workshop_enhancements', definition.key)

    return buildAtomicKbChunk({
      chunk_id: `workshop_${definition.key.toLowerCase()}_01`,
      source: 'Workshop Wiki',
      section: 'Workshop',
      topic: `${CATEGORY_TITLES[entry.category]} Enhancements`,
      title: definition.title,
      disambiguation: `This chunk is about the ${definition.title} mechanic itself, not its interactions. It is not about the normal Workshop ${entry.name} stat, unrelated ${CATEGORY_TITLES[entry.category]} enhancements, or tracker-specific planning advice.`,
      data_source: registryEntry.data_source,
      is_base_mechanic: registryEntry.is_base_mechanic,
      mechanics: [definition.mechanic],
      tags: ['workshop', 'enhancement', CATEGORY_TITLES[entry.category].toLowerCase(), entry.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()],
      paragraphs: [
        `${definition.title} is part of the ${CATEGORY_TITLES[entry.category]} Workshop Enhancement line. ${entry.description}`,
        entry.name === 'Packages'
          ? 'The workshop source labels this entry as Packages, while the site enhancement key maps it to the Recovery Package enhancement row.'
          : entry.name === 'Enemy Level Skips'
            ? 'The workshop source describes Enemy Health and Enemy Damage Level Skip together, while the site exposes Enemy Health Level Skip and Enemy Attack Level Skip as the two workshop stats affected by this enhancement.'
            : `This chunk refers to the enhancement-layer ${entry.name} entry rather than the normal Workshop ${entry.name} upgrade row.`,
      ],
    })
  })

  return [
    buildAtomicKbChunk({
      chunk_id: 'workshop_overview_01',
      source: 'Workshop Wiki',
      section: 'Workshop',
      topic: 'Workshop Overview',
      title: 'Workshop Overview',
      disambiguation: 'This chunk is about the Workshop mechanic itself, not its interactions. It is not about only Workshop Enhancements, unrelated tracker calculations, or guidance about the best upgrade order.',
      data_source: workshopEntry.data_source,
      is_base_mechanic: workshopEntry.is_base_mechanic,
      mechanics: ['Workshop'],
      tags: ['workshop', 'coins', 'cash', 'permanent upgrades'],
      paragraphs: document.overviewParagraphs,
    }),
    buildAtomicKbChunk({
      chunk_id: 'workshop_enhancement_overview_01',
      source: 'Workshop Wiki',
      section: 'Workshop',
      topic: 'Workshop Enhancements',
      title: 'Workshop Enhancements Overview',
      disambiguation: 'This chunk is about the Workshop Enhancements mechanic itself, not its interactions. It is not about the unlock gate by itself, individual enhancement rows in isolation, or unrelated Workshop calculator formulas.',
      data_source: workshopEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Workshop Enhancements'],
      tags: ['workshop', 'enhancements', 'attack', 'defense', 'utility'],
      paragraphs: [
        document.enhancementOverviewParagraph,
        'Workshop Enhancements are split into Attack, Defense, and Utility, and each category unlocks further rows by spending coins on other enhancements of the same type. The page therefore treats Workshop Enhancements as a separate layer from the normal Workshop cash-and-coin upgrades.',
      ],
    }),
    buildAtomicKbChunk({
      chunk_id: 'workshop_enhancement_unlock_01',
      source: 'Workshop Wiki',
      section: 'Workshop',
      topic: 'Workshop Enhancements',
      title: 'Unlocking Workshop Enhancements',
      disambiguation: 'This chunk is about the Workshop Enhancements unlock mechanic itself, not its interactions. It is not about general workshop upgrades, unrelated tiers, or a recommendation for which enhancement to prioritize.',
      data_source: workshopEntry.data_source,
      is_base_mechanic: false,
      mechanics: ['Workshop'],
      tags: ['workshop', 'enhancement', 'unlock', 'tier 12', 'wave 60'],
      paragraphs: [
        document.unlockParagraph,
        'The unlock question is therefore about meeting the Tier 12 Wave 60 milestone and completing the Workshop Enhancement lab, not about spending coins or stones to buy the feature directly from a separate menu.',
        'Once the unlock condition has been satisfied, enhancement-related planning becomes a normal workshop topic. Before that threshold, the correct answer is simply that the account needs the Tier 12 Wave 60 milestone, not a calculator formula or tracker workaround.',
      ],
    }),
    ...workshopCategoryChunks,
    ...workshopStatChunks,
    ...workshopStatRelationalChunks,
    ...categoryChunks,
    ...enhancementChunks,
    buildRelationalKbChunk({
      chunk_id: 'workshop_cash_bonus_support_01',
      source: 'Workshop Wiki',
      section: 'Workshop',
      topic: 'Cash Bonus Enhancement Interactions',
      title: 'Cash Bonus Enhancement Support Effects',
      disambiguation: 'This chunk describes the interaction between Cash Bonus Enhancement, Cash / Wave, and Interest / Wave, not the individual mechanics. It is not about Coin Bonus Enhancement, package mechanics, or unrelated utility upgrades.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('workshop_enhancements', 'WSP_CASH_BONUS').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Cash / Wave').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Interest / Wave').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Cash Bonus Enhancement', 'Cash / Wave', 'Interest / Wave'],
      interaction_type: 'synergy',
      interaction_summary: 'Cash Bonus Enhancement also improves Cash / Wave and Interest / Wave as part of its utility scaling.',
      tags: ['workshop', 'enhancement', 'cash bonus', 'cash per wave', 'interest'],
      paragraphs: [
        'Cash Bonus Enhancement Support Effects. The workshop source states that Cash Bonus Enhancement also increases Cash / Wave and Interest / Wave by 1% each upgrade in addition to raising the Cash Bonus multiplier itself.',
        'This means Cash Bonus Enhancement is not only a direct multiplier row. It also boosts the utility income stats tied to Cash / Wave and Interest / Wave, so questions about that enhancement should not be limited to the visible cash multiplier alone.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'workshop_coin_bonus_squared_01',
      source: 'Workshop Wiki',
      section: 'Workshop',
      topic: 'Coin Bonus Enhancement Interactions',
      title: 'Coin Bonus Enhancement Squared Effect',
      disambiguation: 'This chunk describes the interaction between Coin Bonus Enhancement and Coins / Kill Bonus, not the individual mechanics. It is not about Cash Bonus Enhancement, unrelated utility rows, or a general coin farming guide.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('workshop_enhancements', 'WSP_COIN_BONUS').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Coins / Kill Bonus').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Coin Bonus Enhancement', 'Coins / Kill Bonus'],
      interaction_type: 'multiplicative',
      interaction_summary: 'Coin Bonus Enhancement contributes to overall coin gain through Coins / Kill Bonus and the source describes the result as effectively squared.',
      tags: ['workshop', 'enhancement', 'coin bonus', 'coins per kill'],
      paragraphs: [
        'Coin Bonus Enhancement Squared Effect. The workshop source says Coin Bonus Enhancement affects both tier bonus and Coins / Kill Bonus, which is why the overall benefit is described as squared rather than as a single isolated multiplier.',
        'For site-facing Workshop data, the directly exposed workshop stat in that interaction is Coins / Kill Bonus. Retrieval therefore needs to understand that Coin Bonus Enhancement questions can overlap with Coins / Kill Bonus even when the prompt only mentions coin bonus scaling.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'workshop_recovery_package_support_01',
      source: 'Workshop Wiki',
      section: 'Workshop',
      topic: 'Recovery Package Enhancement Interactions',
      title: 'Recovery Package Enhancement Support Effects',
      disambiguation: 'This chunk describes the interaction between Recovery Package Enhancement, Recovery Amount, and Max Recovery, not the individual mechanics. It is not about Package Chance, unrelated utility upgrades, or cash bonus behavior.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('workshop_enhancements', 'WSP_RECOVERY_PACKAGE').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Recovery Amount').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Max Recovery').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Recovery Package Enhancement', 'Recovery Amount', 'Max Recovery'],
      interaction_type: 'synergy',
      interaction_summary: 'Recovery Package Enhancement raises both Recovery Amount and Max Recovery together.',
      tags: ['workshop', 'enhancement', 'recovery package', 'recovery amount', 'max recovery'],
      paragraphs: [
        'Recovery Package Enhancement Support Effects. The workshop source labels this enhancement row as Packages and states that it increases Max Recovery Package and Recovery Amount by x1 when unlocked and by 0.01x per level afterward.',
        'In the site workshop data, that maps to the Recovery Amount and Max Recovery stats being supported by the same enhancement row. Questions about package enhancement scaling therefore overlap with both Recovery Amount and Max Recovery rather than a single isolated value.',
      ],
    }),
    buildRelationalKbChunk({
      chunk_id: 'workshop_enemy_level_skip_support_01',
      source: 'Workshop Wiki',
      section: 'Workshop',
      topic: 'Enemy Level Skip Enhancement Interactions',
      title: 'Enemy Level Skip Enhancement Support Effects',
      disambiguation: 'This chunk describes the interaction between Enemy Level Skip Enhancement, Enemy Attack Level Skip, and Enemy Health Level Skip, not the individual mechanics. It is not about package mechanics, orb size, or unrelated utility upgrades.',
      data_source: [
        getRequiredNamingRegistryEntryBySource('workshop_enhancements', 'WSP_ENEMY_LEVEL_SKIP').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Enemy Attack Level Skip').data_source,
        getRequiredNamingRegistryEntryBySource('workshop', 'Enemy Health Level Skip').data_source,
      ],
      is_base_mechanic: false,
      mechanics: ['Enemy Level Skip Enhancement', 'Enemy Attack Level Skip', 'Enemy Health Level Skip'],
      interaction_type: 'synergy',
      interaction_summary: 'Enemy Level Skip Enhancement raises both Enemy Attack Level Skip and Enemy Health Level Skip together.',
      tags: ['workshop', 'enhancement', 'enemy level skip', 'enemy attack level skip', 'enemy health level skip'],
      paragraphs: [
        'Enemy Level Skip Enhancement Support Effects. The workshop source says this enhancement increases Enemy Health and Enemy Damage Level Skip together. In the site workshop data, the exposed pair is Enemy Attack Level Skip and Enemy Health Level Skip.',
        'That means Enemy Level Skip Enhancement questions should be interpreted as affecting both skip stats together. It is a shared utility enhancement row rather than a separate upgrade for only one of the two enemy level skip stats.',
      ],
    }),
  ]
}
