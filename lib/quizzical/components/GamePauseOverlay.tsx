"use client";

type Props = {
  onResume: () => void;
  onQuit: () => void;
};

export default function GamePauseOverlay({ onResume, onQuit }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
      <div
        className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border-4 border-ink bg-white p-8 text-center shadow-[0_8px_0_0_#0d0d0d]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
      >
        <span className="text-5xl" aria-hidden>
          ⏸️
        </span>
        <div>
          <h2 id="pause-title" className="font-display text-2xl font-extrabold">
            Game paused
          </h2>
          <p className="mt-1 text-sm font-semibold text-ink/60">
            Take a breather — your progress is saved automatically.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={onResume}
            className="w-full rounded-full border-4 border-ink bg-grass py-3 font-extrabold text-white shadow-[0_4px_0_0_#0d0d0d] transition-transform hover:-translate-y-0.5"
          >
            ▶ Resume
          </button>
          <button
            type="button"
            onClick={onQuit}
            className="w-full rounded-full border-4 border-ink/20 py-3 font-extrabold text-ink/60 transition-colors hover:border-ink hover:text-ink"
          >
            Save &amp; quit
          </button>
        </div>
      </div>
    </div>
  );
}
