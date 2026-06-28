import { verifyWebhook } from "@clerk/backend/webhooks";
import { buildAuthEmail } from "@/lib/emails/brandedAuthEmail";
import { sendAuthEmail } from "@/lib/emails/sendAuthEmail";
import { ensureUserProfile } from "@/lib/progression/ensureProfile";
import { DEFAULT_COUNTRY } from "@/lib/progression/countries";

export const runtime = "nodejs";

/** Clerk webhooks — branded auth emails + Supabase profile sync. */
export async function POST(req: Request) {
  let event;
  try {
    event = await verifyWebhook(req);
  } catch (err) {
    console.error("[clerk-webhook] verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "user.created") {
    const user = event.data;
    const userId = user.id;
    const username =
      user.username?.trim().toLowerCase() ??
      user.first_name?.trim().toLowerCase() ??
      `player_${userId.slice(-6)}`;

    try {
      await ensureUserProfile(userId, username, null, DEFAULT_COUNTRY);
    } catch (err) {
      console.error("[clerk-webhook] profile sync failed:", err);
      return new Response("Profile sync failed", { status: 500 });
    }

    return new Response("Profile created", { status: 200 });
  }

  if (event.type !== "email.created") {
    return new Response("Ignored", { status: 200 });
  }

  const email = event.data;
  const to = email.to_email_address?.trim();
  const slug = email.slug?.trim();

  if (!to || !slug) {
    console.warn("[clerk-webhook] email.created missing to or slug");
    return new Response("Missing fields", { status: 400 });
  }

  if (email.delivered_by_clerk) {
    return new Response("Clerk delivery enabled — skipped", { status: 200 });
  }

  const content = buildAuthEmail(slug, email.data ?? null);
  if (!content) {
    console.warn(`[clerk-webhook] unsupported slug: ${slug}`);
    return new Response("Unsupported template", { status: 200 });
  }

  try {
    await sendAuthEmail({
      to,
      subject: content.subject,
      html: content.html,
      text: content.text,
      fromLocalPart: email.from_email_name || "notifications",
    });
  } catch (err) {
    console.error("[clerk-webhook] send failed:", err);
    return new Response("Send failed", { status: 500 });
  }

  return new Response("Sent", { status: 200 });
}
