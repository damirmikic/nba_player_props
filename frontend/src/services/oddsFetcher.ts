import axios from 'axios'
import type {
  UnabatedApiResponse,
  NormalizedProp,
  SideSportsbookOdds,
  League,
} from '@/types/index'
import { MARKET_LABELS, LEAGUE_DATA_SOURCES } from '@/types/index'

export class OddsFetcher {
  /**
   * Fetch raw propodds data from Unabated CDN for a specific league
   */
  static async fetchRawOdds(league: League = 7): Promise<UnabatedApiResponse> {
    try {
      const source = LEAGUE_DATA_SOURCES[league]
      if (!source?.apiEndpoint) {
        throw new Error(`No Unabated endpoint configured for league: ${league}`)
      }

      const response = await axios.get<UnabatedApiResponse>(source.apiEndpoint, {
        params: {
          v: Math.random(), // Cache busting
        },
        timeout: 10000,
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
  static normalizeOdds(rawData: UnabatedApiResponse, league: League = 7): NormalizedProp[] {
    const propsMap = new Map<string, NormalizedProp>()

    for (const rawProp of rawData.odds['lg7:pt1:pregame']) {
      const uniqueKey = `${rawProp.eventId}_${rawProp.betTypeId}_${rawProp.personId}`

      let prop = propsMap.get(uniqueKey)

      if (!prop) {
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

        prop = {
          id: uniqueKey,
          eventId: rawProp.eventId,
          gameTime: new Date(rawProp.eventStart),
          league,
          dataSource: 'Unabated',
          player,
          playerTeam,
          opposingTeam,
          marketType: rawProp.betTypeId,
          marketLabel: MARKET_LABELS[rawProp.betTypeId] || `Market ${rawProp.betTypeId}`,
          overLine: null,
          underLine: null,
          overOdds: new Map<number, SideSportsbookOdds>(),
          underOdds: new Map<number, SideSportsbookOdds>(),
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

      // Scan all side keys — handle cases where over and under come in separate rawProp objects
      // Unabated API convention: si0 = OVER/Yes side, si1 = UNDER/No side
      for (const [sideKey, bookOdds] of Object.entries(rawProp.sides)) {
        const isOver = sideKey.startsWith('si0:')
        const isUnder = sideKey.startsWith('si1:')
        if (!isOver && !isUnder) continue

        const targetMap = isOver ? prop.overOdds : prop.underOdds

        for (const [msIdStr, oddsEntry] of Object.entries(bookOdds as Record<string, SideSportsbookOdds>)) {
          // Strip any non-numeric prefix (e.g. "ms123" → 123)
          const msId = parseInt(msIdStr.replace(/\D+/g, ''), 10)
          if (isNaN(msId)) continue
          targetMap.set(msId, oddsEntry)
          if (isOver && prop.overLine === null) prop.overLine = oddsEntry.points
          if (isUnder && prop.underLine === null) prop.underLine = oddsEntry.points
        }
      }
    }

    // Second pass: Find best prices now that all odds are merged
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

      // Get Unabated Line (bacr) if available
      const overBookedEntry = Array.from(prop.overOdds.values())[0]
      prop.unabatedOverEV = overBookedEntry?.ge ?? null
      const underBookedEntry = Array.from(prop.underOdds.values())[0]
      prop.unabatedUnderEV = underBookedEntry?.ge ?? null
      prop.unabatedLine = overBookedEntry?.bacr ?? null
    }

    return finalProps
  }

  /**
   * Combined: Fetch raw odds and normalize in one call
   */
  static async fetchAndNormalize(league: League = 7): Promise<NormalizedProp[]> {
    const rawData = await this.fetchRawOdds(league)
    return this.normalizeOdds(rawData, league)
  }
}
