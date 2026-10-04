import React, { useState } from 'react';
import { User, AppView } from '../../types';
import { soundFx } from '../../utils/audio';
import { Gamepad2, Dices, Gift, Trophy, Award, Flame, Play, Sparkles, CheckCircle2, RotateCw } from 'lucide-react';

interface LobbyViewProps {
  user: User | null;
  onSelectGame: (mode: '3x3' | '5x3') => void;
  onNavigate: (view: AppView) => void;
  onClaimDailyBonus: (amount: number) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  user,
  onSelectGame,
  onNavigate,
  onClaimDailyBonus,
}) => {
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelClaimed, setWheelClaimed] = useState(false);
  const [wheelResult, setWheelResult] = useState<number | null>(null);

  const handleSpinDailyWheel = () => {
    if (wheelSpinning || wheelClaimed) return;

    setWheelSpinning(true);
    soundFx.playBonusFanfare();

    setTimeout(() => {
      const prizes = [250, 500, 750, 1000, 2500, 5000];
      const winAmount = prizes[Math.floor(Math.random() * prizes.length)];
      setWheelResult(winAmount);
      setWheelSpinning(false);
      setWheelClaimed(true);
      onClaimDailyBonus(winAmount);
    }, 2000);
  };

  const games = [
    {
      id: '5x3',
      title: 'Cyber Vegas 5x3',
      lines: '20 Paylines',
      desc: 'High volatility video slot with Wild jokers & Free Spins multipliers.',
      icon: '🎰',
      bg: 'from-amber-500/20 via-purple-500/10 to-slate-900',
      badge: 'POPULAR',
      mode: '5x3' as const,
    },
    {
      id: '3x3',
      title: 'Retro Classic 3x3',
      lines: '5 Paylines',
      desc: 'Vintage Las Vegas mechanical slot style with instant bar wins.',
      icon: '🍒',
      bg: 'from-red-500/20 via-orange-500/10 to-slate-900',
      badge: 'CLASSIC',
      mode: '3x3' as const,
    },
    {
      id: 'jackpot',
      title: 'Mega Jackpot Arena',
      lines: 'Progressive Pool',
      desc: 'Compete for the shared progressive jackpot pool on top paylines.',
      icon: '👑',
      bg: 'from-yellow-500/20 via-amber-600/10 to-slate-900',
      badge: 'HOT',
      mode: '5x3' as const,
    },
    {
      id: 'bonus',
      title: 'Bonus World Arcade',
      lines: 'Mini-Games',
      desc: 'Play treasure chests, wheel spins, coin drops and mystery boxes.',
      icon: '🎁',
      bg: 'from-indigo-500/20 via-blue-500/10 to-slate-900',
      badge: 'NEW',
      isBonusWorld: true,
    },
  ];

  const achievements = [
    { title: 'First Spin', desc: 'Spin any slot machine once', progress: 1, max: 1, done: true, reward: '$100' },
    { title: 'High Roller', desc: 'Wager a total of $1,000+', progress: Math.min(1000, user?.totalWagered || 0), max: 1000, done: (user?.totalWagered || 0) >= 1000, reward: '$500' },
    { title: 'Bonus Hunter', desc: 'Trigger free spin bonus mode', progress: user?.bonusSpins ? 1 : 0, max: 1, done: (user?.bonusSpins || 0) > 0, reward: '$250' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: User Profile Overview */}
      {user && (
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl">
                🤠
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-amber-300 flex items-center gap-2">
                <span>{user.username}</span>
                <span className="px-2.5 py-0.5 text-xs bg-amber-500 text-slate-950 rounded-full font-extrabold uppercase">
                  Level {user.level}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span>Total Spins: {user.totalSpins}</span>
                <span>•</span>
                <span>Total Won: ${user.totalWon.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="w-full md:w-64 space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Level Progress</span>
              <span className="text-amber-400">{user.xp % 500} / 500 XP</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((user.xp % 500) / 500) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Section Header */}
      <div>
        <h2 className="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-100 flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-amber-400" />
          <span>Casino Game Floor</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Select an active slot machine cabinet or enter Bonus World</p>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {games.map((g) => (
          <div
            key={g.id}
            onClick={() => {
              soundFx.playClick();
              if (g.isBonusWorld) {
                onNavigate('bonus');
              } else {
                onSelectGame(g.mode);
              }
            }}
            className={`bg-gradient-to-br ${g.bg} border border-slate-800 hover:border-amber-500/60 p-6 rounded-3xl shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group relative overflow-hidden`}
          >
            <div className="flex justify-between items-start">
              <div className="text-5xl group-hover:scale-110 transition-transform">{g.icon}</div>
              <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow">
                {g.badge}
              </span>
            </div>

            <div className="mt-6 space-y-1">
              <h3 className="text-xl font-black text-slate-100 group-hover:text-amber-300 transition-colors">
                {g.title}
              </h3>
              <div className="text-xs font-bold text-amber-400">{g.lines}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{g.desc}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>PLAY NOW</span>
              <Play className="w-4 h-4 fill-current group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section: Daily Bonus Wheel & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Daily Bonus Wheel Card */}
        <div className="bg-slate-900/90 border border-amber-500/30 p-6 rounded-3xl shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <RotateCw className="w-5 h-5" />
            <h3 className="font-black text-lg uppercase tracking-wider">Daily Wheel Reward</h3>
          </div>
          <p className="text-xs text-slate-400">Spin the daily wheel once per day to claim up to $5,000 in free game credits!</p>

          <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 relative">
            <div
              className={`text-6xl transition-transform duration-1000 ${
                wheelSpinning ? 'animate-spin' : ''
              }`}
            >
              🎡
            </div>

            {wheelResult !== null ? (
              <div className="mt-4 text-emerald-400 font-extrabold text-lg animate-bounce">
                +${wheelResult} CREDITS CLAIMED!
              </div>
            ) : (
              <button
                disabled={wheelSpinning || wheelClaimed}
                onClick={handleSpinDailyWheel}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase rounded-xl shadow-lg hover:brightness-110 disabled:opacity-50"
              >
                {wheelSpinning ? 'SPINNING...' : wheelClaimed ? 'CLAIMED TODAY' : 'SPIN FOR FREE CREDITS'}
              </button>
            )}
          </div>
        </div>

        {/* Achievements Card */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Award className="w-5 h-5" />
            <h3 className="font-black text-lg uppercase tracking-wider">Player Achievements</h3>
          </div>

          <div className="space-y-3">
            {achievements.map((ach, idx) => (
              <div key={idx} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <span>{ach.title}</span>
                    {ach.done && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="text-xs text-slate-400">{ach.desc}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-400">{ach.reward}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
