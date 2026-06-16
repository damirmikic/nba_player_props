# WNBA Player Props Trading Platform - Frontend

React 18 + TypeScript + Vite web app for comparing player prop odds across sportsbooks.

## Project Structure

```
src/
├── components/          # Reusable React components
├── pages/              # Page-level components
├── services/           # API clients and external services
├── store/              # Zustand state management (Zod + Zustand)
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── App.tsx             # Root component
├── main.tsx            # Vite entry point
└── index.css           # Tailwind styles
```

## Setup

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:3000`

## Technology Stack

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool & dev server
- **Zustand**: State management
- **TanStack Query**: Server state + caching
- **Tailwind CSS**: Styling
- **Axios**: HTTP client

## Features (MVP)

- [x] Type definitions from Unabated API
- [x] State management (Zustand stores)
- [x] Basic UI scaffold
- [ ] Odds comparison table (betTypeId decoder, sportsbook columns, best odds highlighting)
- [ ] Filter sidebar (markets, sportsbooks, teams, search)
- [ ] Ticket builder (add/remove selections, export CSV)
- [ ] Game/market picker
- [ ] Real-time odds updates (polling)

## Next Steps

1. Build `OddsTable` component with `NormalizedProp` data structure
2. Implement odds fetcher & normalizer service
3. Create filter sidebar
4. Build ticket builder UI
5. Add responsive layout + mobile support
