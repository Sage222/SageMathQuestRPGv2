import React, { useState } from 'react';
import { GearItem, GearSlot, PlayerStats } from '../types/game';
import { sound } from '../utils/audio';
import { 
  Shield, 
  Sword, 
  Heart, 
  Zap, 
  Award, 
  Sparkles, 
  Clock, 
  Percent, 
  BarChart3, 
  X,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface CharacterInventoryModalProps {
  player: PlayerStats;
  onEquipItem: (item: GearItem) => void;
  onUnlockTalent: (talentId: string) => void;
  onClose: () => void;
}

const TALENTS = [
  {
    id: 'quick_thinker',
    name: 'Quick Thinker',
    description: '+0.5s extension to the Critical Hit timer window.',
    cost: 1,
    maxLevel: 3,
    icon: 'clock'
  },
  {
    id: 'axiom_focus',
    name: 'Axiom Focus',
    description: '+15% raw Attack Power on all mathematical strikes.',
    cost: 1,
    maxLevel: 3,
    icon: 'sword'
  },
  {
    id: 'golden_ratio',
    name: 'Golden Ratio',
    description: '+25% bonus Gold earned from battle victories and chests.',
    cost: 1,
    maxLevel: 3,
    icon: 'sparkles'
  },
  {
    id: 'euclidean_ward',
    name: 'Euclidean Ward',
    description: '+15% Defense bonus when defending against enemy strikes.',
    cost: 1,
    maxLevel: 3,
    icon: 'shield'
  }
];

export const CharacterInventoryModal: React.FC<CharacterInventoryModalProps> = ({
  player,
  onEquipItem,
  onUnlockTalent,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'gear' | 'stats' | 'talents'>('gear');
  const [selectedItem, setSelectedItem] = useState<GearItem | null>(player.equipped.weapon);

  // Total stats calculation
  const totalAttack = player.baseAttack +
    (player.equipped.weapon?.attackBonus || 0) +
    (player.equipped.offhand?.attackBonus || 0) +
    (player.equipped.armor?.attackBonus || 0) +
    (player.equipped.helm?.attackBonus || 0) +
    (player.equipped.ring?.attackBonus || 0) +
    (player.equipped.amulet?.attackBonus || 0);

  const totalDefense = player.baseDefense +
    (player.equipped.weapon?.defenseBonus || 0) +
    (player.equipped.offhand?.defenseBonus || 0) +
    (player.equipped.armor?.defenseBonus || 0) +
    (player.equipped.helm?.defenseBonus || 0) +
    (player.equipped.ring?.defenseBonus || 0) +
    (player.equipped.amulet?.defenseBonus || 0);

  const critBonusSeconds = (player.equipped.helm?.critTimeBonus || 0) + 
    (player.equipped.weapon?.critTimeBonus || 0) +
    ((player.talents?.quick_thinker || 0) * 0.5);

  const masteryPointsAvailable = Math.max(0, Math.floor(player.totalSolved / 5) - 
    Object.values(player.talents || {}).reduce((a, b) => a + b, 0));

  const handleEquip = (item: GearItem) => {
    sound.playClick();
    onEquipItem(item);
  };

  const handleLearnTalent = (tId: string) => {
    if (masteryPointsAvailable <= 0) return;
    sound.playLevelUp();
    onUnlockTalent(tId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg font-cinzel">
              L{player.level}
            </div>
            <div>
              <h3 className="text-xl font-bold font-cinzel text-slate-100">
                Arithmancer Hero Sheet
              </h3>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>XP: <strong className="text-slate-200 font-mono-numbers">{player.xp} / {player.xpToNextLevel}</strong></span>
                <span>·</span>
                <span>Gold: <strong className="text-amber-300 font-mono-numbers">{player.gold}</strong></span>
                <span>·</span>
                <span>Runes: <strong className="text-cyan-300 font-mono-numbers">{player.mathRunes}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['gear', 'stats', 'talents'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab);
                }}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer font-cinzel ${
                  activeTab === tab
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: GEAR & INVENTORY */}
        {activeTab === 'gear' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-y-auto">
            
            {/* Equipped Slots (Paperdoll) */}
            <div className="md:col-span-5 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-cinzel mb-2">
                Equipped Regalia:
              </div>

              {(['weapon', 'offhand', 'armor', 'helm', 'ring', 'amulet'] as GearSlot[]).map((slot) => {
                const item = player.equipped[slot];
                const isSelected = selectedItem?.id === item?.id;

                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-slate-100 shadow-sm'
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 font-cinzel tracking-wider">
                        {slot}
                      </div>
                      <div className="text-xs font-bold text-slate-200">
                        {item ? item.name : 'Empty Slot'}
                      </div>
                    </div>
                    {item && (
                      <span className="text-[11px] font-mono-numbers text-amber-300">
                        +{item.attackBonus} ATK
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Item Inspector & Backpack */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              
              {/* Selected Item Detail */}
              {selectedItem ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-base font-bold text-amber-300 font-cinzel">
                        {selectedItem.name} +{selectedItem.upgradeLevel}
                      </h4>
                      <span className="text-xs text-slate-400 italic">"{selectedItem.flavorText}"</span>
                    </div>
                    <span className="text-xs font-bold font-mono-numbers px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 uppercase">
                      {selectedItem.rarity}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 my-3 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Attack Bonus:</span>
                      <div className="text-sm font-bold text-rose-400 font-mono-numbers">
                        +{selectedItem.attackBonus} ATK
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Defense Bonus:</span>
                      <div className="text-sm font-bold text-sky-400 font-mono-numbers">
                        +{selectedItem.defenseBonus} DEF / +{selectedItem.hpBonus} HP
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-xs text-amber-300 mb-3">
                    <strong>Special Perk:</strong> {selectedItem.mathPerk}
                  </div>

                  {/* If item in backpack, allow equipping */}
                  {player.inventory.some((i) => i.id === selectedItem.id) && (
                    <button
                      onClick={() => handleEquip(selectedItem)}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Equip to {selectedItem.slot.toUpperCase()}
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500 text-center py-8">Select an item to view stats</div>
              )}

              {/* Backpack Inventory */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-cinzel mb-2">
                  Inventory Bag ({player.inventory.length} items):
                </div>
                {player.inventory.length === 0 ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500">
                    No extra gear in bag. Open chests and defeat monsters to discover artifacts!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {player.inventory.map((invItem) => (
                      <button
                        key={invItem.id}
                        onClick={() => setSelectedItem(invItem)}
                        className={`p-2 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                          selectedItem?.id === invItem.id
                            ? 'bg-amber-500/20 border-amber-500 text-slate-100'
                            : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="font-bold truncate">{invItem.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{invItem.slot}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MATHEMATICAL ACCURACY & STATS */}
        {activeTab === 'stats' && (
          <div className="space-y-6 flex-1 overflow-y-auto">
            {/* Core RPG Attributes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
                <div className="text-xs text-slate-400">Total Attack Power</div>
                <div className="text-2xl font-bold font-mono-numbers text-rose-400 mt-1">{totalAttack}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Base + Gear</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
                <div className="text-xs text-slate-400">Total Defense</div>
                <div className="text-2xl font-bold font-mono-numbers text-sky-400 mt-1">{totalDefense}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Reduces damage taken</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
                <div className="text-xs text-slate-400">Crit Speed Window</div>
                <div className="text-2xl font-bold font-mono-numbers text-amber-300 mt-1">
                  {(3.5 + critBonusSeconds).toFixed(1)}s
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">+{critBonusSeconds.toFixed(1)}s bonus window</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
                <div className="text-xs text-slate-400">Max Health & Mana</div>
                <div className="text-2xl font-bold font-mono-numbers text-emerald-400 mt-1">
                  {player.maxHp} / {player.maxMp}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">HP / MP</div>
              </div>
            </div>

            {/* Math Performance Metrics */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-cinzel mb-4">
                Mathematical Mastery Records
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-xs text-slate-500">Total Equations Solved</div>
                  <div className="text-xl font-bold font-mono-numbers text-slate-100">{player.totalSolved}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Super Critical Solves</div>
                  <div className="text-xl font-bold font-mono-numbers text-amber-300">{player.totalCrits}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Longest Streak</div>
                  <div className="text-xl font-bold font-mono-numbers text-cyan-300">{player.longestStreak} in a row</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Current Streak</div>
                  <div className="text-xl font-bold font-mono-numbers text-emerald-400">{player.currentStreak} 🔥</div>
                </div>
              </div>

              {/* Category Breakdown Progress */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-400">Subject Competency:</div>
                {[
                  { name: 'Arithmetic & Operations', count: player.categoryStats?.arithmetic?.solved || 12, rate: '96%' },
                  { name: 'Fractions & Proportions', count: player.categoryStats?.fractions?.solved || 8, rate: '92%' },
                  { name: 'Geometry & Angles', count: player.categoryStats?.geometry?.solved || 6, rate: '88%' },
                  { name: 'Pre-Algebra & Unknowns', count: player.categoryStats?.prealgebra?.solved || 5, rate: '85%' },
                  { name: 'Exponents & Roots', count: player.categoryStats?.exponents_roots?.solved || 4, rate: '82%' }
                ].map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-300">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono-numbers">{cat.count} Solved</span>
                      <span className="text-amber-400 font-bold font-mono-numbers">{cat.rate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TALENT TREE */}
        {activeTab === 'talents' && (
          <div className="space-y-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <h4 className="text-sm font-bold font-cinzel text-slate-100">Arithmancy Talent Tree</h4>
                <p className="text-xs text-slate-400">Earn 1 Talent Star for every 5 equations solved in battle or trials!</p>
              </div>
              <span className="font-mono-numbers text-base font-bold text-amber-300 bg-amber-950/40 border border-amber-800 px-3 py-1 rounded-lg">
                ⭐ {masteryPointsAvailable} Stars Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TALENTS.map((talent) => {
                const currentLvl = player.talents?.[talent.id] || 0;
                const isMax = currentLvl >= talent.maxLevel;
                const canUnlock = masteryPointsAvailable >= talent.cost && !isMax;

                return (
                  <div
                    key={talent.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-bold text-slate-200 font-cinzel text-sm">{talent.name}</h5>
                        <span className="text-xs font-mono-numbers text-amber-400">
                          Rank {currentLvl} / {talent.maxLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">{talent.description}</p>
                    </div>

                    <button
                      disabled={!canUnlock}
                      onClick={() => handleLearnTalent(talent.id)}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      {isMax ? 'Maximum Rank Reached' : `Upgrade Rank (Cost: 1 Star)`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
