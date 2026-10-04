import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';
import { Trophy, Flame, Sparkles, Play, RefreshCw, Award } from 'lucide-react';

interface JackpotCelebrationViewProps {
  jackpotAmount: number;
  onBackToSlot: () => void;
}

export const JackpotCelebrationView: React.FC<JackpotCelebrationViewProps> = ({
  jackpotAmount = 10000,
  onBackToSlot,
}) => {
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    soundFx.playBonusFanfare();

    // Fire fireworks confetti interval
    const interval = setInterval(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
      });
    }, 1500);

    // Counter tick up animation
    let current = 0;
    const step = Math.ceil(jackpotAmount / 50);
    const counterInterval = setInterval(() => {
      current += step;
      if (current >= jackpotAmount) {
        current = jackpotAmount;
        clearInterval(counterInterval);
      }
      setDisplayAmount(current);
    }, 40);

    return () => {
      clearInterval(interval);
      clearInterval(counterInterval);
    };
  }, [jackpotAmount]);

  return (
    <div className="w-full min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 text-center max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-700">
      {/* Trophy Badge */}
      <div className="relative">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-yellow-300 via-amber-500 to-yellow-100 p-1 shadow-[0_0_60px_rgba(245,158,11,0.6)] animate-bounce flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
            <Trophy className="w-16 h-16" />
          </div>
        </div>
        <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2 animate-spin" />
      </div>

      {/* Main Announcement */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-950/80 border border-amber-500/50 text-amber-300 text-xs font-black uppercase tracking-widest shadow-lg">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>MEGA PROGRESSIVE JACKPOT HIT</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-100 font-mono">
          ${displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </h1>
        <p className="text-slate-300 text-sm max-w-md mx-auto">
          Congratulations! You triggered 5 Matching Royal Symbols on Line #1 to claim the progressive pool!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6 w-full max-w-md">
        <button
          onClick={() => {
            soundFx.playClick();
            onBackToSlot();
          }}
          className="w-full py-4 px-8 bg-gradient-to-r from-yellow-300 via-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-base uppercase rounded-2xl shadow-2xl flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Return to Slots</span>
        </button>

        <button
          onClick={() => {
            soundFx.playBonusFanfare();
            confetti({ particleCount: 100, spread: 80 });
          }}
          className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase rounded-2xl flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Replay Fireworks</span>
        </button>
      </div>
    </div>
  );
};
