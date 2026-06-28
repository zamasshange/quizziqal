export function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export const LOADING_LINES = [
  "Shuffling brain cells…",
  "Bribing Wikipedia…",
  "Warming up the buzzer…",
  "Hiding the easy answers… just kidding",
  "Consulting a very confident pigeon…",
  "Loading facts at ludicrous speed…",
] as const;

export const ANSWER_PROMPTS = [
  "🎲 Roll the dice — pick one!",
  "🧠 Trust your gut (or guess wildly)",
  "👆 Tap before your brain changes its mind",
  "⚡ Quick! The timer is judging you",
  "🎯 Lock it in, champ!",
] as const;

export const CORRECT_LINES = [
  "Nailed it!",
  "Big brain energy!",
  "Chef's kiss!",
  "You absolute legend!",
  "Correct — the crowd goes mild!",
  "Bing bong, you're right!",
] as const;

export const CORRECT_STREAK_LINES: Record<number, string> = {
  2: "Two in a row — suspiciously smart…",
  3: "ON FIRE! 🔥",
  4: "Unstoppable! (for now)",
  5: "Quiz god mode activated",
};

export const WRONG_LINES = [
  "Oof! So close… maybe?",
  "Nope! But hey, vibes were right",
  "Wrong answer — blame the universe",
  "Not quite! Your confidence was inspiring though",
  "Miss! The quiz is giggling",
] as const;

export const TIMEOUT_LINES = [
  "Time's up! The clock is ruthless",
  "Too slow! Were you making tea?",
  "Buzzzz! Timer wins this round",
  "Expired! Blink slower next time",
] as const;

export const TIMER_PANIC_LINES = [
  "HURRY!",
  "TICK TOCK!",
  "PANIC MODE!",
  "GO GO GO!",
] as const;

export const PAUSE_LINES = [
  "Brain break activated",
  "The quiz will wait… impatiently",
  "Paused — snacks recommended",
  "Time frozen. Your dignity is safe.",
] as const;

export const FINISH_TITLES = {
  perfect: ["Quiz Deity 👑", "Flawless Victory!", "Too Smart. Suspicious."],
  great: ["Certified Smartypants 🎉", "Pretty Dang Good!", "Brain Buff 💪"],
  ok: ["Not Bad, Not Great 😅", "Room to Grow!", "Decent Effort Trophy"],
  rough: ["We Don't Talk About That 💀", "Rough Round!", "Tomorrow's Another Quiz"],
} as const;

export function finishTitle(pct: number): string {
  if (pct === 100) return pickRandom(FINISH_TITLES.perfect);
  if (pct >= 75) return pickRandom(FINISH_TITLES.great);
  if (pct >= 40) return pickRandom(FINISH_TITLES.ok);
  return pickRandom(FINISH_TITLES.rough);
}

export function correctMessage(streak: number): string {
  if (streak >= 5) return CORRECT_STREAK_LINES[5]!;
  if (streak >= 4) return CORRECT_STREAK_LINES[4]!;
  if (streak >= 3) return CORRECT_STREAK_LINES[3]!;
  if (streak >= 2) return CORRECT_STREAK_LINES[2]!;
  return pickRandom(CORRECT_LINES);
}

export const DIFFICULTY_FLAVOR: Record<string, string> = {
  Easy: "😴 Nap mode — you've got this",
  Medium: "😤 Respectable challenge",
  Hard: "💀 Good luck, you'll need it",
};

export const SETUP_START_LINES = [
  "▶ LET'S GOOO!",
  "▶ UNLEASH CHAOS!",
  "▶ START THE MADNESS!",
  "▶ I'M READY (probably)",
] as const;

export const REVEAL_NEXT_LINES = {
  last: ["🏁 See how you did!", "🎬 Roll the credits!", "📊 Face the music!"],
  next: ["➡️ Next victim… question!", "➡️ Onward to glory!", "➡️ Keep rolling!"],
} as const;
