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
  imageUrl,
}: {
  category: string;
  term: string;
  imageUrl?: string;
  status?: RevealStatus;
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

  const img = imageUrl ?? revealImage(data);
  const title = revealTitle(data, term);
  const description = revealDescription(data);

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border-3 border-white/30 bg-white/15 shadow-xl backdrop-blur-md">
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      ) : (
        <>
          {img && (
            <div className="relative aspect-[4/3] w-full bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain object-top"
              />
            </div>
          )}
          <div className="p-4 text-center text-white">
            <p className="text-lg font-extrabold">{title}</p>
            {description && (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/85">
                {description}
              </p>
            )}
            {data?.kind === "player" && data.sport && (
              <p className="mt-2 text-xs font-semibold text-white/60">
                {data.sport}
                {data.team ? ` · ${data.team}` : ""}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
