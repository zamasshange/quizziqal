/** Ambient background music — soft chord arpeggios (no continuous drone/buzz). */

import { getCategoryTheme, HOME_THEME, type CategoryTheme } from "./categoryThemes";
import { isMuted } from "@/lib/sound";

/** Soft chord arpeggios (C → Am → F → G). */
const CHORDS = [
  [261.63, 329.63, 392.0],
  [220.0, 261.63, 329.63],
  [174.61, 220.0, 261.63],
  [196.0, 246.94, 293.66],
] as const;

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let seqTimer: ReturnType<typeof setInterval> | null = null;
let noteIndex = 0;
let chordIndex = 0;
let activeTheme: string | null = null;
let fadeTimer: ReturnType<typeof setTimeout> | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function stopSequencer() {
  if (seqTimer) {
    clearInterval(seqTimer);
    seqTimer = null;
  }
  noteIndex = 0;
  chordIndex = 0;
}

function fadeTo(target: number, ms = 1200) {
  const ac = getCtx();
  if (!ac || !masterGain) return;
  const now = ac.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(target, now + ms / 1000);
}

function playArpNote(freq: number, mod: number) {
  const ac = getCtx();
  if (!ac || !masterGain || isMuted()) return;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();

  osc.type = "triangle";
  osc.frequency.value = freq;
  filter.type = "lowpass";
  filter.frequency.value = 1600;
  filter.Q.value = 0.4;

  const t = ac.currentTime;
  const peak = 0.035 * mod;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  osc.start(t);
  osc.stop(t + 2.3);
}

function startSequencer(theme: CategoryTheme) {
  stopSequencer();

  const tick = () => {
    if (isMuted()) return;
    const chord = CHORDS[chordIndex % CHORDS.length];
    playArpNote(chord[noteIndex % 3], theme.ambientMod);
    noteIndex++;
    if (noteIndex % 3 === 0) chordIndex++;
  };

  tick();
  seqTimer = setInterval(tick, 1400);
  fadeTo(0.5, 1800);
}

function themeForSlug(slug: string): CategoryTheme {
  if (slug === "home" || slug === "__quiz__") return HOME_THEME;
  return getCategoryTheme(slug);
}

export function startAmbientMusic(categorySlug?: string): void {
  if (isMuted()) return;

  const isQuiz = categorySlug === "__quiz__";
  const theme = themeForSlug(isQuiz ? "__quiz__" : categorySlug ?? "home");
  const key = isQuiz ? "__quiz__" : theme.slug;
  if (activeTheme === key && seqTimer) return;

  activeTheme = key;
  if (fadeTimer) clearTimeout(fadeTimer);
  startSequencer(theme);
}

export function stopAmbientMusic(): void {
  activeTheme = null;
  fadeTo(0, 800);
  fadeTimer = setTimeout(() => {
    stopSequencer();
    fadeTimer = null;
  }, 900);
}

export function duckAmbientMusic(): void {
  fadeTo(0.18, 400);
}

export function restoreAmbientMusic(): void {
  if (activeTheme && !isMuted()) fadeTo(0.5, 600);
}
