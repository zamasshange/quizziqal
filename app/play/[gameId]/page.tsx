"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AnswerButtons from "@/components/game/AnswerButtons";
import { GameSession, Quiz } from "@/lib/types";

export default function PlayGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [session, setSession] = useState<GameSession | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [nickname, setNickname] = useState("");
  const [nicknameInput, setNicknameInput] = useState("");
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();
  const [timeLeft, setTimeLeft] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchGame = useCallback(async () => {
    const res = await fetch(`/api/games/${gameId}`);
    if (!res.ok) {
      setError("Game not found");
      return null;
    }
    const data = await res.json();
    setSession(data.session);
    setQuiz(data.quiz);
    return data;
  }, [gameId]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  useEffect(() => {
    const stored = sessionStorage.getItem(`player_${gameId}`);
    if (stored) {
      const { playerId: id, nickname: name } = JSON.parse(stored);
      setPlayerId(id);
      setNickname(name);
    }
  }, [gameId]);

  const advance = useCallback(async () => {
    await fetch(`/api/games/${gameId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "advance" }),
    });
    fetchGame();
  }, [gameId, fetchGame]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "begin", nickname: nicknameInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start");
        return;
      }

      sessionStorage.setItem(
        `player_${gameId}`,
        JSON.stringify({
          playerId: data.player.id,
          nickname: data.player.nickname,
        })
      );
      setPlayerId(data.player.id);
      setNickname(data.player.nickname);
      setSession(data.session);
      setQuiz(data.quiz);
    } catch {
      setError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };

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
    const timer = setTimeout(advance, 2000);
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

  if (!session || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--kahoot-purple)]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (!playerId || session.phase === "lobby") {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center p-5 lg:p-8"
        style={{
          background:
            "linear-gradient(180deg, var(--kahoot-purple) 0%, var(--kahoot-purple-dark) 100%)",
        }}
      >
        <span className="mb-4 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold text-white">
          Free to play
        </span>

        <div
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-lg lg:h-24 lg:w-24 lg:text-5xl"
          style={{ background: quiz.coverGradient }}
        >
          {quiz.coverIcon}
        </div>

        <h1 className="mb-2 text-center text-xl font-extrabold text-white lg:text-2xl">
          {quiz.title}
        </h1>
        <p className="mb-8 text-center text-sm text-white/70">
          {quiz.questionCount} questions · No signup needed
        </p>

        <form
          onSubmit={handleStart}
          className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl"
        >
          <label className="mb-2 block text-center text-sm font-semibold text-gray-600">
            Your nickname
          </label>
          <input
            type="text"
            maxLength={15}
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
            placeholder="Enter a nickname"
            className="mb-5 w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-center text-lg font-semibold outline-none focus:border-[var(--kahoot-purple)]"
            autoFocus
          />

          {error && (
            <p className="mb-4 text-center text-sm font-semibold text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !nicknameInput.trim()}
            className="w-full rounded-full bg-[var(--kahoot-purple)] py-3.5 text-lg font-extrabold text-white disabled:opacity-50"
          >
            {loading ? "Starting..." : "Start"}
          </button>
        </form>

        <Link href="/discover" className="mt-6 text-sm text-white/70 underline">
          Pick another quiz
        </Link>
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
        <p className="mb-2 text-lg text-white/80">{nickname}</p>
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

    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center p-6"
        style={{ background: bg }}
      >
        <p className="mb-4 text-6xl">{feedback === "correct" ? "✓" : "✗"}</p>
        <h1 className="text-3xl font-extrabold text-white">
          {feedback === "correct" ? "Correct!" : "Wrong!"}
        </h1>
        <p className="mt-4 text-xl text-white/80">Score: {player?.score ?? 0}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between bg-[var(--kahoot-purple)] px-4 py-3 text-white">
        <span className="text-sm font-semibold">{nickname}</span>
        <span
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-extrabold"
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
