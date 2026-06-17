# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A multi-league player prop odds comparison platform for sports bettors. It aggregates live odds from 23+ US sportsbooks (via Unabated) and European books (via Superbet) into a single comparison table with a parlay ticket builder.

## Development Commands

All dev commands run from the `frontend/` directory:

```bash
cd frontend
npm install          # install deps
npm run dev          # dev server at http://localhost:3000 (strict port)
npm run build        # production build → dist/
npm run preview      # preview production build locally
npm run type-check   # TypeScript strict check (no emit)
npm run lint         # ESLint validation
```

No test suite yet (planned for Phase 2). There is no Makefile.

## Architecture

**Stack:** React 18 + TypeScript + Vite + Zustand + Tailwind CSS  
**Backend:** Netlify serverless functions (thin API proxies in `netlify/functions/`)  
**Deployment:** Netlify (frontend `dist/`) + Netlify Functions

### Data Flow

```
LeaguePicker → leagueStore (selected league)
    ↓
App.tsx effect → oddsFetcher.ts or superbetFetcher.ts
    ↓
Netlify Functions (API proxies for The Odds API / Superbet)
    ↓
Normalization → NormalizedProp[] (merged by {eventId, betTypeId, personId})
    ↓
oddsStore (cached per league, Map<League, NormalizedProp[]>)
    ↓
OddsTable ← filterStore (market/book/player/search filters)
    ↓
ticketStore (parlay selections → CSV export)
```

### State Stores (Zustand, in `frontend/src/store/`)

| Store | Responsibility |
|---|---|
| `oddsStore` | Raw prop data + per-league cache + loading/error state |
| `filterStore` | Active market types, visible sportsbooks, player/team filters, sort order |
| `leagueStore` | Selected league + available leagues (seasonally gated) |
| `ticketStore` | Parlay builder: add/remove selections, export CSV |
| `uiStore` | Sidebar toggle, active tab |

### Data Sources

- **Unabated** (`oddsFetcher.ts`): NBA (id=1), WNBA (id=7), NCAA (id=109)  
  CDN endpoint: `https://content.unabated.com/markets/v2/league/{id}/propodds.json`

- **Superbet** (`superbetFetcher.ts`): Euroliga, ABA, EuroCup, ACB, and 7 other EU leagues (ids 100–111)  
  Base: `https://production-superbet-offer-rs.freetly.fastly.net/sb-rs/api`  
  Requires two-step fetch: league discovery → event odds

League availability is seasonally gated in `leagueStore` (NBA hidden June–August).

### Key Types (`frontend/src/types/index.ts`)

- `League` enum: 14 leagues with numeric IDs
- `MarketType` enum: 19 prop types (Points, Rebounds, Assists, etc.)
- `NormalizedProp`: the unified data shape after normalization (player + market + per-book over/under odds)
- `LEAGUE_DATA_SOURCES`: maps each League to `'Unabated' | 'Superbet'`
- `SPORTSBOOKS`: map of 23 books with display metadata

### Path Aliases (Vite + TypeScript)

```
@/*            → src/*
@components/*  → src/components/*
@services/*    → src/services/*
@store/*       → src/store/*
@types         → src/types/index.ts
```

### Environment Variables

Secrets are managed via Netlify dashboard, not `.env` files:
- `API_KEYS` – comma-separated The Odds API keys (used in `netlify/functions/get-odds.js`)

### Netlify Functions

Located in `netlify/functions/`. Each is a thin Node.js proxy:
- `get-odds.js` – The Odds API wrapper
- `superbet-basketball-events.js` – Superbet event fetcher
- `superbet-basketball-leagues.js` – Superbet league discovery
