import { useEffect, useState, useMemo } from 'react'
import { useOddsStore } from '@store/oddsStore'
import { useLeagueStore } from '@store/leagueStore'
import { useFilterStore } from '@store/filterStore'

import { getLeagueBooks } from '@/config/feedConfig'
import { getSourceAdapter } from '@services/sources'
import type { SourceEvent } from '@services/sources'
import { OddsTable } from '@components/OddsTable'
import { FilterSidebar } from '@components/FilterSidebar'
import { GamePicker } from '@components/GamePicker'
import { LeaguePicker } from '@components/LeaguePicker'

export function App() {
  const [gameFilter, setGameFilter] = useState<number[]>([])
  const [leagueGames, setLeagueGames] = useState<SourceEvent[]>([])
  const [isLoadingGames, setIsLoadingGames] = useState(false)

  const selectedLeague = useLeagueStore((s) => s.selectedLeague)
  const { setProps, props, isLoading, error, setLoading, setError, getPropsForLeague } =
    useOddsStore()

  const {
    selectedMarkets,
    selectedSportsbooks,
    selectedPlayers,
    sortBy,
    searchQuery,
    toggleMarket,
    toggleSportsbook,
    togglePlayer,
    setSelectedMarkets,
    setSelectedSportsbooks,
    setSelectedPlayers,
    setSortBy,
    setSearchQuery,
    resetFilters,
  } = useFilterStore()

  useEffect(() => {
    setSelectedSportsbooks(getLeagueBooks(selectedLeague))
  }, [selectedLeague, setSelectedSportsbooks])

  useEffect(() => {
    setGameFilter([])

    let isMounted = true

    const fetchFromConfiguredSource = async () => {
      const adapter = getSourceAdapter(selectedLeague)
      setLoading(true)
      setError(null)

      try {
        let games: SourceEvent[] = []

        if (adapter.fetchEvents) {
          setIsLoadingGames(true)
          games = await adapter.fetchEvents(selectedLeague)
          if (!isMounted) return
          setLeagueGames(games)
        } else {
          setLeagueGames([])
        }

        const normalized = await adapter.fetchProps(selectedLeague, {
          preloadedEvents: games,
        })
        if (!isMounted) return
        setProps(normalized, selectedLeague)
      } catch (err) {
        if (!isMounted) return
        setLeagueGames([])
        setError(err instanceof Error ? err.message : 'Failed to fetch odds')
      } finally {
        if (isMounted) {
          setIsLoadingGames(false)
          setLoading(false)
        }
      }
    }

    fetchFromConfiguredSource()

    return () => {
      isMounted = false
    }
  }, [selectedLeague, setProps, setLoading, setError])

  // Get props for current league
  const currentProps = useMemo(() => {
    return getPropsForLeague(selectedLeague)
  }, [selectedLeague, props, getPropsForLeague])

  // Derive unique sorted player list from all props
  const availablePlayers = useMemo(() => {
    const map = new Map<number, string>()
    for (const p of currentProps) {
      map.set(p.player.id, `${p.player.firstName} ${p.player.lastName}`)
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [currentProps])

  // Filter props by game if selected
  const filteredByGame =
    gameFilter.length === 0 ? currentProps : currentProps.filter((p) => gameFilter.includes(p.eventId))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* League Picker Header */}
      <LeaguePicker onLeagueChange={() => setGameFilter([])} />

      {/* Main Header */}
      <header className="bg-white shadow sticky top-14 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Player Props Trader
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Compare odds across {selectedSportsbooks.length} sportsbooks
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-screen-2xl mx-auto p-4 sm:px-6 lg:px-8">
        {/* Error state */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin">
              <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            </div>
            <span className="ml-3 text-gray-600">Loading odds...</span>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <GamePicker
                  props={currentProps}
                  games={leagueGames}
                  isLoading={isLoadingGames}
                  selectedGameIds={gameFilter}
                  onGameSelect={setGameFilter}
                />
              </div>
              <FilterSidebar
                players={availablePlayers}
                selectedMarkets={selectedMarkets}
                selectedSportsbooks={selectedSportsbooks}
                selectedPlayers={selectedPlayers}
                sortBy={sortBy}
                searchQuery={searchQuery}
                onMarketToggle={toggleMarket}
                onSportsbookToggle={toggleSportsbook}
                onPlayerToggle={togglePlayer}
                onSelectAllMarkets={setSelectedMarkets}
                onSelectAllSportsbooks={setSelectedSportsbooks}
                onSelectAllPlayers={setSelectedPlayers}
                onSortChange={setSortBy}
                onSearchChange={setSearchQuery}
                onReset={resetFilters}
              />
            </div>

            {/* Main odds grid */}
            <div className="lg:col-span-4">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Odds Comparison
                  </h2>
                  <span className="text-sm text-gray-500">
                    {filteredByGame.length} props
                  </span>
                </div>
              </div>

              <OddsTable
                props={filteredByGame}
                selectedSportsbooks={selectedSportsbooks}
                selectedMarkets={selectedMarkets}
                selectedPlayers={selectedPlayers}
                searchQuery={searchQuery}
                onSelectOdds={(prop, side, bookId) => {
                  console.log(
                    `Selected: ${prop.player.firstName} ${prop.player.lastName} ${side} @ ${bookId}`
                  )
                  // TODO: Add to ticket builder in Phase 1.3
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
