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

- **The server scores every test; the client never submits a score.** Early
  versions had the browser POST `{ wpm, accuracy }` and the server trusted
  it, so anyone could put `wpm: 500` on the leaderboard. Now
  `POST /api/tests/start` issues a single-use `TestSession`, the first
  keystroke stamps `startedAt` on the server, and
  `POST /api/tests/:id/complete` receives only the typed text. The server
  scores it against the stored passage using its own clock, rejects
  completions that arrive after the time limit or exceed
  `MAX_PLAUSIBLE_WPM`, and refuses to complete a session twice. A bot that
  types at a believable speed in real time is still possible — that needs
  keystroke analysis — but submitting a made-up number is not.
- **One scoring function, shared by client and server.** `src/lib/scoring.ts`
  computes the live stats while you type *and* the authoritative result, so
  the number on screen is the number that's saved. Scoring is word-aligned:
  one slipped character marks one word wrong, not every character after it.
  WPM is the standard correct-characters ÷ 5 per minute.
- **Stats updates are transactional.** Recording a result, updating
  `bestWpm`/streaks/`totalTests` and unlocking achievements happen in one
  transaction with the user row locked (`SELECT … FOR UPDATE`), so two
  completions landing together can't lose an increment.
- **Streaks count the user's calendar days, not the server's.** The client
  sends its IANA timezone with each completion; `src/lib/streak.ts` buckets
  dates in that zone, so a test at 11:30pm and another at 8am count as
  consecutive days wherever you live.
- **Achievements unlock every tier you reach.** Hitting 100 WPM on your first
  run unlocks the 50 and 75 WPM badges too (an earlier `else if` chain
  skipped them forever).
- **Daily Challenges existed and were removed.** An earlier version shipped
  a full daily-challenge system. It was cut in a later commit; some of the
  older docs in the repo root (`NEW_FEATURES.md`, `MIGRATION_GUIDE.md`, …)
  still describe it.

### Known limitations

- There's no rate limiting on the API. On Vercel, add a WAF rate-limit rule
  for `/api/tests/*` rather than an in-memory limiter (instances don't share
  memory).
- No Content-Security-Policy header yet — the other security headers are set
  in `next.config.mjs`.
- The schema is managed with `prisma db push`; there's no migration history
  in the repo.
- Profile "time typed" sums each test's selected duration, so a test you
  finish early still counts its full duration.

## What it does

### Typing test
- Difficulty (`EASY` / `MEDIUM` / `HARD`) and duration (1, 5 or 15 min), with
  texts drawn at random from a `Text` pool per difficulty/duration
- **Inline view**: Monkeytype-style passage with per-character coloring,
  extra characters shown in place, a smooth caret, and three-line scrolling
- **Classic view**: source text beside a text box, with word-level feedback
- Timer starts on the first keystroke; the test ends when time runs out or
  the passage is typed. Paste and drop are blocked.
- `Tab` loads a new text and `Esc` restarts the same one (only while the
  typing box has focus, so the rest of the page stays keyboard-navigable)
- Works signed out; signing in saves results

### Accounts and stats
- Google OAuth via NextAuth (JWT sessions, Prisma adapter)
- Profile with best/average speed and accuracy, streaks, a WPM/accuracy chart
  of the last 30 tests, achievements, and recent tests
- 10 achievements, unlocked automatically and shown on the results screen

### Leaderboard
- Public ranking by best WPM, best accuracy, current streak, or total tests,
  with stable tie-breaking (earliest account first)
- Signed-in users see their own rank for the selected metric

### Admin
- `/text` — add and delete texts, with a coverage grid that flags any
  difficulty/duration combination with no texts. Admins are users with
  `role = ADMIN` or an email in `ADMIN_EMAILS` (comma-separated,
  case-insensitive). The API re-checks against the database on every
  request.

## Architecture

```
src/
  pages/
    index.tsx                       typing test
    leaderboard/index.tsx           public rankings
    profile/index.tsx               personal stats, chart, achievements
    text/index.tsx                  admin: manage texts
    auth/{login,error,logout}.tsx   sign-in pages
    404.tsx
    api/
      tests/start.ts                draw a text; create a TestSession for signed-in users
      tests/[id]/begin.ts           stamp the server-side start time
      tests/[id]/complete.ts        score on the server, record result + stats + achievements
      results/get-all.ts            the user's results
      leaderboard/{global,user-rank}.ts
      text/{create,delete,get-all}.ts   admin text management
      achievements/user.ts
      auth/[...nextauth].ts
  components/
    typing/
      useTypingTest.ts              test state machine (load → ready → running → finished)
      TypingTest.tsx                config bar, live stats, shortcuts
      WordsView.tsx, ClassicView.tsx, ResultsPanel.tsx
    Header.tsx, Layout.tsx, Logo.tsx, Avatar.tsx, icons.tsx, ErrorBoundary.tsx
  lib/
    scoring.ts                      shared scoring (client + server)
    streak.ts                       timezone-aware streak math
    constants.ts                    difficulties, durations, limits
    validations.ts                  Zod schemas for API input
    client.ts                       typed fetch client for the API
    server/
      api.ts                        route wrapper: method check, Zod → 400, errors → 500
      auth.ts                       session helpers, admin guard
      results.ts                    transactional result recording + achievements
      leaderboard.ts                shared select/ordering
    authOptions.ts, admin.ts, db.ts
  styles/globals.css                color tokens (light + dark) and component classes
prisma/
  schema.prisma
  seed.ts                           seeds the 10 achievements
scripts/add-sample-texts.ts         bulk-loads practice texts
```

## Stack

Next.js 15 (Pages Router), TypeScript, Prisma 5 + PostgreSQL, NextAuth 4
(Google OAuth, JWT strategy), Zod, Tailwind CSS with CSS-variable color
tokens, Chart.js, Vitest, ESLint.

## Setup

```bash
npm install          # also runs `prisma generate`

# copy and fill in .env.example — Postgres connection string, NEXTAUTH_SECRET
# (openssl rand -base64 32), Google OAuth client ID/secret, ADMIN_EMAILS
cp .env.example .env

npm run db:push      # create/update tables from prisma/schema.prisma
npm run seed         # seeds the 10 achievements
npm run add-texts    # optional: bulk-load sample practice texts

npm run dev
```

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | `prisma generate && next build` |
| `npm run lint` | ESLint (`next/core-web-vitals`, `next/typescript`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit tests for scoring, streaks and achievements |
| `npm run db:push` | Sync the database schema |

CI (`.github/workflows/ci.yml`) runs lint, type-check, tests and a production
build on every push and pull request. Deployment is handled by Vercel.
