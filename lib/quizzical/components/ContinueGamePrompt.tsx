"use client";

type Props = {
  title: string;
  emoji: string;
  progress: string;
  onContinue: () => void;
  onFresh: () => void;
};

export default function ContinueGamePrompt({
  title,
  emoji,
  progress,
  onContinue,
  onFresh,
}: Props) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-3xl border-4 border-ink bg-white p-8 text-center shadow-[0_6px_0_0_#0d0d0d]">
      <span className="text-5xl">{emoji}</span>
      <div>
        <h2 className="font-display text-xl font-extrabold">Continue playing?</h2>
        <p className="mt-1 font-bold text-ink">{title}</p>
        <p className="mt-1 text-sm font-semibold text-ink/55">{progress}</p>
      </div>
      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={onContinue}
          className="rounded-full border-4 border-ink bg-grass py-3 font-extrabold text-white shadow-[0_4px_0_0_#0d0d0d]"
        >
          ▶ Continue
        </button>
        <button
          type="button"
          onClick={onFresh}
          className="rounded-full border-4 border-ink/20 py-3 font-extrabold text-ink/60 hover:border-ink hover:text-ink"
        >
          Start fresh
        </button>
      </div>
    </div>
  );
}
