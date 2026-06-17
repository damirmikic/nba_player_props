import type { League, NormalizedProp } from '@/types/index'
import { getLeagueAdapterSource } from '@/config/feedConfig'
import { SuperbetFetcher } from '@services/superbetFetcher'
import type { SuperbetBasketballEvent } from '@services/superbetFetcher'
import type {
  DataSourceAdapter,
  FetchPropsOptions,
  SourceEvent,
  SourceHealth,
} from './sourceAdapter'

let lastSuccessAt: Date | null = null
let lastMessage: string | undefined

export const superbetAdapter: DataSourceAdapter = {
  source: 'Superbet',

  supportsLeague: (league: League) =>
    getLeagueAdapterSource(league) === 'Superbet',

  fetchEvents: async (league: League): Promise<SourceEvent[]> => {
    try {
      const events = await SuperbetFetcher.fetchBasketballEvents(league)
      lastSuccessAt = new Date()
      lastMessage = undefined
      return events
    } catch (error) {
      lastMessage = error instanceof Error ? error.message : String(error)
      throw error
    }
  },

  fetchProps: async (
    league: League,
    options?: FetchPropsOptions
  ): Promise<NormalizedProp[]> => {
    try {
      const props = await SuperbetFetcher.fetchAndNormalize(
        league,
        new Map(),
        new Map(),
        options?.preloadedEvents as SuperbetBasketballEvent[] | undefined
      )
      lastSuccessAt = new Date()
      lastMessage = undefined
      return props
    } catch (error) {
      lastMessage = error instanceof Error ? error.message : String(error)
      throw error
    }
  },

  getHealth: (): SourceHealth => ({
    source: 'Superbet',
    ok: !lastMessage,
    lastSuccessAt,
    message: lastMessage,
  }),
}
