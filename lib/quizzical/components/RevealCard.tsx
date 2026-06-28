"use client";

import { useEffect, useRef, useState } from "react";
import type { FactReveal, RevealData } from "@/lib/reveal/types";
import {
  getCachedRevealClient,
  setCachedRevealClient,
} from "@/lib/revealPrefetch";
import { PlayerRevealCard, TeamRevealCard } from "./reveal/SportsRevealCard";
import { MovieRevealCard } from "./reveal/MovieRevealCard";
import { CountryRevealCard } from "./reveal/CountryRevealCard";
import { playClick, useMuted } from "@/lib/sound";

export type RevealStatus = "correct" | "wrong" | "timeout";

export type RevealVariant = "full" | "actions" | "content";

const cache = {
  get: getCachedRevealClient,
  set: setCachedRevealClient,
  has: (key: string) => getCachedRevealClient(key) !== undefined,
};

function revealTitle(data: RevealData | null, fallback: string): string {
  if (!data) return fallback;
  if (data.kind === "fact" || data.kind === "movie") return data.title;
  return data.name;
}

export default function RevealCard({
  category,
  term,
  status,
  continueLabel,
  onContinue,
  hideImage = false,
  variant = "full",
  knowledgeSaved = false,
}: {
  category: string;
  term: string;
  status: RevealStatus;
  /** Subtle inline hint when this answer was newly saved (no popup). */
  knowledgeSaved?: boolean;
  continueLabel: string;
  onContinue: () => void;
  /** Skip the big image for fact reveals (image games already show the subject). */
  hideImage?: boolean;
  /** full = status + content + continue; actions = status + continue only; content = educational body only */
  variant?: RevealVariant;
}) {
  const key = `${category}|${term}`;
  const [data, setData] = useState<RevealData | null>(
    () => cache.get(key) ?? null,
  );
  const [loading, setLoading] = useState(!cache.has(key));
  const [muted, toggleMute] = useMuted();
  const continueRef = useRef<HTMLButtonElement>(null);

  function handleContinue() {
    playClick();
    onContinue();
  }

  useEffect(() => {
    let cancelled = false;

    if (cache.has(key)) {
      setData(cache.get(key) ?? null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ term, category });
    fetch(`/api/reveal?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        const rd = (d?.data as RevealData) ?? null;
        cache.set(key, rd);
        if (!cancelled) {
          setData(rd);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key, category, term]);

  const correct = status === "correct";
  const statusText =
    status === "correct"
      ? "Correct!"
      : status === "timeout"
        ? "Time's up!"
        : "Incorrect";
  const statusIcon = status === "correct" ? "🎉" : status === "timeout" ? "⏰" : "😬";
  const title = revealTitle(data, term);

  const showActions = variant === "full" || variant === "actions";
  const showContent = variant === "full" || variant === "content";

  if (variant === "actions") {
    return (
      <div
        className={`flex flex-col overflow-hidden rounded-2xl border-4 border-ink bg-white ${
          correct ? "glow-correct" : "glow-wrong"
        }`}
      >
        <div
          className={`flex items-center justify-between gap-2 px-4 py-2.5 text-white ${
            correct ? "bg-grass" : "bg-answer1"
          }`}
        >
          <span className="flex items-center gap-2 font-display text-base font-extrabold">
            <span className="text-xl">{statusIcon}</span>
            {statusText}
          </span>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute sounds" : "Mute sounds"}
            className="rounded-full px-2 py-1 text-base transition-opacity hover:opacity-80"
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>

        {!correct && (
          <p className="px-4 pt-3 text-sm font-extrabold text-ink/60">
            Correct answer: <span className="text-ink">{title}</span>
          </p>
        )}

        <div className="p-4">
          <button
            ref={continueRef}
            type="button"
            onClick={handleContinue}
            className="w-full rounded-2xl border-4 border-ink bg-ink py-3 font-display text-lg font-extrabold tracking-wide text-white shadow-[0_4px_0_0_#0d0d0d] transition-transform active:translate-y-1 active:shadow-none"
          >
            {continueLabel}
          </button>
        </div>
      </div>
    );
  }

  if (variant === "content" && !loading && !data) {
    return null;
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-3xl border-4 border-ink bg-white ${
        variant === "content" ? "" : correct ? "glow-correct" : "glow-wrong"
      }`}
    >
      {variant !== "content" && (
        <div
          className={`flex items-center justify-between gap-2 px-4 py-2.5 text-white ${
            correct ? "bg-grass" : "bg-answer1"
          }`}
        >
          <span className="flex items-center gap-2 font-display text-lg font-extrabold">
            <span className="text-2xl">{statusIcon}</span>
            {statusText}
          </span>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute sounds" : "Mute sounds"}
            className="rounded-full px-2 py-1 text-lg transition-opacity hover:opacity-80"
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      )}

      <div className={`flex flex-col gap-3 p-4 ${variant === "content" ? "pt-4" : ""}`}>
        {!correct && showContent && (
          <p className="text-sm font-extrabold text-ink/60">
            Correct answer: <span className="text-ink">{title}</span>
          </p>
        )}

        {showContent && loading ? (
          <RevealSkeleton />
        ) : showContent && data ? (
          <RevealBody data={data} hideImage={hideImage} />
        ) : null}

        {knowledgeSaved && correct && showContent && (
          <p className="text-[11px] font-semibold text-ink/40">
            Saved to Knowledge Book
          </p>
        )}
      </div>

      {showActions && (
        <div className="p-4 pt-0">
          <button
            ref={continueRef}
            type="button"
            onClick={handleContinue}
            className="w-full rounded-2xl border-4 border-ink bg-ink py-3 font-display text-lg font-extrabold tracking-wide text-white shadow-[0_4px_0_0_#0d0d0d] transition-transform active:translate-y-1 active:shadow-none"
          >
            {continueLabel}
          </button>
        </div>
      )}
    </div>
  );
}

function RevealBody({
  data,
  hideImage,
}: {
  data: RevealData;
  hideImage: boolean;
}) {
  switch (data.kind) {
    case "player":
      return <PlayerRevealCard data={data} />;
    case "team":
      return <TeamRevealCard data={data} />;
    case "movie":
      return <MovieRevealCard data={data} />;
    case "country":
      return <CountryRevealCard data={data} hideImage={hideImage} />;
    case "fact":
      return <FactRevealCard data={data} hideImage={hideImage} />;
    default:
      return null;
  }
}

function FactRevealCard({
  data,
  hideImage,
}: {
  data: FactReveal;
  hideImage: boolean;
}) {
  const showImage = !hideImage && data.image_url;

  return (
    <div className="flex flex-col gap-3">
      {showImage && (
        <div className="relative h-48 w-full overflow-hidden rounded-2xl border-[3px] border-ink bg-ink sm:h-56">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            aria-hidden
            src={data.image_url!}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-xl"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.image_url!}
            alt={data.title}
            loading="lazy"
            className="relative h-full w-full object-contain"
          />
        </div>
      )}

      <div className="min-w-0">
        <span className="text-[11px] font-extrabold uppercase tracking-wide text-grass">
          Did you know?
        </span>
        <h3 className="font-display text-xl font-extrabold leading-tight text-ink">
          {data.title}
        </h3>
        {data.description && (
          <p className="text-sm font-bold text-ink/55">{data.description}</p>
        )}
      </div>

      <p className="line-clamp-4 text-sm font-semibold leading-relaxed text-ink/75">
        {data.extract}
      </p>

      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-bold text-ink/40 underline hover:text-ink"
      >
        Read more on Wikipedia ↗
      </a>
    </div>
  );
}

function RevealSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-48 w-full overflow-hidden rounded-2xl border-[3px] border-ink/10 bg-cream-dark sm:h-56">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </div>
      <div className="space-y-2">
        <div className="relative h-3 w-1/3 overflow-hidden rounded bg-cream-dark">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
        <div className="relative h-3 w-4/5 overflow-hidden rounded bg-cream-dark">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
        <div className="relative h-3 w-2/3 overflow-hidden rounded bg-cream-dark">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>
      </div>
    </div>
  );
}
