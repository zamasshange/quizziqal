"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AppIcon, { type AppIconName } from "@/components/icons/AppIcon";
import ContainedPhoto from "@/components/media/ContainedPhoto";
import type { GameMode } from "@/lib/imageQuestions";
import { getBootstrapPreviewUrl } from "@/lib/imagePreviewBootstrap";
import { useUnlockForHref } from "@/lib/progression/unlockClient";
import LockedContentPreview from "@/components/progression/LockedContentPreview";

const MODE_ICONS: Record<string, AppIconName> = {
  celebrity: "movie",
  football: "medal",
  basketball: "medal",
  cricket: "medal",
  athlete: "award",
  movie: "movie",
  music: "sparkles",
};

const previewCache = new Map<string, string>();

async function fetchPreviewUrl(term: string): Promise<string | null> {
  const cached = previewCache.get(term);
  if (cached) return cached;

  try {
    const res = await fetch(`/api/quiz-image?term=${encodeURIComponent(term)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { image_url?: string | null };
    const url = data.image_url?.trim() || null;
    if (url) previewCache.set(term, url);
    return url;
  } catch {
    return null;
  }
}

function usePreviewImage(mode: GameMode) {
  const [url, setUrl] = useState<string | null>(() =>
    getBootstrapPreviewUrl(mode.category, mode.previewTerms),
  );

  useEffect(() => {
    if (url) return;
    let cancelled = false;
    (async () => {
      for (const term of mode.previewTerms) {
        const found = await fetchPreviewUrl(term);
        if (found && !cancelled) {
          setUrl(found);
          return;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode.category, mode.previewTerms, url]);

  return url;
}

function shortTitle(title: string) {
  return title.replace(/^Guess the /i, "");
}

function PictureCard({
  mode,
  fill = false,
}: {
  mode: GameMode;
  fill?: boolean;
}) {
  const previewUrl = usePreviewImage(mode);
  const icon = MODE_ICONS[mode.slug] ?? "sparkles";
  const label = shortTitle(mode.title);
  const group =
    mode.quizCategorySlug === "sports" ? "Sports" : "Entertainment";
  const href = `/play/${mode.slug}`;
  const { unlock, locked } = useUnlockForHref(href);

  const widthClass = fill
    ? "block w-full min-w-0"
    : "block w-[8.75rem] shrink-0 snap-start sm:w-[9.5rem]";

  const imageBox = (
    <div className="relative aspect-[4/5] overflow-hidden rounded-xl border-[2.5px] border-ink bg-ink shadow-[0_3px_0_0_#0d0d0d] transition-transform group-hover:-translate-y-0.5 group-hover:shadow-[0_5px_0_0_#0d0d0d]">
      {previewUrl ? (
        <ContainedPhoto
          src={previewUrl}
          alt={`${mode.title} preview`}
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: mode.color }}
        >
          <AppIcon name={icon} size={24} className="text-white/90" />
        </div>
      )}

      <span className="absolute left-1.5 top-1.5 z-20 rounded-full border border-white/20 bg-black/45 px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-white backdrop-blur-sm">
        {group}
      </span>

      {!locked && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink via-ink/70 to-transparent px-2 pb-2 pt-10">
          <h3 className="font-display text-xs font-black leading-tight text-white sm:text-sm">
            {label}
          </h3>
          <span className="mt-1 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-1.5 py-px text-[8px] font-extrabold text-white backdrop-blur-sm transition-colors group-hover:bg-grass sm:text-[9px]">
            Play →
          </span>
        </div>
      )}
    </div>
  );

  const visual = locked && unlock ? (
    <LockedContentPreview unlock={unlock} className="rounded-xl">
      {imageBox}
    </LockedContentPreview>
  ) : (
    imageBox
  );

  if (locked) {
    return <div className={widthClass}>{visual}</div>;
  }

  return (
    <Link href={href} className={`group ${widthClass}`}>
      {visual}
    </Link>
  );
}

function MobileFilmStrip({ modes }: { modes: GameMode[] }) {
  return (
    <div className="relative md:hidden">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-cream to-transparent" />
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {modes.map((mode) => (
          <PictureCard key={mode.slug} mode={mode} />
        ))}
      </div>
    </div>
  );
}

function DesktopGrid({ modes }: { modes: GameMode[] }) {
  return (
    <div className="hidden gap-3 md:grid md:grid-cols-7">
      {modes.map((mode) => (
        <div key={mode.slug} className="min-w-0">
          <PictureCard mode={mode} fill />
        </div>
      ))}
    </div>
  );
}

function orderModes(modes: GameMode[]) {
  const entertainment = modes.filter(
    (m) => m.quizCategorySlug === "entertainment",
  );
  const sports = modes.filter((m) => m.quizCategorySlug === "sports");
  return [...entertainment, ...sports];
}

type Props = {
  modes: GameMode[];
  variant?: "home" | "compact";
};

export default function PictureGameGrid({ modes, variant = "home" }: Props) {
  if (modes.length === 0) return null;

  const ordered = orderModes(modes);

  if (variant === "compact") {
    return (
      <>
        <MobileFilmStrip modes={ordered} />
        <DesktopGrid modes={ordered} />
      </>
    );
  }

  return (
    <section className="relative">
      <div className="mb-2 flex items-baseline justify-between gap-2 md:mb-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-grass md:text-xs">
            Picture quizzes
          </p>
          <h2 className="text-lg font-black text-ink md:text-2xl">
            Who&apos;s in the photo?
          </h2>
        </div>
        <span className="shrink-0 text-xs font-extrabold text-ink/30 md:hidden">
          Scroll →
        </span>
      </div>

      <div>
        <MobileFilmStrip modes={ordered} />
        <DesktopGrid modes={ordered} />
      </div>
    </section>
  );
}
