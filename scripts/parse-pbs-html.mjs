import fs from "fs";

const lines = fs.readFileSync(
  "C:/Users/Lenovo/.cursor/projects/c-Users-Lenovo-Downloads-new-game/agent-transcripts/9683e117-60d3-4d3e-9503-529a41d89e6d/9683e117-60d3-4d3e-9503-529a41d89e6d.jsonl",
  "utf8",
).split("\n");

let fullHtml = "";
for (const line of lines) {
  if (!line.includes("pbskids.org")) continue;
  try {
    const j = JSON.parse(line);
    const text = j.message?.content?.find((c) => c.type === "text")?.text || "";
    if (text.includes("DOCTYPE")) {
      const idx = text.indexOf("<body");
      fullHtml = text.slice(idx);
      break;
    }
  } catch {
    /* skip */
  }
}

fs.writeFileSync("tmp-pbs-full-body.html", fullHtml.slice(0, 200000));
console.log("full body length", fullHtml.length);

const h = fullHtml;

const re = /data-pbsk-content-module="([^"]+)"/g;
let m;
const seen = new Set();
while ((m = re.exec(h))) {
  if (!seen.has(m[1])) {
    seen.add(m[1]);
    console.log(m[1]);
  }
}

for (const key of [
  "PropertiesNavigationHomepage",
  "GamesCollage_gamesGrid",
  "GamesCollage_gamesList",
  "GridLowerModule",
  "MastheadGamesVideosButtonsFeature",
  "PageSectionStack_innerWrapper",
  "data-theme-module-contextid",
]) {
  const idx = h.indexOf(key);
  console.log(`\n${key} idx:`, idx);
  if (idx >= 0) {
    console.log(h.slice(idx, idx + 3500).replace(/></g, ">\n<").slice(0, 3200));
  }
}

// Page section order
const themeIds = [...h.matchAll(/data-theme-module-contextid="([^"]+)"/g)].map((x) => x[1]);
console.log("\nTheme module IDs in order:", themeIds);
