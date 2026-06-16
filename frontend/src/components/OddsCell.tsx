import type { SideSportsbookOdds } from '@types'

interface OddsCellProps {
  odds: SideSportsbookOdds | undefined
  bookName: string
  bookLogo?: string
  isBestOdds: boolean
  isSelected?: boolean
  onClick?: () => void
}

/**
 * Single odds cell for a sportsbook's offer on a prop side
 * Shows price, line, and indicates best odds
 */
export function OddsCell({
  odds,
  bookName,
  bookLogo,
  isBestOdds,
  isSelected,
  onClick,
}: OddsCellProps) {
  if (!odds) {
    return (
      <div className="odds-cell opacity-30 cursor-not-allowed">
        <span className="text-xs text-gray-400">N/A</span>
      </div>
    )
  }

  const priceColor =
    odds.price > 0
      ? 'text-green-600' // Underdog (positive)
      : 'text-red-600' // Favorite (negative)

  return (
    <div
      className={`odds-cell ${isBestOdds ? 'best-odds' : ''} ${
        isSelected ? 'selected' : ''
      }`}
      onClick={onClick}
      title={`${bookName}: ${odds.americanPrice} @ ${odds.points}`}
    >
      {isBestOdds && <span className="best-indicator">★</span>}

      <div className="text-center">
        {bookLogo && (
          <img
            src={bookLogo}
            alt={bookName}
            className="h-6 w-6 mx-auto mb-1 object-contain"
          />
        )}
        <div className={`font-semibold text-sm ${priceColor}`}>
          {odds.americanPrice > 0 ? '+' : ''}
          {odds.americanPrice}
        </div>
        {odds.points !== null && (
          <div className="text-xs text-gray-600 mt-0.5">
            {odds.points > 0 ? '+' : ''}
            {odds.points}
          </div>
        )}
        <div className="text-xs text-gray-500 mt-1">{bookName}</div>
      </div>
    </div>
  )
}
