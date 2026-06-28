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

const SPARKLES = ["✦", "★", "●", "◆"];

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
    <div className="play-arena relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Decorative layer */}
      <div className="play-arena-glow pointer-events-none absolute inset-0" aria-hidden />
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="play-arena-spark pointer-events-none absolute text-white/20"
          style={{
            top: `${10 + i * 18}%`,
            left: `${5 + i * 22}%`,
            animationDelay: `${i * 0.6}s`,
          }}
          aria-hidden
        >
          {s}
        </span>
      ))}

      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row lg:items-stretch lg:gap-5 lg:p-5 lg:pb-6">
        {/* ── Question spotlight ── */}
        <section className="play-spotlight flex shrink-0 flex-col lg:min-h-0 lg:w-[44%] lg:shrink-0 xl:w-[42%]">
          {hasImage ? (
            <>
              {/* Mobile: compact card */}
              <div className="px-3 pt-3 lg:hidden">
                <QuestionImage image={image} imageQuery={imageQuery} alt={question} />
              </div>

              {/* Desktop: full-height stage */}
              <div className="play-spotlight-frame relative mx-3 mt-3 hidden min-h-0 flex-1 flex-col overflow-hidden rounded-3xl lg:mx-0 lg:mt-0 lg:flex">
                {src ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 h-full w-full scale-110 object-cover blur-3xl brightness-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a0533]/90 via-[#46178f]/20 to-transparent" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={question}
                      referrerPolicy="no-referrer"
                      className="relative z-10 mx-auto h-full w-full max-h-full flex-1 object-contain object-top px-2 pt-2"
                    />
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center bg-white/5">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                  </div>
                )}

                <div className="relative z-20 shrink-0 border-t border-white/15 bg-black/35 px-6 py-5 backdrop-blur-md">
                  <p className="text-center text-xl font-extrabold leading-snug text-white xl:text-2xl">
                    {question}
                  </p>
                </div>
              </div>

              <p className="px-4 py-3 text-center text-base font-extrabold leading-snug text-white lg:hidden">
                {question}
              </p>
            </>
          ) : (
            <div className="play-spotlight-frame mx-3 mt-3 flex flex-1 flex-col items-center justify-center rounded-3xl px-6 py-10 lg:mx-0 lg:mt-0 lg:min-h-[320px]">
              <span className="mb-4 text-6xl drop-shadow-lg lg:text-7xl">{quizIcon}</span>
              <p className="text-center text-xl font-extrabold leading-snug text-white lg:text-3xl">
                {question}
              </p>
            </div>
          )}
        </section>

        {/* ── Answer arena ── */}
        <section className="play-answers flex min-h-0 flex-1 flex-col lg:justify-center">
          <div className="play-answers-inner flex min-h-0 flex-1 flex-col lg:rounded-3xl lg:border-2 lg:border-white/15 lg:bg-black/15 lg:p-4 lg:backdrop-blur-sm">
            <p className="mb-1 hidden px-1 text-center text-xs font-extrabold uppercase tracking-widest text-white/50 lg:block">
              Pick your answer
            </p>
            <div className="min-h-0 flex-1">{children}</div>
            <p className="mt-2 hidden text-center text-xs font-semibold text-white/40 lg:block">
              Press <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono">1</kbd>–<kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono">4</kbd> or <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono">A</kbd>–<kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono">D</kbd>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
