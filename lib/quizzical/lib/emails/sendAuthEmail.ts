type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  fromName?: string;
  fromLocalPart?: string;
};

const DEFAULT_FROM_LOCAL = "notifications";
const DEFAULT_FROM_NAME = "Quizzical";

export async function sendAuthEmail({
  to,
  subject,
  html,
  text,
  fromName = DEFAULT_FROM_NAME,
  fromLocalPart = DEFAULT_FROM_LOCAL,
}: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const fromDomain =
    process.env.AUTH_EMAIL_DOMAIN?.trim() || "quizzical.site";
  const from = `${fromName} <${fromLocalPart}@${fromDomain}>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Resend ${res.status}: ${detail}`);
  }
}
