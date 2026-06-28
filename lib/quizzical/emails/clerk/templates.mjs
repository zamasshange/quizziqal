import { codeBlock, emailShell } from "./buildMarkup.mjs";

/** Clerk email template definitions — synced via scripts/sync-clerk-email-templates.mjs */
export const CLERK_EMAIL_TEMPLATES = [
  {
    slug: "verification_code",
    name: "Quizzical — Verification code",
    subject: "{{{code}}} is your Quizzical verification code",
    fromEmailName: "notifications",
    replyToEmailName: "support",
    body: `Your Quizzical verification code is {{{code}}}.

Enter it on the sign-in screen to continue. This code expires soon.

Never share this code with anyone. Quizzical staff will never ask for it.

If you didn't request this, you can safely ignore this email.

— Quizzical · {{{app.domain_name}}}`,
    markup: emailShell({
      preheader: "Your Quizzical sign-in code is {{{code}}}",
      title: "Verification code",
      bodyHtml: codeBlock("Verification code"),
      footerNote:
        "Didn't request this? You can safely ignore this email — your account stays secure.",
    }),
  },
  {
    slug: "reset_password_code",
    name: "Quizzical — Reset password code",
    subject: "Reset your Quizzical password — {{{code}}}",
    fromEmailName: "notifications",
    replyToEmailName: "support",
    body: `Use this code to reset your Quizzical password: {{{code}}}.

Enter it on the password reset screen. This code expires soon.

If you didn't request a password reset, ignore this email.

— Quizzical · {{{app.domain_name}}}`,
    markup: emailShell({
      preheader: "Your Quizzical password reset code is {{{code}}}",
      title: "Reset your password",
      bodyHtml: codeBlock("Reset code"),
      footerNote:
        "Didn't request a reset? Ignore this email — your password won't change.",
    }),
  },
  {
    slug: "magic_link",
    name: "Quizzical — Magic link",
    subject: "Sign in to Quizzical",
    fromEmailName: "notifications",
    replyToEmailName: "support",
    body: `Sign in to Quizzical by opening this link:

{{{action_url}}}

This link expires soon. If you didn't request it, you can ignore this email.

— Quizzical · {{{app.domain_name}}}`,
    markup: emailShell({
      preheader: "Your secure sign-in link for Quizzical",
      title: "Sign in to Quizzical",
      bodyHtml: `
        <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:rgba(10,10,10,0.62);text-align:center;">
          Tap the button below to sign in securely. This link works once and expires soon.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td align="center">
              <a href="{{{action_url}}}" style="display:inline-block;background:#5b19df;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;padding:14px 28px;border:3px solid #0a0a0a;border-radius:999px;box-shadow:0 4px 0 0 #0a0a0a;">
                Sign in to Quizzical →
              </a>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0 0;font-size:12px;line-height:1.6;color:rgba(10,10,10,0.5);text-align:center;word-break:break-all;">
          Or copy this link:<br />
          <a href="{{{action_url}}}" style="color:#5b19df;">{{{action_url}}}</a>
        </p>`,
      footerNote:
        "Didn't request this? You can safely ignore this email.",
    }),
  },
];
