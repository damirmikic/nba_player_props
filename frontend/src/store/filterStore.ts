import { create } from 'zustand'
import { SPORTSBOOKS } from '@/types/index'
import type { MarketType, OddsFilter } from '@/types/index'

interface FilterState extends OddsFilter {
  // Actions
  setSelectedMarkets: (markets: MarketType[]) => void
  setSelectedSportsbooks: (books: number[]) => void
  setSelectedPlayers: (players: number[]) => void
  setSortBy: (sort: OddsFilter['sortBy']) => void
  setSearchQuery: (query: string) => void
  setSelectedTeams: (teams: number[]) => void
  toggleMarket: (market: MarketType) => void
  toggleSportsbook: (msId: number) => void
  togglePlayer: (personId: number) => void
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
  selectedPlayers: [],
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

  setSelectedPlayers: (players) =>
    set({ selectedPlayers: players }),

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

  togglePlayer: (personId) =>
    set((state) => ({
      selectedPlayers: state.selectedPlayers.includes(personId)
        ? state.selectedPlayers.filter((p) => p !== personId)
        : [...state.selectedPlayers, personId],
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
