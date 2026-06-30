import fs from "fs";

const lines = fs.readFileSync(
  "C:/Users/Lenovo/.cursor/projects/c-Users-Lenovo-Downloads-new-game/agent-transcripts/9683e117-60d3-4d3e-9503-529a41d89e6d/9683e117-60d3-4d3e-9503-529a41d89e6d.jsonl",
  "utf8",
).split("\n");

let h = "";
for (const line of lines) {
  if (!line.includes("pbskids.org")) continue;
  try {
    const j = JSON.parse(line);
    const text = j.message?.content?.find((c) => c.type === "text")?.text || "";
    if (text.includes("DOCTYPE")) {
      h = text.slice(text.indexOf("<body"));
      break;
    }
  } catch {
    /* skip */
  }
}

const start = h.indexOf("StandardHeader_pbsKidsLogo");
const end = h.indexOf("MastheadGamesVideosButtonsFeature_componentWrapper");
console.log(h.slice(start, end).replace(/></g, ">\n<"));
