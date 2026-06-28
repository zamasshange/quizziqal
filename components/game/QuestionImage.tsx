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

  useEffect(() => {
    if (image) {
      setSrc(image);
      setLoading(false);
      return;
    }
    if (!imageQuery) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/quiz-image?term=${encodeURIComponent(imageQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.image_url) setSrc(data.image_url);
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
      <div className="mx-auto mb-3 h-36 w-full max-w-xs animate-pulse rounded-xl bg-gray-100 lg:h-48 lg:max-w-sm" />
    );
  }

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className="mx-auto mb-3 h-36 w-full max-w-xs rounded-xl object-cover shadow-md lg:h-48 lg:max-w-sm"
    />
  );
}
