import { GearItem, NPC, Quest, Zone } from '../types/game';
import { 
  generateOverworldMap, 
  generateCaveMap, 
  generateCitadelMap, 
  generatePeaksMap, 
  generateSanctumMap 
} from './mapGenerator';

// Starting equipment
export const STARTING_GEAR: {
  weapon: GearItem;
  offhand: GearItem;
  armor: GearItem;
  helm: GearItem;
  ring: GearItem;
  amulet: GearItem;
} = {
  weapon: {
    id: 'weapon_apprentice_wand',
    name: "Apprentice's Abacus Wand",
    slot: 'weapon',
    rarity: 'common',
    attackBonus: 14,
    defenseBonus: 2,
    hpBonus: 20,
    critTimeBonus: 0.5,
    mathPerk: '+10% Arithmetic Spell Damage',
    flavorText: 'Carved from birch wood with smooth counting beads along its shaft.',
    level: 1,
    upgradeLevel: 0,
    maxUpgradeLevel: 5,
    cost: 50,
    iconName: 'wand'
  },
  offhand: {
    id: 'offhand_wooden_slate',
    name: 'Chalkboard Buckler',
    slot: 'offhand',
    rarity: 'common',
    attackBonus: 4,
    defenseBonus: 12,
    hpBonus: 35,
    critTimeBonus: 0.2,
    mathPerk: 'Deflects 5% incoming chaos damage',
    flavorText: 'A sturdy shield inscribed with quick multiplication formulas.',
    level: 1,
    upgradeLevel: 0,
    maxUpgradeLevel: 5,
    cost: 40,
    iconName: 'shield'
  },
  armor: {
    id: 'armor_initiate_robe',
    name: 'Initiate Mathematician Robes',
    slot: 'armor',
    rarity: 'common',
    attackBonus: 5,
    defenseBonus: 14,
    hpBonus: 50,
    critTimeBonus: 0.3,
    mathPerk: '+10 Maximum Mana',
    flavorText: 'Woven with threads arranged in prime number counts.',
    level: 1,
    upgradeLevel: 0,
    maxUpgradeLevel: 5,
    cost: 60,
    iconName: 'shirt'
  },
  helm: {
    id: 'helm_scholars_circlet',
    name: "Scholar's Focus Circlet",
    slot: 'helm',
    rarity: 'common',
    attackBonus: 6,
    defenseBonus: 6,
    hpBonus: 25,
    critTimeBonus: 0.5,
    mathPerk: '+0.5s Critical Hit Reaction Window',
    flavorText: 'Helps clear the mind for instantaneous calculations.',
    level: 1,
    upgradeLevel: 0,
    maxUpgradeLevel: 5,
    cost: 45,
    iconName: 'crown'
  },
  ring: {
    id: 'ring_brass_ratio',
    name: 'Brass Ratio Band',
    slot: 'ring',
    rarity: 'common',
    attackBonus: 5,
    defenseBonus: 4,
    hpBonus: 15,
    critTimeBonus: 0.3,
    mathPerk: '+5% Bonus Gold from mathematical victories',
    flavorText: 'Polished ring shaped with the curvature of a logarithmic spiral.',
    level: 1,
    upgradeLevel: 0,
    maxUpgradeLevel: 5,
    cost: 55,
    iconName: 'circle-dot'
  },
  amulet: {
    id: 'amulet_prime_charm',
    name: 'Pendant of the Number 7',
    slot: 'amulet',
    rarity: 'common',
    attackBonus: 8,
    defenseBonus: 5,
    hpBonus: 30,
    critTimeBonus: 0.4,
    mathPerk: '+15% Damage on questions with prime answers',
    flavorText: 'The number 7 glows faintly with untamed prime energy.',
    level: 1,
    upgradeLevel: 0,
    maxUpgradeLevel: 5,
    cost: 70,
    iconName: 'gem'
  }
};

// World Gear Catalog
export const ARMORY_ITEMS: GearItem[] = [
  {
    id: 'blade_pythagoras',
    name: 'Blade of Pythagoras',
    slot: 'weapon',
    rarity: 'epic',
    attackBonus: 42,
    defenseBonus: 8,
    hpBonus: 85,
    critTimeBonus: 0.8,
    mathPerk: '+35% Damage when solving Geometry & Triangle equations',
    flavorText: 'Forged along the precise hypotenuse of the sacred 3-4-5 right triangle.',
    level: 4,
    upgradeLevel: 0,
    maxUpgradeLevel: 7,
    cost: 250,
    iconName: 'sword'
  },
  {
    id: 'staff_exponential_fury',
    name: 'Staff of Exponential Growth',
    slot: 'weapon',
    rarity: 'legendary',
    attackBonus: 62,
    defenseBonus: 14,
    hpBonus: 130,
    critTimeBonus: 1.0,
    mathPerk: 'Critical hits double your next turn attack power (2^x strike)',
    flavorText: 'Harnesses powers and exponents that double with every mathematical step.',
    level: 7,
    upgradeLevel: 0,
    maxUpgradeLevel: 10,
    cost: 600,
    iconName: 'zap'
  },
  {
    id: 'aegis_of_euclid',
    name: "Euclid's Aegis of Symmetry",
    slot: 'offhand',
    rarity: 'epic',
    attackBonus: 14,
    defenseBonus: 38,
    hpBonus: 150,
    critTimeBonus: 0.6,
    mathPerk: 'Absorbs 25% damage; 100% block chance on super critical answers',
    flavorText: 'An indestructible tessellated shield composed of 12 regular pentagons.',
    level: 5,
    upgradeLevel: 0,
    maxUpgradeLevel: 7,
    cost: 320,
    iconName: 'shield'
  },
  {
    id: 'robe_infinite_pi',
    name: 'Vestments of Transcendent Pi',
    slot: 'armor',
    rarity: 'legendary',
    attackBonus: 24,
    defenseBonus: 44,
    hpBonus: 190,
    critTimeBonus: 0.9,
    mathPerk: '+3.1415% Mana regeneration per turn, +20% All Spell Damage',
    flavorText: 'The decimals of Pi flow continuously across the silk in radiant gold.',
    level: 8,
    upgradeLevel: 0,
    maxUpgradeLevel: 10,
    cost: 750,
    iconName: 'sparkles'
  },
  {
    id: 'crown_of_axioms',
    name: 'Crown of Immutable Axioms',
    slot: 'helm',
    rarity: 'mythic',
    attackBonus: 36,
    defenseBonus: 34,
    hpBonus: 180,
    critTimeBonus: 1.5,
    mathPerk: 'Extends Critical Hit timer by +1.5s; fast solves trigger SUPER CRIT (3x)',
    flavorText: 'Worn by the First Arithmancer who proved the balance of the universe.',
    level: 10,
    upgradeLevel: 0,
    maxUpgradeLevel: 10,
    cost: 1200,
    iconName: 'crown'
  },
  {
    id: 'ring_fibonacci',
    name: 'Loop of Fibonacci',
    slot: 'ring',
    rarity: 'rare',
    attackBonus: 18,
    defenseBonus: 12,
    hpBonus: 65,
    critTimeBonus: 0.6,
    mathPerk: 'Each consecutive correct answer increases attack by +10% (stacks up to 5x)',
    flavorText: '0, 1, 1, 2, 3, 5, 8, 13, 21... The spiral of supreme natural harmony.',
    level: 3,
    upgradeLevel: 0,
    maxUpgradeLevel: 5,
    cost: 180,
    iconName: 'circle'
  },
  {
    id: 'amulet_absolute_value',
    name: 'Talisman of Absolute Value',
    slot: 'amulet',
    rarity: 'epic',
    attackBonus: 24,
    defenseBonus: 20,
    hpBonus: 95,
    critTimeBonus: 0.7,
    mathPerk: 'Converts negative enemy statuses into positive shields |x|',
    flavorText: 'No matter how deep the negative void, it turns everything into pure light.',
    level: 6,
    upgradeLevel: 0,
    maxUpgradeLevel: 8,
    cost: 380,
    iconName: 'gem'
  }
];

// NPCs in the world
export const WORLD_NPCS: NPC[] = [
  {
    id: 'npc_eldrin',
    name: 'Sage Eldrin',
    title: 'Keeper of the Prime Axioms',
    zoneId: 'arithmia_town',
    x: 24,
    y: 56,
    avatarIcon: 'sparkles',
    greeting: 'Greetings, chosen Arithmancer. Look around you—the mountains, the Great River, the lakes! All of it is held together by pure mathematical balance!',
    dialogue: [
      {
        text: 'The Null Sovereign has shattered the Cosmic Equation. Enter the Whispering Caves in the western mountains, or cross the great river bridges to the Royal Citadel! Can you restore the realm?',
        choices: [
          { text: 'I am ready for my quest, Sage.', action: 'quest', questId: 'quest_main_1' },
          { text: 'How do I reach the Whispering Caves?', action: 'lore' },
          { text: 'Farewell for now.', action: 'close' }
        ]
      }
    ],
    questsOffered: ['quest_main_1', 'quest_main_2']
  },
  {
    id: 'npc_vulcan',
    name: 'Vulcan of Heptagon',
    title: 'Master Runesmith',
    zoneId: 'arithmia_town',
    x: 20,
    y: 59,
    avatarIcon: 'hammer',
    greeting: 'Welcome to the Heptagonal Forge! Give me Math Runes and gold, and I will hone your weapons to mathematical perfection.',
    dialogue: [
      {
        text: 'Every blade requires symmetry; every shield needs geometric balance. Solve forge equations with me and I shall grant masterwork upgrades!',
        choices: [
          { text: 'Open the Runeforge', action: 'forge' },
          { text: 'Browse shop gear', action: 'shop' },
          { text: 'Leave forge', action: 'close' }
        ]
      }
    ],
    questsOffered: ['quest_side_forge'],
    shopItems: [
      ARMORY_ITEMS[5], // Ring of Fibonacci
      {
        id: 'potion_hp_pack',
        name: 'Elixir of Integer Restoration (x3)',
        slot: 'amulet',
        rarity: 'common',
        attackBonus: 0,
        defenseBonus: 5,
        hpBonus: 50,
        critTimeBonus: 0,
        mathPerk: 'Consumable: Restores 100 HP during battle',
        flavorText: 'Restores vitality through balanced algebraic nutrition.',
        level: 1,
        upgradeLevel: 0,
        maxUpgradeLevel: 1,
        cost: 60,
        iconName: 'heart'
      }
    ]
  },
  {
    id: 'npc_bernard',
    name: 'Baker Bernard',
    title: 'Master of Proportions',
    zoneId: 'arithmia_town',
    x: 28,
    y: 58,
    avatarIcon: 'cake',
    greeting: 'Ah, warm pastries fresh out of the oven! But oh dear, dividing 5 pies among 8 hungry knights is driving me mad!',
    dialogue: [
      {
        text: 'Fractions are everywhere in baking—half a cup of sugar, three-quarters yeast! Will you help me balance the order books?',
        choices: [
          { text: 'Help Bernard with his bakery order', action: 'quest', questId: 'quest_side_baker' },
          { text: 'Just passing by, smells delicious!', action: 'close' }
        ]
      }
    ],
    questsOffered: ['quest_side_baker']
  },
  {
    id: 'npc_king_euclid',
    name: 'King Euclidian',
    title: 'Monarch of the Citadel',
    zoneId: 'prime_citadel',
    x: 24,
    y: 11,
    avatarIcon: 'crown',
    greeting: 'Welcome to the Citadel of the Prime, Arithmancer. In our halls, truth is demonstrated by rigorous proof!',
    dialogue: [
      {
        text: 'Our royal guard is stretched thin. The Null Sovereign has corrupted the high peaks with variable chaos. Take our royal blessing and the Citadel Aegis!',
        choices: [
          { text: 'Accept the King’s Mission', action: 'quest', questId: 'quest_main_3' },
          { text: 'Bow and leave', action: 'close' }
        ]
      }
    ],
    questsOffered: ['quest_main_3']
  },
  {
    id: 'npc_hypatia',
    name: 'Archivist Lady Hypatia',
    title: 'Grand Astrologer of Algebra',
    zoneId: 'prime_citadel',
    x: 36,
    y: 18,
    avatarIcon: 'book-open',
    greeting: 'The stars themselves trace conic sections and elliptic orbits. Have you studied the unknown variable x?',
    dialogue: [
      {
        text: 'When an equation has an unknown x, do not fear! What you do unto the left side, you must do unto the right side. That is the divine Law of Equivalence.',
        choices: [
          { text: 'Guide me to the Fractured Peaks', action: 'quest', questId: 'quest_main_4' },
          { text: 'Thank you for the wisdom', action: 'close' }
        ]
      }
    ],
    questsOffered: ['quest_main_4']
  }
];

// Quests
export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest_main_1',
    title: 'The Shattered Great Equation',
    subtitle: 'Chapter I: The Awakening',
    giverName: 'Sage Eldrin',
    zoneId: 'arithmia_town',
    type: 'main',
    storyExcerpt: 'The Null Sovereign has shattered the Cosmic Equation of Balance. Without mathematics, the kingdom fractures into irrational entropy. Eldrin urges you to prepare.',
    objectives: [
      { id: 'q1_1', text: 'Speak with Sage Eldrin in Arithmia Village', current: 0, target: 1, completed: false },
      { id: 'q1_2', text: 'Solve 3 practice equations to attune your Arithmancy', current: 0, target: 3, completed: false }
    ],
    rewards: {
      xp: 150,
      gold: 80,
      runes: 3,
      item: {
        id: 'ring_apprentice_focus',
        name: 'Ring of Quick Factors',
        slot: 'ring',
        rarity: 'rare',
        attackBonus: 14,
        defenseBonus: 8,
        hpBonus: 40,
        critTimeBonus: 0.5,
        mathPerk: '+15% Crit chance on multiplication',
        flavorText: 'Granted by Sage Eldrin to swift thinkers.',
        level: 2,
        upgradeLevel: 0,
        maxUpgradeLevel: 5,
        cost: 120,
        iconName: 'circle'
      }
    },
    status: 'active'
  },
  {
    id: 'quest_main_2',
    title: 'Echoes of the Whispering Caves',
    subtitle: 'Chapter II: The Geometry Vault',
    giverName: 'Sage Eldrin',
    zoneId: 'whispering_caves',
    type: 'main',
    storyExcerpt: 'Trek into the western mountain cliff and enter the Whispering Caves. Navigate the subterranean labyrinth to defeat the Crystal Golem of Euclid and recover the Tome of Pythagoras.',
    objectives: [
      { id: 'q2_1', text: 'Find and enter the Whispering Caves in the western mountains', current: 0, target: 1, completed: false },
      { id: 'q2_2', text: 'Defeat 2 Cave Slimes with arithmetic', current: 0, target: 2, completed: false },
      { id: 'q2_3', text: 'Vanquish the Crystal Golem of Euclid deep inside the cave', current: 0, target: 1, completed: false }
    ],
    rewards: {
      xp: 400,
      gold: 200,
      runes: 8,
      item: ARMORY_ITEMS[0] // Blade of Pythagoras
    },
    status: 'available'
  },
  {
    id: 'quest_main_3',
    title: 'Audience at the Citadel',
    subtitle: 'Chapter III: The Royal Calculus',
    giverName: 'King Euclidian',
    zoneId: 'prime_citadel',
    type: 'main',
    storyExcerpt: 'Cross the great river bridges to the northeast Citadel of the Prime. Enter through the drawbridge gate and present yourself before King Euclidian.',
    objectives: [
      { id: 'q3_1', text: 'Travel to the Citadel of the Prime across the river', current: 0, target: 1, completed: false },
      { id: 'q3_2', text: 'Defeat the Stone Gargoyle in the Castle Hall', current: 0, target: 1, completed: false }
    ],
    rewards: {
      xp: 750,
      gold: 400,
      runes: 15,
      item: ARMORY_ITEMS[2] // Euclid's Aegis
    },
    status: 'available'
  },
  {
    id: 'quest_main_4',
    title: 'The Bridge of Unknown Variables',
    subtitle: 'Chapter IV: Fractured Peaks',
    giverName: 'Archivist Lady Hypatia',
    zoneId: 'fractured_peaks',
    type: 'main',
    storyExcerpt: 'Ascend the northwestern mountain pass into the sky islands. Cross the celestial runic bridges solving for x and y.',
    objectives: [
      { id: 'q4_1', text: 'Reach the Fractured Peaks of Algebra', current: 0, target: 1, completed: false },
      { id: 'q4_2', text: 'Defeat 3 Algebraic Specters solving for x', current: 0, target: 3, completed: false }
    ],
    rewards: {
      xp: 1200,
      gold: 650,
      runes: 25,
      item: ARMORY_ITEMS[1] // Staff of Exponential Growth
    },
    status: 'available'
  },
  {
    id: 'quest_main_5',
    title: 'The Null Sovereign’s Reckoning',
    subtitle: 'Chapter V: The Final Equation',
    giverName: 'The Cosmic Axiom Spirit',
    zoneId: 'null_sanctum',
    type: 'main',
    storyExcerpt: 'Confront the Void Lord who wields division by zero in the far northern volcanic rift.',
    objectives: [
      { id: 'q5_1', text: 'Enter the Null Sanctum in the far north', current: 0, target: 1, completed: false },
      { id: 'q5_2', text: 'Defeat the Null Sovereign in epic battle', current: 0, target: 1, completed: false }
    ],
    rewards: {
      xp: 3000,
      gold: 1500,
      runes: 50,
      item: ARMORY_ITEMS[4] // Crown of Immutable Axioms
    },
    status: 'available'
  },
  {
    id: 'quest_side_baker',
    title: 'Baker Bernard’s Fractional Recipe',
    subtitle: 'Side Quest: Culinary Math',
    giverName: 'Baker Bernard',
    zoneId: 'arithmia_town',
    type: 'side',
    storyExcerpt: 'Baker Bernard needs help dividing giant golden loaves for the town feast into equivalent fractions and percentages without spilling the enchanted yeast!',
    objectives: [
      { id: 'qs1_1', text: 'Solve 3 fraction and percentage orders for Bernard', current: 0, target: 3, completed: false }
    ],
    rewards: {
      xp: 220,
      gold: 120,
      runes: 5
    },
    status: 'available'
  },
  {
    id: 'quest_side_forge',
    title: 'Vulcan’s Runic Infusion',
    subtitle: 'Side Quest: Blacksmith Forge',
    giverName: 'Blacksmith Vulcan',
    zoneId: 'arithmia_town',
    type: 'side',
    storyExcerpt: 'Blacksmith Vulcan can infuse your gear with mathematical precision, but he needs you to solve an advanced forge equation at his anvil.',
    objectives: [
      { id: 'qs2_1', text: 'Upgrade any piece of gear at Vulcan’s Forge', current: 0, target: 1, completed: false }
    ],
    rewards: {
      xp: 250,
      gold: 100,
      runes: 10
    },
    status: 'available'
  }
];

// All Zones in the game world
export const WORLD_ZONES: Zone[] = [
  // 1. THE VAST GIGANTIC OVERWORLD (90 x 75 tiles)
  {
    id: 'arithmia_town',
    name: 'The Wilds of Numeria',
    type: 'overworld',
    ambientDescription: 'Vast realm with rugged mountain ranges, winding river deltas, the Great Lake of Axioms, Arithmia Village, and ancient cave entrances.',
    levelRange: 'Levels 1 - 4',
    themeColor: 'from-amber-950 via-slate-900 to-emerald-950',
    bgAtmosphere: 'Expansive continent with mountain passes, river bridges, and ancient stone roads.',
    width: 90,
    height: 75,
    mapGrid: generateOverworldMap(90, 75),
    defaultSpawn: { x: 24, y: 58 },
    ambientLighting: 'day',
    portals: [
      {
        id: 'portal_overworld_to_caves',
        name: 'Whispering Caves Entrance',
        targetZoneId: 'whispering_caves',
        x: 15,
        y: 32,
        targetX: 8,
        targetY: 35
      },
      {
        id: 'portal_overworld_to_citadel',
        name: 'Citadel Drawbridge Gate',
        targetZoneId: 'prime_citadel',
        x: 68,
        y: 25,
        targetX: 24,
        targetY: 33,
        requiredLevel: 2
      },
      {
        id: 'portal_overworld_to_peaks',
        name: 'Fractured Peaks Mountain Pass',
        targetZoneId: 'fractured_peaks',
        x: 18,
        y: 10,
        targetX: 8,
        targetY: 33,
        requiredLevel: 6
      },
      {
        id: 'portal_overworld_to_sanctum',
        name: 'Northern Void Rift',
        targetZoneId: 'null_sanctum',
        x: 48,
        y: 7,
        targetX: 18,
        targetY: 29,
        requiredLevel: 9
      }
    ],
    chests: [
      {
        id: 'chest_town_1',
        x: 21,
        y: 63,
        opened: false,
        gold: 60,
        runes: 3,
        item: {
          id: 'amulet_lucky_odd',
          name: 'Pendant of Odd Numbers',
          slot: 'amulet',
          rarity: 'rare',
          attackBonus: 10,
          defenseBonus: 6,
          hpBonus: 30,
          critTimeBonus: 0.4,
          mathPerk: '+15% Damage when answer is an odd number (1, 3, 5, 7, 9...)',
          flavorText: 'Humming with indivisible power.',
          level: 2,
          upgradeLevel: 0,
          maxUpgradeLevel: 5,
          cost: 90,
          iconName: 'gem'
        }
      },
      {
        id: 'chest_lake_island',
        x: 51,
        y: 41,
        opened: false,
        gold: 180,
        runes: 8,
        item: ARMORY_ITEMS[5] // Ring of Fibonacci
      },
      {
        id: 'chest_forest_clearing',
        x: 35,
        y: 45,
        opened: false,
        gold: 120,
        runes: 5
      },
      {
        id: 'chest_mountain_shrine',
        x: 11,
        y: 20,
        opened: false,
        gold: 240,
        runes: 10
      }
    ],
    npcs: [WORLD_NPCS[0], WORLD_NPCS[1], WORLD_NPCS[2]],
    enemies: [
      {
        id: 'enemy_training_dummy',
        name: 'Wild Decimal Sprite',
        title: 'Roadside Mischief Maker',
        zoneId: 'arithmia_town',
        level: 1,
        maxHp: 65,
        currentHp: 65,
        attack: 8,
        defense: 2,
        sprite: 'dummy',
        categoryAffinity: 'arithmetic',
        weaknessLabel: 'Weak against Fast Addition & Multiplication',
        dialogQuote: '"BZZT... Can you calculate my speed before I vanish?"',
        isBoss: false,
        xpReward: 35,
        goldReward: 25,
        runeReward: 1
      },
      {
        id: 'enemy_lake_serpent',
        name: 'Lake Wyrm of Axioms',
        title: 'Guardian of the Great River',
        zoneId: 'arithmia_town',
        level: 3,
        maxHp: 140,
        currentHp: 140,
        attack: 18,
        defense: 7,
        sprite: 'sprite',
        categoryAffinity: 'arithmetic',
        weaknessLabel: 'Weak against Multiplication Tables',
        dialogQuote: '"HISS! The waters of the Axiom lake will swallow you!"',
        isBoss: false,
        xpReward: 85,
        goldReward: 60,
        runeReward: 3
      }
    ]
  },

  // 2. THE WHISPERING CAVES OF GEOMETRY (56 x 46 tiles)
  {
    id: 'whispering_caves',
    name: 'Whispering Caves of Geometry',
    type: 'cave',
    ambientDescription: 'Labyrinthine subterranean cavern complex with winding stone tunnels, glowing cyan crystals, and underground pools.',
    levelRange: 'Levels 3 - 5',
    themeColor: 'from-blue-950 via-slate-950 to-indigo-950',
    bgAtmosphere: 'Dark subterranean caverns with narrow stone passages, echo chambers, and glowing crystals.',
    width: 56,
    height: 46,
    mapGrid: generateCaveMap(56, 46),
    defaultSpawn: { x: 8, y: 35 },
    ambientLighting: 'cave',
    portals: [
      {
        id: 'portal_cave_to_overworld',
        name: 'Ladder to Overworld Wilds',
        targetZoneId: 'arithmia_town',
        x: 8,
        y: 36,
        targetX: 16,
        targetY: 32
      }
    ],
    chests: [
      {
        id: 'chest_caves_1',
        x: 9,
        y: 8,
        opened: false,
        gold: 200,
        runes: 8,
        item: ARMORY_ITEMS[0] // Blade of Pythagoras
      },
      {
        id: 'chest_caves_2',
        x: 44,
        y: 28,
        opened: false,
        gold: 250,
        runes: 10
      }
    ],
    npcs: [],
    enemies: [
      {
        id: 'enemy_cave_bat',
        name: 'Perimeter Shadow-Bat',
        title: 'Cave Stalker',
        zoneId: 'whispering_caves',
        level: 3,
        maxHp: 130,
        currentHp: 130,
        attack: 18,
        defense: 6,
        sprite: 'bat',
        categoryAffinity: 'geometry',
        weaknessLabel: 'Weak against Perimeter & Area Equations',
        dialogQuote: '"SCREECH! Measure my wingspan or feel my fangs!"',
        isBoss: false,
        xpReward: 90,
        goldReward: 65,
        runeReward: 4
      },
      {
        id: 'enemy_golem_boss',
        name: 'Crystal Golem of Euclid',
        title: 'Guardian of the Sacred Hypotenuse',
        zoneId: 'whispering_caves',
        level: 5,
        maxHp: 280,
        currentHp: 280,
        attack: 26,
        defense: 16,
        sprite: 'golem',
        categoryAffinity: 'geometry',
        weaknessLabel: 'Weak against Pythagorean Theorem & Area of Triangles',
        dialogQuote: '"ONLY THOSE WHO MASTER A-SQUARED PLUS B-SQUARED SHALL PASS!"',
        isBoss: true,
        xpReward: 350,
        goldReward: 250,
        runeReward: 12,
        guaranteedDrop: ARMORY_ITEMS[0] // Blade of Pythagoras
      }
    ]
  },

  // 3. CITADEL OF THE PRIME (48 x 38 tiles)
  {
    id: 'prime_citadel',
    name: 'Citadel of the Prime',
    type: 'castle',
    ambientDescription: 'Grand stone castle keep with crimson velvet carpets, marble pillars, royal guards, and King Euclidian’s Throne.',
    levelRange: 'Levels 5 - 8',
    themeColor: 'from-amber-950 via-slate-900 to-purple-950',
    bgAtmosphere: 'Regal fortress with velvet carpets, suit of armors, royal banners, and grand library balconies.',
    width: 48,
    height: 38,
    mapGrid: generateCitadelMap(48, 38),
    defaultSpawn: { x: 24, y: 33 },
    ambientLighting: 'castle',
    portals: [
      {
        id: 'portal_citadel_to_overworld',
        name: 'Castle Drawbridge Gate',
        targetZoneId: 'arithmia_town',
        x: 24,
        y: 34,
        targetX: 68,
        targetY: 26
      }
    ],
    chests: [
      {
        id: 'chest_citadel_vault',
        x: 10,
        y: 12,
        opened: false,
        gold: 350,
        runes: 18,
        item: ARMORY_ITEMS[6] // Amulet of Absolute Value
      }
    ],
    npcs: [WORLD_NPCS[3], WORLD_NPCS[4]],
    enemies: [
      {
        id: 'enemy_pemdas_gargoyle',
        name: 'Gargoyle of PEMDAS',
        title: 'Stone Guardian of Precedence',
        zoneId: 'prime_citadel',
        level: 6,
        maxHp: 220,
        currentHp: 220,
        attack: 28,
        defense: 14,
        sprite: 'gargoyle',
        categoryAffinity: 'arithmetic',
        weaknessLabel: 'Weak against Order of Operations',
        dialogQuote: '"Parentheses first, mortal! Break my order and turn to dust!"',
        isBoss: false,
        xpReward: 200,
        goldReward: 140,
        runeReward: 8
      }
    ]
  },

  // 4. FRACTURED PEAKS OF ALGEBRA (44 x 40 tiles)
  {
    id: 'fractured_peaks',
    name: 'Fractured Peaks of Algebra',
    type: 'peaks',
    ambientDescription: 'Floating sky islands hovering amid starry clouds, connected by bridges of unknown variables.',
    levelRange: 'Levels 8 - 11',
    themeColor: 'from-violet-950 via-slate-900 to-sky-950',
    bgAtmosphere: 'Floating rock crags surrounded by swirling nebula clouds, purple lightning, and Cartesian coordinates.',
    width: 44,
    height: 40,
    mapGrid: generatePeaksMap(44, 40),
    defaultSpawn: { x: 8, y: 33 },
    ambientLighting: 'night',
    portals: [
      {
        id: 'portal_peaks_to_overworld',
        name: 'Descent Path to Numeria',
        targetZoneId: 'arithmia_town',
        x: 8,
        y: 34,
        targetX: 18,
        targetY: 11
      }
    ],
    chests: [
      {
        id: 'chest_peaks_obelisk',
        x: 36,
        y: 10,
        opened: false,
        gold: 500,
        runes: 25,
        item: ARMORY_ITEMS[3] // Robe of Transcendent Pi
      }
    ],
    npcs: [],
    enemies: [
      {
        id: 'enemy_algebraic_phantom',
        name: 'Phantom of the Variable X',
        title: 'Linear Equation Specter',
        zoneId: 'fractured_peaks',
        level: 9,
        maxHp: 340,
        currentHp: 340,
        attack: 42,
        defense: 22,
        sprite: 'phantom',
        categoryAffinity: 'equations',
        weaknessLabel: 'Weak against Two-Step Linear Equations (ax + b = c)',
        dialogQuote: '"I am unknown! Isolate me if your intellect dares!"',
        isBoss: false,
        xpReward: 420,
        goldReward: 260,
        runeReward: 14
      },
      {
        id: 'enemy_storm_griffin',
        name: 'Storm Griffin of Exponents',
        title: 'Apex Sovereign of the Peaks',
        zoneId: 'fractured_peaks',
        level: 10,
        maxHp: 480,
        currentHp: 480,
        attack: 52,
        defense: 25,
        sprite: 'griffin',
        categoryAffinity: 'exponents_roots',
        weaknessLabel: 'Weak against Exponents & Square Roots',
        dialogQuote: '"CAWWWW! My lightning grows with power 2 to the Nth!"',
        isBoss: true,
        xpReward: 750,
        goldReward: 450,
        runeReward: 25,
        guaranteedDrop: ARMORY_ITEMS[1] // Staff of Exponential Growth
      }
    ]
  },

  // 5. THE NULL SANCTUM (36 x 36 tiles)
  {
    id: 'null_sanctum',
    name: 'The Null Sanctum',
    type: 'sanctum',
    ambientDescription: 'The edge of non-existence. Obsidian pillars float around the shattered Cosmic Balance, pulsing with void energy.',
    levelRange: 'Levels 11 - 15',
    themeColor: 'from-purple-950 via-slate-950 to-rose-950',
    bgAtmosphere: 'Abyssal domain of dark gravity, broken mathematical symbols drifting in the void, and an ominous throne of zero.',
    width: 36,
    height: 36,
    mapGrid: generateSanctumMap(36, 36),
    defaultSpawn: { x: 18, y: 29 },
    ambientLighting: 'void',
    portals: [
      {
        id: 'portal_sanctum_to_overworld',
        name: 'Rift back to Numeria',
        targetZoneId: 'arithmia_town',
        x: 18,
        y: 30,
        targetX: 48,
        targetY: 9
      }
    ],
    chests: [
      {
        id: 'chest_sanctum_ultimate',
        x: 8,
        y: 8,
        opened: false,
        gold: 1000,
        runes: 50,
        item: ARMORY_ITEMS[4] // Crown of Immutable Axioms
      }
    ],
    npcs: [],
    enemies: [
      {
        id: 'enemy_null_sovereign',
        name: 'The Null Sovereign',
        title: 'Lord of Division by Zero & Universal Entropy',
        zoneId: 'null_sanctum',
        level: 13,
        maxHp: 880,
        currentHp: 880,
        attack: 64,
        defense: 32,
        sprite: 'boss',
        categoryAffinity: 'equations',
        weaknessLabel: 'Weak against Lightning Critical Answers & Pure Reason',
        dialogQuote: '"I WILL DIVIDE YOUR ENTIRE REALITY BY ZERO! PREPARE FOR OBLIVION!"',
        isBoss: true,
        xpReward: 2500,
        goldReward: 2000,
        runeReward: 100,
        guaranteedDrop: ARMORY_ITEMS[4] // Crown of Axioms
      }
    ]
  }
];
