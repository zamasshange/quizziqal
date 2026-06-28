/** Download competition logos into public/icons/competitions via Wikipedia API. */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "icons", "competitions");

/** Wikipedia page title → local filename */
const WIKI_PAGES = {
  UEFA_Champions_League: "ucl.png",
  UEFA_Europa_League: "uel.png",
  UEFA_Conference_League: "uecl.png",
  FIFA_World_Cup: "world-cup.png",
  Premier_League: "premier-league.png",
  La_Liga: "la-liga.png",
  Serie_A: "serie-a.png",
  Bundesliga: "bundesliga.png",
  Ligue_1: "ligue-1.png",
  FA_Cup: "fa-cup.png",
  Copa_del_Rey: "copa-del-rey.png",
  Copa_América: "copa-america.png",
  Africa_Cup_of_Nations: "afcon.png",
  "Ballon_d'Or": "ballon-dor.png",
  FIFA_Club_World_Cup: "club-world-cup.png",
  National_Basketball_Association: "nba.png",
  Major_League_Soccer: "mls.png",
  "DFB-Pokal": "dfb-pokal.png",
  Coppa_Italia: "coppa-italia.png",
  Coupe_de_France: "coupe-de-france.png",
};

async function wikiThumb(title) {
  const url =
    "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      titles: title,
      prop: "pageimages",
      format: "json",
      pithumbsize: "240",
    });
  const res = await fetch(url, {
    headers: { "User-Agent": "Quizzical/1.0 (quiz game; contact: dev@quizzical.app)" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const page = Object.values(data.query?.pages ?? {})[0];
  return page?.thumbnail?.source ?? null;
}

fs.mkdirSync(OUT, { recursive: true });

let ok = 0;
let fail = 0;

for (const [title, file] of Object.entries(WIKI_PAGES)) {
  const dest = path.join(OUT, file);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 500) {
    ok++;
    continue;
  }
  try {
    const thumb = await wikiThumb(title);
    if (!thumb) {
      console.log("no thumb:", title);
      fail++;
      continue;
    }
    const img = await fetch(thumb, {
      headers: { "User-Agent": "Quizzical/1.0 (quiz game)" },
    });
    if (!img.ok) {
      fail++;
      continue;
    }
    const buf = Buffer.from(await img.arrayBuffer());
    fs.writeFileSync(dest, buf);
    console.log("saved", file, buf.length);
    ok++;
  } catch {
    fail++;
  }
}

console.log(`Competition logos: ${ok} ok, ${fail} failed`);
