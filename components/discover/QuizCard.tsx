"use client";

import { Quiz } from "@/lib/types";
import { formatPlays } from "@/lib/quizzes";

interface QuizCardProps {
  quiz: Quiz;
  onPlay: (quizId: string) => void;
  loading?: boolean;
}

export default function QuizCard({ quiz, onPlay, loading }: QuizCardProps) {
  return (
    <article className="quiz-card group flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-md lg:rounded-2xl">
      <div
        className="relative flex h-24 items-center justify-center overflow-hidden lg:h-36"
        style={{ background: quiz.coverGradient }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        />
        <span className="relative z-10 text-4xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110 lg:text-5xl">
          {quiz.coverIcon}
        </span>
        {quiz.isFree && (
          <span className="absolute bottom-2 left-2 z-10 rounded-full border-2 border-white/50 bg-white/95 px-2 py-0.5 text-[10px] font-extrabold text-[var(--kahoot-purple)] shadow-sm lg:text-xs">
            FREE
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col border-t-2 border-purple-100 p-2.5 lg:p-4">
        <h3 className="mb-0.5 line-clamp-2 text-xs font-extrabold leading-tight text-gray-900 group-hover:text-[var(--kahoot-purple)] lg:mb-1 lg:text-sm">
          {quiz.title}
        </h3>
        <p className="mb-2 text-[10px] font-medium text-gray-400 lg:text-xs">
          by {quiz.creator}
        </p>

        <div className="mt-auto flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400 lg:gap-3 lg:text-xs">
            <span>{quiz.questionCount} Qs</span>
            <span>·</span>
            <span>{formatPlays(quiz.plays)}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(quiz.id);
            }}
            disabled={loading}
            className="game-pill rounded-full bg-[var(--kahoot-purple)] px-3 py-1 text-[10px] font-extrabold text-white lg:px-4 lg:py-1.5 lg:text-xs lg:opacity-0 lg:transition-all lg:group-hover:opacity-100 disabled:opacity-50"
          >
            {loading ? "…" : "▶ Play"}
          </button>
        </div>
      </div>
    </article>
  );
}
