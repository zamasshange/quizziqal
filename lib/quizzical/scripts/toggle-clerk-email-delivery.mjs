#!/usr/bin/env node
/** Disable Clerk delivery for auth emails (use our webhook + Resend instead). */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile(filename) {
  const path = resolve(root, filename);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const SLUGS = [
  "verification_code",
  "reset_password_code",
  "magic_link_sign_in",
  "magic_link_sign_up",
];

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY?.startsWith("sk_")) {
  console.error("Missing CLERK_SECRET_KEY");
  process.exit(1);
}

async function toggle(slug, deliveredByClerk) {
  const res = await fetch(
    `https://api.clerk.com/v1/templates/email/${slug}/toggle_delivery`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ delivered_by_clerk: deliveredByClerk }),
    },
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`${slug}: ${res.status} ${text}`);
}

const enableClerk = process.argv.includes("--clerk");
const delivered = enableClerk;

for (const slug of SLUGS) {
  process.stdout.write(`${slug} → delivered_by_clerk=${delivered} … `);
  try {
    await toggle(slug, delivered);
    console.log("ok");
  } catch (err) {
    console.log("failed");
    console.error(`  ${err.message}`);
  }
}
