import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import QuizPlayer from "@/components/QuizPlayer";
import UnlockGate from "@/components/progression/UnlockGate";
import { getQuiz, quizzes } from "@/lib/quizzes";
import { isFlagsQuiz } from "@/lib/flagQuiz";
import { prefetchQuestionImages } from "@/lib/prefetchQuizImages";
import { quizPlayMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return quizzes.map((quiz) => ({ id: quiz.id }));
}

export async function generateMetadata(
  props: PageProps<"/quiz/[id]/play">,
): Promise<Metadata> {
  const { id } = await props.params;
  const quiz = getQuiz(id);
  if (!quiz) return { title: "Quiz not found" };
  return quizPlayMetadata(quiz);
}

export default async function PlayPage(props: PageProps<"/quiz/[id]/play">) {
  const { id } = await props.params;
  const quiz = getQuiz(id);

  if (!quiz) {
    notFound();
  }

  const prefetchedImages = isFlagsQuiz(quiz.id)
    ? {}
    : await prefetchQuestionImages(quiz);

  return (
    <SiteShell showCategories={false} showFooter={false}>
      <div className="pt-4">
        <UnlockGate href={`/quiz/${quiz.id}`}>
          <QuizPlayer quiz={quiz} prefetchedImages={prefetchedImages} />
        </UnlockGate>
      </div>
    </SiteShell>
  );
}
