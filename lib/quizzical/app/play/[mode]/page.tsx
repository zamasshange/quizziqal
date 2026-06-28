import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import ImageQuizPlayer from "@/components/ImageQuizPlayer";
import UnlockGate from "@/components/progression/UnlockGate";
import { IMAGE_GAME_MODES, getGameModeBySlug } from "@/lib/imageQuestions";
import JsonLd from "@/components/JsonLd";
import { imageGameMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, imageGameJsonLd } from "@/lib/seoStructuredData";

export function generateStaticParams() {
  return IMAGE_GAME_MODES.map((m) => ({ mode: m.slug }));
}

export async function generateMetadata(
  props: PageProps<"/play/[mode]">,
): Promise<Metadata> {
  const { mode } = await props.params;
  const game = getGameModeBySlug(mode);
  if (!game) return { title: "Game not found" };
  return imageGameMetadata(game);
}

export default async function ImageGamePage(props: PageProps<"/play/[mode]">) {
  const { mode } = await props.params;
  const game = getGameModeBySlug(mode);

  if (!game) {
    notFound();
  }

  return (
    <SiteShell showCategories={false} showFooter={false}>
      <JsonLd
        data={[
          imageGameJsonLd(game),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: game.title, path: `/play/${game.slug}` },
          ]),
        ]}
      />
      <div className="pt-2">
        <div className="mx-auto mb-3 flex max-w-5xl items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl border-[3px] border-ink text-xl shadow-[0_3px_0_0_#0d0d0d]"
            style={{ backgroundColor: game.color }}
          >
            {game.emoji}
          </span>
          <h1 className="font-display text-xl font-extrabold text-ink md:text-2xl">
            {game.title}
          </h1>
        </div>
        <UnlockGate href={`/play/${game.slug}`}>
        <ImageQuizPlayer mode={game} />
        </UnlockGate>
      </div>
    </SiteShell>
  );
}
