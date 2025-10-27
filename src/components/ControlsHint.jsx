import { Keyboard, Zap } from 'lucide-react';

export default function ControlsHint() {
  return (
    <div className="mx-auto mt-4 w-full max-w-xl rounded-xl bg-white/10 p-3 text-sm text-white/80 backdrop-blur ring-1 ring-white/10">
      <div className="mb-2 flex items-center gap-2 font-semibold text-white">
        <Keyboard className="h-4 w-4" /> Quick Controls
      </div>
      <div className="grid grid-cols-2 gap-2">
        <HintItem k="Space" label="I did it!" />
        <HintItem k="S" label="Skip" />
        <HintItem k="N" label="Next" />
        <HintItem k="R" label="Restart" />
        <HintItem k="M" label="Sound On/Off" />
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <Zap className="h-3 w-3" /> Pro tip: Be quick near 0s—the beeps mean crunch time!
      </div>
    </div>
  );
}

function HintItem({ k, label }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10">
      <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs text-white">{k}</span>
      <span className="text-white/90">{label}</span>
    </div>
  );
}
