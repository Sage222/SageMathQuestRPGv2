export type AgeGrade = 
  | 'level_1' // Level 1: Novice Initiate (Ages 8-9 / Grade 3)
  | 'level_2' // Level 2: Apprentice Scholar (Ages 9-10 / Grade 4)
  | 'level_3' // Level 3: Adept Arithmancer (Ages 10-11 / Grade 5)
  | 'level_4' // Level 4: Master Algebrist (Ages 11-12 / Grades 6-7)
  | 'level_5' // Level 5: Grand Arch-Mage (Ages 13-14 / Grades 8-9)
  | 'apprentice' 
  | 'scholar' 
  | 'archmage' 
  | 'dynamic';

export interface DifficultyTier {
  level: number;
  id: AgeGrade;
  title: string;
  subtitle: string;
  ageRange: string;
  sampleQuestion: string;
  description: string;
  topics: string[];
}

export type WeatherType = 'clear' | 'rain' | 'thunderstorm' | 'snow' | 'mist';

export type MathCategory = 
  | 'arithmetic' 
  | 'fractions' 
  | 'geometry' 
  | 'prealgebra' 
  | 'exponents_roots' 
  | 'equations';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type GearSlot = 'weapon' | 'offhand' | 'armor' | 'helm' | 'ring' | 'amulet';

export interface GearItem {
  id: string;
  name: string;
  slot: GearSlot;
  rarity: ItemRarity;
  attackBonus: number;
  defenseBonus: number;
  hpBonus: number;
  critTimeBonus: number; // extra seconds added to crit window (e.g., +0.5s)
  mathPerk: string;
  flavorText: string;
  level: number;
  upgradeLevel: number;
  maxUpgradeLevel: number;
  cost: number;
  iconName: string;
}

export interface MathQuestion {
  id: string;
  gradeAge: AgeGrade;
  category: MathCategory;
  categoryLabel: string;
  prompt: string;
  displayEquation: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
  steps: string[];
  difficulty: number; // 1 to 10
}

export interface Enemy {
  id: string;
  name: string;
  title: string;
  zoneId: string;
  level: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  sprite: string;
  categoryAffinity: MathCategory;
  weaknessLabel: string;
  dialogQuote: string;
  isBoss: boolean;
  xpReward: number;
  goldReward: number;
  runeReward: number;
  guaranteedDrop?: GearItem;
}

export interface QuestObjective {
  id: string;
  text: string;
  current: number;
  target: number;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  subtitle: string;
  giverName: string;
  zoneId: string;
  type: 'main' | 'side' | 'bounty';
  storyExcerpt: string;
  objectives: QuestObjective[];
  rewards: {
    xp: number;
    gold: number;
    runes: number;
    item?: GearItem;
  };
  status: 'available' | 'active' | 'completed';
}

export interface NPC {
  id: string;
  name: string;
  title: string;
  zoneId: string;
  x: number;
  y: number;
  avatarIcon: string;
  greeting: string;
  dialogue: {
    text: string;
    choices: {
      text: string;
      action?: 'quest' | 'shop' | 'forge' | 'lore' | 'close';
      questId?: string;
    }[];
  }[];
  questsOffered: string[];
  shopItems?: GearItem[];
}

export type TileType = 
  | 'grass' 
  | 'forest' 
  | 'mountain' 
  | 'water' 
  | 'deep_water' 
  | 'sand' 
  | 'road' 
  | 'bridge' 
  | 'cave_entrance' 
  | 'cave_wall' 
  | 'cave_floor' 
  | 'cave_crystal' 
  | 'cave_exit' 
  | 'castle_wall' 
  | 'castle_floor' 
  | 'castle_carpet' 
  | 'castle_gate' 
  | 'void_wall' 
  | 'void_floor';

export interface ZonePortal {
  id: string;
  targetZoneId: string;
  name: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  requiredLevel?: number;
}

export interface TreasureChest {
  id: string;
  x: number;
  y: number;
  opened: boolean;
  requiredSolve?: boolean;
  gold: number;
  runes: number;
  item?: GearItem;
}

export interface Zone {
  id: string;
  name: string;
  type: 'town' | 'cave' | 'castle' | 'peaks' | 'sanctum' | 'overworld';
  ambientDescription: string;
  levelRange: string;
  themeColor: string;
  bgAtmosphere: string;
  width: number;
  height: number;
  mapGrid: number[][]; // 2D array of tile codes
  defaultSpawn: { x: number; y: number };
  ambientLighting: 'day' | 'cave' | 'castle' | 'night' | 'void';
  portals: ZonePortal[];
  chests: TreasureChest[];
  npcs: NPC[];
  enemies: Enemy[];
}

export interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  maxHp: number;
  currentHp: number;
  maxMp: number;
  currentMp: number;
  baseAttack: number;
  baseDefense: number;
  baseCritWindow: number; // standard crit seconds, e.g. 4.0
  gold: number;
  mathRunes: number;
  equipped: {
    weapon: GearItem;
    offhand: GearItem;
    armor: GearItem;
    helm: GearItem;
    ring: GearItem;
    amulet: GearItem;
  };
  inventory: GearItem[];
  talents: {
    [talentId: string]: number; // talent level
  };
  totalSolved: number;
  totalCrits: number;
  longestStreak: number;
  currentStreak: number;
  categoryStats: {
    [key in MathCategory]: { solved: number; correct: number };
  };
}

export type CombatActionType = 'attack' | 'pythagoras' | 'heal' | 'exponential' | 'barrier' | 'potion';

export interface CombatAction {
  id: CombatActionType;
  name: string;
  description: string;
  mpCost: number;
  preferredCategory?: MathCategory;
  iconName: string;
}
