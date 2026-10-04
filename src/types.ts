export type SymbolId =
  | 'CHERRY'
  | 'LEMON'
  | 'ORANGE'
  | 'PLUM'
  | 'BELL'
  | 'BAR'
  | 'SEVEN'
  | 'DIAMOND'
  | 'WILD'
  | 'BONUS'
  | 'SPICE_JAR'
  | 'ZONKE_BOX';

export interface SymbolConfig {
  id: SymbolId;
  name: string;
  weight: number;
  payouts: Record<number, number>; // count -> multiplier (e.g. 3: 5, 4: 15, 5: 50)
  color: string;
  bgGradient: string;
  icon: string; // Emoji / Icon name
  imageUrl?: string;
  isWild?: boolean;
  isScatter?: boolean;
}

export interface Payline {
  id: number;
  name: string;
  color: string;
  // Matrix offsets for each reel: index is reel index (0..4), value is row index (0..2)
  rows: number[]; 
}

export interface WinningLineResult {
  lineId: number;
  name: string;
  symbol: SymbolId;
  count: number;
  multiplier: number;
  payout: number;
  positions: { reel: number; row: number }[];
}

export interface SpinRequest {
  userId: string;
  betPerLine: number;
  activeLines: number;
  matrixMode: '3x3' | '5x3' | '5x4';
}

export interface SpinResponse {
  spinId: string;
  userId: string;
  reels: SymbolId[][]; // Array of reels, each reel has 3 rows: reels[reelIndex][rowIndex]
  win: boolean;
  totalBet: number;
  payout: number;
  creditsBefore: number;
  creditsAfter: number;
  winningLines: WinningLineResult[];
  scatterCount: number;
  isBonus: boolean;
  bonusSpinsWon: number;
  bonusSpinsRemaining: number;
  currentMultiplier: number;
  jackpotWon: boolean;
  jackpotPayout: number;
  zonkeBonusTriggered?: boolean;
  zonkeBoxesCount?: number;
  canGamble?: boolean;
  timestamp: string;
}

export interface ZonkePickRequest {
  userId: string;
  boxIndex: number;
  totalBet: number;
}

export interface ZonkePickResponse {
  boxIndex: number;
  prizeType: 'CREDITS' | 'MULTIPLIER' | 'FREE_SPINS' | 'JACKPOT_KEY';
  prizeAmount: number;
  creditsAwarded: number;
  freeSpinsAwarded: number;
  newCredits: number;
  newBonusSpins: number;
  allBoxes: { index: number; label: string; prize: string }[];
}

export interface GambleRequest {
  userId: string;
  currentWin: number;
  guess: 'RED' | 'BLACK';
}

export interface GambleResponse {
  success: boolean;
  guess: 'RED' | 'BLACK';
  cardSuit: 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';
  cardColor: 'RED' | 'BLACK';
  cardRank: string;
  previousWin: number;
  newWin: number;
  creditsAfter: number;
}

export interface User {
  id: string;
  username: string;
  credits: number;
  bonusSpins: number;
  level: number;
  xp: number;
  totalSpins: number;
  totalWagered: number;
  totalWon: number;
  lastLogin: string;
}

export interface SpinHistoryItem {
  id: string;
  userId: string;
  totalBet: number;
  payout: number;
  reels: SymbolId[][];
  winningLinesCount: number;
  isBonus: boolean;
  timestamp: string;
}

export interface Stats {
  totalSpins: number;
  totalWagered: number;
  totalPayout: number;
  rtp: number;
  winCount: number;
  winRate: number;
  biggestWin: number;
  jackpotPool: number;
}

export type AppView =
  | 'landing'
  | 'lobby'
  | 'slot'
  | 'bonus'
  | 'jackpot'
  | 'stats'
  | 'settings';

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
  particleDensity: 'off' | 'low' | 'high';
  theme: 'kingdom-zonke' | 'novomatic-classic' | 'jackpot-city-neon' | 'vegas-gold' | 'neon-cyber';
  turboMode: boolean;
  autoSpinCount: number;
  performanceMode: boolean;
  currencySymbol: '$' | 'R';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  reward: number;
}
