import Link from "next/link";
import { getCategory, type Quiz, type Badge } from "@/lib/quizzes";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-xs font-extrabold text-ink/70">
      {rating.toFixed(1)}
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#ff9f43">
        <path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.8 6.1 20.8l1.2-6.6L2.5 9l6.6-.9z" />
      </svg>
    </span>
  );
}

function BadgePill({ badge }: { badge: Badge }) {
  const map: Record<Badge, { label: string; className: string }> = {
    AI: { label: "AI GENERATED", className: "bg-grass text-white" },
    HARD: { label: "HARD", className: "bg-ink text-white" },
    EASY: { label: "EASY", className: "bg-answer3 text-ink" },
    PLAYED: { label: "✓ Played", className: "bg-ink text-white" },
  };
  const { label, className } = map[badge];
  return (
    <span
      className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${className}`}
    >
      {label}
    </span>
  );
}

export default function QuizCard({ quiz }: { quiz: Quiz }) {
  const tag = getCategory(quiz.category)?.tag ?? "Trivia quiz";
  return (
    <Link href={`/quiz/${quiz.id}`} className="group flex flex-col">
      <div
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border-[3px] border-ink shadow-[0_4px_0_0_#0d0d0d] transition-all duration-100 group-hover:-translate-y-1 group-hover:shadow-[0_7px_0_0_#0d0d0d]"
        style={{ backgroundColor: quiz.color }}
      >
        <span className="text-6xl drop-shadow-sm md:text-7xl">{quiz.emoji}</span>
        {quiz.badge && <BadgePill badge={quiz.badge} />}
      </div>
      <div className="flex flex-col gap-0.5 pt-2.5">
        <h3 className="line-clamp-2 text-base font-extrabold leading-tight text-ink">
          {quiz.title}
        </h3>
        <div className="flex items-center gap-2">
          <Stars rating={quiz.rating} />
          <span className="truncate text-xs font-extrabold uppercase tracking-wide text-ink/45">
            {tag}
          </span>
        </div>
      </div>
    </Link>
  );
}
