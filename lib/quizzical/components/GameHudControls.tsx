"use client";

type Props = {
  paused: boolean;
  onTogglePause: () => void;
  disabled?: boolean;
};

export default function GameHudControls({
  paused,
  onTogglePause,
  disabled = false,
}: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onTogglePause}
      aria-label={paused ? "Resume game" : "Pause game"}
      className="flex h-9 shrink-0 items-center gap-1 rounded-full border-2 border-ink/15 px-3 text-sm font-extrabold text-ink/70 transition-colors hover:border-ink hover:text-ink disabled:opacity-40"
    >
      {paused ? "▶" : "⏸"}
      <span className="hidden sm:inline">{paused ? "Play" : "Pause"}</span>
    </button>
  );
}
