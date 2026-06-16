import { create } from 'zustand'
import { League, LEAGUE_NAMES } from '@/types/index'

interface LeagueState {
  selectedLeague: League
  availableLeagues: League[]

  setLeague: (league: League) => void
}

// Determine available leagues based on current season
const getAvailableLeagues = (): League[] => {
  const currentMonth = new Date().getMonth()
  const isOffSeason = currentMonth >= 6 && currentMonth <= 8 // June-August off-season

  return isOffSeason
    ? [
        League.WNBA, // WNBA summer league
        League.EUROLIGA,
        League.ABA,
        League.EUROCUP,
        League.ACB,
        League.GREECE,
        League.TURKEY,
        League.ITALY,
        League.FRANCE,
        League.GERMANY,
        League.NCAA,
        League.VTB,
        League.LITHUANIA,
      ]
    : [
        League.NBA,
        League.WNBA,
        League.EUROLIGA,
        League.ABA,
        League.EUROCUP,
        League.ACB,
        League.GREECE,
        League.TURKEY,
        League.ITALY,
        League.FRANCE,
        League.GERMANY,
        League.NCAA,
        League.VTB,
        League.LITHUANIA,
      ]
}

export const useLeagueStore = create<LeagueState>((set) => ({
  selectedLeague: getAvailableLeagues()[0], // Default to first available
  availableLeagues: getAvailableLeagues(),

  setLeague: (league: League) => {
    // Reset filters when changing league
    set({ selectedLeague: league })
  },
}))

// Helper to get league display name
export const getLeagueName = (league: League): string => {
  return LEAGUE_NAMES[league] || String(league)
}
