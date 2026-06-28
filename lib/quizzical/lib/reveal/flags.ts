// Turn a TheSportsDB nationality string (e.g. "Argentina") into a flag emoji.
// Covers the nations that show up most in football / basketball / tennis / etc.
// Unknown values return null so the UI can fall back gracefully.

const NAME_TO_ISO2: Record<string, string> = {
  argentina: "AR",
  australia: "AU",
  austria: "AT",
  belgium: "BE",
  brazil: "BR",
  cameroon: "CM",
  canada: "CA",
  chile: "CL",
  china: "CN",
  colombia: "CO",
  croatia: "HR",
  "czech republic": "CZ",
  czechia: "CZ",
  denmark: "DK",
  ecuador: "EC",
  egypt: "EG",
  england: "GB",
  finland: "FI",
  france: "FR",
  gabon: "GA",
  germany: "DE",
  ghana: "GH",
  greece: "GR",
  hungary: "HU",
  iceland: "IS",
  india: "IN",
  "ivory coast": "CI",
  "cote d'ivoire": "CI",
  ireland: "IE",
  israel: "IL",
  italy: "IT",
  jamaica: "JM",
  japan: "JP",
  kenya: "KE",
  mexico: "MX",
  morocco: "MA",
  netherlands: "NL",
  "new zealand": "NZ",
  nigeria: "NG",
  "northern ireland": "GB",
  norway: "NO",
  poland: "PL",
  portugal: "PT",
  romania: "RO",
  russia: "RU",
  scotland: "GB",
  senegal: "SN",
  serbia: "RS",
  slovakia: "SK",
  slovenia: "SI",
  "south africa": "ZA",
  "south korea": "KR",
  korea: "KR",
  spain: "ES",
  sweden: "SE",
  switzerland: "CH",
  turkey: "TR",
  "türkiye": "TR",
  ukraine: "UA",
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  uruguay: "UY",
  wales: "GB",
};

function iso2ToEmoji(iso2: string): string {
  return iso2
    .toUpperCase()
    .replace(/./g, (ch) =>
      String.fromCodePoint(127397 + ch.charCodeAt(0)),
    );
}

export function flagEmoji(nationality?: string | null): string | null {
  if (!nationality) return null;
  const iso = NAME_TO_ISO2[nationality.trim().toLowerCase()];
  return iso ? iso2ToEmoji(iso) : null;
}
