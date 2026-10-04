import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';
import { Gift, Sparkles, Trophy, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

interface BonusWorldViewProps {
  onAddCredits: (amount: number) => void;
  onBackToSlot: () => void;
}

export const BonusWorldView: React.FC<BonusWorldViewProps> = ({ onAddCredits, onBackToSlot }) => {
  const [activeMiniGame, setActiveMiniGame] = useState<'chests' | 'wheel' | 'boxes'>('chests');

  // Chest Pick Game State
  const [chestsPicked, setChestsPicked] = useState<number | null>(null);
  const [chestPrizes, setChestPrizes] = useState<number[]>([150, 500, 1000]);
  const [chestWonAmount, setChestWonAmount] = useState<number | null>(null);

  // Lucky Wheel State
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);
  const [wheelWinAmount, setWheelWinAmount] = useState<number | null>(null);

  // Mystery Box State
  const [boxPicked, setBoxPicked] = useState<number | null>(null);
  const [boxWonAmount, setBoxWonAmount] = useState<number | null>(null);

  const handlePickChest = (index: number) => {
    if (chestsPicked !== null) return;
    soundFx.playBonusFanfare();
    confetti({ particleCount: 50, spread: 60 });

    const prizes = [250, 750, 2000].sort(() => Math.random() - 0.5);
    setChestPrizes(prizes);
    setChestsPicked(index);
    const won = prizes[index];
    setChestWonAmount(won);
    onAddCredits(won);
  };

  const handleSpinWheel = () => {
    if (isWheelSpinning || wheelWinAmount !== null) return;
    setIsWheelSpinning(true);
    soundFx.playBonusFanfare();

    setTimeout(() => {
      const wheelPrizes = [300, 600, 1200, 2500, 5000];
      const won = wheelPrizes[Math.floor(Math.random() * wheelPrizes.length)];
      setWheelWinAmount(won);
      setIsWheelSpinning(false);
      confetti({ particleCount: 70, spread: 70 });
      onAddCredits(won);
    }, 2000);
  };

  const handlePickBox = (boxIdx: number) => {
    if (boxPicked !== null) return;
    soundFx.playWinChime(true);
    confetti({ particleCount: 60, spread: 60 });

    const boxPrizes = [500, 1500, 3000];
    const won = boxPrizes[Math.floor(Math.random() * boxPrizes.length)];
    setBoxPicked(boxIdx);
    setBoxWonAmount(won);
    onAddCredits(won);
  };

  const resetAllGames = () => {
    setChestsPicked(null);
    setChestWonAmount(null);
    setWheelWinAmount(null);
    setBoxPicked(null);
    setBoxWonAmount(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Mini-Game Arcade</span>
          </div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-100">
            BONUS WORLD
          </h1>
        </div>

        <button
          onClick={() => {
            soundFx.playClick();
            onBackToSlot();
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg hover:brightness-110 transition flex items-center gap-2"
        >
          <span>Play Slot Machine</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Game Switcher Tabs */}
      <div className="flex justify-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 max-w-md mx-auto">
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveMiniGame('chests');
            resetAllGames();
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeMiniGame === 'chests'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🎁 Treasure Chests
        </button>
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveMiniGame('wheel');
            resetAllGames();
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeMiniGame === 'wheel'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🎡 Lucky Wheel
        </button>
        <button
          onClick={() => {
            soundFx.playClick();
            setActiveMiniGame('boxes');
            resetAllGames();
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
            activeMiniGame === 'boxes'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📦 Mystery Box
        </button>
      </div>

      {/* Mini Game Stage */}
      <div className="bg-slate-900/90 border border-amber-500/30 p-8 rounded-3xl shadow-2xl text-center backdrop-blur-md">
        {activeMiniGame === 'chests' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-amber-300">TREASURE CHEST PICK</h2>
            <p className="text-xs text-slate-400">Select 1 of 3 pirate treasure chests to unlock instant game credits!</p>

            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto py-6">
              {[0, 1, 2].map((idx) => {
                const isPicked = chestsPicked === idx;
                return (
                  <button
                    key={idx}
                    disabled={chestsPicked !== null}
                    onClick={() => handlePickChest(idx)}
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 ${
                      isPicked
                        ? 'bg-amber-500/20 border-yellow-400 shadow-xl shadow-yellow-500/30'
                        : 'bg-slate-950 border-slate-800 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="text-5xl">{chestsPicked === null ? '🧰' : '🎁'}</div>
                    {chestsPicked !== null && (
                      <div className="text-sm font-black font-mono text-amber-300">
                        +${chestPrizes[idx]}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {chestWonAmount !== null && (
              <div className="text-emerald-400 font-extrabold text-lg animate-bounce">
                +${chestWonAmount} CREDITS ADDED TO YOUR BALANCE!
              </div>
            )}
          </div>
        )}

        {activeMiniGame === 'wheel' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-amber-300">FORTUNE MULTIPLIER WHEEL</h2>
            <p className="text-xs text-slate-400">Spin the wheel to hit high-tier bonus prizes.</p>

            <div className="py-8 flex flex-col items-center justify-center">
              <div
                className={`text-8xl transition-transform duration-1000 ${
                  isWheelSpinning ? 'animate-spin' : ''
                }`}
              >
                🎯
              </div>

              {wheelWinAmount !== null ? (
                <div className="mt-6 text-emerald-400 font-extrabold text-xl animate-bounce">
                  +${wheelWinAmount} CREDITS WON!
                </div>
              ) : (
                <button
                  disabled={isWheelSpinning}
                  onClick={handleSpinWheel}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-950 font-black text-sm uppercase rounded-2xl shadow-xl hover:brightness-110 disabled:opacity-50"
                >
                  {isWheelSpinning ? 'SPINNING...' : 'SPIN WHEEL'}
                </button>
              )}
            </div>
          </div>
        )}

        {activeMiniGame === 'boxes' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-amber-300">MYSTERY BOX CHALLENGE</h2>
            <p className="text-xs text-slate-400">Tap a box to reveal mystery jackpot coins.</p>

            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto py-6">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  disabled={boxPicked !== null}
                  onClick={() => handlePickBox(num)}
                  className="p-8 bg-slate-950 border-2 border-slate-800 hover:border-indigo-400 rounded-2xl text-4xl transition transform hover:scale-105"
                >
                  {boxPicked === num ? '💎' : '📦'}
                </button>
              ))}
            </div>

            {boxWonAmount !== null && (
              <div className="text-emerald-400 font-extrabold text-lg animate-bounce">
                +${boxWonAmount} MYSTERY BONUS CREDITED!
              </div>
            )}
          </div>
        )}

        {/* Reset button */}
        {(chestWonAmount || wheelWinAmount || boxWonAmount) && (
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                soundFx.playClick();
                resetAllGames();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Play Again</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
