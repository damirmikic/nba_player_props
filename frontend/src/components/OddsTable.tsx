import { useMemo } from 'react'
import type { NormalizedProp, Sportsbook } from '@types'
import { SPORTSBOOKS } from '@types'
import { OddsCell } from './OddsCell'

interface OddsTableProps {
  props: NormalizedProp[]
  selectedSportsbooks: number[]
  selectedMarkets: number[]
  searchQuery: string
  onSelectOdds?: (prop: NormalizedProp, side: 'over' | 'under', bookId: number) => void
}

/**
 * Main odds comparison table
 * Rows: Players × Markets
 * Columns: Over/Under × Sportsbooks
 * Shows best odds highlighted with ★
 */
export function OddsTable({
  props,
  selectedSportsbooks,
  selectedMarkets,
  searchQuery,
  onSelectOdds,
}: OddsTableProps) {
  // Filter props based on selections
  const filteredProps = useMemo(() => {
    return props.filter((prop) => {
      // Market filter
      if (selectedMarkets.length > 0 && !selectedMarkets.includes(prop.marketType)) {
        return false
      }

      // Sportsbook filter - only show if at least one selected book has odds
      if (selectedSportsbooks.length > 0) {
        const hasSelectedBook =
          Array.from(prop.overOdds.keys()).some((msId) =>
            selectedSportsbooks.includes(msId)
          ) ||
          Array.from(prop.underOdds.keys()).some((msId) =>
            selectedSportsbooks.includes(msId)
          )
        if (!hasSelectedBook) return false
      }

      // Search filter (player name or team)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          `${prop.player.firstName} ${prop.player.lastName}`.toLowerCase().includes(query) ||
          prop.playerTeam.abbreviation.toLowerCase().includes(query) ||
          prop.marketLabel.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [props, selectedMarkets, selectedSportsbooks, searchQuery])

  // Get visible sportsbooks (those with odds in filtered props)
  const visibleBooks = useMemo(() => {
    const bookIds = new Set<number>()
    for (const prop of filteredProps) {
      prop.overOdds.forEach((_, msId) => bookIds.add(msId))
      prop.underOdds.forEach((_, msId) => bookIds.add(msId))
    }
    return Array.from(bookIds).sort()
  }, [filteredProps])

  if (filteredProps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">
          {props.length === 0
            ? 'Loading odds...'
            : 'No props match your filters. Try adjusting your selection.'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-48 sticky left-0 bg-gray-50 z-10">
              Player / Market
            </th>
            {visibleBooks.map((msId) => (
              <th
                key={`book-${msId}`}
                colSpan={2}
                className="px-2 py-3 text-center text-xs font-semibold text-gray-700 border-l border-gray-200"
              >
                <div className="text-gray-900">{getBookName(msId)}</div>
              </th>
            ))}
          </tr>
          <tr className="bg-white border-b border-gray-200">
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 sticky left-0 bg-white z-10">
              {/* Empty for player column */}
            </th>
            {visibleBooks.map((msId) => (
              <div key={`labels-${msId}`} className="flex">
                <th className="px-1 py-2 text-center text-xs text-gray-600 w-24 border-l border-gray-200">
                  OVER
                </th>
                <th className="px-1 py-2 text-center text-xs text-gray-600 w-24">
                  UNDER
                </th>
              </div>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredProps.map((prop, idx) => (
            <tr
              key={prop.id}
              className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {/* Player / Market header */}
              <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-inherit z-10">
                <div className="flex items-center gap-2">
                  {prop.player.headshotUrl && (
                    <img
                      src={`https://assets.unabated.com/${prop.player.headshotUrl}`}
                      alt={prop.player.firstName}
                      className="h-6 w-6 rounded-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <div>
                    <div className="font-semibold">
                      {prop.player.firstName} {prop.player.lastName}
                      <span className="text-gray-500 ml-2">
                        ({prop.playerTeam.abbreviation})
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">{prop.marketLabel}</div>
                    <div className="text-xs text-gray-500">
                      vs {prop.opposingTeam.abbreviation}
                    </div>
                  </div>
                </div>
              </td>

              {/* Over/Under odds for each book */}
              {visibleBooks.map((msId) => (
                <div key={`odds-${prop.id}-${msId}`} className="flex border-l border-gray-200">
                  {/* OVER */}
                  <td className="px-1 py-2 w-24">
                    <OddsCell
                      odds={prop.overOdds.get(msId)}
                      bookName={getBookName(msId)}
                      isBestOdds={msId === prop.bestOverBook}
                      onClick={() =>
                        onSelectOdds?.(prop, 'over', msId)
                      }
                    />
                  </td>

                  {/* UNDER */}
                  <td className="px-1 py-2 w-24">
                    <OddsCell
                      odds={prop.underOdds.get(msId)}
                      bookName={getBookName(msId)}
                      isBestOdds={msId === prop.bestUnderBook}
                      onClick={() =>
                        onSelectOdds?.(prop, 'under', msId)
                      }
                    />
                  </td>
                </div>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Map sportsbook ID to display name
 */
function getBookName(msId: number): string {
  const bookNames: Record<number, string> = {
    [SPORTSBOOKS.DRAFTKINGS]: 'DK',
    [SPORTSBOOKS.FANDUEL]: 'FD',
    [SPORTSBOOKS.BETMGM]: 'BetMGM',
    [SPORTSBOOKS.CAESARS]: 'Caesars',
    [SPORTSBOOKS.BETRIVERS]: 'BetRivers',
    [SPORTSBOOKS.CIRCA]: 'Circa',
    [SPORTSBOOKS.BOOKMAKER]: 'Bookmaker',
    [SPORTSBOOKS.BOVADA]: 'Bovada',
    [SPORTSBOOKS.HARD_ROCK]: 'Hard Rock',
    [SPORTSBOOKS.SUGARHOUSE]: 'SugarHouse',
    [SPORTSBOOKS.PARX]: 'Parx',
    [SPORTSBOOKS.THESCORE_US]: 'ESPN Bet',
    [SPORTSBOOKS.THESCORE_CA]: 'TheScore CA',
    [SPORTSBOOKS.PROPHET_EXCHANGE]: 'Prophet',
    [SPORTSBOOKS.PRIZEPICKS]: 'PrizePicks',
    [SPORTSBOOKS.UNDERDOG_FANTASY]: 'Underdog',
    [SPORTSBOOKS.SPLASH_SPORTS]: 'Splash',
    [SPORTSBOOKS.BETFAIR]: 'Betfair',
    [SPORTSBOOKS.SLEEPER]: 'Sleeper',
    [SPORTSBOOKS.FANATICS]: 'Fanatics',
    [SPORTSBOOKS.NOVIG]: 'NoVig',
    [SPORTSBOOKS.POLYMARKET]: 'Polymarket',
  }
  return bookNames[msId] || `Book ${msId}`
}
