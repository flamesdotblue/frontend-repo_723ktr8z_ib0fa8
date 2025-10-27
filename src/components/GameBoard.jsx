import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, CheckCircle2, XCircle, Volume2, RotateCcw } from 'lucide-react';

const CHALLENGES = [
  { type: 'quiz', prompt: 'Which is heavier: 1 kg of cotton or 1 kg of iron?' },
  { type: 'quiz', prompt: 'If a plane crashes on the border of two countries, where do they bury the survivors?' },
  { type: 'word', prompt: 'Name 3 fruits that are yellow.' },
  { type: 'word', prompt: 'Say 3 animals that live in water.' },
  { type: 'puzzle', prompt: 'Riddle: What has keys but can’t open locks?' },
  { type: 'puzzle', prompt: 'Pattern: What comes next? 2, 4, 8, 16, __' },
  { type: 'dare', prompt: 'Funny Dare: Say the alphabet backward!' },
  { type: 'dare', prompt: 'Funny Dare: Do 5 jumping jacks and smile!' },
  { type: 'memory', prompt: 'Memory: Remember 7, 3, 1, 9 — repeat it now!' },
  { type: 'memory', prompt: 'Memory: Banana, Rocket, Cloud — recall in order!' },
];

function useBeep() {
  const ctxRef = useRef(null);
  const ensureCtx = () => {
    if (!ctxRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
    }
    return ctxRef.current;
  };
  const playTone = useCallback((freq = 880, duration = 0.1, type = 'sine', gain = 0.03) => {
    const ctx = ensureCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g).connect(ctx.destination);
    const now = ctx.currentTime;
    osc.start(now);
    osc.stop(now + duration);
  }, []);
  const success = useCallback(() => {
    playTone(523.25, 0.12, 'triangle', 0.04);
    setTimeout(() => playTone(659.25, 0.12, 'triangle', 0.04), 120);
    setTimeout(() => playTone(783.99, 0.18, 'triangle', 0.04), 240);
  }, [playTone]);
  const tick = useCallback(() => playTone(880, 0.06, 'square', 0.03), [playTone]);
  const buzzer = useCallback(() => playTone(120, 0.25, 'sawtooth', 0.05), [playTone]);
  return { success, tick, buzzer };
}

export default function GameBoard({ onExit, onSaveScore }) {
  const [name, setName] = useState(() => localStorage.getItem('qm_name') || 'Player');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState(null);
  const [result, setResult] = useState(null); // 'win' | 'lose' | null
  const [soundOn, setSoundOn] = useState(true);

  const { success, tick, buzzer } = useBeep();

  const pickChallenge = useCallback(() => {
    const idx = Math.floor(Math.random() * CHALLENGES.length);
    setCurrent({ ...CHALLENGES[idx], id: crypto.randomUUID() });
  }, []);

  const restartTimer = useCallback(() => {
    setTime(30);
    setRunning(true);
    setResult(null);
  }, []);

  const startRound = useCallback(() => {
    pickChallenge();
    restartTimer();
  }, [pickChallenge, restartTimer]);

  useEffect(() => {
    // start on mount
    startRound();
  }, [startRound]);

  useEffect(() => {
    if (!running) return;
    if (time <= 0) {
      setRunning(false);
      setResult('lose');
      soundOn && buzzer();
      return;
    }
    const id = setTimeout(() => {
      setTime((t) => t - 1);
      if (soundOn && time <= 5) tick();
    }, 1000);
    return () => clearTimeout(id);
  }, [time, running, soundOn, tick, buzzer]);

  const handleWin = () => {
    if (!running) return;
    setRunning(false);
    setScore((s) => s + 10);
    setResult('win');
    soundOn && success();
  };

  const nextChallenge = () => {
    startRound();
  };

  const skipChallenge = () => {
    pickChallenge();
    restartTimer();
  };

  const saveAndExit = () => {
    const payload = { name: name || 'Player', score, date: new Date().toISOString() };
    localStorage.setItem('qm_name', payload.name);
    const existing = JSON.parse(localStorage.getItem('qm_scores') || '[]');
    existing.push(payload);
    existing.sort((a, b) => b.score - a.score);
    const top = existing.slice(0, 5);
    localStorage.setItem('qm_scores', JSON.stringify(top));
    onSaveScore(score);
    onExit();
  };

  const resetGame = () => {
    setScore(0);
    setResult(null);
    startRound();
  };

  const progress = useMemo(() => time / 30, [time]);
  const circumference = 2 * Math.PI * 60;
  const dashoffset = circumference * (1 - progress);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-white placeholder-white/60 backdrop-blur focus:outline-none"
            placeholder="Enter your name"
          />
          <button onClick={() => setSoundOn((s) => !s)} className={`rounded-full px-3 py-2 text-white ${soundOn ? 'bg-green-600/80' : 'bg-gray-600/60'}`}>
            <Volume2 className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-600/20 px-4 py-2 text-purple-200">Score: <span className="font-bold">{score}</span></div>
          <button onClick={resetGame} className="inline-flex items-center gap-2 rounded-full bg-blue-600/90 px-4 py-2 text-white shadow hover:bg-blue-500">
            <RotateCcw className="h-4 w-4" /> Restart
          </button>
          <button onClick={saveAndExit} className="rounded-full bg-white/10 px-4 py-2 text-white ring-1 ring-white/20 hover:bg-white/20">Save & Exit</button>
        </div>
      </div>

      <div className="relative grid grid-cols-1 gap-6 rounded-2xl bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-black/40 p-6 text-white ring-1 ring-white/10">
        <div className="mx-auto h-40 w-40">
          <svg className="h-full w-full" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" stroke="#3b82f6" strokeWidth="12" fill="none" opacity="0.2" />
            <circle
              cx="70"
              cy="70"
              r="60"
              stroke="#facc15"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="28" fontWeight="700">
              {time}s
            </text>
          </svg>
        </div>

        <div className="mx-auto max-w-xl text-center">
          <p className="mb-3 text-sm uppercase tracking-widest text-white/70">Challenge</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl font-semibold"
            >
              {current?.prompt}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={handleWin} disabled={!running} className="inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 font-semibold text-black shadow hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60">
            <CheckCircle2 className="h-5 w-5" /> I did it!
          </button>
          <button onClick={skipChallenge} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 font-semibold text-white ring-1 ring-white/20 hover:bg-white/20">
            <SkipForward className="h-5 w-5" /> Skip
          </button>
          {!running && (
            <button onClick={nextChallenge} className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-3 font-semibold text-black shadow hover:bg-yellow-300">
              Next
            </button>
          )}
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white/10 p-4 text-center backdrop-blur ring-1 ring-white/20"
            >
              <div className="text-3xl">
                {result === 'win' ? '🎉 You did it!' : '⏱️ Time\'s up!'}
              </div>
              <div className="mt-2 text-white/80">{result === 'win' ? '+10 points' : 'No points this round'}</div>
              {result === 'win' && (
                <div className="pointer-events-none absolute inset-0">
                  {[...Array(16)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1, y: -120 - Math.random() * 120, x: (Math.random() - 0.5) * 200, rotate: Math.random() * 360 }}
                      transition={{ duration: 1.2, delay: i * 0.03 }}
                      className="absolute left-1/2 top-1/2"
                    >
                      {['🎊', '🎉', '✨', '🌟', '💥'][i % 5]}
                    </motion.span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
