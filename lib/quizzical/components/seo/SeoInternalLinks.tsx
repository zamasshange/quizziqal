import Link from "next/link";
import { categories, getQuiz, quizzes } from "@/lib/quizzes";
import { getCategory } from "@/lib/quizzes";
import type { SeoEntity } from "@/lib/seoEntitySlugs";
import { entityPath, ENTITY_TYPE_PATH } from "@/lib/seoEntitySlugs";

type Props = {
  entity?: SeoEntity;
  quizId?: string;
  categorySlug?: string;
};

/** Contextual internal links for SEO — quizzes, categories, discoveries, knowledge book. */
export default function SeoInternalLinks({ entity, quizId, categorySlug }: Props) {
  const quiz = quizId ? getQuiz(quizId) : undefined;
  const catSlug = categorySlug ?? entity?.relatedCategory ?? quiz?.category;
  const category = catSlug ? getCategory(catSlug) : undefined;

  const relatedQuizzes = entity
    ? entity.relatedQuizIds
        .map((id) => getQuiz(id))
        .filter(Boolean)
    : quiz
      ? quizzes.filter((q) => q.category === quiz.category && q.id !== quiz.id).slice(0, 4)
      : [];

  return (
    <section className="mt-8 rounded-2xl border-2 border-ink/15 bg-white/80 p-5">
      <h2 className="text-lg font-black text-ink">Explore more on Quizzical</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {category && (
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
              Category
            </p>
            <Link
              href={`/${category.slug}`}
              className="mt-1 inline-block font-extrabold text-grass hover:underline"
            >
              {category.emoji} {category.name} quizzes →
            </Link>
          </div>
        )}
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
            Knowledge
          </p>
          <Link
            href="/knowledge-book"
            className="mt-1 inline-block font-extrabold text-grass hover:underline"
          >
            📖 My Knowledge Book →
          </Link>
        </div>
        {entity && (
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
              Discover
            </p>
            <Link
              href="/discover"
              className="mt-1 inline-block font-extrabold text-grass hover:underline"
            >
              Browse all discovery pages →
            </Link>
          </div>
        )}
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
            Topics
          </p>
          <Link
            href="/topics"
            className="mt-1 inline-block font-extrabold text-grass hover:underline"
          >
            Quiz topics & guides →
          </Link>
        </div>
      </div>

      {relatedQuizzes.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
            Related quizzes
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {relatedQuizzes.map((q) =>
              q ? (
                <li key={q.id}>
                  <Link
                    href={`/quiz/${q.id}`}
                    className="rounded-full border-2 border-ink/15 bg-cream px-3 py-1 text-sm font-extrabold text-ink hover:border-ink"
                  >
                    {q.title}
                  </Link>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      )}

      {entity && (
        <p className="mt-4 text-xs font-semibold text-ink/45">
          Learn about {entity.name}, then play free{" "}
          {category?.name.toLowerCase() ?? "trivia"} quizzes to collect discoveries in your{" "}
          <Link href="/knowledge-book" className="text-grass hover:underline">
            Knowledge Book
          </Link>
          .
        </p>
      )}
    </section>
  );
}

export function entityTypeBrowseLinks() {
  return Object.entries(ENTITY_TYPE_PATH).map(([type, path]) => ({
    type,
    href: `/discover#${path}`,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  }));
}

export function linkToEntity(entity: SeoEntity) {
  return entityPath(entity.type, entity.slug);
}
