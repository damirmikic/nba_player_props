import { useEffect, useState } from 'react'
import { useOddsStore } from '@store/oddsStore'
import { useFilterStore } from '@store/filterStore'
import { useUIStore } from '@store/uiStore'
import { OddsFetcher } from '@services/oddsFetcher'
import { OddsTable } from '@components/OddsTable'
import { FilterSidebar } from '@components/FilterSidebar'
import { GamePicker } from '@components/GamePicker'

export function App() {
  const [gameFilter, setGameFilter] = useState<number[]>([])

  const { setProps, props, isLoading, error, setLoading, setError } = useOddsStore()
  const {
    selectedMarkets,
    selectedSportsbooks,
    sortBy,
    searchQuery,
    toggleMarket,
    toggleSportsbook,
    setSortBy,
    setSearchQuery,
    resetFilters,
  } = useFilterStore()
  const { selectedTab, setSelectedTab } = useUIStore()

  // Fetch and normalize odds on mount
  useEffect(() => {
    const fetchOdds = async () => {
      setLoading(true)
      try {
        const normalized = await OddsFetcher.fetchAndNormalize()
        setProps(normalized)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch odds')
      } finally {
        setLoading(false)
      }
    }

    fetchOdds()
  }, [setProps, setLoading, setError])

  // Filter props by game if selected
  const filteredByGame =
    gameFilter.length === 0 ? props : props.filter((p) => gameFilter.includes(p.eventId))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            WNBA Player Props Trader
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
            <span className="ml-3 text-gray-600">Loading odds from Unabated...</span>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <FilterSidebar
                selectedMarkets={selectedMarkets}
                selectedSportsbooks={selectedSportsbooks}
                sortBy={sortBy}
                searchQuery={searchQuery}
                onMarketToggle={toggleMarket}
                onSportsbookToggle={toggleSportsbook}
                onSortChange={setSortBy}
                onSearchChange={setSearchQuery}
                onReset={resetFilters}
              />
              <div className="mt-4">
                <GamePicker
                  props={props}
                  selectedGameIds={gameFilter}
                  onGameSelect={setGameFilter}
                />
              </div>
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
