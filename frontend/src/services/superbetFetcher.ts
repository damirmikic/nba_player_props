/**
 * Superbet API client for European basketball leagues
 * Configuration based on actual Superbet web app
 * Endpoints:
 * - Prematch: https://production-superbet-offer-rs.freetls.fastly.net/sb-rs/api/v2/subscription/{locale}/prematch
 * - Stats: https://scorealarm-stats.freetls.fastly.net
 */

import axios from 'axios'
import type {
  NormalizedProp,
  SideSportsbookOdds,
  League,
  Player,
  Team,
} from '@/types/index'
import { MARKET_LABELS, LEAGUE_DATA_SOURCES } from '@/types/index'

// Superbet API Configuration
const SUPERBET_CONFIG = {
  baseUrl: 'https://production-superbet-offer-rs.freetls.fastly.net/sb-rs/api/v2',
  statsUrl: 'https://scorealarm-stats.freetls.fastly.net',
  locale: 'sr-Latn-RS',
  soccerSportId: 5,
  basketballSportId: 4,
  tennisSportId: 2,
  upcomingDays: 14,
}

/**
 * Sports ID mapping for Superbet
 */
const SPORTS_MAPPING = {
  basketball: SUPERBET_CONFIG.basketballSportId,
}

/**
 * Superbet API Response Format
 */
interface SuperbetEventMarket {
  id: string | number
  eventId: string | number
  name: string
  marketType: string // 'player-props' or similar
  outcomes: Array<{
    id: string | number
    name: string // "Player Name Over 20.5 Points"
    odds: number // decimal odds
    available: boolean
  }>
}

interface SuperbetEvent {
  id: string | number
  name: string // "Team A vs Team B"
  startTime: string // ISO 8601
  sport: string
  league: string
  markets: SuperbetEventMarket[]
}

interface SuperbetPrematchResponse {
  events: SuperbetEvent[]
  timestamp: string
}

interface SuperbetStructure {
  sports: Array<{
    id: number
    name: string
    leagues: Array<{
      id: number
      name: string
      teams: Array<{
        id: number
        name: string
      }>
    }>
  }>
}

export class SuperbetFetcher {
  // Use mock in restricted environments, switch to false for production with network access
  static MOCK_ENABLED = true

  /**
   * Fetch prematch odds for a specific sport/league
   * @param league League enum value
   * @param startDate Date range start
   * @param endDate Date range end
   */
  static async fetchPrematchOdds(
    league: League,
    startDate: Date = new Date(),
    endDate: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days out
  ): Promise<SuperbetPrematchResponse> {
    try {
      if (this.MOCK_ENABLED) {
        return this.generateMockData(league)
      }

      const params = {
        sports: SPORTS_MAPPING.basketball,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }

      const endpoint = `${SUPERBET_CONFIG.baseUrl}/subscription/${SUPERBET_CONFIG.locale}/prematch`
      console.log('📡 Superbet Prematch API Request:', { endpoint, params })

      const response = await axios.get<SuperbetPrematchResponse>(endpoint, {
        params,
        timeout: 10000,
      })

      console.log('✅ Superbet Prematch Response:', response.data)
      return response.data
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('❌ Superbet Prematch Error:', message)
      throw new Error(`Failed to fetch Superbet prematch odds: ${message}`)
    }
  }

  /**
   * Fetch structure (teams, leagues, players taxonomy)
   */
  static async fetchStructure(): Promise<SuperbetStructure> {
    try {
      if (this.MOCK_ENABLED) {
        return this.generateMockStructure()
      }

      const endpoint = `${SUPERBET_CONFIG.baseUrl}/subscription/${SUPERBET_CONFIG.locale}/structure`
      console.log('📡 Superbet Structure API Request:', { endpoint })

      const response = await axios.get<SuperbetStructure>(endpoint, {
        timeout: 10000,
      })

      console.log('✅ Superbet Structure Response:', response.data)
      return response.data
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('❌ Superbet Structure Error:', message)
      throw new Error(`Failed to fetch Superbet structure: ${message}`)
    }
  }

  /**
   * Generate mock prematch data for development
   */
  private static generateMockData(_league: League): SuperbetPrematchResponse {
    const mockPlayers = [
      { name: 'Nikola Mirotic', line: 17.5, odds: [1.85, 1.95] },
      { name: 'Shane Larkin', line: 15.2, odds: [1.88, 1.92] },
      { name: 'Jaleen Smith', line: 15.5, odds: [1.87, 1.93] },
      { name: 'Anthony Randolph', line: 12.5, odds: [1.90, 1.90] },
      { name: 'Vladimir Stimac', line: 14.3, odds: [1.86, 1.94] },
    ]

    const leagueMockups: { [key: number]: { name: string; matchups: [string, string][] } } = {
      [100]: {
        name: 'Euroliga',
        matchups: [
          ['Barcelona', 'Real Madrid'],
          ['CSKA Moscow', 'Fenerbahçe'],
          ['Olympiacos', 'Anadolu Efes'],
        ],
      },
      [101]: {
        name: 'ABA Liga',
        matchups: [
          ['Partizan', 'Crvena Zvezda'],
          ['Cedevita Zagreb', 'Split'],
          ['Budućnost', 'Mega'],
        ],
      },
      [102]: {
        name: 'EuroCup',
        matchups: [
          ['Virtus Bologna', 'AS Monaco'],
          ['Bursaspor', 'Umana Reyer'],
        ],
      },
      [103]: {
        name: 'ACB (Spain)',
        matchups: [
          ['Real Madrid', 'Barcelona'],
          ['Baskonia', 'Valencia'],
        ],
      },
    }

    const leagueInfo = leagueMockups[_league] || leagueMockups[100]
    const mockEvents: SuperbetEvent[] = []

    leagueInfo.matchups.forEach((matchup, idx) => {
      const eventId = `evt_${leagueInfo.name.replace(/\s/g, '_')}_${idx}`

      const outcomes = mockPlayers.slice(idx, idx + 2).flatMap((player) => [
        {
          id: `out_${eventId}_${player.name.replace(/\s/g, '_')}_over`,
          name: `${player.name} Over ${player.line} Points`,
          odds: player.odds[0],
          available: true,
        },
        {
          id: `out_${eventId}_${player.name.replace(/\s/g, '_')}_under`,
          name: `${player.name} Under ${player.line} Points`,
          odds: player.odds[1],
          available: true,
        },
      ])

      mockEvents.push({
        id: eventId,
        name: `${matchup[0]} vs ${matchup[1]}`,
        startTime: new Date(Date.now() + (idx + 1) * 24 * 60 * 60 * 1000).toISOString(),
        sport: 'basketball',
        league: leagueInfo.name,
        markets: [
          {
            id: `mkt_${eventId}`,
            eventId: eventId,
            name: 'Player Props',
            marketType: 'player-props',
            outcomes,
          },
        ],
      })
    })

    console.log(`📊 Mock data generated for ${leagueInfo.name}: ${mockEvents.length} games`)
    return {
      events: mockEvents,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Generate mock structure
   */
  private static generateMockStructure(): SuperbetStructure {
    return {
      sports: [
        {
          id: 4,
          name: 'Basketball',
          leagues: [
            {
              id: 100,
              name: 'Euroliga',
              teams: [
                { id: 1001, name: 'Barcelona' },
                { id: 1002, name: 'Real Madrid' },
              ],
            },
            {
              id: 101,
              name: 'ABA Liga',
              teams: [
                { id: 1003, name: 'Partizan' },
                { id: 1004, name: 'Crvena Zvezda' },
              ],
            },
          ],
        },
      ],
    }
  }

  /**
   * Normalize Superbet data into NormalizedProp[]
   */
  static normalizeOdds(
    rawData: SuperbetPrematchResponse,
    league: League,
    _playerLookup: Map<string, Player>,
    _teamLookup: Map<string, Team>
  ): NormalizedProp[] {
    const propsMap = new Map<string, NormalizedProp>()
    const dataSource = LEAGUE_DATA_SOURCES[league]?.primary || 'Superbet'

    for (const event of rawData.events) {
      for (const market of event.markets) {
        // Parse player name and market type from outcome names
        // E.g., "Nikola Mirotic Over 17.5 Points" → player, line, market type

        for (const outcome of market.outcomes) {
          const parsed = this.parseOutcomeName(outcome.name)
          if (!parsed) continue

          const { playerName, line, side, marketType } = parsed
          const uniqueKey = `${event.id}_${marketType}_${playerName}_${line}`

          let prop = propsMap.get(uniqueKey)

          if (!prop) {
            // Create minimal prop with available data
            prop = {
              id: uniqueKey,
              eventId: parseInt(String(event.id), 10) || 0,
              gameTime: new Date(event.startTime),
              league,
              dataSource,
              player: {
                id: Math.random() * 100000,
                firstName: playerName.split(' ')[0],
                lastName: playerName.split(' ').slice(1).join(' '),
                position: 'F',
                jerseyNumber: '0',
                height: 0,
                weight: 0,
                birthDate: '',
                country: '',
                draftYear: 0,
                statusId: 1,
                headshotUrl: '',
                leagueId: league,
              },
              playerTeam: {
                id: 0,
                name: event.name.split(' vs ')[0],
                abbreviation: '',
                logoUrl: '',
                leagueId: league,
                sideId: 0,
              },
              opposingTeam: {
                id: 1,
                name: event.name.split(' vs ')[1],
                abbreviation: '',
                logoUrl: '',
                leagueId: league,
                sideId: 1,
              },
              marketType: this.mapMarketType(marketType),
              marketLabel: this.getMarketLabel(this.mapMarketType(marketType)) || marketType,
              overLine: side === 'over' ? line : null,
              underLine: side === 'under' ? line : null,
              overOdds: new Map(),
              underOdds: new Map(),
              bestOverPrice: -Infinity,
              bestOverBook: -1,
              bestUnderPrice: -Infinity,
              bestUnderBook: -1,
              unabatedLine: null,
              unabatedOverEV: null,
              unabatedUnderEV: null,
              lastUpdated: new Date(),
              isActive: true,
            }
            propsMap.set(uniqueKey, prop)
          }

          // Add odds for this outcome
          const bookId = 203 // Superbet
          const oddsEntry: SideSportsbookOdds = {
            marketLineId: parseInt(String(outcome.id), 10) || 0,
            modifiedOn: rawData.timestamp,
            isBlurred: false,
            marketId: parseInt(String(market.id), 10) || 0,
            points: line,
            price: this.decimalToAmerican(outcome.odds),
            americanPrice: this.decimalToAmerican(outcome.odds),
            sourcePrice: outcome.odds,
            sourceFormat: 2, // decimal
            statusId: outcome.available ? 1 : 2,
            sequenceNumber: 0,
            bacr: null,
            ge: null,
          }

          if (side === 'over') {
            prop.overLine = line
            prop.overOdds.set(bookId, oddsEntry)
          } else {
            prop.underLine = line
            prop.underOdds.set(bookId, oddsEntry)
          }
        }
      }
    }

    // Calculate best prices
    const finalProps = Array.from(propsMap.values())
    for (const prop of finalProps) {
      let bestOverPrice = -Infinity
      let bestOverBook = -1
      let bestUnderPrice = -Infinity
      let bestUnderBook = -1

      for (const [msId, odds] of prop.overOdds) {
        if (odds.price > bestOverPrice) {
          bestOverPrice = odds.price
          bestOverBook = msId
        }
      }

      for (const [msId, odds] of prop.underOdds) {
        if (odds.price > bestUnderPrice) {
          bestUnderPrice = odds.price
          bestUnderBook = msId
        }
      }

      prop.bestOverPrice = bestOverPrice === -Infinity ? -110 : bestOverPrice
      prop.bestOverBook = bestOverBook
      prop.bestUnderPrice = bestUnderPrice === -Infinity ? -110 : bestUnderPrice
      prop.bestUnderBook = bestUnderBook
    }

    return finalProps
  }

  /**
   * Parse outcome name to extract player, line, side, market type
   * E.g., "Nikola Mirotic Over 17.5 Points" → { playerName, line, side, marketType }
   */
  private static parseOutcomeName(
    name: string
  ): { playerName: string; line: number; side: 'over' | 'under'; marketType: string } | null {
    // Regex: "PlayerName Over/Under XX.X Market"
    const regex = /^(.+?)\s+(Over|Under)\s+([\d.]+)\s+(.+)$/i
    const match = name.match(regex)

    if (!match) return null

    return {
      playerName: match[1].trim(),
      side: match[2].toLowerCase() === 'over' ? 'over' : 'under',
      line: parseFloat(match[3]),
      marketType: match[4].trim(),
    }
  }

  /**
   * Map market type name to MarketType enum
   */
  private static mapMarketType(marketType: string): number {
    const mapping: { [key: string]: number } = {
      'points': 73,
      'rebounds': 70,
      'assists': 77,
      'points+rebounds': 74,
      'points+assists': 75,
      'points+rebounds+assists': 76,
      'steals': 69,
    }
    // Fuzzy match (case-insensitive, partial)
    const key = Object.keys(mapping).find((k) =>
      marketType.toLowerCase().includes(k) || k.includes(marketType.toLowerCase())
    )
    return mapping[key || 'points'] || 73
  }

  /**
   * Get market label for a market type number
   */
  private static getMarketLabel(marketTypeNum: number): string {
    const typeNum = marketTypeNum as keyof typeof MARKET_LABELS
    return MARKET_LABELS[typeNum] || `Market ${marketTypeNum}`
  }

  /**
   * Convert decimal odds to American odds
   * Decimal 1.85 → American -120
   */
  private static decimalToAmerican(decimal: number): number {
    if (decimal === 0) return -110
    if (decimal === 1) return 0
    if (decimal < 2) {
      return Math.round(-100 / (decimal - 1))
    } else {
      return Math.round((decimal - 1) * 100)
    }
  }

  /**
   * Fetch player statistics (for future EV calculations)
   * @param sport Sport ID
   * @param variant Stats variant (e.g., 'rssuperbetsport')
   */
  static async fetchPlayerStats(sport: number = SUPERBET_CONFIG.basketballSportId): Promise<any> {
    try {
      if (this.MOCK_ENABLED) {
        console.log('📊 Mock stats mode enabled')
        return { mock: true }
      }

      const endpoint = `${SUPERBET_CONFIG.statsUrl}/api/stats`
      console.log('📡 Superbet Stats API Request:', { endpoint, sport })

      const response = await axios.get(endpoint, {
        params: { sport, variant: 'rssuperbetsport' },
        timeout: 10000,
      })

      console.log('✅ Superbet Stats Response:', response.data)
      return response.data
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn('⚠️ Superbet Stats Error (non-blocking):', message)
      return null
    }
  }

  /**
   * Combined: Fetch and normalize
   */
  static async fetchAndNormalize(
    league: League,
    playerLookup: Map<string, Player>,
    teamLookup: Map<string, Team>
  ): Promise<NormalizedProp[]> {
    const rawData = await this.fetchPrematchOdds(league)
    return this.normalizeOdds(rawData, league, playerLookup, teamLookup)
  }
}

// Export config for use in other services
export { SUPERBET_CONFIG }
