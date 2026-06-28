"use client";

import { useEffect, useState } from "react";
import { quizImageFallbacks } from "@/lib/quizImageUrl";

type Props = {
  src: string;
  alt: string;
  imageKey: string;
  className?: string;
  /** Refetch via quiz-image API using this Wikipedia search term. */
  refreshTerm?: string;
  /** Movie poster reveal — keep HD portrait sizing. */
  posterReveal?: boolean;
};

export default function QuizStageImage({
  src,
  alt,
  imageKey,
  className = "",
  refreshTerm,
  posterReveal = false,
}: Props) {
  const [srcIndex, setSrcIndex] = useState(0);
  const [remoteSrc, setRemoteSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const fallbacks = [
    ...quizImageFallbacks(src, { posterReveal }),
    ...(remoteSrc ? quizImageFallbacks(remoteSrc, { posterReveal }) : []),
  ];
  const uniqueFallbacks = [...new Set(fallbacks)];
  const currentSrc = uniqueFallbacks[srcIndex] ?? "";

  useEffect(() => {
    setSrcIndex(0);
    setRemoteSrc(null);
    setFailed(false);
  }, [imageKey, src]);

  async function tryRemoteRefresh() {
    if (!refreshTerm?.trim() || remoteSrc) return false;
    try {
      const res = await fetch(
        `/api/quiz-image?term=${encodeURIComponent(refreshTerm.trim())}`,
        { cache: "no-store" },
      );
      if (!res.ok) return false;
      const data = (await res.json()) as { image_url?: string | null };
      if (data.image_url) {
        setRemoteSrc(data.image_url);
        setSrcIndex(0);
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  }

  async function handleError() {
    if (srcIndex + 1 < uniqueFallbacks.length) {
      setSrcIndex((i) => i + 1);
      return;
    }
    const refreshed = await tryRemoteRefresh();
    if (!refreshed) setFailed(true);
  }

  if (!src.trim() || failed || !currentSrc) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-cream-dark px-4 text-center ${className}`}
      >
        <span className="text-4xl" aria-hidden>
          🖼️
        </span>
        <p className="font-display text-sm font-extrabold text-ink/50">
          Photo loading…
        </p>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={`${imageKey}-${srcIndex}-${currentSrc}`}
      src={currentSrc}
      alt={alt}
      loading="eager"
      decoding="async"
      fetchPriority="high"
      referrerPolicy="no-referrer"
      onError={() => void handleError()}
      className={className}
    />
  );
}
