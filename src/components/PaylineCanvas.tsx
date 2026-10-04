import React from 'react';
import { WinningLineResult } from '../types';

interface PaylineCanvasProps {
  winningLines: WinningLineResult[];
  numReels: number;
  numRows?: number;
}

export const PaylineCanvas: React.FC<PaylineCanvasProps> = ({ winningLines, numReels, numRows = 3 }) => {
  if (winningLines.length === 0) return null;

  const actualNumRows = Math.max(
    numRows,
    ...winningLines.flatMap((l) => l.positions.map((p) => p.row + 1))
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <svg className="w-full h-full">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {winningLines.map((line, idx) => {
          const points = line.positions.map((pos) => {
            const x = ((pos.reel + 0.5) / numReels) * 100;
            const y = ((pos.row + 0.5) / actualNumRows) * 100;
            return `${x}%,${y}%`;
          });

          const pathData = `M ${points.join(' L ')}`;

          return (
            <g key={`${line.lineId}-${idx}`}>
              {/* Outer Glow Laser */}
              <path
                d={pathData}
                fill="none"
                stroke="#eab308"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.75"
                filter="url(#glow)"
                className="animate-pulse"
              />
              {/* Inner Bright Core */}
              <path
                d={pathData}
                fill="none"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
