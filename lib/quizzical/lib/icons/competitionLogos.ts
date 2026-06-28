/** Maps honour / trophy text to self-hosted competition logos. */

export type CompetitionLogo = {
  id: string;
  label: string;
  patterns: RegExp[];
  image: string;
};

export const COMPETITION_LOGOS: CompetitionLogo[] = [
  {
    id: "ucl",
    label: "UEFA Champions League",
    patterns: [
      /\buefa champions league\b/i,
      /\bchampions league\b/i,
      /\bucl\b/i,
    ],
    image: "/icons/competitions/ucl.png",
  },
  {
    id: "uel",
    label: "UEFA Europa League",
    patterns: [/\beuropa league\b/i, /\buefa europa\b/i, /\buel\b/i],
    image: "/icons/competitions/uel.png",
  },
  {
    id: "uecl",
    label: "UEFA Conference League",
    patterns: [/\bconference league\b/i, /\buecl\b/i],
    image: "/icons/competitions/uecl.png",
  },
  {
    id: "world-cup",
    label: "FIFA World Cup",
    patterns: [
      /\bworld cup\b/i,
      /\bfifa world cup\b/i,
      /\bwc winner\b/i,
    ],
    image: "/icons/competitions/world-cup.png",
  },
  {
    id: "premier-league",
    label: "Premier League",
    patterns: [
      /\bpremier league\b/i,
      /\benglish premier\b/i,
      /\bepl\b/i,
    ],
    image: "/icons/competitions/premier-league.png",
  },
  {
    id: "la-liga",
    label: "La Liga",
    patterns: [/\bla liga\b/i, /\bspanish league\b/i],
    image: "/icons/competitions/la-liga.png",
  },
  {
    id: "serie-a",
    label: "Serie A",
    patterns: [/\bserie a\b/i, /\bitalian league\b/i],
    image: "/icons/competitions/serie-a.png",
  },
  {
    id: "bundesliga",
    label: "Bundesliga",
    patterns: [/\bbundesliga\b/i, /\bgerman league\b/i],
    image: "/icons/competitions/bundesliga.png",
  },
  {
    id: "ligue-1",
    label: "Ligue 1",
    patterns: [/\bligue 1\b/i, /\bfrench league\b/i],
    image: "/icons/competitions/ligue-1.png",
  },
  {
    id: "fa-cup",
    label: "FA Cup",
    patterns: [/\bfa cup\b/i],
    image: "/icons/competitions/fa-cup.png",
  },
  {
    id: "copa-del-rey",
    label: "Copa del Rey",
    patterns: [/\bcopa del rey\b/i],
    image: "/icons/competitions/copa-del-rey.png",
  },
  {
    id: "copa-america",
    label: "Copa América",
    patterns: [/\bcopa america\b/i, /\bcopa américa\b/i],
    image: "/icons/competitions/copa-america.png",
  },
  {
    id: "afcon",
    label: "Africa Cup of Nations",
    patterns: [
      /\bafcon\b/i,
      /\bafrica cup of nations\b/i,
      /\bcan winner\b/i,
    ],
    image: "/icons/competitions/afcon.png",
  },
  {
    id: "ballon-dor",
    label: "Ballon d'Or",
    patterns: [/\bballon d'or\b/i, /\bballon dor\b/i],
    image: "/icons/competitions/ballon-dor.png",
  },
  {
    id: "club-world-cup",
    label: "FIFA Club World Cup",
    patterns: [/\bclub world cup\b/i],
    image: "/icons/competitions/club-world-cup.png",
  },
  {
    id: "nba",
    label: "NBA",
    patterns: [/\bnba\b/i, /\bnational basketball association\b/i],
    image: "/icons/competitions/nba.png",
  },
  {
    id: "mls",
    label: "MLS",
    patterns: [/\bmls\b/i, /\bmajor league soccer\b/i],
    image: "/icons/competitions/mls.png",
  },
  {
    id: "dfb-pokal",
    label: "DFB-Pokal",
    patterns: [/\bdfb.?pokal\b/i, /\bgerman cup\b/i],
    image: "/icons/competitions/dfb-pokal.png",
  },
  {
    id: "coppa-italia",
    label: "Coppa Italia",
    patterns: [/\bcoppa italia\b/i],
    image: "/icons/competitions/coppa-italia.png",
  },
  {
    id: "coupe-de-france",
    label: "Coupe de France",
    patterns: [/\bcoupe de france\b/i],
    image: "/icons/competitions/coupe-de-france.png",
  },
];

export function matchCompetitionLogo(text: string): CompetitionLogo | null {
  const t = text.trim();
  if (!t) return null;
  for (const logo of COMPETITION_LOGOS) {
    if (logo.patterns.some((p) => p.test(t))) return logo;
  }
  return null;
}
