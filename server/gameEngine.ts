import { SymbolId, SymbolConfig, Payline, WinningLineResult, SpinResponse } from '../src/types';

// Symbol Configurations with weights and payout multipliers
export const SYMBOLS: Record<SymbolId, SymbolConfig> = {
  CHERRY: {
    id: 'CHERRY',
    name: 'Cherry',
    weight: 35,
    payouts: { 3: 5, 4: 12, 5: 30 },
    color: '#ef4444',
    bgGradient: 'from-red-500/20 to-red-900/40',
    icon: '🍒',
    imageUrl: '/src/assets/images/cherry_symbol_1785609143111.jpg',
  },
  LEMON: {
    id: 'LEMON',
    name: 'Lemon',
    weight: 30,
    payouts: { 3: 8, 4: 18, 5: 45 },
    color: '#eab308',
    bgGradient: 'from-yellow-400/20 to-yellow-800/40',
    icon: '🍋',
    imageUrl: '/src/assets/images/lemon_symbol_1785692241493.jpg',
  },
  ORANGE: {
    id: 'ORANGE',
    name: 'Orange',
    weight: 25,
    payouts: { 3: 10, 4: 25, 5: 60 },
    color: '#f97316',
    bgGradient: 'from-orange-500/20 to-orange-900/40',
    icon: '🍊',
    imageUrl: '/src/assets/images/orange_symbol_1785692294403.jpg',
  },
  PLUM: {
    id: 'PLUM',
    name: 'Plum',
    weight: 20,
    payouts: { 3: 15, 4: 35, 5: 90 },
    color: '#a855f7',
    bgGradient: 'from-purple-500/20 to-purple-900/40',
    icon: '🍇',
    imageUrl: '/src/assets/images/plum_symbol_1785692306334.jpg',
  },
  BELL: {
    id: 'BELL',
    name: 'Liberty Bell',
    weight: 15,
    payouts: { 3: 25, 4: 60, 5: 150 },
    color: '#eab308',
    bgGradient: 'from-amber-400/20 to-amber-800/40',
    icon: '🔔',
    imageUrl: '/src/assets/images/bell_symbol_1785692256510.jpg',
  },
  BAR: {
    id: 'BAR',
    name: 'Gold Bar',
    weight: 10,
    payouts: { 3: 50, 4: 120, 5: 350 },
    color: '#3b82f6',
    bgGradient: 'from-blue-500/20 to-blue-900/40',
    icon: '💎',
    imageUrl: '/src/assets/images/bar_symbol_1785692269696.jpg',
  },
  SEVEN: {
    id: 'SEVEN',
    name: 'Lucky 7',
    weight: 6,
    payouts: { 3: 100, 4: 300, 5: 1000 },
    color: '#ec4899',
    bgGradient: 'from-pink-500/20 to-pink-900/40',
    icon: '7️⃣',
    imageUrl: '/src/assets/images/seven_symbol_1785609170512.jpg',
  },
  DIAMOND: {
    id: 'DIAMOND',
    name: 'Royal Diamond',
    weight: 3,
    payouts: { 3: 250, 4: 750, 5: 2500 },
    color: '#06b6d4',
    bgGradient: 'from-cyan-400/20 to-cyan-900/40',
    icon: '👑',
    imageUrl: '/src/assets/images/diamond_symbol_1785609157681.jpg',
  },
  WILD: {
    id: 'WILD',
    name: 'Wild Joker',
    weight: 4,
    payouts: { 3: 150, 4: 500, 5: 2000 },
    color: '#10b981',
    bgGradient: 'from-emerald-400/20 to-emerald-900/40',
    icon: '🃏',
    imageUrl: '/src/assets/images/wild_symbol_1785692280528.jpg',
    isWild: true,
  },
  BONUS: {
    id: 'BONUS',
    name: 'Free Spins Scatter',
    weight: 5,
    payouts: { 3: 5, 4: 20, 5: 50 }, // Multiplies total bet
    color: '#8b5cf6',
    bgGradient: 'from-indigo-500/20 to-indigo-900/40',
    icon: '⭐',
    imageUrl: '/src/assets/images/bonus_symbol_1785692318668.jpg',
    isScatter: true,
  },
  SPICE_JAR: {
    id: 'SPICE_JAR',
    name: 'Spinning Spice Jar',
    weight: 8,
    payouts: { 3: 300, 4: 1000, 5: 5000 },
    color: '#f59e0b',
    bgGradient: 'from-amber-400/30 to-yellow-900/60',
    icon: '🫙',
    imageUrl: '/src/assets/images/spinning_spice_jar_1785609129224.jpg',
  },
  ZONKE_BOX: {
    id: 'ZONKE_BOX',
    name: 'Zonke Mystery Box',
    weight: 6,
    payouts: { 3: 20, 4: 80, 5: 300 },
    color: '#eab308',
    bgGradient: 'from-amber-500/30 to-yellow-600/50',
    icon: '🎁',
    isScatter: true,
  },
};

// 3x3 Paylines (1 to 5)
export const PAYLINES_3X3: Payline[] = [
  { id: 1, name: 'Center Row', color: '#ef4444', rows: [1, 1, 1] },
  { id: 2, name: 'Top Row', color: '#3b82f6', rows: [0, 0, 0] },
  { id: 3, name: 'Bottom Row', color: '#10b981', rows: [2, 2, 2] },
  { id: 4, name: 'Diagonal Top-Left to Bot-Right', color: '#f59e0b', rows: [0, 1, 2] },
  { id: 5, name: 'Diagonal Bot-Left to Top-Right', color: '#ec4899', rows: [2, 1, 0] },
];

// 5x3 Paylines (1 to 20)
export const PAYLINES_5X3: Payline[] = [
  { id: 1, name: 'Center Horizontal', color: '#ef4444', rows: [1, 1, 1, 1, 1] },
  { id: 2, name: 'Top Horizontal', color: '#3b82f6', rows: [0, 0, 0, 0, 0] },
  { id: 3, name: 'Bottom Horizontal', color: '#10b981', rows: [2, 2, 2, 2, 2] },
  { id: 4, name: 'V-Shape', color: '#f59e0b', rows: [0, 1, 2, 1, 0] },
  { id: 5, name: 'Inverted V-Shape', color: '#ec4899', rows: [2, 1, 0, 1, 2] },
  { id: 6, name: 'Upper ZigZag', color: '#8b5cf6', rows: [0, 0, 1, 0, 0] },
  { id: 7, name: 'Lower ZigZag', color: '#06b6d4', rows: [2, 2, 1, 2, 2] },
  { id: 8, name: 'High Valley', color: '#84cc16', rows: [1, 0, 0, 0, 1] },
  { id: 9, name: 'Low Valley', color: '#d946ef', rows: [1, 2, 2, 2, 1] },
  { id: 10, name: 'Mid-Top-Mid', color: '#f97316', rows: [1, 0, 1, 0, 1] },
  { id: 11, name: 'Mid-Bot-Mid', color: '#14b8a6', rows: [1, 2, 1, 2, 1] },
  { id: 12, name: 'Top Step-Down', color: '#eab308', rows: [0, 1, 1, 1, 2] },
  { id: 13, name: 'Bot Step-Up', color: '#6366f1', rows: [2, 1, 1, 1, 0] },
  { id: 14, name: 'Wave Up', color: '#f43f5e', rows: [1, 0, 1, 2, 1] },
  { id: 15, name: 'Wave Down', color: '#a855f7', rows: [2, 1, 0, 1, 2] },
  { id: 16, name: 'W-Pattern', color: '#10b981', rows: [0, 2, 0, 2, 0] },
  { id: 17, name: 'M-Pattern', color: '#3b82f6', rows: [2, 0, 2, 0, 2] },
  { id: 18, name: 'Top Bump', color: '#fb923c', rows: [0, 1, 0, 1, 0] },
  { id: 19, name: 'Bot Bump', color: '#38bdf8', rows: [2, 1, 2, 1, 2] },
  { id: 20, name: 'Center Cross', color: '#f472b6', rows: [1, 1, 0, 1, 1] },
];

// 5x4 Paylines (1 to 25)
export const PAYLINES_5X4: Payline[] = [
  { id: 1, name: 'Row 2 Horizontal', color: '#ef4444', rows: [1, 1, 1, 1, 1] },
  { id: 2, name: 'Row 1 Horizontal', color: '#3b82f6', rows: [0, 0, 0, 0, 0] },
  { id: 3, name: 'Row 3 Horizontal', color: '#10b981', rows: [2, 2, 2, 2, 2] },
  { id: 4, name: 'Row 4 Horizontal', color: '#a855f7', rows: [3, 3, 3, 3, 3] },
  { id: 5, name: 'V-Shape 4-Row', color: '#f59e0b', rows: [0, 1, 3, 1, 0] },
  { id: 6, name: 'Inverted V 4-Row', color: '#ec4899', rows: [3, 2, 0, 2, 3] },
  { id: 7, name: 'Upper Wave', color: '#8b5cf6', rows: [0, 1, 2, 1, 0] },
  { id: 8, name: 'Lower Wave', color: '#06b6d4', rows: [3, 2, 1, 2, 3] },
  { id: 9, name: 'Cascade Down', color: '#84cc16', rows: [0, 1, 2, 3, 2] },
  { id: 10, name: 'Cascade Up', color: '#d946ef', rows: [3, 2, 1, 0, 1] },
  { id: 11, name: 'Valley Deep', color: '#f97316', rows: [1, 3, 3, 3, 1] },
  { id: 12, name: 'Mountain Peak', color: '#14b8a6', rows: [2, 0, 0, 0, 2] },
  { id: 13, name: 'Upper ZigZag', color: '#eab308', rows: [0, 2, 0, 2, 0] },
  { id: 14, name: 'Lower ZigZag', color: '#6366f1', rows: [3, 1, 3, 1, 3] },
  { id: 15, name: 'Mid Step-Up', color: '#f43f5e', rows: [2, 1, 1, 1, 0] },
  { id: 16, name: 'Mid Step-Down', color: '#10b981', rows: [1, 2, 2, 2, 3] },
  { id: 17, name: 'W-Pattern 4-Row', color: '#3b82f6', rows: [0, 3, 0, 3, 0] },
  { id: 18, name: 'M-Pattern 4-Row', color: '#fb923c', rows: [3, 0, 3, 0, 3] },
  { id: 19, name: 'Center Diamond', color: '#38bdf8', rows: [2, 1, 0, 1, 2] },
  { id: 20, name: 'Inverted Diamond', color: '#f472b6', rows: [1, 2, 3, 2, 1] },
  { id: 21, name: 'Top Arch', color: '#e11d48', rows: [1, 0, 0, 0, 1] },
  { id: 22, name: 'Bottom Arch', color: '#22c55e', rows: [2, 3, 3, 3, 2] },
  { id: 23, name: 'Cross Cut High', color: '#0284c7', rows: [0, 1, 1, 1, 0] },
  { id: 24, name: 'Cross Cut Low', color: '#9333ea', rows: [3, 2, 2, 2, 3] },
  { id: 25, name: 'Full Grid Traverse', color: '#eab308', rows: [1, 2, 1, 2, 1] },
];

// Simple LCG PRNG for seed-based deterministic tests
export class SeededRNG {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  nextFloat(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Generate single symbol based on weights
export function getRandomSymbol(rng?: SeededRNG): SymbolId {
  const symbolList = Object.values(SYMBOLS);
  const totalWeight = symbolList.reduce((acc, s) => acc + s.weight, 0);

  const randVal = (rng ? rng.nextFloat() : Math.random()) * totalWeight;
  let accumulated = 0;

  for (const s of symbolList) {
    accumulated += s.weight;
    if (randVal <= accumulated) {
      return s.id;
    }
  }

  return 'CHERRY';
}

// Generate full matrix of reels: reels[reelIndex][rowIndex]
export function generateReelsMatrix(
  numReels: number = 5,
  rowsPerReel: number = 3,
  rng?: SeededRNG
): SymbolId[][] {
  const reels: SymbolId[][] = [];
  for (let r = 0; r < numReels; r++) {
    const reel: SymbolId[] = [];
    for (let row = 0; row < rowsPerReel; row++) {
      reel.push(getRandomSymbol(rng));
    }
    reels.push(reel);
  }
  return reels;
}

// Evaluate paylines and payouts for a given grid
export function evaluateSpin(
  reels: SymbolId[][],
  betPerLine: number,
  activeLinesCount: number,
  matrixMode: '3x3' | '5x3' | '5x4',
  isFreeSpins: boolean = false,
  freeSpinMultiplier: number = 1
) {
  const numReels = reels.length;
  const paylinesConfig = matrixMode === '3x3' ? PAYLINES_3X3 : matrixMode === '5x4' ? PAYLINES_5X4 : PAYLINES_5X3;
  const activePaylines = paylinesConfig.slice(0, Math.min(activeLinesCount, paylinesConfig.length));

  const winningLines: WinningLineResult[] = [];
  let linePayoutTotal = 0;

  // 1. Evaluate each active payline left-to-right
  for (const line of activePaylines) {
    let baseSymbol: SymbolId | null = null;
    let matchCount = 0;
    const positions: { reel: number; row: number }[] = [];

    for (let reelIdx = 0; reelIdx < numReels; reelIdx++) {
      const rowIdx = line.rows[reelIdx];
      const symbol = reels[reelIdx][rowIdx];

      if (symbol === 'BONUS') {
        // SCATTER symbols do not match on paylines
        break;
      }

      if (baseSymbol === null) {
        baseSymbol = symbol;
        matchCount = 1;
        positions.push({ reel: reelIdx, row: rowIdx });
      } else if (symbol === baseSymbol || symbol === 'WILD' || baseSymbol === 'WILD') {
        if (baseSymbol === 'WILD' && symbol !== 'WILD') {
          baseSymbol = symbol; // WILD locks onto first real symbol
        }
        matchCount++;
        positions.push({ reel: reelIdx, row: rowIdx });
      } else {
        break;
      }
    }

    // Minimum match count to win is 3
    if (baseSymbol && matchCount >= 3) {
      const config = SYMBOLS[baseSymbol];
      const multiplier = config.payouts[matchCount] || 0;
      if (multiplier > 0) {
        const linePayout = betPerLine * multiplier * (isFreeSpins ? freeSpinMultiplier : 1);
        winningLines.push({
          lineId: line.id,
          name: line.name,
          symbol: baseSymbol,
          count: matchCount,
          multiplier,
          payout: linePayout,
          positions,
        });
        linePayoutTotal += linePayout;
      }
    }
  }

  // 2. Evaluate SCATTER / BONUS and ZONKE_BOX symbols anywhere on grid
  let scatterCount = 0;
  let zonkeBoxesCount = 0;

  for (let r = 0; r < numReels; r++) {
    for (let row = 0; row < reels[r].length; row++) {
      if (reels[r][row] === 'BONUS') {
        scatterCount++;
      } else if (reels[r][row] === 'ZONKE_BOX') {
        zonkeBoxesCount++;
      }
    }
  }

  let scatterPayout = 0;
  let bonusSpinsWon = 0;

  if (scatterCount >= 3) {
    const totalBet = betPerLine * activePaylines.length;
    const scatterMultiplier = SYMBOLS['BONUS'].payouts[Math.min(scatterCount, 5)] || 5;
    scatterPayout = totalBet * scatterMultiplier;
    bonusSpinsWon = scatterCount === 3 ? 10 : scatterCount === 4 ? 15 : 25;
  }

  // Evaluate Zonke Mystery Box Trigger (2+ Zonke Boxes on grid)
  let zonkeBonusTriggered = zonkeBoxesCount >= 2;

  // 3. Evaluate Progressive Jackpot (e.g. 5 DIAMONDs or 5 SEVENs on Line 1)
  let jackpotWon = false;
  if (numReels === 5 && winningLines.length > 0) {
    const line1Win = winningLines.find((w) => w.lineId === 1 && w.count === 5 && (w.symbol === 'DIAMOND' || w.symbol === 'SEVEN'));
    if (line1Win) {
      jackpotWon = true;
    }
  }

  const totalPayout = linePayoutTotal + scatterPayout;

  return {
    winningLines,
    linePayoutTotal,
    scatterCount,
    scatterPayout,
    bonusSpinsWon,
    zonkeBonusTriggered,
    zonkeBoxesCount,
    totalPayout,
    jackpotWon,
  };
}
