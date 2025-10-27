import { useEffect, useMemo, useState } from 'react';
import { Trophy, Trash2 } from 'lucide-react';

export default function LeaderboardPanel({ onBack }) {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('qm_scores') || '[]');
    setScores(s);
  }, []);

  const best = useMemo(() => scores[0]?.score ?? 0, [scores]);

  const reset = () => {
    localStorage.removeItem('qm_scores');
    setScores([]);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-7 w-7 text-yellow-400" />
          <h2 className="text-3xl font-extrabold">Leaderboard</h2>
        </div>
        <button onClick={onBack} className="rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/20 hover:bg-white/20">Back</button>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-black/40 p-6 ring-1 ring-white/10">
        {scores.length === 0 ? (
          <p className="text-white/80">No scores yet. Be the first to play!</p>
        ) : (
          <ul className="space-y-3">
            {scores.map((s, i) => (
              <li key={i} className="flex items-center justify-between rounded-xl bg-white/10 p-3 ring-1 ring-white/10">
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${i === 0 ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white'}`}>{i + 1}</div>
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-white/70">{new Date(s.date).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-xl font-extrabold">{s.score} pts</div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex items-center justify-between">
          <div className="text-white/70">Best Score: <span className="font-bold text-white">{best}</span></div>
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-full bg-red-600/80 px-4 py-2 text-white shadow hover:bg-red-500">
            <Trash2 className="h-4 w-4" /> Reset Scores
          </button>
        </div>
      </div>
    </div>
  );
}
