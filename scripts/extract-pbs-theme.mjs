import fs from "fs";
import path from "path";

const htmlPath = path.join("sonke_games", "public", "pbs", "games.html");
const html = fs.readFileSync(htmlPath, "utf8");
const blocks = [
  ...html.matchAll(/<style[^>]*data-pbsk-theme-styles-source[^>]*>([\s\S]*?)<\/style>/g),
];
const outDir = path.join("components", "skin");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "pbs-theme.css"), blocks.map((b) => b[1]).join("\n"));
const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
fs.writeFileSync(path.join(outDir, "pbs-stylesheets.json"), JSON.stringify(links, null, 2));
console.log("theme blocks:", blocks.length, "stylesheets:", links.length);
