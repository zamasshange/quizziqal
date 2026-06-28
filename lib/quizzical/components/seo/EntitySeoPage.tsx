import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell from "@/components/SiteShell";
import JsonLd from "@/components/JsonLd";
import Button3D from "@/components/Button3D";
import SeoInternalLinks from "@/components/seo/SeoInternalLinks";
import { getEntity, getRelatedEntities } from "@/lib/seoEntities";
import { ENTITY_TYPE_LABELS, entityPath, type SeoEntityType } from "@/lib/seoEntitySlugs";
import { fetchWikipediaFact, fetchWikipediaSummaryWithFallback } from "@/lib/wikipedia";
import { proxiedQuizImageUrl } from "@/lib/quizImageUrl";
import { flagImageFromQuery } from "@/lib/countryData";
import { getQuiz, getCategory } from "@/lib/quizzes";
import {
  breadcrumbJsonLd,
  entityArticleJsonLd,
} from "@/lib/seoStructuredData";

type Props = {
  type: SeoEntityType;
  slug: string;
};

export default async function EntitySeoPage({ type, slug }: Props) {
  const entity = getEntity(type, slug);
  if (!entity) notFound();

  const wiki = await fetchWikipediaFact(entity.wikiTerm);
  const summary = wiki ?? (await fetchWikipediaSummaryWithFallback(entity.wikiTerm));
  const flagUrl =
    entity.type === "country" && entity.iso2
      ? flagImageFromQuery(`Flag of ${entity.name}`)
      : null;
  const imageUrl = flagUrl
    ? proxiedQuizImageUrl(flagUrl)
    : wiki?.image_url
      ? proxiedQuizImageUrl(wiki.image_url)
      : summary?.image_url
        ? proxiedQuizImageUrl(summary.image_url)
        : null;

  const related = getRelatedEntities(entity);
  const category = getCategory(entity.relatedCategory);
  const path = entityPath(type, slug);
  const label = ENTITY_TYPE_LABELS[type];

  const articleLd = wiki
    ? entityArticleJsonLd(entity, {
        title: wiki.title,
        description: wiki.description,
        extract: wiki.extract,
        url: wiki.url,
      })
    : summary
      ? entityArticleJsonLd(entity, {
          title: summary.title,
          description: summary.description,
        })
      : null;

  return (
    <SiteShell>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Discover", path: "/discover" },
            { name: entity.name, path },
          ]),
          ...(articleLd ? [articleLd] : []),
        ]}
      />

      <article className="mx-auto max-w-3xl pb-8">
        <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
          {label} · Quizzical discovery guide
        </p>
        <h1 className="mt-2 font-display text-4xl font-black text-ink md:text-5xl">
          {entity.name}
        </h1>

        {entity.intro && (
          <p className="mt-3 text-base font-bold text-ink/70">{entity.intro}</p>
        )}

        {imageUrl && (
          <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-2xl border-4 border-ink bg-cream shadow-[0_4px_0_0_#0d0d0d]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={entity.name}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
        )}

        {(wiki || summary) && (
          <div className="mt-6 space-y-3">
            {(wiki?.description || summary?.description) && (
              <p className="text-lg font-extrabold text-grass">
                {wiki?.description || summary?.description}
              </p>
            )}
            {wiki?.extract && (
              <p className="text-base font-semibold leading-relaxed text-ink/75">
                {wiki.extract}
              </p>
            )}
            {wiki?.url && (
              <a
                href={wiki.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-bold text-ink/45 hover:text-ink"
              >
                Read more on Wikipedia ↗
              </a>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {entity.relatedQuizIds.map((id) => {
            const quiz = getQuiz(id);
            if (!quiz) return null;
            return (
              <Button3D
                key={id}
                href={`/quiz/${id}/play`}
                variant="grass"
                size="md"
              >
                ▶ Play {quiz.title}
              </Button3D>
            );
          })}
          {category && (
            <Button3D href={`/${category.slug}`} variant="white" size="md">
              {category.emoji} All {category.name}
            </Button3D>
          )}
        </div>

        <SeoInternalLinks entity={entity} categorySlug={entity.relatedCategory} />

        {related.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-black text-ink">More {label.toLowerCase()}s</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={entityPath(r.type, r.slug)}
                    className="rounded-full border-2 border-ink/15 bg-white px-3 py-1 text-sm font-extrabold hover:border-ink"
                  >
                    {r.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </SiteShell>
  );
}
