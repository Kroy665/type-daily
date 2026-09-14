<p align="center">
  <img src="https://img.shields.io/badge/next.js-15-000000?logo=next.js&logoColor=white" alt="Next.js 15">
  <img src="https://img.shields.io/badge/typescript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/prisma-5-2D3748?logo=prisma&logoColor=white" alt="Prisma 5">
  <img src="https://img.shields.io/badge/postgresql-database-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/live-type--daily.kroy.dev-4c9a2a" alt="Live">
</p>

<p align="center">
  A typing speed test with real accounts, a real database, and a global
  leaderboard — not a single-page toy that forgets your score on refresh.
</p>

<p align="center"><strong><a href="https://type-daily.kroy.dev/">type-daily.kroy.dev</a></strong></p>

## Why this exists

Most typing-test demos are a static page: type some text, see a WPM number,
close the tab, forget it happened. Type Daily is built around the parts that
disappear the moment you add persistence — an actual account (Google OAuth,
not a fake local one), results that live in Postgres, a leaderboard other
people's scores actually appear on, and streaks/achievements that have to
survive across days, not just across a session.

A few decisions here came from things that broke in earlier iterations, not
from a spec:

- **Achievement unlocking races on itself.** Two results submitted close
  together for the same user can both decide "this unlocks Speed Demon."
  Rather than lock around it, `updateUserStats` relies on the
  `@@unique([userId, achievementId])` constraint in the schema and just lets
  the duplicate insert fail — caught and ignored. Simpler than a
  transaction, and correct for the same reason a unique index usually is.
- **Streak math is calendar-day math, not "24 hours since last test."**
  `updateUserStats` buckets `lastTestDate` down to a local calendar day and
  diffs day-numbers, so two tests an hour apart just before and after
  midnight count as two different days. The tradeoff (documented, not
  hidden): this runs on server time, so a user in a different timezone can
  see their streak flip at a time that doesn't match their own midnight.
- **Daily Challenges existed and were removed.** An earlier version shipped
  a full daily-challenge system (`DailyChallenge` / `DailyChallengeResult`
  models, a `/challenge` page, its own leaderboard). It was cut in a later
  commit — the schema below is what's actually live today, not what an old
  features doc still describes.
- **There's a `.old` component sitting next to its replacement.**
  `TypingSpeed.old.tsx` (296 lines) is kept alongside `TypingSpeed.tsx` (372
  lines) rather than deleted — a checkpoint from mid-rewrite, left in place
  instead of trusting git history alone for a component this central.

### What's *not* production-grade here

- The GitHub Actions workflow in `.github/workflows/` is the stock,
  unmodified "deploy to GitHub Pages" template scaffolded by
  `create-next-app`. It builds a **static export**, which cannot work for
  this app — there's a database, server-side auth, and API routes involved.
  It has never run for real; the live site is deployed separately (Vercel).
  Kept as-is here rather than deleted quietly, so the gap is visible instead
  of papered over.
- Admin access (`requireAdmin` in `src/lib/middleware/adminOnly.ts`) checks
  a comma-separated `ADMIN_EMAILS` env var, not the `Role` enum already
  defined on the `User` model. The DB has the right shape for role-based
  admin; the code hasn't caught up to it yet.
- Streak/timezone edge cases and first-load leaderboard performance at scale
  are known, undocumented-elsewhere gaps — noted honestly rather than
  glossed over.

## What it does

### Typing test
- Configurable difficulty (`EASY` / `MEDIUM` / `HARD`) and duration, texts
  pulled at random from a `Text` pool seeded per difficulty/time bucket
  (`GET /api/text/get-random`)
- Live WPM and accuracy computed client-side as you type
  (`TypingSpeed.tsx`), with a word-level diff view showing exactly which
  words were wrong (`TypingDiff.tsx`)
- Results are Zod-validated server-side before they touch the database
  (`createResultSchema` — WPM capped at 500 with a comment noting the actual
  world record is ~200, so a client bug can't quietly write nonsense scores)

### Accounts and stats
- Google OAuth via NextAuth (JWT sessions, Prisma adapter) — no
  password/local-account path at all
- Every submitted result updates `bestWpm`, `bestAccuracy`, `totalTests`,
  and a streak pair (`currentStreak` / `longestStreak`) in one pass
  (`updateUserStats`)
- 10 achievements (`AchievementType` enum: speed thresholds, accuracy
  thresholds, streak milestones, total-test milestones, first test) checked
  and unlocked automatically after each result, deduplicated by the DB
  constraint rather than an in-app check

### Leaderboard
- Global ranking by best WPM, best accuracy, current streak, or total tests
  (`GET /api/leaderboard/global`), plus a dedicated endpoint for "where do I
  rank" without pulling the full top-100 (`GET /api/leaderboard/user-rank`)

### Admin
- `/text` — create and delete practice texts by difficulty and duration,
  gated behind `requireAdmin` (email-allowlist based, see limitation above)

## Architecture

```
src/
  pages/
    index.tsx                    landing / typing test entry point
    text/index.tsx                admin: create/delete practice texts
    leaderboard/index.tsx         global rankings
    profile/index.tsx             personal stats + achievements
    auth/login.tsx, logout.tsx    NextAuth-backed auth pages
    api/
      results/create.tsx          validate + persist a result, trigger stat/achievement update
      results/get-all.tsx         fetch results
      leaderboard/global.ts       ranked leaderboard query
      leaderboard/user-rank.ts    single-user rank lookup
      text/{create,delete,get-all,get-random}.ts   admin text management
      achievements/user.ts        a user's unlocked achievements
      auth/[...nextauth].ts       NextAuth route handler
  components/
    TypingTest.tsx                 test container/orchestration
    TypingSpeed.tsx                current WPM/accuracy engine (+ TypingSpeed.old.tsx, kept from the prior rewrite)
    TypingDiff.tsx                 word-level right/wrong diff rendering
    Header.tsx, HeroSection.tsx, Layout.tsx   shell/layout
  lib/
    authOptions.ts                 NextAuth config (Google provider, JWT sessions, Prisma adapter)
    db.ts                          Prisma client
    middleware/adminOnly.ts        session + email-allowlist admin gate
    utils/updateUserStats.ts       stats + streak + achievement-unlock logic
    validations.ts                 Zod schemas for every mutating API route
  context/ThemeContext.tsx          dark/light theme
  store/index.ts                    Zustand client state
prisma/
  schema.prisma                    User/Result/Text/Achievement/UserAchievement models
  seed.ts                          seeds the 10 achievement rows
scripts/add-sample-texts.ts        bulk-loads practice texts
```

## Stack

Next.js 15 (Pages Router), TypeScript, Prisma 5 + PostgreSQL, NextAuth 4
(Google OAuth, JWT strategy), Zod for input validation, Zustand for client
state, Tailwind CSS, Chart.js for stats visualization.

## Setup

```bash
npm install

# copy and fill in .env.example — Postgres connection string, NEXTAUTH_SECRET
# (openssl rand -base64 32), Google OAuth client ID/secret, ADMIN_EMAILS
cp .env.example .env

npx prisma generate
npx prisma migrate deploy   # or `migrate dev` for a fresh local DB

npm run seed          # seeds the 10 achievements
npm run add-texts     # optional: bulk-load sample practice texts

npm run dev
```

`npm run build` runs `next build && prisma generate` — the Prisma client
regenerates as part of every production build, not just local setup.

## History

16 commits, including a real security pass ("Security: Update dependencies
and fix vulnerabilities") and a feature actually being cut in production
("Remove Daily Challenge feature") rather than just left half-built.
