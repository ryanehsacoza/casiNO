import React from 'react';
import { Stats, SpinHistoryItem } from '../../types';
import { BarChart3, TrendingUp, DollarSign, Award, History, CheckCircle2, RefreshCw } from 'lucide-react';

interface StatsViewProps {
  stats: Stats | null;
  history: SpinHistoryItem[];
  onRefreshStats: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats, history, onRefreshStats }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Audited Performance Metrics</span>
          </div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-100">
            SLOT STATISTICS & RTP SIMULATION
          </h1>
        </div>

        <button
          onClick={onRefreshStats}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition flex items-center gap-2 text-xs font-bold"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-bold uppercase">Simulated RTP</div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
            {stats ? `${stats.rtp.toFixed(1)}%` : '96.5%'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Return to Player ratio</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-bold uppercase">Total Spins</div>
          <div className="text-3xl font-black font-mono text-amber-300 mt-1">
            {stats ? stats.totalSpins : 0}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Server audited spins</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-bold uppercase">Win Rate</div>
          <div className="text-3xl font-black font-mono text-cyan-400 mt-1">
            {stats ? `${stats.winRate.toFixed(1)}%` : '0%'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Hit frequency %</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-bold uppercase">Biggest Win</div>
          <div className="text-3xl font-black font-mono text-yellow-400 mt-1">
            ${stats ? stats.biggestWin.toFixed(2) : '0.00'}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Max payout multiplier</div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 mb-4">
          <History className="w-5 h-5" />
          <h2 className="font-black text-lg uppercase tracking-wider">Recent Spin Ledger</h2>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">No spin history logged yet. Go to Slot Machine to play!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Wager</th>
                  <th className="py-3 px-4">Payout</th>
                  <th className="py-3 px-4">Lines Hit</th>
                  <th className="py-3 px-4">Bonus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {history.slice(0, 10).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 px-4 text-slate-300">${item.totalBet.toFixed(2)}</td>
                    <td className={`py-3 px-4 font-bold ${item.payout > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      +${item.payout.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{item.winningLinesCount} lines</td>
                    <td className="py-3 px-4">
                      {item.isBonus ? (
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded uppercase">
                          FREE SPINS
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
