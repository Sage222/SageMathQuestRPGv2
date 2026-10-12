import React from 'react';
import { GearItem, NPC, PlayerStats } from '../types/game';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { ShoppingBag, X, Shield, Sword, Sparkles, Heart } from 'lucide-react';

interface ShopModalProps {
  npc: NPC;
  player: PlayerStats;
  onBuyItem: (item: GearItem) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  npc,
  player,
  onBuyItem,
  onClose
}) => {
  const items = npc.shopItems || [];

  const handleBuy = (item: GearItem) => {
    if (player.gold < item.cost) {
      sound.playWrong();
      return;
    }
    sound.playChest();
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.6 }
    });
    onBuyItem(item);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-cinzel text-slate-100">
              {npc.name}’s Merchant Goods
            </h3>
            <span className="text-xs text-slate-400">
              Your Purse: <strong className="text-amber-300 font-mono-numbers">{player.gold} Gold</strong>
            </span>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {items.map((item) => {
            const canAfford = player.gold >= item.cost;

            return (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-100 font-cinzel">{item.name}</h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400 font-mono-numbers">
                      {item.slot}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{item.flavorText}</p>
                  <div className="text-xs text-slate-300 mt-2 flex items-center gap-3">
                    {item.attackBonus > 0 && <span className="text-rose-400 font-mono-numbers">+{item.attackBonus} ATK</span>}
                    {item.defenseBonus > 0 && <span className="text-sky-400 font-mono-numbers">+{item.defenseBonus} DEF</span>}
                    {item.hpBonus > 0 && <span className="text-emerald-400 font-mono-numbers">+{item.hpBonus} HP</span>}
                    <span className="text-amber-300">{item.mathPerk}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold font-mono-numbers text-amber-300 mb-2">
                    🪙 {item.cost} Gold
                  </div>
                  <button
                    disabled={!canAfford}
                    onClick={() => handleBuy(item)}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Purchase
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
