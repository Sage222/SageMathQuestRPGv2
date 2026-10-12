import React, { useState, useEffect, useRef } from 'react';
import { 
  AgeGrade,
  CombatAction, 
  CombatActionType, 
  Enemy, 
  MathCategory, 
  MathQuestion, 
  PlayerStats 
} from '../types/game';
import { generateQuestion } from '../utils/mathGenerator';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Shield, 
  Heart, 
  Zap, 
  Edit3, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Flame,
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface BattleScreenProps {
  player: PlayerStats;
  enemy: Enemy;
  ageGrade: AgeGrade;
  onVictory: (rewards: { xp: number; gold: number; runes: number; item?: any }) => void;
  onDefeat: () => void;
  onFlee: () => void;
}

const COMBAT_ACTIONS: CombatAction[] = [
  {
    id: 'attack',
    name: 'Axiom Strike',
    description: 'Direct mathematical physical strike.',
    mpCost: 0,
    iconName: 'sword'
  },
  {
    id: 'pythagoras',
    name: 'Pythagorean Cleave',
    description: 'Heavy strike powered by right-triangle geometry. 2.2x Damage.',
    mpCost: 15,
    preferredCategory: 'geometry',
    iconName: 'triangle'
  },
  {
    id: 'heal',
    name: 'Fractional Mend',
    description: 'Restore 35% of max HP by simplifying fractions.',
    mpCost: 12,
    preferredCategory: 'fractions',
    iconName: 'heart'
  },
  {
    id: 'exponential',
    name: 'Exponential Overload',
    description: 'High burst damage that doubles on critical hit answers.',
    mpCost: 25,
    preferredCategory: 'exponents_roots',
    iconName: 'zap'
  },
  {
    id: 'barrier',
    name: 'Prime Ward',
    description: 'Raise a numerical shield absorbing 50% damage for 2 turns.',
    mpCost: 15,
    iconName: 'shield'
  }
];

export const BattleScreen: React.FC<BattleScreenProps> = ({
  player,
  enemy,
  ageGrade,
  onVictory,
  onDefeat,
  onFlee
}) => {
  // Combat state
  const [playerHp, setPlayerHp] = useState(player.currentHp);
  const [playerMp, setPlayerMp] = useState(player.currentMp);
  const [enemyHp, setEnemyHp] = useState(enemy.currentHp);
  const [barrierTurns, setBarrierTurns] = useState(0);

  // Active question & action
  const [selectedAction, setSelectedAction] = useState<CombatAction>(COMBAT_ACTIONS[0]);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'super_crit' | 'crit' | 'normal' | 'miss';
    message: string;
    damage?: number;
    heal?: number;
  } | null>(null);

  // Speed timer
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Scratchpad canvas state
  const [showScratchpad, setShowScratchpad] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#fbbf24'); // amber

  // Steps / explanation review modal
  const [showExplanation, setShowExplanation] = useState(false);

  // Combat log
  const [combatLog, setCombatLog] = useState<string[]>([
    `${enemy.name} emerges! ${enemy.dialogQuote}`
  ]);

  // Screen shake trigger
  const [screenShake, setScreenShake] = useState(false);

  // Effective critical threshold
  const superCritThreshold = 3.5 + (player.equipped.helm?.critTimeBonus || 0) + (player.talents?.quick_thinker ? 0.5 : 0);
  const critThreshold = 7.0 + (player.equipped.helm?.critTimeBonus || 0) + (player.talents?.quick_thinker ? 0.5 : 0);

  // Initialize new question
  const spawnNewQuestion = (action: CombatAction) => {
    const q = generateQuestion(ageGrade, action.preferredCategory, player.level);
    setCurrentQuestion(q);
    setTypedAnswer('');
    setFeedback(null);
    setElapsedTime(0);
    setTimerActive(true);
  };

  useEffect(() => {
    spawnNewQuestion(selectedAction);
  }, []);

  // Timer loop
  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => {
        setElapsedTime((prev) => +(prev + 0.1).toFixed(1));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [timerActive]);

  // Handle Action select
  const handleSelectAction = (action: CombatAction) => {
    if (playerMp < action.mpCost) {
      sound.playWrong();
      return;
    }
    sound.playClick();
    setSelectedAction(action);
    spawnNewQuestion(action);
  };

  // Submit Answer
  const handleAnswerSubmit = (answer: string) => {
    if (!currentQuestion || !timerActive) return;

    setTimerActive(false);
    const isCorrect = answer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

    if (isCorrect) {
      // Calculate Crit tier
      let critTier: 'super_crit' | 'crit' | 'normal' = 'normal';
      let multiplier = 1.0;

      if (elapsedTime <= superCritThreshold) {
        critTier = 'super_crit';
        multiplier = 2.5;
        sound.playCrit();
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else if (elapsedTime <= critThreshold) {
        critTier = 'crit';
        multiplier = 1.6;
        sound.playCrit();
      } else {
        critTier = 'normal';
        multiplier = 1.0;
        sound.playAttack();
      }

      // Check perks (e.g. geometry bonus from Blade of Pythagoras)
      if (currentQuestion.category === 'geometry' && player.equipped.weapon?.id === 'blade_pythagoras') {
        multiplier += 0.35;
      }

      // Process Action Effect
      let dealtDamage = 0;
      let healAmount = 0;

      if (selectedAction.id === 'heal') {
        sound.playSpell('heal');
        healAmount = Math.round(player.maxHp * 0.35 * (critTier === 'super_crit' ? 1.4 : 1.0));
        setPlayerHp((prev) => Math.min(player.maxHp, prev + healAmount));
        setPlayerMp((prev) => Math.max(0, prev - selectedAction.mpCost));
        setFeedback({
          type: critTier,
          message: `${critTier === 'super_crit' ? 'SUPER HEAL!' : 'HEAL!'} Restored +${healAmount} HP!`,
          heal: healAmount
        });
        setCombatLog((prev) => [
          `You solved the fraction perfectly in ${elapsedTime}s! Restored +${healAmount} HP.`,
          ...prev.slice(0, 4)
        ]);
      } else if (selectedAction.id === 'barrier') {
        sound.playSpell('buff');
        setBarrierTurns(3);
        setPlayerMp((prev) => Math.max(0, prev - selectedAction.mpCost));
        setFeedback({
          type: critTier,
          message: `PRIME WARD ACTIVATED! Absorbs 50% damage for 3 turns.`
        });
        setCombatLog((prev) => [
          `Inscribed the Prime Ward in ${elapsedTime}s! Incoming damage halved for 3 turns.`,
          ...prev.slice(0, 4)
        ]);
      } else {
        // Attack actions
        sound.playAttack();
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 400);

        const totalAtk = player.baseAttack + 
          (player.equipped.weapon?.attackBonus || 0) + 
          (player.equipped.ring?.attackBonus || 0);

        let actionScale = 1.0;
        if (selectedAction.id === 'pythagoras') actionScale = 2.2;
        if (selectedAction.id === 'exponential') actionScale = critTier !== 'normal' ? 2.8 : 1.8;

        dealtDamage = Math.max(8, Math.round((totalAtk * actionScale * multiplier) - (enemy.defense * 0.4)));
        const newEnemyHp = Math.max(0, enemyHp - dealtDamage);
        setEnemyHp(newEnemyHp);
        setPlayerMp((prev) => Math.max(0, prev - selectedAction.mpCost));

        setFeedback({
          type: critTier,
          message: critTier === 'super_crit' 
            ? `⚡ SUPER CRITICAL HIT! (${elapsedTime}s) -${dealtDamage} HP!` 
            : critTier === 'crit'
            ? `★ CRITICAL HIT! (${elapsedTime}s) -${dealtDamage} HP!`
            : `HIT! (${elapsedTime}s) -${dealtDamage} HP`,
          damage: dealtDamage
        });

        setCombatLog((prev) => [
          `You executed ${selectedAction.name} in ${elapsedTime}s dealing ${dealtDamage} damage!`,
          ...prev.slice(0, 4)
        ]);

        if (newEnemyHp <= 0) {
          // VICTORY!
          setTimeout(() => {
            sound.playVictory();
            onVictory({
              xp: enemy.xpReward,
              gold: enemy.goldReward,
              runes: enemy.runeReward,
              item: enemy.guaranteedDrop
            });
          }, 1200);
          return;
        }
      }

      // Enemy Counter-Attack Turn after slight delay
      setTimeout(() => {
        executeEnemyTurn();
      }, 1500);

    } else {
      // INCORRECT ANSWER
      sound.playWrong();
      setFeedback({
        type: 'miss',
        message: `Misfire! Correct answer was ${currentQuestion.correctAnswer}.`
      });
      setCombatLog((prev) => [
        `Spell misfired! The balance wobbled.`,
        ...prev.slice(0, 4)
      ]);

      // Immediate enemy punish
      setTimeout(() => {
        executeEnemyTurn(true);
      }, 1400);
    }
  };

  // Enemy counter-attack
  const executeEnemyTurn = (playerMissed: boolean = false) => {
    if (enemyHp <= 0) return;

    sound.playEnemyHit();
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 350);

    const baseEnemyDamage = enemy.attack;
    const playerDef = player.baseDefense + (player.equipped.armor?.defenseBonus || 0) + (player.equipped.offhand?.defenseBonus || 0);
    let incoming = Math.max(6, Math.round(baseEnemyDamage - playerDef * 0.5));

    if (barrierTurns > 0) {
      incoming = Math.round(incoming * 0.5);
      setBarrierTurns((prev) => prev - 1);
    }

    if (playerMissed) {
      incoming = Math.round(incoming * 1.25); // extra punish
    }

    const nextPlayerHp = Math.max(0, playerHp - incoming);
    setPlayerHp(nextPlayerHp);

    setCombatLog((prev) => [
      `${enemy.name} strikes back with ${incoming} damage!`,
      ...prev.slice(0, 4)
    ]);

    if (nextPlayerHp <= 0) {
      setTimeout(() => {
        onDefeat();
      }, 1000);
    } else {
      // Regain small MP each turn
      setPlayerMp((prev) => Math.min(player.maxMp, prev + 5));
      // Ready next question
      setTimeout(() => {
        spawnNewQuestion(selectedAction);
      }, 800);
    }
  };

  // Scratchpad drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className={`relative w-full max-w-6xl mx-auto min-h-[640px] flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl ${screenShake ? 'animate-shake' : ''}`}>
      
      {/* ARENA HEADER: Enemy and Player Status Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        
        {/* Player Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm font-cinzel">
                L{player.level}
              </span>
              <div>
                <h3 className="font-bold text-slate-100 font-cinzel text-base leading-tight">Chosen Arithmancer</h3>
                <span className="text-xs text-slate-400">{player.equipped.weapon.name}</span>
              </div>
            </div>
            {barrierTurns > 0 && (
              <span className="flex items-center gap-1 text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded">
                <Shield className="w-3.5 h-3.5" /> Barrier ({barrierTurns})
              </span>
            )}
          </div>

          {/* Health Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500" /> HP</span>
              <span className="font-mono-numbers">{playerHp} / {player.maxHp}</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300"
                style={{ width: `${Math.max(0, (playerHp / player.maxHp) * 100)}%` }}
              />
            </div>

            {/* Mana Bar */}
            <div className="flex justify-between text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-sky-400" /> MP</span>
              <span className="font-mono-numbers">{playerMp} / {player.maxMp}</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-300"
                style={{ width: `${Math.max(0, (playerMp / player.maxMp) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Enemy Status */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-rose-400 font-cinzel text-base leading-tight">{enemy.name}</h3>
                {enemy.isBoss && (
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-amber-400 bg-amber-950/80 border border-amber-700/60 px-1.5 py-0.5 rounded">
                    Boss
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">{enemy.title}</span>
            </div>
            <span className="text-xs font-mono-numbers text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
              Lvl {enemy.level}
            </span>
          </div>

          {/* Enemy HP */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span className="text-slate-400">{enemy.weaknessLabel}</span>
              <span className="font-mono-numbers text-rose-400">{enemyHp} / {enemy.maxHp}</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-rose-700 to-amber-600 transition-all duration-300"
                style={{ width: `${Math.max(0, (enemyHp / enemy.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SPEED CRIT METER */}
      <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-300">Speed Gauge:</span>
          <span className="font-mono-numbers text-sm font-bold text-amber-300">{elapsedTime}s</span>
        </div>

        {/* Multi-tiered Crit Bar */}
        <div className="flex-1 max-w-md h-3.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative flex">
          {/* Gold Super Crit Zone */}
          <div 
            className="h-full bg-amber-400/80 relative"
            style={{ width: `${(superCritThreshold / 15) * 100}%` }}
            title="Super Crit (<3.5s): 2.5x Damage!"
          >
            <span className="absolute left-1 top-0 text-[9px] font-bold text-slate-950 leading-none py-0.5">SUPER CRIT (2.5x)</span>
          </div>
          {/* Silver Crit Zone */}
          <div 
            className="h-full bg-cyan-400/70 relative"
            style={{ width: `${((critThreshold - superCritThreshold) / 15) * 100}%` }}
            title="Crit (<7.0s): 1.6x Damage"
          >
            <span className="absolute left-1 top-0 text-[9px] font-bold text-slate-950 leading-none py-0.5">CRIT (1.6x)</span>
          </div>
          {/* Normal Zone */}
          <div className="flex-1 h-full bg-slate-700" />

          {/* Current Needle Marker */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg transition-all"
            style={{ left: `${Math.min(100, (elapsedTime / 15) * 100)}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScratchpad(!showScratchpad)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg border transition-all ${
              showScratchpad 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Scratchpad</span>
          </button>
        </div>
      </div>

      {/* MAIN BATTLE CENTER */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
        
        {/* LEFT / CENTER: Combat Arena & Current Equation */}
        <div className="lg:col-span-8 p-6 flex flex-col justify-between space-y-6">
          
          {/* Active Question Banner */}
          {currentQuestion && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative shadow-inner">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-amber-400 font-semibold tracking-wide uppercase font-cinzel">
                  {currentQuestion.categoryLabel}
                </span>
                <span className="text-slate-400">
                  Spell Cast: <strong className="text-slate-200">{selectedAction.name}</strong>
                </span>
              </div>

              {/* Story prompt */}
              <p className="text-sm text-slate-300 mb-4">{currentQuestion.prompt}</p>

              {/* Equation Box (Large, Crisp Math Typography) */}
              <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl py-5 px-6 text-center my-2 shadow-lg">
                <div className="font-mono-numbers text-3xl md:text-4xl font-extrabold text-amber-300 tracking-wider">
                  {currentQuestion.displayEquation}
                </div>
              </div>

              {/* Hint Accordion */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span className="italic">💡 Hint: {currentQuestion.hint}</span>
                <button
                  onClick={() => setShowExplanation(true)}
                  className="text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" /> View Steps
                </button>
              </div>
            </div>
          )}

          {/* Feedback Splash (Floating combat banner) */}
          {feedback && (
            <div className={`p-4 rounded-xl text-center font-bold text-sm md:text-base border transition-all ${
              feedback.type === 'super_crit' 
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                : feedback.type === 'crit'
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : feedback.type === 'normal'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500 text-rose-300'
            }`}>
              {feedback.message}
            </div>
          )}

          {/* Multiple Choice Spell Cards */}
          {currentQuestion && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-medium">Select correct solution to strike:</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {currentQuestion.options.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={!timerActive}
                    onClick={() => handleAnswerSubmit(opt)}
                    className="p-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 border border-slate-700 hover:border-amber-500 rounded-xl text-center transition-all cursor-pointer shadow-md group relative overflow-hidden"
                  >
                    <span className="absolute top-1 left-2 text-[10px] text-slate-500 font-mono-numbers">
                      [{idx + 1}]
                    </span>
                    <span className="font-mono-numbers text-xl md:text-2xl font-bold text-slate-100 group-hover:text-amber-300">
                      {opt}
                    </span>
                  </button>
                ))}
              </div>

              {/* Direct Typed Input option for swift typers */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (typedAnswer) handleAnswerSubmit(typedAnswer);
                }}
                className="flex items-center gap-2 pt-2"
              >
                <input
                  type="text"
                  placeholder="Or type numerical answer..."
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500 px-4 py-2 rounded-lg text-sm font-mono-numbers text-slate-100 placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!typedAnswer || !timerActive}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Cast
                </button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Action Bar & Combat Log / Scratchpad */}
        <div className="lg:col-span-4 bg-slate-900/60 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 flex flex-col justify-between">
          
          {/* Spells & Techniques */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-cinzel">
              Spells & Techniques
            </h4>

            <div className="space-y-2">
              {COMBAT_ACTIONS.map((action) => {
                const isSelected = selectedAction.id === action.id;
                const canAfford = playerMp >= action.mpCost;

                return (
                  <button
                    key={action.id}
                    disabled={!canAfford}
                    onClick={() => handleSelectAction(action)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-slate-100 shadow-sm'
                        : canAfford
                        ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                        : 'bg-slate-950/50 border-slate-900 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1.5 font-cinzel">
                        {action.name}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{action.description}</p>
                    </div>
                    {action.mpCost > 0 && (
                      <span className="text-[11px] font-mono-numbers px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 shrink-0">
                        {action.mpCost} MP
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Combat Log */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-400 mb-2">Combat Log</div>
            <div className="bg-slate-950 rounded-lg p-2.5 border border-slate-800/80 h-28 overflow-y-auto space-y-1 text-xs">
              {combatLog.map((log, i) => (
                <div key={i} className="text-slate-300 leading-snug">
                  • {log}
                </div>
              ))}
            </div>
          </div>

          {/* Flee button */}
          <div className="mt-4 pt-2">
            <button
              onClick={onFlee}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Retreat from Battle
            </button>
          </div>
        </div>
      </div>

      {/* SCRATCHPAD DRAWER (Overlay blackboard for working out math) */}
      {showScratchpad && (
        <div className="absolute inset-0 bg-slate-950/95 z-20 p-5 flex flex-col backdrop-blur-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-cinzel font-bold text-sm">Arithmancy Blackboard (Work Out Steps)</span>
              <div className="flex items-center gap-1.5">
                {['#fbbf24', '#38bdf8', '#4ade80', '#f43f5e', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setPenColor(c)}
                    className="w-5 h-5 rounded-full border border-slate-700 transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearCanvas}
                className="px-3 py-1 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>
              <button
                onClick={() => setShowScratchpad(false)}
                className="px-3 py-1 text-xs bg-amber-500 text-slate-950 font-bold rounded-lg"
              >
                Close Scratchpad
              </button>
            </div>
          </div>

          {/* Drawing Canvas */}
          <div className="flex-1 mt-3 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden relative cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={1000}
              height={550}
              className="w-full h-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
        </div>
      )}

      {/* STEP-BY-STEP EXPLANATION MODAL */}
      {showExplanation && currentQuestion && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold font-cinzel text-amber-400 mb-2">
              Proof & Mathematical Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-4">{currentQuestion.categoryLabel}</p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 font-mono-numbers text-center text-xl text-amber-300">
              {currentQuestion.displayEquation}
            </div>

            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-semibold text-slate-300 uppercase">Step-by-Step Logic:</h4>
              {currentQuestion.steps.map((st, i) => (
                <div key={i} className="text-sm text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
                  <span className="text-amber-400 font-bold font-mono-numbers">{i + 1}.</span>
                  <span>{st}</span>
                </div>
              ))}
            </div>

            <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800 p-3 rounded-lg mb-6">
              <strong>Final Answer:</strong> {currentQuestion.correctAnswer}
            </div>

            <button
              onClick={() => setShowExplanation(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Understood! Return to Battle
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
