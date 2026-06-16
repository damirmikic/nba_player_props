import { useEffect } from 'react'
import { useOddsStore } from '@store/oddsStore'
import { useUIStore } from '@store/uiStore'

export function App() {
  const { fetchOdds, isLoading, error } = useOddsStore()
  const { selectedTab } = useUIStore()

  useEffect(() => {
    fetchOdds()
  }, [fetchOdds])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            WNBA Player Props Trader
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Compare odds across top sportsbooks
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin">
              <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            </div>
            <span className="ml-3 text-gray-600">Loading odds...</span>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Error loading odds: {error}
            </p>
          </div>
        )}

        {!isLoading && !error && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedTab === 'odds' && 'Odds Comparison'}
              {selectedTab === 'analytics' && 'Analytics'}
              {selectedTab === 'history' && 'History'}
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-500">
                Scaffold complete. Component implementation coming next.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
