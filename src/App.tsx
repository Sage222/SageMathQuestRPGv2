import React, { useState, useEffect } from 'react';
import { 
  AgeGrade, 
  Enemy, 
  GearItem, 
  NPC, 
  PlayerStats, 
  Quest, 
  TreasureChest, 
  Zone, 
  ZonePortal 
} from './types/game';
import { STARTING_GEAR, WORLD_ZONES, INITIAL_QUESTS } from './data/worldData';
import { WorldCanvas } from './components/WorldCanvas';
import { BattleScreen } from './components/BattleScreen';
import { DialogueModal } from './components/DialogueModal';
import { ChestPuzzleModal } from './components/ChestPuzzleModal';
import { ForgeModal } from './components/ForgeModal';
import { QuestLogModal } from './components/QuestLogModal';
import { CharacterInventoryModal } from './components/CharacterInventoryModal';
import { FastTravelModal } from './components/FastTravelModal';
import { SettingsModal } from './components/SettingsModal';
import { ShopModal } from './components/ShopModal';
import { TitleScreenModal } from './components/TitleScreenModal';
import { sound } from './utils/audio';
import confetti from 'canvas-confetti';
import { 
  Compass, 
  Scroll, 
  Hammer, 
  Backpack, 
  Settings, 
  Sparkles, 
  Heart, 
  Zap, 
  Award,
  Crown,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

const STORAGE_KEY = 'arithmancia_save_v1';

export default function App() {
  // Title screen modal state
  const [showTitleScreen, setShowTitleScreen] = useState(true);

  // Game state
  const [zones, setZones] = useState<Zone[]>(WORLD_ZONES);
  const [currentZoneId, setCurrentZoneId] = useState<string>('arithmia_town');
  const [ageGrade, setAgeGrade] = useState<AgeGrade>(() => {
    try {
      const saved = localStorage.getItem('arithmancia_grade_v1');
      if (saved) return saved as AgeGrade;
    } catch {
      // ignore
    }
    return 'level_3';
  });
  const [activeEnemy, setActiveEnemy] = useState<Enemy | null>(null);

  // Player position state (Gurk III coordinates)
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>(() => {
    try {
      const savedPos = localStorage.getItem('arithmancia_pos_v1');
      if (savedPos) return JSON.parse(savedPos);
    } catch {
      // ignore
    }
    return { x: 24, y: 58 };
  });

  // Player state
  const [player, setPlayer] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      maxHp: 120,
      currentHp: 120,
      maxMp: 60,
      currentMp: 60,
      baseAttack: 15,
      baseDefense: 8,
      baseCritWindow: 4.0,
      gold: 150,
      mathRunes: 5,
      equipped: STARTING_GEAR,
      inventory: [],
      talents: {
        quick_thinker: 0,
        axiom_focus: 0,
        golden_ratio: 0,
        euclidean_ward: 0
      },
      totalSolved: 0,
      totalCrits: 0,
      longestStreak: 0,
      currentStreak: 0,
      categoryStats: {
        arithmetic: { solved: 0, correct: 0 },
        fractions: { solved: 0, correct: 0 },
        geometry: { solved: 0, correct: 0 },
        prealgebra: { solved: 0, correct: 0 },
        exponents_roots: { solved: 0, correct: 0 },
        equations: { solved: 0, correct: 0 }
      }
    };
  });

  // Quests state
  const [quests, setQuests] = useState<Quest[]>(() => {
    try {
      const savedQuests = localStorage.getItem('arithmancia_quests_v1');
      if (savedQuests) return JSON.parse(savedQuests);
    } catch {
      // ignore
    }
    return INITIAL_QUESTS;
  });

  // Modals state
  const [activeNpc, setActiveNpc] = useState<NPC | null>(null);
  const [activeChest, setActiveChest] = useState<TreasureChest | null>(null);
  const [activeShopNpc, setActiveShopNpc] = useState<NPC | null>(null);
  const [showForge, setShowForge] = useState(false);
  const [showQuestLog, setShowQuestLog] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showFastTravel, setShowFastTravel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDefeatModal, setShowDefeatModal] = useState(false);
  const [showGameClearedModal, setShowGameClearedModal] = useState(false);

  // Banner notification
  const [bannerNotice, setBannerNotice] = useState<string | null>(
    'Welcome to Arithmancia! Explore with WASD/Arrows. Solve equations to cast spells and upgrade gear.'
  );

  // Auto-save player & quests
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
      localStorage.setItem('arithmancia_quests_v1', JSON.stringify(quests));
      localStorage.setItem('arithmancia_zone_v1', currentZoneId);
      localStorage.setItem('arithmancia_pos_v1', JSON.stringify(playerPos));
      localStorage.setItem('arithmancia_grade_v1', ageGrade);
    } catch {
      // ignore storage limit
    }
  }, [player, quests, currentZoneId, playerPos, ageGrade]);

  // Current zone object
  const currentZone = zones.find((z) => z.id === currentZoneId) || zones[0];

  // Helper notice banner
  const triggerNotice = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => {
      setBannerNotice(null);
    }, 4500);
  };

  // Player XP and Level-up system
  const addPlayerRewards = (xp: number, gold: number, runes: number, bonusItem?: GearItem) => {
    setPlayer((prev) => {
      let newXp = prev.xp + xp;
      let newLevel = prev.level;
      let newXpToNext = prev.xpToNextLevel;
      let newMaxHp = prev.maxHp;
      let newMaxMp = prev.maxMp;
      let newBaseAtk = prev.baseAttack;
      let newBaseDef = prev.baseDefense;
      let leveledUp = false;

      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel += 1;
        newXpToNext = Math.round(newXpToNext * 1.45);
        newMaxHp += 25;
        newMaxMp += 10;
        newBaseAtk += 5;
        newBaseDef += 3;
        leveledUp = true;
      }

      if (leveledUp) {
        sound.playLevelUp();
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 }
        });
        triggerNotice(`✨ LEVEL UP! You reached Level ${newLevel}! Stats increased.`);
      }

      // Check gold perk from talent
      const bonusGoldMult = 1 + ((prev.talents?.golden_ratio || 0) * 0.25);
      const earnedGold = Math.round(gold * bonusGoldMult);

      const nextInv = [...prev.inventory];
      if (bonusItem && !nextInv.some((i) => i.id === bonusItem.id)) {
        nextInv.push(bonusItem);
        triggerNotice(`🎁 Acquired gear: ${bonusItem.name}!`);
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        xpToNextLevel: newXpToNext,
        maxHp: newMaxHp,
        currentHp: newMaxHp, // full heal on level/victory
        maxMp: newMaxMp,
        currentMp: newMaxMp,
        baseAttack: newBaseAtk,
        baseDefense: newBaseDef,
        gold: prev.gold + earnedGold,
        mathRunes: prev.mathRunes + runes,
        inventory: nextInv,
        totalSolved: prev.totalSolved + 1,
        currentStreak: prev.currentStreak + 1,
        longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1)
      };
    });
  };

  // Combat victory handler
  const handleVictory = (rewards: { xp: number; gold: number; runes: number; item?: GearItem }) => {
    const defeatedBoss = activeEnemy?.isBoss;
    const isFinalBoss = activeEnemy?.id === 'enemy_null_sovereign';

    addPlayerRewards(rewards.xp, rewards.gold, rewards.runes, rewards.item);
    setActiveEnemy(null);

    // Update quest progress for defeating monsters
    setQuests((prev) =>
      prev.map((q) => {
        if (q.status !== 'active') return q;
        const updatedObjectives = q.objectives.map((obj) => {
          if (obj.text.toLowerCase().includes('defeat') || obj.text.toLowerCase().includes('vanquish')) {
            return {
              ...obj,
              current: Math.min(obj.target, obj.current + 1),
              completed: obj.current + 1 >= obj.target
            };
          }
          return obj;
        });
        return { ...q, objectives: updatedObjectives };
      })
    );

    if (isFinalBoss) {
      setShowGameClearedModal(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.4 }
      });
    } else {
      triggerNotice(`Victory! Gained +${rewards.xp} XP, +${rewards.gold} Gold, +${rewards.runes} Runes.`);
    }
  };

  // Combat defeat handler
  const handleDefeat = () => {
    setActiveEnemy(null);
    setShowDefeatModal(true);
  };

  // Revive player after defeat
  const handleRevive = () => {
    setPlayer((prev) => ({
      ...prev,
      currentHp: prev.maxHp,
      currentMp: prev.maxMp,
      currentStreak: 0
    }));
    setCurrentZoneId('arithmia_town');
    setPlayerPos({ x: 24, y: 58 });
    setShowDefeatModal(false);
    triggerNotice('Awakened back at Sage Eldrin’s Haven in Arithmia Village.');
  };

  // Chest solve success
  const handleChestSuccess = (chest: TreasureChest) => {
    sound.playChest();
    // Mark chest as opened in world
    setZones((prev) =>
      prev.map((z) =>
        z.id === currentZoneId
          ? {
              ...z,
              chests: z.chests.map((c) => (c.id === chest.id ? { ...c, opened: true } : c))
            }
          : z
      )
    );

    addPlayerRewards(50, chest.gold, chest.runes, chest.item);
    setActiveChest(null);
    triggerNotice(`Unlocked chest! Gained +${chest.gold} Gold, +${chest.runes} Runes.`);
  };

  // Portal transition (Gurk III seamless dungeon entering / exiting)
  const handleEnterPortal = (portal: ZonePortal) => {
    if (portal.requiredLevel && player.level < portal.requiredLevel) {
      sound.playWrong();
      triggerNotice(`Locked: Requires Level ${portal.requiredLevel} to cross!`);
      return;
    }

    sound.playSpell('buff');
    setCurrentZoneId(portal.targetZoneId);
    setPlayerPos({ x: portal.targetX, y: portal.targetY });
    triggerNotice(`Arrived at ${portal.name}!`);

    // Check quest objectives for visiting zones
    setQuests((prev) =>
      prev.map((q) => {
        if (q.status !== 'active') return q;
        const updatedObjs = q.objectives.map((obj) => {
          if (
            (portal.targetZoneId === 'whispering_caves' && obj.text.includes('Whispering Caves')) ||
            (portal.targetZoneId === 'prime_citadel' && obj.text.includes('Citadel')) ||
            (portal.targetZoneId === 'fractured_peaks' && obj.text.includes('Fractured Peaks')) ||
            (portal.targetZoneId === 'null_sanctum' && obj.text.includes('Null Sanctum'))
          ) {
            return { ...obj, current: obj.target, completed: true };
          }
          return obj;
        });
        return { ...q, objectives: updatedObjs };
      })
    );
  };

  // Accept a quest
  const handleAcceptQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, status: 'active' } : q))
    );
    const targetQ = quests.find((q) => q.id === questId);
    triggerNotice(`Accepted Quest: "${targetQ?.title || questId}"!`);
  };

  // Claim a quest reward
  const handleClaimQuest = (quest: Quest) => {
    setQuests((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, status: 'completed' } : q))
    );
    addPlayerRewards(quest.rewards.xp, quest.rewards.gold, quest.rewards.runes, quest.rewards.item);
    triggerNotice(`Completed Quest: "${quest.title}"! Claimed rewards.`);
  };

  // Gear Upgrade at Forge
  const handleUpgradeItem = (item: GearItem, isMasterwork: boolean) => {
    const goldCost = (item.upgradeLevel + 1) * 60;
    const runeCost = (item.upgradeLevel + 1) * 3;

    const statBonus = isMasterwork ? 10 : 6;

    const upgradedItem: GearItem = {
      ...item,
      upgradeLevel: item.upgradeLevel + 1,
      attackBonus: item.attackBonus + statBonus,
      defenseBonus: item.defenseBonus + Math.round(statBonus * 0.5),
      hpBonus: item.hpBonus + statBonus * 4,
      critTimeBonus: Number((item.critTimeBonus + (isMasterwork ? 0.2 : 0.1)).toFixed(1))
    };

    setPlayer((prev) => {
      // Check if equipped
      const nextEquipped = { ...prev.equipped };
      if (nextEquipped[item.slot]?.id === item.id) {
        nextEquipped[item.slot] = upgradedItem;
      }

      // Check if in inventory
      const nextInv = prev.inventory.map((inv) =>
        inv.id === item.id ? upgradedItem : inv
      );

      return {
        ...prev,
        gold: Math.max(0, prev.gold - goldCost),
        mathRunes: Math.max(0, prev.mathRunes - runeCost),
        equipped: nextEquipped,
        inventory: nextInv
      };
    });

    triggerNotice(
      isMasterwork
        ? `🔥 MASTERWORK FORGE! ${upgradedItem.name} +${upgradedItem.upgradeLevel} gained +${statBonus} ATK & bonus crit window!`
        : `Forged ${upgradedItem.name} to Tier +${upgradedItem.upgradeLevel}!`
    );
  };

  // Equip item
  const handleEquipItem = (item: GearItem) => {
    setPlayer((prev) => {
      const oldEquipped = prev.equipped[item.slot];
      const newInventory = prev.inventory.filter((i) => i.id !== item.id);
      if (oldEquipped) {
        newInventory.push(oldEquipped);
      }

      return {
        ...prev,
        equipped: {
          ...prev.equipped,
          [item.slot]: item
        },
        inventory: newInventory
      };
    });
    triggerNotice(`Equipped ${item.name} to ${item.slot.toUpperCase()}!`);
  };

  // Purchase item in Shop
  const handleBuyItem = (item: GearItem) => {
    setPlayer((prev) => ({
      ...prev,
      gold: prev.gold - item.cost,
      inventory: [...prev.inventory, item]
    }));
    triggerNotice(`Purchased ${item.name}! Added to bag.`);
  };

  // Unlock Talent Perk
  const handleUnlockTalent = (talentId: string) => {
    setPlayer((prev) => ({
      ...prev,
      talents: {
        ...prev.talents,
        [talentId]: (prev.talents?.[talentId] || 0) + 1
      }
    }));
    triggerNotice('Unlocked Arithmancy Talent Perk!');
  };

  // Full reset game
  const handleResetGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('arithmancia_quests_v1');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* ========================================================= */}
      {/* 1. TOP BAR CONTRACT: Brand Wordmark — Nav Links — Actions */}
      {/* ========================================================= */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md">
        
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-400" />
          <span className="text-lg font-bold tracking-tight text-slate-100 font-cinzel">
            Arithmancia
          </span>
          <span className="hidden sm:inline text-xs text-amber-400/80 font-cinzel">
            Realm of the Prime
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button 
            onClick={() => {
              sound.playClick();
              setActiveEnemy(null);
            }}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Explore Realm
          </button>
          <button 
            onClick={() => {
              sound.playClick();
              setShowQuestLog(true);
            }}
            className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>Quests</span>
          </button>
          <button 
            onClick={() => {
              sound.playClick();
              setShowInventory(true);
            }}
            className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Backpack className="w-3.5 h-3.5" />
            <span>Hero & Bag</span>
          </button>
          <button 
            onClick={() => {
              sound.playClick();
              setShowForge(true);
            }}
            className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>Runeforge</span>
          </button>
          <button 
            onClick={() => {
              sound.playClick();
              setShowFastTravel(true);
            }}
            className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Atlas</span>
          </button>
          <button 
            onClick={() => {
              sound.playClick();
              setShowTitleScreen(true);
            }}
            className="hover:text-amber-400 transition-colors cursor-pointer text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-amber-300 font-cinzel"
          >
            Title Screen
          </button>
        </nav>

        {/* Zone 3: Primary Actions & Player HUD */}
        <div className="flex items-center gap-3">
          {/* Quick HUD Currency */}
          <div className="hidden sm:flex items-center gap-3 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg font-mono-numbers">
            <span className="text-amber-300 font-bold">🪙 {player.gold}</span>
            <span className="text-cyan-300 font-bold">🔷 {player.mathRunes}</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setShowSettings(true);
            }}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            title="Settings & Age Difficulty"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HELPER BANNER NOTIFICATION */}
      {bannerNotice && (
        <div className="bg-amber-950/70 border-b border-amber-800/80 px-6 py-2 text-center text-xs text-amber-200 transition-all flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MAIN VIEWPORT: Battle Arena OR World Exploration Map    */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center">
        {activeEnemy ? (
          <BattleScreen
            player={player}
            enemy={activeEnemy}
            ageGrade={ageGrade}
            onVictory={handleVictory}
            onDefeat={handleDefeat}
            onFlee={() => {
              sound.playClick();
              setActiveEnemy(null);
              triggerNotice('Retreated from combat back to the world.');
            }}
          />
        ) : (
          <WorldCanvas
            currentZone={currentZone}
            player={player}
            playerPos={playerPos}
            onMovePlayerPos={setPlayerPos}
            onInteractNPC={(npc) => {
              sound.playClick();
              setActiveNpc(npc);
            }}
            onEngageEnemy={(enemy) => {
              sound.playSpell('lightning');
              setActiveEnemy(enemy);
            }}
            onOpenChest={(chest) => {
              sound.playClick();
              setActiveChest(chest);
            }}
            onEnterPortal={handleEnterPortal}
            onFastTravelOpen={() => {
              sound.playClick();
              setShowFastTravel(true);
            }}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 px-4 py-2 flex items-center justify-around z-30">
        <button
          onClick={() => {
            sound.playClick();
            setActiveEnemy(null);
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] text-slate-400 hover:text-amber-400"
        >
          <Compass className="w-4 h-4" />
          <span>World</span>
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setShowQuestLog(true);
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] text-slate-400 hover:text-amber-400"
        >
          <Scroll className="w-4 h-4" />
          <span>Quests</span>
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setShowInventory(true);
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] text-slate-400 hover:text-amber-400"
        >
          <Backpack className="w-4 h-4" />
          <span>Hero</span>
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setShowForge(true);
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] text-slate-400 hover:text-amber-400"
        >
          <Hammer className="w-4 h-4" />
          <span>Forge</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. MODALS & OVERLAYS                                      */}
      {/* ========================================================= */}

      {/* Dialogue Modal */}
      {activeNpc && (
        <DialogueModal
          npc={activeNpc}
          quests={quests}
          onAcceptQuest={handleAcceptQuest}
          onOpenShop={(npc) => {
            setActiveNpc(null);
            setActiveShopNpc(npc);
          }}
          onOpenForge={() => {
            setActiveNpc(null);
            setShowForge(true);
          }}
          onClose={() => setActiveNpc(null)}
        />
      )}

      {/* Chest Puzzle Modal */}
      {activeChest && (
        <ChestPuzzleModal
          chest={activeChest}
          ageGrade={ageGrade}
          playerLevel={player.level}
          onSuccess={handleChestSuccess}
          onClose={() => setActiveChest(null)}
        />
      )}

      {/* Shop Merchant Modal */}
      {activeShopNpc && (
        <ShopModal
          npc={activeShopNpc}
          player={player}
          onBuyItem={handleBuyItem}
          onClose={() => setActiveShopNpc(null)}
        />
      )}

      {/* Runeforge Modal */}
      {showForge && (
        <ForgeModal
          player={player}
          ageGrade={ageGrade}
          onUpgradeItem={handleUpgradeItem}
          onClose={() => setShowForge(false)}
        />
      )}

      {/* Quest Journal Modal */}
      {showQuestLog && (
        <QuestLogModal
          quests={quests}
          onClaimQuest={handleClaimQuest}
          onClose={() => setShowQuestLog(false)}
        />
      )}

      {/* Character & Inventory Modal */}
      {showInventory && (
        <CharacterInventoryModal
          player={player}
          onEquipItem={handleEquipItem}
          onUnlockTalent={handleUnlockTalent}
          onClose={() => setShowInventory(false)}
        />
      )}

      {/* Fast Travel Modal */}
      {showFastTravel && (
        <FastTravelModal
          zones={zones}
          currentZoneId={currentZoneId}
          playerLevel={player.level}
          onSelectZone={(zId) => {
            const targetZ = zones.find((z) => z.id === zId);
            setCurrentZoneId(zId);
            if (targetZ) {
              setPlayerPos(targetZ.defaultSpawn);
            }
          }}
          onClose={() => setShowFastTravel(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          ageGrade={ageGrade}
          onSetAgeGrade={setAgeGrade}
          onResetGame={handleResetGame}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* DEFEAT MODAL */}
      {showDefeatModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-rose-800 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-700 mx-auto flex items-center justify-center text-rose-400 mb-4 text-2xl font-bold font-cinzel">
              ✕
            </div>
            <h3 className="text-2xl font-bold text-rose-400 font-cinzel mb-2">
              Mathematical Collapse
            </h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Your calculations were overwhelmed by the chaos of the realm. Sage Eldrin has recalled your spirit to Arithmia Town to rest and recalibrate.
            </p>
            <button
              onClick={handleRevive}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Awaken at Haven Plaza
            </button>
          </div>
        </div>
      )}

      {/* FINAL BOSS CLEARED MODAL */}
      {showGameClearedModal && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl max-w-lg w-full p-8 text-center shadow-2xl">
            <Crown className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl md:text-3xl font-extrabold text-amber-300 font-cinzel mb-2">
              The Cosmic Equation Restored!
            </h3>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed font-serif">
              The Null Sovereign has been vanquished. With your peerless intellect and rapid calculation, balance, geometry, and harmony have returned to Numeria.
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1 mb-6">
              <div>Total Equations Solved: <strong className="text-amber-300 font-mono-numbers">{player.totalSolved}</strong></div>
              <div>Super Critical Solves: <strong className="text-amber-300 font-mono-numbers">{player.totalCrits}</strong></div>
              <div>Arithmancer Title: <strong className="text-purple-300">Supreme Grand Arch-Mage</strong></div>
            </div>
            <button
              onClick={() => setShowGameClearedModal(false)}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Continue Exploring Realm
            </button>
          </div>
        </div>
      )}

      {/* TITLE SCREEN MODAL (Sets the scene & selects among the 5 math difficulty levels) */}
      {showTitleScreen && (
        <TitleScreenModal
          currentGrade={ageGrade}
          hasSavedGame={Boolean(localStorage.getItem(STORAGE_KEY))}
          savedPlayerLevel={player.level}
          onStartGame={(chosenGrade, isContinue) => {
            setAgeGrade(chosenGrade);
            setShowTitleScreen(false);
            if (isContinue) {
              triggerNotice(`Welcome back to Numeria! Continued adventure with Level ${player.level} Arithmancer.`);
            } else {
              triggerNotice(`Journey begun! Math curriculum calibrated to ${chosenGrade.replace('level_', 'Level ')}.`);
            }
          }}
        />
      )}

    </div>
  );
}
