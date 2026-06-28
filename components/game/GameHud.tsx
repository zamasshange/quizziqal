"use client";

type Props = {
  title: string;
  index: number;
  total: number;
  timeLeft: number;
  timerSeconds: number;
  score: number;
  paused: boolean;
  canGoBack: boolean;
  showNav: boolean;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

export default function GameHud({
  title,
  index,
  total,
  timeLeft,
  timerSeconds,
  score,
  paused,
  canGoBack,
  showNav,
  onPause,
  onPrevious,
  onNext,
}: Props) {
  const lowTime = timeLeft <= Math.max(3, Math.floor(timerSeconds * 0.25));

  return (
    <div className="bg-[var(--kahoot-purple)] text-white">
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={onPause}
          className="flex h-9 shrink-0 items-center rounded-full bg-white/15 px-3 text-xs font-bold"
        >
          {paused ? "▶" : "⏸"}
        </button>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</span>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold tabular-nums ${
            lowTime ? "bg-[var(--kahoot-red)]" : "bg-white/20"
          }`}
        >
          {timeLeft}
        </span>
        <span className="shrink-0 text-sm font-bold text-yellow-300 tabular-nums">
          {score}
        </span>
      </div>

      <div className="flex items-center gap-1 px-3 pb-2">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < index ? "bg-[var(--kahoot-green)]" : i === index ? "bg-yellow-300" : "bg-white/25"
            }`}
          />
        ))}
      </div>

      {showNav && (
        <div className="flex gap-2 border-t border-white/10 px-3 py-2">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={onPrevious}
            className="flex-1 rounded-lg bg-white/10 py-2 text-xs font-bold disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="flex items-center px-2 text-xs font-semibold text-white/70">
            {index + 1} / {total}
          </span>
          <button
            type="button"
            onClick={onNext}
            className="flex-1 rounded-lg bg-white/15 py-2 text-xs font-bold"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
