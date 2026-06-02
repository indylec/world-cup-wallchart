@AGENTS.md

# World Cup 26 Wallchart

A local-first, vintage-poster-styled wallchart for the 2026 FIFA World Cup. Pulls live fixtures and scores from football-data.org and lets the user enter their own predictions, which override live data so the bracket can be played forward.

## Stack

- **Next.js 16** (App Router, React 19, Turbopack) — **NOT** the Next.js you may know from training data. APIs and conventions differ; always check `node_modules/next/dist/docs/` before touching framework code (see `AGENTS.md`).
- **TypeScript** (strict) + **Tailwind CSS v4** (CSS-first config in `app/globals.css`).
- **SWR** for client-side data fetching with revalidation.
- **Zustand** + `persist` middleware for user-entered predictions (saved to `localStorage`).
- **flag-icons** for 250+ country flag SVGs.
- **Google Fonts**: Bebas Neue (display), Archivo Black (heading), Playfair Display (serif flourish), Inter (body).

## Folder layout

```
app/
  api/matches/route.ts   ← Server-side proxy to football-data.org (keeps API key off client)
  layout.tsx             ← Root layout: fonts + TopBar + globals
  page.tsx               ← Wallchart (poster header + groups + bracket)
  calendar/page.tsx      ← Day-by-day tournament calendar
  globals.css            ← Tailwind v4 + vintage tokens + print styles
components/
  TopBar.tsx             ← Sticky nav: wordmark + tabs + TimezoneSelector
  TimezoneSelector.tsx   ← <select> bound to useTimezone store
  GroupsBoard.tsx        ← 12 group cards with live standings + fixtures
  BracketSection.tsx     ← Knockout tree (R32 → Final + 3rd place)
  MatchRow.tsx           ← GroupMatchRow (compact) + CalendarMatchRow (full)
  ScoreInput.tsx         ← Two number boxes, persists to Zustand
  DataSourceBadge.tsx    ← Shows live/placeholder/offline
lib/
  types.ts               ← Team, Match, Score, GroupStanding, Fixtures
  fixtures.ts            ← useFixtures() — SWR hook against /api/matches
  standings.ts           ← computeGroupStandings (pure)
  bracket.ts             ← resolveBracket, rankThirdPlaceTeams, pairLabel
  results.ts             ← getScore (manual override > API), knockoutWinner
  store.ts               ← usePredictions (manual scores, persisted)
  timezone.ts            ← useTimezone (persisted) + TIMEZONE_OPTIONS + resolveTimezone
  time.ts                ← formatKickoff, dateKey, tournamentDays, formatDayHeading
  flags.ts               ← flagEmoji(iso2) → Unicode flag (handles gb-eng / gb-sct)
data/
  fixtures.placeholder.json  ← Empty-shape fallback for no-API-key
  venues.json                ← Match-ID → "Stadium · City" (sparse; needs manual curation)
  bracket-2026.json          ← R32 → Final slot pairings (VERIFY against FIFA's official bracket)
public/
  hero/                  ← User-supplied generated images
  textures/              ← Smaller texture overlays
```

## Environment

`.env.local` is gitignored. Copy `.env.local.example` and fill:

```
FOOTBALL_DATA_API_KEY=...
```

Free signup: <https://www.football-data.org/client/register>. Free tier allows 10 req/min and includes the World Cup (competition code `WC`).

Without the key, `/api/matches` returns the empty placeholder fixture and the page renders skeleton group cards — a useful state for design iteration.

## Run

```
npm run dev      # Turbopack dev server on http://localhost:3000
npm run build    # production build
npm run lint
```

## Data flow

```
football-data.org ──► /api/matches (server, key-protected, 60s revalidate)
                              │
                              ▼
                        useFixtures() (SWR, 60s refresh)
                              │
                              ▼
                  Page components (groups, bracket)
                              │
                  ▲ overrides ▼
                    Zustand store (manual results, localStorage)
```

Merge rule: a manual result in the Zustand store always wins over the live score for the same `matchId`. This is what enables prediction mode and what survives a refresh.

## Design system (vintage poster)

Colors live in `@theme inline` in `globals.css` and are usable in Tailwind as `var(--color-paper)`, `var(--color-navy)`, `var(--color-red)`, `var(--color-mustard)`, `var(--color-jade)`, etc. Reach for these instead of arbitrary hex values.

Three utility classes in `@layer components`:
- `.poster-title` — Bebas Neue, tight leading, for the big display type
- `.heading-block` — Archivo Black, uppercased, wide tracking
- `.serif-flourish` — Playfair italic, for vintage flavor

Aim: the page should look like a printed wallchart — bold display type, halftone textures, double rules, hard-edged blocks, drop shadows that look like ink registration.

## Phase plan

- [x] **Phase 1** — Scaffold, types, store, design tokens, route handler skeleton, placeholder page
- [x] **Phase 2** — Live football-data.org wiring; real teams in group cards with flag emojis
- [x] **Phase 2b** — Top nav with tabs + timezone selector; group fixtures under each card; `/calendar` route
- [x] **Phase 3** — Score input on every match; live group standings (sort + W-D-L-Pts + qualification stripe)
- [x] **Phase 4** — Bracket derivation: best-3rd ranking, R32→Final slot resolution, knockout viz, calendar TBDs replaced by slot labels then real teams
- [ ] **Phase 5** — Polish: hero textures, mascot flourishes, print stylesheet pass, mobile tune, Vercel deploy + README

## Bracket data — VERIFY before relying on it

`data/bracket-2026.json` defines R32→Final pairings as `1A` / `2B` / `3-1` slot strings. The defaults I shipped are a sensible balanced bracket but are **NOT** confirmed against FIFA's published 2026 bracket. Before treating the prediction outputs as authoritative, cross-reference fifa.com/worldcup/2026 and edit the JSON to match. Slot syntax:

- `1A`, `2A` — winner / runner-up of Group A
- `3-1` through `3-8` — best 3rd-place team ranked Nth across all 12 groups (1 = best)
- `W-r32-1` — winner of the R32 match with `id: "r32-1"`
- `L-sf-1` — loser of SF match 1 (used for the third-place playoff)

The resolver in `lib/bracket.ts` recursively follows these slots so editing one pairing cascades correctly.

## Conventions

- No comments explaining *what* code does — let names carry that. Use comments only for non-obvious *why*.
- Pure functions for derivations (standings, bracket progression) — easy to reason about and easy to test later.
- Keep server/client boundaries explicit: `"use client"` only where it's needed (anything touching `useState`, `useEffect`, `localStorage`, SWR hooks).
- Server-side fetches should always include `next: { revalidate, tags }` so caching is intentional; the football-data free tier is rate-limited.
- Tailwind: prefer the design tokens over arbitrary values. If you reach for `#xxxxxx` consider adding a token instead.

## Known gotchas

- Next 16: `params` in route handlers is now a `Promise`, must be awaited.
- Next 16: default GET caching is dynamic, not static. Use `export const revalidate = N` or `fetch(..., { next: { revalidate: N } })` to opt back in.
- football-data.org returns `tla` as a 3-letter team code; flag-icons expects 2-letter ISO codes. The route handler does a naive `tla.slice(0,2).toLowerCase()` mapping — this is wrong for many countries (GER→ge is German not Germany's flag). Fix when wiring real data: add an explicit TLA→ISO2 map.
