import type { League, NormalizedProp } from '@/types/index'
import { getLeagueAdapterSource } from '@/config/feedConfig'
import { OddsFetcher } from '@services/oddsFetcher'
import type { DataSourceAdapter, SourceHealth } from './sourceAdapter'

let lastSuccessAt: Date | null = null
let lastMessage: string | undefined

export const unabatedAdapter: DataSourceAdapter = {
  source: 'Unabated',

  supportsLeague: (league: League) =>
    getLeagueAdapterSource(league) === 'Unabated',

  fetchProps: async (league: League): Promise<NormalizedProp[]> => {
    try {
      const props = await OddsFetcher.fetchAndNormalize(league)
      lastSuccessAt = new Date()
      lastMessage = undefined
      return props
    } catch (error) {
      lastMessage = error instanceof Error ? error.message : String(error)
      throw error
    }
  },

  getHealth: (): SourceHealth => ({
    source: 'Unabated',
    ok: !lastMessage,
    lastSuccessAt,
    message: lastMessage,
  }),
}
