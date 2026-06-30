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
      fullHtml = text.slice(text.indexOf("<body"));
      break;
    }
  } catch {
    /* skip */
  }
}

const idx = fullHtml.indexOf("GamesCollage_gamesList__DDVyb");
console.log("idx", idx, "total", fullHtml.length);
if (idx >= 0) {
  const chunk = fullHtml.slice(idx, idx + 12000).replace(/></g, ">\n<");
  fs.writeFileSync("tmp-games-collage.html", chunk);
  console.log(chunk.slice(0, 6000));
}
