import { create } from 'zustand'
import type { NormalizedProp, League } from '@/types/index'

interface OddsState {
  // Data storage per league
  props: NormalizedProp[]
  propsCache: Map<League, NormalizedProp[]> // Cache for each league

  isLoading: boolean
  error: string | null
  lastFetch: Map<League, Date> // Track last fetch per league
  currentLeague: League

  // Actions
  setProps: (props: NormalizedProp[], league: League) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setCurrentLeague: (league: League) => void
  updateProp: (propId: string, updates: Partial<NormalizedProp>) => void
  getPropsForLeague: (league: League) => NormalizedProp[]
  getCachedProps: (league: League) => NormalizedProp[] | undefined
}

export const useOddsStore = create<OddsState>((set, get) => ({
  props: [],
  propsCache: new Map(),
  isLoading: false,
  error: null,
  lastFetch: new Map(),
  currentLeague: 7, // Default to WNBA

  setCurrentLeague: (league: League) => set({ currentLeague: league }),

  setProps: (props: NormalizedProp[], league: League) =>
    set((state) => {
      const cache = new Map(state.propsCache)
      cache.set(league, props)
      return {
        props: league === state.currentLeague ? props : state.props,
        propsCache: cache,
        lastFetch: new Map(state.lastFetch).set(league, new Date()),
      }
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  getPropsForLeague: (league: League) => {
    const state = get()
    return state.propsCache.get(league) || []
  },

  getCachedProps: (league: League) => {
    const state = get()
    return state.propsCache.get(league)
  },

  updateProp: (propId, updates) =>
    set((state) => ({
      props: state.props.map((p) =>
        p.id === propId ? { ...p, ...updates } : p
      ),
    })),
}))
