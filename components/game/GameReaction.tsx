"use client";

import { useMemo } from "react";
import ConfettiBurst from "./ConfettiBurst";
import {
  correctMessage,
  pickRandom,
  TIMEOUT_LINES,
  WRONG_LINES,
} from "@/lib/gameFlavor";

type Feedback = "correct" | "wrong" | "timeout";

const EMOJI: Record<Feedback, string[]> = {
  correct: ["🎉", "🤩", "🥳", "💥", "⭐"],
  wrong: ["😅", "🫠", "💀", "🙈", "😬"],
  timeout: ["⏱️", "😱", "🐌", "💨", "⌛"],
};

type Props = {
  feedback: Feedback;
  streak?: number;
};

export default function GameReaction({ feedback, streak = 0 }: Props) {
  const emoji = useMemo(() => pickRandom(EMOJI[feedback]), [feedback]);
  const message = useMemo(() => {
    if (feedback === "correct") return correctMessage(streak);
    if (feedback === "wrong") return pickRandom(WRONG_LINES);
    return pickRandom(TIMEOUT_LINES);
  }, [feedback, streak]);

  return (
    <div className="game-reaction relative text-center lg:shrink-0 lg:pt-4">
      {feedback === "correct" && <ConfettiBurst />}
      <p
        className={`game-reaction-emoji text-6xl drop-shadow-lg lg:text-8xl ${
          feedback === "correct" ? "animate-bounce-in" : feedback === "wrong" ? "animate-wiggle" : "animate-shake"
        }`}
      >
        {emoji}
      </p>
      <h2 className="mt-2 text-2xl font-extrabold text-white lg:text-4xl">{message}</h2>
      {feedback === "correct" && streak >= 3 && (
        <p className="mt-2 animate-pulse-glow inline-block rounded-full border-2 border-yellow-300/60 bg-black/20 px-4 py-1 text-sm font-extrabold text-yellow-200">
          🔥 {streak} streak!
        </p>
      )}
    </div>
  );
}
