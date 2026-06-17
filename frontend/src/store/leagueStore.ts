import { create } from 'zustand'
import { League, LEAGUE_NAMES } from '@/types/index'
import type { SuperbetBasketballLeague } from '@services/superbetFetcher'

const UNABATED_LEAGUES: League[] = [League.NBA, League.WNBA, League.NCAA]

interface LeagueState {
  selectedLeague: League
  availableLeagues: League[]
  leagueLabels: Record<number, string>
  superbetLeagues: SuperbetBasketballLeague[]

  setLeague: (league: League) => void
  setSuperbetLeagues: (leagues: SuperbetBasketballLeague[]) => void
}

export const useLeagueStore = create<LeagueState>((set) => ({
  selectedLeague: League.NBA,
  availableLeagues: UNABATED_LEAGUES,
  leagueLabels: {},
  superbetLeagues: [],

  setLeague: (league: League) => {
    set({ selectedLeague: league })
  },

  setSuperbetLeagues: (leagues: SuperbetBasketballLeague[]) => {
    if (leagues.length === 0) return

    const labels = Object.fromEntries(leagues.map((l) => [l.id, l.name]))
    const superbetIds = leagues.map((l) => l.id as League)

    set((state) => ({
      availableLeagues: [...UNABATED_LEAGUES, ...superbetIds],
      leagueLabels: { ...state.leagueLabels, ...labels },
      superbetLeagues: leagues,
    }))
  },
}))

export const getLeagueName = (league: League): string => {
  return LEAGUE_NAMES[league] || String(league)
}
