/** Shared Quizzical-branded Clerk email shell (table-based for client compatibility). */

const BRAND = {
  cream: "#fffdf4",
  ink: "#0a0a0a",
  purple: "#5b19df",
  purpleDark: "#3a0ca3",
  gold: "#ffc83a",
  muted: "rgba(10, 10, 10, 0.62)",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://quizzical.site",
};

export function logoImg() {
  return `<img src="{{app.logo_image_url}}" width="88" height="88" alt="{{app.name}}" style="display:block;margin:0 auto;width:88px;height:88px;object-fit:contain;" />`;
}

export function emailShell({ preheader, title, bodyHtml, footerNote }) {
  const logo = logoImg();
  const preheaderText = preheader ?? title;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.cream};font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheaderText}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${BRAND.cream};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;">
          <tr>
            <td style="padding:0 0 18px 0;text-align:center;">
              ${logo}
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
                <a href="${BRAND.siteUrl}" style="color:${BRAND.purple};text-decoration:none;font-weight:800;">quizzical.site</a>
                · Free quiz games by BDL Corp
              </p>
              <p style="margin:0;font-size:11px;color:rgba(10,10,10,0.45);">
                © {{{app.name}}} · {{{app.domain_name}}}
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

export function codeBlock(label = "Your code") {
  return `
    <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:${BRAND.muted};text-align:center;">
      Enter this code on the sign-in screen to continue:
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" style="padding:0 0 8px 0;">
          <p style="margin:0 0 8px 0;font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.purple};">${label}</p>
          <div style="display:inline-block;border:3px solid ${BRAND.ink};border-radius:16px;background:${BRAND.cream};padding:18px 28px;box-shadow:0 4px 0 0 ${BRAND.ink};">
            <span style="font-size:36px;line-height:1;font-weight:900;letter-spacing:0.22em;color:${BRAND.ink};font-family:Consolas,Monaco,'Courier New',monospace;">{{{code}}}</span>
          </div>
        </td>
      </tr>
    </table>
    <p style="margin:18px 0 0 0;font-size:13px;line-height:1.55;color:${BRAND.muted};text-align:center;">
      This code expires soon. <strong style="color:${BRAND.ink};">Never share it</strong> — Quizzical staff will never ask for it.
    </p>`;
}
