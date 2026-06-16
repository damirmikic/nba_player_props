import { create } from 'zustand'
import { SPORTSBOOKS } from '@types'
import type { MarketType, OddsFilter } from '@types'

interface FilterState extends OddsFilter {
  // Actions
  setSelectedMarkets: (markets: MarketType[]) => void
  setSelectedSportsbooks: (books: number[]) => void
  setSortBy: (sort: OddsFilter['sortBy']) => void
  setSearchQuery: (query: string) => void
  setSelectedTeams: (teams: number[]) => void
  toggleMarket: (market: MarketType) => void
  toggleSportsbook: (msId: number) => void
  toggleTeam: (teamId: number) => void
  resetFilters: () => void
}

const DEFAULT_FILTER: OddsFilter = {
  selectedMarkets: [],
  selectedSportsbooks: [
    SPORTSBOOKS.DRAFTKINGS,
    SPORTSBOOKS.FANDUEL,
    SPORTSBOOKS.BETMGM,
    SPORTSBOOKS.CAESARS,
    SPORTSBOOKS.BETRIVERS,
  ],
  sortBy: 'bestOdds',
  searchQuery: '',
  selectedTeams: [],
}

export const useFilterStore = create<FilterState>((set) => ({
  ...DEFAULT_FILTER,

  setSelectedMarkets: (markets) =>
    set({ selectedMarkets: markets }),

  setSelectedSportsbooks: (books) =>
    set({ selectedSportsbooks: books }),

  setSortBy: (sort) =>
    set({ sortBy: sort }),

  setSearchQuery: (query) =>
    set({ searchQuery: query }),

  setSelectedTeams: (teams) =>
    set({ selectedTeams: teams }),

  toggleMarket: (market) =>
    set((state) => ({
      selectedMarkets: state.selectedMarkets.includes(market)
        ? state.selectedMarkets.filter((m) => m !== market)
        : [...state.selectedMarkets, market],
    })),

  toggleSportsbook: (msId) =>
    set((state) => ({
      selectedSportsbooks: state.selectedSportsbooks.includes(msId)
        ? state.selectedSportsbooks.filter((b) => b !== msId)
        : [...state.selectedSportsbooks, msId],
    })),

  toggleTeam: (teamId) =>
    set((state) => ({
      selectedTeams: state.selectedTeams.includes(teamId)
        ? state.selectedTeams.filter((t) => t !== teamId)
        : [...state.selectedTeams, teamId],
    })),

  resetFilters: () =>
    set(DEFAULT_FILTER),
}))
