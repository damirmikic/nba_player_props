import type { SideSportsbookOdds } from '@/types/index'

interface OddsCellProps {
  odds: SideSportsbookOdds | undefined
  bookName: string
  isBestOdds: boolean
  isSelected?: boolean
  onClick?: () => void
}

/** Convert American odds to decimal odds (2 decimal places) */
function americanToDecimal(american: number): string {
  const decimal =
    american > 0
      ? american / 100 + 1
      : 100 / Math.abs(american) + 1
  return decimal.toFixed(2)
}

/**
 * Single odds cell for a sportsbook's offer on a prop side
 * Shows decimal price and line. Book name shown in column header, not repeated here.
 */
export function OddsCell({
  odds,
  bookName,
  isBestOdds,
  isSelected,
  onClick,
}: OddsCellProps) {
  if (!odds) {
    return (
      <div className="odds-cell-empty">
        <span className="text-xs text-gray-300">—</span>
      </div>
    )
  }

  const decimalPrice = americanToDecimal(odds.americanPrice)
  const priceColor =
    odds.americanPrice >= 0
      ? 'text-green-600' // Underdog
      : 'text-gray-800'  // Favourite (neutral, decimal is always > 1)

  return (
    <div
      className={`odds-cell ${isBestOdds ? 'best-odds' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      title={`${bookName}: ${odds.americanPrice > 0 ? '+' : ''}${odds.americanPrice} (${decimalPrice}) @ ${odds.points}`}
    >
      {isBestOdds && <span className="best-indicator">★</span>}
      <div className={`font-semibold text-sm leading-tight ${priceColor}`}>
        {decimalPrice}
      </div>
      {odds.points !== null && (
        <div className="text-xs text-gray-500 leading-tight mt-0.5">
          {odds.points > 0 ? '+' : ''}{odds.points}
        </div>
      )}
    </div>
  )
}
