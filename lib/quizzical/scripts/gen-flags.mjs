/** Download all flag PNGs into public/flags from flagcdn (run after adding countries). */
import fs from "node:fs";
import path from "node:path";
import { ALL_COUNTRIES } from "../lib/allCountries.ts";

const dir = path.join(process.cwd(), "public", "flags");
fs.mkdirSync(dir, { recursive: true });

let ok = 0;
let fail = 0;

for (const { iso2 } of ALL_COUNTRIES) {
  const file = path.join(dir, `${iso2.toLowerCase()}.png`);
  try {
    const res = await fetch(`https://flagcdn.com/w160/${iso2.toLowerCase()}.png`);
    if (!res.ok) {
      fail++;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 50) {
      fail++;
      continue;
    }
    fs.writeFileSync(file, buf);
    ok++;
  } catch {
    fail++;
  }
}

console.log(`Flags: ${ok} saved, ${fail} failed (${ALL_COUNTRIES.length} total)`);
