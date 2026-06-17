import { League, SPORTSBOOKS } from '@/types/index'

export type FeedSource =
  | 'Unabated'
  | 'Superbet'
  | 'Bet365'
  | 'Stoixman'
  | 'Pinnacle'
  | 'Manual'
  | 'Mixed'

export type FeedMode = 'single' | 'mixed' | 'manual'

export interface PlayerFeedOverride {
  personId: number
  source: FeedSource
  books: number[]
  reason?: string
}

export interface LeagueFeedConfig {
  league: League
  label: string
  mode: FeedMode
  primarySource: FeedSource
  adapterSource: 'Unabated' | 'Superbet'
  books: number[]
  fallbackSources: FeedSource[]
  apiEndpoint?: string
  roundToIncrement?: number
  playerOverrides: Record<number, PlayerFeedOverride>
}

const US_CORE_BOOKS = [
  SPORTSBOOKS.DRAFTKINGS,
  SPORTSBOOKS.FANDUEL,
  SPORTSBOOKS.BETMGM,
  SPORTSBOOKS.CAESARS,
  SPORTSBOOKS.BETRIVERS,
]

const DEFAULT_SUPERBET_CONFIG = {
  mode: 'single' as const,
  primarySource: 'Superbet' as const,
  adapterSource: 'Superbet' as const,
  books: [SPORTSBOOKS.SUPERBET],
  fallbackSources: [],
  roundToIncrement: 0.5,
  playerOverrides: {},
}

export const LEAGUE_FEED_CONFIG: Partial<Record<League, LeagueFeedConfig>> = {
  [League.NBA]: {
    league: League.NBA,
    label: 'NBA',
    mode: 'single',
    primarySource: 'Unabated',
    adapterSource: 'Unabated',
    books: US_CORE_BOOKS,
    fallbackSources: ['Manual'],
    apiEndpoint: 'https://content.unabated.com/markets/v2/league/1/propodds.json',
    playerOverrides: {},
  },
  [League.WNBA]: {
    league: League.WNBA,
    label: 'WNBA',
    mode: 'single',
    primarySource: 'Unabated',
    adapterSource: 'Unabated',
    books: US_CORE_BOOKS,
    fallbackSources: ['Manual'],
    apiEndpoint: 'https://content.unabated.com/markets/v2/league/7/propodds.json',
    playerOverrides: {},
  },
  [League.NCAA]: {
    league: League.NCAA,
    label: 'NCAA',
    mode: 'mixed',
    primarySource: 'Mixed',
    adapterSource: 'Unabated',
    books: [SPORTSBOOKS.DRAFTKINGS, SPORTSBOOKS.FANDUEL],
    fallbackSources: ['Unabated', 'Manual'],
    apiEndpoint: 'https://content.unabated.com/markets/v2/league/109/propodds.json',
    roundToIncrement: 0.5,
    playerOverrides: {},
  },
}

export function getLeagueFeedConfig(league: League): LeagueFeedConfig {
  return LEAGUE_FEED_CONFIG[league] ?? {
    league,
    label: `League ${league}`,
    ...DEFAULT_SUPERBET_CONFIG,
  }
}

export function getLeagueBooks(league: League): number[] {
  return getLeagueFeedConfig(league).books
}

export function getLeagueAdapterSource(league: League): 'Unabated' | 'Superbet' {
  return getLeagueFeedConfig(league).adapterSource
}

export function getPlayerFeedOverride(
  league: League,
  personId: number
): PlayerFeedOverride | undefined {
  return getLeagueFeedConfig(league).playerOverrides[personId]
}
