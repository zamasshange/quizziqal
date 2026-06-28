# Branded Clerk auth emails

Quizzical sends beautiful verification and sign-in emails with the site logo, purple/gold branding, and clear code blocks.

Clerk **Hobby (free)** plans cannot use custom templates in the dashboard or via API. We work around this by:

1. Turning off **Delivered by Clerk** for auth email templates
2. Listening for `email.created` webhooks
3. Sending our own HTML through [Resend](https://resend.com)

## Production setup

### 1. Resend

1. Create a [Resend](https://resend.com) account
2. Add and verify domain **`quizzical.site`**
3. Create an API key and add to Vercel + `.env.local`:

```bash
RESEND_API_KEY=re_...
AUTH_EMAIL_DOMAIN=quizzical.site   # optional, this is the default
```

### 2. Clerk webhook

1. [Clerk Dashboard](https://dashboard.clerk.com) → **Webhooks** → **Add endpoint**
2. URL: `https://quizzical.site/api/webhooks/clerk`
3. Subscribe to **`email.created`**
4. Copy the signing secret to Vercel + `.env.local`:

```bash
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
```

### 3. Hand off delivery to Quizzical

After Resend and the webhook are live on production:

```bash
npm run clerk:emails:handoff
```

This disables Clerk’s default sender for:

- `verification_code`
- `reset_password_code`
- `magic_link_sign_in`
- `magic_link_sign_up`

To revert to Clerk’s plain emails:

```bash
npm run clerk:emails:clerk
```

### 4. Clerk branding (optional, Pro plan)

On **Clerk Pro**, you can also run:

```bash
npm run sync:clerk-emails
```

That pushes the same HTML into Clerk’s template editor. On Hobby, use the webhook flow above.

## Local preview

Open `emails/clerk/preview.html` in a browser (static sample).

## Files

| File | Purpose |
|------|---------|
| `lib/emails/brandedAuthEmail.ts` | HTML + plain-text builders |
| `lib/emails/sendAuthEmail.ts` | Resend API sender |
| `app/api/webhooks/clerk/route.ts` | Webhook handler |
| `emails/clerk/templates.mjs` | Clerk API template source (Pro) |
| `scripts/sync-clerk-email-templates.mjs` | Push templates to Clerk API |
| `scripts/toggle-clerk-email-delivery.mjs` | Toggle Delivered by Clerk |
