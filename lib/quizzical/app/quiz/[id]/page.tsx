import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import Button3D from "@/components/Button3D";
import { getCategory, getQuiz, quizzes } from "@/lib/quizzes";
import { getQuizProfile } from "@/lib/quizProfiles";
import { isFlagsQuiz } from "@/lib/flagQuiz";
import { QUESTION_COUNT_RANGE_LABEL } from "@/lib/quizRoundSettings";
import { COUNTRY_COUNT } from "@/lib/allCountries";
import JsonLd from "@/components/JsonLd";
import { quizMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, quizFaqJsonLd, quizJsonLd } from "@/lib/seoStructuredData";
import SeoInternalLinks from "@/components/seo/SeoInternalLinks";

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
  const profile = getQuizProfile(quiz);
  const questionCount = isFlagsQuiz(quiz.id)
    ? QUESTION_COUNT_RANGE_LABEL
    : quiz.questions.length;
  const poolNote = isFlagsQuiz(quiz.id)
    ? `${COUNTRY_COUNT} countries in the pool`
    : null;
  const faqLd = isFlagsQuiz(quiz.id) ? null : quizFaqJsonLd(quiz);

  return (
    <SiteShell>
      <JsonLd
        data={[
          quizJsonLd(quiz, category?.name),
          ...(faqLd ? [faqLd] : []),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            ...(category
              ? [{ name: category.name, path: `/${category.slug}` }]
              : []),
            { name: quiz.title, path: `/quiz/${quiz.id}` },
          ]),
        ]}
      />
      <div className="mx-auto w-full max-w-3xl min-w-0">
        <div className="overflow-hidden rounded-3xl border-4 border-ink bg-white shadow-[0_6px_0_0_#0d0d0d]">
          <div
            className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center sm:gap-3 sm:p-10"
            style={{ backgroundColor: quiz.color }}
          >
            <span className="text-5xl sm:text-7xl">{quiz.emoji}</span>
            <h1 className="font-display text-2xl font-extrabold leading-tight text-ink sm:text-3xl md:text-4xl">
              {quiz.title}
            </h1>
            {category && (
              <span className="rounded-full border-2 border-ink bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide sm:text-xs">
                {category.name}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center gap-5 p-4 sm:gap-6 sm:p-6 md:p-8">
            <p className="max-w-md text-center text-base font-semibold text-ink/70 sm:text-lg">
              {quiz.description}
            </p>

            <div
              className={`grid w-full gap-x-3 gap-y-4 font-bold text-ink/60 ${
                poolNote ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
              } sm:gap-4`}
            >
              <div className="min-w-0 text-center">
                <div className="font-display text-xl text-ink sm:text-2xl">
                  {questionCount}
                </div>
                <div className="text-[10px] uppercase tracking-wide sm:text-xs">
                  Questions
                </div>
              </div>
              {poolNote && (
                <div className="min-w-0 text-center">
                  <div className="font-display text-xl text-ink sm:text-2xl">
                    {COUNTRY_COUNT}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide sm:text-xs">
                    Countries
                  </div>
                </div>
              )}
              <div className="min-w-0 text-center">
                <div className="font-display text-xl text-ink sm:text-2xl">
                  {profile.difficulty}
                </div>
                <div className="text-[10px] uppercase tracking-wide sm:text-xs">
                  Difficulty
                </div>
              </div>
              <div className="min-w-0 text-center">
                <div className="font-display text-xl text-ink sm:text-2xl">
                  {quiz.rating.toFixed(1)}
                </div>
                <div className="text-[10px] uppercase tracking-wide sm:text-xs">
                  Rating
                </div>
              </div>
              <div className="min-w-0 text-center">
                <div className="font-display text-xl text-ink sm:text-2xl">
                  {quiz.plays.toLocaleString()}
                </div>
                <div className="text-[10px] uppercase tracking-wide sm:text-xs">
                  Plays
                </div>
              </div>
            </div>

            <p className="max-w-md text-center text-sm font-semibold text-ink/50">
              {profile.previewFact}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button3D href={`/quiz/${quiz.id}/play`} variant="grass" size="lg">
                ▶ Play
              </Button3D>
            </div>

            <SeoInternalLinks quizId={quiz.id} categorySlug={quiz.category} />
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
