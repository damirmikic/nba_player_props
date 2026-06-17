import { useEffect, useState } from 'react'
import { League } from '@/types/index'
import { getLeagueFeedConfig } from '@/config/feedConfig'
import { useLeagueStore, getLeagueName } from '@store/leagueStore'
import { SuperbetFetcher } from '@services/superbetFetcher'

interface LeaguePickerProps {
  onLeagueChange?: (league: League) => void
}

export function LeaguePicker({ onLeagueChange }: LeaguePickerProps) {
  const {
    selectedLeague,
    availableLeagues,
    leagueLabels,
    superbetLeagues,
    setLeague,
    setSuperbetLeagues,
  } = useLeagueStore()
  const [isLoadingLeagues, setIsLoadingLeagues] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadSuperbetLeagues = async () => {
      setIsLoadingLeagues(true)
      try {
        const leagues = await SuperbetFetcher.fetchBasketballLeagues()
        if (isMounted) setSuperbetLeagues(leagues)
      } finally {
        if (isMounted) setIsLoadingLeagues(false)
      }
    }

    loadSuperbetLeagues()

    return () => {
      isMounted = false
    }
  }, [setSuperbetLeagues])

  const handleLeagueChange = (league: League) => {
    setLeague(league)
    onLeagueChange?.(league)
  }

  const currentFeedConfig = getLeagueFeedConfig(selectedLeague)
  const selectedSuperbetLeague = superbetLeagues.find((league) => league.id === selectedLeague)
  const currentSourceName =
    currentFeedConfig.primarySource || (selectedSuperbetLeague ? 'Superbet' : 'Unknown')
  const currentBookCount = currentFeedConfig.books.length
  const displayLeagueName = (league: League) => leagueLabels[league] || getLeagueName(league)
  const leagueEventCount = (league: League) =>
    superbetLeagues.find((superbetLeague) => superbetLeague.id === league)?.eventCount

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-screen-2xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* League selector */}
          <div className="flex items-center gap-3">
            <label htmlFor="league-select" className="text-sm font-semibold text-gray-700">League:</label>
            <select
              id="league-select"
              value={selectedLeague}
              onChange={(e) => handleLeagueChange(Number(e.target.value) as League)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {availableLeagues.map((league) => (
                <option key={league} value={league}>
                  {displayLeagueName(league)}
                  {leagueEventCount(league) ? ` (${leagueEventCount(league)} games)` : ''}
                </option>
              ))}
            </select>
            {isLoadingLeagues && (
              <span className="text-xs text-gray-500">Loading Superbet leagues...</span>
            )}
          </div>

          {/* Data source indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-md">
            <span className="text-xs font-medium text-gray-600">Source:</span>
            <span className="text-sm font-semibold text-gray-900">
              {currentSourceName}
            </span>
            <span className="text-xs text-gray-500">
              ({currentBookCount} books)
            </span>
          </div>

          {/* Quick league buttons (optional - for mobile friendly) */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Quick:</span>
            <div className="flex gap-1 flex-wrap">
              {availableLeagues.slice(0, 4).map((league) => (
                <button
                  key={league}
                  onClick={() => handleLeagueChange(league)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    selectedLeague === league
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {displayLeagueName(league).split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
