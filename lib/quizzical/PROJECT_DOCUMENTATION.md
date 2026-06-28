# Quizzical — Project Documentation

> **Live site:** [quizzical.site](https://quizzical.site)  
> **Tagline:** Free online quiz games where learning meets entertainment.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What Is Quizzical?](#2-what-is-quizzical)
3. [Mission & Value Proposition](#3-mission--value-proposition)
4. [Team & Credits](#4-team--credits)
5. [Core Features](#5-core-features)
6. [Game Modes & Content](#6-game-modes--content)
7. [Progression & Gamification](#7-progression--gamification)
8. [Technology Stack](#8-technology-stack)
9. [Architecture Overview](#9-architecture-overview)
10. [External Services & APIs](#10-external-services--apis)
11. [Project Structure](#11-project-structure)
12. [User Journey](#12-user-journey)
13. [SEO & Discoverability](#13-seo--discoverability)
14. [Environment & Deployment](#14-environment--deployment)
15. [Admin & Content Management](#15-admin--content-management)
16. [Design & UX](#16-design--ux)
17. [Quick Stats](#17-quick-stats)

---

## 1. Executive Summary

**Quizzical** is a free, AI-powered online quiz platform built by **BDL Corp** (Burdolar). It combines curated trivia, picture-guessing games, and on-demand AI quiz generation with a full progression system — XP, levels, achievements, leaderboards, and a “Knowledge Atlas” that tracks everything players learn.

Unlike traditional quiz sites that only score right/wrong answers, Quizzical is designed as a **learning platform**: after every answer, players receive rich **reveal cards** with facts, images, and context sourced from Wikipedia, TMDB, and sports databases.

The product is built as a modern **Next.js** web application, deployed on **Vercel**, with **Clerk** for authentication and **Supabase** for leaderboards, progression sync, and content caching.

---

## 2. What Is Quizzical?

Quizzical is a browser-based quiz and trivia platform where users can:

- Play **40+ curated text quizzes** across 8 categories (geography, sports, history, science, entertainment, and more)
- Challenge themselves with **7 picture-guessing games** (celebrities, athletes, footballers, basketball players, cricketers, movies, music artists)
- Take a **Flags of the World** quiz with 197 countries and randomized rounds
- **Generate custom AI quizzes** on any topic in seconds
- **Earn XP, level up, unlock content**, and compete on leaderboards
- **Collect discoveries** in a Knowledge Book and fill a World Knowledge Atlas
- **Explore** dedicated pages for countries, landmarks, athletes, celebrities, movies, and historical figures

The experience is free, ad-free during gameplay, and optimized for both desktop and mobile.

---

## 3. Mission & Value Proposition

### Mission

Make knowledge fun, engaging, and accessible to everyone by combining artificial intelligence, trusted information sources, and interactive gameplay.

### What Makes Quizzical Different

| Pillar | Description |
|--------|-------------|
| **Learn while you play** | Reveal cards after every answer — facts, images, Wikipedia extracts, movie posters, sports stats |
| **AI-powered flexibility** | Generate quizzes on any topic with adjustable difficulty and question count |
| **Trusted sources** | Wikipedia, TMDB, and TheSportsDB power picture quizzes and educational reveals |
| **Deep progression** | XP, levels, streaks, daily missions, achievements, seasonal ranks, and unlock gates |
| **Knowledge collection** | Discoveries persist in a personal Knowledge Book and contribute to the World Knowledge Atlas |

---

## 4. Team & Credits

| Role | Name / Entity |
|------|----------------|
| **Organization** | BDL Corp (Burdolar) |
| **Founder / Lead** | Zama Shange |
| **Contributors** | Sonke AI, Burdolar |
| **Product** | [quizzical.site](https://quizzical.site) |

BDL Corp is a creative and technology initiative focused on digital products, design, and media — Quizzical represents their intersection of education and entertainment.

---

## 5. Core Features

### 5.1 Curated Text Quizzes

- Multiple-choice questions with timed rounds
- Categories: Art & Literature, Entertainment, Geography, History, Languages, Science & Nature, Sports, Trivia
- Visual modes: question images, answer images, or both (powered by Wikipedia)
- Score tracking, streaks, and post-answer reveals

### 5.2 Picture Guessing Games

Seven dedicated image-quiz modes with real photos:

| Game | Slug | Data Source |
|------|------|-------------|
| Guess the Celebrity | `/play/celebrity` | Wikipedia |
| Guess the Footballer | `/play/football` | Wikipedia / TheSportsDB |
| Guess the Basketball Player | `/play/basketball` | Wikipedia / TheSportsDB |
| Guess the Cricketer | `/play/cricket` | Wikipedia / TheSportsDB |
| Guess the Athlete | `/play/athlete` | Wikipedia / TheSportsDB |
| Guess the Movie | `/play/movie` | TMDB (scene stills + poster reveals) |
| Guess the Music Artist | `/play/music` | Wikipedia |

### 5.3 Flags of the World

- Pool of **197 countries and territories**
- Randomized rounds with no duplicate flags per game
- Flag images fetched via Wikipedia

### 5.4 AI Quiz Generator

- Available at `/ai`
- Users enter any topic, choose difficulty (Easy / Medium / Hard), and question count (3–10)
- Powered by **OpenRouter** (default model: `openai/gpt-4o-mini`)
- Instantly playable — no account required for generation

### 5.5 Reveal Engine

After each answer, the **reveal engine** resolves educational content:

- Picks the right provider based on category (Wikipedia, TMDB, TheSportsDB, country data)
- Caches results in Supabase for performance
- Falls back gracefully when a source is unavailable
- Shows country flags, capitals, movie posters, athlete stats, and Wikipedia facts

### 5.6 User Accounts & Profiles

- **Clerk** authentication with username-based sign-in
- Onboarding flow: pick a cartoon avatar after sign-up
- Public profiles at `/profile/[username]`
- Account settings at `/account`

### 5.7 Platform Features (Homepage)

- **Top Players** widget — leaderboard highlights
- **Recommended For You** — personalized quiz suggestions
- **Player Spotlights** — featured community members
- **Live Activity Feed** — recent platform activity

### 5.8 Discover Hub

SEO-rich encyclopedia-style pages at `/discover` and entity routes:

- Countries (`/country/[slug]`)
- Landmarks (`/landmark/[slug]`)
- Athletes (`/player/[slug]`)
- Celebrities (`/celebrity/[slug]`)
- Movies (`/movie/[slug]`)
- Historical figures (`/figure/[slug]`)

Each page links to related quizzes and feeds the Knowledge Book.

---

## 6. Game Modes & Content

### Quiz Categories (8)

| Slug | Name | Example Tag |
|------|------|-------------|
| `art-and-literature` | Art & Literature | Guess the Author |
| `entertainment` | Entertainment | Guess the Movie |
| `geography` | Geography | Guess the City |
| `history` | History | Guess the President |
| `languages` | Languages | Guess the Word |
| `science-and-nature` | Science & Nature | Guess the Element |
| `sports` | Sports | Guess the Footballer |
| `trivia` | Trivia | Guess the Answer |

### Sample Curated Quizzes

World Capitals, Space & The Solar System, Flags of the World, Famous Landmarks, World History, Premier League, Oscar Winners, Human Body, Periodic Table, and many more — **40+ quizzes** in the catalogue.

### Atlas Tracks (15 knowledge domains)

Countries, Capitals, Landmarks, Athletes, Celebrities, Movies, Music Artists, Animals, Foods, Historical Figures, Historical Events, Science Concepts, Planets & Space, Inventions, Languages.

---

## 7. Progression & Gamification

Quizzical treats learning as a game with a full RPG-style progression layer.

### XP & Levels

- Earn XP for correct answers, quiz completion, perfect scores, daily challenges, and missions
- Level up to unlock new worlds, picture games, and cosmetic rewards
- Level titles progress from beginner to “Legend” tiers

### Streaks & Daily Rewards

- Daily play streaks with longest-streak tracking
- First-quiz-of-the-day bonuses
- Daily missions with XP and coin rewards

### Achievements (10+)

Examples: World Traveler, Sports Fanatic, Movie Buff, History Lover, Science Explorer, Dedicated (30-day streak), Knowledge Collector (1,000 discoveries), Perfectionist, Quiz Marathon, Halfway to Legend (level 50).

### Badges

Knowledge Explorer, World Traveler, Sports Expert, Movie Buff, Music Master, Genius, Streak Master, Champion.

### Unlock System

Content is gated behind level, mastery, discovery count, achievements, streaks, and atlas completion:

- **Worlds** — category hubs (Geography World, Sports Arena, etc.)
- **Picture games** — unlock at higher levels
- **Boss & rare quizzes** — mastery and discovery requirements
- **Legendary content** — atlas completion thresholds

### Leaderboards

- Global, weekly, and country-based rankings
- Seasonal competitions (30-day seasons)
- Hall of Fame at `/hall-of-fame`

### Knowledge Book & Atlas

- **Knowledge Book** (`/knowledge-book`) — personal collection of every term discovered
- **World Knowledge Atlas** (`/knowledge-atlas`) — progress across 15 tracks, “Pokédex for knowledge”

### Kingdoms

Regional/community grouping system for competitive play and identity.

---

## 8. Technology Stack

### Languages

| Language | Usage |
|----------|-------|
| **TypeScript** | Entire application — types, API routes, components, lib |
| **SQL** | Supabase schema, migrations, leaderboard setup |
| **CSS** | Tailwind CSS v4 utility classes + custom design tokens |
| **JavaScript** | Build scripts, email templates, seed utilities |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.2.9 | App Router, SSR, API routes, static generation |
| **React** | 19.2.4 | UI components |
| **Tailwind CSS** | 4.x | Styling |
| **Framer Motion** | 12.x | Animations, transitions, celebrations |
| **Lucide React** | 1.x | Icon set |
| **@tsparticles** | 4.x | Particle effects (celebrations, atmosphere) |
| **Google Fonts** | — | Nunito (body), Baloo 2 (display headings) |

### Backend & Infrastructure

| Service | Purpose |
|---------|---------|
| **Vercel** | Hosting, serverless deployment, edge |
| **Clerk** | Authentication, user management, webhooks |
| **Supabase** | PostgreSQL — progression, leaderboards, reveal cache, image questions |
| **OpenRouter** | AI quiz generation (LLM API gateway) |
| **Resend** | Branded verification emails (via Clerk webhook) |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Linting (eslint-config-next) |
| **TypeScript** | Static type checking |
| **Node.js scripts** | Flag generation, email sync, Supabase setup, seeding |

---

## 9. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
│  React 19 + Next.js App Router + Tailwind + Framer Motion       │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Next.js Server (Vercel)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ App Routes   │  │ API Routes   │  │ Server Components    │ │
│  │ /quiz, /play │  │ /api/*       │  │ SEO, metadata, SSR   │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└──────┬──────────────┬──────────────┬──────────────┬────────────┘
       │              │              │              │
       ▼              ▼              ▼              ▼
   ┌────────┐   ┌──────────┐   ┌──────────┐   ┌─────────────┐
   │ Clerk  │   │ Supabase │   │OpenRouter│   │ External    │
   │ Auth   │   │ Postgres │   │ AI API   │   │ APIs        │
   └────────┘   └──────────┘   └──────────┘   │ Wikipedia   │
                                               │ TMDB        │
                                               │ TheSportsDB │
                                               └─────────────┘
```

### Key API Routes

| Route | Purpose |
|-------|---------|
| `/api/ai-quiz` | Generate AI quizzes |
| `/api/image-quiz` | Serve picture-game questions |
| `/api/reveal` | Resolve post-answer educational reveals |
| `/api/wiki` | Wikipedia image/fact proxy |
| `/api/progression/*` | XP events, atlas, seasons, hall of fame |
| `/api/progression/leaderboard` | Rankings |
| `/api/activity/feed` | Live activity stream |
| `/api/webhooks/clerk` | Auth email + user sync |
| `/api/admin/image-questions` | CMS for picture questions |

### Data Flow — Playing a Quiz

1. User selects a quiz or picture game
2. Questions load (static data, Supabase, or AI-generated)
3. User answers — client tracks score and timing
4. On answer: reveal engine fetches/caches educational content
5. On quiz complete: progression event sent → XP, discoveries, missions updated
6. State syncs to Supabase (logged-in users) and local storage (guests)

---

## 10. External Services & APIs

| Service | Used For | Required? |
|---------|----------|-----------|
| **Clerk** | Sign-in, sign-up, sessions, webhooks | Yes |
| **Supabase** | Leaderboards, progression, reveal cache, image questions | Optional (enhanced features) |
| **OpenRouter** | AI quiz generation | Optional |
| **TMDB** | Movie stills, posters, hints | Optional (movie game) |
| **TheSportsDB** | Athlete/team reveals | Optional (free key available) |
| **Wikipedia REST API** | Images, facts, flag queries | Built-in (no key) |
| **Resend** | Branded auth emails | Optional (production) |

---

## 11. Project Structure

```
Quizzical/
├── app/                    # Next.js App Router (pages & API)
│   ├── page.tsx            # Homepage
│   ├── [category]/         # Category browse pages
│   ├── quiz/[id]/          # Quiz detail & play
│   ├── play/[mode]/        # Picture guessing games
│   ├── ai/                 # AI quiz generator
│   ├── discover/           # Discover hub
│   ├── knowledge-atlas/    # World Knowledge Atlas
│   ├── knowledge-book/     # Personal discoveries
│   ├── leaderboard/        # Rankings
│   ├── achievements/       # Achievement gallery
│   ├── hall-of-fame/       # Top players
│   ├── profile/            # User profiles
│   ├── onboarding/         # Avatar setup
│   ├── dashboard/          # Admin: image questions CMS
│   └── api/                # Server API routes
├── components/             # React UI components
│   ├── atmosphere/         # Ambient music, celebrations, XP floats
│   ├── progression/        # Atlas, unlocks, missions, hall of fame
│   ├── platform/           # Feed, spotlights, recommendations
│   ├── reveal/             # Reveal cards by entity type
│   └── seo/                # SEO page templates
├── lib/                    # Business logic & data
│   ├── quizzes.ts          # Quiz catalogue (40+ quizzes)
│   ├── imageQuestions.ts   # Picture game modes
│   ├── aiQuiz.ts           # AI generation
│   ├── wikipedia.ts        # Wikipedia client
│   ├── tmdb.ts             # Movie data
│   ├── thesportsdb.ts      # Sports data
│   ├── reveal/             # Reveal engine
│   ├── progression/        # XP, achievements, unlocks, atlas
│   └── seo*.ts             # Metadata & structured data
├── public/                 # Static assets
│   ├── flags/              # 197 country flag PNGs
│   ├── avatars/            # Cartoon avatar SVGs
│   └── sounds/             # Game audio
├── supabase/               # SQL migrations & setup
├── emails/clerk/           # Branded auth email templates
├── scripts/                # Dev & ops utilities
├── package.json
├── next.config.ts
└── .env.example
```

---

## 12. User Journey

```
Landing (/) 
    │
    ├── Browse quizzes by category
    ├── Play picture games
    ├── Generate AI quiz (/ai)
    └── Explore Discover hub
            │
            ▼
    Sign up (Clerk) → Onboarding (pick avatar)
            │
            ▼
    Play quizzes → Earn XP → Level up → Unlock content
            │
            ├── Collect discoveries → Knowledge Book
            ├── Fill Atlas tracks → Legendary unlocks
            ├── Complete daily missions → Coins & XP
            ├── Climb leaderboards → Hall of Fame
            └── View public profile → Share progress
```

**Guest users** can play most content without an account. **Signed-in users** get persistent progression, leaderboard placement, and cross-device sync.

---

## 13. SEO & Discoverability

Quizzical is built for search visibility:

- **Structured data** — JSON-LD for Organization, WebSite, Quiz, BreadcrumbList, AboutPage
- **Canonical URLs** via `NEXT_PUBLIC_SITE_URL`
- **Entity pages** — hundreds of SEO landing pages for countries, landmarks, athletes, etc.
- **Topic pages** at `/topics` and `/topics/[slug]`
- **Sitemap-ready** metadata on all major routes
- **Open Graph** and Twitter card metadata

---

## 14. Environment & Deployment

### Local Development

```bash
npm install
cp .env.example .env.local   # fill in Clerk keys
npm run dev
# → http://localhost:3000
```

### Required Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk server key |

### Optional Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (default: `https://quizzical.site`) |
| `OPENROUTER_API_KEY` | AI quiz generation |
| `OPENROUTER_MODEL` | LLM model override |
| `TMDB_READ_TOKEN` | Movie game & reveals |
| `SPORTSDB_KEY` | Sports reveals (free key `3` works) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase access |
| `RESEND_API_KEY` | Branded auth emails |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Clerk webhook verification |

### Production Deployment (Vercel)

1. Connect the GitHub repository
2. Leave **Root Directory** blank (app lives at repo root)
3. Set environment variables in Vercel Settings
4. Add `quizzical.site` and `*.vercel.app` domains in Clerk dashboard
5. Deploy

---

## 15. Admin & Content Management

### Image Questions Dashboard (`/dashboard`)

Authenticated admins can:

- Create, edit, and delete picture-quiz questions
- Filter by category and difficulty
- Manage image URLs, correct answers, and wrong-answer pools

### Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Flag generation | `node scripts/gen-flags.mjs` | Generate country flag assets |
| Email sync | `npm run sync:clerk-emails` | Sync Clerk email templates |
| Email handoff | `npm run clerk:emails:handoff` | Toggle Resend vs Clerk emails |
| Supabase setup | `scripts/supabase-setup.ps1` | Database initialization |
| Seed bootstrap | `scripts/seed-image-quiz-bootstrap.mjs` | Seed picture questions |

---

## 16. Design & UX

### Visual Identity

- **Playful, bold aesthetic** — thick borders, offset shadows, cartoon-inspired UI
- **Color palette** — cream backgrounds, grass green accents, purple/gold brand tones
- **Typography** — Baloo 2 for headings, Nunito for body text
- **Cartoon avatars** — fox, lion, ninja, ghost, unicorn, astronaut, and more

### Atmosphere System

- Ambient seasonal themes
- Celebration overlays on achievements and level-ups
- Floating XP animations
- Optional ambient music layer
- Particle effects for special moments

### Responsive Design

- Mobile-first layout with category nav on desktop
- Touch-friendly game controls
- Scroll-anchored sections on homepage

---

## 17. Quick Stats

| Metric | Value |
|--------|-------|
| Curated quizzes | 40+ |
| Quiz categories | 8 |
| Picture game modes | 7 |
| Countries (flags quiz) | 197 |
| Atlas knowledge tracks | 15 |
| Achievements | 10 |
| Profile badges | 8 |
| Primary language | TypeScript |
| Framework | Next.js 16 + React 19 |
| Hosting | Vercel |
| Auth | Clerk |
| Database | Supabase (PostgreSQL) |
| AI provider | OpenRouter |
| Cost to play | Free |

---

## Presentation Talking Points

Use these when demoing or pitching Quizzical:

1. **“It’s not just a quiz site — it’s a learning platform.”** Every answer teaches something through reveal cards backed by real data sources.

2. **“AI meets curated content.”** Users get 40+ hand-crafted quizzes plus unlimited AI-generated quizzes on any topic.

3. **“Gamification that rewards curiosity.”** XP, levels, discoveries, and a Knowledge Atlas turn casual play into long-term engagement.

4. **“Built for the modern web.”** Next.js 16, React 19, TypeScript, serverless on Vercel — fast, SEO-friendly, and scalable.

5. **“Free and ad-free.”** No paywalls or intrusive ads during gameplay.

6. **“South African innovation.”** Built by BDL Corp and Zama Shange — a young founder combining creativity, technology, and education.

---

*Documentation generated for Quizzical — BDL Corp. For setup instructions, see [README.md](./README.md).*
