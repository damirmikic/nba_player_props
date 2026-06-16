import { create } from 'zustand'
import type { NormalizedProp, UnabatedApiResponse } from '@types'

interface OddsState {
  // Raw API data
  rawData: UnabatedApiResponse | null
  props: NormalizedProp[]
  isLoading: boolean
  error: string | null
  lastFetch: Date | null

  // Actions
  setRawData: (data: UnabatedApiResponse) => void
  setProps: (props: NormalizedProp[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  fetchOdds: () => Promise<void>
  updateProp: (propId: string, updates: Partial<NormalizedProp>) => void
}

export const useOddsStore = create<OddsState>((set) => ({
  rawData: null,
  props: [],
  isLoading: false,
  error: null,
  lastFetch: null,

  setRawData: (data) => set({ rawData: data }),
  setProps: (props) => set({ props }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  updateProp: (propId, updates) =>
    set((state) => ({
      props: state.props.map((p) =>
        p.id === propId ? { ...p, ...updates } : p
      ),
    })),

  fetchOdds: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(
        'https://content.unabated.com/markets/v2/league/7/propodds.json?v=' +
          Math.random()
      )
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = (await response.json()) as UnabatedApiResponse
      set({
        rawData: data,
        lastFetch: new Date(),
        isLoading: false,
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch odds',
        isLoading: false,
      })
    }
  },
}))
