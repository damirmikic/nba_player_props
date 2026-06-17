import type { League, NormalizedProp } from '@/types/index'

export type SourceName = 'Unabated' | 'Superbet'

export interface SourceEvent {
  id: number
  leagueId: League
  name: string
  homeTeam: string
  awayTeam: string
  startTime: string
  marketCount: number
  rawEvent?: unknown
}

export interface SourceHealth {
  source: SourceName
  ok: boolean
  lastSuccessAt: Date | null
  message?: string
}

export interface FetchPropsOptions {
  preloadedEvents?: SourceEvent[]
}

export interface DataSourceAdapter {
  source: SourceName
  supportsLeague: (league: League) => boolean
  fetchEvents?: (league: League) => Promise<SourceEvent[]>
  fetchProps: (league: League, options?: FetchPropsOptions) => Promise<NormalizedProp[]>
  getHealth: () => SourceHealth
}
