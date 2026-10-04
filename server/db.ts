import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { User, SpinHistoryItem, Stats, SymbolId, WinningLineResult } from '../src/types';

let db: Database;
const DB_FILE = path.join(process.cwd(), 'slot_machine.sqlite');

export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs();
  
  let dbCreated = false;

  const createSchemaAndSeed = () => {
    // Schema creation
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        credits REAL NOT NULL,
        bonus_spins INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 1,
        xp INTEGER NOT NULL DEFAULT 0,
        total_spins INTEGER NOT NULL DEFAULT 0,
        total_wagered REAL NOT NULL DEFAULT 0,
        total_won REAL NOT NULL DEFAULT 0,
        last_login TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS spins (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        bet REAL NOT NULL,
        lines INTEGER NOT NULL,
        total_bet REAL NOT NULL,
        payout REAL NOT NULL,
        credits_before REAL NOT NULL,
        credits_after REAL NOT NULL,
        reels_json TEXT NOT NULL,
        winning_lines_json TEXT NOT NULL,
        is_bonus INTEGER NOT NULL,
        multiplier REAL NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS jackpot (
        id INTEGER PRIMARY KEY,
        amount REAL NOT NULL,
        last_won_by TEXT,
        last_won_at TEXT
      );
    `);

    // Seed default user if not existing
    const userCheck = db.exec("SELECT id FROM users WHERE id = 'player-1'");
    if (userCheck.length === 0 || userCheck[0].values.length === 0) {
      db.run(
        `INSERT INTO users (id, username, credits, bonus_spins, level, xp, total_spins, total_wagered, total_won, last_login)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['player-1', 'Vegas Player 1', 1000.0, 0, 1, 0, 0, 0.0, 0.0, new Date().toISOString()]
      );
    }

    // Seed default jackpot if missing
    const jackpotCheck = db.exec('SELECT id FROM jackpot WHERE id = 1');
    if (jackpotCheck.length === 0 || jackpotCheck[0].values.length === 0) {
      db.run('INSERT INTO jackpot (id, amount) VALUES (1, 10000.00)');
    }
  };

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      db = new SQL.Database(fileBuffer);
      createSchemaAndSeed();
      dbCreated = true;
    } catch (err) {
      console.warn('Failed to load existing database file, creating fresh DB:', err);
    }
  }

  if (!dbCreated) {
    db = new SQL.Database();
    createSchemaAndSeed();
  }

  saveDatabase();
}

export function saveDatabase(): void {
  if (db) {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_FILE, buffer);
    } catch (err) {
      console.error('Error writing database to disk:', err);
    }
  }
}

export function getUser(userId: string = 'player-1'): User | null {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  stmt.bind([userId]);
  if (stmt.step()) {
    const row = stmt.getAsObject() as any;
    stmt.free();
    return {
      id: row.id,
      username: row.username,
      credits: Number(row.credits),
      bonusSpins: Number(row.bonus_spins),
      level: Number(row.level),
      xp: Number(row.xp),
      totalSpins: Number(row.total_spins),
      totalWagered: Number(row.total_wagered),
      totalWon: Number(row.total_won),
      lastLogin: row.last_login,
    };
  }
  stmt.free();
  return null;
}

export function updateUserStats(
  userId: string,
  newCredits: number,
  bonusSpinsRemaining: number,
  wageredDelta: number,
  payoutDelta: number
): void {
  const user = getUser(userId);
  if (!user) return;

  const newTotalSpins = user.totalSpins + 1;
  const newTotalWagered = user.totalWagered + wageredDelta;
  const newTotalWon = user.totalWon + payoutDelta;
  const newXp = user.xp + Math.floor(wageredDelta);
  const newLevel = 1 + Math.floor(newXp / 500);

  db.run(
    `UPDATE users SET 
      credits = ?, 
      bonus_spins = ?, 
      total_spins = ?, 
      total_wagered = ?, 
      total_won = ?, 
      xp = ?, 
      level = ?, 
      last_login = ? 
     WHERE id = ?`,
    [
      newCredits,
      bonusSpinsRemaining,
      newTotalSpins,
      newTotalWagered,
      newTotalWon,
      newXp,
      newLevel,
      new Date().toISOString(),
      userId,
    ]
  );

  // Increment Jackpot pool by 1% of non-bonus wagers
  if (wageredDelta > 0) {
    db.run('UPDATE jackpot SET amount = amount + ? WHERE id = 1', [wageredDelta * 0.01]);
  }

  saveDatabase();
}

export function recordSpin(spinData: {
  id: string;
  userId: string;
  bet: number;
  lines: number;
  totalBet: number;
  payout: number;
  creditsBefore: number;
  creditsAfter: number;
  reels: SymbolId[][];
  winningLines: WinningLineResult[];
  isBonus: boolean;
  multiplier: number;
}): void {
  db.run(
    `INSERT INTO spins (id, user_id, bet, lines, total_bet, payout, credits_before, credits_after, reels_json, winning_lines_json, is_bonus, multiplier, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      spinData.id,
      spinData.userId,
      spinData.bet,
      spinData.lines,
      spinData.totalBet,
      spinData.payout,
      spinData.creditsBefore,
      spinData.creditsAfter,
      JSON.stringify(spinData.reels),
      JSON.stringify(spinData.winningLines),
      spinData.isBonus ? 1 : 0,
      spinData.multiplier,
      new Date().toISOString(),
    ]
  );

  saveDatabase();
}

export function getSpinsHistory(userId: string = 'player-1', limit: number = 20): SpinHistoryItem[] {
  const stmt = db.prepare('SELECT * FROM spins WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?');
  stmt.bind([userId, limit]);

  const items: SpinHistoryItem[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject() as any;
    let reels: SymbolId[][] = [];
    let winningLinesCount = 0;
    try {
      reels = JSON.parse(row.reels_json);
      const winningLines = JSON.parse(row.winning_lines_json);
      winningLinesCount = winningLines ? winningLines.length : 0;
    } catch (e) {
      // fallback
    }

    items.push({
      id: row.id,
      userId: row.user_id,
      totalBet: Number(row.total_bet),
      payout: Number(row.payout),
      reels,
      winningLinesCount,
      isBonus: Boolean(row.is_bonus),
      timestamp: row.timestamp,
    });
  }
  stmt.free();
  return items;
}

export function getStats(userId: string = 'player-1'): Stats {
  const user = getUser(userId);

  const jackpotRes = db.exec('SELECT amount FROM jackpot WHERE id = 1');
  const jackpotPool =
    jackpotRes.length > 0 && jackpotRes[0].values.length > 0
      ? Number(jackpotRes[0].values[0][0])
      : 10000.0;

  if (!user) {
    return {
      totalSpins: 0,
      totalWagered: 0,
      totalPayout: 0,
      rtp: 96.5,
      winCount: 0,
      winRate: 0,
      biggestWin: 0,
      jackpotPool,
    };
  }

  // Calculate stats directly from audited spins table
  const spinStatsStmt = db.prepare(
    `SELECT 
      COUNT(*) as total_spins,
      COALESCE(SUM(total_bet), 0) as total_wagered,
      COALESCE(SUM(payout), 0) as total_payout,
      COALESCE(MAX(payout), 0) as biggest_win,
      SUM(CASE WHEN payout > 0 THEN 1 ELSE 0 END) as win_count
     FROM spins WHERE user_id = ?`
  );
  spinStatsStmt.bind([userId]);

  let totalSpins = 0;
  let totalWagered = 0;
  let totalPayout = 0;
  let biggestWin = 0;
  let winCount = 0;

  if (spinStatsStmt.step()) {
    const row = spinStatsStmt.getAsObject() as any;
    totalSpins = Number(row.total_spins || 0);
    totalWagered = Number(row.total_wagered || 0);
    totalPayout = Number(row.total_payout || 0);
    biggestWin = Number(row.biggest_win || 0);
    winCount = Number(row.win_count || 0);
  }
  spinStatsStmt.free();

  const rtp = totalWagered > 0 ? (totalPayout / totalWagered) * 100 : 96.5;
  const winRate = totalSpins > 0 ? (winCount / totalSpins) * 100 : 0;

  return {
    totalSpins,
    totalWagered: Number(totalWagered.toFixed(2)),
    totalPayout: Number(totalPayout.toFixed(2)),
    rtp: Number(rtp.toFixed(2)),
    winCount,
    winRate: Number(winRate.toFixed(2)),
    biggestWin: Number(biggestWin.toFixed(2)),
    jackpotPool: Number(jackpotPool.toFixed(2)),
  };
}

export function resetUserBalance(userId: string = 'player-1', credits: number = 1000): User {
  db.run(
    'UPDATE users SET credits = ?, bonus_spins = 0, total_spins = 0, total_wagered = 0, total_won = 0, xp = 0, level = 1 WHERE id = ?',
    [credits, userId]
  );
  db.run('DELETE FROM spins WHERE user_id = ?', [userId]);
  saveDatabase();
  return getUser(userId)!;
}

export function claimJackpot(userId: string = 'player-1'): number {
  const jackpotRes = db.exec('SELECT amount FROM jackpot WHERE id = 1');
  const jackpotAmount =
    jackpotRes.length > 0 && jackpotRes[0].values.length > 0
      ? Number(jackpotRes[0].values[0][0])
      : 10000.0;

  // Add jackpot to user
  const user = getUser(userId);
  if (user) {
    db.run('UPDATE users SET credits = credits + ? WHERE id = ?', [jackpotAmount, userId]);
    db.run(
      'UPDATE jackpot SET amount = 10000.00, last_won_by = ?, last_won_at = ? WHERE id = 1',
      [userId, new Date().toISOString()]
    );
    saveDatabase();
  }

  return jackpotAmount;
}
