// Central sound manager — loads mp3 assets from /public/sounds/ when present,
// falls back to subtle Web Audio beeps if files are missing. A single mute flag
// is persisted to localStorage and shared across the app.

"use client";

import { useEffect, useState } from "react";
import {
  duckAmbientMusic,
  restoreAmbientMusic,
} from "@/lib/atmosphere/ambientMusic";

const MUTE_KEY = "quizzical-muted";

const SOUNDS = {
  click: { src: "/sounds/click.mp3", volume: 0.3 },
  correct: { src: "/sounds/correct.mp3", volume: 0.5 },
  wrong: { src: "/sounds/wrong.mp3", volume: 0.5 },
  quizComplete: { src: "/sounds/quiz-complete.mp3", volume: 0.5 },
  celebration: { src: "/sounds/celebration.mp3", volume: 0.7 },
  fairPlay: { src: "/sounds/fair-play.mp3", volume: 0.5 },
  levelUp: { src: "/sounds/level-up.mp3", volume: 0.65 },
  discovery: { src: "/sounds/discovery.mp3", volume: 0.55 },
  achievement: { src: "/sounds/achievement.mp3", volume: 0.6 },
  mission: { src: "/sounds/mission.mp3", volume: 0.55 },
  streak: { src: "/sounds/streak.mp3", volume: 0.6 },
} as const;

type SoundKey = keyof typeof SOUNDS;

const listeners = new Set<() => void>();
const audioCache = new Map<SoundKey, HTMLAudioElement>();
const loadFailed = new Set<SoundKey>();

let ctx: AudioContext | null = null;

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

/** Alias for isMuted — used by play helpers before every sound. */
export const getMuted = isMuted;

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

function fallbackBeep(key: SoundKey): void {
  const ac = getCtx();
  if (!ac) return;

  switch (key) {
    case "click":
      tone(ac, 880, 0, 0.06, "sine", 0.08);
      break;
    case "correct":
      tone(ac, 523.25, 0, 0.16, "triangle");
      tone(ac, 659.25, 0.1, 0.16, "triangle");
      tone(ac, 783.99, 0.2, 0.26, "triangle");
      break;
    case "wrong":
      tone(ac, 196.0, 0, 0.2, "triangle", 0.1);
      tone(ac, 174.61, 0.14, 0.28, "triangle", 0.08);
      break;
    case "quizComplete":
      tone(ac, 392.0, 0, 0.18, "triangle", 0.14);
      tone(ac, 523.25, 0.12, 0.22, "triangle", 0.14);
      tone(ac, 659.25, 0.24, 0.28, "triangle", 0.14);
      break;
    case "celebration":
      tone(ac, 523.25, 0, 0.14, "triangle", 0.2);
      tone(ac, 659.25, 0.1, 0.14, "triangle", 0.2);
      tone(ac, 783.99, 0.2, 0.14, "triangle", 0.2);
      tone(ac, 1046.5, 0.3, 0.32, "triangle", 0.22);
      break;
    case "fairPlay":
      tone(ac, 349.23, 0, 0.22, "sine", 0.12);
      tone(ac, 440.0, 0.14, 0.28, "sine", 0.12);
      tone(ac, 523.25, 0.28, 0.34, "sine", 0.12);
      break;
    case "levelUp":
      tone(ac, 392.0, 0, 0.12, "triangle", 0.18);
      tone(ac, 523.25, 0.08, 0.12, "triangle", 0.18);
      tone(ac, 659.25, 0.16, 0.14, "triangle", 0.2);
      tone(ac, 783.99, 0.24, 0.28, "triangle", 0.22);
      tone(ac, 1046.5, 0.34, 0.36, "triangle", 0.24);
      break;
    case "discovery":
      tone(ac, 880, 0, 0.1, "sine", 0.14);
      tone(ac, 1174.66, 0.08, 0.14, "sine", 0.16);
      tone(ac, 1318.51, 0.18, 0.22, "sine", 0.14);
      break;
    case "achievement":
      tone(ac, 523.25, 0, 0.14, "square", 0.1);
      tone(ac, 659.25, 0.1, 0.14, "square", 0.1);
      tone(ac, 783.99, 0.2, 0.2, "square", 0.1);
      tone(ac, 1046.5, 0.32, 0.32, "triangle", 0.18);
      break;
    case "mission":
      tone(ac, 440, 0, 0.12, "triangle", 0.14);
      tone(ac, 554.37, 0.1, 0.14, "triangle", 0.14);
      tone(ac, 659.25, 0.2, 0.24, "triangle", 0.16);
      break;
    case "streak":
      tone(ac, 329.63, 0, 0.1, "triangle", 0.1);
      tone(ac, 392, 0.08, 0.12, "triangle", 0.12);
      tone(ac, 493.88, 0.16, 0.14, "triangle", 0.14);
      tone(ac, 587.33, 0.26, 0.28, "triangle", 0.16);
      break;
  }
}

function getAudio(key: SoundKey): HTMLAudioElement | null {
  if (typeof window === "undefined" || loadFailed.has(key)) return null;

  if (!audioCache.has(key)) {
    const { src, volume } = SOUNDS[key];
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = volume;
    audio.addEventListener("error", () => loadFailed.add(key));
    audioCache.set(key, audio);
    void audio.load();
  }

  return audioCache.get(key) ?? null;
}

export function preloadSounds(): void {
  if (typeof window === "undefined") return;
  (Object.keys(SOUNDS) as SoundKey[]).forEach((key) => {
    getAudio(key);
  });
}

function playSound(key: SoundKey): void {
  if (isMuted()) return;

  duckAmbientMusic();

  const audio = getAudio(key);
  if (!audio || loadFailed.has(key)) {
    fallbackBeep(key);
    setTimeout(() => restoreAmbientMusic(), 400);
    return;
  }

  audio.volume = SOUNDS[key].volume;
  audio.currentTime = 0;
  void audio.play().catch(() => {
    loadFailed.add(key);
    fallbackBeep(key);
    setTimeout(() => restoreAmbientMusic(), 400);
  });

  audio.onended = () => restoreAmbientMusic();
}

export function playClick(): void {
  playSound("click");
}

export function playCorrect(): void {
  playSound("correct");
}

export function playWrong(): void {
  playSound("wrong");
}

export function playQuizComplete(): void {
  playSound("quizComplete");
}

export function playCelebration(): void {
  playSound("celebration");
}

export function playFairPlay(): void {
  playSound("fairPlay");
}

export function playLevelUp(): void {
  playSound("levelUp");
}

export function playDiscovery(): void {
  playSound("discovery");
}

export function playAchievement(): void {
  playSound("achievement");
}

export function playMissionComplete(): void {
  playSound("mission");
}

export function playStreakMilestone(): void {
  playSound("streak");
}

/** Plays the appropriate end-of-quiz sound based on score. */
export function playQuizFinishSound(correctCount: number, total: number): void {
  if (total <= 0) return;
  if (correctCount === total) {
    playCelebration();
  } else if (correctCount <= total * 0.4) {
    playFairPlay();
  } else {
    playQuizComplete();
  }
}

// --- React hooks ------------------------------------------------------------

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

/** Full sound effects hook — preloads assets and exposes mute controls. */
export function useSoundEffects() {
  const [muted, toggleMuted] = useMuted();

  useEffect(() => {
    preloadSounds();
  }, []);

  return {
    playClick,
    playCorrect,
    playWrong,
    playQuizComplete,
    playCelebration,
    playFairPlay,
    muted,
    toggleMuted,
  };
}

/** Sound effects for gameplay. Returns stable play functions. */
export function useGameSounds() {
  return { playCorrect, playWrong, playClick };
}

/** Plays finish sound once when phase transitions to "finished". */
export function useQuizFinishSound(
  phase: string,
  correctCount: number,
  total: number,
): void {
  useEffect(() => {
    if (phase !== "finished" || total <= 0) return;
    playQuizFinishSound(correctCount, total);
  }, [phase, correctCount, total]);
}
