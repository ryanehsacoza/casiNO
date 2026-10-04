import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDatabase, getUser, updateUserStats, recordSpin, getSpinsHistory, getStats, resetUserBalance, claimJackpot } from './server/db';
import { generateReelsMatrix, evaluateSpin, PAYLINES_3X3, PAYLINES_5X3, SYMBOLS } from './server/gameEngine';
import { generateSlotCommentary, generateLuckForecast } from './server/aiEngine';
import {
  buildMerkleTree,
  generateMerkleProof,
  calculateIpfsCid,
  verifyIpfsCidAcrossGateways,
  getCrdsClusterState,
  getSinkLedgerNodesState,
  verifyUnchainedSettlement,
} from './server/sovereignAudit';
import { SpinRequest, SpinResponse } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize SQLite database
  await initDatabase();

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Get user profile
  app.get('/api/user', (req, res) => {
    const userId = (req.query.userId as string) || 'player-1';
    const user = getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });

  // Execute Spin (Server-Authoritative Game Engine)
  app.post('/api/spin', (req, res) => {
    try {
      const { userId = 'player-1', betPerLine = 1, activeLines = 5, matrixMode = '5x3' }: SpinRequest = req.body;

      if (!betPerLine || betPerLine <= 0) {
        return res.status(400).json({ error: 'Invalid bet amount' });
      }

      const maxLines = matrixMode === '3x3' ? 5 : matrixMode === '5x4' ? 25 : 20;
      const numLines = Math.max(1, Math.min(activeLines, maxLines));
      const totalBet = betPerLine * numLines;

      const user = getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isBonusSpin = user.bonusSpins > 0;
      const actualCost = isBonusSpin ? 0 : totalBet;

      if (!isBonusSpin && user.credits < totalBet) {
        return res.status(400).json({ error: 'Insufficient credits for bet' });
      }

      const numReels = matrixMode === '3x3' ? 3 : 5;
      const rowsPerReel = matrixMode === '5x4' ? 4 : 3;
      const reels = generateReelsMatrix(numReels, rowsPerReel);

      const multiplier = isBonusSpin ? 2 : 1;
      const evalResult = evaluateSpin(reels, betPerLine, numLines, matrixMode, isBonusSpin, multiplier);

      let finalPayout = evalResult.totalPayout;
      let jackpotWon = evalResult.jackpotWon;
      let jackpotPayout = 0;

      if (jackpotWon) {
        jackpotPayout = claimJackpot(userId);
        finalPayout += jackpotPayout;
      }

      // Update bonus spins count
      let bonusSpinsRemaining = isBonusSpin ? user.bonusSpins - 1 : user.bonusSpins;
      if (evalResult.bonusSpinsWon > 0) {
        bonusSpinsRemaining += evalResult.bonusSpinsWon;
      }

      const creditsBefore = user.credits;
      const creditsAfter = creditsBefore - actualCost + finalPayout;

      // Update user state in database
      updateUserStats(
        userId,
        creditsAfter,
        bonusSpinsRemaining,
        actualCost,
        finalPayout
      );

      const spinId = `spin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // Audit log in SQLite
      recordSpin({
        id: spinId,
        userId,
        bet: betPerLine,
        lines: numLines,
        totalBet: actualCost,
        payout: finalPayout,
        creditsBefore,
        creditsAfter,
        reels,
        winningLines: evalResult.winningLines,
        isBonus: isBonusSpin,
        multiplier,
      });

      const response: SpinResponse = {
        spinId,
        userId,
        reels,
        win: finalPayout > 0,
        totalBet: actualCost,
        payout: finalPayout,
        creditsBefore,
        creditsAfter,
        winningLines: evalResult.winningLines,
        scatterCount: evalResult.scatterCount,
        isBonus: isBonusSpin,
        bonusSpinsWon: evalResult.bonusSpinsWon,
        bonusSpinsRemaining,
        currentMultiplier: multiplier,
        jackpotWon,
        jackpotPayout,
        zonkeBonusTriggered: evalResult.zonkeBonusTriggered,
        zonkeBoxesCount: evalResult.zonkeBoxesCount,
        canGamble: finalPayout > 0,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (err: any) {
      console.error('Error executing spin:', err);
      res.status(500).json({ error: err.message || 'Spin processing error' });
    }
  });

  // --- ZONKE MYSTERY BOX PICK ENDPOINT (Kingdom Slots / PlayLive.co.za Feature) ---
  app.post('/api/zonke/pick', (req, res) => {
    try {
      const { userId = 'player-1', boxIndex = 0, totalBet = 10 } = req.body;
      const user = getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate mystery contents for 5 boxes
      const boxPrizes = [
        { type: 'CREDITS', amount: Math.round(totalBet * (15 + Math.random() * 35)) },
        { type: 'MULTIPLIER', amount: Math.round(5 + Math.random() * 20) },
        { type: 'FREE_SPINS', amount: Math.round(5 + Math.random() * 10) },
        { type: 'CREDITS', amount: Math.round(totalBet * (50 + Math.random() * 100)) },
        { type: 'JACKPOT_KEY', amount: Math.round(totalBet * 250) },
      ];

      // Shuffle box contents deterministically for other boxes
      const chosenPrize = boxPrizes[boxIndex % boxPrizes.length];
      let creditsAwarded = 0;
      let freeSpinsAwarded = 0;

      if (chosenPrize.type === 'CREDITS' || chosenPrize.type === 'JACKPOT_KEY') {
        creditsAwarded = chosenPrize.amount;
      } else if (chosenPrize.type === 'MULTIPLIER') {
        creditsAwarded = Math.round(totalBet * chosenPrize.amount);
      } else if (chosenPrize.type === 'FREE_SPINS') {
        freeSpinsAwarded = chosenPrize.amount;
        creditsAwarded = Math.round(totalBet * 5); // bonus coin bonus
      }

      const newCredits = user.credits + creditsAwarded;
      const newBonusSpins = user.bonusSpins + freeSpinsAwarded;

      updateUserStats(userId, newCredits, newBonusSpins, 0, creditsAwarded);

      const allBoxes = boxPrizes.map((p, idx) => ({
        index: idx,
        label: `Zonke Crate #${idx + 1}`,
        prize: p.type === 'FREE_SPINS' ? `${p.amount} Free Spins!` : p.type === 'MULTIPLIER' ? `${p.amount}x Multiplier!` : p.type === 'JACKPOT_KEY' ? `R ${p.amount} Zonke Gold!` : `R ${p.amount} Cash!`,
      }));

      res.json({
        boxIndex,
        prizeType: chosenPrize.type,
        prizeAmount: chosenPrize.amount,
        creditsAwarded,
        freeSpinsAwarded,
        newCredits,
        newBonusSpins,
        allBoxes,
      });
    } catch (e: any) {
      console.error('Zonke Pick error:', e);
      res.status(500).json({ error: e.message || 'Zonke pick error' });
    }
  });

  // --- NOVOMATIC / NOVO MACHINE GAMBLE ENDPOINT (Double-Up Card Game) ---
  app.post('/api/gamble', (req, res) => {
    try {
      const { userId = 'player-1', currentWin = 10, guess = 'RED' } = req.body;
      const user = getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (currentWin <= 0) {
        return res.status(400).json({ error: 'No active win amount to gamble' });
      }

      const suits = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'] as const;
      const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7'];
      const cardSuit = suits[Math.floor(Math.random() * suits.length)];
      const cardRank = ranks[Math.floor(Math.random() * ranks.length)];
      const cardColor: 'RED' | 'BLACK' = (cardSuit === 'HEARTS' || cardSuit === 'DIAMONDS') ? 'RED' : 'BLACK';

      const success = guess === cardColor;
      const newWin = success ? currentWin * 2 : 0;
      const creditChange = success ? currentWin : -currentWin; // Since currentWin was already added on spin win
      const creditsAfter = Math.max(0, user.credits + creditChange);

      updateUserStats(userId, creditsAfter, user.bonusSpins, 0, success ? currentWin : 0);

      res.json({
        success,
        guess,
        cardSuit,
        cardColor,
        cardRank,
        previousWin: currentWin,
        newWin,
        creditsAfter,
      });
    } catch (e: any) {
      console.error('Gamble error:', e);
      res.status(500).json({ error: e.message || 'Gamble error' });
    }
  });

  // Spin History
  app.get('/api/history', (req, res) => {
    const userId = (req.query.userId as string) || 'player-1';
    const history = getSpinsHistory(userId, 25);
    res.json(history);
  });

  // Overall Statistics & RTP
  app.get('/api/stats', (req, res) => {
    const userId = (req.query.userId as string) || 'player-1';
    const stats = getStats(userId);
    res.json(stats);
  });

  // --- SOVEREIGN AUDIT ENDPOINTS ---

  // 1. Merkle Tree & Root
  app.get('/api/audit/merkle', (req, res) => {
    const userId = (req.query.userId as string) || 'player-1';
    const history = getSpinsHistory(userId, 100);
    const merkleResult = buildMerkleTree(history);
    const ipfsCid = calculateIpfsCid({ merkleRoot: merkleResult.root, totalSpins: history.length, timestamp: new Date().toISOString() });
    res.json({
      merkleRoot: merkleResult.root,
      totalSpinsInTree: history.length,
      treeHeight: merkleResult.treeHeight,
      ipfsCid,
      leavesCount: merkleResult.leaves.length,
    });
  });

  // 2. Merkle Inclusion Proof for a specific spin ID
  app.get('/api/audit/merkle-proof', (req, res) => {
    const userId = (req.query.userId as string) || 'player-1';
    const spinId = req.query.spinId as string;
    if (!spinId) {
      return res.status(400).json({ error: 'Missing spinId parameter' });
    }
    const history = getSpinsHistory(userId, 100);
    const proof = generateMerkleProof(history, spinId);
    if (!proof) {
      return res.status(404).json({ error: `Spin ID ${spinId} not found in current Merkle tree` });
    }
    res.json(proof);
  });

  // 3. IPFS Gateway Live Verification
  app.get('/api/audit/ipfs', async (req, res) => {
    try {
      const cid = req.query.cid as string;
      const userId = (req.query.userId as string) || 'player-1';
      const history = getSpinsHistory(userId, 10);
      const ipfsAudit = await verifyIpfsCidAcrossGateways(cid, history);
      res.json(ipfsAudit);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'IPFS verification error' });
    }
  });

  // 4. CRDS Cluster Replicated Data Store & Gossip State
  app.get('/api/audit/crds', (req, res) => {
    const userId = (req.query.userId as string) || 'player-1';
    const history = getSpinsHistory(userId, 100);
    const merkleResult = buildMerkleTree(history);
    const crdsState = getCrdsClusterState(history.length, merkleResult.root);
    res.json(crdsState);
  });

  // 5. Sink Ledger Nodes
  app.get('/api/audit/sink-nodes', (req, res) => {
    const userId = (req.query.userId as string) || 'player-1';
    const history = getSpinsHistory(userId, 100);
    const merkleResult = buildMerkleTree(history);
    const sinkState = getSinkLedgerNodesState(history.length, merkleResult.root);
    res.json(sinkState);
  });

  // 6. Unchained Settlement Verification
  app.post('/api/audit/unchained-verify', (req, res) => {
    const userId = req.body.userId || 'player-1';
    const user = getUser(userId);
    const history = getSpinsHistory(userId, 100);
    const merkleResult = buildMerkleTree(history);

    const verificationResult = verifyUnchainedSettlement({
      userId,
      creditsBalance: user.credits,
      spinsCount: history.length,
      latestMerkleRoot: merkleResult.root,
      txHash: req.body.txHash,
    });

    res.json(verificationResult);
  });

  // Reset Balance
  app.post('/api/reset-balance', (req, res) => {
    const userId = req.body.userId || 'player-1';
    const amount = req.body.amount || 1000;
    const updatedUser = resetUserBalance(userId, amount);
    res.json(updatedUser);
  });

  // Get Paytable and Rules
  app.get('/api/paytable', (req, res) => {
    res.json({
      symbols: Object.values(SYMBOLS),
      paylines3x3: PAYLINES_3X3,
      paylines5x3: PAYLINES_5X3,
    });
  });

  // AI Slot Commentary Endpoint (Gemini 3.6 Flash)
  app.post('/api/ai/commentary', async (req, res) => {
    try {
      const commentary = await generateSlotCommentary(req.body);
      res.json({ commentary });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'AI Commentary error' });
    }
  });

  // AI Luck Oracle & Strategy Forecast Endpoint (Gemini 3.6 Flash)
  app.post('/api/ai/oracle', async (req, res) => {
    try {
      const userId = req.body.userId || 'player-1';
      const stats = getStats(userId);
      const user = getUser(userId);
      const forecast = await generateLuckForecast({
        totalSpins: stats.totalSpins,
        totalWon: stats.totalPayout,
        totalBet: stats.totalWagered,
        credits: user.credits,
        highestWin: stats.biggestWin,
      });
      res.json(forecast);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'AI Oracle error' });
    }
  });

  // Catch-all 404 for unhandled API requests to prevent Vite SPA fallback from returning index.html
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
  });

  // --- VITE MIDDLEWARE OR STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎰 Casino Slot Machine Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
