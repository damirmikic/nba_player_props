import type { NormalizedProp } from '@/types/index'

interface GamePickerProps {
  props: NormalizedProp[]
  selectedGameIds: number[]
  onGameSelect: (gameIds: number[]) => void
}

/**
 * Game picker to filter by specific games
 * Shows all unique games in the prop list
 */
export function GamePicker({
  props,
  selectedGameIds,
  onGameSelect,
}: GamePickerProps) {
  // Get unique games
  const games = Array.from(
    new Map(
      props.map((p) => [
        p.eventId,
        {
          id: p.eventId,
          time: p.gameTime,
          home: p.playerTeam.abbreviation,
          away: p.opposingTeam.abbreviation,
          homeTeamId: p.playerTeam.id,
          awayTeamId: p.opposingTeam.id,
        },
      ])
    ).values()
  ).sort((a, b) => a.time.getTime() - b.time.getTime())

  const toggleGame = (gameId: number) => {
    if (selectedGameIds.includes(gameId)) {
      onGameSelect(selectedGameIds.filter((id) => id !== gameId))
    } else {
      onGameSelect([...selectedGameIds, gameId])
    }
  }

  const toggleAll = () => {
    if (selectedGameIds.length === games.length) {
      onGameSelect([])
    } else {
      onGameSelect(games.map((g) => g.id))
    }
  }

  if (games.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Games</h3>
        <button
          onClick={toggleAll}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {selectedGameIds.length === games.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {games.map((game) => (
          <label
            key={game.id}
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedGameIds.includes(game.id)}
              onChange={() => toggleGame(game.id)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700 flex-1">
              {game.home} @ {game.away}
            </span>
            <span className="text-xs text-gray-500">
              {game.time.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
