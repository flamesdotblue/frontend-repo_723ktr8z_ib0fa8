import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, Volume2, RotateCcw, Sparkles } from 'lucide-react';
import ControlsHint from './ControlsHint';

// Multiple-choice questions with options and the index of the correct option
const QUESTIONS = [
  {
    type: 'quiz',
    prompt: 'Which is heavier: 1 kg of cotton or 1 kg of iron?',
    options: ['1 kg cotton', '1 kg iron', 'Both weigh the same', 'Depends on volume'],
    answer: 2,
  },
  {
    type: 'quiz',
    prompt: 'If a plane crashes on the border of two countries, where do they bury the survivors?',
    options: ['In country A', 'In country B', 'Nowhere, you don\'t bury survivors', 'At sea'],
    answer: 2,
  },
  {
    type: 'puzzle',
    prompt: 'Riddle: What has keys but can’t open locks?',
    options: ['Map', 'Keyboard', 'Piano', 'Calculator'],
    answer: 2, // Piano
  },
  {
    type: 'puzzle',
    prompt: 'Pattern: What comes next? 2, 4, 8, 16, __',
    options: ['18', '20', '24', '32'],
    answer: 3,
  },
  {
    type: 'memory',
    prompt: 'Remember: 7, 3, 1, 9 — Which number was second?',
    options: ['7', '3', '1', '9'],
    answer: 1,
  },
  {
    type: 'memory',
    prompt: 'Sequence: Banana, Rocket, Cloud — What was first?',
    options: ['Banana', 'Rocket', 'Cloud', 'None'],
    answer: 0,
  },
  {
    type: 'word',
    prompt: 'Which of these is NOT a fruit?',
    options: ['Mango', 'Tomato', 'Cucumber', 'Banana'],
    answer: 2,
  },
  {
    type: 'word',
    prompt: 'Pick the odd one out',
    options: ['Square', 'Triangle', 'Circle', 'Cube'],
    answer: 3,
  },
  {
    type: 'dare',
    prompt: 'Quick pick: Which emoji best represents "victory"?',
    options: ['🎉', '🏆', '😜', '🌧️'],
    answer: 1,
  },
  {
    type: 'quiz',
    prompt: 'How many seconds are in half a minute?',
    options: ['15', '20', '30', '60'],
    answer: 2,
  },
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
  const [currentIndex, setCurrentIndex] = useState(null);
  const [result, setResult] = useState(null); // 'win' | 'lose' | null
  const [soundOn, setSoundOn] = useState(true);
  const [used, setUsed] = useState(new Set());
  const [selected, setSelected] = useState(null);

  const { success, tick, buzzer } = useBeep();

  const pickQuestion = useCallback(() => {
    // Choose a random unused question; if all used, reset the set
    setUsed((prev) => {
      let available = [];
      for (let i = 0; i < QUESTIONS.length; i++) {
        if (!prev.has(i)) available.push(i);
      }
      let nextSet = new Set(prev);
      if (available.length === 0) {
        // reset to allow fresh cycle
        nextSet = new Set();
        available = QUESTIONS.map((_, i) => i);
      }
      const idx = available[Math.floor(Math.random() * available.length)];
      nextSet.add(idx);
      setCurrentIndex(idx);
      return nextSet;
    });
  }, []);

  const restartTimer = useCallback(() => {
    setTime(30);
    setRunning(true);
    setResult(null);
    setSelected(null);
  }, []);

  const startRound = useCallback(() => {
    pickQuestion();
    restartTimer();
  }, [pickQuestion, restartTimer]);

  useEffect(() => {
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

  // Keyboard shortcuts for fast interaction
  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      if (k === 's') {
        skipQuestion();
      } else if (k === 'n') {
        if (!running) startRound();
      } else if (k === 'r') {
        resetGame();
      } else if (k === 'm') {
        setSoundOn((s) => !s);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, startRound]);

  const handleSelect = (i) => {
    if (!running) return;
    setSelected(i);
    const q = QUESTIONS[currentIndex];
    const correct = i === q.answer;
    setRunning(false);
    if (correct) {
      setScore((s) => s + 10);
      setResult('win');
      soundOn && success();
    } else {
      setResult('lose');
      soundOn && buzzer();
    }
  };

  const skipQuestion = () => {
    pickQuestion();
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
    setUsed(new Set());
    startRound();
  };

  const q = currentIndex != null ? QUESTIONS[currentIndex] : null;

  const progress = useMemo(() => time / 30, [time]);
  const circumference = 2 * Math.PI * 60;
  const dashoffset = circumference * (1 - progress);

  const timeColor = time <= 5 ? '#ef4444' : '#facc15';

  const reaction = useMemo(() => {
    switch (q?.type) {
      case 'quiz':
        return '🧠';
      case 'word':
        return '🔤';
      case 'puzzle':
        return '🧩';
      case 'dare':
        return '😜';
      case 'memory':
        return '🧬';
      default:
        return '🎮';
    }
  }, [q]);

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
          <button onClick={() => saveAndExit()} className="rounded-full bg-white/10 px-4 py-2 text-white ring-1 ring-white/20 hover:bg-white/20">Save & Exit</button>
        </div>
      </div>

      <div className="relative grid grid-cols-1 gap-6 rounded-2xl bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-black/40 p-6 text-white ring-1 ring-white/10">
        <div className="mx-auto h-40 w-40">
          <motion.svg
            className="h-full w-full"
            viewBox="0 0 140 140"
            animate={time <= 5 ? { scale: [1, 1.05, 1], rotate: [0, -1.5, 1.5, 0] } : {}}
            transition={{ duration: 0.9, repeat: time <= 5 ? Infinity : 0, ease: 'easeInOut' }}
          >
            <circle cx="70" cy="70" r="60" stroke="#3b82f6" strokeWidth="12" fill="none" opacity="0.2" />
            <circle
              cx="70"
              cy="70"
              r="60"
              stroke={timeColor}
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.2s ease' }}
            />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="28" fontWeight="700">
              {time}s
            </text>
          </motion.svg>
        </div>

        <div className="mx-auto max-w-xl text-center">
          <p className="mb-3 text-sm uppercase tracking-widest text-white/70">Challenge</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-2xl font-semibold"
            >
              <span className="mr-2 text-2xl">{reaction}</span>
              {q?.prompt}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          {q?.options.map((opt, i) => {
            const isCorrect = i === q.answer;
            const chosenWrong = selected === i && selected !== q.answer && !running;
            const chosenRight = selected === i && isCorrect && !running;
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={!running}
                className={`rounded-xl px-4 py-3 text-left font-medium ring-1 transition ${
                  !running
                    ? chosenRight
                      ? 'bg-green-400 text-black ring-green-300'
                      : chosenWrong
                        ? 'bg-red-500 text-white ring-red-400'
                        : 'bg-white/10 text-white ring-white/10'
                    : 'bg-white/10 text-white hover:bg-white/20 ring-white/20'
                }`}
              >
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={skipQuestion} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 font-semibold text-white ring-1 ring-white/20 hover:bg-white/20">
            <SkipForward className="h-5 w-5" /> Skip
          </button>
          {!running && (
            <button onClick={startRound} className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-3 font-semibold text-black shadow hover:bg-yellow-300">
              <Sparkles className="h-5 w-5" /> Next
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
                {result === 'win' ? '🎉 Correct!' : "❌ That's not it"}
              </div>
              <div className="mt-2 text-white/80">{result === 'win' ? '+10 points' : 'No points this round'}</div>
              {result === 'win' && (
                <div className="pointer-events-none absolute inset-0">
                  {[...Array(20)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1, y: -120 - Math.random() * 140, x: (Math.random() - 0.5) * 220, rotate: Math.random() * 360 }}
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
        <ControlsHint />
      </div>
    </div>
  );
}
