import type { League } from '@/types/index'
import type { DataSourceAdapter, SourceName } from './sourceAdapter'
import { superbetAdapter } from './superbetAdapter'
import { unabatedAdapter } from './unabatedAdapter'

const adapters: DataSourceAdapter[] = [unabatedAdapter, superbetAdapter]

export function getSourceAdapter(league: League): DataSourceAdapter {
  const adapter = adapters.find((sourceAdapter) => sourceAdapter.supportsLeague(league))
  if (!adapter) {
    throw new Error(`No data source adapter configured for league ${league}`)
  }
  return adapter
}

export function getSourceAdapterByName(source: SourceName): DataSourceAdapter {
  const adapter = adapters.find((sourceAdapter) => sourceAdapter.source === source)
  if (!adapter) {
    throw new Error(`No data source adapter configured for ${source}`)
  }
  return adapter
}

export type {
  DataSourceAdapter,
  FetchPropsOptions,
  SourceEvent,
  SourceHealth,
  SourceName,
} from './sourceAdapter'
