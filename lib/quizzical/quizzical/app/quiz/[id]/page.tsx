import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import Button3D from "@/components/Button3D";
import { getCategory, getQuiz, quizzes } from "@/lib/quizzes";
import { FLAGS_PER_ROUND, isFlagsQuiz } from "@/lib/flagQuiz";
import { COUNTRY_COUNT } from "@/lib/allCountries";
import JsonLd from "@/components/JsonLd";
import { quizMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, quizJsonLd } from "@/lib/seoStructuredData";

export function generateStaticParams() {
  return quizzes.map((quiz) => ({ id: quiz.id }));
}

export async function generateMetadata(
  props: PageProps<"/quiz/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const quiz = getQuiz(id);
  if (!quiz) return { title: "Quiz not found" };
  return quizMetadata(quiz);
}

export default async function QuizOverviewPage(
  props: PageProps<"/quiz/[id]">,
) {
  const { id } = await props.params;
  const quiz = getQuiz(id);

  if (!quiz) {
    notFound();
  }

  const category = getCategory(quiz.category);
  const questionCount = isFlagsQuiz(quiz.id)
    ? FLAGS_PER_ROUND
    : quiz.questions.length;
  const poolNote = isFlagsQuiz(quiz.id)
    ? `${COUNTRY_COUNT} countries in the pool`
    : null;

  return (
    <SiteShell>
      <JsonLd
        data={[
          quizJsonLd(quiz, category?.name),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            ...(category
              ? [{ name: category.name, path: `/${category.slug}` }]
              : []),
            { name: quiz.title, path: `/quiz/${quiz.id}` },
          ]),
        ]}
      />
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-3xl border-4 border-ink bg-white shadow-[0_6px_0_0_#0d0d0d]">
          <div
            className="flex flex-col items-center justify-center gap-3 p-10 text-center"
            style={{ backgroundColor: quiz.color }}
          >
            <span className="text-7xl">{quiz.emoji}</span>
            <h1 className="font-display text-4xl font-extrabold leading-none text-ink">
              {quiz.title}
            </h1>
            {category && (
              <span className="rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wide">
                {category.name}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-6 p-6 md:p-8">
            <p className="max-w-md text-center text-lg font-semibold text-ink/70">
              {quiz.description}
            </p>

            <div className="flex items-center gap-6 font-bold text-ink/60">
              <div className="text-center">
                <div className="font-display text-2xl text-ink">
                  {questionCount}
                </div>
                <div className="text-xs uppercase tracking-wide">Questions</div>
              </div>
              {poolNote && (
                <>
                  <div className="h-8 w-px bg-ink/20" />
                  <div className="text-center">
                    <div className="font-display text-2xl text-ink">
                      {COUNTRY_COUNT}
                    </div>
                    <div className="text-xs uppercase tracking-wide">Countries</div>
                  </div>
                </>
              )}
              <div className="h-8 w-px bg-ink/20" />
              <div className="text-center">
                <div className="font-display text-2xl text-ink">
                  {quiz.plays.toLocaleString()}
                </div>
                <div className="text-xs uppercase tracking-wide">Plays</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button3D href={`/quiz/${quiz.id}/play`} variant="grass" size="lg">
                ▶ Play
              </Button3D>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
