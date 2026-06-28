"use client";



import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import type { Quiz } from "@/lib/quizzes";
import { usesAnswerImages, usesQuestionImages } from "@/lib/quizzes";
import { flagImageFromQuery, isFlagImageQuery } from "@/lib/countryData";
import {
  generateFlagQuestions,
  isFlagsQuiz,
  FLAGS_PER_ROUND,
} from "@/lib/flagQuiz";

import { fetchQuizImage, fetchQuizImages } from "@/lib/quizImages";
import {
  getExcluded,
  playHistoryKey,
  recordSeen,
  rotateExcluded,
} from "@/lib/playHistory";

import Button3D from "./Button3D";

import RevealCard from "./RevealCard";

import { useGameSounds } from "@/lib/sound";



const ANSWER_STYLES = [

  { bg: "#ff6b6b", shape: "▲" },

  { bg: "#4d8dff", shape: "◆" },

  { bg: "#ffc24b", shape: "●" },

  { bg: "#00a76d", shape: "■" },

];



const QUESTION_SECONDS = 20;

const MAX_POINTS = 1000;



type Phase = "playing" | "reveal" | "finished";



function getPrefetchedImage(
  prefetchedImages: Record<string, string> | undefined,
  imageQuery: string | undefined,
): string | null {
  if (!imageQuery) return null;
  return prefetchedImages?.[imageQuery] ?? null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function prepareTextQuestions(
  quiz: Quiz,
  excludedIds: string[],
): typeof quiz.questions {
  const blocked = new Set(excludedIds);
  const unseen = quiz.questions.filter((q) => !blocked.has(q.id));
  const pool = unseen.length >= quiz.questions.length * 0.4 ? unseen : quiz.questions;
  return shuffle(pool);
}

function initSession(
  quiz: Quiz,
  prefetchedImages?: Record<string, string>,
) {
  const flagsQuiz = isFlagsQuiz(quiz.id);
  const historyKey = playHistoryKey("text", quiz.id);
  const questions = flagsQuiz
    ? generateFlagQuestions(FLAGS_PER_ROUND)
    : prepareTextQuestions(quiz, getExcluded(historyKey).ids);
  const syncFlag = flagImageFromQuery(questions[0]?.imageQuery ?? "");
  return {
    flagsQuiz,
    questions,
    firstImageUrl:
      syncFlag ??
      getPrefetchedImage(prefetchedImages, questions[0]?.imageQuery),
  };
}

export default function QuizPlayer({

  quiz,

  backHref,

  backLabel,

  prefetchedImages,

}: {

  quiz: Quiz;

  backHref?: string;

  backLabel?: string;

  /** imageQuery → URL, prefetched on the server for visual quizzes */
  prefetchedImages?: Record<string, string>;

}) {

  const finalBackHref = backHref ?? `/quiz/${quiz.id}`;

  const finalBackLabel = backLabel ?? "Back to quiz";

  const [session] = useState(() => initSession(quiz, prefetchedImages));
  const flagsQuiz = session.flagsQuiz;
  const historyKey = playHistoryKey("text", quiz.id);

  const [questions, setQuestions] = useState(session.questions);

  const [index, setIndex] = useState(0);

  const [phase, setPhase] = useState<Phase>("playing");

  const [selected, setSelected] = useState<number | null>(null);

  const [score, setScore] = useState(0);

  const [correctCount, setCorrectCount] = useState(0);

  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);

  const [questionImageUrl, setQuestionImageUrl] = useState<string | null>(
    session.firstImageUrl,
  );

  const [answerImageUrls, setAnswerImageUrls] = useState<(string | null)[]>([]);

  const [imagesLoading, setImagesLoading] = useState(false);

  const { playCorrect, playWrong } = useGameSounds();

  useEffect(() => {
    if (!flagsQuiz) {
      recordSeen(historyKey, { ids: questions.map((q) => q.id) });
    }
    // Record the first round only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const visualMode = quiz.visualMode;

  const showQuestionImage = usesQuestionImages(visualMode);

  const showAnswerImages = usesAnswerImages(visualMode);



  const question = questions[index];

  const isLast = index === questions.length - 1;

  const isFlagQuestion = isFlagImageQuery(question.imageQuery);

  const syncFlagUrl = isFlagQuestion
    ? flagImageFromQuery(question.imageQuery!)
    : null;

  const displayQuestionImageUrl = syncFlagUrl ?? questionImageUrl;



  const lockAnswer = useCallback(

    (choice: number | null) => {

      setPhase("reveal");

      setSelected(choice);

      if (choice !== null && choice === question.correct) {

        const earned = Math.round(

          MAX_POINTS * (0.5 + 0.5 * (timeLeft / QUESTION_SECONDS)),

        );

        setScore((s) => s + earned);

        setCorrectCount((c) => c + 1);

        playCorrect();

      } else {

        playWrong();

      }

    },

    [question, timeLeft, playCorrect, playWrong],

  );



  // Fetch Wikipedia images when the question changes

  useEffect(() => {

    if (!visualMode) {

      setQuestionImageUrl(null);

      setAnswerImageUrls([]);

      setImagesLoading(false);

      return;

    }



    let cancelled = false;

    const prefetched = getPrefetchedImage(
      prefetchedImages,
      question.imageQuery,
    );

    const syncFlag = flagImageFromQuery(question.imageQuery ?? "");



    async function loadImages() {

      setAnswerImageUrls([]);

      const tasks: Promise<void>[] = [];



      if (showQuestionImage && question.imageQuery) {

        if (syncFlag) {

          setQuestionImageUrl(syncFlag);

          setImagesLoading(false);

        } else if (prefetched) {

          setQuestionImageUrl(prefetched);

          setImagesLoading(false);

        } else {

          setQuestionImageUrl(null);

          setImagesLoading(true);

          tasks.push(

            fetchQuizImage(question.imageQuery!).then((result) => {

              if (!cancelled && result?.image_url) {

                setQuestionImageUrl(result.image_url);

              }

            }),

          );

        }

      } else {

        setQuestionImageUrl(null);

        setImagesLoading(false);

      }



      if (showAnswerImages) {

        const queries =

          question.answerImageQueries ??

          question.answers.map((answer) => answer);

        tasks.push(

          fetchQuizImages(queries).then((results) => {

            if (!cancelled) {

              setAnswerImageUrls(

                results.map((r) => r?.image_url ?? null),

              );

            }

          }),

        );

      }



      if (tasks.length > 0) {

        await Promise.all(tasks);

        if (!cancelled) setImagesLoading(false);

      }

    }



    loadImages();

    return () => {

      cancelled = true;

    };

  }, [

    index,

    visualMode,

    showQuestionImage,

    showAnswerImages,

    question.imageQuery,

    question.answerImageQueries,

    question.answers,

    prefetchedImages,

  ]);



  // Preload every flag in the round so Continue swaps instantly.

  useEffect(() => {

    if (!flagsQuiz) return;

    for (const q of questions) {

      const url = flagImageFromQuery(q.imageQuery ?? "");

      if (url) {

        const img = new Image();

        img.src = url;

      }

    }

  }, [questions, flagsQuiz]);



  // Countdown timer

  useEffect(() => {

    if (phase !== "playing") return;

    if (timeLeft <= 0) {

      lockAnswer(null);

      return;

    }

    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);

    return () => clearTimeout(t);

  }, [phase, timeLeft, lockAnswer]);



  function next() {

    if (isLast) {

      setPhase("finished");

      return;

    }

    setIndex((i) => i + 1);

    setSelected(null);

    setTimeLeft(QUESTION_SECONDS);

    setPhase("playing");

  }



  function restart() {
    if (flagsQuiz) {
      const next = generateFlagQuestions(FLAGS_PER_ROUND);
      setQuestions(next);
      setQuestionImageUrl(flagImageFromQuery(next[0]?.imageQuery ?? ""));
    } else {
      rotateExcluded(historyKey);
      const next = prepareTextQuestions(quiz, getExcluded(historyKey).ids);
      setQuestions(next);
      recordSeen(historyKey, { ids: next.map((q) => q.id) });
    }

    setIndex(0);
    setSelected(null);
    setScore(0);
    setCorrectCount(0);
    setTimeLeft(QUESTION_SECONDS);
    setPhase("playing");
  }



  if (phase === "finished") {

    const total = questions.length;

    const pct = Math.round((correctCount / total) * 100);

    const message =

      pct === 100

        ? "Perfect score! 🏆"

        : pct >= 60

          ? "Great job! 🎉"

          : "Keep practising! 💪";



    return (

      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 rounded-3xl border-4 border-ink bg-white p-8 text-center shadow-[0_6px_0_0_#0d0d0d]">

        <span className="text-6xl">{quiz.emoji}</span>

        <h2 className="font-display text-3xl font-extrabold">{message}</h2>

        <div className="flex w-full justify-center gap-8">

          <div>

            <div className="font-display text-4xl font-extrabold text-grass">

              {score.toLocaleString()}

            </div>

            <div className="text-xs font-bold uppercase tracking-wide text-ink/50">

              Points

            </div>

          </div>

          <div>

            <div className="font-display text-4xl font-extrabold">

              {correctCount}/{total}

            </div>

            <div className="text-xs font-bold uppercase tracking-wide text-ink/50">

              Correct

            </div>

          </div>

        </div>

        <div className="flex flex-wrap justify-center gap-3">

          <Button3D variant="grass" size="lg" onClick={restart}>

            Play again

          </Button3D>

          <Button3D variant="white" size="lg" href={finalBackHref}>

            {finalBackLabel}

          </Button3D>

        </div>

      </div>

    );

  }



  const hasVisualLayout = showQuestionImage;

  const lowTime = timeLeft <= 5;

  const timerFrac = Math.max(0, timeLeft / QUESTION_SECONDS);



  const answerButtons = question.answers.map((answer, i) => {

    const style = ANSWER_STYLES[i % 4];

    const revealed = phase === "reveal";

    const isCorrect = i === question.correct;

    const isChosen = i === selected;

    const thumbUrl = showAnswerImages ? answerImageUrls[i] : null;



    let stateClass = "";

    if (revealed) {

      if (isCorrect) stateClass = "ring-4 ring-ink scale-[1.02]";

      else if (isChosen) stateClass = "opacity-50";

      else stateClass = "opacity-40";

    }



    return (

      <button

        key={i}

        type="button"

        disabled={revealed}

        onClick={() => lockAnswer(i)}

        className={`flex items-center gap-3 rounded-2xl border-4 border-ink p-4 text-left font-extrabold text-ink transition-all duration-150 ${stateClass} ${

          revealed ? "cursor-default" : "hover:-translate-y-0.5"

        }`}

        style={{ backgroundColor: style.bg }}

      >

        {thumbUrl ? (

          <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-ink bg-white">

            {/* eslint-disable-next-line @next/next/no-img-element */}

            <img

              src={thumbUrl}

              alt=""

              className="h-full w-full object-cover"

            />

          </span>

        ) : (

          <span className="text-xl">{style.shape}</span>

        )}

        <span className="flex-1 text-base md:text-lg">{answer}</span>

        {revealed && isCorrect && <span className="text-2xl">✓</span>}

        {revealed && isChosen && !isCorrect && (

          <span className="text-2xl">✕</span>

        )}

      </button>

    );

  });



  return (

    <div

      className={`mx-auto flex flex-col gap-5 ${

        hasVisualLayout ? "max-w-5xl" : "max-w-3xl"

      }`}

    >

      {/* Top bar */}

      <div className="flex items-center justify-between gap-4">

        <Link

          href={finalBackHref}

          className="text-sm font-bold text-ink/50 hover:text-ink"

        >

          ✕ Quit

        </Link>

        <div className="flex items-center gap-2 text-sm font-extrabold">

          <span className="rounded-full bg-ink px-3 py-1 text-white">

            {score.toLocaleString()} pts

          </span>

          <span className="text-ink/60">

            {index + 1} / {questions.length}

          </span>

        </div>

      </div>



      {hasVisualLayout ? (

        /* Visual layout — image + question caption, answers beside */

        <div className="grid items-center gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">

          <div className={isFlagQuestion ? "relative mx-auto w-fit max-w-full" : "relative"}>

            {/* Countdown ring */}

            <div className="absolute -right-2 -top-2 z-20 sm:-right-3 sm:-top-3">

              <div className="relative h-14 w-14 sm:h-16 sm:w-16">

                <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">

                  <circle

                    cx="28"

                    cy="28"

                    r="24"

                    fill="#fffdf4"

                    stroke="#0a0a0a"

                    strokeWidth="4"

                  />

                  <circle

                    cx="28"

                    cy="28"

                    r="24"

                    fill="none"

                    stroke={lowTime ? "#ff6b6b" : "#5b19df"}

                    strokeWidth="4"

                    strokeLinecap="round"

                    strokeDasharray={2 * Math.PI * 24}

                    strokeDashoffset={2 * Math.PI * 24 * (1 - timerFrac)}

                    className="transition-[stroke-dashoffset] duration-1000 ease-linear"

                  />

                </svg>

                <span

                  className={`absolute inset-0 flex items-center justify-center font-display text-xl font-extrabold tabular-nums ${

                    lowTime ? "text-answer1" : "text-ink"

                  }`}

                >

                  {timeLeft}

                </span>

              </div>

            </div>



            {isFlagQuestion ? (
              <div className="inline-block leading-none overflow-hidden rounded-2xl border-4 border-ink bg-white shadow-[0_6px_0_0_#0d0d0d]">
                {displayQuestionImageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={question.id}
                    src={displayQuestionImageUrl}
                    alt="Country flag"
                    loading="eager"
                    decoding="sync"
                    className="block h-44 w-auto md:h-52"
                  />
                ) : (
                  <div className="flex h-44 w-64 items-center justify-center bg-cream-dark">
                    <span className="font-display text-sm font-extrabold text-ink/40">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>
            ) : (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border-4 border-ink bg-ink shadow-[0_6px_0_0_#0d0d0d]">

              {imagesLoading && !questionImageUrl ? (

                <div className="flex h-full items-center justify-center bg-cream-dark">

                  <span className="font-display text-lg font-extrabold text-ink/40">

                    Loading image…

                  </span>

                </div>

              ) : questionImageUrl ? (

                <>

                  {/* eslint-disable-next-line @next/next/no-img-element */}

                  <img

                    aria-hidden

                    src={questionImageUrl}

                    alt=""

                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-xl"

                  />

                  {/* eslint-disable-next-line @next/next/no-img-element */}

                  <img

                    key={question.id}

                    src={questionImageUrl}

                    alt="Guess from this image"

                    loading="lazy"

                    className="animate-quiz-pop relative h-full w-full object-contain"

                  />

                </>

              ) : (

                <div className="flex h-full items-center justify-center bg-cream-dark">

                  <span className="font-display text-lg font-extrabold text-ink/40">

                    Image unavailable

                  </span>

                </div>

              )}

            </div>
            )}

            <div className="relative z-10 -mt-5 flex justify-center px-4">

              <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border-4 border-ink bg-white px-5 py-2.5 text-center shadow-[0_5px_0_0_#0d0d0d]">

                <span className="font-display text-base font-extrabold leading-snug text-ink md:text-xl">

                  {question.text}

                </span>

              </div>

            </div>

          </div>



          <div className="flex flex-col gap-3">
            {answerButtons}

            {phase === "reveal" && (
              <div className="animate-reveal">
                <RevealCard
                  category={quiz.category}
                  term={question.answers[question.correct]}
                  status={
                    selected === question.correct
                      ? "correct"
                      : selected === null
                        ? "timeout"
                        : "wrong"
                  }
                  continueLabel={isLast ? "See results" : "Continue →"}
                  onContinue={next}
                  variant="actions"
                />
              </div>
            )}
          </div>
        </div>
      ) : (

        /* Text-only layout (default) */

        <>

          <div className="h-3 w-full overflow-hidden rounded-full border-2 border-ink bg-white">

            <div

              className="h-full rounded-full bg-grass transition-[width] duration-1000 ease-linear"

              style={{ width: `${(timeLeft / QUESTION_SECONDS) * 100}%` }}

            />

          </div>



          <div className="flex min-h-28 items-center justify-center rounded-2xl border-4 border-ink bg-white p-6 text-center shadow-[0_4px_0_0_#0d0d0d]">

            <h2 className="font-display text-xl font-extrabold leading-snug md:text-2xl">

              {question.text}

            </h2>

          </div>



          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

            {answerButtons}

          </div>

          {phase === "reveal" && (
            <div className="animate-reveal">
              <RevealCard
                category={quiz.category}
                term={question.answers[question.correct]}
                status={
                  selected === question.correct
                    ? "correct"
                    : selected === null
                      ? "timeout"
                      : "wrong"
                }
                continueLabel={isLast ? "See results" : "Continue →"}
                onContinue={next}
                variant="actions"
              />
            </div>
          )}

        </>

      )}



      {/* Reveal: educational content below the play area (continue stays with answers) */}
      {phase === "reveal" && (
        <div className="animate-reveal">
          <RevealCard
            category={quiz.category}
            term={question.answers[question.correct]}
            status={
              selected === question.correct
                ? "correct"
                : selected === null
                  ? "timeout"
                  : "wrong"
            }
            continueLabel={isLast ? "See results" : "Continue →"}
            onContinue={next}
            hideImage={showQuestionImage && !!questionImageUrl}
            variant="content"
          />
        </div>
      )}

    </div>

  );

}


