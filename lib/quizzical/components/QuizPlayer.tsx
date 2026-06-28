"use client";



import { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Quiz } from "@/lib/quizzes";
import { getQuizProfile, getRevealCategory } from "@/lib/quizProfiles";
import { usesAnswerImages, usesQuestionImages } from "@/lib/quizzes";
import { flagImageFromQuery, flagQuizImageFromQuery, isFlagImageQuery } from "@/lib/countryData";
import {
  generateFlagQuestions,
  isFlagsQuiz,
} from "@/lib/flagQuiz";
import { proxiedQuizImageUrl } from "@/lib/quizImageUrl";
import QuestionCountPicker from "./QuestionCountPicker";
import {
  DEFAULT_QUESTION_COUNT,
  type QuestionCount,
} from "@/lib/quizRoundSettings";

import { fetchQuizImage, fetchQuizImages } from "@/lib/quizImages";
import {
  getExcluded,
  playHistoryKey,
  recordSeen,
  rotateExcluded,
} from "@/lib/playHistory";
import { syncContentHistory } from "@/lib/platform/syncContentHistory";

import {
  clearGameSession,
  gameKeyText,
  getGameSession,
  saveGameSession,
  type SavedGameSession,
} from "@/lib/gameProgress";
import { useCompleteGame } from "@/lib/completeGame";
import ContinueGamePrompt from "./ContinueGamePrompt";
import GameHudControls from "./GameHudControls";
import GamePauseOverlay from "./GamePauseOverlay";
import QuizLoadingOverlay from "./progression/QuizLoadingOverlay";
import { recordProgressionEvent } from "@/lib/progression/client";
import { useAtmosphereCategory } from "@/lib/atmosphere/useAtmosphereCategory";
import { prefetchReveal } from "@/lib/revealPrefetch";

import Button3D from "./Button3D";

import RevealCard from "./RevealCard";

import MobileRevealBar from "./MobileRevealBar";

import { playClick, useGameSounds, useQuizFinishSound } from "@/lib/sound";



const ANSWER_STYLES = [

  { bg: "#ff6b6b", shape: "▲" },

  { bg: "#4d8dff", shape: "◆" },

  { bg: "#ffc24b", shape: "●" },

  { bg: "#00a76d", shape: "■" },

];



const QUESTION_SECONDS = 20;

const MAX_POINTS = 1000;

function flagStageUrl(query: string | undefined): string | null {
  if (!query) return null;
  return flagQuizImageFromQuery(query) ?? flagImageFromQuery(query);
}



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
  flagCount = DEFAULT_QUESTION_COUNT,
) {
  const flagsQuiz = isFlagsQuiz(quiz.id);
  const historyKey = playHistoryKey("text", quiz.id);
  const questions = flagsQuiz
    ? generateFlagQuestions(flagCount)
    : prepareTextQuestions(quiz, getExcluded(historyKey).ids);
  const syncFlag = flagStageUrl(questions[0]?.imageQuery ?? "");
  return {
    flagsQuiz,
    questions,
    firstImageUrl:
      syncFlag
        ? proxiedQuizImageUrl(syncFlag)
        : getPrefetchedImage(prefetchedImages, questions[0]?.imageQuery),
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

  const revealCategory = getRevealCategory(quiz);
  const profile = getQuizProfile(quiz);

  const router = useRouter();
  const completeGame = useCompleteGame();
  const gKey = gameKeyText(quiz.id);
  const needsRoundSetup = isFlagsQuiz(quiz.id);
  const canResume = !needsRoundSetup;
  const finishedRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [roundConfigured, setRoundConfigured] = useState(!needsRoundSetup);
  const [questionCount, setQuestionCount] = useState<QuestionCount>(
    DEFAULT_QUESTION_COUNT,
  );
  const [pendingResume, setPendingResume] = useState<SavedGameSession | null>(
    null,
  );
  const [declinedResume, setDeclinedResume] = useState(false);
  const [paused, setPaused] = useState(false);
  const [session, setSession] = useState<ReturnType<typeof initSession> | null>(
    null,
  );
  const flagsQuiz = session?.flagsQuiz ?? isFlagsQuiz(quiz.id);
  const historyKey = playHistoryKey("text", quiz.id);

  const [questions, setQuestions] = useState<typeof quiz.questions>([]);

  const [index, setIndex] = useState(0);

  const [phase, setPhase] = useState<Phase>("playing");

  const [selected, setSelected] = useState<number | null>(null);

  const [score, setScore] = useState(0);

  const [correctCount, setCorrectCount] = useState(0);

  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);

  const [questionImageUrl, setQuestionImageUrl] = useState<string | null>(null);

  const [answerImageUrls, setAnswerImageUrls] = useState<(string | null)[]>([]);

  const [imagesLoading, setImagesLoading] = useState(false);
  const [knowledgeSaved, setKnowledgeSaved] = useState(false);

  useAtmosphereCategory(quiz.category);

  const { playCorrect, playWrong } = useGameSounds();

  useQuizFinishSound(phase, correctCount, questions.length);

  useEffect(() => {
    if (!canResume) return;
    const saved = getGameSession(gKey);
    if (saved?.questionIds?.length) setPendingResume(saved);
  }, [canResume, gKey]);

  useEffect(() => {
    if (!roundConfigured) return;
    if (pendingResume && !declinedResume) return;

    const next = initSession(quiz, prefetchedImages, questionCount);
    setSession(next);
    setQuestions(next.questions);
    setQuestionImageUrl(next.firstImageUrl);
    if (!next.flagsQuiz) {
      recordSeen(historyKey, { ids: next.questions.map((q) => q.id) });
      void syncContentHistory({
        items: next.questions.map((q) => ({
          contentId: q.id,
          contentType: "question",
          category: quiz.category,
        })),
      });
    }
    setReady(true);
  }, [
    quiz,
    prefetchedImages,
    historyKey,
    pendingResume,
    declinedResume,
    roundConfigured,
    questionCount,
  ]);

  useEffect(() => {
    if (!ready || !canResume || phase === "finished" || pendingResume) return;
    saveGameSession({
      gameKey: gKey,
      gameType: "text",
      quizId: quiz.id,
      title: quiz.title,
      emoji: quiz.emoji,
      href: `/quiz/${quiz.id}/play`,
      index,
      phase,
      score,
      correctCount,
      timeLeft,
      selected,
      questionIds: questions.map((q) => q.id),
      updatedAt: Date.now(),
    });
  }, [
    ready,
    canResume,
    phase,
    pendingResume,
    gKey,
    quiz.id,
    quiz.title,
    quiz.emoji,
    index,
    score,
    correctCount,
    timeLeft,
    selected,
    questions,
  ]);

  useEffect(() => {
    if (phase !== "finished" || finishedRef.current) return;
    finishedRef.current = true;
    void completeGame({
      gameKey: gKey,
      gameType: "text",
      quizId: quiz.id,
      title: quiz.title,
      emoji: quiz.emoji,
      href: `/quiz/${quiz.id}/play`,
      score,
      correct: correctCount,
      total: questions.length,
      quizCategory: quiz.category,
      difficulty: profile.difficulty,
    });
  }, [
    phase,
    completeGame,
    gKey,
    quiz.id,
    quiz.title,
    quiz.emoji,
    score,
    correctCount,
    questions.length,
    quiz.category,
    profile.difficulty,
  ]);

  function applyResume(saved: SavedGameSession) {
    const ordered = (saved.questionIds ?? [])
      .map((id) => quiz.questions.find((q) => q.id === id))
      .filter((q): q is (typeof quiz.questions)[number] => !!q);
    if (ordered.length === 0) {
      setDeclinedResume(true);
      setPendingResume(null);
      return;
    }
    setSession({
      flagsQuiz: false,
      questions: ordered,
      firstImageUrl: getPrefetchedImage(
        prefetchedImages,
        ordered[saved.index]?.imageQuery,
      ),
    });
    setQuestions(ordered);
    setIndex(saved.index);
    setPhase(saved.phase);
    setScore(saved.score);
    setCorrectCount(saved.correctCount);
    setTimeLeft(saved.timeLeft);
    setSelected(saved.selected);
    setPendingResume(null);
    setReady(true);
  }



  const visualMode = quiz.visualMode;

  const showQuestionImage = usesQuestionImages(visualMode);

  const showAnswerImages = usesAnswerImages(visualMode);

  /** Only block the UI while assets are actively being fetched (not when cached/prefetched). */
  const waitingForData = Boolean(
    imagesLoading &&
      visualMode &&
      showQuestionImage &&
      !questionImageUrl,
  );



  const question = questions[index];

  const isLast = index === questions.length - 1;



  const lockAnswer = useCallback(

    (choice: number | null) => {

      const current = questions[index];
      if (!current) return;

      if (choice !== null) playClick();

      setPhase("reveal");

      setSelected(choice);

      if (choice !== null && choice === current.correct) {

        const earned = Math.round(

          MAX_POINTS * (0.5 + 0.5 * (timeLeft / QUESTION_SECONDS)),

        );

        setScore((s) => s + earned);

        setCorrectCount((c) => c + 1);

        playCorrect();

        void recordProgressionEvent({
          type: "correct_answer",
          term: current.answers[current.correct],
          category: revealCategory,
          quizCategory: quiz.category,
          quizId: quiz.id,
          difficulty: profile.difficulty,
        }).then((r) => {
          if (r.discovery?.isNew) setKnowledgeSaved(true);
        });

      } else {

        playWrong();

        void recordProgressionEvent({
          type: "wrong_answer",
          quizCategory: quiz.category,
        });

      }

    },

    [questions, index, timeLeft, playCorrect, playWrong, revealCategory, quiz.category, quiz.id, profile.difficulty],

  );



  // Preload next question's educational reveal while player reads current answer
  useEffect(() => {
    if (!ready || phase === "finished") return;
    const current = questions[index];
    if (current) {
      prefetchReveal(revealCategory, current.answers[current.correct]);
    }
    const next = questions[index + 1];
    if (next) {
      prefetchReveal(revealCategory, next.answers[next.correct]);
    }
  }, [ready, index, questions, revealCategory, phase]);



  // Fetch Wikipedia images when the question changes

  useEffect(() => {

    if (!ready || !visualMode) {

      if (!visualMode) {
        setQuestionImageUrl(null);
        setAnswerImageUrls([]);
        setImagesLoading(false);
      }

      return;

    }

    const current = questions[index];
    if (!current) return;

    let cancelled = false;

    const prefetched = getPrefetchedImage(
      prefetchedImages,
      current.imageQuery,
    );

    const syncFlag = flagStageUrl(current.imageQuery ?? "");



    async function loadImages() {

      setAnswerImageUrls([]);

      const tasks: Promise<void>[] = [];



      if (showQuestionImage && current.imageQuery) {

        if (syncFlag) {

          setQuestionImageUrl(proxiedQuizImageUrl(syncFlag));

          setImagesLoading(false);

        } else if (prefetched) {

          setQuestionImageUrl(prefetched);

          setImagesLoading(false);

        } else {

          setQuestionImageUrl(null);

          setImagesLoading(true);

          tasks.push(

            fetchQuizImage(current.imageQuery!).then((result) => {

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

          current.answerImageQueries ??

          current.answers.map((answer) => answer);

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

    ready,

    index,

    questions,

    visualMode,

    showQuestionImage,

    showAnswerImages,

    prefetchedImages,

  ]);



  // Preload every flag in the round so Continue swaps instantly.

  useEffect(() => {

    if (!ready || !flagsQuiz) return;

    for (const q of questions) {

      const url = flagStageUrl(q.imageQuery ?? "");

      if (url) {

        const img = new Image();

        img.src = proxiedQuizImageUrl(url);

      }

    }

  }, [questions, flagsQuiz, ready]);



  // Countdown timer

  useEffect(() => {

    if (!ready || waitingForData || phase !== "playing" || paused) return;

    if (timeLeft <= 0) {

      lockAnswer(null);

      return;

    }

    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);

    return () => clearTimeout(t);

  }, [ready, waitingForData, phase, timeLeft, lockAnswer, paused]);



  function next() {

    if (isLast) {

      setPhase("finished");
      setKnowledgeSaved(false);

      return;

    }

    setIndex((i) => i + 1);

    setSelected(null);

    setTimeLeft(QUESTION_SECONDS);

    setPhase("playing");
    setKnowledgeSaved(false);

  }



  function restart() {
    finishedRef.current = false;
    clearGameSession(gKey);
    setPaused(false);
    if (flagsQuiz) {
      const next = generateFlagQuestions(questionCount);
      setQuestions(next);
      setQuestionImageUrl(
        proxiedQuizImageUrl(flagStageUrl(next[0]?.imageQuery ?? "") ?? ""),
      );
    } else {
      rotateExcluded(historyKey);
      const next = prepareTextQuestions(quiz, getExcluded(historyKey).ids);
      setQuestions(next);
      recordSeen(historyKey, { ids: next.map((q) => q.id) });
      void syncContentHistory({
        items: next.map((q) => ({
          contentId: q.id,
          contentType: "question",
          category: quiz.category,
        })),
      });
    }

    setIndex(0);
    setSelected(null);
    setScore(0);
    setCorrectCount(0);
    setTimeLeft(QUESTION_SECONDS);
    setPhase("playing");
  }



  if (needsRoundSetup && !roundConfigured) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-10 text-center">
        <span className="text-5xl">{quiz.emoji}</span>
        <h2 className="font-display text-2xl font-extrabold">{quiz.title}</h2>
        <p className="font-bold text-ink/60">
          Pick how many flags you want — then play with purpose.
        </p>
        <QuestionCountPicker
          value={questionCount}
          onChange={setQuestionCount}
        />
        <Button3D
          variant="grass"
          size="lg"
          onClick={() => {
            playClick();
            setRoundConfigured(true);
          }}
        >
          ▶ Start
        </Button3D>
      </div>
    );
  }

  if (pendingResume && !declinedResume) {
    return (
      <ContinueGamePrompt
        title={pendingResume.title}
        emoji={pendingResume.emoji}
        progress={`Question ${pendingResume.index + 1} · ${pendingResume.score.toLocaleString()} pts saved`}
        onContinue={() => applyResume(pendingResume)}
        onFresh={() => {
          clearGameSession(gKey);
          setPendingResume(null);
          setDeclinedResume(true);
        }}
      />
    );
  }

  if (!ready || !question) {
    const loadingMsg =
      quiz.category === "geography"
        ? "🌍 Preparing landmarks..."
        : quiz.category === "sports"
          ? "⚽ Gathering player stats..."
          : quiz.category === "history"
            ? "📜 Exploring historical archives..."
            : quiz.category === "science-and-nature"
              ? "🔬 Analyzing discoveries..."
              : "✨ Loading challenge...";
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl border-4 border-ink bg-white p-10 text-center shadow-[0_6px_0_0_#0d0d0d]">
        <span className="text-5xl">{quiz.emoji}</span>
        <p className="font-display text-xl font-extrabold text-ink/60 animate-pulse">
          {loadingMsg}
        </p>
      </div>
    );
  }



  const isFlagQuestion = isFlagImageQuery(question.imageQuery);

  const syncFlagUrl = isFlagQuestion
    ? proxiedQuizImageUrl(flagStageUrl(question.imageQuery!) ?? "")
    : null;

  const displayQuestionImageUrl = syncFlagUrl ?? questionImageUrl;



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

          <Button3D variant="white" size="lg" href="/leaderboard">

            Leaderboard

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

  const isRevealed = phase === "reveal";

  const revealStatus =
    selected === question.correct
      ? "correct"
      : selected === null
        ? "timeout"
        : "wrong";

  const continueLabel = isLast ? "See results" : "Continue →";



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

    <>
      <QuizLoadingOverlay
        open={waitingForData}
        title={quiz.title}
        emoji={quiz.emoji}
        categorySlug={quiz.category}
      />
    <div

      className={`mx-auto flex flex-col gap-5 ${

        hasVisualLayout ? "max-w-5xl" : "max-w-3xl"

      }${isRevealed ? " pb-32 md:pb-0" : ""}`}

    >

      {/* Top bar */}

      <div className="flex items-center justify-between gap-4">

        <div className="flex items-center gap-2">
          <GameHudControls
            paused={paused}
            disabled={phase !== "playing"}
            onTogglePause={() => setPaused((p) => !p)}
          />
          <Link

            href={finalBackHref}

            className="text-sm font-bold text-ink/50 hover:text-ink"

          >

            ✕ Quit

          </Link>
        </div>

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
                    className="block h-auto max-h-56 w-auto max-w-full md:max-h-64"
                    style={{ imageRendering: "auto" }}
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
              <div className="hidden animate-reveal md:block">
                <RevealCard
                  category={revealCategory}
                  term={question.answers[question.correct]}
                  status={revealStatus}
                  continueLabel={continueLabel}
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
            <div className="hidden animate-reveal md:block">
              <RevealCard
                category={revealCategory}
                term={question.answers[question.correct]}
                status={revealStatus}
                continueLabel={continueLabel}
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
            category={revealCategory}
            term={question.answers[question.correct]}
            status={revealStatus}
            continueLabel={continueLabel}
            onContinue={next}
            hideImage={showQuestionImage && !!questionImageUrl}
            variant="content"
            knowledgeSaved={knowledgeSaved}
          />
        </div>
      )}

      {isRevealed && (
        <MobileRevealBar
          status={revealStatus}
          continueLabel={continueLabel}
          onContinue={next}
          knowledgeSaved={knowledgeSaved}
          correctAnswer={
            revealStatus !== "correct"
              ? question.answers[question.correct]
              : undefined
          }
        />
      )}

      {paused && (
        <GamePauseOverlay
          onResume={() => setPaused(false)}
          onQuit={() => {
            setPaused(false);
            router.push(finalBackHref);
          }}
        />
      )}

    </div>
    </>
  );

}


