"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button3D from "./Button3D";
import RevealCard from "./RevealCard";
import MobileRevealBar from "./MobileRevealBar";
import QuizStageImage from "./QuizStageImage";
import { playClick, useGameSounds, useQuizFinishSound } from "@/lib/sound";
import { syncContentHistory } from "@/lib/platform/syncContentHistory";
import {
  getExcluded,
  ensurePlayablePool,
  playHistoryKey,
  recordSeen,
  rotateExcluded,
} from "@/lib/playHistory";
import {
  clearGameSession,
  gameKeyImage,
  getGameSession,
  saveGameSession,
  type SavedGameSession,
} from "@/lib/gameProgress";
import { useCompleteGame } from "@/lib/completeGame";
import { recordProgressionEvent } from "@/lib/progression/client";
import { gameplayRewardsPreview } from "@/lib/progression/xp";
import { prefetchReveal } from "@/lib/revealPrefetch";
import ContinueGamePrompt from "./ContinueGamePrompt";
import GameHudControls from "./GameHudControls";
import GamePauseOverlay from "./GamePauseOverlay";
import QuizLoadingOverlay from "./progression/QuizLoadingOverlay";
import { useAtmosphereCategory } from "@/lib/atmosphere/useAtmosphereCategory";
import type { GameMode } from "@/lib/imageQuestions";
import {
  prefetchImages,
  prefetchUpcoming,
  questionPrefetchUrls,
} from "@/lib/quizImageUrl";
import QuestionCountPicker from "./QuestionCountPicker";
import {
  DEFAULT_QUESTION_COUNT,
  type QuestionCount,
} from "@/lib/quizRoundSettings";

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

const TIMER_OPTIONS = [10, 15, 20, 30, 45] as const;
type TimerSeconds = (typeof TIMER_OPTIONS)[number];
const DEFAULT_TIMER: TimerSeconds = 20;
const MAX_POINTS = 1000;

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

function prepare(rows: SourceQuestion[], maxCount: number): PreparedQuestion[] {
  return shuffle(rows)
    .slice(0, maxCount)
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
  const router = useRouter();
  const completeGame = useCompleteGame();
  const finishedRef = useRef(false);
  const warmRef = useRef<{
    key: string;
    promise: Promise<SourceQuestion[]>;
  } | null>(null);

  const [status, setStatus] = useState<Status>("setup");
  const [pendingResume, setPendingResume] = useState<SavedGameSession | null>(
    null,
  );
  const [declinedResume, setDeclinedResume] = useState(false);
  const [paused, setPaused] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [questionCount, setQuestionCount] = useState<QuestionCount>(
    DEFAULT_QUESTION_COUNT,
  );
  const [timerSeconds, setTimerSeconds] = useState<TimerSeconds>(DEFAULT_TIMER);
  const [loadProgress, setLoadProgress] = useState("");
  const [questions, setQuestions] = useState<PreparedQuestion[]>([]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_TIMER);
  const [showHint, setShowHint] = useState(false);
  const [knowledgeSaved, setKnowledgeSaved] = useState(false);
  const { playCorrect, playWrong } = useGameSounds();

  useAtmosphereCategory(mode.quizCategorySlug ?? "entertainment");

  useQuizFinishSound(phase, correctCount, questions.length);

  const buildQuizParams = useCallback(
    (
      level: Difficulty,
      count: number,
      excluded: { answers: string[]; images: string[] },
      opts?: { fast?: boolean },
    ) => {
      const params = new URLSearchParams({
        category: mode.category,
        count: String(count),
        difficulty: level,
      });
      if (opts?.fast !== false) params.set("fast", "1");
      for (const answer of excluded.answers) {
        params.append("excludeAnswer", answer);
      }
      for (const image of excluded.images) {
        params.append("excludeImage", image);
      }
      return params;
    },
    [mode.category],
  );

  const fetchQuizRows = useCallback(
    async (
      level: Difficulty,
      count: number,
      excluded: { answers: string[]; images: string[] },
      fast = true,
    ): Promise<SourceQuestion[]> => {
      const res = await fetch(
        `/api/image-quiz?${buildQuizParams(level, count, excluded, { fast }).toString()}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as { questions?: SourceQuestion[] };
      return data.questions ?? [];
    },
    [buildQuizParams],
  );

  const fetchWithFallback = useCallback(
    async (
      level: Difficulty,
      count: QuestionCount,
      historyKey: string,
    ): Promise<SourceQuestion[]> => {
      ensurePlayablePool(historyKey, count);
      let excluded = getExcluded(historyKey);
      let rows = await fetchQuizRows(level, count, excluded, true);

      if (rows.length === 0 && excluded.answers.length + excluded.images.length > 0) {
        rotateExcluded(historyKey);
        excluded = getExcluded(historyKey);
        rows = await fetchQuizRows(level, count, excluded, true);
      }

      if (rows.length === 0) {
        rows = await fetchQuizRows(level, count, { answers: [], images: [] }, true);
      }

      if (rows.length === 0) {
        rows = await fetchQuizRows(level, count, { answers: [], images: [] }, false);
      }

      return rows;
    },
    [fetchQuizRows],
  );

  const warmQuiz = useCallback(
    (level: Difficulty, count: QuestionCount) => {
      const historyKey = playHistoryKey("image", mode.category, level);
      const excluded = getExcluded(historyKey);
      const key = `${mode.category}|${level}|${count}|${excluded.answers.length}`;
      warmRef.current = {
        key,
        promise: fetchWithFallback(level, count, historyKey),
      };
    },
    [mode.category, fetchWithFallback],
  );

  useEffect(() => {
    warmQuiz(difficulty, questionCount);
  }, [difficulty, questionCount, warmQuiz]);

  const loadQuestions = useCallback(
    async (level: Difficulty, count: QuestionCount, rotate = false) => {
      setStatus("loading");
      setLoadProgress("Starting game…");
      const historyKey = playHistoryKey("image", mode.category, level);
      if (rotate) rotateExcluded(historyKey);
      ensurePlayablePool(historyKey, count);
      const excluded = getExcluded(historyKey);
      const isMovie = mode.category === "Movie";
      const warmKey = `${mode.category}|${level}|${count}|${excluded.answers.length}`;

      try {
        let rows: SourceQuestion[] = [];

        if (!rotate && warmRef.current?.key === warmKey) {
          rows = await warmRef.current.promise;
        }

        if (rows.length === 0) {
          setLoadProgress("Loading questions…");
          rows = await fetchWithFallback(level, count, historyKey);
        }

        const prepared = prepare(rows, count);
        if (prepared.length === 0) {
          setStatus("empty");
          return;
        }

        const first = prepared[0];
        void prefetchImages(
          questionPrefetchUrls(
            first.image_url,
            first.reveal_image_url,
            isMovie,
          ),
        );
        void prefetchUpcoming(prepared, 0, 3, isMovie);

        recordSeen(historyKey, {
          answers: prepared.map((q) => q.answers[q.correct]),
          images: prepared.map((q) => q.image_url),
          ids: prepared.map((q) => q.id),
        });
        void syncContentHistory({
          category: mode.category,
          answers: prepared.map((q) => q.answers[q.correct]),
        });

        setQuestions(prepared);
        setIndex(0);
        setSelected(null);
        setScore(0);
        setCorrectCount(0);
        setTimeLeft(timerSeconds);
        setShowHint(false);
        setPhase("playing");
        setLoadProgress("");
        setStatus("ready");

        if (prepared.length < count) {
          void fetchQuizRows(level, count, excluded, false)
            .then((extra) => {
              const more = prepare(extra, count);
              if (more.length > prepared.length) {
                setQuestions(more);
                void prefetchUpcoming(more, 0, more.length, isMovie);
              }
            })
            .catch(() => undefined);
        }
      } catch {
        setStatus("error");
      }
    },
    [mode.category, timerSeconds, fetchQuizRows, fetchWithFallback],
  );

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const lockAnswer = useCallback(
    (choice: number | null) => {
      if (!question) return;
      if (choice !== null) playClick();
      setPhase("reveal");
      setSelected(choice);
      if (choice !== null && choice === question.correct) {
        const earned = Math.round(
          MAX_POINTS * (0.5 + 0.5 * (timeLeft / timerSeconds)),
        );
        setScore((s) => s + earned);
        setCorrectCount((c) => c + 1);
        playCorrect();
        void recordProgressionEvent({
          type: "correct_answer",
          term: question.answers[question.correct],
          category: mode.category,
          quizCategory: mode.quizCategorySlug ?? "entertainment",
          difficulty,
        }).then((r) => {
          if (r.discovery?.isNew) setKnowledgeSaved(true);
        });
      } else {
        playWrong();
        void recordProgressionEvent({
          type: "wrong_answer",
          quizCategory: mode.quizCategorySlug ?? "entertainment",
        });
      }
    },
    [question, timeLeft, timerSeconds, playCorrect, playWrong],
  );

  useEffect(() => {
    if (status !== "ready" || questions.length === 0) return;
    prefetchUpcoming(questions, index + 1, 3, mode.category === "Movie");
    const current = questions[index];
    const next = questions[index + 1];
    if (current?.answers[current.correct]) {
      prefetchReveal(mode.category, current.answers[current.correct]);
    }
    if (next?.answers[next.correct]) {
      prefetchReveal(mode.category, next.answers[next.correct]);
    }
  }, [status, index, questions, mode.category]);

  useEffect(() => {
    if (status !== "ready") return;
    if (phase !== "playing" || paused) return;
    if (timeLeft <= 0) {
      lockAnswer(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [status, phase, timeLeft, lockAnswer, paused]);

  const gKey =
    status === "ready" || status === "loading"
      ? gameKeyImage(mode.category, difficulty)
      : "";

  useEffect(() => {
    if (status !== "ready" || !gKey) return;
    if (phase === "finished") return;
    saveGameSession({
      gameKey: gKey,
      gameType: "image",
      quizId: mode.slug,
      title: mode.title,
      emoji: mode.emoji,
      href: `/play/${mode.slug}`,
      index,
      phase,
      score,
      correctCount,
      timeLeft,
      selected,
      imageQuestions: questions,
      difficulty,
      timerSeconds,
      updatedAt: Date.now(),
    });
  }, [
    status,
    gKey,
    mode.slug,
    mode.title,
    mode.emoji,
    mode.category,
    index,
    phase,
    score,
    correctCount,
    timeLeft,
    selected,
    questions,
    difficulty,
    timerSeconds,
  ]);

  useEffect(() => {
    if (phase !== "finished" || finishedRef.current) return;
    finishedRef.current = true;
    void completeGame({
      gameKey: gameKeyImage(mode.category, difficulty),
      gameType: "image",
      quizId: mode.slug,
      title: mode.title,
      emoji: mode.emoji,
      href: `/play/${mode.slug}`,
      score,
      correct: correctCount,
      total: questions.length,
      quizCategory: mode.quizCategorySlug ?? "entertainment",
      difficulty,
    });
  }, [
    phase,
    completeGame,
    mode.slug,
    mode.title,
    mode.emoji,
    mode.category,
    mode.quizCategorySlug,
    difficulty,
    score,
    correctCount,
    questions.length,
  ]);

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
      if (paused) return;
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
      setKnowledgeSaved(false);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setTimeLeft(timerSeconds);
    setShowHint(false);
    setPhase("playing");
    setKnowledgeSaved(false);
  }

  function restart() {
    finishedRef.current = false;
    clearGameSession(gameKeyImage(mode.category, difficulty));
    setPaused(false);
    void loadQuestions(difficulty, questionCount, true);
  }

  function tryResumeFromSetup() {
    const key = gameKeyImage(mode.category, difficulty);
    const saved = getGameSession(key);
    if (saved?.imageQuestions?.length) {
      setPendingResume(saved);
    } else {
      void loadQuestions(difficulty, questionCount);
    }
  }

  function applyImageResume(saved: SavedGameSession) {
    const restored = saved.imageQuestions as PreparedQuestion[] | undefined;
    if (!restored?.length) {
      setDeclinedResume(true);
      setPendingResume(null);
      void loadQuestions(difficulty, questionCount);
      return;
    }
    setQuestions(restored);
    setIndex(saved.index);
    setPhase(saved.phase);
    setScore(saved.score);
    setCorrectCount(saved.correctCount);
    setTimeLeft(saved.timeLeft);
    setSelected(saved.selected);
    if (saved.timerSeconds) setTimerSeconds(saved.timerSeconds as TimerSeconds);
    setPendingResume(null);
    setStatus("ready");
    setPhase(saved.phase);
  }

  if (pendingResume && !declinedResume && status === "setup") {
    return (
      <ContinueGamePrompt
        title={pendingResume.title}
        emoji={pendingResume.emoji}
        progress={`Question ${pendingResume.index + 1} · ${pendingResume.score.toLocaleString()} pts saved`}
        onContinue={() => applyImageResume(pendingResume)}
        onFresh={() => {
          clearGameSession(gameKeyImage(mode.category, difficulty));
          setPendingResume(null);
          setDeclinedResume(true);
        }}
      />
    );
  }

  if (status === "setup") {
    return (
      <Centered>
        <span className="text-5xl">{mode.emoji}</span>
        <h2 className="font-display text-2xl font-extrabold">{mode.title}</h2>
        <p className="font-bold text-ink/60">
          Choose difficulty, round length, and timer.
        </p>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <span className="text-left text-xs font-extrabold uppercase tracking-wide text-ink/45">
            Difficulty
          </span>
          {DIFFICULTIES.map((d) => {
            const rewards = gameplayRewardsPreview(d);
            return (
            <button
              key={d}
              type="button"
              onClick={() => {
                playClick();
                setDifficulty(d);
              }}
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
              <span className="mt-0.5 block text-[10px] font-bold opacity-80">
                +{rewards.perCorrect.xp} XP · +{rewards.perCorrect.coins} coin
                {rewards.perCorrect.coins === 1 ? "" : "s"} per correct
              </span>
            </button>
            );
          })}
        </div>
        <QuestionCountPicker
          value={questionCount}
          onChange={setQuestionCount}
        />
        <div className="flex w-full max-w-xs flex-col gap-2">
          <span className="text-left text-xs font-extrabold uppercase tracking-wide text-ink/45">
            Timer per question
          </span>
          <div className="grid grid-cols-5 gap-2">
            {TIMER_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  playClick();
                  setTimerSeconds(t);
                }}
                className={`rounded-xl border-[3px] border-ink py-2 text-sm font-extrabold transition-colors ${
                  timerSeconds === t
                    ? "bg-petrol text-cream"
                    : "bg-cream text-ink hover:bg-cream-dark"
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>
        <Button3D
          variant="grass"
          size="lg"
          onClick={tryResumeFromSetup}
        >
          ▶ Start
        </Button3D>
      </Centered>
    );
  }

  if (status === "loading") {
    return (
      <>
        <QuizLoadingOverlay
          open
          title={mode.title}
          emoji={mode.emoji}
          categorySlug={mode.quizCategorySlug ?? "entertainment"}
          message={loadProgress || "Building quiz…"}
        />
        {/* Placeholder keeps layout stable while overlay covers the screen */}
        <div className="mx-auto min-h-[40vh] max-w-xl" aria-hidden />
      </>
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
          onClick={() => loadQuestions(difficulty, questionCount)}
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
          We couldn&apos;t load questions right now. Try again — we&apos;ll
          refresh the player pool.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button3D
            variant="grass"
            size="lg"
            onClick={() => void loadQuestions(difficulty, questionCount, true)}
          >
            Try again
          </Button3D>
          <Button3D
            variant="white"
            size="lg"
            onClick={() => setStatus("setup")}
          >
            Back
          </Button3D>
        </div>
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
            Change settings
          </Button3D>
          <Button3D variant="white" size="lg" href="/leaderboard">
            Leaderboard
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
  const isMovieMode = mode.category === "Movie";
  const isPosterReveal = showReveal && isMovieMode;
  const stageSrc = showReveal
    ? (question.reveal_image_url as string)
    : question.image_url;
  const lowTime = timeLeft <= Math.max(3, Math.floor(timerSeconds * 0.25));
  const timerFrac = Math.max(0, timeLeft / timerSeconds);
  const revealStatus =
    selected === question.correct
      ? "correct"
      : selected === null
        ? "timeout"
        : "wrong";
  const continueLabel = isLast ? "See results" : "Continue →";

  return (
    <div
      className={`mx-auto flex w-full max-w-5xl flex-col gap-4 ${
        revealed ? "pb-32 md:pb-0" : ""
      }`}
    >
      {/* HUD — quit, segmented progress, difficulty + score */}
      <div className="flex items-center gap-3">
        <GameHudControls
          paused={paused}
          disabled={phase !== "playing"}
          onTogglePause={() => setPaused((p) => !p)}
        />
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
            {difficulty} · {timerSeconds}s
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
        <div
          className={`relative w-full overflow-hidden rounded-3xl border-4 border-ink bg-ink shadow-[0_6px_0_0_#0d0d0d] ${
            isPosterReveal
              ? "mx-auto aspect-[2/3] max-h-[min(70vh,560px)] max-w-sm"
              : "aspect-[16/10]"
          }`}
        >
          <QuizStageImage
            src={stageSrc}
            alt={showReveal ? "Answer reveal" : "Guess from this image"}
            imageKey={`${question.id}-${showReveal ? "reveal" : "main"}`}
            posterReveal={isPosterReveal}
            refreshTerm={
              showReveal ? undefined : question.answers[question.correct]
            }
            className={`animate-quiz-pop relative h-full w-full ${
              isMovieMode && !showReveal
                ? "scale-105 object-cover object-center"
                : "object-contain"
            }`}
          />
          {isMovieMode && !showReveal && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-ink/90 via-ink/40 to-transparent"
            />
          )}
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
        <div className="hidden animate-reveal md:block">
          <RevealCard
            category={mode.category}
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

      {revealed && (
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

      {/* Educational reveal content below the play area */}
      {revealed && (
        <div className="animate-reveal mx-auto w-full max-w-2xl">
          <RevealCard
            category={mode.category}
            term={question.answers[question.correct]}
            status={revealStatus}
            continueLabel={continueLabel}
            onContinue={next}
            hideImage
            variant="content"
            knowledgeSaved={knowledgeSaved}
          />
        </div>
      )}
      {paused && (
        <GamePauseOverlay
          onResume={() => setPaused(false)}
          onQuit={() => {
            setPaused(false);
            router.push("/");
          }}
        />
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
