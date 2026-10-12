import React, { useState } from 'react';
import { Quest } from '../types/game';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Scroll, 
  CheckCircle2, 
  Circle, 
  Award, 
  Sparkles, 
  X,
  Compass
} from 'lucide-react';

interface QuestLogModalProps {
  quests: Quest[];
  onClaimQuest: (quest: Quest) => void;
  onClose: () => void;
}

export const QuestLogModal: React.FC<QuestLogModalProps> = ({
  quests,
  onClaimQuest,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('active');

  const filteredQuests = quests.filter((q) => q.status === activeTab);

  const handleClaim = (q: Quest) => {
    sound.playLevelUp();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });
    onClaimQuest(q);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[88vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Scroll className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-cinzel text-slate-100">
              Chronicles & Quest Journal
            </h3>
            <span className="text-xs text-slate-400">
              The Prime Prophecy, royal decrees, and scholar challenges
            </span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 mb-4 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {(['active', 'available', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab);
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer font-cinzel ${
                activeTab === tab
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab} ({quests.filter((q) => q.status === tab).length})
            </button>
          ))}
        </div>

        {/* Quest List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredQuests.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No quests in this category. Explore the world and speak to NPCs!
            </div>
          ) : (
            filteredQuests.map((quest) => {
              const isAllCompleted = quest.objectives.every((obj) => obj.completed || obj.current >= obj.target);

              return (
                <div
                  key={quest.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-cinzel">
                          {quest.subtitle}
                        </span>
                        <span className="text-xs text-slate-500">· Given by {quest.giverName}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-100 font-cinzel mt-0.5">
                        {quest.title}
                      </h4>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {quest.type}
                    </span>
                  </div>

                  {/* Story excerpt */}
                  <p className="text-xs text-slate-300 italic mb-4 leading-relaxed font-serif">
                    "{quest.storyExcerpt}"
                  </p>

                  {/* Objectives */}
                  <div className="space-y-2 mb-4 bg-slate-900/70 p-3 rounded-lg border border-slate-800">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-cinzel">
                      Objectives:
                    </div>
                    {quest.objectives.map((obj) => (
                      <div key={obj.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-300">
                          {obj.completed || obj.current >= obj.target ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <span>{obj.text}</span>
                        </div>
                        <span className="font-mono-numbers text-slate-400">
                          {obj.current} / {obj.target}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Rewards Footer */}
                  <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Rewards:</span>
                      <span className="font-mono-numbers text-amber-300 font-bold">+{quest.rewards.gold} Gold</span>
                      <span className="font-mono-numbers text-cyan-300 font-bold">+{quest.rewards.runes} Runes</span>
                      <span className="font-mono-numbers text-emerald-300 font-bold">+{quest.rewards.xp} XP</span>
                      {quest.rewards.item && (
                        <span className="text-purple-300 font-bold">🎁 {quest.rewards.item.name}</span>
                      )}
                    </div>

                    {quest.status === 'active' && isAllCompleted && (
                      <button
                        onClick={() => handleClaim(quest)}
                        className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Claim Rewards
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
