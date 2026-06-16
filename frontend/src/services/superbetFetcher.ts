import axios from 'axios'
import type {
  NormalizedProp,
  SideSportsbookOdds,
  League,
  Player,
  Team,
} from '@/types/index'
import { MARKET_LABELS, LEAGUE_DATA_SOURCES } from '@/types/index'

/**
 * Superbet API Response Format (European bookmakers)
 * This is a simplified schema - adjust based on actual Superbet API
 */
interface SuperbetGame {
  id: string | number
  homeTeam: string
  awayTeam: string
  startTime: string
  league: string
  status: 'scheduled' | 'live' | 'finished'
}

interface SuperbetPlayerMarket {
  playerId: number | string
  playerName: string
  playerTeam: string
  marketType: string // 'points', 'rebounds', 'assists'
  line: number
  overOdds: number
  underOdds: number
  timestamp: string
  book?: string // specific book offering
}

interface SuperbetOddsResponse {
  games: SuperbetGame[]
  markets: SuperbetPlayerMarket[]
  timestamp: string
}

/**
 * Mock data structure - will be replaced with real Superbet API calls
 * For now, we'll fetch and normalize data in the expected format
 */
export class SuperbetFetcher {
  static MOCK_ENABLED = true // Toggle for development

  /**
   * Fetch raw odds from Superbet for a specific league
   */
  static async fetchRawOdds(league: League): Promise<SuperbetOddsResponse> {
    try {
      // TODO: Replace with actual Superbet API endpoint once available
      const endpoint = LEAGUE_DATA_SOURCES[league]?.apiEndpoint

      if (!endpoint) {
        throw new Error(`No API endpoint configured for league: ${league}`)
      }

      // Temporary: use mock data
      if (this.MOCK_ENABLED) {
        return this.generateMockData(league)
      }

      const response = await axios.get<SuperbetOddsResponse>(endpoint, {
        params: {
          v: Math.random(), // Cache busting
        },
        timeout: 10000,
      })

      return response.data
    } catch (error) {
      throw new Error(
        `Failed to fetch Superbet odds: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Generate mock data for development/demo
   * Remove when real API is available
   */
  private static generateMockData(league: League): SuperbetOddsResponse {
    const mockPlayers: { [key: string]: { name: string; team: string }[] } = {
      '100': [ // Euroliga
        { name: 'Nikola Jokic', team: 'Denver' },
        { name: 'Nikola Mirotic', team: 'Barcelona' },
        { name: 'Shane Larkin', team: 'Anadolu Efes' },
      ],
      '101': [ // ABA
        { name: 'Jaleen Smith', team: 'Partizan' },
        { name: 'Anthony Randolph', team: 'Crvena Zvezda' },
      ],
    }

    const players = mockPlayers[String(league)] || []
    const markets: SuperbetPlayerMarket[] = []

    for (const player of players) {
      const marketTypes = ['points', 'rebounds', 'assists', 'points_rebounds']
      for (const type of marketTypes) {
        markets.push({
          playerId: Math.floor(Math.random() * 10000),
          playerName: player.name,
          playerTeam: player.team,
          marketType: type,
          line: Math.floor(Math.random() * 20) + 5,
          overOdds: -110,
          underOdds: -110,
          timestamp: new Date().toISOString(),
        })
      }
    }

    return {
      games: [
        {
          id: `game_${Date.now()}`,
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          startTime: new Date(Date.now() + 86400000).toISOString(),
          league: String(league),
          status: 'scheduled',
        },
      ],
      markets,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Normalize Superbet odds into NormalizedProp[] for UI
   */
  static normalizeOdds(
    rawData: SuperbetOddsResponse,
    league: League,
    playerLookup: Map<string, Player>,
    teamLookup: Map<string, Team>
  ): NormalizedProp[] {
    const propsMap = new Map<string, NormalizedProp>()
    const dataSource = LEAGUE_DATA_SOURCES[league]?.primary || 'Superbet'

    for (const market of rawData.markets) {
      const uniqueKey = `${market.playerId}_${market.marketType}`

      let prop = propsMap.get(uniqueKey)

      if (!prop) {
        const player = playerLookup.get(String(market.playerId))
        const playerTeam = teamLookup.get(market.playerTeam)

        if (!player || !playerTeam) {
          console.warn(
            `Skipping prop: missing data for player ${market.playerName}`
          )
          continue
        }

        // Use first game for now (would be improved with proper game matching)
        const game = rawData.games[0]
        const opposingTeam = teamLookup.get(
          game?.homeTeam === market.playerTeam ? game?.awayTeam : game?.homeTeam
        )

        if (!opposingTeam) continue

        const marketTypeId = this.mapMarketType(market.marketType)

        prop = {
          id: uniqueKey,
          eventId: parseInt(String(game?.id), 10) || 0,
          gameTime: new Date(market.timestamp),
          league,
          dataSource,
          player,
          playerTeam,
          opposingTeam,
          marketType: marketTypeId,
          marketLabel: MARKET_LABELS[marketTypeId] || market.marketType,
          overLine: market.line,
          underLine: market.line,
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

      // Add odds from Superbet (and other books if available)
      const bookId = this.getBookId(market.book || 'superbet')

      const overOddsEntry: SideSportsbookOdds = {
        marketLineId: 0,
        modifiedOn: market.timestamp,
        isBlurred: false,
        marketId: 0,
        points: market.line,
        price: market.overOdds,
        americanPrice: market.overOdds,
        sourcePrice: null,
        sourceFormat: 1,
        statusId: 1,
        sequenceNumber: 0,
        bacr: null,
        ge: null,
      }

      const underOddsEntry: SideSportsbookOdds = {
        marketLineId: 0,
        modifiedOn: market.timestamp,
        isBlurred: false,
        marketId: 0,
        points: market.line,
        price: market.underOdds,
        americanPrice: market.underOdds,
        sourcePrice: null,
        sourceFormat: 1,
        statusId: 1,
        sequenceNumber: 0,
        bacr: null,
        ge: null,
      }

      prop.overOdds.set(bookId, overOddsEntry)
      prop.underOdds.set(bookId, underOddsEntry)
    }

    // Second pass: calculate best prices
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

      prop.bestOverPrice = bestOverPrice
      prop.bestOverBook = bestOverBook
      prop.bestUnderPrice = bestUnderPrice
      prop.bestUnderBook = bestUnderBook
    }

    return finalProps
  }

  /**
   * Map market type string to MarketType enum
   */
  private static mapMarketType(marketType: string): number {
    const mapping: { [key: string]: number } = {
      points: 73,
      rebounds: 70,
      assists: 77,
      points_rebounds: 74,
      points_assists: 75,
      points_rebounds_assists: 76,
    }
    return mapping[marketType] || 73
  }

  /**
   * Map sportsbook name to book ID
   */
  private static getBookId(bookName: string): number {
    const bookMapping: { [key: string]: number } = {
      superbet: 203,
      bet365: 201,
      stoixman: 202,
      unibet: 204,
      betsson: 205,
      marathonbet: 206,
      pinnacle: 207,
      olybet: 208,
      fonbet: 209,
      '1xbet': 210,
    }
    return bookMapping[bookName.toLowerCase()] || 203
  }

  /**
   * Combined: Fetch raw odds and normalize in one call
   */
  static async fetchAndNormalize(
    league: League,
    playerLookup: Map<string, Player>,
    teamLookup: Map<string, Team>
  ): Promise<NormalizedProp[]> {
    const rawData = await this.fetchRawOdds(league)
    return this.normalizeOdds(rawData, league, playerLookup, teamLookup)
  }
}
