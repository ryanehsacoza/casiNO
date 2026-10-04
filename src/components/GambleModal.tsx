import React, { useState } from 'react';
import { Flame, Trophy, HelpCircle, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { GambleResponse } from '../types';
import { soundFx } from '../utils/audio';

interface GambleModalProps {
  currentWin: number;
  currencySymbol: string;
  onClose: (finalWin: number) => void;
  onUpdateUser: (credits: number) => void;
}

export const GambleModal: React.FC<GambleModalProps> = ({
  currentWin,
  currencySymbol,
  onClose,
  onUpdateUser,
}) => {
  const [winAmount, setWinAmount] = useState<number>(currentWin);
  const [history, setHistory] = useState<string[]>([]);
  const [isGambling, setIsGambling] = useState(false);
  const [lastCard, setLastCard] = useState<GambleResponse | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const handleGuess = async (guess: 'RED' | 'BLACK') => {
    if (isGambling || gameOver || winAmount <= 0) return;
    setIsGambling(true);
    soundFx.playGambleCardFlip();

    try {
      const response = await fetch('/api/gamble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'player-1',
          currentWin: winAmount,
          guess,
        }),
      });

      const data: GambleResponse = await response.json();
      setLastCard(data);
      setWinAmount(data.newWin);
      onUpdateUser(data.creditsAfter);

      const symbol =
        data.cardSuit === 'HEARTS'
          ? '❤️'
          : data.cardSuit === 'DIAMONDS'
          ? '♦️'
          : data.cardSuit === 'CLUBS'
          ? '♣️'
          : '♠️';

      setHistory((prev) => [symbol, ...prev.slice(0, 5)]);

      if (data.success) {
        soundFx.playGambleWin();
      } else {
        soundFx.playGambleLose();
        setGameOver(true);
      }
    } catch (e) {
      console.error('Failed to execute gamble:', e);
    } finally {
      setIsGambling(false);
    }
  };

  const handleTakeWin = () => {
    soundFx.playClick();
    onClose(winAmount);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-red-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(239,68,68,0.3)] overflow-hidden">
        {/* Novomatic / Novo Machine Top Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-500/50 px-4 py-1 rounded-full text-red-400 font-bold text-xs uppercase tracking-widest mb-2">
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            Novomatic Classic Gaminator Feature
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-200 to-yellow-400 font-serif">
            DOUBLE-UP GAMBLE
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            Guess card color (RED or BLACK) to double your current win!
          </p>
        </div>

        {/* Current Win & Double Win Display */}
        <div className="grid grid-cols-2 gap-4 bg-slate-900/90 border border-red-500/40 rounded-2xl p-4 mb-6 text-center">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Current Gamble Win</div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              {currencySymbol} {winAmount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Gamble To Win</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {currencySymbol} {(winAmount * 2).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card Animation / Display Area */}
        <div className="flex flex-col items-center justify-center my-6">
          <div
            className={`relative w-36 h-52 rounded-2xl border-4 transition-all duration-300 flex flex-col items-center justify-center p-4 shadow-2xl ${
              isGambling
                ? 'animate-pulse border-amber-400 bg-amber-950/40'
                : lastCard
                ? lastCard.cardColor === 'RED'
                  ? 'border-red-500 bg-slate-100 text-red-600'
                  : 'border-slate-800 bg-slate-100 text-slate-900'
                : 'border-red-500/80 bg-gradient-to-br from-red-800 to-red-950 text-amber-300'
            }`}
          >
            {lastCard ? (
              <>
                <div className="absolute top-2 left-2 text-lg font-bold font-mono">
                  {lastCard.cardRank}
                </div>
                <div className="text-5xl">
                  {lastCard.cardSuit === 'HEARTS'
                    ? '❤️'
                    : lastCard.cardSuit === 'DIAMONDS'
                    ? '♦️'
                    : lastCard.cardSuit === 'CLUBS'
                    ? '♣️'
                    : '♠️'}
                </div>
                <div className="absolute bottom-2 right-2 text-lg font-bold font-mono">
                  {lastCard.cardRank}
                </div>
              </>
            ) : (
              <div className="text-center font-bold">
                <Flame className="w-10 h-10 mx-auto text-amber-400 animate-bounce mb-2" />
                <span className="text-xs uppercase tracking-widest">NOVO CARD</span>
              </div>
            )}
          </div>

          {/* History Ribbon */}
          <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
            <span>Previous:</span>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              {history.map((h, idx) => (
                <span key={idx} className="text-base">{h}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!gameOver ? (
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => handleGuess('RED')}
              disabled={isGambling}
              className="py-3.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 text-lg transition-transform active:scale-95 disabled:opacity-50"
            >
              ❤️ RED
            </button>

            <button
              onClick={() => handleGuess('BLACK')}
              disabled={isGambling}
              className="py-3.5 bg-gradient-to-r from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 border border-slate-600 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 text-lg transition-transform active:scale-95 disabled:opacity-50"
            >
              ♠️ BLACK
            </button>
          </div>
        ) : (
          <div className="text-center bg-red-950/80 border border-red-500/50 rounded-2xl p-4 mt-4">
            <p className="text-red-400 font-bold text-lg">GAMBLE LOST</p>
            <p className="text-slate-300 text-xs mt-1">Better luck on the next spin!</p>
          </div>
        )}

        {/* Take Win Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleTakeWin}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-base transition-transform active:scale-95"
          >
            <ShieldCheck className="w-5 h-5" />
            COLLECT WIN ({currencySymbol} {winAmount.toLocaleString()})
          </button>
        </div>
      </div>
    </div>
  );
};
