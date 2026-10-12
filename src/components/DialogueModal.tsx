import React from 'react';
import { NPC, Quest } from '../types/game';
import { sound } from '../utils/audio';
import { 
  Sparkles, 
  MessageSquare, 
  ShoppingBag, 
  Hammer, 
  Scroll, 
  X,
  User
} from 'lucide-react';

interface DialogueModalProps {
  npc: NPC;
  quests: Quest[];
  onAcceptQuest: (questId: string) => void;
  onOpenShop: (npc: NPC) => void;
  onOpenForge: () => void;
  onClose: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  npc,
  quests,
  onAcceptQuest,
  onOpenShop,
  onOpenForge,
  onClose
}) => {
  const currentDialogue = npc.dialogue[0];

  // Find if this NPC offers any quests
  const availableQuests = quests.filter(
    (q) => npc.questsOffered.includes(q.id) && q.status !== 'completed'
  );

  const handleChoice = (action?: string, questId?: string) => {
    sound.playClick();
    if (action === 'quest' && questId) {
      onAcceptQuest(questId);
      onClose();
    } else if (action === 'shop') {
      onOpenShop(npc);
    } else if (action === 'forge') {
      onOpenForge();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* NPC Profile Header */}
        <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-cinzel text-xl font-bold shadow-inner">
            {npc.name[0]}
          </div>
          <div>
            <h3 className="text-xl font-bold font-cinzel text-slate-100">{npc.name}</h3>
            <span className="text-xs text-amber-400 font-semibold">{npc.title}</span>
          </div>
        </div>

        {/* Dialogue Speech Box */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80 mb-6">
          <p className="text-sm md:text-base text-slate-200 leading-relaxed italic font-serif">
            "{currentDialogue.text}"
          </p>
        </div>

        {/* Quests available from NPC */}
        {availableQuests.length > 0 && (
          <div className="mb-5 space-y-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider font-cinzel">
              Quests Offered:
            </div>
            {availableQuests.map((q) => (
              <div 
                key={q.id}
                className="p-3 bg-amber-950/20 border border-amber-800/50 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-bold text-amber-200">{q.title}</div>
                  <div className="text-xs text-slate-400">{q.subtitle} · Rewards: {q.rewards.gold} Gold, {q.rewards.runes} Runes</div>
                </div>
                <button
                  onClick={() => handleChoice('quest', q.id)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {q.status === 'active' ? 'Active' : 'Accept Quest'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Interactive Response Buttons */}
        <div className="space-y-2">
          {currentDialogue.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => handleChoice(choice.action, choice.questId)}
              className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500 rounded-xl text-left text-sm font-semibold text-slate-300 hover:text-amber-300 transition-all cursor-pointer flex items-center justify-between"
            >
              <span>{choice.text}</span>
              {choice.action === 'forge' && <Hammer className="w-4 h-4 text-amber-400" />}
              {choice.action === 'shop' && <ShoppingBag className="w-4 h-4 text-amber-400" />}
              {choice.action === 'quest' && <Scroll className="w-4 h-4 text-amber-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
