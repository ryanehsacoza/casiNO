import React, { useEffect, useState, useRef } from 'react';
import { SymbolId } from '../types';
import { ReelSymbol } from './ReelSymbol';
import { soundFx } from '../utils/audio';

interface ReelProps {
  reelIndex: number;
  symbols: SymbolId[]; // 3 or 4 target symbols [top, middle, bottom...]
  isSpinning: boolean;
  stopDelay: number; // Delay in ms before stopping this reel
  winningPositions: number[]; // Row indices that won
  hasWinningLines: boolean;
  onReelStopped: (reelIndex: number) => void;
}

// Continuous symbol strip for smooth reel rolling
const DUMMY_STRIP: SymbolId[] = [
  'WILD',
  'SEVEN',
  'DIAMOND',
  'BONUS',
  'BAR',
  'BELL',
  'PLUM',
  'ORANGE',
  'LEMON',
  'CHERRY',
  'SPICE_JAR',
  'ZONKE_BOX',
];

export const Reel: React.FC<ReelProps> = ({
  reelIndex,
  symbols,
  isSpinning,
  stopDelay,
  winningPositions,
  hasWinningLines,
  onReelStopped,
}) => {
  const [displaySymbols, setDisplaySymbols] = useState<SymbolId[]>(symbols);
  const [isLocallySpinning, setIsLocallySpinning] = useState<boolean>(false);
  const [justLanded, setJustLanded] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const lastSymbolCrossedRef = useRef<number>(-1);

  // Construct a long rolling strip that ends with target symbols
  const spinStripRef = useRef<SymbolId[]>([]);

  useEffect(() => {
    if (isSpinning) {
      setIsLocallySpinning(true);
      setJustLanded(false);

      // Create a deterministic long strip: [initial display] + [2 sets of dummy strip] + [final target symbols]
      const current = displaySymbols.length > 0 ? displaySymbols : symbols;
      const fullStrip = [...current, ...DUMMY_STRIP, ...DUMMY_STRIP, ...symbols];
      spinStripRef.current = fullStrip;

      const startTime = performance.now();
      const duration = Math.max(400, stopDelay);

      // Measure symbol height dynamically from container or strip child
      const runRafSpinLoop = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        if (containerRef.current && stripRef.current) {
          const containerHeight = containerRef.current.clientHeight || 300;
          const symbolHeight = containerHeight / symbols.length;
          const totalSymbolRows = fullStrip.length - symbols.length; // distance in symbol units
          const totalDistancePx = totalSymbolRows * symbolHeight;

          let currentY = 0;

          // 1. Recoil Phase (First 10% of time: slight upward pull back)
          if (progress < 0.08) {
            const recoilFactor = Math.sin((progress / 0.08) * Math.PI);
            currentY = -18 * recoilFactor;
          }
          // 2. High-speed spin with smooth ease-out deceleration into target
          else {
            const spinProgress = (progress - 0.08) / 0.92;
            // Cubic ease-out deceleration curve: starts fast, lands with mechanical precision
            const easeOutCurve = 1 - Math.pow(1 - spinProgress, 3);
            currentY = easeOutCurve * totalDistancePx;
          }

          // Apply 60fps hardware-accelerated transform
          stripRef.current.style.transform = `translate3d(0, ${-currentY}px, 0)`;

          // Audio Tick Trigger on every full symbol boundary crossed
          const currentSymbolRow = Math.floor(currentY / symbolHeight);
          if (currentSymbolRow !== lastSymbolCrossedRef.current && currentSymbolRow >= 0) {
            lastSymbolCrossedRef.current = currentSymbolRow;
            const cadence = 1 + (progress * 0.5);
            soundFx.playSymbolFrameClick(reelIndex, cadence);
          }
        }

        if (progress < 1) {
          frameIdRef.current = requestAnimationFrame(runRafSpinLoop);
        } else {
          // Finish Spin & Land Target Symbols
          setDisplaySymbols(symbols);
          setIsLocallySpinning(false);
          setJustLanded(true);

          if (stripRef.current) {
            stripRef.current.style.transform = 'translate3d(0, 0, 0)';
          }

          soundFx.playReelStop(reelIndex);
          onReelStopped(reelIndex);

          setTimeout(() => setJustLanded(false), 250);
        }
      };

      lastSymbolCrossedRef.current = -1;
      frameIdRef.current = requestAnimationFrame(runRafSpinLoop);

      return () => {
        if (frameIdRef.current) {
          cancelAnimationFrame(frameIdRef.current);
        }
      };
    } else {
      setDisplaySymbols(symbols);
      setIsLocallySpinning(false);
    }
  }, [isSpinning, stopDelay, symbols, reelIndex]);

  const activeSpinStrip = spinStripRef.current.length > 0 ? spinStripRef.current : [...symbols, ...DUMMY_STRIP, ...symbols];

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 flex flex-col p-1 sm:p-1.5 bg-slate-950/90 rounded-xl sm:rounded-2xl border-2 transition-colors duration-200 overflow-hidden ${
        isLocallySpinning
          ? 'border-amber-400/90 shadow-[0_0_25px_rgba(245,158,11,0.4)]'
          : justLanded
          ? 'border-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.5)]'
          : 'border-slate-800/90'
      }`}
    >
      {/* Viewport Frame Box */}
      <div className="relative w-full overflow-hidden h-full">
        {isLocallySpinning ? (
          <div className="relative w-full overflow-hidden">
            {/* rAF-Driven Smooth Transforming Strip */}
            <div
              ref={stripRef}
              className="flex flex-col gap-1.5 sm:gap-2 filter blur-[0.3px] brightness-110 will-change-transform"
            >
              {activeSpinStrip.map((sym, idx) => (
                <div key={`raf-strip-${reelIndex}-${idx}`} className="w-full">
                  <ReelSymbol symbolId={sym} isSpinningStrip={true} />
                </div>
              ))}
            </div>

            {/* Speed Streak Lines Overlay */}
            <div className="absolute inset-0 pointer-events-none z-20 flex justify-between px-1 opacity-70">
              <div className="w-0.5 h-full bg-gradient-to-b from-transparent via-amber-400/80 to-transparent animate-speed-line" />
              <div
                className="w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400/80 to-transparent animate-speed-line"
                style={{ animationDelay: '0.06s' }}
              />
            </div>
          </div>
        ) : (
          /* Stopped / Landed Reel State */
          <div
            className={`w-full flex flex-col gap-1.5 sm:gap-2 ${
              justLanded ? 'animate-reel-land' : ''
            }`}
          >
            {displaySymbols.map((sym, rowIdx) => {
              const isWinning = winningPositions.includes(rowIdx);
              const isDimmed = hasWinningLines && !isWinning;

              return (
                <div key={`reel-${reelIndex}-row-${rowIdx}`} className="w-full">
                  <ReelSymbol symbolId={sym} isWinning={isWinning} isDimmed={isDimmed} />
                </div>
              );
            })}
          </div>
        )}

        {/* Top & Bottom Glass Shadow Vignettes */}
        <div className="absolute inset-x-0 top-0 h-8 sm:h-10 bg-gradient-to-b from-slate-950 via-slate-950/60 to-transparent pointer-events-none z-30" />
        <div className="absolute inset-x-0 bottom-0 h-8 sm:h-10 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none z-30" />
      </div>
    </div>
  );
};

