"use client";

import { useEffect, useState } from "react";

interface QuestionImageProps {
  image?: string;
  imageQuery?: string;
  alt: string;
  /** Portrait-friendly stage for faces (celebrities, athletes). */
  portrait?: boolean;
}

export default function QuestionImage({
  image,
  imageQuery,
  alt,
  portrait = true,
}: QuestionImageProps) {
  const [src, setSrc] = useState(image ?? "");
  const [loading, setLoading] = useState(!image && !!imageQuery);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (image) {
      setSrc(image);
      setLoading(false);
      setFailed(false);
      return;
    }
    if (!imageQuery) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFailed(false);

    fetch(`/api/quiz-image?term=${encodeURIComponent(imageQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.image_url) setSrc(data.image_url);
        else if (!cancelled) setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [image, imageQuery]);

  const frameClass = portrait
    ? "aspect-[3/4] max-h-[min(42vh,320px)] w-full max-w-[280px]"
    : "aspect-[16/10] w-full max-w-lg";

  if (loading) {
    return (
      <div
        className={`mx-auto animate-pulse rounded-2xl bg-gray-100 ${frameClass}`}
      />
    );
  }

  if (!src || failed) return null;

  return (
    <div
      className={`mx-auto overflow-hidden rounded-2xl border-2 border-gray-200 bg-gray-900 shadow-lg ${frameClass}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        className="h-full w-full object-contain object-center"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
