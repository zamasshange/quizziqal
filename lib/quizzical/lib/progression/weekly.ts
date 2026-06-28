/** ISO week (Monday start) helpers for weekly XP tracking. */

export function weekStartKey(date = new Date()): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function applyWeeklyXp(
  currentWeeklyXp: number,
  weekStartedAt: string | null,
  xpDelta: number,
  now = new Date(),
): { weeklyXp: number; weekStartedAt: string } {
  const weekKey = weekStartKey(now);
  if (!weekStartedAt || weekStartedAt !== weekKey) {
    return { weeklyXp: xpDelta, weekStartedAt: weekKey };
  }
  return { weeklyXp: currentWeeklyXp + xpDelta, weekStartedAt: weekKey };
}
