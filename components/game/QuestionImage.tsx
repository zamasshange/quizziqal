"use client";

import { useEffect, useState } from "react";

interface QuestionImageProps {
  image?: string;
  imageQuery?: string;
  alt: string;
}

export default function QuestionImage({ image, imageQuery, alt }: QuestionImageProps) {
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
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [image, imageQuery]);

  if (loading) {
    return (
      <div className="stage-frame mx-auto aspect-[4/5] w-full max-w-sm animate-pulse rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200" />
    );
  }

  if (!src || failed) return null;

  return (
    <div className="stage-frame mx-auto aspect-[4/5] w-full max-w-sm rounded-2xl bg-gray-900">
      {/* Blurred fill — kills black bars */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        className="relative z-10 h-full w-full object-contain object-top"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
