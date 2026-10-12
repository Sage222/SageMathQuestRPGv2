import React, { useState } from 'react';
import { AgeGrade } from '../types/game';
import { DIFFICULTY_TIERS } from '../utils/mathGenerator';
import { sound } from '../utils/audio';
import { Settings, Volume2, VolumeX, RotateCcw, X, GraduationCap, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  ageGrade: AgeGrade;
  onSetAgeGrade: (grade: AgeGrade) => void;
  onResetGame: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  ageGrade,
  onSetAgeGrade,
  onResetGame,
  onClose
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [volume, setVolume] = useState(sound.getVolume());
  const [confirmReset, setConfirmReset] = useState(false);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) sound.playClick();
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    sound.setVolume(v);
    sound.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-cinzel text-slate-100">
              Arithmancia Settings
            </h3>
            <span className="text-xs text-slate-400">
              Customize mathematical difficulty & sound experience
            </span>
          </div>
        </div>

        {/* Math Difficulty Setting - 5 Tiers */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-cinzel">
              <GraduationCap className="w-4 h-4" />
              <span>Mathematical Difficulty Level (5 Tiers):</span>
            </div>
            <span className="text-xs text-slate-400">Ages 8 to 14</span>
          </div>

          <div className="space-y-2">
            {DIFFICULTY_TIERS.map((tier) => {
              const isSelected = ageGrade === tier.id || (
                (tier.id === 'level_1' && ageGrade === 'apprentice') ||
                (tier.id === 'level_3' && ageGrade === 'scholar') ||
                (tier.id === 'level_5' && ageGrade === 'archmage')
              );

              return (
                <button
                  key={tier.id}
                  onClick={() => {
                    sound.playClick();
                    onSetAgeGrade(tier.id);
                  }}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-slate-100 shadow-sm ring-1 ring-amber-400/40'
                      : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-200 font-cinzel">
                      Level {tier.level}: {tier.title}
                    </span>
                    <span className="text-xs font-mono-numbers text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                      {tier.ageRange}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-snug">{tier.description}</p>
                  <div className="mt-1 text-[11px] text-amber-300 font-mono-numbers">
                    Sample: {tier.sampleQuestion}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sound FX Settings */}
        <div className="mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              <span>Synthesized Web Audio Effects</span>
            </div>
            <button
              onClick={handleToggleMute}
              className={`px-3 py-1 text-xs rounded-lg font-bold border transition-colors ${
                isMuted 
                  ? 'bg-rose-950 text-rose-300 border-rose-800' 
                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}
            >
              {isMuted ? 'Muted' : 'Sound ON'}
            </button>
          </div>

          {!isMuted && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>FX Volume</span>
                <span className="font-mono-numbers">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => sound.playCrit()}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-300 rounded text-[11px] hover:text-amber-400"
                >
                  Test Crit Chime
                </button>
                <button
                  onClick={() => sound.playSpell('lightning')}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-300 rounded text-[11px] hover:text-sky-400"
                >
                  Test Spell
                </button>
                <button
                  onClick={() => sound.playLevelUp()}
                  className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-300 rounded text-[11px] hover:text-emerald-400"
                >
                  Test Fanfare
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reset Game Section */}
        <div className="border-t border-slate-800 pt-4">
          {confirmReset ? (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl flex items-center justify-between">
              <span className="text-xs text-rose-300">Are you sure you want to reset all game data?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onResetGame();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Save Data & Start Fresh</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
