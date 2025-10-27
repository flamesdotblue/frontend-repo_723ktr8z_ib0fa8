import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Trophy, Info } from 'lucide-react';
import Spline from '@splinetool/react-spline';

export default function HeroSection({ onStart, onLeaderboard, onAbout, highScore }) {
  const titleVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }), []);

  useEffect(() => {
    // no-op: reserved for future hero effects
  }, []);

  return (
    <section className="relative min-h-[80vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/OIGfFUmCnZ3VD8gH/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-purple-900/50 via-blue-900/40 to-black/80" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center justify-center gap-6 px-6 py-24 text-center text-white">
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
          className="max-w-2xl text-lg text-white/90"
        >
          Test your speed, creativity, and knowledge with fast, fun challenges. You’ve got 30 seconds—go!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.35 } }}
          className="mt-4 flex flex-wrap items-center justify-center gap-3"
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
          className="mt-6 rounded-2xl bg-white/10 p-4 text-white/90 backdrop-blur"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <p className="text-sm uppercase tracking-wide text-white/70">High Score</p>
              <p className="text-2xl font-bold">{highScore ?? 0} pts</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
