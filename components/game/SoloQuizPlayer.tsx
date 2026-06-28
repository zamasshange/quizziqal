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
  const [error, setError] = useState("");
  const questionStartedAt = useRef(Date.now());

  const question = questions[index];
  const isLast = index >= questions.length - 1;
  const hasImage = !!(question?.image || question?.imageQuery);
  const revealCategory =
    quiz?.revealCategory ?? quiz?.tags[0] ?? quiz?.category.toLowerCase() ?? "trivia";

  const startRound = async () => {
    setPhase("loading");
    setError("");
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
        setError(data.error ?? "Could not load quiz");
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
      setError("Connection error. Try again.");
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
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, paused, question, lockAnswer]);

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--kahoot-purple)] text-white">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
        <p className="font-semibold">Building your quiz…</p>
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
        <p className="mb-2 text-6xl">{quiz.coverIcon}</p>
        <h1 className="mb-2 text-2xl font-extrabold text-white">{message}</h1>
        <p className="mb-1 text-4xl font-extrabold text-yellow-300">{score} pts</p>
        <p className="mb-8 text-white/70">
          {correctCount} / {total} correct
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setPhase("setup")}
            className="rounded-full bg-white px-8 py-3 font-bold text-[var(--kahoot-purple)]"
          >
            Change settings
          </button>
          <button
            type="button"
            onClick={startRound}
            className="rounded-full border-2 border-white px-8 py-3 font-bold text-white"
          >
            Play again
          </button>
          <Link
            href="/discover"
            className="rounded-full border-2 border-white/50 px-8 py-3 text-center font-bold text-white/90"
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

  if (phase === "reveal") {
    const bg =
      feedback === "correct"
        ? "var(--kahoot-green)"
        : feedback === "wrong"
          ? "var(--kahoot-red)"
          : "var(--kahoot-purple-dark)";

    return (
      <div className="flex min-h-screen flex-col">
        <GameHud
          title={quiz.title}
          index={index}
          total={questions.length}
          timeLeft={timeLeft}
          timerSeconds={timerSeconds}
          score={score}
          paused={paused}
          canGoBack={index > 0}
          showNav
          onPause={() => setPaused((p) => !p)}
          onPrevious={goPrevious}
          onNext={goNext}
        />
        {paused && <GamePauseOverlay onResume={() => setPaused(false)} />}

        <div
          className="flex flex-1 flex-col items-center justify-center gap-4 p-4"
          style={{ background: bg }}
        >
          <p className="text-5xl">
            {feedback === "correct" ? "✓" : feedback === "wrong" ? "✗" : "⏱"}
          </p>
          <h2 className="text-xl font-extrabold text-white">
            {feedback === "correct"
              ? "Correct!"
              : feedback === "wrong"
                ? "Wrong!"
                : "Time's up!"}
          </h2>
          {correctAnswer && (
            <>
              <p className="text-lg text-white/90">Answer: {correctAnswer}</p>
              <RevealPanel
                category={revealCategory}
                term={correctAnswer}
                status={feedback === "correct" ? "correct" : "wrong"}
              />
            </>
          )}
          <button
            type="button"
            onClick={goNext}
            className="mt-2 rounded-full bg-white px-8 py-3 font-extrabold text-[var(--kahoot-purple)]"
          >
            {isLast ? "See results" : "Next question →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <GameHud
        title={quiz.title}
        index={index}
        total={questions.length}
        timeLeft={timeLeft}
        timerSeconds={timerSeconds}
        score={score}
        paused={paused}
        canGoBack={index > 0 && selected === null}
        showNav={selected === null}
        onPause={() => setPaused((p) => !p)}
        onPrevious={goPrevious}
        onNext={() => {
          if (selected !== null) goNext();
        }}
      />
      {paused && <GamePauseOverlay onResume={() => setPaused(false)} />}

      <div className="flex flex-1 flex-col">
        {hasImage ? (
          <div className="flex flex-col gap-3 px-4 pt-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:px-6 lg:pt-6">
            <div className="flex flex-col items-center justify-center">
              <QuestionImage
                image={question.image}
                imageQuery={question.imageQuery}
                alt={question.text}
                portrait
              />
              <p className="mt-3 text-center text-base font-extrabold text-gray-900 lg:text-lg">
                {question.text}
              </p>
            </div>
            <div className="min-h-[220px] flex-1 lg:min-h-0">
              <AnswerButtons
                answers={question.answers}
                onAnswer={lockAnswer}
                disabled={selected !== null || paused}
                selectedIndex={selected ?? undefined}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center px-4 py-6">
              <h1 className="text-center text-lg font-extrabold text-gray-900 lg:text-2xl">
                {question.text}
              </h1>
            </div>
            <div className="min-h-[220px] flex-1">
              <AnswerButtons
                answers={question.answers}
                onAnswer={lockAnswer}
                disabled={selected !== null || paused}
                selectedIndex={selected ?? undefined}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
