"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import QuizPlayStage from "./QuizPlayStage";
import GameLoading from "./GameLoading";
import GameResults from "./GameResults";
import { pickRandom, REVEAL_NEXT_LINES } from "@/lib/gameFlavor";
import GameReaction from "./GameReaction";
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
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const questionStartedAt = useRef(Date.now());

  const question = questions[index];
  const isLast = index >= questions.length - 1;
  const hasImage = !!(question?.image || question?.imageQuery);
  const revealCategory =
    quiz?.revealCategory ?? quiz?.tags[0] ?? quiz?.category.toLowerCase() ?? "trivia";

  const nextLabel = useMemo(
    () =>
      isLast ? pickRandom(REVEAL_NEXT_LINES.last) : pickRandom(REVEAL_NEXT_LINES.next),
    [isLast, index]
  );

  const startRound = async () => {
    setPrepareError(null);
    setPhase("loading");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "prepare",
          settings: { count: questionCount, difficulty, timerSeconds },
        }),
        signal: controller.signal,
      });
      const data = await res.json();

      if (!res.ok) {
        setPrepareError(
          data.error ?? "Could not start the round. Try again."
        );
        setPhase("setup");
        return;
      }

      if (!data.quiz?.questions?.length) {
        setPrepareError(
          "No questions loaded. Try fewer questions or Easy difficulty."
        );
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
    } catch (err) {
      const aborted = err instanceof Error && err.name === "AbortError";
      setPrepareError(
        aborted
          ? "That took too long — try fewer questions or Easy difficulty."
          : "Something went wrong. Check your connection and try again."
      );
      setPhase("setup");
    } finally {
      clearTimeout(timeout);
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
        error={prepareError}
        onDifficulty={setDifficulty}
        onQuestionCount={setQuestionCount}
        onTimer={setTimerSeconds}
        onStart={startRound}
      />
    );
  }

  if (phase === "loading") {
    return <GameLoading />;
  }

  if (phase === "finished" && quiz) {
    return (
      <GameResults
        quiz={quiz}
        score={score}
        correctCount={correctCount}
        total={questions.length}
        onSetup={() => setPhase("setup")}
        onPlayAgain={startRound}
      />
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
      streak={streak}
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
      <div className="flex h-dvh flex-col overflow-hidden" style={{ background: bg }}>
        {hud}
        {paused && <GamePauseOverlay onResume={() => setPaused(false)} />}

        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-1 flex-col items-center gap-4 px-4 py-5 lg:flex-row lg:items-start lg:justify-center lg:gap-8 lg:px-8 lg:py-8">
            <GameReaction
              feedback={feedback}
              streak={feedback === "correct" ? streak : 0}
            />

            <div className="flex w-full max-w-4xl flex-col items-center gap-4 lg:flex-row lg:items-start lg:justify-center">
              {correctAnswer && (
                <RevealPanel
                  category={revealCategory}
                  term={correctAnswer}
                  imageUrl={hasImage ? question.image : undefined}
                />
              )}

              <div className="w-full max-w-md flex-1 lg:max-w-lg">
                <AnswerButtons
                  answers={question.answers}
                  reveal
                  selectedIndex={selected ?? undefined}
                  disabled
                  layout="stage"
                />
              </div>
            </div>
          </div>
        </div>

        <GameFooter
          index={index}
          total={questions.length}
          canGoBack={index > 0}
          primaryLabel={nextLabel}
          onPrevious={goPrevious}
          onPrimary={goNext}
          variant="dark"
        />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      {hud}
      {paused && <GamePauseOverlay onResume={() => setPaused(false)} />}

      <QuizPlayStage
        question={question.text}
        image={question.image}
        imageQuery={question.imageQuery}
        quizIcon={quiz.coverIcon}
      >
        <AnswerButtons
          answers={question.answers}
          onAnswer={lockAnswer}
          disabled={paused}
          selectedIndex={selected ?? undefined}
          layout="stage"
        />
      </QuizPlayStage>
    </div>
  );
}
