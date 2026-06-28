"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AnswerButtons from "@/components/game/AnswerButtons";
import QuestionImage from "@/components/game/QuestionImage";
import RevealPanel from "@/components/game/RevealPanel";
import { GameSession, Quiz } from "@/lib/types";

export default function PlayGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [session, setSession] = useState<GameSession | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const [timeLeft, setTimeLeft] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [error, setError] = useState("");
  const autoStartAttempted = useRef(false);

  const fetchGame = useCallback(async () => {
    const res = await fetch(`/api/games/${gameId}`);
    if (!res.ok) {
      setError("Game not found");
      return null;
    }
    const data = await res.json();
    setSession(data.session);
    setQuiz(data.quiz);

    const soloPlayer = data.session.players[0];
    if (soloPlayer) {
      setPlayerId(soloPlayer.id);
    }

    return data;
  }, [gameId]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  useEffect(() => {
    if (!session || playerId || autoStartAttempted.current) return;
    if (session.phase !== "lobby") return;

    autoStartAttempted.current = true;
    fetch(`/api/games/${gameId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "begin", nickname: "Player" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.player?.id) {
          setPlayerId(data.player.id);
          setSession(data.session);
          setQuiz(data.quiz);
        }
      })
      .catch(() => setError("Could not start game"));
  }, [session, playerId, gameId]);

  const advance = useCallback(async () => {
    await fetch(`/api/games/${gameId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "advance" }),
    });
    fetchGame();
  }, [gameId, fetchGame]);

  useEffect(() => {
    if (!playerId) return;
    const interval = setInterval(fetchGame, 1000);
    return () => clearInterval(interval);
  }, [playerId, fetchGame]);

  useEffect(() => {
    if (!session || !quiz || session.phase !== "question" || !playerId) return;

    const question = quiz.questions[session.currentQuestion];
    if (!question) return;

    const start = session.questionStartedAt ?? Date.now();
    const update = () => {
      const elapsed = (Date.now() - start) / 1000;
      const remaining = Math.max(0, question.timeLimit - elapsed);
      setTimeLeft(Math.ceil(remaining));
      if (remaining <= 0) advance();
    };

    update();
    const timer = setInterval(update, 100);
    return () => clearInterval(timer);
  }, [session?.phase, session?.currentQuestion, session?.questionStartedAt, quiz, playerId, advance]);

  useEffect(() => {
    if (!session || session.phase !== "reveal") return;
    const timer = setTimeout(advance, 4500);
    return () => clearTimeout(timer);
  }, [session?.phase, session?.currentQuestion, advance]);

  useEffect(() => {
    if (!session || session.phase !== "leaderboard") return;
    const timer = setTimeout(advance, 2500);
    return () => clearTimeout(timer);
  }, [session?.phase, session?.currentQuestion, advance]);

  useEffect(() => {
    if (!session || !playerId) return;
    if (session.phase === "question") {
      const hasAnswered = !!session.answers[playerId];
      setAnswered(hasAnswered);
      if (!hasAnswered) {
        setSelectedIndex(undefined);
        setFeedback(null);
      }
    }
    if (session.phase === "reveal") {
      const player = session.players.find((p) => p.id === playerId);
      if (player?.lastCorrect !== undefined) {
        setFeedback(player.lastCorrect ? "correct" : "incorrect");
      }
    }
  }, [session, playerId]);

  const handleAnswer = async (index: number) => {
    if (answered || !playerId) return;
    setSelectedIndex(index);
    setAnswered(true);

    await fetch(`/api/games/${gameId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "answer", playerId, answerIndex: index }),
    });
    fetchGame();
  };

  if (error && !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--kahoot-purple)] p-6">
        <div className="text-center text-white">
          <h1 className="text-xl font-bold">{error}</h1>
          <Link href="/discover" className="mt-4 inline-block underline">
            Back to Discover
          </Link>
        </div>
      </div>
    );
  }

  if (!session || !quiz || !playerId || session.phase === "lobby") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--kahoot-purple)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  const question = quiz.questions[session.currentQuestion];
  const player = session.players.find((p) => p.id === playerId);

  if (session.phase === "podium") {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center p-6"
        style={{
          background:
            "linear-gradient(180deg, var(--kahoot-purple) 0%, #1a0533 100%)",
        }}
      >
        <p className="mb-2 text-6xl">🎉</p>
        <h1 className="mb-2 text-2xl font-extrabold text-white">Well done!</h1>
        <p className="mb-8 text-4xl font-extrabold text-yellow-300">
          {player?.score ?? 0} pts
        </p>
        <Link
          href="/discover"
          className="rounded-full bg-white px-8 py-3 font-bold text-[var(--kahoot-purple)]"
        >
          Play another quiz
        </Link>
      </div>
    );
  }

  if (session.phase === "leaderboard") {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center p-6"
        style={{
          background:
            "linear-gradient(180deg, var(--kahoot-purple) 0%, var(--kahoot-purple-dark) 100%)",
        }}
      >
        <p className="mb-2 text-sm text-white/60">Your score</p>
        <p className="mb-8 text-5xl font-extrabold text-yellow-300">
          {player?.score ?? 0} pts
        </p>
        <p className="text-white/60">Next question coming up...</p>
      </div>
    );
  }

  if (session.phase === "question" && answered) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center"
        style={{ background: "var(--kahoot-purple-dark)" }}
      >
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent" />
        <p className="mt-6 text-lg font-semibold text-white">Answer locked in!</p>
      </div>
    );
  }

  if (session.phase === "reveal") {
    const bg =
      feedback === "correct"
        ? "var(--kahoot-green)"
        : feedback === "incorrect"
          ? "var(--kahoot-red)"
          : "var(--kahoot-purple-dark)";

    const correctAnswer =
      question?.answers.find((a) => a.correct)?.text ?? "";
    const revealCategory =
      quiz.revealCategory ?? quiz.tags[0] ?? quiz.category.toLowerCase();

    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 p-6"
        style={{ background: bg }}
      >
        <p className="text-5xl">{feedback === "correct" ? "✓" : "✗"}</p>
        <h1 className="text-2xl font-extrabold text-white">
          {feedback === "correct" ? "Correct!" : "Wrong!"}
        </h1>
        <p className="text-lg text-white/80">Score: {player?.score ?? 0}</p>

        {correctAnswer && (
          <RevealPanel
            category={revealCategory}
            term={correctAnswer}
            status={feedback === "correct" ? "correct" : "wrong"}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between bg-[var(--kahoot-purple)] px-4 py-3 text-white">
        <span className="truncate text-sm font-semibold">{quiz.title}</span>
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-extrabold"
          style={{ background: timeLeft <= 5 ? "var(--kahoot-red)" : undefined }}
        >
          {timeLeft}
        </span>
        <span className="text-sm font-bold text-yellow-300">
          {player?.score ?? 0}
        </span>
      </div>

      <div className="flex flex-1 flex-col bg-white">
        <div className="flex items-center justify-center px-4 py-4">
          <span className="block text-center text-xs text-gray-400">
            {session.currentQuestion + 1} / {quiz.questions.length}
          </span>
        </div>
        <div className="flex items-center justify-center px-4 pb-2">
          <QuestionImage
            image={question?.image}
            imageQuery={question?.imageQuery}
            alt={question?.text ?? "Question"}
          />
        </div>
        <div className="flex items-center justify-center px-4 pb-4">
          <h1 className="text-center text-base font-extrabold text-gray-900 lg:text-xl">
            {question?.text}
          </h1>
        </div>

        <div className="flex-1">
          <AnswerButtons
            answers={question?.answers ?? []}
            onAnswer={handleAnswer}
            disabled={answered}
            selectedIndex={selectedIndex}
          />
        </div>
      </div>
    </div>
  );
}
