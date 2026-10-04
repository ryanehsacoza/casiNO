import { describe, it, expect } from 'vitest';
import {
  getRandomSymbol,
  generateReelsMatrix,
  evaluateSpin,
  SeededRNG,
  SYMBOLS,
  PAYLINES_3X3,
  PAYLINES_5X3,
} from '../server/gameEngine';
import { SymbolId } from '../src/types';

describe('Game Engine - Reel Generation & Determinism', () => {
  it('generates valid symbol IDs based on symbol table', () => {
    const symbol = getRandomSymbol();
    expect(SYMBOLS[symbol]).toBeDefined();
  });

  it('generates deterministic reel matrices with fixed SeededRNG', () => {
    const rng1 = new SeededRNG(42);
    const matrix1 = generateReelsMatrix(5, 3, rng1);

    const rng2 = new SeededRNG(42);
    const matrix2 = generateReelsMatrix(5, 3, rng2);

    expect(matrix1).toEqual(matrix2);
  });
});

describe('Game Engine - Spin Evaluation & Paylines', () => {
  it('evaluates a winning line of 3 Cherries on Center Row (Line 1)', () => {
    // 3x3 Grid with CHERRY on middle row (index 1)
    const reels: SymbolId[][] = [
      ['LEMON', 'CHERRY', 'ORANGE'],
      ['BELL', 'CHERRY', 'PLUM'],
      ['BAR', 'CHERRY', 'SEVEN'],
    ];

    const betPerLine = 10;
    const activeLines = 1; // Center row
    const result = evaluateSpin(reels, betPerLine, activeLines, '3x3');

    expect(result.winningLines.length).toBe(1);
    expect(result.winningLines[0].symbol).toBe('CHERRY');
    expect(result.winningLines[0].count).toBe(3);
    // CHERRY multiplier for 3 is 5 -> 10 * 5 = 50
    expect(result.totalPayout).toBe(50);
  });

  it('evaluates Wild symbol substitution correctly', () => {
    // Center line: SEVEN, WILD, SEVEN
    const reels: SymbolId[][] = [
      ['LEMON', 'SEVEN', 'ORANGE'],
      ['BELL', 'WILD', 'PLUM'],
      ['BAR', 'SEVEN', 'CHERRY'],
    ];

    const betPerLine = 5;
    const activeLines = 1;
    const result = evaluateSpin(reels, betPerLine, activeLines, '3x3');

    expect(result.winningLines.length).toBe(1);
    expect(result.winningLines[0].symbol).toBe('SEVEN');
    expect(result.winningLines[0].count).toBe(3);
    // SEVEN multiplier for 3 is 100 -> 5 * 100 = 500
    expect(result.totalPayout).toBe(500);
  });

  it('triggers Free Spins Bonus when 3 SCATTER (BONUS) symbols appear', () => {
    const reels: SymbolId[][] = [
      ['BONUS', 'LEMON', 'ORANGE'],
      ['BELL', 'BONUS', 'PLUM'],
      ['BAR', 'SEVEN', 'BONUS'],
    ];

    const betPerLine = 10;
    const activeLines = 5; // Total bet = 50
    const result = evaluateSpin(reels, betPerLine, activeLines, '3x3');

    expect(result.scatterCount).toBe(3);
    expect(result.bonusSpinsWon).toBe(10);
    // Scatter payout: 50 * 5 = 250
    expect(result.scatterPayout).toBe(250);
  });
});
