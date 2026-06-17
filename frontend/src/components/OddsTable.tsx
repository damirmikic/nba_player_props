import { useMemo, Fragment } from 'react'
import type { NormalizedProp } from '@/types/index'
import { SPORTSBOOKS } from '@/types/index'
import { OddsCell } from './OddsCell'

interface OddsTableProps {
  props: NormalizedProp[]
  selectedSportsbooks: number[]
  selectedMarkets: number[]
  selectedPlayers: number[]
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
  selectedPlayers,
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

      // Player filter
      if (selectedPlayers.length > 0 && !selectedPlayers.includes(prop.player.id)) {
        return false
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
  }, [props, selectedMarkets, selectedSportsbooks, selectedPlayers, searchQuery])

  // Get visible sportsbooks: intersection of selected books and books that have odds
  const visibleBooks = useMemo(() => {
    const bookIds = new Set<number>()
    for (const prop of filteredProps) {
      prop.overOdds.forEach((_v, msId: number) => bookIds.add(msId))
      prop.underOdds.forEach((_v, msId: number) => bookIds.add(msId))
    }
    if (selectedSportsbooks.length > 0) {
      // Only show columns for selected books (preserving filter order)
      return selectedSportsbooks.filter((msId) => bookIds.has(msId))
    }
    return Array.from(bookIds).sort()
  }, [filteredProps, selectedSportsbooks])

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
      <table className="min-w-full table-fixed">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 w-[180px] min-w-[180px]">
              Player / Market
            </th>
            {visibleBooks.map((msId) => (
              <th
                key={`book-${msId}`}
                colSpan={2}
                className="py-3 text-center text-xs font-semibold text-gray-700 border-l border-gray-200 w-[136px] min-w-[136px]"
              >
                {getBookName(msId)}
              </th>
            ))}
          </tr>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="sticky left-0 bg-gray-50 z-10" />
            {visibleBooks.map((msId) => (
              <Fragment key={`labels-${msId}`}>
                <th className="py-1.5 text-center text-xs font-medium text-gray-500 border-l border-gray-200 w-[68px] min-w-[68px]">
                  OVER
                </th>
                <th className="py-1.5 text-center text-xs font-medium text-gray-500 w-[68px] min-w-[68px]">
                  UNDER
                </th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredProps.map((prop, idx) => (
            <tr
              key={prop.id}
              className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {/* Player / Market info */}
              <td className="px-4 py-2 text-sm font-medium text-gray-900 sticky left-0 bg-inherit z-10 w-[180px] min-w-[180px]">
                <div className="flex items-center gap-2 min-w-0">
                  {prop.player.headshotUrl && (
                    <img
                      src={`https://assets.unabated.com/${prop.player.headshotUrl}`}
                      alt={prop.player.firstName}
                      className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {prop.player.firstName} {prop.player.lastName}
                      <span className="text-gray-500 ml-1 font-normal text-xs">
                        ({prop.playerTeam.abbreviation})
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 truncate">{prop.marketLabel}</div>
                    <div className="text-xs text-gray-400">vs {prop.opposingTeam.abbreviation}</div>
                  </div>
                </div>
              </td>

              {/* Over/Under odds for each book */}
              {visibleBooks.map((msId) => (
                <Fragment key={`odds-${prop.id}-${msId}`}>
                  {/* OVER */}
                  <td className="p-1 border-l border-gray-200 align-middle w-[68px] min-w-[68px]">
                    <OddsCell
                      odds={prop.overOdds.get(msId)}
                      bookName={getBookName(msId)}
                      isBestOdds={msId === prop.bestOverBook}
                      onClick={() => onSelectOdds?.(prop, 'over', msId)}
                    />
                  </td>
                  {/* UNDER */}
                  <td className="p-1 align-middle w-[68px] min-w-[68px]">
                    <OddsCell
                      odds={prop.underOdds.get(msId)}
                      bookName={getBookName(msId)}
                      isBestOdds={msId === prop.bestUnderBook}
                      onClick={() => onSelectOdds?.(prop, 'under', msId)}
                    />
                  </td>
                </Fragment>
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
