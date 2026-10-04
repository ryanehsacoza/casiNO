import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, Zap, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { SpinResponse } from '../types';

interface AiOraclePanelProps {
  lastSpin: SpinResponse | null;
  isSpinning: boolean;
  userCredits: number;
}

export const AiOraclePanel: React.FC<AiOraclePanelProps> = ({
  lastSpin,
  isSpinning,
}) => {
  const [commentary, setCommentary] = useState<string>(
    '⚡ AURA-7 AI Oracle connected. Spin the reels to analyze RNG frequency!'
  );
  const [isLoadingCommentary, setIsLoadingCommentary] = useState<boolean>(false);
  const [isOracleOpen, setIsOracleOpen] = useState<boolean>(false);
  const [oracleData, setOracleData] = useState<{
    forecast: string;
    luckScore: number;
    recommendation: string;
  } | null>(null);
  const [isLoadingOracle, setIsLoadingOracle] = useState<boolean>(false);

  // Auto-fetch commentary on completed spin
  useEffect(() => {
    if (!lastSpin || isSpinning) return;

    let isMounted = true;
    setIsLoadingCommentary(true);

    fetch('/api/ai/commentary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalWin: lastSpin.payout,
        totalBet: lastSpin.totalBet,
        jackpotWon: lastSpin.jackpotWon,
        bonusSpinsWon: lastSpin.bonusSpinsWon,
        scatterCount: lastSpin.scatterCount,
        winningLinesCount: lastSpin.winningLines.length,
        userCredits: lastSpin.creditsAfter,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Commentary fetch error');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.commentary) {
          setCommentary(data.commentary);
        }
      })
      .catch(() => {
        if (isMounted) {
          if (lastSpin.payout > 0) {
            setCommentary(`🎉 Win landed! +R${lastSpin.payout.toFixed(2)} credited to your balance!`);
          } else {
            setCommentary('⚡ Spin complete! The AURA-7 AI Oracle predicts rising luck on active paylines.');
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingCommentary(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lastSpin, isSpinning]);

  const handleConsultOracle = async () => {
    setIsLoadingOracle(true);
    setIsOracleOpen(true);
    try {
      const res = await fetch('/api/ai/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'player-1' }),
      });
      if (res.ok) {
        const data = await res.json();
        setOracleData(data);
      }
    } catch (e) {
      console.error('Oracle fetch failed:', e);
    } finally {
      setIsLoadingOracle(false);
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md space-y-3">
      {/* Top Banner Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-300">
            <Bot className="w-5 h-5 animate-bounce" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                AURA-7 AI HOST
              </span>
              <span className="px-1.5 py-0.2 text-[8px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded">
                GEMINI 3.6 FLASH
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Live Casino Intelligence & Real-Time Commentary</p>
          </div>
        </div>

        <button
          onClick={handleConsultOracle}
          disabled={isLoadingOracle}
          className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 border border-cyan-300/40 transition flex items-center gap-1.5 active:scale-95"
        >
          {isLoadingOracle ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          )}
          <span>{oracleData ? 'Refresh Oracle' : 'AI Luck Oracle'}</span>
        </button>
      </div>

      {/* Real-time Commentary Box */}
      <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5 text-xs text-slate-200">
        <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
        <p className="italic font-medium leading-relaxed">
          {isLoadingCommentary ? (
            <span className="text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" /> Analyzing spin vectors...
            </span>
          ) : (
            commentary
          )}
        </p>
      </div>

      {/* Collapsible Oracle Strategy & Luck Modal Card */}
      {isOracleOpen && (
        <div className="bg-slate-950/90 border border-cyan-500/40 p-3.5 rounded-xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Luck & Strategy Forecast</span>
            </span>
            <button
              onClick={() => setIsOracleOpen(false)}
              className="p-1 text-slate-400 hover:text-white transition"
            >
              {isOracleOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {isLoadingOracle ? (
            <div className="py-4 text-center text-xs text-cyan-400 flex items-center justify-center gap-2 font-mono">
              <RefreshCw className="w-4 h-4 animate-spin" /> Consulting Gemini 3.6 Flash Neural Engine...
            </div>
          ) : oracleData ? (
            <div className="space-y-2.5 text-xs">
              {/* Luck Index Gauge */}
              <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 font-medium">AI Luck Index:</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${oracleData.luckScore}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-emerald-400">{oracleData.luckScore}%</span>
                </div>
              </div>

              {/* Forecast text */}
              <div className="p-2 bg-slate-900/60 border border-slate-800/80 rounded-lg text-slate-300 leading-snug">
                <strong className="text-cyan-300">Forecast: </strong> {oracleData.forecast}
              </div>

              {/* Strategy Tip */}
              <div className="p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-emerald-200 font-medium flex items-start gap-2">
                <span className="text-amber-400">💡</span>
                <div>
                  <strong className="text-amber-300 uppercase text-[10px] block">
                    AI Strategy Recommendation
                  </strong>
                  <span>{oracleData.recommendation}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
