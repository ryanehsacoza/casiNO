import React from 'react';
import { SymbolId, SymbolConfig } from '../types';
import { SYMBOLS } from '../../server/gameEngine';
import { SpiceJar3D } from './SpiceJar3D';
import { Sparkles } from 'lucide-react';

interface ReelSymbolProps {
  symbolId: SymbolId;
  isWinning?: boolean;
  isDimmed?: boolean;
  isSpinningStrip?: boolean;
}

export const ReelSymbol: React.FC<ReelSymbolProps> = ({
  symbolId,
  isWinning = false,
  isDimmed = false,
  isSpinningStrip = false,
}) => {
  const config: SymbolConfig = SYMBOLS[symbolId] || SYMBOLS.CHERRY;

  return (
    <div
      className={`relative w-full h-16 xs:h-20 sm:h-24 md:h-28 lg:h-32 rounded-xl sm:rounded-2xl flex flex-col justify-between p-1.5 sm:p-2.5 select-none overflow-hidden transition-all duration-300 ${
        isWinning
          ? 'ring-4 ring-yellow-400 z-10 shadow-[0_0_35px_rgba(245,158,11,0.9)] scale-105 animate-pulse animate-rainbow-border'
          : isDimmed
          ? 'opacity-35 grayscale-[70%]'
          : config.isWild
          ? 'border-2 border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:border-emerald-300'
          : config.isScatter
          ? 'border-2 border-indigo-400/80 shadow-[0_0_15px_rgba(129,140,248,0.3)] hover:border-indigo-300'
          : 'border border-slate-800/90 hover:border-amber-500/50 hover:shadow-lg'
      }`}
    >
      {/* 1. FULL-BLEED BACKGROUND & ARTWORK / SPRITE IMAGE */}
      {symbolId === 'SPICE_JAR' && !isSpinningStrip ? (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-b from-amber-950/90 via-slate-950 to-amber-900/80">
          <SpiceJar3D size={110} isSpinning={true} speed={isWinning ? 0.08 : 0.025} />
        </div>
      ) : symbolId === 'SPICE_JAR' && isSpinningStrip ? (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-amber-950 via-yellow-950 to-slate-950 flex items-center justify-center">
          <span className="text-4xl sm:text-5xl filter drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">🫙</span>
        </div>
      ) : config.imageUrl ? (
        <div className="absolute inset-0 w-full h-full bg-slate-950">
          <img
            src={config.imageUrl}
            alt={config.name}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isWinning ? 'scale-110 brightness-125 saturate-125' : 'hover:scale-105'
            }`}
          />
          {/* Subtle vignette gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-slate-950/40" />
        </div>
      ) : (
        /* Fallback Full Block Gradient with Emoji Icon */
        <div className={`absolute inset-0 w-full h-full bg-gradient-to-b ${config.bgGradient} flex items-center justify-center`}>
          <span
            className={`text-3xl xs:text-4xl sm:text-5xl lg:text-6xl filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-transform duration-300 ${
              isWinning ? 'scale-125 animate-bounce' : 'animate-pulse-glow'
            }`}
          >
            {config.icon}
          </span>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
        </div>
      )}

      {/* 2. CONTINUOUS ANIMATED SHIMMER / LIGHTNING SWEEP ON IMAGES */}
      <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-shimmer pointer-events-none" />

      {/* 3. SCATTER SPARKLE / AURA ANIMATION */}
      {config.isScatter && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-indigo-500/10 animate-pulse">
          <Sparkles className="w-8 h-8 text-indigo-300/60 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      )}

      {/* 4. TOP BADGES LAYER */}
      <div className="relative z-20 flex items-center justify-between w-full pointer-events-none">
        {symbolId === 'SPICE_JAR' && (
          <span className="px-1 py-0.5 text-[7px] xs:text-[8px] font-black bg-amber-500 text-slate-950 rounded uppercase tracking-wider shadow-md border border-amber-300/50">
            3D SPICE
          </span>
        )}
        {config.isWild && (
          <span className="px-1.5 py-0.5 text-[7px] xs:text-[8px] font-black bg-emerald-400 text-slate-950 rounded uppercase tracking-wider shadow-md border border-emerald-200 animate-pulse">
            WILD
          </span>
        )}
        {config.isScatter && (
          <span className="px-1.5 py-0.5 text-[7px] xs:text-[8px] font-black bg-indigo-500 text-white rounded uppercase tracking-wider shadow-md border border-indigo-300 animate-bounce">
            SCATTER
          </span>
        )}
      </div>

      {/* 5. BOTTOM NAME & MULTIPLIER LABEL */}
      <div className="relative z-20 flex items-end justify-between w-full pointer-events-none">
        <span
          className="text-[9px] xs:text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] truncate max-w-[70%]"
          style={{ color: isWinning ? '#fef08a' : undefined }}
        >
          {config.name}
        </span>
        <span className="text-[8px] xs:text-[9px] font-mono font-bold text-amber-300/90 bg-slate-950/85 px-1 py-0.5 rounded border border-amber-500/30">
          {config.payouts ? `${config.payouts[3]}x` : ''}
        </span>
      </div>
    </div>
  );
};
