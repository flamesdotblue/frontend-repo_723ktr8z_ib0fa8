export default function AboutSection({ onBack }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-white">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-extrabold">About</h2>
        <button onClick={onBack} className="rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/20 hover:bg-white/20">Back</button>
      </div>

      <div className="space-y-4 rounded-2xl bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-black/40 p-6 ring-1 ring-white/10">
        <p className="text-lg font-semibold">QuickMind – 30 Second Challenge</p>
        <p>
          A fun single-player web app that gives you random short challenges to complete in 30 seconds—quizzes, word tasks, funny dares, and more.
          The goal is to test your speed, creativity, and knowledge while keeping it light and enjoyable.
        </p>
        <p>
          Made with ❤️ by <span className="font-semibold">Pallavi Miriyala</span>.
        </p>
        <div className="rounded-xl bg-white/10 p-4 text-sm text-white/80 ring-1 ring-white/10">
          Tips:
          <ul className="list-inside list-disc space-y-1">
            <li>Earn 10 points for each challenge you complete in time.</li>
            <li>Use the I did it! button to claim a win, or Skip to try another.</li>
            <li>Top 5 scores are saved on your device.</li>
            <li>Turn on sound for beeps and celebration tones.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
