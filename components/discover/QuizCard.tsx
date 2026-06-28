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
    <article className="quiz-card group flex cursor-pointer flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 lg:rounded-xl">
      <div
        className="relative flex h-24 items-center justify-center lg:h-36"
        style={{ background: quiz.coverGradient }}
      >
        <span className="text-3xl drop-shadow-lg lg:text-5xl">{quiz.coverIcon}</span>
        {quiz.isFree && (
          <span className="absolute bottom-1.5 left-1.5 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-[var(--kahoot-purple)] lg:bottom-2 lg:left-2 lg:px-2 lg:text-xs">
            Free
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5 lg:p-4">
        <h3 className="mb-0.5 line-clamp-2 text-xs font-bold leading-tight text-gray-900 group-hover:text-[var(--kahoot-purple)] lg:mb-1 lg:text-sm">
          {quiz.title}
        </h3>
        <p className="mb-2 text-[10px] text-gray-500 lg:text-xs">by {quiz.creator}</p>

        <div className="mt-auto flex items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 lg:gap-3 lg:text-xs">
            <span className="lg:flex lg:items-center lg:gap-1">
              <span className="hidden lg:inline">
                <QuestionIcon className="h-3.5 w-3.5" />
              </span>
              {quiz.questionCount}
            </span>
            <span className="lg:flex lg:items-center lg:gap-1">
              <span className="hidden lg:inline">
                <PlayIcon className="h-3.5 w-3.5" />
              </span>
              {formatPlays(quiz.plays)}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(quiz.id);
            }}
            disabled={loading}
            className="rounded-full bg-[var(--kahoot-purple)] px-2.5 py-1 text-[10px] font-bold text-white lg:px-4 lg:py-1.5 lg:text-xs lg:opacity-0 lg:transition-all lg:group-hover:opacity-100 lg:hover:bg-[var(--kahoot-purple-dark)] disabled:opacity-50"
          >
            {loading ? "..." : "Play"}
          </button>
        </div>
      </div>
    </article>
  );
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
