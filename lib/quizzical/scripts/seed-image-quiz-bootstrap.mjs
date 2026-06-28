/**
 * One-time bootstrap: resolve Wikipedia/TMDB images for curated POOL entries.
 * Output: lib/imageQuizBootstrap.json (bundled for instant cold starts).
 *
 * Usage: node scripts/seed-image-quiz-bootstrap.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outFile = path.join(root, "lib", "imageQuizBootstrap.json");

const POOLS = {
  Celebrity: [
    ["Tom Hanks", "Tom Hanks"],
    ["Leonardo DiCaprio", "Leonardo DiCaprio"],
    ["Meryl Streep", "Meryl Streep"],
    ["Denzel Washington", "Denzel Washington"],
    ["Zendaya", "Zendaya"],
    ["Brad Pitt", "Brad Pitt"],
    ["Scarlett Johansson", "Scarlett Johansson"],
    ["Morgan Freeman", "Morgan Freeman"],
    ["Will Smith", "Will Smith"],
    ["Margot Robbie", "Margot Robbie"],
    ["Keanu Reeves", "Keanu Reeves"],
    ["Angelina Jolie", "Angelina Jolie"],
  ],
  Athlete: [
    ["Serena Williams", "Serena Williams"],
    ["Roger Federer", "Roger Federer"],
    ["Rafael Nadal", "Rafael Nadal"],
    ["Naomi Osaka", "Naomi Osaka"],
    ["Usain Bolt", "Usain Bolt"],
    ["Eliud Kipchoge", "Eliud Kipchoge"],
    ["Simone Biles", "Simone Biles"],
    ["Michael Phelps", "Michael Phelps"],
    ["Lewis Hamilton", "Lewis Hamilton"],
    ["Tiger Woods", "Tiger Woods"],
    ["Ian Thorpe", "Ian Thorpe"],
    ["Chloe Kim", "Chloe Kim"],
  ],
  Football: [
    ["Lionel Messi", "Lionel Messi"],
    ["Cristiano Ronaldo", "Cristiano Ronaldo"],
    ["Kylian Mbappé", "Kylian Mbappé"],
    ["Neymar", "Neymar"],
    ["Erling Haaland", "Erling Haaland"],
    ["Mohamed Salah", "Mohamed Salah"],
    ["Kevin De Bruyne", "Kevin De Bruyne"],
    ["Robert Lewandowski", "Robert Lewandowski"],
    ["Harry Kane", "Harry Kane"],
    ["Luka Modrić", "Luka Modrić"],
    ["Pelé", "Pelé"],
    ["Zinedine Zidane", "Zinedine Zidane"],
  ],
  Basketball: [
    ["LeBron James", "LeBron James"],
    ["Michael Jordan", "Michael Jordan"],
    ["Stephen Curry", "Stephen Curry"],
    ["Kobe Bryant", "Kobe Bryant"],
    ["Shaquille O'Neal", "Shaquille O'Neal"],
    ["Kevin Durant", "Kevin Durant"],
    ["Giannis Antetokounmpo", "Giannis Antetokounmpo"],
    ["Magic Johnson", "Magic Johnson"],
    ["Larry Bird", "Larry Bird"],
    ["Tim Duncan", "Tim Duncan"],
    ["Dirk Nowitzki", "Dirk Nowitzki"],
    ["Hakeem Olajuwon", "Hakeem Olajuwon"],
  ],
  Cricket: [
    ["Virat Kohli", "Virat Kohli"],
    ["Sachin Tendulkar", "Sachin Tendulkar"],
    ["MS Dhoni", "MS Dhoni"],
    ["Ben Stokes", "Ben Stokes"],
    ["Babar Azam", "Babar Azam"],
    ["Steve Smith", "Steve Smith (cricketer)"],
    ["Jacques Kallis", "Jacques Kallis"],
    ["Shane Warne", "Shane Warne"],
    ["Brian Lara", "Brian Lara"],
    ["AB de Villiers", "AB de Villiers"],
    ["Rohit Sharma", "Rohit Sharma"],
    ["Joe Root", "Joe Root"],
  ],
  Movie: [
    ["Inception", "Inception"],
    ["Titanic", "Titanic (1997 film)"],
    ["The Matrix", "The Matrix"],
    ["The Dark Knight", "The Dark Knight"],
    ["Joker", "Joker (2019 film)"],
    ["Avatar", "Avatar (2009 film)"],
    ["Parasite", "Parasite (2019 film)"],
    ["Interstellar", "Interstellar (film)"],
    ["Gladiator", "Gladiator (2000 film)"],
    ["Forrest Gump", "Forrest Gump"],
    ["The Godfather", "The Godfather"],
    ["Pulp Fiction", "Pulp Fiction"],
  ],
  Music: [
    ["Beyoncé", "Beyoncé"],
    ["Taylor Swift", "Taylor Swift"],
    ["Drake", "Drake (rapper)"],
    ["Adele", "Adele (singer)"],
    ["The Weeknd", "The Weeknd"],
    ["Rihanna", "Rihanna"],
    ["Eminem", "Eminem"],
    ["Ed Sheeran", "Ed Sheeran"],
    ["Bruno Mars", "Bruno Mars"],
    ["Ariana Grande", "Ariana Grande"],
    ["Billie Eilish", "Billie Eilish"],
    ["Kendrick Lamar", "Kendrick Lamar"],
  ],
};

const UA = "Quizzical/1.0 (quiz game; contact: dev@quizzical.app)";

async function wikiSummary(query) {
  const tryQuery = async (q) => {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { accept: "application/json", "Api-User-Agent": UA },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const image = data?.thumbnail?.source ?? data?.originalimage?.source ?? "";
    if (!image) return null;
    return {
      description: String(data?.description ?? data?.title ?? "").trim(),
      image_url: image,
    };
  };

  const direct = await tryQuery(query);
  if (direct) return direct;

  const params = new URLSearchParams({
    action: "opensearch",
    search: query,
    limit: "5",
    namespace: "0",
    format: "json",
  });
  const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
    headers: { accept: "application/json", "Api-User-Agent": UA },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const titles = data[1] ?? [];
  for (const title of titles) {
    const hit = await tryQuery(title);
    if (hit) return hit;
  }
  return null;
}

async function movieData(title, token) {
  const search = new URL("https://api.themoviedb.org/3/search/movie");
  search.searchParams.set("query", title);
  const res = await fetch(search, {
    headers: { accept: "application/json", Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data?.results?.[0];
  if (!hit) return null;
  const poster = hit.poster_path
    ? `https://image.tmdb.org/t/p/w500${hit.poster_path}`
    : null;
  const backdrop = hit.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${hit.backdrop_path}`
    : null;
  const year = hit.release_date?.slice(0, 4) ?? "";
  return {
    poster_url: poster,
    backdrop_url: backdrop,
    hint: year ? `Released ${year}` : null,
  };
}

function isPoster(url) {
  return /\/t\/p\/w\d+\//.test(url) && !url.includes("w1280");
}

async function resolve(category, label, query, tmdbToken) {
  if (category === "Movie") {
    const m = await movieData(label, tmdbToken);
    let image_url = m?.backdrop_url ?? null;
    let description = m?.hint ?? "";
    if (!image_url || isPoster(image_url)) {
      const w = await wikiSummary(query);
      if (w?.image_url && !isPoster(w.image_url)) {
        image_url = w.image_url;
        description = w.description || description;
      }
    }
    if (!image_url) return null;
    return {
      name: label,
      category,
      image_url,
      description,
      correct_answer: label,
      wrong_answers: [],
      poster_url: m?.poster_url ?? null,
      hint: m?.hint ?? null,
    };
  }

  const w = await wikiSummary(query);
  if (!w?.image_url) return null;
  return {
    name: label,
    category,
    image_url: w.image_url,
    description: w.description,
    correct_answer: label,
    wrong_answers: [],
    poster_url: null,
    hint: null,
  };
}

async function main() {
  const tmdb = process.env.TMDB_READ_TOKEN ?? "";
  let out = {};
  try {
    out = JSON.parse(fs.readFileSync(outFile, "utf8"));
  } catch {
    out = {};
  }
  let ok = 0;
  let fail = 0;
  let skipped = 0;

  for (const [category, entries] of Object.entries(POOLS)) {
    for (const [label, query] of entries) {
      const key = `${category}|${label}`;
      if (out[key]?.image_url) {
        skipped++;
        continue;
      }
      process.stdout.write(`Resolving ${key}… `);
      try {
        const row = await resolve(category, label, query, tmdb);
        if (row) {
          out[key] = row;
          ok++;
          console.log("ok");
        } else {
          fail++;
          console.log("skip");
        }
      } catch (e) {
        fail++;
        console.log("error", e?.message ?? e);
      }
      await new Promise((r) => setTimeout(r, 700));
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(out, null, 2), "utf8");
  console.log(
    `\nWrote ${Object.keys(out).length} total entries to ${outFile} (+${ok} new, ${skipped} kept, ${fail} failed)`,
  );
}

main();
