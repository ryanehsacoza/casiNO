import React, { useState } from 'react';
import { Package, Gift, Sparkles, Trophy, CheckCircle, ArrowRight, X } from 'lucide-react';
import { ZonkePickResponse } from '../types';
import { soundFx } from '../utils/audio';

interface ZonkeBoxModalProps {
  totalBet: number;
  currencySymbol: string;
  onClose: () => void;
  onUpdateUser: (credits: number, bonusSpins: number) => void;
}

export const ZonkeBoxModal: React.FC<ZonkeBoxModalProps> = ({
  totalBet,
  currencySymbol,
  onClose,
  onUpdateUser,
}) => {
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [result, setResult] = useState<ZonkePickResponse | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  const boxes = [
    { id: 0, label: 'Zonke Gold Crate', color: 'from-amber-400 via-yellow-500 to-amber-700', border: 'border-yellow-400' },
    { id: 1, idLabel: 'Kingdom Mystery', label: 'Kingdom Crate', color: 'from-amber-500 via-orange-600 to-red-800', border: 'border-amber-400' },
    { id: 2, idLabel: 'PlayLive Box', label: 'PlayLive Crate', color: 'from-emerald-400 via-teal-600 to-emerald-900', border: 'border-emerald-400' },
    { id: 3, idLabel: 'Zonke Diamond', label: 'Diamond Crate', color: 'from-cyan-400 via-blue-600 to-indigo-900', border: 'border-cyan-400' },
    { id: 4, idLabel: 'Grand Central', label: 'Grand Central Crate', color: 'from-purple-400 via-fuchsia-600 to-purple-950', border: 'border-purple-400' },
  ];

  const handlePickBox = async (boxIndex: number) => {
    if (selectedBox !== null || isOpening) return;
    setSelectedBox(boxIndex);
    setIsOpening(true);
    soundFx.playClick();

    try {
      const response = await fetch('/api/zonke/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'player-1',
          boxIndex,
          totalBet: Math.max(10, totalBet),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: ZonkePickResponse = await response.json();
      setResult(data);
      soundFx.playZonkeBoxOpen();
      onUpdateUser(data.newCredits, data.newBonusSpins);
    } catch (e) {
      console.warn('Failed to open Zonke Box, using offline fallback:', e);
      const fallbackPrize = Math.round(totalBet * 25);
      const fallbackResult: ZonkePickResponse = {
        boxIndex,
        prizeType: 'CREDITS',
        prizeAmount: fallbackPrize,
        creditsAwarded: fallbackPrize,
        freeSpinsAwarded: 0,
        newCredits: 1000 + fallbackPrize,
        newBonusSpins: 0,
        allBoxes: [0, 1, 2, 3, 4].map((i) => ({
          index: i,
          label: `Zonke Crate #${i + 1}`,
          prize: i === boxIndex ? `R ${fallbackPrize} Cash!` : `R ${Math.round(totalBet * (10 + i * 5))} Cash!`,
        })),
      };
      setResult(fallbackResult);
      soundFx.playZonkeBoxOpen();
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.3)] overflow-hidden">
        {/* Background Sparkles / Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 px-4 py-1.5 rounded-full border border-amber-400/40 text-amber-300 font-bold text-xs uppercase tracking-widest mb-3">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            Kingdom Slots & PlayLive.co.za Feature
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 font-serif tracking-wide">
            ZONKE MYSTERY BOXES
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-md mx-auto">
            Pick a mystery Zonke Box to reveal instant cash payouts, multiplier surges, or free spin crates!
          </p>
        </div>

        {/* Boxes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-4 mb-6 sm:mb-8 max-h-[50vh] sm:max-h-none overflow-y-auto p-1">
          {boxes.map((box, idx) => {
            const isPicked = selectedBox === box.id;
            const revealedInfo = result?.allBoxes.find((b) => b.index === box.id);
            const isLastOdd = idx === 4;

            return (
              <button
                key={box.id}
                onClick={() => handlePickBox(box.id)}
                disabled={selectedBox !== null}
                className={`group relative flex flex-col items-center justify-between p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 ${
                  isLastOdd ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  isPicked
                    ? 'border-yellow-300 bg-amber-500/30 scale-105 shadow-[0_0_30px_rgba(250,204,21,0.6)]'
                    : selectedBox !== null
                    ? 'border-slate-700 bg-slate-800/40 opacity-60'
                    : `bg-slate-800/80 ${box.border} hover:scale-105 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]`
                }`}
              >
                {/* Box Icon */}
                <div className="relative my-1 sm:my-2">
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${box.color} flex items-center justify-center text-2xl sm:text-3xl shadow-lg border border-white/20 group-hover:rotate-6 transition-transform`}
                  >
                    {isPicked ? '🎁' : '📦'}
                  </div>
                  {isPicked && (
                    <Sparkles className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-bounce" />
                  )}
                </div>

                <div className="text-center mt-1 sm:mt-2">
                  <div className="text-[11px] sm:text-xs font-bold text-slate-200">{box.label}</div>
                  {selectedBox === null && (
                    <div className="text-[9px] sm:text-[10px] text-amber-400 font-semibold mt-0.5 sm:mt-1 uppercase tracking-wider">
                      Pick Box
                    </div>
                  )}
                </div>

                {/* Revealed Overlay */}
                {result && revealedInfo && (
                  <div
                    className={`mt-2 text-[10px] sm:text-xs font-black px-2 py-0.5 sm:py-1 rounded-lg w-full text-center ${
                      isPicked
                        ? 'bg-yellow-400 text-slate-950 font-mono shadow-md animate-pulse'
                        : 'bg-slate-700 text-slate-300 font-mono'
                    }`}
                  >
                    {revealedInfo.prize}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Outcome Banner */}
        {result && (
          <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/50 rounded-2xl p-4 text-center animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-lg mb-1">
              <Trophy className="w-6 h-6 text-yellow-400" />
              ZONKE BOX UNLOCKED!
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-200 font-mono">
              +{currencySymbol} {result.creditsAwarded.toLocaleString()}
              {result.freeSpinsAwarded > 0 && ` + ${result.freeSpinsAwarded} FREE SPINS!`}
            </p>
            <p className="text-xs text-amber-400/80 mt-1">
              All Zonke Box prizes have been added to your casino balance.
            </p>

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 mx-auto transition-transform active:scale-95"
            >
              COLLECT WINS & CONTINUE
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
