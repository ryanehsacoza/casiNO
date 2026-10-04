import React, { useState, useEffect, useRef } from 'react';
import { User, Stats, SpinResponse, SymbolId, SpinHistoryItem, AppView, GameSettings } from './types';
import { Header } from './components/Header';
import { Reel } from './components/Reel';
import { PaylineCanvas } from './components/PaylineCanvas';
import { BetControls } from './components/BetControls';
import { WinBanner } from './components/WinBanner';
import { PaytableModal } from './components/PaytableModal';
import { HistoryModal } from './components/HistoryModal';
import { StatsModal } from './components/StatsModal';
import { Navbar } from './components/Navbar';
import { ParticleCanvas } from './components/ParticleCanvas';
import { LandingView } from './components/views/LandingView';
import { LobbyView } from './components/views/LobbyView';
import { BonusWorldView } from './components/views/BonusWorldView';
import { JackpotCelebrationView } from './components/views/JackpotCelebrationView';
import { StatsView } from './components/views/StatsView';
import { SettingsView } from './components/views/SettingsView';
import { DailyLoginModal } from './components/DailyLoginModal';
import { PerformanceDiagnosticsModal } from './components/PerformanceDiagnosticsModal';
import { ZonkeBoxModal } from './components/ZonkeBoxModal';
import { GambleModal } from './components/GambleModal';
import { AiOraclePanel } from './components/AiOraclePanel';
import { WalletModal } from './components/WalletModal';
import { usePerformanceDiagnostics } from './hooks/usePerformanceDiagnostics';
import { useWallet } from './hooks/useWallet';
import { soundFx } from './utils/audio';

// Default initial reels grid
const DEFAULT_REELS_3X3: SymbolId[][] = [
  ['CHERRY', 'SEVEN', 'BAR'],
  ['LEMON', 'SEVEN', 'BELL'],
  ['ORANGE', 'SEVEN', 'PLUM'],
];

const DEFAULT_REELS_5X3: SymbolId[][] = [
  ['CHERRY', 'SEVEN', 'BAR'],
  ['LEMON', 'SEVEN', 'BELL'],
  ['ORANGE', 'SEVEN', 'PLUM'],
  ['PLUM', 'WILD', 'CHERRY'],
  ['BELL', 'BONUS', 'DIAMOND'],
];

const DEFAULT_REELS_5X4: SymbolId[][] = [
  ['CHERRY', 'SEVEN', 'BAR', 'SPICE_JAR'],
  ['LEMON', 'SEVEN', 'BELL', 'WILD'],
  ['ORANGE', 'SEVEN', 'PLUM', 'BONUS'],
  ['PLUM', 'WILD', 'CHERRY', 'DIAMOND'],
  ['BELL', 'BONUS', 'DIAMOND', 'SEVEN'],
];

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('slot');
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [spinHistory, setSpinHistory] = useState<SpinHistoryItem[]>([]);

  const [matrixMode, setMatrixMode] = useState<'3x3' | '5x3' | '5x4'>('5x3');
  const [betPerLine, setBetPerLine] = useState<number>(2);
  const [activeLines, setActiveLines] = useState<number>(20);

  const [reels, setReels] = useState<SymbolId[][]>(DEFAULT_REELS_5X3);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isQuickStop, setIsQuickStop] = useState<boolean>(false);
  const [lastSpin, setLastSpin] = useState<SpinResponse | null>(null);

  const [autoSpinsRemaining, setAutoSpinsRemaining] = useState<number>(0);
  
  // Game Settings State
  const [settings, setSettings] = useState<GameSettings>({
    musicVolume: 0.8,
    sfxVolume: 0.8,
    isMuted: false,
    particleDensity: 'high',
    theme: 'kingdom-zonke',
    turboMode: false,
    autoSpinCount: 0,
    performanceMode: false,
    currencySymbol: 'R',
  });

  // Web3 Wallet Hook
  const wallet = useWallet();

  // Modals
  const [isPaytableOpen, setIsPaytableOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isDailyLoginOpen, setIsDailyLoginOpen] = useState<boolean>(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [isZonkeModalOpen, setIsZonkeModalOpen] = useState<boolean>(false);
  const [isGambleModalOpen, setIsGambleModalOpen] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);

  // Performance diagnostics calculation
  const perfMetrics = usePerformanceDiagnostics();

  // Global Keyboard Shortcuts (Space/Enter = Spin or Stop, M = Mute, B = Max Bet, A = Auto Spin)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (currentView === 'slot') {
          if (!isSpinning) {
            handleSpin();
          } else {
            setIsQuickStop(true);
            soundFx.playClick();
          }
        }
      } else if (e.code === 'KeyM') {
        soundFx.isMuted = !settings.isMuted;
        setSettings((prev) => ({ ...prev, isMuted: !prev.isMuted }));
      } else if (e.code === 'KeyB') {
        if (currentView === 'slot') {
          handleMaxBet();
        }
      } else if (e.code === 'KeyA') {
        if (currentView === 'slot') {
          const nextCount = autoSpinsRemaining > 0 ? 0 : 10;
          setAutoSpinsRemaining(nextCount);
          if (nextCount > 0 && !isSpinning) {
            handleSpin();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, isSpinning, settings.isMuted, autoSpinsRemaining, betPerLine, activeLines, matrixMode]);

  // Reel stop tracking
  const stoppedReelsCount = useRef<number>(0);

  // Fetch initial data
  const fetchData = async (retries = 3) => {
    try {
      const [userRes, statsRes, historyRes] = await Promise.all([
        fetch('/api/user?userId=player-1'),
        fetch('/api/stats?userId=player-1'),
        fetch('/api/history?userId=player-1'),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      } else {
        setUser((prev) => prev || {
          id: 'player-1',
          username: 'Vegas Player 1',
          credits: 1000,
          bonusSpins: 0,
          level: 1,
          xp: 0,
          totalSpins: 0,
          totalWagered: 0,
          totalWon: 0,
          lastLogin: new Date().toISOString(),
        });
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setSpinHistory(historyData);
      }
    } catch (e) {
      console.warn('Loading server data (retrying...):', e);
      setUser((prev) => prev || {
        id: 'player-1',
        username: 'Vegas Player 1',
        credits: 1000,
        bonusSpins: 0,
        level: 1,
        xp: 0,
        totalSpins: 0,
        totalWagered: 0,
        totalWon: 0,
        lastLogin: new Date().toISOString(),
      });
      if (retries > 0) {
        setTimeout(() => fetchData(retries - 1), 1200);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mode change handler
  const handleToggleMatrixMode = (mode: '3x3' | '5x3' | '5x4') => {
    setMatrixMode(mode);
    if (mode === '3x3') {
      setActiveLines(5);
      setReels(DEFAULT_REELS_3X3);
    } else if (mode === '5x4') {
      setActiveLines(25);
      setReels(DEFAULT_REELS_5X4);
    } else {
      setActiveLines(20);
      setReels(DEFAULT_REELS_5X3);
    }
    setLastSpin(null);
  };

  // Reset Balance
  const handleResetBalance = async (customAmount?: number) => {
    try {
      const amount = customAmount || 1000;
      const res = await fetch('/api/reset-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'player-1', amount }),
      });
      if (res.ok) {
        await fetchData();
        setLastSpin(null);
      }
    } catch (e) {
      console.error('Failed to reset balance:', e);
    }
  };

  // Add bonus credits from mini games or Web3 deposits
  const handleAddCredits = async (amountToAdd: number) => {
    if (!user) return;
    const newTotal = user.credits + amountToAdd;
    await handleResetBalance(newTotal);
  };

  // Deduct credits for Web3 cashouts
  const handleDeductCredits = async (amountToDeduct: number) => {
    if (!user) return;
    const newTotal = Math.max(0, user.credits - amountToDeduct);
    await handleResetBalance(newTotal);
  };

  // Execute Spin (Server Authoritative)
  const handleSpin = async () => {
    if (isSpinning) return;

    soundFx.playSpinStart();
    setIsSpinning(true);
    setIsQuickStop(false);
    setLastSpin(null);
    stoppedReelsCount.current = 0;

    try {
      const response = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'player-1',
          betPerLine,
          activeLines,
          matrixMode,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        let errorMsg = 'Spin failed';
        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } else {
          const text = await response.text();
          console.error('Spin server error:', text);
        }
        alert(errorMsg);
        setIsSpinning(false);
        setIsQuickStop(false);
        setAutoSpinsRemaining(0);
        return;
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Spin server unexpected non-JSON response:', text);
        setIsSpinning(false);
        setIsQuickStop(false);
        setAutoSpinsRemaining(0);
        return;
      }

      const spinResult: SpinResponse = await response.json();

      // Deduct bet immediately visually
      if (user) {
        setUser({
          ...user,
          credits: spinResult.creditsBefore - spinResult.totalBet,
        });
      }

      // Update target reels
      setReels(spinResult.reels);

      // Store pending spin result
      (window as any).__pendingSpinResult = spinResult;
    } catch (err) {
      console.warn('Spin connection issue:', err);
      setIsSpinning(false);
      setIsQuickStop(false);
      setAutoSpinsRemaining(0);
      fetchData();
    }
  };

  // Called when each individual reel column completes stopping
  const handleReelStopped = (reelIndex: number) => {
    stoppedReelsCount.current += 1;
    const numReels = matrixMode === '3x3' ? 3 : 5;

    if (stoppedReelsCount.current >= numReels) {
      setIsSpinning(false);
      setIsQuickStop(false);
      const result: SpinResponse = (window as any).__pendingSpinResult;

      if (result) {
        setLastSpin(result);

        // Update user state and stats from server result
        fetchData();

        // Check if jackpot won -> show Jackpot Celebration View!
        if (result.jackpotWon) {
          setCurrentView('jackpot');
        }

        // Check if Zonke Box Bonus Triggered
        if (result.zonkeBonusTriggered) {
          soundFx.playZonkeBoxOpen();
          setTimeout(() => {
            setIsZonkeModalOpen(true);
          }, 600);
        }

        // Sound FX
        if (result.payout > 0) {
          const isBigWin = result.payout >= result.totalBet * 10;
          soundFx.playWinChime(isBigWin);
        }

        if (result.bonusSpinsWon > 0) {
          soundFx.playBonusFanfare();
        }

        // Auto spin queueing
        if (autoSpinsRemaining > 0) {
          setAutoSpinsRemaining((prev) => prev - 1);
          setTimeout(() => {
            handleSpin();
          }, settings.turboMode ? 500 : 1200);
        }
      }
    }
  };

  const handleMaxBet = () => {
    setBetPerLine(100);
    setActiveLines(matrixMode === '3x3' ? 5 : 20);
  };

  const isBonusMode = user ? user.bonusSpins > 0 : false;
  const numReels = matrixMode === '3x3' ? 3 : 5;
  const numRows = matrixMode === '5x4' ? 4 : 3;
  const totalBet = isBonusMode ? 0 : betPerLine * activeLines;

  // Compute winning row positions per reel
  const winningPositionsByReel: Record<number, number[]> = {};
  if (lastSpin && lastSpin.winningLines) {
    lastSpin.winningLines.forEach((line) => {
      line.positions.forEach((pos) => {
        if (!winningPositionsByReel[pos.reel]) {
          winningPositionsByReel[pos.reel] = [];
        }
        if (!winningPositionsByReel[pos.reel].includes(pos.row)) {
          winningPositionsByReel[pos.reel].push(pos.row);
        }
      });
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Dynamic Background Particle System */}
      <ParticleCanvas density={settings.particleDensity} isCelebrating={currentView === 'jackpot'} />

      {/* Top Main Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        stats={stats}
        isMuted={settings.isMuted}
        onToggleMute={() => {
          soundFx.isMuted = !settings.isMuted;
          setSettings((prev) => ({ ...prev, isMuted: !prev.isMuted }));
        }}
        onOpenWallet={() => setIsWalletOpen(true)}
        walletState={wallet.walletState}
        currencySymbol={settings.currencySymbol || 'R'}
      />

      {/* Main Content View Switcher */}
      <div className="flex-1 flex flex-col items-center justify-start z-10">
        {currentView === 'landing' && (
          <LandingView
            onStartPlaying={() => setCurrentView('lobby')}
            onOpenBonus={() => setCurrentView('bonus')}
          />
        )}

        {currentView === 'lobby' && (
          <LobbyView
            user={user}
            onSelectGame={(mode) => {
              handleToggleMatrixMode(mode);
              setCurrentView('slot');
            }}
            onNavigate={setCurrentView}
            onClaimDailyBonus={handleAddCredits}
          />
        )}

        {currentView === 'slot' && (
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 flex flex-col items-center justify-between gap-6">
            {/* Header info bar */}
            <Header
              user={user}
              stats={stats}
              isMuted={settings.isMuted}
              onToggleMute={() => {
                soundFx.isMuted = !settings.isMuted;
                setSettings((prev) => ({ ...prev, isMuted: !prev.isMuted }));
              }}
              onOpenWallet={() => setIsWalletOpen(true)}
              walletState={wallet.walletState}
              onOpenPaytable={() => setIsPaytableOpen(true)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onOpenStats={() => setIsStatsOpen(true)}
              onResetBalance={() => handleResetBalance(1000)}
              onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
              fps={perfMetrics.fps}
              currencySymbol={settings.currencySymbol || 'R'}
            />

            {/* Bonus Mode Banner */}
            {isBonusMode && (
              <div className="w-full bg-gradient-to-r from-purple-900/80 via-indigo-900/90 to-purple-900/80 border-2 border-purple-400 p-3 rounded-2xl flex items-center justify-between text-white shadow-xl shadow-purple-500/20 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <div className="font-extrabold uppercase tracking-widest text-amber-300 text-sm">
                      FREE SPINS BONUS ACTIVE
                    </div>
                    <div className="text-xs text-purple-200">2X Payout Multiplier applied to all wins!</div>
                  </div>
                </div>
                <div className="bg-purple-950 px-4 py-1.5 rounded-xl border border-purple-400 font-mono text-lg font-black text-amber-300">
                  {user?.bonusSpins} LEFT
                </div>
              </div>
            )}

            {/* Win Announcement Banner */}
            <WinBanner lastSpin={lastSpin} />

            {/* AI Casino Host & Luck Oracle Panel */}
            <AiOraclePanel
              lastSpin={lastSpin}
              isSpinning={isSpinning}
              userCredits={user ? user.credits : 0}
            />

            {/* Reels Cabinet Frame - Interactive Click / Touch Target to Start or Quick Stop */}
            <div
              id="reels-cabinet"
              onClick={() => {
                if (!isSpinning) {
                  handleSpin();
                } else {
                  setIsQuickStop(true);
                  soundFx.playClick();
                }
              }}
              className={`relative w-full bg-slate-900/90 border-4 rounded-3xl p-3 sm:p-5 shadow-[0_0_50px_rgba(245,158,11,0.15)] backdrop-blur-md overflow-hidden cursor-pointer select-none transition-all duration-200 hover:border-amber-400 ${
                isSpinning
                  ? 'border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.35)]'
                  : 'border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)]'
              }`}
            >
              {/* Interactive Cabinet Action Overlay Badge */}
              <div className="absolute top-2 right-3 z-30 pointer-events-none hidden xs:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-amber-500/30 text-[10px] font-bold text-amber-300 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>{isSpinning ? 'TAP REELS / SPACE TO STOP' : 'TAP REELS / SPACE TO SPIN'}</span>
              </div>

              {/* Payline Connector Laser Canvas */}
              {!isSpinning && lastSpin && (
                <PaylineCanvas winningLines={lastSpin.winningLines} numReels={numReels} numRows={numRows} />
              )}

              {/* Reel Columns Grid */}
              <div className="flex gap-1.5 sm:gap-3 justify-center relative z-10">
                {reels.map((reelSymbols, rIdx) => (
                  <Reel
                    key={rIdx}
                    reelIndex={rIdx}
                    symbols={reelSymbols}
                    isSpinning={isSpinning}
                    stopDelay={
                      isQuickStop
                        ? Math.min(25, 10 + rIdx * 10)
                        : settings.turboMode
                        ? 100 + rIdx * 70
                        : 220 + rIdx * 150
                    }
                    winningPositions={winningPositionsByReel[rIdx] || []}
                    hasWinningLines={Boolean(lastSpin && lastSpin.winningLines.length > 0)}
                    onReelStopped={handleReelStopped}
                  />
                ))}
              </div>
            </div>

            {/* Control Console */}
            <BetControls
              matrixMode={matrixMode}
              onToggleMatrixMode={handleToggleMatrixMode}
              betPerLine={betPerLine}
              onChangeBet={setBetPerLine}
              activeLines={activeLines}
              onChangeLines={setActiveLines}
              totalBet={totalBet}
              isSpinning={isSpinning}
              autoSpinsRemaining={autoSpinsRemaining}
              onSpin={handleSpin}
              onToggleAutoSpin={(count) => {
                setAutoSpinsRemaining(count);
                if (count > 0 && !isSpinning) {
                  handleSpin();
                }
              }}
              onMaxBet={handleMaxBet}
              userCredits={user ? user.credits : 0}
              isBonusMode={isBonusMode}
              canGamble={Boolean(lastSpin && lastSpin.payout > 0 && !isSpinning)}
              onOpenGamble={() => setIsGambleModalOpen(true)}
              zonkeTriggered={Boolean(lastSpin?.zonkeBonusTriggered)}
              onOpenZonke={() => setIsZonkeModalOpen(true)}
              currencySymbol={settings.currencySymbol || 'R'}
            />

            {/* Keyboard Shortcuts Helper Bar */}
            <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2.5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-300">
                <span className="text-amber-400">⌨️ KEYBOARD SHORTCUTS:</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-mono">
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-amber-300 rounded font-bold">SPACE</kbd> Spin</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-amber-300 rounded font-bold">M</kbd> Mute</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-amber-300 rounded font-bold">B</kbd> Max Bet</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-amber-300 rounded font-bold">A</kbd> Auto Spin</span>
              </div>
              <button
                onClick={() => setIsDailyLoginOpen(true)}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold rounded-lg transition uppercase text-[10px]"
              >
                🎁 Daily Login Bonus
              </button>
            </div>
          </main>
        )}

        {currentView === 'bonus' && (
          <BonusWorldView
            onAddCredits={handleAddCredits}
            onBackToSlot={() => setCurrentView('slot')}
          />
        )}

        {currentView === 'jackpot' && (
          <JackpotCelebrationView
            jackpotAmount={stats ? stats.jackpotPool : 12500}
            onBackToSlot={() => setCurrentView('slot')}
          />
        )}

        {currentView === 'stats' && (
          <StatsView
            stats={stats}
            history={spinHistory}
            onRefreshStats={fetchData}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newPartial) => setSettings((prev) => ({ ...prev, ...newPartial }))}
            onResetBalance={() => handleResetBalance(1000)}
          />
        )}
      </div>

      {/* Footer info */}
      <footer className="w-full py-3 text-center text-xs text-slate-500 border-t border-slate-900 bg-slate-950/90 z-20">
        Cyber Vegas Slots • Server-Authoritative Engine with Verified Paytable Engine
      </footer>

      {/* Modals */}
      {isZonkeModalOpen && (
        <ZonkeBoxModal
          totalBet={totalBet}
          currencySymbol={settings.currencySymbol || 'R'}
          onClose={() => setIsZonkeModalOpen(false)}
          onUpdateUser={(credits, bonusSpins) => {
            setUser((prev) => (prev ? { ...prev, credits, bonusSpins } : null));
            fetchData();
          }}
        />
      )}

      {isGambleModalOpen && (
        <GambleModal
          currentWin={lastSpin ? lastSpin.payout : 0}
          currencySymbol={settings.currencySymbol || 'R'}
          onClose={(finalWin) => {
            setIsGambleModalOpen(false);
            fetchData();
          }}
          onUpdateUser={(credits) => {
            setUser((prev) => (prev ? { ...prev, credits } : null));
          }}
        />
      )}

      <PerformanceDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        metrics={perfMetrics}
      />
      <DailyLoginModal
        isOpen={isDailyLoginOpen}
        onClose={() => setIsDailyLoginOpen(false)}
        onClaimReward={handleAddCredits}
      />
      <PaytableModal isOpen={isPaytableOpen} onClose={() => setIsPaytableOpen(false)} />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={spinHistory}
        onResetBalance={() => handleResetBalance(1000)}
      />
      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} stats={stats} />
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        walletState={wallet.walletState}
        onConnectEthereum={wallet.connectEthereum}
        onConnectSolana={wallet.connectSolana}
        onRefreshBalance={wallet.refreshBalance}
        onDisconnect={wallet.disconnectWallet}
        onAddCredits={handleAddCredits}
        onDeductCredits={handleDeductCredits}
        userCredits={user?.credits || 0}
        currencySymbol={settings.currencySymbol || 'R'}
      />
    </div>
  );
}

