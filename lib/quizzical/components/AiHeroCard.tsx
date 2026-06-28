import Link from "next/link";
import Button3D from "./Button3D";
import { AiIllustration } from "./Illustrations";
import { SparkleIcon } from "./icons";

const EXAMPLES = ["Greek mythology", "90s pop music", "The solar system", "World War II"];

const FEATURES = [
  { emoji: "📄", label: "Paste text or upload a PDF" },
  { emoji: "⚡", label: "10 questions in seconds" },
  { emoji: "🎯", label: "Play instantly — no sign-up" },
];

export default function AiHeroCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex flex-col gap-3 overflow-hidden rounded-3xl border-4 border-ink bg-white p-5 shadow-[0_6px_0_0_#0d0d0d] md:p-6 ${className}`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky/40 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-grass/20 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-[3px] border-ink bg-petrol shadow-[0_3px_0_0_#0d0d0d]">
            <SparkleIcon className="h-5 w-5 text-sky" />
          </span>
          <div>
            <h2 className="font-display text-lg font-extrabold leading-none text-ink md:text-xl">
              AI Quiz Generator
            </h2>
            <p className="mt-0.5 text-xs font-bold text-ink/55">
              Turn any topic or PDF into a quiz
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border-2 border-ink bg-lime px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink">
          New
        </span>
      </div>

      <Link
        href="/ai"
        className="relative flex items-center gap-2 rounded-2xl border-[3px] border-ink bg-cream px-3.5 py-2.5 transition-colors hover:bg-cream-dark"
      >
        <SparkleIcon className="h-4 w-4 shrink-0 text-petrol" />
        <span className="text-sm font-bold text-ink/45">Make a quiz about…</span>
        <span className="-ml-1 inline-block h-4 w-0.5 animate-quiz-blink bg-ink/60" />
      </Link>

      <div className="flex flex-wrap gap-1.5">
        {EXAMPLES.map((topic) => (
          <Link
            key={topic}
            href="/ai"
            className="rounded-full border-2 border-ink/15 bg-white px-2.5 py-0.5 text-[11px] font-extrabold text-ink/70 transition-colors hover:border-ink hover:text-ink"
          >
            {topic}
          </Link>
        ))}
      </div>

      {/* Sample output preview */}
      <div className="rounded-2xl border-2 border-ink/15 bg-cream/60 p-3">
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink/40">
          Sample output
        </p>
        <p className="mt-1 text-sm font-extrabold leading-snug text-ink">
          Which planet is known as the Red Planet?
        </p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {[
            { label: "Mars", color: "#ff6b6b" },
            { label: "Venus", color: "#4d8dff" },
            { label: "Jupiter", color: "#ffc24b" },
            { label: "Saturn", color: "#00a76d" },
          ].map((opt) => (
            <span
              key={opt.label}
              className="rounded-lg border-2 border-ink/10 px-2 py-1 text-[11px] font-extrabold text-ink/75"
              style={{ backgroundColor: `${opt.color}22` }}
            >
              {opt.label}
            </span>
          ))}
        </div>
      </div>

      <ul className="space-y-1">
        {FEATURES.map((f) => (
          <li
            key={f.label}
            className="flex items-center gap-2 text-xs font-bold text-ink/60"
          >
            <span aria-hidden>{f.emoji}</span>
            {f.label}
          </li>
        ))}
      </ul>

      <div className="flex items-end justify-between gap-3 pt-0.5">
        <Button3D href="/ai" variant="sky" size="md">
          <SparkleIcon className="h-4 w-4" /> Generate a quiz
        </Button3D>
        <div className="hidden shrink-0 sm:block" aria-hidden>
          <AiIllustration className="animate-quiz-float h-16 w-16" />
        </div>
      </div>
    </div>
  );
}
