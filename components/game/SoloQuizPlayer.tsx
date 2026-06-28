"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Question, Quiz } from "@/lib/types";
import {
  DEFAULT_DIFFICULTY,
  DEFAULT_QUESTION_COUNT,
  DEFAULT_TIMER,
  type Difficulty,
  type QuestionCount,
  type TimerSeconds,
} from "@/lib/roundSettings";
import RoundSetup from "./RoundSetup";
import GameHud from "./GameHud";
import GameFooter from "./GameFooter";
import GamePauseOverlay from "./GamePauseOverlay";
import AnswerButtons from "./AnswerButtons";
import QuestionImage from "./QuestionImage";
import RevealPanel from "./RevealPanel";

type Phase = "setup" | "loading" | "playing" | "reveal" | "finished";

function scoreAnswer(timeMs: number, timeLimit: number, streak: number): number {
  const base = 1000;
  const timeBonus = Math.max(0, Math.floor((1 - timeMs / (timeLimit * 1000)) * 500));
  const streakBonus = Math.min(streak, 3) * 100;
  return base + timeBonus + streakBonus;
}

type Props = {
  gameId: string;
  templateQuiz: Quiz;
};

export default function SoloQuizPlayer({ gameId, templateQuiz }: Props) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [questionCount, setQuestionCount] =
    useState<QuestionCount>(DEFAULT_QUESTION_COUNT);
  const [timerSeconds, setTimerSeconds] = useState<TimerSeconds>(DEFAULT_TIMER);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_TIMER);
  const [paused, setPaused] = useState(false);
  const questionStartedAt = useRef(Date.now());

  const question = questions[index];
  const isLast = index >= questions.length - 1;
  const hasImage = !!(question?.image || question?.imageQuery);
  const revealCategory =
    quiz?.revealCategory ?? quiz?.tags[0] ?? quiz?.category.toLowerCase() ?? "trivia";

  const startRound = async () => {
    setPhase("loading");
    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "prepare",
          settings: { count: questionCount, difficulty, timerSeconds },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhase("setup");
        return;
      }
      setQuiz(data.quiz);
      setQuestions(data.quiz.questions);
      setIndex(0);
      setSelected(null);
      setScore(0);
      setStreak(0);
      setCorrectCount(0);
      setTimeLeft(timerSeconds);
      questionStartedAt.current = Date.now();
      setPhase("playing");
    } catch {
      setPhase("setup");
    }
  };

  const lockAnswer = useCallback(
    (answerIndex: number) => {
      if (!question || phase !== "playing" || selected !== null) return;
      const timeMs = Date.now() - questionStartedAt.current;
      const correct = question.answers[answerIndex]?.correct ?? false;
      setSelected(answerIndex);
      if (correct) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        setCorrectCount((c) => c + 1);
        setScore((s) => s + scoreAnswer(timeMs, question.timeLimit, newStreak));
      } else {
        setStreak(0);
      }
      setPhase("reveal");
    },
    [question, phase, selected, streak]
  );

  const goNext = useCallback(() => {
    if (isLast) {
      setPhase("finished");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setTimeLeft(timerSeconds);
    questionStartedAt.current = Date.now();
    setPhase("playing");
  }, [isLast, timerSeconds]);

  const goPrevious = useCallback(() => {
    if (index <= 0) return;
    setIndex((i) => i - 1);
    setSelected(null);
    setTimeLeft(timerSeconds);
    questionStartedAt.current = Date.now();
    setPhase("playing");
  }, [index, timerSeconds]);

  useEffect(() => {
    if (phase !== "playing" || paused || selected !== null || !question) return;

    const tick = () => {
      const elapsed = (Date.now() - questionStartedAt.current) / 1000;
      const remaining = Math.max(0, question.timeLimit - elapsed);
      setTimeLeft(Math.ceil(remaining));
      if (remaining <= 0) {
        setSelected(null);
        setStreak(0);
        setPhase("reveal");
      }
    };

    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [phase, paused, selected, question, index]);

  useEffect(() => {
    if (paused) return;
    const map: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (phase === "playing" && k in map && map[k] < (question?.answers.length ?? 0)) {
        lockAnswer(map[k]);
      }
      if (phase === "reveal" && (k === "Enter" || k === " ")) {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, paused, question, lockAnswer, goNext]);

  if (phase === "setup") {
    return (
      <RoundSetup
        quiz={templateQuiz}
        difficulty={difficulty}
        questionCount={questionCount}
        timerSeconds={timerSeconds}
        loading={false}
        onDifficulty={setDifficulty}
        onQuestionCount={setQuestionCount}
        onTimer={setTimerSeconds}
        onStart={startRound}
      />
    );
  }

  if (phase === "loading") {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center text-white"
        style={{
          background:
            "linear-gradient(160deg, #46178f 0%, #6b2fd6 50%, #33348e 100%)",
        }}
      >
        <div className="mb-4 text-5xl animate-wiggle">🎯</div>
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
        <p className="font-extrabold">Building your quiz…</p>
      </div>
    );
  }

  if (phase === "finished" && quiz) {
    const total = questions.length;
    const pct = total ? Math.round((correctCount / total) * 100) : 0;
    const message =
      pct === 100 ? "Perfect score! 🏆" : pct >= 60 ? "Great job! 🎉" : "Keep practising! 💪";

    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center p-6"
        style={{
          background:
            "linear-gradient(180deg, var(--kahoot-purple) 0%, #1a0533 100%)",
        }}
      >
        <div className="mb-6 rounded-3xl border-4 border-white/20 bg-white/10 px-10 py-8 text-center backdrop-blur-sm">
          <p className="mb-2 text-6xl">{quiz.coverIcon}</p>
          <h1 className="mb-2 text-2xl font-extrabold text-white">{message}</h1>
          <p className="text-5xl font-extrabold text-yellow-300 tabular-nums">{score}</p>
          <p className="text-sm font-bold text-white/60">points</p>
          <p className="mt-3 text-white/80">
            {correctCount} / {total} correct · {pct}%
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="game-pill rounded-full bg-white px-8 py-3 font-extrabold text-[var(--kahoot-purple)]"
          >
            Change settings
          </button>
          <button
            type="button"
            onClick={startRound}
            className="game-pill rounded-full bg-[var(--kahoot-green)] px-8 py-3 font-extrabold text-white shadow-[0_4px_0_#1a5c08]"
          >
            Play again
          </button>
          <Link
            href="/discover"
            className="game-pill rounded-full border-2 border-white/50 bg-white/10 px-8 py-3 text-center font-extrabold text-white"
          >
            Discover
          </Link>
        </div>
      </div>
    );
  }

  if (!question || !quiz) return null;

  const feedback =
    selected === null
      ? "timeout"
      : question.answers[selected]?.correct
        ? "correct"
        : "wrong";
  const correctAnswer = question.answers.find((a) => a.correct)?.text ?? "";

  const hud = (
    <GameHud
      index={index}
      total={questions.length}
      timeLeft={timeLeft}
      timerSeconds={timerSeconds}
      score={score}
      paused={paused}
      phase={phase === "reveal" ? "reveal" : "playing"}
      onPause={() => setPaused((p) => !p)}
    />
  );

  if (phase === "reveal") {
    const bg =
      feedback === "correct"
        ? "var(--kahoot-green)"
        : feedback === "wrong"
          ? "var(--kahoot-red)"
          : "var(--kahoot-purple-dark)";

    return (
      <div className="flex min-h-screen flex-col" style={{ background: bg }}>
        {hud}
        {paused && <GamePauseOverlay onResume={() => setPaused(false)} />}

        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-1 flex-col items-center gap-4 px-4 py-5">
            <div className="text-center">
              <p className="text-5xl drop-shadow-lg">
                {feedback === "correct" ? "🎉" : feedback === "wrong" ? "😅" : "⏱️"}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-white">
                {feedback === "correct"
                  ? "Correct!"
                  : feedback === "wrong"
                    ? "Not quite"
                    : "Time's up!"}
              </h2>
            </div>

            {correctAnswer && (
              <RevealPanel
                category={revealCategory}
                term={correctAnswer}
                imageUrl={hasImage ? question.image : undefined}
              />
            )}

            <div className="w-full max-w-md px-1">
              <AnswerButtons
                answers={question.answers}
                reveal
                selectedIndex={selected ?? undefined}
                disabled
              />
            </div>
          </div>
        </div>

        <GameFooter
          index={index}
          total={questions.length}
          canGoBack={index > 0}
          primaryLabel={isLast ? "See results →" : "Next question →"}
          onPrevious={goPrevious}
          onPrimary={goNext}
          variant="dark"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      {hud}
      {paused && <GamePauseOverlay onResume={() => setPaused(false)} />}

      <div className="flex flex-1 flex-col overflow-hidden">
        {hasImage ? (
          <>
            <div className="shrink-0 bg-white px-4 pb-2 pt-3 shadow-sm">
              <QuestionImage
                image={question.image}
                imageQuery={question.imageQuery}
                alt={question.text}
              />
              <p className="mt-3 text-center text-base font-extrabold leading-snug text-gray-900">
                {question.text}
              </p>
            </div>
            <div className="min-h-0 flex-1 bg-white">
              <AnswerButtons
                answers={question.answers}
                onAnswer={lockAnswer}
                disabled={paused}
                selectedIndex={selected ?? undefined}
              />
            </div>
          </>
        ) : (
          <>
            <div className="shrink-0 bg-[var(--kahoot-purple)] px-4 py-6 text-center shadow-md">
              <p className="text-lg font-extrabold leading-snug text-white lg:text-xl">
                {question.text}
              </p>
            </div>
            <div className="min-h-0 flex-1 bg-white">
              <AnswerButtons
                answers={question.answers}
                onAnswer={lockAnswer}
                disabled={paused}
                selectedIndex={selected ?? undefined}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
