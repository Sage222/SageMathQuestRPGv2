import React from 'react';
import { Zone } from '../types/game';
import { sound } from '../utils/audio';
import { MapPin, Compass, Lock, CheckCircle, X } from 'lucide-react';

interface FastTravelModalProps {
  zones: Zone[];
  currentZoneId: string;
  playerLevel: number;
  onSelectZone: (zoneId: string) => void;
  onClose: () => void;
}

export const FastTravelModal: React.FC<FastTravelModalProps> = ({
  zones,
  currentZoneId,
  playerLevel,
  onSelectZone,
  onClose
}) => {
  const getMinLevel = (zoneId: string): number => {
    switch (zoneId) {
      case 'arithmia_town': return 1;
      case 'whispering_caves': return 1;
      case 'prime_citadel': return 2;
      case 'fractured_peaks': return 6;
      case 'null_sanctum': return 9;
      default: return 1;
    }
  };

  const handleTravel = (zoneId: string) => {
    const minLvl = getMinLevel(zoneId);
    if (playerLevel < minLvl) {
      sound.playWrong();
      return;
    }
    sound.playSpell('buff');
    onSelectZone(zoneId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-cinzel text-slate-100">
              Atlas of Numeria (Fast Travel)
            </h3>
            <span className="text-xs text-slate-400">
              Teleport across the unlocked domains of the Prime
            </span>
          </div>
        </div>

        {/* Zone Cards */}
        <div className="space-y-3">
          {zones.map((zone) => {
            const minLvl = getMinLevel(zone.id);
            const isUnlocked = playerLevel >= minLvl;
            const isCurrent = zone.id === currentZoneId;

            return (
              <div
                key={zone.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500'
                    : isUnlocked
                    ? 'bg-slate-950 hover:bg-slate-800/80 border-slate-800'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-cinzel ${
                    isCurrent ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-300'
                  }`}>
                    {zone.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-200 font-cinzel text-sm">{zone.name}</h4>
                      {isCurrent && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                          Current Location
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{zone.ambientDescription}</p>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono-numbers">
                      Recommended: {zone.levelRange}
                    </div>
                  </div>
                </div>

                <div>
                  {isCurrent ? (
                    <span className="text-xs font-semibold text-amber-400">Here Now</span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleTravel(zone.id)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Teleport
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Lock className="w-3.5 h-3.5" /> Requires Lvl {minLvl}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
