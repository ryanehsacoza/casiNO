import React from 'react';
import { soundFx } from '../utils/audio';
import { Play, RotateCcw, Zap, SlidersHorizontal, ShieldCheck } from 'lucide-react';

interface BetControlsProps {
  matrixMode: '3x3' | '5x3' | '5x4';
  onToggleMatrixMode: (mode: '3x3' | '5x3' | '5x4') => void;
  betPerLine: number;
  onChangeBet: (bet: number) => void;
  activeLines: number;
  onChangeLines: (lines: number) => void;
  totalBet: number;
  isSpinning: boolean;
  autoSpinsRemaining: number;
  onSpin: () => void;
  onToggleAutoSpin: (count: number) => void;
  onMaxBet: () => void;
  userCredits: number;
  isBonusMode: boolean;
  canGamble?: boolean;
  onOpenGamble?: () => void;
  zonkeTriggered?: boolean;
  onOpenZonke?: () => void;
  currencySymbol?: string;
}

const BET_OPTIONS = [1, 2, 5, 10, 25, 50, 100];

const getLineOptions = (matrixMode: '3x3' | '5x3' | '5x4') => {
  return matrixMode === '3x3' ? [1, 3, 5] : matrixMode === '5x4' ? [1, 5, 10, 20, 25] : [1, 5, 10, 20];
};

export const BetControls: React.FC<BetControlsProps> = ({
  matrixMode,
  onToggleMatrixMode,
  betPerLine,
  onChangeBet,
  activeLines,
  onChangeLines,
  totalBet,
  isSpinning,
  autoSpinsRemaining,
  onSpin,
  onToggleAutoSpin,
  onMaxBet,
  userCredits,
  isBonusMode,
  canGamble = false,
  onOpenGamble,
  zonkeTriggered = false,
  onOpenZonke,
  currencySymbol = '$',
}) => {
  const maxLinesPossible = matrixMode === '3x3' ? 5 : matrixMode === '5x4' ? 25 : 20;

  return (
    <div id="slot-controls" className="w-full bg-slate-900/95 border border-amber-500/30 rounded-2xl p-4 md:p-5 shadow-2xl backdrop-blur-md">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left Column: Mode & Bet Sliders */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Matrix Mode Switch */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Reel Engine</span>
            <div className="flex gap-1 mt-2">
              <button
                id="mode-3x3-btn"
                disabled={isSpinning}
                onClick={() => {
                  soundFx.playClick();
                  onToggleMatrixMode('3x3');
                }}
                className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] sm:text-xs font-bold transition ${
                  matrixMode === '3x3'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                3x3
              </button>
              <button
                id="mode-5x3-btn"
                disabled={isSpinning}
                onClick={() => {
                  soundFx.playClick();
                  onToggleMatrixMode('5x3');
                }}
                className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] sm:text-xs font-bold transition ${
                  matrixMode === '5x3'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                5x3
              </button>
              <button
                id="mode-5x4-btn"
                disabled={isSpinning}
                onClick={() => {
                  soundFx.playClick();
                  onToggleMatrixMode('5x4');
                }}
                className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] sm:text-xs font-bold transition ${
                  matrixMode === '5x4'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                5x4
              </button>
            </div>
          </div>

          {/* Bet Per Line Selector */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              <span>Bet / Line</span>
              <span className="text-amber-400 font-mono font-bold">{currencySymbol}{betPerLine}</span>
            </div>
            <div className="flex items-center gap-1 mt-2 overflow-x-auto pb-1">
              {BET_OPTIONS.map((val) => (
                <button
                  key={val}
                  disabled={isSpinning}
                  onClick={() => {
                    soundFx.playClick();
                    onChangeBet(val);
                  }}
                  className={`px-2 py-1 rounded text-xs font-bold font-mono transition ${
                    betPerLine === val
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {currencySymbol}{val}
                </button>
              ))}
            </div>
          </div>

          {/* Lines Selector */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              <span>Paylines</span>
              <span className="text-amber-400 font-mono font-bold">{activeLines} / {maxLinesPossible}</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getLineOptions(matrixMode).map((lineCount) => (
                <button
                  key={lineCount}
                  disabled={isSpinning}
                  onClick={() => {
                    soundFx.playClick();
                    onChangeLines(lineCount);
                  }}
                  className={`flex-1 py-1 rounded text-xs font-bold font-mono transition ${
                    activeLines === lineCount
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {lineCount}L
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Total Bet, Max Bet, Auto-Spin & SPIN Button */}
        <div className="lg:col-span-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
          {/* Total Bet Box */}
          <div className="bg-slate-950/90 border border-amber-500/40 px-4 py-2.5 rounded-xl text-center min-w-[110px] flex-1 sm:flex-none">
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Total Wager</div>
            <div className="text-xl font-extrabold text-amber-300 font-mono">
              {isBonusMode ? (
                <span className="text-emerald-400 uppercase font-sans text-sm">FREE SPIN</span>
              ) : (
                `${currencySymbol}${totalBet}`
              )}
            </div>
          </div>

          {/* Action Buttons: Max Bet, Auto Spin, Gamble & Zonke */}
          <div className="flex gap-1.5 flex-wrap sm:flex-nowrap">
            {/* GAMBLE BUTTON (Novomatic Style) */}
            {canGamble && onOpenGamble && (
              <button
                id="gamble-btn"
                disabled={isSpinning}
                onClick={() => {
                  soundFx.playClick();
                  onOpenGamble();
                }}
                className="px-3 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-xl text-xs font-black tracking-wider uppercase border border-red-400/50 shadow-lg shadow-red-500/30 animate-pulse transition flex items-center gap-1"
                title="Gamble / Double Up Win"
              >
                ❤️ GAMBLE
              </button>
            )}

            {/* ZONKE BOXES BUTTON (Kingdom Slots / PlayLive Style) */}
            {(zonkeTriggered || true) && onOpenZonke && (
              <button
                id="zonke-boxes-btn"
                disabled={isSpinning}
                onClick={() => {
                  soundFx.playClick();
                  onOpenZonke();
                }}
                className={`px-3 py-3 rounded-xl text-xs font-black tracking-wider uppercase border transition shadow-lg flex items-center gap-1 ${
                  zonkeTriggered
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-950 border-yellow-200 animate-bounce shadow-amber-500/50'
                    : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border-amber-500/40'
                }`}
                title="Open Zonke Mystery Boxes"
              >
                🎁 ZONKE
              </button>
            )}

            <button
              id="max-bet-btn"
              disabled={isSpinning || isBonusMode}
              onClick={() => {
                soundFx.playClick();
                onMaxBet();
              }}
              className="px-3 py-3 bg-gradient-to-b from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white rounded-xl text-xs font-black tracking-wider uppercase border border-indigo-400/30 transition shadow-lg disabled:opacity-50"
              title="Max Bet & Lines"
            >
              MAX
            </button>

            <button
              id="auto-spin-btn"
              disabled={isSpinning && autoSpinsRemaining === 0}
              onClick={() => {
                soundFx.playClick();
                onToggleAutoSpin(autoSpinsRemaining > 0 ? 0 : 10);
              }}
              className={`px-3 py-3 rounded-xl text-xs font-black tracking-wider uppercase border transition shadow-lg flex items-center gap-1 ${
                autoSpinsRemaining > 0
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/50 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {autoSpinsRemaining > 0 ? `${autoSpinsRemaining}` : 'AUTO'}
            </button>
          </div>

          {/* MAIN SPIN BUTTON */}
          <button
            id="spin-button"
            disabled={isSpinning || (!isBonusMode && userCredits < totalBet)}
            onClick={() => {
              soundFx.playClick();
              onSpin();
            }}
            className={`w-full sm:w-auto flex-1 py-4 px-8 rounded-2xl text-lg font-black tracking-widest uppercase transition-all duration-300 shadow-xl flex items-center justify-center gap-2 transform active:scale-95 ${
              isSpinning
                ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed border border-amber-500/30'
                : !isBonusMode && userCredits < totalBet
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-600 text-slate-950 border-2 border-yellow-200 shadow-amber-500/40 hover:brightness-110 animate-bounce hover:animate-none'
            }`}
          >
            {isSpinning ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin" />
                <span>SPINNING...</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current" />
                <span>SPIN</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
