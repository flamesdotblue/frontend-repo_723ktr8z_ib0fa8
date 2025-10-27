import { useEffect, useMemo, useState } from 'react';
import HeroSection from './components/HeroSection';
import GameBoard from './components/GameBoard';
import LeaderboardPanel from './components/LeaderboardPanel';
import AboutSection from './components/AboutSection';

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'game' | 'leaderboard' | 'about'
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const scores = JSON.parse(localStorage.getItem('qm_scores') || '[]');
    if (scores.length) {
      setHighScore(scores[0].score);
    } else {
      setHighScore(0);
    }
  }, [view]);

  const handleSaveScore = (score) => {
    // After saving in GameBoard, refresh local high score
    const scores = JSON.parse(localStorage.getItem('qm_scores') || '[]');
    if (scores.length) setHighScore(scores[0].score);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-blue-950 to-purple-950">
      {view === 'home' && (
        <HeroSection
          highScore={highScore}
          onStart={() => setView('game')}
          onLeaderboard={() => setView('leaderboard')}
          onAbout={() => setView('about')}
        />
      )}

      {view === 'game' && (
        <GameBoard onExit={() => setView('home')} onSaveScore={handleSaveScore} />)
      }

      {view === 'leaderboard' && (
        <LeaderboardPanel onBack={() => setView('home')} />
      )}

      {view === 'about' && (
        <AboutSection onBack={() => setView('home')} />
      )}

      <footer className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-white/60">
        Made with ❤️ by Pallavi Miriyala
      </footer>
    </div>
  );
}
