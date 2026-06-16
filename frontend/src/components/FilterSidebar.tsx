import { useRef, useEffect, useState } from 'react'
import { SPORTSBOOKS, MARKET_LABELS, MarketType } from '@/types/index'

interface PlayerOption {
  id: number
  name: string
}

interface FilterSidebarProps {
  players: PlayerOption[]
  selectedMarkets: number[]
  selectedSportsbooks: number[]
  selectedPlayers: number[]
  sortBy: 'bestOdds' | 'lineMovement' | 'alphabetical'
  searchQuery: string
  onMarketToggle: (market: number) => void
  onSportsbookToggle: (book: number) => void
  onPlayerToggle: (personId: number) => void
  onSelectAllMarkets: (markets: number[]) => void
  onSelectAllSportsbooks: (books: number[]) => void
  onSelectAllPlayers: (players: number[]) => void
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

/** Checkbox that shows indeterminate state when partially selected */
function SelectAllCheckbox({
  total,
  selectedCount,
  onChange,
}: {
  total: number
  selectedCount: number
  onChange: (selectAll: boolean) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const allSelected = selectedCount === total
  const noneSelected = selectedCount === 0

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = !allSelected && !noneSelected
    }
  }, [allSelected, noneSelected])

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={allSelected}
      onChange={() => onChange(!allSelected)}
      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
    />
  )
}

export function FilterSidebar({
  players,
  selectedMarkets,
  selectedSportsbooks,
  selectedPlayers,
  sortBy,
  searchQuery,
  onMarketToggle,
  onSportsbookToggle,
  onPlayerToggle,
  onSelectAllMarkets,
  onSelectAllSportsbooks,
  onSelectAllPlayers,
  onSortChange,
  onSearchChange,
  onReset,
}: FilterSidebarProps) {
  const [playerSearch, setPlayerSearch] = useState('')

  const visiblePlayers = playerSearch
    ? players.filter((p) =>
        p.name.toLowerCase().includes(playerSearch.toLowerCase())
      )
    : players
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

      {/* Players */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 cursor-pointer">
            <SelectAllCheckbox
              total={players.length}
              selectedCount={selectedPlayers.length}
              onChange={(selectAll) =>
                onSelectAllPlayers(selectAll ? players.map((p) => p.id) : [])
              }
            />
            Players
          </label>
          <span className="text-xs text-gray-400">
            {selectedPlayers.length === 0 ? 'all' : `${selectedPlayers.length}/${players.length}`}
          </span>
        </div>
        {/* Inline search within players */}
        <input
          type="text"
          placeholder="Search players..."
          value={playerSearch}
          onChange={(e) => setPlayerSearch(e.target.value)}
          className="w-full px-2 py-1 mb-2 border border-gray-200 rounded text-xs focus:outline-none focus:border-blue-400"
        />
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {visiblePlayers.map((player) => (
            <label
              key={player.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5"
            >
              <input
                type="checkbox"
                checked={selectedPlayers.includes(player.id)}
                onChange={() => onPlayerToggle(player.id)}
                className="w-4 h-4 rounded border-gray-300 flex-shrink-0"
              />
              <span className="text-sm text-gray-700 truncate">{player.name}</span>
            </label>
          ))}
          {visiblePlayers.length === 0 && (
            <p className="text-xs text-gray-400 px-1">No players match</p>
          )}
        </div>
      </div>

      {/* Markets */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 cursor-pointer">
            <SelectAllCheckbox
              total={MARKETS.length}
              selectedCount={selectedMarkets.length}
              onChange={(selectAll) =>
                onSelectAllMarkets(selectAll ? MARKETS.map((m) => m as number) : [])
              }
            />
            Markets
          </label>
          <span className="text-xs text-gray-400">
            {selectedMarkets.length === 0 ? 'all' : `${selectedMarkets.length}/${MARKETS.length}`}
          </span>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {MARKETS.map((market) => (
            <label
              key={market}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5"
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
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 cursor-pointer">
            <SelectAllCheckbox
              total={BOOKS.length}
              selectedCount={selectedSportsbooks.length}
              onChange={(selectAll) =>
                onSelectAllSportsbooks(selectAll ? BOOKS.map((b) => b.id) : [])
              }
            />
            Sportsbooks
          </label>
          <span className="text-xs text-gray-400">
            {selectedSportsbooks.length === 0 ? 'all' : `${selectedSportsbooks.length}/${BOOKS.length}`}
          </span>
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {BOOKS.map((book) => (
            <label
              key={book.id}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5"
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
