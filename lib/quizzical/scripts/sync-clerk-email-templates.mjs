#!/usr/bin/env node
/**
 * Push branded Quizzical email templates to Clerk.
 *
 * Usage:
 *   CLERK_SECRET_KEY=sk_live_... npm run sync:clerk-emails
 *
 * Also uploads logo URL hint — set your Clerk Dashboard → Branding logo to
 * https://quizzical.site/logo.png (or run with NEXT_PUBLIC_SITE_URL).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CLERK_EMAIL_TEMPLATES } from "../emails/clerk/templates.mjs";

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

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_API = "https://api.clerk.com/v1";

if (!CLERK_SECRET_KEY?.startsWith("sk_")) {
  console.error(
    "Missing CLERK_SECRET_KEY. Add it to .env.local or pass it in the environment.",
  );
  process.exit(1);
}

async function clerkFetch(path, options = {}) {
  const res = await fetch(`${CLERK_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers ?? {}),
    },
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const detail =
      typeof data === "object" && data
        ? JSON.stringify(data.errors ?? data, null, 2)
        : text;
    throw new Error(`Clerk API ${res.status} ${path}: ${detail}`);
  }

  return data;
}

async function listEmailTemplates() {
  try {
    const data = await clerkFetch("/templates/email");
    return Array.isArray(data) ? data : (data?.data ?? []);
  } catch {
    return [];
  }
}

async function upsertTemplate(template) {
  const payload = {
    name: template.name,
    subject: template.subject,
    markup: template.markup,
    body: template.body,
    delivered_by_clerk: true,
    from_email_name: template.fromEmailName ?? "notifications",
    reply_to_email_name: template.replyToEmailName ?? "support",
  };

  return clerkFetch(`/templates/email/${template.slug}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

async function main() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quizzical.site";
  console.log(`Syncing ${CLERK_EMAIL_TEMPLATES.length} Quizzical email templates…`);
  console.log(`Logo should be set in Clerk Dashboard → Branding → ${siteUrl}/logo.png\n`);

  const existing = await listEmailTemplates();
  if (existing.length > 0) {
    console.log(
      "Found Clerk email templates:",
      existing.map((t) => t.slug).join(", "),
    );
    console.log();
  }

  for (const template of CLERK_EMAIL_TEMPLATES) {
    process.stdout.write(`  • ${template.slug} … `);
    try {
      await upsertTemplate(template);
      console.log("ok");
    } catch (err) {
      console.log("failed");
      console.error(`    ${err.message}`);
    }
  }

  console.log("\nDone. Send a test verification email from Clerk Dashboard → Emails to preview.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
