import { SITE_NAME, SITE_URL } from "@/lib/seo";

const BRAND = {
  cream: "#fffdf4",
  ink: "#0a0a0a",
  purple: "#5b19df",
  purpleDark: "#3a0ca3",
  gold: "#ffc83a",
  muted: "rgba(10, 10, 10, 0.62)",
} as const;

function emailShell({
  preheader,
  title,
  bodyHtml,
  footerNote,
}: {
  preheader: string;
  title: string;
  bodyHtml: string;
  footerNote: string;
}) {
  const logoUrl = `${SITE_URL}/logo.png`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.cream};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND.cream};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;">
          <tr>
            <td style="padding:0 0 18px 0;text-align:center;">
              <img src="${logoUrl}" width="88" height="88" alt="${SITE_NAME}" style="display:block;margin:0 auto;width:88px;height:88px;object-fit:contain;" />
            </td>
          </tr>
          <tr>
            <td style="background:${BRAND.purpleDark};border:3px solid ${BRAND.ink};border-radius:20px 20px 0 0;padding:18px 24px;text-align:center;">
              <p style="margin:0;font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND.gold};">Play · Learn · Level Up</p>
              <h1 style="margin:8px 0 0 0;font-size:24px;line-height:1.2;font-weight:900;color:#ffffff;">${title}</h1>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border:3px solid ${BRAND.ink};border-top:0;border-radius:0 0 20px 20px;padding:28px 24px 24px;box-shadow:0 6px 0 0 ${BRAND.ink};">
              ${bodyHtml}
              <p style="margin:24px 0 0 0;padding-top:18px;border-top:1px solid rgba(10,10,10,0.1);font-size:12px;line-height:1.6;color:${BRAND.muted};text-align:center;">
                ${footerNote}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 8px 0;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:${BRAND.muted};">
                <a href="${SITE_URL}" style="color:${BRAND.purple};text-decoration:none;font-weight:800;">quizzical.site</a>
                · Free quiz games by BDL Corp
              </p>
              <p style="margin:0;font-size:11px;color:rgba(10,10,10,0.45);">
                © ${SITE_NAME}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function codeBlock(code: string, label = "Verification code") {
  return `
    <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:${BRAND.muted};text-align:center;">
      Enter this code on the sign-in screen to continue:
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding:0 0 8px 0;">
          <p style="margin:0 0 8px 0;font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.purple};">${label}</p>
          <div style="display:inline-block;border:3px solid ${BRAND.ink};border-radius:16px;background:${BRAND.cream};padding:18px 28px;box-shadow:0 4px 0 0 ${BRAND.ink};">
            <span style="font-size:36px;line-height:1;font-weight:900;letter-spacing:0.22em;color:${BRAND.ink};font-family:Consolas,Monaco,'Courier New',monospace;">${code}</span>
          </div>
        </td>
      </tr>
    </table>
    <p style="margin:18px 0 0 0;font-size:13px;line-height:1.55;color:${BRAND.muted};text-align:center;">
      This code expires soon. <strong style="color:${BRAND.ink};">Never share it</strong> — ${SITE_NAME} staff will never ask for it.
    </p>`;
}

function magicLinkBlock(url: string) {
  return `
    <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:${BRAND.muted};text-align:center;">
      Tap the button below to sign in securely. This link works once and expires soon.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center">
          <a href="${url}" style="display:inline-block;background:${BRAND.purple};color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;padding:14px 28px;border:3px solid ${BRAND.ink};border-radius:999px;box-shadow:0 4px 0 0 ${BRAND.ink};">
            Sign in to ${SITE_NAME} →
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:20px 0 0 0;font-size:12px;line-height:1.6;color:rgba(10,10,10,0.5);text-align:center;word-break:break-all;">
      Or copy this link:<br />
      <a href="${url}" style="color:${BRAND.purple};">${url}</a>
    </p>`;
}

export type AuthEmailContent = {
  subject: string;
  html: string;
  text: string;
};

function readCode(data: Record<string, unknown> | null | undefined): string {
  if (!data) return "";
  const candidates = [data.otp_code, data.otp, data.code];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function readUrl(data: Record<string, unknown> | null | undefined): string {
  if (!data) return "";
  const candidates = [data.url, data.action_url, data.magic_link];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function buildAuthEmail(
  slug: string,
  data: Record<string, unknown> | null | undefined,
): AuthEmailContent | null {
  const code = readCode(data);
  const url = readUrl(data);

  if (slug === "verification_code" && code) {
    return {
      subject: `${code} is your ${SITE_NAME} verification code`,
      html: emailShell({
        preheader: `Your ${SITE_NAME} sign-in code is ${code}`,
        title: "Verification code",
        bodyHtml: codeBlock(code, "Verification code"),
        footerNote:
          "Didn't request this? You can safely ignore this email — your account stays secure.",
      }),
      text: `Your ${SITE_NAME} verification code is ${code}.\n\nEnter it on the sign-in screen. This code expires soon.\n\nNever share this code. If you didn't request it, ignore this email.\n\n— ${SITE_NAME} · ${SITE_URL}`,
    };
  }

  if (slug === "reset_password_code" && code) {
    return {
      subject: `Reset your ${SITE_NAME} password — ${code}`,
      html: emailShell({
        preheader: `Your ${SITE_NAME} password reset code is ${code}`,
        title: "Reset your password",
        bodyHtml: codeBlock(code, "Reset code"),
        footerNote:
          "Didn't request a reset? Ignore this email — your password won't change.",
      }),
      text: `Use this code to reset your ${SITE_NAME} password: ${code}.\n\nIf you didn't request a reset, ignore this email.\n\n— ${SITE_NAME} · ${SITE_URL}`,
    };
  }

  if (
    (slug === "magic_link_sign_in" ||
      slug === "magic_link_sign_up" ||
      slug === "magic_link_user_profile") &&
    url
  ) {
    return {
      subject: `Sign in to ${SITE_NAME}`,
      html: emailShell({
        preheader: `Your secure sign-in link for ${SITE_NAME}`,
        title: `Sign in to ${SITE_NAME}`,
        bodyHtml: magicLinkBlock(url),
        footerNote: "Didn't request this? You can safely ignore this email.",
      }),
      text: `Sign in to ${SITE_NAME}:\n\n${url}\n\nThis link expires soon. If you didn't request it, ignore this email.\n\n— ${SITE_NAME} · ${SITE_URL}`,
    };
  }

  return null;
}
