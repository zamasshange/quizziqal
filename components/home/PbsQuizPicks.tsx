"use client";

import Link from "next/link";
import type { Quiz } from "@/lib/types";

type PbsQuizPicksProps = {
  quizzes: Quiz[];
};

export default function PbsQuizPicks({ quizzes }: PbsQuizPicksProps) {
  const picks = quizzes.slice(0, 3);

  return (
    <section data-pbsk-content-module="BodyContentModulesVideoContentCards--gridLower" id="quiz-picks">
      <h2 className="GridLowerModule_title__t3oHr">Video Picks of the Week</h2>
      <ul className="GridLowerModule_grid__poJVX">
        {picks.map((quiz, index) => (
          <li key={quiz.id} className="MediaItem_mediaItem__qeyda" data-index={index}>
            <article data-hover-group="media-card" className="MediaItem_videoCard__2gS6g">
              <Link href={`/play/${quiz.id}`} className="MediaItem_mediaItemLink__eujpG block">
                <div
                  className="MediaItem_imageContainer__jWZmZ aspect-video relative overflow-hidden"
                  data-use-loading-dots="true"
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center text-5xl"
                    style={{ background: quiz.coverGradient }}
                    aria-hidden="true"
                  >
                    {quiz.coverIcon}
                  </div>
                  <span className="sr-only">{quiz.title}</span>
                </div>
              </Link>
              <Link
                className="MediaItem_mediaLink__JSobH"
                href={`/play/${quiz.id}`}
              >
                <div className="MediaItem_mediaCardDetailsContainer__OfkVs mediaCardDetails">
                  <p className="MediaItem_heading__AybaX">{quiz.creator}</p>
                  <p>{quiz.title}</p>
                </div>
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
