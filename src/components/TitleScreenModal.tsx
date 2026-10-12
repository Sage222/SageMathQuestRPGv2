import React, { useState } from 'react';
import { AgeGrade, DifficultyTier } from '../types/game';
import { DIFFICULTY_TIERS } from '../utils/mathGenerator';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Crown, 
  Sparkles, 
  Sword, 
  GraduationCap, 
  Compass, 
  CheckCircle2, 
  Play,
  RotateCcw,
  BookOpen,
  Volume2,
  VolumeX,
  ShieldCheck
} from 'lucide-react';

interface TitleScreenModalProps {
  currentGrade: AgeGrade;
  hasSavedGame: boolean;
  savedPlayerLevel?: number;
  onStartGame: (selectedGrade: AgeGrade, isContinue: boolean) => void;
}

export const TitleScreenModal: React.FC<TitleScreenModalProps> = ({
  currentGrade,
  hasSavedGame,
  savedPlayerLevel = 1,
  onStartGame
}) => {
  // Normalize initial selection to one of level_1 .. level_5
  const getInitialTier = (): AgeGrade => {
    if (['level_1', 'level_2', 'level_3', 'level_4', 'level_5'].includes(currentGrade)) {
      return currentGrade;
    }
    if (currentGrade === 'apprentice') return 'level_1';
    if (currentGrade === 'scholar') return 'level_3';
    if (currentGrade === 'archmage') return 'level_5';
    return 'level_3';
  };

  const [selectedGrade, setSelectedGrade] = useState<AgeGrade>(getInitialTier());
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const selectedTier = DIFFICULTY_TIERS.find((t) => t.id === selectedGrade) || DIFFICULTY_TIERS[2];

  const handleSelectTier = (tier: DifficultyTier) => {
    sound.playClick();
    setSelectedGrade(tier.id);
  };

  const handleBegin = (isContinue: boolean) => {
    sound.playLevelUp();
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 }
    });
    onStartGame(selectedGrade, isContinue);
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) sound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      {/* Background magical ambient nebula */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/60 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-4xl w-full bg-slate-900/95 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between my-auto">
        
        {/* Top Sound Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-cinzel text-amber-400 font-bold tracking-widest uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Realm of the Prime · AAA Math RPG</span>
          </div>
          <button
            onClick={toggleSound}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isMuted ? 'Muted' : 'Sound ON'}</span>
          </button>
        </div>

        {/* HERO TITLE HEADER */}
        <div className="text-center my-6 space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner mb-2 animate-pulse">
            <Crown className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-cinzel tracking-tight text-slate-100 uppercase drop-shadow-md">
            Arithmancia
          </h1>
          <p className="text-xs md:text-sm text-amber-300/90 font-cinzel tracking-widest font-bold uppercase">
            The Sunder of Equation & The Prime Prophecy
          </p>

          {/* Prologue story narrative */}
          <div className="max-w-2xl mx-auto mt-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs md:text-sm text-slate-300 font-serif italic leading-relaxed text-center">
            "Before the Sundering, the Great Equation of Balance wove rivers, mountains, and stars into divine symmetry. Then came the Null Sovereign—wielding the terror of Division by Zero—shattering the cosmic runes. Now, as the Chosen Arithmancer, you must wield mathematical spells, explore vast wilderness biomes, and restore the Prime Axioms."
          </div>
        </div>

        {/* 5-LEVEL DIFFICULTY SELECTOR */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold font-cinzel text-slate-100 uppercase tracking-wider">
                Select Your Mathematical Difficulty (5 Tiers)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Ages 8 to 14 · Calibrated Curriculum</span>
          </div>

          {/* 5 Level Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {DIFFICULTY_TIERS.map((tier) => {
              const isSelected = selectedGrade === tier.id;

              return (
                <button
                  key={tier.id}
                  onClick={() => handleSelectTier(tier)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500/20 to-amber-950/40 border-amber-400 shadow-xl ring-2 ring-amber-400/30'
                      : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold font-mono-numbers px-2 py-0.5 rounded-full ${
                        isSelected 
                          ? 'bg-amber-400 text-slate-950' 
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        Level {tier.level}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                    </div>

                    <div className="font-bold text-xs text-slate-100 font-cinzel leading-snug">
                      {tier.title}
                    </div>
                    <div className="text-[11px] font-semibold text-amber-400 mt-0.5">
                      {tier.ageRange}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                      {tier.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Selected Tier Preview Banner */}
          <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-cinzel text-amber-300">
                  Level {selectedTier.level}: {selectedTier.title} ({selectedTier.ageRange})
                </span>
                <span className="text-xs text-slate-400">· {selectedTier.description}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedTier.topics.map((top, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                    ✓ {top}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-lg text-center shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-cinzel">Sample Equation</span>
              <span className="text-xs font-bold font-mono-numbers text-amber-300">{selectedTier.sampleQuestion}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
          {hasSavedGame && (
            <button
              onClick={() => handleBegin(true)}
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Continue Adventure (Hero Level {savedPlayerLevel})</span>
            </button>
          )}

          <button
            onClick={() => handleBegin(false)}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-slate-950 font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Enter the Realm of Numeria</span>
          </button>
        </div>

      </div>
    </div>
  );
};
