/** Guess the Athlete — individual / niche sports only. */

export const ATHLETE_AI_SPORT_RULE =
  "ONLY pick athletes from individual or niche sports: tennis, athletics/track, swimming, " +
  "gymnastics, Formula 1, golf, boxing, cycling, martial arts/MMA, surfing, skiing, " +
  "snowboarding, badminton, table tennis, climbing, triathlon, fencing, archery, " +
  "wrestling, figure skating, etc. " +
  "Do NOT include football/soccer players, basketball players, or other major team-sport stars.";

export const ATHLETE_KIND_LABEL =
  "famous athletes from individual and niche sports (tennis, track, swimming, F1, golf, etc.)";

export const FOOTBALL_AI_SPORT_RULE =
  "ONLY pick famous football/soccer players from any era and league worldwide. " +
  "Use full real names. Do NOT pick basketball, cricket, or other sport athletes.";

export const FOOTBALL_KIND_LABEL = "famous footballers and soccer players";

export const BASKETBALL_AI_SPORT_RULE =
  "ONLY pick famous basketball players (NBA, WNBA, international). " +
  "Use full real names. Do NOT pick football/soccer or other sport athletes.";

export const BASKETBALL_KIND_LABEL = "famous basketball players and NBA stars";

export const CRICKET_AI_SPORT_RULE =
  "ONLY pick famous cricket players (Test, ODI, T20, IPL). " +
  "Use full real names. Do NOT pick football or basketball players.";

export const CRICKET_KIND_LABEL = "famous cricket players and international stars";

/** Names that belong in major-sport categories — kept out of niche Athlete quiz. */
export const MAJOR_SPORT_ATHLETE_NAMES = new Set(
  [
    "Lionel Messi",
    "Cristiano Ronaldo",
    "Kylian Mbappé",
    "Neymar",
    "Erling Haaland",
    "Robert Lewandowski",
    "Mohamed Salah",
    "Harry Kane",
    "Luka Modrić",
    "Kevin De Bruyne",
    "LeBron James",
    "Michael Jordan",
    "Kobe Bryant",
    "Stephen Curry",
    "Shaquille O'Neal",
    "Kevin Durant",
    "Giannis Antetokounmpo",
    "Virat Kohli",
    "Sachin Tendulkar",
    "MS Dhoni",
    "Ben Stokes",
  ].map((n) => n.toLowerCase()),
);

export function isMajorTeamSportAthlete(name: string): boolean {
  return MAJOR_SPORT_ATHLETE_NAMES.has(name.toLowerCase().trim());
}

export const CATEGORY_AI_RULES: Record<string, string | undefined> = {
  Athlete: ATHLETE_AI_SPORT_RULE,
  Football: FOOTBALL_AI_SPORT_RULE,
  Basketball: BASKETBALL_AI_SPORT_RULE,
  Cricket: CRICKET_AI_SPORT_RULE,
};
