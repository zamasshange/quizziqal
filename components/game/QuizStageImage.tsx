"use client";

import { useEffect, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Focus crop toward top for portraits (faces, athletes). */
  portrait?: boolean;
};

export default function QuizStageImage({
  src,
  alt,
  className = "",
  portrait = true,
}: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gray-900 text-white/40 ${className}`}
      >
        <span className="text-4xl">🖼️</span>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-gray-900 ${className}`}>
      {/* Blurred fill — removes black pillarboxing */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-110 object-cover object-center blur-2xl brightness-75"
      />
      <div className="absolute inset-0 bg-black/20" />
      {/* Sharp foreground */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`relative z-10 h-full w-full ${
          portrait ? "object-contain object-top" : "object-contain object-center"
        }`}
      />
    </div>
  );
}
