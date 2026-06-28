import type { Quiz } from "@/lib/quizzes";
import QuizCard from "./QuizCard";

export default function QuizGrid({ quizzes }: { quizzes: Quiz[] }) {
  if (quizzes.length === 0) {
    return (
      <div className="rounded-2xl border-4 border-dashed border-ink/20 p-10 text-center font-bold text-ink/50">
        No quizzes here yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
  );
}
