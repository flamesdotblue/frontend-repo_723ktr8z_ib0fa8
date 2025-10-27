import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Rocket, Trophy, Info } from 'lucide-react';
import Spline from '@splinetool/react-spline';

export default function HeroSection({ onStart, onLeaderboard, onAbout, highScore }) {
  const titleVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }), []);

  // Parallax for content on mouse move
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [ -50, 50 ], [ 8, -8 ]);
  const rotateY = useTransform(x, [ -50, 50 ], [ -8, 8 ]);
  const containerRef = useRef(null);

  const onMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(Math.max(-50, Math.min(50, dx / 10)));
    y.set(Math.max(-50, Math.min(50, dy / 10)));
  };

  return (
    <section ref={containerRef} onMouseMove={onMouseMove} className="relative w-full overflow-hidden">
      <div className="relative mx-auto grid min-h-[86vh] max-w-6xl grid-cols-1 items-center gap-8 px-6 py-14 text-white md:grid-cols-2">
        <div className="absolute inset-0">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-purple-900/40 via-blue-900/40 to-black/80" />
        </div>

        <motion.div
          style={{ rotateX, rotateY }}
          className="relative z-10 order-2 md:order-1"
        >
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={titleVariants}
            className="text-4xl font-extrabold tracking-tight drop-shadow-md sm:text-6xl"
            style={{ fontFamily: 'Poppins, Fredoka One, ui-sans-serif, system-ui' }}
          >
            QuickMind – 30 Second Challenge
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            className="mt-3 max-w-xl text-lg text-white/90"
          >
            Speed, creativity, and knowledge—can you beat the clock? Dive into fast, fun mini challenges.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1, transition: { delay: 0.35 } }}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <button onClick={onStart} className="group inline-flex items-center gap-2 rounded-full bg-yellow-400 px-6 py-3 font-semibold text-black shadow-lg transition hover:scale-105 hover:bg-yellow-300">
              <Rocket className="h-5 w-5 transition-transform group-hover:-rotate-12" />
              Start Game
            </button>
            <button onClick={onLeaderboard} className="inline-flex items-center gap-2 rounded-full bg-purple-600/90 px-5 py-3 font-semibold text-white shadow-lg ring-1 ring-white/10 transition hover:scale-105 hover:bg-purple-500/90">
              <Trophy className="h-5 w-5" />
              Leaderboard
            </button>
            <button onClick={onAbout} className="inline-flex items-center gap-2 rounded-full bg-blue-600/90 px-5 py-3 font-semibold text-white shadow-lg ring-1 ring-white/10 transition hover:scale-105 hover:bg-blue-500/90">
              <Info className="h-5 w-5" />
              About
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
            className="mt-6 flex w-full flex-wrap items-center gap-4"
          >
            <div className="rounded-2xl bg-white/10 p-4 text-white/90 backdrop-blur ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/70">High Score</p>
                  <p className="text-2xl font-bold">{highScore ?? 0} pts</p>
                </div>
              </div>
            </div>
            <CountdownPreview />
          </motion.div>
        </motion.div>

        <div className="relative z-0 order-1 aspect-square w-full md:order-2">
          <Spline scene="https://prod.spline.design/wwTRdG1D9CkNs368/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </section>
  );
}

function CountdownPreview() {
  const [t, setT] = useState(5);
  useEffect(() => {
    const id = setInterval(() => setT((v) => (v <= 1 ? 5 : v - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const circumference = 2 * Math.PI * 18;
  const progress = t / 5;
  const dashoffset = circumference * (1 - progress);
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 backdrop-blur ring-1 ring-white/10">
      <svg className="h-12 w-12" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="18" stroke="#3b82f6" strokeWidth="6" fill="none" opacity="0.25" />
        <circle cx="24" cy="24" r="18" stroke="#facc15" strokeWidth="6" fill="none" strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="12" fontWeight="700">{t}s</text>
      </svg>
      <div className="text-sm text-white/80">30s rounds • Beeps near 0 • +10 per win</div>
    </div>
  );
}
