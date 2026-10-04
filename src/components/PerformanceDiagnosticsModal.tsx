import React from 'react';
import { PerformanceMetrics } from '../hooks/usePerformanceDiagnostics';
import { Activity, Cpu, Zap, ShieldCheck, X } from 'lucide-react';

interface PerformanceDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: PerformanceMetrics;
}

export const PerformanceDiagnosticsModal: React.FC<PerformanceDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  metrics,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] space-y-5 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/40 rounded-2xl text-cyan-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-400 uppercase tracking-wide">
              Performance Diagnostics
            </h2>
            <p className="text-xs text-slate-400">Internal Real-Time Rendering & Hardware Metrics</p>
          </div>
        </div>

        {/* Live Gauges Grid */}
        <div className="grid grid-cols-2 gap-3 font-mono">
          <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-2xl text-center space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Live FPS</span>
            <div className="text-2xl font-black text-emerald-400">{metrics.fps} FPS</div>
            <span className="text-[9px] text-emerald-500/80 font-sans font-bold">Target: 60 FPS</span>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-2xl text-center space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Frame Latency</span>
            <div className="text-2xl font-black text-cyan-300">{metrics.avgFrameTimeMs} ms</div>
            <span className="text-[9px] text-cyan-400/80 font-sans font-bold">60Hz Budget: 16.6ms</span>
          </div>
        </div>

        {/* Diagnostic Status Cards */}
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="font-bold">GPU Hardware Acceleration</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded-md">
              ACTIVE (translate3d)
            </span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="font-bold">Performance Tier</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 border border-amber-500/50 text-amber-300 rounded-md uppercase">
              {metrics.performanceTier} OPTIMIZED
            </span>
          </div>
        </div>

        {/* Applied Internal Optimizations */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Applied Rendering Engine Optimizations</span>
          </span>
          <div className="space-y-1.5">
            {metrics.activeOptimizations.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{opt}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase rounded-2xl transition"
        >
          Close Diagnostics
        </button>
      </div>
    </div>
  );
};
