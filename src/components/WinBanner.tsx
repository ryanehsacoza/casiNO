import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SpinResponse } from '../types';
import { Award, Trophy, Sparkles, Zap } from 'lucide-react';

interface WinBannerProps {
  lastSpin: SpinResponse | null;
  currencySymbol?: string;
}

export const WinBanner: React.FC<WinBannerProps> = ({ lastSpin, currencySymbol = 'R' }) => {
  const isHasWin = Boolean(lastSpin && lastSpin.payout > 0);
  const isBigWin = Boolean(lastSpin && lastSpin.payout >= lastSpin.totalBet * 10);
  const isMegaWin = Boolean(
    lastSpin && (lastSpin.payout >= lastSpin.totalBet * 25 || lastSpin.jackpotWon)
  );

  useEffect(() => {
    if (!lastSpin || lastSpin.payout <= 0) return;

    if (isMegaWin) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } else if (isBigWin) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [lastSpin, isBigWin, isMegaWin]);

  if (!isHasWin || !lastSpin) return null;

  return (
    <div
      id="win-banner"
      className={`w-full p-4 rounded-2xl border-2 backdrop-blur-md shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 flex flex-col md:flex-row items-center justify-between gap-4 ${
        isMegaWin
          ? 'bg-gradient-to-r from-yellow-950/90 via-amber-900/95 to-yellow-950/90 border-yellow-400 shadow-yellow-500/40'
          : isBigWin
          ? 'bg-gradient-to-r from-amber-950/90 via-slate-900/90 to-amber-950/90 border-amber-400 shadow-amber-500/30'
          : 'bg-slate-900/90 border-emerald-500/50 shadow-emerald-500/20'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-3 rounded-2xl ${
            isMegaWin
              ? 'bg-yellow-400 text-slate-950 animate-bounce'
              : isBigWin
              ? 'bg-amber-500 text-slate-950'
              : 'bg-emerald-500 text-slate-950'
          }`}
        >
          {isMegaWin ? <Trophy className="w-8 h-8" /> : isBigWin ? <Award className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
        </div>

        <div>
          <div className="text-xs font-black tracking-widest uppercase text-amber-300 flex items-center gap-1.5">
            {isMegaWin ? 'MEGA JACKPOT WIN!' : isBigWin ? 'BIG WIN!' : 'WINNER!'}
            {lastSpin.currentMultiplier > 1 && (
              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono text-[10px] font-black">
                {lastSpin.currentMultiplier}X MULTIPLIER
              </span>
            )}
          </div>
          <div className="text-sm text-slate-300 font-medium">
            {lastSpin.winningLines.length} Winning Line{lastSpin.winningLines.length > 1 ? 's' : ''} Hit
          </div>
        </div>
      </div>

      {/* Payout Display */}
      <div className="text-center md:text-right">
        <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Total Payout</div>
        <div className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100">
          +{currencySymbol} {lastSpin.payout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};
