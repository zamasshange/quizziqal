# Game sounds

Drop your sound effect files here. The app loads them from `/sounds/<filename>` (see `lib/sound.ts`).

## Required files

| File | When it plays |
|------|----------------|
| `click.mp3` | Button taps across the site (Button3D, answer picks, continue, etc.) |
| `correct.mp3` | Correct answer during a quiz |
| `wrong.mp3` | Wrong answer or time runs out |
| `quiz-complete.mp3` | Generic quiz finished (mixed score) |
| `celebration.mp3` | Perfect score / 100% correct |
| `fair-play.mp3` | Quiz finished with mostly wrong answers (≤40% correct) |
| `level-up.mp3` | Level-up celebration overlay |
| `discovery.mp3` | New discovery unlocked |
| `achievement.mp3` | Achievement or badge unlocked |
| `mission.mp3` | Daily mission completed |
| `streak.mp3` | Streak milestone (3, 7, 14, 30+ days) |

Optional ambient loops (future): drop `ambient-home.mp3`, `ambient-quiz.mp3` in this folder.

## Notes

- Volume levels are tuned in code: click is quieter (0.3), celebration is louder (0.7).
- Sound respects the global mute toggle in the navbar (`localStorage` key `quizzical-muted`).
- Missing files fail silently — subtle Web Audio beeps are used as fallback until real mp3s are added.
