// Lightweight WebAudio sound effects — no asset files. Plays a pleasant chime on
// correct answers and a soft buzz on wrong ones. A single mute flag is persisted
// to localStorage and shared across the app via a tiny subscribable store.

"use client";

import { useEffect, useState } from "react";

const MUTE_KEY = "quizzical-muted";

let ctx: AudioContext | null = null;
const listeners = new Set<() => void>();

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

function tone(
  ac: AudioContext,
  freq: number,
  startAt: number,
  duration: number,
  type: OscillatorType = "sine",
  peak = 0.18,
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ac.destination);

  const t = ac.currentTime + startAt;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

export function playCorrect(): void {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  // Bright ascending arpeggio (C5 - E5 - G5).
  tone(ac, 523.25, 0, 0.16, "triangle");
  tone(ac, 659.25, 0.1, 0.16, "triangle");
  tone(ac, 783.99, 0.2, 0.26, "triangle");
}

export function playWrong(): void {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;
  // Low descending "wobble".
  tone(ac, 196.0, 0, 0.2, "sawtooth", 0.12);
  tone(ac, 146.83, 0.12, 0.3, "sawtooth", 0.12);
}

// --- React hooks ------------------------------------------------------------

/** Sound effects for gameplay. Returns stable play functions. */
export function useGameSounds() {
  return { playCorrect, playWrong };
}

/** Subscribes to the shared mute flag. Returns [muted, toggle]. */
export function useMuted(): [boolean, () => void] {
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    setMutedState(isMuted());
    const onChange = () => setMutedState(isMuted());
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  const toggle = () => setMuted(!isMuted());
  return [muted, toggle];
}
