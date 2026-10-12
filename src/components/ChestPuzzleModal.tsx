import React, { useState } from 'react';
import { AgeGrade, MathQuestion, TreasureChest } from '../types/game';
import { generateQuestion } from '../utils/mathGenerator';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Key, Lock, Unlock, X } from 'lucide-react';

interface ChestPuzzleModalProps {
  chest: TreasureChest;
  ageGrade: AgeGrade;
  playerLevel: number;
  onSuccess: (chest: TreasureChest) => void;
  onClose: () => void;
}

export const ChestPuzzleModal: React.FC<ChestPuzzleModalProps> = ({
  chest,
  ageGrade,
  playerLevel,
  onSuccess,
  onClose
}) => {
  const [question] = useState<MathQuestion>(() => generateQuestion(ageGrade, undefined, playerLevel));
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelect = (opt: string) => {
    setSelectedAnswer(opt);
    setErrorMsg(null);
  };

  const handleUnlock = () => {
    if (!selectedAnswer) return;

    if (selectedAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
      sound.playChest();
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.5 }
      });
      onSuccess(chest);
    } else {
      sound.playWrong();
      setErrorMsg(`The lock resists! That is incorrect. Hint: ${question.hint}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-amber-500/70 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-cinzel text-slate-100 leading-tight">
              Runic Equation Chest
            </h3>
            <span className="text-xs text-slate-400">Solve the lock equation to open the treasure vault</span>
          </div>
        </div>

        {/* Puzzle prompt */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 text-center">
          <div className="text-xs text-amber-400 font-semibold mb-1 uppercase font-cinzel">
            {question.categoryLabel}
          </div>
          <p className="text-xs text-slate-300 mb-3">{question.prompt}</p>
          <div className="text-2xl font-bold font-mono-numbers text-amber-300">
            {question.displayEquation}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(opt)}
              className={`p-3 rounded-xl border text-center font-mono-numbers font-bold text-lg transition-all cursor-pointer ${
                selectedAnswer === opt
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs mb-4">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-3">
            <span>Contains: <strong className="text-amber-300 font-mono-numbers">+{chest.gold} Gold</strong></span>
            <span><strong className="text-cyan-300 font-mono-numbers">+{chest.runes} Runes</strong></span>
          </div>
          <button
            disabled={!selectedAnswer}
            onClick={handleUnlock}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Turn Key
          </button>
        </div>
      </div>
    </div>
  );
};
