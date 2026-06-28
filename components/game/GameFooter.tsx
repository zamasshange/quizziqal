"use client";

type Props = {
  index: number;
  total: number;
  canGoBack: boolean;
  primaryLabel: string;
  onPrevious: () => void;
  onPrimary: () => void;
  variant?: "light" | "dark";
};

export default function GameFooter({
  canGoBack,
  primaryLabel,
  onPrevious,
  onPrimary,
  variant = "light",
}: Props) {
  const dark = variant === "dark";

  return (
    <footer
      className={`shrink-0 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${
        dark
          ? "border-t border-white/15 bg-black/15"
          : "border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      }`}
    >
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canGoBack}
          onClick={onPrevious}
          className={`game-pill flex-1 rounded-xl py-3 text-sm font-extrabold disabled:opacity-40 ${
            dark
              ? "border-white/20 bg-white/10 text-white"
              : "border-gray-200 bg-gray-50 text-gray-600"
          }`}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onPrimary}
          className="game-pill flex-[2] rounded-xl bg-[var(--kahoot-green)] py-3 text-sm font-extrabold text-white shadow-[0_4px_0_#1a5c08]"
        >
          {primaryLabel}
        </button>
      </div>
    </footer>
  );
}
