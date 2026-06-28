"use client";

import { useEffect, useState } from "react";
import type { RevealData } from "@/lib/quizzical/reveal/types";

type RevealStatus = "correct" | "wrong" | "timeout";

function revealTitle(data: RevealData | null, fallback: string): string {
  if (!data) return fallback;
  if (data.kind === "fact" || data.kind === "movie") return data.title;
  return data.name;
}

function revealDescription(data: RevealData | null): string {
  if (!data) return "";
  if (data.kind === "fact") return data.extract || data.description;
  if (data.kind === "movie") return data.overview ?? "";
  if (data.kind === "country") return data.extract;
  if (data.kind === "player") return data.biography ?? "";
  if (data.kind === "team") return data.description ?? "";
  return "";
}

function revealImage(data: RevealData | null): string | null {
  if (!data) return null;
  if (data.kind === "fact") return data.image_url;
  if (data.kind === "movie") return data.poster_url;
  if (data.kind === "country") return data.image_url ?? data.flag_url;
  if (data.kind === "player") return data.image_url;
  if (data.kind === "team") return data.badge;
  return null;
}

export default function RevealPanel({
  category,
  term,
  status,
}: {
  category: string;
  term: string;
  status: RevealStatus;
}) {
  const [data, setData] = useState<RevealData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ term, category });
    fetch(`/api/reveal?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setData(d?.data ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, term]);

  const correct = status === "correct";
  const image = revealImage(data);
  const title = revealTitle(data, term);
  const description = revealDescription(data);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white/10 p-4 text-white backdrop-blur-sm">
      <p className="mb-2 text-center text-sm font-bold uppercase tracking-wide text-white/70">
        {correct ? "Correct answer" : "The answer was"}
      </p>
      <p className="mb-3 text-center text-xl font-extrabold">{term}</p>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}

      {!loading && data && (
        <>
          {image && (
            <div className="mb-3 overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={title}
                className="mx-auto max-h-40 w-full object-cover"
              />
            </div>
          )}
          <p className="mb-1 text-center text-lg font-bold">{title}</p>
          {description && (
            <p className="line-clamp-4 text-center text-sm text-white/80">
              {description}
            </p>
          )}
          {data.kind === "country" && data.capital && (
            <p className="mt-2 text-center text-xs text-white/60">
              Capital: {data.capital}
              {data.population
                ? ` · Pop. ${(data.population / 1_000_000).toFixed(1)}M`
                : ""}
            </p>
          )}
          {data.kind === "movie" && data.year && (
            <p className="mt-2 text-center text-xs text-white/60">
              {data.year}
              {data.rating ? ` · ★ ${data.rating.toFixed(1)}` : ""}
            </p>
          )}
        </>
      )}
    </div>
  );
}
