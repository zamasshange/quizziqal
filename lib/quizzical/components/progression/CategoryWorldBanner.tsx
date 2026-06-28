"use client";

import Link from "next/link";
import { useUnlockForHref } from "@/lib/progression/unlockClient";

type Props = {
  categorySlug: string;
  categoryName: string;
};

/** Shows world-level lock requirements without hiding category content. */
export default function CategoryWorldBanner({ categorySlug, categoryName }: Props) {
  const { unlock, locked } = useUnlockForHref(`/${categorySlug}`);

  if (!locked || !unlock) return null;

  const nextReq = unlock.requirements.find((r) => !r.met);

  return (
    <div className="mt-4 rounded-2xl border-4 border-sun bg-gradient-to-r from-sun/25 to-white p-4 shadow-[0_4px_0_0_#0d0d0d]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-ink/45">
            World locked
          </p>
          <p className="font-display text-lg font-black text-ink">
            {unlock.emoji} {unlock.title}
          </p>
          <p className="text-sm font-bold text-ink/60">
            {categoryName} opens as you level up. Preview everything below — play unlocks with progress.
          </p>
          {nextReq && (
            <p className="mt-1 text-xs font-extrabold text-grass">
              {nextReq.label}: {nextReq.current}/{nextReq.required}
            </p>
          )}
        </div>
        <div className="h-2 w-32 overflow-hidden rounded-full border-2 border-ink bg-white">
          <div
            className="h-full bg-grass"
            style={{ width: `${Math.round(unlock.progress * 100)}%` }}
          />
        </div>
      </div>
      <Link
        href="/"
        className="mt-3 inline-flex text-sm font-extrabold text-grass hover:underline"
      >
        View your next unlock →
      </Link>
    </div>
  );
}
