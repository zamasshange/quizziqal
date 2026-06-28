import Link from "next/link";
import type { Quiz } from "@/lib/quizzes";
import QuizCard from "./QuizCard";

type Props = {
  title: string;
  quizzes: Quiz[];
  seeAllHref?: string;
  seeAllCount?: number;
};

export default function QuizRow({
  title,
  quizzes,
  seeAllHref,
  seeAllCount,
}: Props) {
  if (quizzes.length === 0) return null;

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-baseline gap-2">
        <h2 className="text-2xl font-black text-ink">{title}</h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-sm font-extrabold text-answer2 hover:underline"
          >
            See all{seeAllCount !== undefined ? ` (${seeAllCount})` : ""}
          </Link>
        )}
      </div>
      <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-3 [scrollbar-width:thin]">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="w-48 shrink-0 snap-start sm:w-56 md:w-64"
          >
            <QuizCard quiz={quiz} />
          </div>
        ))}
      </div>
    </section>
  );
}
