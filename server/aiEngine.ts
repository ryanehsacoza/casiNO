import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
let lastQuotaExceededTime = 0;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const FALLBACK_COMMENTARIES_WIN = [
  "🔥 HOT SPIN! Payout Matrix triggered a multiplier cascade!",
  "✨ WINS LANDED! The RNG algorithms are heating up nicely!",
  "💎 SHINING REELS! Cash payout credited to balance!",
  "🎰 JACKPOT FREQUENCY UP! High-paying combinations aligned!",
  "⚡ BOOM! Big momentum building on the slot grid!",
];

const FALLBACK_COMMENTARIES_NEUTRAL = [
  "⚡ AURA-7 Engine active: High volatility cycle detected!",
  "🎰 Spin complete! The RNG matrices are preparing for a surge.",
  "🔮 AI Oracle: Hold your position on active lines for optimal hit rate.",
  "✨ Reel velocity stable. High payout potential on upcoming spins!",
  "👑 Kingdom Slots RNG calibrated. May luck favor your next spin!",
];

export async function generateSlotCommentary(spinData: {
  totalWin: number;
  totalBet: number;
  jackpotWon?: boolean;
  bonusSpinsWon?: number;
  scatterCount?: number;
  winningLinesCount?: number;
  userCredits?: number;
}): Promise<string> {
  const now = Date.now();
  // Circuit breaker: If quota exceeded in last 60 seconds, use dynamic instant fallback
  if (now - lastQuotaExceededTime < 60000 || !process.env.GEMINI_API_KEY) {
    if (spinData.jackpotWon) return "💥 GRAND JACKPOT UNLOCKED! Cosmic luck overload!";
    if (spinData.totalWin > spinData.totalBet * 5) return `🔥 MEGA WIN! R${spinData.totalWin.toLocaleString()} secured! Keep spinning!`;
    if (spinData.totalWin > 0) {
      return FALLBACK_COMMENTARIES_WIN[Math.floor(Math.random() * FALLBACK_COMMENTARIES_WIN.length)];
    }
    return FALLBACK_COMMENTARIES_NEUTRAL[Math.floor(Math.random() * FALLBACK_COMMENTARIES_NEUTRAL.length)];
  }

  try {
    const ai = getAiClient();
    const prompt = `You are "AURA-7", an intelligent AI Casino Host for Kingdom Slots.
Spin Result: bet=R${spinData.totalBet}, win=R${spinData.totalWin}, winningLines=${spinData.winningLinesCount || 0}, scatters=${spinData.scatterCount || 0}, jackpot=${spinData.jackpotWon ? 'YES' : 'NO'}, bonusSpins=${spinData.bonusSpinsWon || 0}.
Provide a catchy 1-sentence witty commentary with emojis under 20 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    return response.text?.trim() || "🎰 AI Oracle active! May the odds be in your favor.";
  } catch (err: any) {
    if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota')) {
      lastQuotaExceededTime = Date.now();
    }
    if (spinData.totalWin > 0) return `🎉 Nice hit! +R${spinData.totalWin} added to your stack!`;
    return "⚡ Spin recorded! The AI Oracle forecasts rising luck.";
  }
}

export async function generateLuckForecast(stats: {
  totalSpins: number;
  totalWon: number;
  totalBet: number;
  credits: number;
  highestWin: number;
}): Promise<{ forecast: string; luckScore: number; recommendation: string }> {
  const now = Date.now();
  const rtp = stats.totalBet > 0 ? ((stats.totalWon / stats.totalBet) * 100).toFixed(1) : "96.5";

  if (now - lastQuotaExceededTime < 60000 || !process.env.GEMINI_API_KEY) {
    return {
      forecast: `Session RTP is currently ${rtp}%. High variance cycle is charging up!`,
      luckScore: Math.floor(75 + Math.random() * 20),
      recommendation: "Maintain max active paylines for maximum hit coverage on upcoming spins!",
    };
  }

  try {
    const ai = getAiClient();
    const prompt = `You are "AURA-7", an AI Slot Machine Intelligence Oracle.
Session Stats:
Total Spins: ${stats.totalSpins}
Total Bet: R${stats.totalBet}
Total Won: R${stats.totalWon}
Credits: R${stats.credits}
Highest Win: R${stats.highestWin}

Return a JSON object with keys:
"forecast": string (1-sentence prediction),
"luckScore": integer (1-100),
"recommendation": string (short strategy tip)`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      forecast: parsed.forecast || 'Cosmic alignment detected in the reel RNG matrices!',
      luckScore: typeof parsed.luckScore === 'number' ? parsed.luckScore : 88,
      recommendation: parsed.recommendation || 'Spin on max lines to trigger the Zonke Mystery Box!',
    };
  } catch (err: any) {
    if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota')) {
      lastQuotaExceededTime = Date.now();
    }
    return {
      forecast: `Session RTP is currently ${rtp}%. High variance cycle is charging up!`,
      luckScore: 92,
      recommendation: "Spin on max active paylines for optimal hit frequency.",
    };
  }
}

