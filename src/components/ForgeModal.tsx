import React, { useState } from 'react';
import { AgeGrade, GearItem, MathQuestion, PlayerStats } from '../types/game';
import { generateQuestion } from '../utils/mathGenerator';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Hammer, 
  Flame, 
  Sparkles, 
  Check, 
  X, 
  Shield, 
  Sword, 
  Heart, 
  Clock, 
  Award 
} from 'lucide-react';

interface ForgeModalProps {
  player: PlayerStats;
  ageGrade: AgeGrade;
  onUpgradeItem: (item: GearItem, isMasterwork: boolean) => void;
  onClose: () => void;
}

export const ForgeModal: React.FC<ForgeModalProps> = ({
  player,
  ageGrade,
  onUpgradeItem,
  onClose
}) => {
  // Available items for upgrade (equipped items + inventory items)
  const allGear: GearItem[] = [
    player.equipped.weapon,
    player.equipped.offhand,
    player.equipped.armor,
    player.equipped.helm,
    player.equipped.ring,
    player.equipped.amulet,
    ...player.inventory
  ].filter(Boolean);

  const [selectedItem, setSelectedItem] = useState<GearItem>(allGear[0]);
  const [isSolvingTrial, setIsSolvingTrial] = useState(false);
  const [trialQuestion, setTrialQuestion] = useState<MathQuestion | null>(null);
  const [trialAnswer, setTrialAnswer] = useState<string | null>(null);
  const [trialError, setTrialError] = useState<string | null>(null);

  // Upgrade costs
  const goldCost = (selectedItem.upgradeLevel + 1) * 60;
  const runeCost = (selectedItem.upgradeLevel + 1) * 3;
  const canAfford = player.gold >= goldCost && player.mathRunes >= runeCost;
  const isMaxTier = selectedItem.upgradeLevel >= selectedItem.maxUpgradeLevel;

  const startForgeTrial = () => {
    if (!canAfford || isMaxTier) return;
    const q = generateQuestion(ageGrade, undefined, player.level + 1);
    setTrialQuestion(q);
    setIsSolvingTrial(true);
    setTrialAnswer(null);
    setTrialError(null);
  };

  const handleTrialSubmit = () => {
    if (!trialQuestion || !trialAnswer) return;

    if (trialAnswer.trim().toLowerCase() === trialQuestion.correctAnswer.trim().toLowerCase()) {
      sound.playLevelUp();
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.5 }
      });
      onUpgradeItem(selectedItem, true);
      setIsSolvingTrial(false);
    } else {
      sound.playWrong();
      setTrialError(`The alloy warped! Incorrect. Hint: ${trialQuestion.hint}`);
    }
  };

  const handleStandardForge = () => {
    if (!canAfford || isMaxTier) return;
    sound.playClick();
    onUpgradeItem(selectedItem, false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-amber-600/60 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
            <Hammer className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-cinzel text-slate-100">
              Vulcan’s Heptagonal Runeforge
            </h3>
            <span className="text-xs text-slate-400">
              Infuse mathematical symmetry into weapons & armor for massive stat boosts
            </span>
          </div>
        </div>

        {/* Currency Pill Indicator */}
        <div className="flex items-center gap-4 mb-6 bg-slate-950 p-3 rounded-xl border border-slate-800 text-sm">
          <span className="text-slate-400">Available Resources:</span>
          <span className="font-mono-numbers font-bold text-amber-300">
            🪙 {player.gold} Gold
          </span>
          <span className="font-mono-numbers font-bold text-cyan-300">
            🔷 {player.mathRunes} Math Runes
          </span>
        </div>

        {/* Main Grid: Item List & Upgrade Forge Box */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Item Selector */}
          <div className="md:col-span-5 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-cinzel">
              Select Gear to Hone:
            </div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {allGear.map((item) => {
                const isSelected = selectedItem.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setIsSolvingTrial(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-slate-100 shadow-md'
                        : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs leading-tight">{item.name}</div>
                      <div className="text-[10px] text-amber-400 uppercase tracking-wider mt-0.5">
                        Tier +{item.upgradeLevel} · {item.slot}
                      </div>
                    </div>
                    <span className="text-xs font-mono-numbers text-slate-400">
                      +{item.attackBonus} ATK
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upgrade Forge Chamber */}
          <div className="md:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            
            {/* Item Profile */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-base text-amber-300 font-cinzel">
                    {selectedItem.name} +{selectedItem.upgradeLevel}
                  </h4>
                  <span className="text-xs text-slate-400 italic">"{selectedItem.flavorText}"</span>
                </div>
                <span className="text-xs font-mono-numbers bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-md text-slate-300">
                  {selectedItem.slot.toUpperCase()}
                </span>
              </div>

              {/* Stat Comparison */}
              <div className="grid grid-cols-2 gap-3 my-4 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Attack Power</div>
                  <div className="font-mono-numbers text-base font-bold text-rose-400">
                    {selectedItem.attackBonus} ➔{' '}
                    <span className="text-emerald-400">+{selectedItem.attackBonus + 6}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Defense & HP</div>
                  <div className="font-mono-numbers text-base font-bold text-sky-400">
                    {selectedItem.defenseBonus} DEF / {selectedItem.hpBonus} HP
                  </div>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-800 text-xs text-amber-300">
                  <strong>Math Perk:</strong> {selectedItem.mathPerk}
                </div>
              </div>
            </div>

            {/* Forge Trial or Action Buttons */}
            {isSolvingTrial && trialQuestion ? (
              <div className="bg-slate-900 border border-amber-500/60 rounded-xl p-4 my-2">
                <div className="text-xs font-bold text-amber-400 uppercase mb-1 font-cinzel">
                  Masterwork Math Trial (100% Boost Guarantee)
                </div>
                <p className="text-xs text-slate-300 mb-2">{trialQuestion.prompt}</p>
                <div className="text-xl font-bold font-mono-numbers text-amber-300 text-center py-2 bg-slate-950 rounded-lg mb-3">
                  {trialQuestion.displayEquation}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {trialQuestion.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setTrialAnswer(opt)}
                      className={`p-2 rounded-lg text-sm font-bold font-mono-numbers border text-center transition-all ${
                        trialAnswer === opt
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {trialError && (
                  <div className="text-xs text-rose-400 mb-2">{trialError}</div>
                )}

                <div className="flex gap-2">
                  <button
                    disabled={!trialAnswer}
                    onClick={handleTrialSubmit}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Strike Anvil & Infuse
                  </button>
                  <button
                    onClick={() => setIsSolvingTrial(false)}
                    className="px-3 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>Upgrade Cost:</span>
                  <div className="flex gap-3">
                    <span className="font-mono-numbers font-bold text-amber-300">{goldCost} Gold</span>
                    <span className="font-mono-numbers font-bold text-cyan-300">{runeCost} Runes</span>
                  </div>
                </div>

                {isMaxTier ? (
                  <div className="text-center py-3 text-xs font-bold text-amber-400 bg-amber-950/30 rounded-xl border border-amber-800">
                    Maximum Forge Masterwork Tier Reached!
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      disabled={!canAfford}
                      onClick={startForgeTrial}
                      className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Masterwork Trial (Solve Equation)</span>
                    </button>
                    <button
                      disabled={!canAfford}
                      onClick={handleStandardForge}
                      className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Instant Forge
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
