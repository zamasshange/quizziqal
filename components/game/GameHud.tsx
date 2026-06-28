"use client";

type Props = {
  index: number;
  total: number;
  timeLeft: number;
  timerSeconds: number;
  score: number;
  paused: boolean;
  phase: "playing" | "reveal";
  onPause: () => void;
};

export default function GameHud({
  index,
  total,
  timeLeft,
  timerSeconds,
  score,
  paused,
  phase,
  onPause,
}: Props) {
  const lowTime = timeLeft <= Math.max(3, Math.floor(timerSeconds * 0.25));
  const timerFrac = Math.max(0, timeLeft / timerSeconds);

  return (
    <header className="shrink-0 bg-[var(--kahoot-purple)] text-white shadow-lg lg:border-b-4 lg:border-[#2a0a5e]">
      <div className="flex items-center gap-2 px-3 py-2.5 lg:mx-auto lg:max-w-7xl lg:px-5 lg:py-3">
        <a
          href="/discover"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/25 bg-white/10 text-sm font-bold"
        >
          ✕
        </a>
        <button
          type="button"
          onClick={onPause}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/25 bg-white/10 text-sm font-bold"
        >
          {paused ? "▶" : "⏸"}
        </button>

        <div className="flex flex-1 items-center gap-1 px-1">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                i < index
                  ? "bg-[var(--kahoot-green)]"
                  : i === index
                    ? "bg-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.6)]"
                    : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {phase === "playing" && (
          <div className="relative h-11 w-11 shrink-0">
            <svg viewBox="0 0 44 44" className="h-full w-full -rotate-90">
              <circle cx="22" cy="22" r="18" fill="rgba(255,255,255,0.15)" />
              <circle
                cx="22"
                cy="22"
                r="18"
                fill="none"
                stroke={lowTime ? "var(--kahoot-red)" : "#fde047"}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 18}
                strokeDashoffset={2 * Math.PI * 18 * (1 - timerFrac)}
                className="transition-all duration-300"
              />
            </svg>
            <span
              className={`absolute inset-0 flex items-center justify-center text-sm font-extrabold tabular-nums ${
                lowTime ? "text-red-200" : ""
              }`}
            >
              {timeLeft}
            </span>
          </div>
        )}

        <div className="shrink-0 rounded-full border-2 border-yellow-300/50 bg-black/20 px-3 py-1">
          <span className="text-sm font-extrabold text-yellow-300 tabular-nums">
            {score.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="border-t border-white/10 px-3 py-1.5 text-center text-xs font-bold text-white/60">
        Question {index + 1} of {total}
      </div>
    </header>
  );
}
