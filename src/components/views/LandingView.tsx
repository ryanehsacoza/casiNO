import React from 'react';
import { soundFx } from '../../utils/audio';
import { Play, Sparkles, Trophy, ShieldCheck, Zap, Dices, Gift } from 'lucide-react';

interface LandingViewProps {
  onStartPlaying: () => void;
  onOpenBonus: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStartPlaying, onOpenBonus }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 px-4 text-center max-w-5xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-lg shadow-amber-500/10">
        <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
        <span>Next-Gen Animated Vegas Slot Machine</span>
      </div>

      {/* Hero Main Heading */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-100 font-sans drop-shadow-[0_10px_20px_rgba(245,158,11,0.3)]">
          CYBER VEGAS SLOTS
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
          Experience server-authoritative slot mechanics, realistic reel physics, 20-payline 5x3 matrices, free spin multipliers, and interactive bonus mini-games.
        </p>
      </div>

      {/* Animated Floating Reel Symbols */}
      <div className="flex justify-center gap-4 sm:gap-8 my-6">
        {['🍒', '💎', '7️⃣', '🃏', '⭐'].map((emoji, idx) => (
          <div
            key={idx}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-amber-500/20 transform hover:scale-125 transition-all duration-300 hover:rotate-6 cursor-pointer"
            style={{ animationDelay: `${idx * 0.15}s` }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Main CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
        <button
          onClick={() => {
            soundFx.playClick();
            onStartPlaying();
          }}
          className="w-full sm:w-auto flex-1 py-4 px-8 bg-gradient-to-r from-yellow-300 via-amber-500 to-amber-600 hover:brightness-110 text-slate-950 rounded-2xl font-black text-lg uppercase tracking-wider shadow-2xl shadow-amber-500/40 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>Enter Casino Lobby</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onOpenBonus();
          }}
          className="w-full sm:w-auto py-4 px-6 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition"
        >
          <Gift className="w-5 h-5 text-indigo-400" />
          <span>Bonus World</span>
        </button>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-8 border-t border-slate-800">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-left space-y-2">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-200">Server-Authoritative</h3>
          <p className="text-xs text-slate-400">All outcomes generated server-side with verified paytable multipliers and audit logging in SQLite.</p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-left space-y-2">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl w-fit">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-200">Progressive Jackpot</h3>
          <p className="text-xs text-slate-400">Dynamic jackpot pool feeding from non-bonus spins with full-screen celebration sequences.</p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-left space-y-2">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-200">20-Line Payline Engine</h3>
          <p className="text-xs text-slate-400">Custom SVG laser payline connectors and Web Audio API synthesized sound effects.</p>
        </div>
      </div>
    </div>
  );
};
