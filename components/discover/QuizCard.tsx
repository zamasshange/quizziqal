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
    <article className="sonke-related-card group cursor-pointer" onClick={() => onPlay(quiz.id)}>
      <div
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-t-xl"
        style={{ background: quiz.coverGradient }}
      >
        <span className="text-5xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
          {quiz.coverIcon}
        </span>
        {quiz.isFree && (
          <span className="sonke-game-badge absolute bottom-2 left-2 text-[10px]">
            FREE
          </span>
        )}
      </div>
      <p className="MediaItem_heading__AybaX sonke-related-title">{quiz.title}</p>
      <p className="px-2 pb-1 text-center text-[10px] font-semibold text-gray-500">
        {quiz.questionCount} Qs · {formatPlays(quiz.plays)}
      </p>
      <div className="px-2 pb-3 text-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(quiz.id);
          }}
          disabled={loading}
          className="sonke-btn sonke-btn-play text-xs"
          style={{ padding: "0.45rem 1rem" }}
        >
          {loading ? "…" : "▶ Play"}
        </button>
      </div>
    </article>
  );
}
