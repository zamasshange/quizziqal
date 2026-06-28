"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getCategory, type Quiz, type Badge } from "@/lib/quizzes";
import { getQuizProfile, getRevealCategory } from "@/lib/quizProfiles";
import { quizImageFallbacks } from "@/lib/quizImageUrl";
import ContainedPhoto from "@/components/media/ContainedPhoto";
import { prefetchReveal } from "@/lib/revealPrefetch";
import { cardHover, defaultTransition, fadeUp } from "@/lib/motion";
import { useUnlockForHref } from "@/lib/progression/unlockClient";
import LockedContentPreview from "@/components/progression/LockedContentPreview";

const thumbCache = new Map<string, string | null>();

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-xs font-extrabold text-ink/70">
      {rating.toFixed(1)}
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="#ff9f43">
        <path d="M12 2l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.8 6.1 20.8l1.2-6.6L2.5 9l6.6-.9z" />
      </svg>
    </span>
  );
}

function BadgePill({ badge }: { badge: Badge }) {
  const map: Record<Badge, { label: string; className: string }> = {
    AI: { label: "AI GENERATED", className: "bg-grass text-white" },
    HARD: { label: "HARD", className: "bg-ink text-white" },
    EASY: { label: "EASY", className: "bg-answer3 text-ink" },
    PLAYED: { label: "✓ Played", className: "bg-ink text-white" },
  };
  const { label, className } = map[badge];
  return (
    <span
      className={`absolute left-2 top-2 z-10 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${className}`}
    >
      {label}
    </span>
  );
}

type Props = {
  quiz: Quiz;
  index?: number;
};

export default function QuizCard({ quiz, index = 0 }: Props) {
  const tag = getCategory(quiz.category)?.tag ?? "Trivia quiz";
  const profile = getQuizProfile(quiz);
  const revealCategory = getRevealCategory(quiz);
  const [thumbUrl, setThumbUrl] = useState<string | null>(() => {
    const cached = thumbCache.get(profile.thumbnailTerm);
    return cached !== undefined ? cached : null;
  });
  const [srcIndex, setSrcIndex] = useState(0);
  const [showEmoji, setShowEmoji] = useState(() => {
    const cached = thumbCache.get(profile.thumbnailTerm);
    return cached === undefined || !cached;
  });
  const [hover, setHover] = useState(false);
  const href = `/quiz/${quiz.id}`;
  const { unlock, locked } = useUnlockForHref(href);

  const thumbSources = thumbUrl ? quizImageFallbacks(thumbUrl) : [];
  const activeSrc = thumbSources[srcIndex] ?? "";

  useEffect(() => {
    const term = profile.thumbnailTerm;
    if (thumbCache.has(term)) return;

    let cancelled = false;
    fetch(`/api/quiz-image?term=${encodeURIComponent(term)}`)
      .then((r) => r.json())
      .then((d: { image_url?: string | null }) => {
        const url = d.image_url ?? null;
        thumbCache.set(term, url);
        if (!cancelled) {
          setThumbUrl(url);
          setSrcIndex(0);
          setShowEmoji(!url);
        }
      })
      .catch(() => {
        if (!cancelled) setShowEmoji(true);
      });
    return () => {
      cancelled = true;
    };
  }, [profile.thumbnailTerm]);

  function handleThumbError() {
    if (srcIndex + 1 < thumbSources.length) {
      setSrcIndex((i) => i + 1);
      return;
    }
    setShowEmoji(true);
    setThumbUrl(null);
  }

  const imageBox = (
    <motion.div
      className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border-[3px] border-ink shadow-[0_4px_0_0_#0d0d0d]"
      style={{ backgroundColor: quiz.color }}
      variants={cardHover}
      initial="rest"
      whileHover={locked ? "rest" : "hover"}
      whileTap={locked ? "rest" : "tap"}
      transition={defaultTransition}
    >
      {activeSrc ? (
        <>
          <ContainedPhoto
            src={activeSrc}
            alt=""
            className="absolute inset-0 h-full w-full"
            onLoad={() => setShowEmoji(false)}
            onError={handleThumbError}
          />
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
        </>
      ) : (
        <span className="text-6xl drop-shadow-sm md:text-7xl">{quiz.emoji}</span>
      )}
      {quiz.badge && !locked && <BadgePill badge={quiz.badge} />}

      {!locked && (
        <motion.div
          className="pointer-events-none absolute inset-x-2 bottom-2 z-20 rounded-xl border-2 border-ink/80 bg-white/95 p-2.5 shadow-[0_3px_0_0_#0d0d0d] backdrop-blur-sm"
          initial={false}
          animate={{ opacity: hover ? 1 : 0, y: hover ? 0 : 8 }}
          transition={{ duration: 0.2 }}
        >
          <p className="line-clamp-1 text-xs font-extrabold text-ink">
            {profile.previewTitle}
          </p>
          <p className="line-clamp-2 text-[10px] font-semibold leading-snug text-ink/60">
            {profile.previewDetail}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <span className="rounded-md bg-lime/80 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-ink">
              {profile.difficulty}
            </span>
            <span className="rounded-md bg-cream px-1.5 py-0.5 text-[9px] font-bold text-ink/55">
              {profile.questionLabel}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  const body = (
    <>
      {locked && unlock ? (
        <LockedContentPreview unlock={unlock} className="rounded-2xl">
          {imageBox}
        </LockedContentPreview>
      ) : (
        imageBox
      )}
      <div className="flex flex-col gap-0.5 pt-2.5">
        <h3 className="line-clamp-2 text-base font-extrabold leading-tight text-ink">
          {quiz.title}
        </h3>
        <div className="flex items-center gap-2">
          <Stars rating={quiz.rating} />
          <span className="truncate text-xs font-extrabold uppercase tracking-wide text-ink/45">
            {tag}
          </span>
        </div>
        <p className="line-clamp-1 text-[10px] font-semibold text-ink/40">
          {quiz.plays.toLocaleString()} plays · {profile.difficulty}
        </p>
      </div>
    </>
  );

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      transition={{ ...defaultTransition, delay: index * 0.06 }}
      onHoverStart={() => {
        if (locked) return;
        setHover(true);
        prefetchReveal(revealCategory, profile.thumbnailTerm);
        if (thumbUrl) {
          const src = quizImageFallbacks(thumbUrl)[0];
          if (src) {
            const img = new Image();
            img.src = src;
          }
        }
      }}
      onHoverEnd={() => setHover(false)}
      className="flex min-w-0 flex-col"
    >
      {locked ? (
        <div className="flex flex-col">{body}</div>
      ) : (
        <Link href={href} className="group flex flex-col">
          {body}
        </Link>
      )}
    </motion.div>
  );
}
