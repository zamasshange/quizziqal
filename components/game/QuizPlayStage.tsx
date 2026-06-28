"use client";

import { useEffect, useState } from "react";
import QuestionImage from "./QuestionImage";

type Props = {
  question: string;
  image?: string;
  imageQuery?: string;
  quizIcon?: string;
  children: React.ReactNode;
};

export default function QuizPlayStage({
  question,
  image,
  imageQuery,
  quizIcon = "🎯",
  children,
}: Props) {
  const [src, setSrc] = useState(image ?? "");

  useEffect(() => {
    if (image) {
      setSrc(image);
      return;
    }
    if (!imageQuery) return;

    let cancelled = false;
    fetch(`/api/quiz-image?term=${encodeURIComponent(imageQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.image_url) setSrc(data.image_url);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [image, imageQuery]);

  const hasImage = !!(image || imageQuery);

  return (
    <div className="play-arena relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      {/* ── LEFT: image + question (full height on PC) ── */}
      <section className="play-panel-left flex min-h-0 shrink-0 flex-col lg:h-full lg:w-1/2">
        {hasImage ? (
          <>
            {/* Mobile */}
            <div className="px-3 pt-3 lg:hidden">
              <QuestionImage image={image} imageQuery={imageQuery} alt={question} />
              <p className="px-1 py-3 text-center text-base font-extrabold leading-snug text-white">
                {question}
              </p>
            </div>

            {/* Desktop: edge-to-edge image stage */}
            <div className="relative hidden min-h-0 flex-1 flex-col overflow-hidden lg:flex">
              {src ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 h-full w-full scale-110 object-cover blur-3xl brightness-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={question}
                    referrerPolicy="no-referrer"
                    className="relative z-10 mx-auto h-full w-full flex-1 object-contain object-center p-6 pb-28"
                  />
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center bg-black/30">
                  <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 to-transparent px-8 pb-8 pt-16">
                <p className="text-center text-2xl font-extrabold leading-snug text-white xl:text-3xl">
                  {question}
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center px-6 py-10 lg:h-full lg:bg-black/20 lg:py-0">
              <span className="mb-4 text-6xl drop-shadow-lg lg:mb-6 lg:text-8xl">{quizIcon}</span>
              <p className="text-center text-xl font-extrabold leading-snug text-white lg:max-w-lg lg:text-3xl xl:text-4xl">
                {question}
              </p>
            </div>
          </>
        )}
      </section>

      {/* ── RIGHT: answers (full height on PC) ── */}
      <section className="play-panel-right flex min-h-0 flex-1 flex-col lg:h-full lg:w-1/2 lg:border-l lg:border-white/10 lg:bg-black/20">
        <div className="flex min-h-0 flex-1 flex-col p-3 pb-4 lg:p-6 lg:pb-6">
          <p className="mb-2 hidden shrink-0 text-center text-sm font-extrabold uppercase tracking-widest text-white/50 lg:block">
            Pick your answer
          </p>
          <div className="min-h-0 flex-1">{children}</div>
          <p className="mt-3 hidden shrink-0 text-center text-xs font-semibold text-white/35 lg:block">
            <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono">1</kbd>–<kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono">4</kbd>
            {" "}or{" "}
            <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono">A</kbd>–<kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono">D</kbd>
          </p>
        </div>
      </section>
    </div>
  );
}
