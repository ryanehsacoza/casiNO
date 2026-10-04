import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/audio';
import { Gift, Calendar, CheckCircle2, Sparkles, Trophy, Flame, X } from 'lucide-react';

interface DailyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (amount: number) => void;
}

export const DailyLoginModal: React.FC<DailyLoginModalProps> = ({ isOpen, onClose, onClaimReward }) => {
  const [claimed, setClaimed] = useState(false);
  const [activeDay, setActiveDay] = useState(4); // Day 4 active example

  if (!isOpen) return null;

  const streakDays = [
    { day: 1, reward: 250, label: '$250', done: true },
    { day: 2, reward: 500, label: '$500', done: true },
    { day: 3, reward: 750, label: '$750', done: true },
    { day: 4, reward: 1500, label: '$1,500', active: true },
    { day: 5, reward: 2000, label: '$2,000' },
    { day: 6, reward: 3000, label: '$3,000' },
    { day: 7, reward: 5000, label: '$5,000 👑', jackpot: true },
  ];

  const handleClaim = () => {
    if (claimed) return;

    soundFx.playBonusFanfare();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
    });

    setClaimed(true);
    onClaimReward(1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center space-y-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-widest">
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Daily Login Reward Streak</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-100">
            DAY 4 CLAIM READY!
          </h2>
          <p className="text-xs text-slate-400">Log in every day to unlock massive free credit bonuses!</p>
        </div>

        {/* 7-Day Streak Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-2">
          {streakDays.map((d) => (
            <div
              key={d.day}
              className={`p-2.5 rounded-2xl border flex flex-col items-center justify-between text-center transition-all ${
                d.done
                  ? 'bg-slate-950/80 border-emerald-500/40 text-emerald-400 opacity-80'
                  : d.active
                  ? 'bg-gradient-to-b from-amber-500/30 to-yellow-600/40 border-yellow-400 shadow-lg shadow-yellow-500/20 scale-105'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}
            >
              <span className="text-[10px] font-bold uppercase">Day {d.day}</span>
              <div className="my-1.5 text-lg">
                {d.done ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : d.jackpot ? '👑' : '🎁'}
              </div>
              <span className="text-[10px] font-black font-mono">{d.label}</span>
            </div>
          ))}
        </div>

        {/* Claim Action Box */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          {claimed ? (
            <div className="space-y-3">
              <div className="text-emerald-400 font-black text-xl animate-bounce flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6" />
                <span>+$1,500 CREDITS CLAIMED!</span>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase rounded-2xl transition"
              >
                Close & Play Slots
              </button>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              className="w-full py-4 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-slate-950 font-black text-sm uppercase rounded-2xl shadow-xl hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5" />
              <span>CLAIM $1,500 DAILY BONUS</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
