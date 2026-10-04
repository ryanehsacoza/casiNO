import React from 'react';
import { AppView, User, Stats } from '../types';
import { WalletState } from '../hooks/useWallet';
import { soundFx } from '../utils/audio';
import {
  Sparkles,
  Gamepad2,
  Dices,
  Gift,
  Trophy,
  BarChart3,
  Settings as SettingsIcon,
  Coins,
  Flame,
  Volume2,
  VolumeX,
  Wallet,
} from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  user: User | null;
  stats: Stats | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenWallet?: () => void;
  walletState?: WalletState;
  currencySymbol?: string;
}

const NAV_ITEMS: { id: AppView; label: string; Icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
  { id: 'landing', label: 'Welcome', Icon: Sparkles },
  { id: 'lobby', label: 'Lobby', Icon: Gamepad2 },
  { id: 'slot', label: 'Slot Machine', Icon: Dices, badge: 'HOT' },
  { id: 'bonus', label: 'Bonus World', Icon: Gift, badge: 'NEW' },
  { id: 'jackpot', label: 'Jackpot', Icon: Trophy },
  { id: 'stats', label: 'Stats & RTP', Icon: BarChart3 },
  { id: 'settings', label: 'Settings', Icon: SettingsIcon },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  user,
  stats,
  isMuted,
  onToggleMute,
  onOpenWallet,
  walletState,
  currencySymbol = 'R',
}) => {
  return (
    <nav className="w-full bg-slate-950/90 border-b border-amber-500/30 backdrop-blur-md sticky top-0 z-40 px-3 py-2.5 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Brand Logo */}
        <div
          onClick={() => {
            soundFx.playClick();
            onNavigate('landing');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-lg">
              🎰
            </div>
          </div>
          <div>
            <div className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-100 font-sans">
              CYBER VEGAS
            </div>
            <div className="text-[9px] text-amber-400/80 uppercase tracking-widest font-bold">
              Arcade Slot Universe
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800/80 overflow-x-auto max-w-full">
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            const ItemIcon = item.Icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  onNavigate(item.id);
                }}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ItemIcon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && !isActive && (
                  <span className="px-1 py-0.2 text-[8px] font-black bg-rose-500 text-white rounded uppercase">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Info Pill */}
        <div className="flex items-center gap-2.5">
          {/* Web3 Wallet Button */}
          {onOpenWallet && (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenWallet();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition shadow-md ${
                walletState?.isConnected
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black hover:brightness-110'
              }`}
              title="Connect Web3 Wallet"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>
                {walletState?.isConnected
                  ? `${walletState.balance.toFixed(2)} ${walletState.walletType === 'solana' ? 'SOL' : 'ETH'}`
                  : 'Wallet'}
              </span>
            </button>
          )}

          {/* Jackpot Ticker */}
          {stats && (
            <div className="hidden xl:flex items-center gap-1.5 bg-gradient-to-r from-red-950/80 to-amber-950/80 px-3 py-1 rounded-xl border border-amber-500/40 text-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold text-slate-400">Jackpot:</span>
              <span className="font-mono font-bold text-amber-300">
                {currencySymbol} {stats.jackpotPool.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </span>
            </div>
          )}

          {/* User Credits Pill */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-xl border border-emerald-500/40 shadow-inner">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-emerald-300">
              {currencySymbol} {user ? user.credits.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              soundFx.playClick();
              onToggleMute();
            }}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 rounded-xl border border-slate-800 transition"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </nav>
  );
};
