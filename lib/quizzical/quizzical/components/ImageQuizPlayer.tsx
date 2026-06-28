"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Button3D from "./Button3D";
import RevealCard from "./RevealCard";
import { useGameSounds } from "@/lib/sound";
import {
  getExcluded,
  playHistoryKey,
  recordSeen,
  rotateExcluded,
} from "@/lib/playHistory";
import type { GameMode } from "@/lib/imageQuestions";

type SourceQuestion = {
  id: string;
  image_url: string;
  question: string;
  correct_answer: string;
  wrong_answers: string[];
  reveal_image_url?: string;
  hint?: string;
};

type Difficulty = "Easy" | "Medium" | "Hard";
const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

const ANSWER_STYLES = [
  { bg: "#ff6b6b", shape: "▲", key: "A" },
  { bg: "#4d8dff", shape: "◆", key: "B" },
  { bg: "#ffc24b", shape: "●", key: "C" },
  { bg: "#00a76d", shape: "■", key: "D" },
];

const QUESTION_SECONDS = 20;
const MAX_POINTS = 1000;
const MAX_QUESTIONS = 10;

type Phase = "playing" | "reveal" | "finished";
type Status = "setup" | "loading" | "ready" | "empty" | "error";

type PreparedQuestion = {
  id: string;
  image_url: string;
  reveal_image_url?: string;
  question: string;
  answers: string[];
  correct: number;
  hint?: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function prepare(rows: SourceQuestion[]): PreparedQuestion[] {
  return shuffle(rows)
    .slice(0, MAX_QUESTIONS)
    .map((row) => {
      const answers = shuffle([row.correct_answer, ...row.wrong_answers]);
      return {
        id: row.id,
        image_url: row.image_url,
        reveal_image_url: row.reveal_image_url,
        question: row.question,
        answers,
        correct: answers.indexOf(row.correct_answer),
        hint: row.hint,
      };
    });
}

export default function ImageQuizPlayer({ mode }: { mode: GameMode }) {
  const [status, setStatus] = useState<Status>("setup");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [questions, setQuestions] = useState<PreparedQuestion[]>([]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);
  const [showHint, setShowHint] = useState(false);
  const { playCorrect, playWrong } = useGameSounds();

  const loadQuestions = useCallback(
    async (level: Difficulty, rotate = false) => {
      setStatus("loading");
      const historyKey = playHistoryKey("image", mode.category, level);
      if (rotate) rotateExcluded(historyKey);
      const excluded = getExcluded(historyKey);

      try {
        const params = new URLSearchParams({
          category: mode.category,
          count: "10",
          difficulty: level,
        });
        for (const answer of excluded.answers) {
          params.append("excludeAnswer", answer);
        }
        for (const image of excluded.images) {
          params.append("excludeImage", image);
        }

        const res = await fetch(`/api/image-quiz?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Request failed");
        const data: { questions: SourceQuestion[] } = await res.json();
        const prepared = prepare(data.questions ?? []);
        if (prepared.length === 0) {
          setStatus("empty");
          return;
        }

        recordSeen(historyKey, {
          answers: prepared.map((q) => q.answers[q.correct]),
          images: prepared.map((q) => q.image_url),
          ids: prepared.map((q) => q.id),
        });

        setQuestions(prepared);
        setIndex(0);
        setSelected(null);
        setScore(0);
        setCorrectCount(0);
        setTimeLeft(QUESTION_SECONDS);
        setShowHint(false);
        setPhase("playing");
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    },
    [mode.category],
  );

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const lockAnswer = useCallback(
    (choice: number | null) => {
      if (!question) return;
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

  useEffect(() => {
    if (status !== "ready") return;
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      lockAnswer(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [status, phase, timeLeft, lockAnswer]);

  // Keyboard shortcuts: 1-4 / A-D to answer, Enter to advance on reveal.
  useEffect(() => {
    if (status !== "ready" || !question) return;
    const map: Record<string, number> = {
      "1": 0,
      "2": 1,
      "3": 2,
      "4": 3,
      a: 0,
      b: 1,
      c: 2,
      d: 3,
    };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (phase === "playing" && k in map && map[k] < question.answers.length) {
        lockAnswer(map[k]);
      } else if (phase === "reveal" && (k === "enter" || k === " ")) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, phase, question, lockAnswer]);

  function next() {
    if (isLast) {
      setPhase("finished");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setTimeLeft(QUESTION_SECONDS);
    setShowHint(false);
    setPhase("playing");
  }

  function restart() {
    void loadQuestions(difficulty, true);
  }

  if (status === "setup") {
    return (
      <Centered>
        <span className="text-5xl">{mode.emoji}</span>
        <h2 className="font-display text-2xl font-extrabold">{mode.title}</h2>
        <p className="font-bold text-ink/60">Choose a difficulty to start.</p>
        <div className="flex w-full max-w-xs flex-col gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`rounded-xl border-[3px] border-ink py-2.5 text-base font-extrabold transition-colors ${
                difficulty === d
                  ? "bg-grass text-white"
                  : "bg-cream text-ink hover:bg-cream-dark"
              }`}
            >
              {d}
              <span className="ml-2 text-xs font-bold opacity-70">
                {d === "Easy"
                  ? "household names"
                  : d === "Medium"
                    ? "well-known"
                    : "deep cuts"}
              </span>
            </button>
          ))}
        </div>
        <Button3D
          variant="grass"
          size="lg"
          onClick={() => loadQuestions(difficulty)}
        >
          ▶ Start
        </Button3D>
      </Centered>
    );
  }

  if (status === "loading") {
    return (
      <Centered>
        <span className="text-5xl">{mode.emoji}</span>
        <p className="font-display text-xl font-extrabold text-ink/60">
          Building your {difficulty} quiz…
        </p>
      </Centered>
    );
  }

  if (status === "error") {
    return (
      <Centered>
        <span className="text-5xl">😵</span>
        <h2 className="font-display text-2xl font-extrabold">
          Couldn&apos;t load questions
        </h2>
        <Button3D
          variant="grass"
          size="lg"
          onClick={() => loadQuestions(difficulty)}
        >
          Try again
        </Button3D>
      </Centered>
    );
  }

  if (status === "empty") {
    return (
      <Centered>
        <span className="text-5xl">{mode.emoji}</span>
        <h2 className="font-display text-2xl font-extrabold">
          Couldn&apos;t build a quiz
        </h2>
        <p className="font-bold text-ink/60">
          We couldn&apos;t reach the image source right now. Please try again.
        </p>
        <Button3D
          variant="grass"
          size="lg"
          onClick={() => setStatus("setup")}
        >
          Back
        </Button3D>
      </Centered>
    );
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
        <span className="text-6xl">{mode.emoji}</span>
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
          <Button3D variant="white" size="lg" onClick={() => setStatus("setup")}>
            Change difficulty
          </Button3D>
          <Button3D variant="white" size="lg" href="/">
            Back home
          </Button3D>
        </div>
      </div>
    );
  }

  const revealed = phase === "reveal";
  const showReveal = revealed && !!question.reveal_image_url;
  const displaySrc = showReveal
    ? (question.reveal_image_url as string)
    : question.image_url;
  const lowTime = timeLeft <= 5;
  const timerFrac = Math.max(0, timeLeft / QUESTION_SECONDS);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      {/* HUD — quit, segmented progress, difficulty + score */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 shrink-0 items-center rounded-full border-2 border-ink/15 px-3 text-sm font-extrabold text-ink/50 transition-colors hover:border-ink hover:text-ink"
        >
          ✕<span className="ml-1 hidden sm:inline">Quit</span>
        </Link>

        <div className="flex flex-1 items-center gap-1">
          {questions.map((_, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                i < index
                  ? "bg-grass"
                  : i === index
                    ? "bg-lime"
                    : "bg-cream-dark"
              }`}
            />
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 text-sm font-extrabold">
          <span className="hidden rounded-full border-2 border-ink bg-lime px-2.5 py-0.5 text-xs uppercase tracking-wide text-ink sm:inline">
            {difficulty}
          </span>
          <span className="rounded-full bg-ink px-3 py-1 text-white tabular-nums">
            {score.toLocaleString()}
            <span className="ml-1 text-[10px] uppercase opacity-60">pts</span>
          </span>
        </div>
      </div>

      {/* Play area — image on the left, answers on the right (stacks on mobile) */}
      <div className="grid items-center gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
      {/* Stage — image with a floating countdown ring + question caption */}
      <div className="relative">
        {/* Countdown ring, perched on the top-right corner of the frame */}
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

        {/* Image — swaps to the reveal image (e.g. the poster) once locked in */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border-4 border-ink bg-ink shadow-[0_6px_0_0_#0d0d0d]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            aria-hidden
            src={displaySrc}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-35 blur-xl"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${question.id}-${showReveal ? "reveal" : "main"}`}
            src={displaySrc}
            alt={showReveal ? "Answer reveal" : "Guess from this image"}
            loading="lazy"
            className="animate-quiz-pop relative h-full w-full object-contain"
          />
        </div>

        {/* Question caption — overlaps the bottom edge to tie image to answers */}
        <div className="relative z-10 -mt-5 flex justify-center px-4">
          <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border-4 border-ink bg-white px-5 py-2.5 text-center shadow-[0_5px_0_0_#0d0d0d]">
            <span className="font-display text-base font-extrabold leading-snug text-ink md:text-xl">
              {question.question}
            </span>
          </div>
        </div>
      </div>

      {/* Right panel — hint, answers, and the reveal call-to-action */}
      <div className="flex flex-col gap-3">
      {/* Hint (movies) — opt-in so it doesn't spoil the challenge */}
      {question.hint && phase === "playing" && (
        <div className="text-center">
          {showHint ? (
            <p className="inline-block rounded-xl border-2 border-ink/15 bg-lime/40 px-3 py-2 text-sm font-bold text-ink">
              💡 {question.hint}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="text-sm font-extrabold text-ink/60 underline hover:text-ink"
            >
              💡 Need a hint?
            </button>
          )}
        </div>
      )}

      {/* Answers */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {question.answers.map((answer, i) => {
          const style = ANSWER_STYLES[i % 4];
          const isCorrect = i === question.correct;
          const isChosen = i === selected;

          let stateClass =
            "shadow-[0_5px_0_0_#0d0d0d] hover:-translate-y-1 hover:shadow-[0_7px_0_0_#0d0d0d] active:translate-y-1 active:shadow-[0_1px_0_0_#0d0d0d]";
          if (revealed) {
            if (isCorrect)
              stateClass =
                "animate-quiz-correct shadow-[0_5px_0_0_#0d0d0d] ring-4 ring-ink ring-offset-2 ring-offset-cream";
            else if (isChosen) stateClass = "opacity-50 shadow-none";
            else stateClass = "opacity-35 shadow-none";
          }

          return (
            <button
              key={i}
              type="button"
              disabled={revealed}
              onClick={() => lockAnswer(i)}
              className={`flex items-center gap-3 rounded-2xl border-4 border-ink p-3 text-left font-extrabold text-ink transition-all duration-100 ${stateClass} ${
                revealed ? "cursor-default" : ""
              }`}
              style={{ backgroundColor: style.bg }}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-ink bg-white/85 text-lg leading-none text-ink">
                {style.shape}
              </span>
              <span className="flex-1 text-base md:text-lg">{answer}</span>
              {revealed ? (
                isCorrect ? (
                  <span className="text-xl">✓</span>
                ) : isChosen ? (
                  <span className="text-xl">✕</span>
                ) : null
              ) : (
                <kbd className="hidden h-6 w-6 shrink-0 place-items-center rounded-md border-2 border-ink/20 bg-white/40 text-xs sm:grid">
                  {style.key}
                </kbd>
              )}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="animate-reveal">
          <RevealCard
            category={mode.category}
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

      {/* Educational reveal content below the play area */}
      {revealed && (
        <div className="animate-reveal mx-auto w-full max-w-2xl">
          <RevealCard
            category={mode.category}
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
            hideImage
            variant="content"
          />
        </div>
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-3xl border-4 border-ink bg-white p-10 text-center shadow-[0_6px_0_0_#0d0d0d]">
      {children}
    </div>
  );
}
