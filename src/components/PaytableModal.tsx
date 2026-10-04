import React from 'react';
import { X, HelpCircle, Shield, Sparkles } from 'lucide-react';
import { SYMBOLS, PAYLINES_3X3, PAYLINES_5X3 } from '../../server/gameEngine';

interface PaytableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaytableModal: React.FC<PaytableModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const symbolList = Object.values(SYMBOLS);

  return (
    <div id="paytable-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-amber-400">
            <HelpCircle className="w-6 h-6" />
            <h2 className="text-xl font-black uppercase tracking-wider">Paytable & Game Rules</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Symbol Payout Grid */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Symbol Multipliers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {symbolList.map((sym) => (
                <div key={sym.id} className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
                  <div className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-800">{sym.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-200 flex items-center justify-between">
                      <span>{sym.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Weight: {sym.weight}</span>
                    </div>
                    <div className="flex gap-2 text-xs font-mono mt-1 text-amber-400">
                      {Object.entries(sym.payouts).map(([count, mult]) => (
                        <span key={count} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {count}x: {mult}x
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/30">
              <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
                <Sparkles className="w-5 h-5" />
                <span>Wild Joker Symbol</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Substitutes for any symbol (except SCATTER ⭐) on active paylines to maximize winning line payouts.
              </p>
            </div>

            <div className="bg-indigo-950/30 p-4 rounded-2xl border border-indigo-500/30">
              <div className="flex items-center gap-2 font-bold text-indigo-400 mb-1">
                <Shield className="w-5 h-5" />
                <span>Free Spins Scatter</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Land 3 or more ⭐ Scatter symbols anywhere on the reels to trigger up to 25 Free Spins with 2X Multipliers!
              </p>
            </div>
          </div>

          {/* Paylines Info */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">5x3 Paylines Overview</h3>
            <div className="text-xs text-slate-300 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
              <p>• <strong>Horizontal Lines:</strong> Top (Row 0), Center (Row 1), Bottom (Row 2)</p>
              <p>• <strong>V & Inverted V Shapes:</strong> [0, 1, 2, 1, 0] and [2, 1, 0, 1, 2]</p>
              <p>• <strong>ZigZag & Wave Patterns:</strong> 15 additional diagonal and step payline configurations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
