import React from 'react';
import { Stats } from '../types';
import { X, BarChart3, TrendingUp, Percent, Award, Flame, Coins } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: Stats | null;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen || !stats) return null;

  return (
    <div id="stats-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-amber-400">
            <BarChart3 className="w-6 h-6" />
            <h2 className="text-xl font-black uppercase tracking-wider">Live Analytics & RTP</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Analytics Grid */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* RTP Metric */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                <Percent className="w-4 h-4 text-amber-400" />
                <span>Return to Player (RTP)</span>
              </div>
              <div className="text-3xl font-black font-mono text-amber-300 mt-2">
                {stats.rtp.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Theoretical Target: ~95.0%</div>
            </div>

            {/* Win Rate */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/30 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Hit Frequency</span>
              </div>
              <div className="text-3xl font-black font-mono text-emerald-300 mt-2">
                {stats.winRate.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-1">{stats.winCount} Wins / {stats.totalSpins} Spins</div>
            </div>

            {/* Total Wagered */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                <Coins className="w-4 h-4 text-blue-400" />
                <span>Total Wagered</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-200 mt-2">
                ${stats.totalWagered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Total Payout */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                <Award className="w-4 h-4 text-purple-400" />
                <span>Total Won</span>
              </div>
              <div className="text-2xl font-bold font-mono text-purple-300 mt-2">
                ${stats.totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Biggest Win Banner */}
          <div className="bg-gradient-to-r from-amber-950/60 to-yellow-950/60 p-4 rounded-2xl border border-amber-500/40 flex items-center justify-between">
            <div>
              <div className="text-xs uppercase font-bold text-amber-300">Biggest Single Win</div>
              <div className="text-2xl font-black font-mono text-yellow-200 mt-1">
                ${stats.biggestWin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <Flame className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
