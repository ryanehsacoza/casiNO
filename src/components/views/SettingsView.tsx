import React from 'react';
import { GameSettings } from '../../types';
import { soundFx } from '../../utils/audio';
import { Settings as SettingsIcon, Volume2, Sparkles, Zap, ShieldAlert, RefreshCw } from 'lucide-react';

interface SettingsViewProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetBalance: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetBalance,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
          <SettingsIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>Game Preferences</span>
        </div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-100">
          SYSTEM SETTINGS
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audio Controls */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-black uppercase text-sm">
            <Volume2 className="w-5 h-5" />
            <span>Audio & Sound FX</span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                <span>Sound FX Volume</span>
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-slate-300">Mute All Sounds</span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onUpdateSettings({ isMuted: !settings.isMuted });
                }}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
                  settings.isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.isMuted ? 'MUTED' : 'ACTIVE'}
              </button>
            </div>
          </div>
        </div>

        {/* Visual FX & Graphics */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-black uppercase text-sm">
            <Sparkles className="w-5 h-5" />
            <span>Visual Effects & Theme</span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="text-xs font-bold text-slate-300 mb-2">Particle Density</div>
              <div className="grid grid-cols-3 gap-2">
                {(['high', 'low', 'off'] as const).map((density) => (
                  <button
                    key={density}
                    onClick={() => {
                      soundFx.playClick();
                      onUpdateSettings({ particleDensity: density });
                    }}
                    className={`py-1.5 text-xs font-bold uppercase rounded-xl border transition ${
                      settings.particleDensity === density
                        ? 'bg-amber-500 border-yellow-400 text-slate-950 shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {density}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-slate-300">Turbo Spin Animations</span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onUpdateSettings({ turboMode: !settings.turboMode });
                }}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition ${
                  settings.turboMode ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.turboMode ? 'ON (FAST)' : 'OFF (NORMAL)'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Account Balance Management */}
      <div className="bg-slate-900/90 border border-red-500/30 p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 text-rose-400 font-black uppercase text-sm">
          <ShieldAlert className="w-5 h-5" />
          <span>Bankroll Reset</span>
        </div>
        <p className="text-xs text-slate-400">If your demo credits drop low, you can reset your bankroll back to $1,000.00 instantly on the server.</p>

        <button
          onClick={() => {
            soundFx.playClick();
            onResetBalance();
          }}
          className="px-6 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-xl font-bold text-xs uppercase transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset Bankroll to $1,000.00</span>
        </button>
      </div>
    </div>
  );
};
