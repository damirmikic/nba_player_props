import { SPORTSBOOKS, MARKET_LABELS, MarketType } from '@/types/index'

interface FilterSidebarProps {
  selectedMarkets: number[]
  selectedSportsbooks: number[]
  sortBy: 'bestOdds' | 'lineMovement' | 'alphabetical'
  searchQuery: string
  onMarketToggle: (market: number) => void
  onSportsbookToggle: (book: number) => void
  onSortChange: (sort: 'bestOdds' | 'lineMovement' | 'alphabetical') => void
  onSearchChange: (query: string) => void
  onReset: () => void
}

const BOOKS = [
  { id: SPORTSBOOKS.DRAFTKINGS, name: 'DraftKings' },
  { id: SPORTSBOOKS.FANDUEL, name: 'FanDuel' },
  { id: SPORTSBOOKS.BETMGM, name: 'BetMGM' },
  { id: SPORTSBOOKS.CAESARS, name: 'Caesars' },
  { id: SPORTSBOOKS.BETRIVERS, name: 'BetRivers' },
  { id: SPORTSBOOKS.CIRCA, name: 'Circa' },
  { id: SPORTSBOOKS.BOOKMAKER, name: 'Bookmaker' },
  { id: SPORTSBOOKS.BOVADA, name: 'Bovada' },
  { id: SPORTSBOOKS.HARD_ROCK, name: 'Hard Rock' },
  { id: SPORTSBOOKS.SUGARHOUSE, name: 'SugarHouse' },
  { id: SPORTSBOOKS.PARX, name: 'Parx' },
  { id: SPORTSBOOKS.THESCORE_US, name: 'ESPN Bet' },
  { id: SPORTSBOOKS.THESCORE_CA, name: 'TheScore CA' },
  { id: SPORTSBOOKS.PROPHET_EXCHANGE, name: 'Prophet Exchange' },
  { id: SPORTSBOOKS.PRIZEPICKS, name: 'PrizePicks' },
  { id: SPORTSBOOKS.UNDERDOG_FANTASY, name: 'Underdog Fantasy' },
  { id: SPORTSBOOKS.BETFAIR, name: 'Betfair' },
  { id: SPORTSBOOKS.SLEEPER, name: 'Sleeper' },
  { id: SPORTSBOOKS.FANATICS, name: 'Fanatics' },
  { id: SPORTSBOOKS.NOVIG, name: 'NoVig' },
  { id: SPORTSBOOKS.POLYMARKET, name: 'Polymarket' },
]

const MARKETS = [
  MarketType.POINTS,
  MarketType.REBOUNDS,
  MarketType.ASSISTS,
  MarketType.STEALS,
  MarketType.POINTS_REBOUNDS,
  MarketType.POINTS_ASSISTS,
  MarketType.REBOUNDS_ASSISTS,
  MarketType.POINTS_REBOUNDS_ASSISTS,
  MarketType.FIRST_SCORER,
  MarketType.ANYTIME_SCORER,
  MarketType.DFS_FANTASY_POINTS,
]

export function FilterSidebar({
  selectedMarkets,
  selectedSportsbooks,
  sortBy,
  searchQuery,
  onMarketToggle,
  onSportsbookToggle,
  onSortChange,
  onSearchChange,
  onReset,
}: FilterSidebarProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-6 h-screen overflow-y-auto sticky top-0">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Search
        </label>
        <input
          type="text"
          placeholder="Player name, team..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Markets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-900">
            Markets
          </label>
          {selectedMarkets.length > 0 && (
            <span className="text-xs text-gray-500">
              {selectedMarkets.length} selected
            </span>
          )}
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {MARKETS.map((market) => (
            <label
              key={market}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedMarkets.includes(market)}
                onChange={() => onMarketToggle(market)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">
                {MARKET_LABELS[market]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sportsbooks */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-900">
            Sportsbooks
          </label>
          {selectedSportsbooks.length > 0 && (
            <span className="text-xs text-gray-500">
              {selectedSportsbooks.length} selected
            </span>
          )}
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {BOOKS.map((book) => (
            <label
              key={book.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedSportsbooks.includes(book.id)}
                onChange={() => onSportsbookToggle(book.id)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{book.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) =>
            onSortChange(
              e.target.value as 'bestOdds' | 'lineMovement' | 'alphabetical'
            )
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="bestOdds">Best Odds</option>
          <option value="lineMovement">Line Movement</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>

      {/* Reset */}
      <div>
        <button
          onClick={onReset}
          className="w-full px-4 py-2 bg-gray-200 text-gray-900 font-medium rounded-md hover:bg-gray-300 transition-colors text-sm"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}
