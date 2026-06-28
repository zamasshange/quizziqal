import Link from "next/link";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import JsonLd from "@/components/JsonLd";
import { discoverHubMetadata } from "@/lib/seo";
import { getEntitiesByType } from "@/lib/seoEntities";
import { ENTITY_TYPE_LABELS, entityPath, type SeoEntityType } from "@/lib/seoEntitySlugs";
import { breadcrumbJsonLd } from "@/lib/seoStructuredData";

export const metadata: Metadata = discoverHubMetadata();

const SECTIONS: SeoEntityType[] = [
  "country",
  "landmark",
  "player",
  "celebrity",
  "movie",
  "figure",
];

export default function DiscoverHubPage() {
  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Discover", path: "/discover" },
        ])}
      />

      <div className="mx-auto max-w-4xl pb-8">
        <h1 className="font-display text-4xl font-black text-ink md:text-5xl">
          Discover &amp; learn
        </h1>
        <p className="mt-3 text-base font-bold text-ink/70">
          Explore countries, landmarks, athletes, celebrities, movies, and historical
          figures — then play related quizzes and collect discoveries in your{" "}
          <Link href="/knowledge-book" className="text-grass hover:underline">
            Knowledge Book
          </Link>
          .
        </p>

        {SECTIONS.map((type) => {
          const items = getEntitiesByType(type).slice(0, type === "country" ? 24 : 12);
          const label = ENTITY_TYPE_LABELS[type];
          const sectionId =
            type === "figure" ? "figure" : type === "player" ? "player" : type;

          return (
            <section key={type} id={sectionId} className="mt-10 scroll-mt-24">
              <h2 className="text-2xl font-black text-ink">{label}s</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {items.map((e) => (
                  <li key={e.slug}>
                    <Link
                      href={entityPath(type, e.slug)}
                      className="rounded-full border-2 border-ink/15 bg-white px-3 py-1.5 text-sm font-extrabold text-ink hover:border-ink"
                    >
                      {e.name}
                    </Link>
                  </li>
                ))}
                {type === "country" && (
                  <li>
                    <span className="rounded-full border-2 border-dashed border-ink/20 px-3 py-1.5 text-sm font-bold text-ink/45">
                      + {getEntitiesByType("country").length - 24} more countries
                    </span>
                  </li>
                )}
              </ul>
            </section>
          );
        })}

        <section className="mt-10 rounded-2xl border-4 border-ink bg-lime/25 p-6 shadow-[0_4px_0_0_#0d0d0d]">
          <h2 className="text-xl font-black text-ink">Ready to play?</h2>
          <p className="mt-2 text-sm font-semibold text-ink/65">
            Turn what you learn into XP, discoveries, and leaderboard rank.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full border-4 border-ink bg-grass px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_3px_0_0_#0d0d0d]"
          >
            Browse all quizzes →
          </Link>
        </section>
      </div>


    </SiteShell>
  );
}
