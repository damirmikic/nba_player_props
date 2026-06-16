import axios from 'axios'
import type {
  UnabatedApiResponse,
  NormalizedProp,
} from '@/types/index'
import { MARKET_LABELS } from '@/types/index'

const UNABATED_API_URL =
  'https://content.unabated.com/markets/v2/league/7/propodds.json'

export class OddsFetcher {
  /**
   * Fetch raw propodds data from Unabated CDN
   */
  static async fetchRawOdds(): Promise<UnabatedApiResponse> {
    try {
      const response = await axios.get<UnabatedApiResponse>(UNABATED_API_URL, {
        params: {
          v: Math.random(), // Cache busting
        },
      })
      return response.data
    } catch (error) {
      throw new Error(
        `Failed to fetch Unabated odds: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Normalize raw PropMarket[] into NormalizedProp[] for UI consumption
   *
   * Aggregates data from:
   * - Player metadata (firstName, lastName, position, headshot)
   * - Team metadata (name, logo, abbreviation)
   * - Sportsbook odds (price, line, bacr, ge)
   * - Market type (betTypeId → human label)
   */
  static normalizeOdds(rawData: UnabatedApiResponse): NormalizedProp[] {
    const props: NormalizedProp[] = []
    const processedKeys = new Set<string>()

    for (const rawProp of rawData.odds['lg7:pt1:pregame']) {
      // Skip duplicates (prevent over/under from creating 2 entries)
      const uniqueKey = `${rawProp.eventId}_${rawProp.betTypeId}_${rawProp.personId}`
      if (processedKeys.has(uniqueKey)) continue
      processedKeys.add(uniqueKey)

      // Retrieve lookups
      const player = rawData.people[rawProp.personId]
      const playerTeam = rawData.teams[rawProp.teamId]
      const opposingTeamId = Object.values(rawProp.eventTeams)
        .map((t) => t.id)
        .find((id) => id !== rawProp.teamId)

      if (!player || !playerTeam || !opposingTeamId) {
        console.warn(
          `Skipping prop: missing data for player ${rawProp.personId} in event ${rawProp.eventId}`
        )
        continue
      }

      const opposingTeam = rawData.teams[opposingTeamId]
      if (!opposingTeam) continue

      // Parse over/under odds from sides
      const overOdds = new Map<number, any>()
      const underOdds = new Map<number, any>()
      let overLine: number | null = null
      let underLine: number | null = null

      // si1 = Over/Yes side, si0 = Under/No side
      const overKey = `si1:pid${rawProp.personId}`
      const underKey = `si0:pid${rawProp.personId}`

      if (rawProp.sides[overKey]) {
        for (const [msIdStr, odds] of Object.entries(
          rawProp.sides[overKey]
        )) {
          const msId = parseInt(msIdStr.replace('ms', ''), 10)
          overOdds.set(msId, odds)
          if (overLine === null) overLine = odds.points
        }
      }

      if (rawProp.sides[underKey]) {
        for (const [msIdStr, odds] of Object.entries(
          rawProp.sides[underKey]
        )) {
          const msId = parseInt(msIdStr.replace('ms', ''), 10)
          underOdds.set(msId, odds)
          if (underLine === null) underLine = odds.points
        }
      }

      // Find best prices
      let bestOverPrice = -Infinity
      let bestOverBook = -1
      let bestUnderPrice = -Infinity
      let bestUnderBook = -1

      for (const [msId, odds] of overOdds) {
        if (odds.price > bestOverPrice) {
          bestOverPrice = odds.price
          bestOverBook = msId
        }
      }

      for (const [msId, odds] of underOdds) {
        if (odds.price > bestUnderPrice) {
          bestUnderPrice = odds.price
          bestUnderBook = msId
        }
      }

      // Get Unabated Line (bacr) if available
      const overBookedEntry = Array.from(overOdds.values())[0]
      const unabatedOverEV = overBookedEntry?.ge ?? null
      const underBookedEntry = Array.from(underOdds.values())[0]
      const unabatedUnderEV = underBookedEntry?.ge ?? null

      const normalizedProp: NormalizedProp = {
        id: `${rawProp.eventId}_${rawProp.betTypeId}_${rawProp.personId}`,
        eventId: rawProp.eventId,
        gameTime: new Date(rawProp.eventStart),
        player,
        playerTeam,
        opposingTeam,
        marketType: rawProp.betTypeId,
        marketLabel: MARKET_LABELS[rawProp.betTypeId] || `Market ${rawProp.betTypeId}`,
        overLine,
        underLine,
        overOdds,
        underOdds,
        bestOverPrice: bestOverPrice === -Infinity ? -105 : bestOverPrice,
        bestOverBook,
        bestUnderPrice: bestUnderPrice === -Infinity ? -105 : bestUnderPrice,
        bestUnderBook,
        unabatedLine: overBookedEntry?.bacr ?? null,
        unabatedOverEV,
        unabatedUnderEV,
        lastUpdated: new Date(),
        isActive: rawProp.statusId === 1,
      }

      props.push(normalizedProp)
    }

    return props
  }

  /**
   * Combined: Fetch raw odds and normalize in one call
   */
  static async fetchAndNormalize(): Promise<NormalizedProp[]> {
    const rawData = await this.fetchRawOdds()
    return this.normalizeOdds(rawData)
  }
}
