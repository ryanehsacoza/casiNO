import React from 'react';
import { User, Stats } from '../types';
import { WalletState } from '../hooks/useWallet';
import { soundFx } from '../utils/audio';
import { Volume2, VolumeX, HelpCircle, History, BarChart3, Coins, Flame, Award, RefreshCw, Activity, Wallet } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  stats: Stats | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenPaytable: () => void;
  onOpenHistory: () => void;
  onOpenStats: () => void;
  onResetBalance: () => void;
  onOpenDiagnostics?: () => void;
  onOpenWallet?: () => void;
  walletState?: WalletState;
  fps?: number;
  currencySymbol?: string;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  stats,
  isMuted,
  onToggleMute,
  onOpenPaytable,
  onOpenHistory,
  onOpenStats,
  onResetBalance,
  onOpenDiagnostics,
  onOpenWallet,
  walletState,
  fps = 60,
  currencySymbol = '$',
}) => {
  const grandJackpot = stats ? stats.jackpotPool : 100000;
  const majorJackpot = grandJackpot * 0.25;
  const minorJackpot = grandJackpot * 0.05;

  return (
    <header id="slot-header" className="w-full bg-slate-900/95 border-b border-amber-500/30 backdrop-blur-md px-4 py-3 sticky top-0 z-30 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & User Info */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-xl font-bold text-amber-400">
                🎰
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 font-serif">
                KINGDOM & PLAYLIVE CASINO
              </h1>
              <p className="text-[10px] text-amber-400/80 font-bold tracking-widest uppercase flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Novomatic & Zonke Mystery Slots
              </p>
            </div>
          </div>

          {user && (
            <div className="hidden sm:flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
              <div className="text-xs">
                <div className="flex items-center justify-between gap-2 font-medium text-slate-300">
                  <span>{user.username}</span>
                  <span className="text-amber-400 font-bold">VIP Level {user.level}</span>
                </div>
                <div className="w-24 bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (user.xp % 500) / 5)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center: Multi-Tier Progressive Jackpot Ticker */}
        <div id="jackpot-ticker" className="flex items-center gap-4 bg-gradient-to-r from-red-950/90 via-amber-950/90 to-red-950/90 px-4 py-2 rounded-2xl border border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          {/* Minor Jackpot */}
          <div className="hidden lg:block text-center border-r border-amber-500/30 pr-3">
            <div className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">MINOR</div>
            <div className="text-xs font-black text-emerald-300 font-mono">
              {currencySymbol} {minorJackpot.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>

          {/* Grand Progressive Jackpot */}
          <div className="flex items-center gap-2 text-center">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-300 font-extrabold flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-yellow-400" />
                GRAND ZONKE JACKPOT
              </div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-200 font-mono">
                {currencySymbol} {grandJackpot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>

          {/* Major Jackpot */}
          <div className="hidden lg:block text-center border-l border-amber-500/30 pl-3">
            <div className="text-[9px] uppercase tracking-widest text-cyan-400 font-bold">MAJOR</div>
            <div className="text-xs font-black text-cyan-300 font-mono">
              {currencySymbol} {majorJackpot.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Right Controls & Credits */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Web3 Wallet Button */}
          {onOpenWallet && (
            <button
              id="wallet-connect-btn"
              onClick={() => {
                soundFx.playClick();
                onOpenWallet();
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition shadow-lg ${
                walletState?.isConnected
                  ? 'bg-amber-500/10 border-amber-500/60 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black hover:brightness-110'
              }`}
              title="Connect Ethereum or Solana Wallet"
            >
              <Wallet className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-extrabold leading-none">
                  {walletState?.isConnected ? walletState.walletType?.toUpperCase() : 'WEB3 WALLET'}
                </div>
                <div className="text-xs font-black font-mono leading-tight">
                  {walletState?.isConnected
                    ? `${walletState.balance.toFixed(2)} ${walletState.walletType === 'solana' ? 'SOL' : 'ETH'}`
                    : 'CONNECT'}
                </div>
              </div>
            </button>
          )}

          {/* Credit Balance */}
          <div id="credit-balance-pill" className="flex items-center gap-2 bg-slate-800/90 border border-emerald-500/50 px-3.5 py-1.5 rounded-xl shadow-lg">
            <Coins className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Casino Balance</div>
              <div className="text-lg font-black text-emerald-300 font-mono">
                {currencySymbol} {user ? user.credits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </div>
            </div>
            <button
              id="reset-balance-btn"
              onClick={() => {
                soundFx.playClick();
                onResetBalance();
              }}
              title="Reload Casino Credits"
              className="ml-1 p-1 hover:bg-slate-700/80 text-slate-400 hover:text-emerald-400 rounded-md transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {onOpenDiagnostics && (
              <button
                id="diagnostics-btn"
                onClick={() => {
                  soundFx.playClick();
                  onOpenDiagnostics();
                }}
                className="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-700/70 rounded-lg transition flex items-center gap-1 text-xs font-medium"
                title="Performance & Diagnostics"
              >
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="hidden lg:inline text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-1 py-0.5 rounded">
                  {fps} FPS
                </span>
              </button>
            )}

            <button
              id="paytable-btn"
              onClick={() => {
                soundFx.playClick();
                onOpenPaytable();
              }}
              className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-700/70 rounded-lg transition flex items-center gap-1 text-xs font-medium"
              title="Paytable & Rules"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Paytable</span>
            </button>

            <button
              id="history-btn"
              onClick={() => {
                soundFx.playClick();
                onOpenHistory();
              }}
              className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-700/70 rounded-lg transition flex items-center gap-1 text-xs font-medium"
              title="Spin History Audit Log"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>

            <button
              id="stats-btn"
              onClick={() => {
                soundFx.playClick();
                onOpenStats();
              }}
              className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-700/70 rounded-lg transition flex items-center gap-1.5 text-xs font-medium"
              title="Live RTP & Statistics"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Stats</span>
              {stats && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300 rounded">
                  RTP {stats.rtp}%
                </span>
              )}
            </button>

            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/90 rounded-lg border border-slate-700/50">
              <button
                id="audio-toggle-btn"
                onClick={() => {
                  soundFx.playClick();
                  onToggleMute();
                }}
                className="p-1 text-slate-300 hover:text-amber-400 transition"
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : soundFx.volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  soundFx.setVolume(val);
                  if (val > 0 && isMuted) {
                    onToggleMute();
                  }
                }}
                className="w-12 sm:w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                title="Master Volume"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

