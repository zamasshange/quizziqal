# Quizzical

Free online quiz games at [quizzical.site](https://quizzical.site) — by BDL Corp, Sonke AI, Zama Shange, and Burdolar.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local` and fill in your values.

**Required — Clerk authentication**

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Add `quizzical.site` and your `*.vercel.app` domain in the [Clerk dashboard](https://dashboard.clerk.com).

**Clerk dashboard — enable username sign-in**

1. Open [Clerk Dashboard](https://dashboard.clerk.com) → **User & Authentication** → **Email, phone, username**
2. Enable **Username** as a sign-in identifier
3. (Recommended) Set **Username** as the primary identifier and keep email optional for recovery
4. Under **Sessions**, ensure the default session token includes `publicMetadata` (default in most Clerk apps)

New users are redirected to `/onboarding` after sign-up to pick a cartoon avatar before using the app.

**Branded verification emails (Hobby / free plan)**

Clerk’s free plan uses plain default emails. Quizzical ships custom HTML (logo, purple/gold branding) via a webhook + Resend. See [`emails/clerk/README.md`](emails/clerk/README.md) for production setup.

**Optional**

- `NEXT_PUBLIC_SITE_URL` — canonical URL for SEO (default: `https://quizzical.site`)
- `OPENROUTER_API_KEY` — AI quiz generator
- `TMDB_READ_TOKEN` — movie poster reveals

## Deploy on Vercel

The Next.js app lives at the **repository root**. Set environment variables in Vercel Settings, leave Root Directory blank, then redeploy.