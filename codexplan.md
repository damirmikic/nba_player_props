# Codex Plan

## Product Direction

The current project is a good MVP scaffold for comparing player prop odds, but the future product described in `Player props app.docx` is larger than a comparison table. The target should be an operator console for managing player prop feeds, reacting to news, locking markets, applying manual overrides, monitoring other books, and eventually producing proprietary Euroleague-style lines.

The main architectural move is to separate the app into clear domain layers:

1. Source adapters pull odds, events, and metadata from books or data feeds.
2. Normalizers convert every source into one trusted internal shape.
3. Feed rules decide which source controls each league, game, player, and market.
4. Operator controls allow locking, manual override, source switching, and alerts.
5. UI renders the current market state and lets operators act quickly.

## Rewrite First

### 1. Data Source Layer

Rewrite the current source fetching into explicit adapters:

- `UnabatedAdapter`
- `SuperbetAdapter`
- later `Bet365Adapter`, `StoixmanAdapter`, `PinnacleAdapter`, etc.

Each adapter should expose the same interface:

- fetch leagues
- fetch events
- fetch props
- normalize odds
- report source health
- expose last successful update time

This avoids the current duplication between `frontend/src/services/superbetFetcher.ts` and `netlify/functions/superbet-*.js`.

### 2. League And Feed Configuration

Move league/source behavior out of hard-coded frontend constants. The app needs configurable rules such as:

- NBA uses Unabated or selected US books.
- WNBA uses Unabated.
- Euroleague can use Bet365, Stoixman, Superbet, manual premium feed, or a mixed feed.
- ABA can use Superbet.
- National leagues can prefer local books.
- Individual players can override the game-level source.

This should become a config/domain model, not UI state.

### 3. Odds Normalization

Rewrite the Unabated parser so it does not hard-code `lg7:pt1:pregame`. It should discover odds buckets by league, period, and state.

The normalized shape should support:

- source book
- event
- player
- team
- market
- side
- line
- price
- availability
- updated time
- source confidence
- source status

### 4. Superbet Integration

Split `superbetFetcher.ts` into smaller modules:

- API client
- SSE parser
- league/event discovery
- props parser
- market id mapping
- normalization
- mocks/fixtures

The current file mixes too many responsibilities and will become fragile as more books are added.

### 5. Operator Market State

Add a true domain model for the thing operators are controlling:

- `MarketState`
- `LineSource`
- `FeedRule`
- `LockRule`
- `ManualOverride`
- `NewsAlert`
- `SettlementStatus`

The current app only knows "props in a table"; the future app must know whether a prop is live, locked, manually changed, copied from a source, suspended due to news, or awaiting operator review.

## Fix Before More Features

### Ticket Selection

`App.tsx` currently logs selected odds instead of using the ticket store. Wire `onSelectOdds` into `ticketStore.addSelection`, show selected cells, and add the missing ticket builder UI.

### Sorting

The filter store exposes `sortBy`, but `OddsTable` does not apply sorting. Implement sorting by:

- best odds
- alphabetical
- line movement, once history exists

### Current League Cache

`oddsStore` has `currentLeague`, but the app mostly reads from `leagueStore`. Align these stores or remove duplicate league state.

### Legacy Root App

The root `index.html` is a legacy single-file app. Decide whether to archive it or delete it after confirming no unique behavior still matters. The React app should become the only active frontend.

### Tests

Add tests around the highest-risk logic first:

- Unabated normalization
- Superbet SSE parsing
- Superbet market mapping
- over/under side detection
- best-price selection
- feed mix/average line calculation

## Suggested Build Order

### Phase 1: Stabilize Current MVP

- Wire ticket builder selection.
- Implement sorting.
- Fix Unabated league bucket parsing.
- Split obvious Superbet parsing helpers.
- Add normalization tests.
- Make React frontend the only supported UI.

### Phase 2: Feed Control Foundation

- Add source adapter interface.
- Move fetching and normalization behind backend functions.
- Add league/feed configuration.
- Add manual feed entry.
- Add mixed feed calculation, for example average of selected books rounded to `x.5`.
- Add source status and last-update indicators.

### Phase 3: Operator Controls

- Add lock/unlock per market, game, player, and source.
- Add manual override per line and price.
- Add reason codes for changes.
- Add audit log of operator actions.
- Add alert panel for removed/suspended markets.

### Phase 4: News And Injury Reaction

- Start with manual/curated news sources.
- Add Twitter/X or feed ingestion later.
- Match news text to player names and teams.
- Alert operator when a configured source posts about a relevant player.
- Support automatic lock or manual approval mode.

### Phase 5: Monitoring And Settlement

- Build an Asian-monitor-style view comparing our offer against other books.
- Add automatic result settlement.
- Add exposure/played-amount integration if connected to a sportsbook system.
- Add rules for moving price or line based on action.

### Phase 6: Proprietary Pricing

- Start with Euroleague and other leagues where the market is softer.
- Add model inputs:
  - team total
  - player usage
  - minutes projection
  - true shooting
  - opponent defensive rating
  - direct matchup factor
  - pace
  - motivation/context
  - injury redistribution
- Keep the first model transparent and operator-adjustable before attempting automation.

## Current Codebase Assessment

Keep:

- React + Vite + TypeScript scaffold.
- Zustand stores as a lightweight MVP state layer.
- Tailwind-based operational UI direction.
- Netlify Functions as thin API boundaries for now.

Rewrite:

- Source fetching and parsing architecture.
- Superbet service structure.
- League/source configuration.
- Normalized market model.
- Operator workflow state.

Patch:

- Ticket builder wiring.
- Sorting.
- Unabated hard-coded bucket.
- duplicate league state.
- root legacy `index.html` ownership.

## Guiding Principle

Do not grow this as a simple odds table. Grow it as a control system for player prop markets.

The table is only one view. The core value is speed, source quality, locking behavior, operator control, and eventually better Euroleague/national-league pricing than the public market.
