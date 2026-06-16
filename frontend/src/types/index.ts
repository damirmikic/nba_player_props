/**
 * Core domain types reflecting Unabated API schema
 * https://content.unabated.com/markets/v2/league/{leagueId}/propodds.json
 */

// ============================================================================
// LEAGUE & SPORT TYPES
// ============================================================================

export enum League {
  WNBA = 7,
  NBA = 1, // for future expansion
}

export enum PeriodType {
  FULL_GAME = 1,
}

// ============================================================================
// PLAYER TYPES
// ============================================================================

export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: "G" | "F" | "C"; // Guard, Forward, Center
  jerseyNumber: string;
  height: number; // inches
  weight: number; // lbs
  birthDate: string; // ISO 8601
  country: string;
  draftYear: number;
  statusId: number | null; // 1=active
  headshotUrl: string; // relative path: "players/wnba/409927.png"
  leagueId: League;
}

export interface PlayerLookup {
  [personId: number]: Player;
}

// ============================================================================
// TEAM TYPES
// ============================================================================

export interface Team {
  id: number;
  name: string;
  abbreviation: string;
  logoUrl: string; // full URL
  leagueId: League;
  sideId: 0 | 1; // 0=away, 1=home
}

export interface TeamLookup {
  [teamId: number]: Team;
}

// ============================================================================
// SPORTSBOOK TYPES
// ============================================================================

export interface Sportsbook {
  id: number;
  name: string;
  logoUrl: string;
  thumbnailUrl: string;
  siteUrl: string | null;
  isActive: boolean;
  isEnabledForProps: boolean;
  sortOrder: number;
  groupName: string;
}

export interface SportsBookLookup {
  [msId: number]: Sportsbook;
}

// Canonical sportsbook ID → market source ID mapping
export const SPORTSBOOKS = {
  DRAFTKINGS: 1,
  FANDUEL: 2,
  BETMGM: 4,
  CIRCA: 6,
  BOOKMAKER: 8,
  BOVADA: 10,
  BETRIVERS: 17,
  CAESARS: 20,
  HARD_ROCK: 24,
  PARX: 25,
  SUGARHOUSE: 27,
  THESCORE_US: 36, // ESPN Bet
  THESCORE_CA: 60,
  PROPHET_EXCHANGE: 66,
  PRIZEPICKS: 72,
  UNDERDOG_FANTASY: 73,
  SPLASH_SPORTS: 81,
  BETFAIR: 87,
  SLEEPER: 90,
  FANATICS: 86,
  NOVIG: 89,
  POLYMARKET: 107,
  UNABATED_LINE: 49, // Vig-free consensus (special, not a real book)
} as const;

// ============================================================================
// MARKET TYPES (betTypeId)
// ============================================================================

export enum MarketType {
  // Single-stat props
  STEALS = 69,
  REBOUNDS = 70,
  POINTS = 73,
  POINTS_REBOUNDS = 74,
  POINTS_ASSISTS = 75,
  POINTS_REBOUNDS_ASSISTS = 76,
  ASSISTS = 77,
  REBOUNDS_ASSISTS = 78,

  // Binary outcomes
  FIRST_SCORER = 330,
  ANYTIME_SCORER = 331,

  // DFS / Other
  DFS_FANTASY_POINTS = 631,
  UNKNOWN_696 = 696,
  UNKNOWN_700 = 700,
  UNKNOWN_701 = 701,
  UNKNOWN_702 = 702,
  UNKNOWN_158 = 158,
  UNKNOWN_159 = 159,
  UNKNOWN_279 = 279,
  UNKNOWN_1179 = 1179,
}

export const MARKET_LABELS: Record<MarketType, string> = {
  [MarketType.STEALS]: "Steals",
  [MarketType.REBOUNDS]: "Rebounds",
  [MarketType.POINTS]: "Points",
  [MarketType.POINTS_REBOUNDS]: "Pts+Reb",
  [MarketType.POINTS_ASSISTS]: "Pts+Ast",
  [MarketType.POINTS_REBOUNDS_ASSISTS]: "Pts+Reb+Ast",
  [MarketType.ASSISTS]: "Assists",
  [MarketType.REBOUNDS_ASSISTS]: "Reb+Ast",
  [MarketType.FIRST_SCORER]: "First Scorer",
  [MarketType.ANYTIME_SCORER]: "Anytime Scorer",
  [MarketType.DFS_FANTASY_POINTS]: "DFS Fantasy Points",
  [MarketType.UNKNOWN_696]: "Unknown (696)",
  [MarketType.UNKNOWN_700]: "Unknown (700)",
  [MarketType.UNKNOWN_701]: "Unknown (701)",
  [MarketType.UNKNOWN_702]: "Unknown (702)",
  [MarketType.UNKNOWN_158]: "Unknown (158)",
  [MarketType.UNKNOWN_159]: "Unknown (159)",
  [MarketType.UNKNOWN_279]: "Unknown (279)",
  [MarketType.UNKNOWN_1179]: "Unknown (1179)",
};

// ============================================================================
// ODDS & PRICING TYPES
// ============================================================================

/**
 * Represents odds for a single sportsbook on a prop
 * E.g., DraftKings offering -110 on Jackie Young Points Over 16.5
 */
export interface SideSportsbookOdds {
  marketLineId: number;
  modifiedOn: string; // ISO 8601 timestamp
  isBlurred: boolean; // true = premium subscribers only
  marketId: number;
  points: number | null; // the line (e.g., 16.5 for points over/under)
  price: number; // American odds (e.g., -110, +105)
  americanPrice: number;
  sourcePrice: number | null; // original format price from source
  sourceFormat: number | null; // 1=American, 2=Decimal, 4=Implied prob
  statusId: number; // 1=active, 2=suspended
  sequenceNumber: number; // for delta polling
  bacr: number | null; // Best Available Closing Reference = Unabated Line (vig-free)
  ge: number | null; // Grade Edge = Expected Value vs true line
}

/**
 * Represents both OVER and UNDER sides for a prop
 * Key format: "si1:pid{personId}" (Over) and "si0:pid{personId}" (Under)
 */
export interface PropSides {
  [key: string]: {
    [msId: number]: SideSportsbookOdds;
  };
}

// ============================================================================
// GAME / EVENT TYPES
// ============================================================================

export interface Game {
  id: number;
  startTime: string; // ISO 8601
  endTime: string | null;
  statusId: number; // 1=pregame, 2=live, 3=ended
  homeTeamId: number;
  awayTeamId: number;
  periodTypeId: PeriodType;
  live: boolean;
}

export interface EventTeam {
  id: number;
  rotationNumber: number | null;
  score: number | null;
}

// ============================================================================
// PROP MARKET ENTRY (from propodds.json)
// ============================================================================

/**
 * Single prop market for a player in a game
 * E.g., Jackie Young Points Over/Under 16.5 in Aces vs Wings game
 */
export interface PropMarket {
  personId: number;
  eventId: number;
  eventStart: string; // ISO 8601
  eventEnd: string | null;
  statusId: number;
  betTypeId: MarketType;
  gameClock: string | null;
  periodTypeId: PeriodType;
  overtimeNumber: string | null;
  teamId: number; // player's team ID
  playerPosition: string; // "G", "F", "C"
  betSubType: string | null;
  live: boolean;
  key: string; // "pt1:pregame:bt{betTypeId}:e{eventId}"
  sideName: string | null;
  tournament: string | null;
  eventName: string; // "Las Vegas Aces - @ Dallas Wings -"
  eventTeams: {
    [sideId: string]: EventTeam;
  };
  sides: PropSides;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface UnabatedApiResponse {
  odds: {
    "lg7:pt1:pregame": PropMarket[];
    // Add other period/state combos as needed (live, final, etc.)
  };
  people: PlayerLookup;
  teams: TeamLookup;
  marketSources: Sportsbook[];
  startDateTimeISO: string | null;
  endDateTimeISO: string | null;
}

// ============================================================================
// NORMALIZED DATA STRUCTURE FOR UI
// ============================================================================

/**
 * Normalized prop line for UI display
 * Aggregates data from raw API for easier rendering
 */
export interface NormalizedProp {
  id: string; // composite: {eventId}_{betTypeId}_{personId}
  eventId: number;
  gameTime: Date;
  player: Player;
  playerTeam: Team;
  opposingTeam: Team;
  marketType: MarketType;
  marketLabel: string;

  // Over/Under lines and prices
  overLine: number | null; // e.g., 16.5
  underLine: number | null;
  overOdds: Map<number, SideSportsbookOdds>; // msId -> odds
  underOdds: Map<number, SideSportsbookOdds>;

  // Best odds across all books
  bestOverPrice: number;
  bestOverBook: number; // msId
  bestUnderPrice: number;
  bestUnderBook: number;

  // Unabated consensus line
  unabatedLine: number | null;
  unabatedOverEV: number | null; // Grade Edge
  unabatedUnderEV: number | null;

  // Metadata
  lastUpdated: Date;
  isActive: boolean;
}

// ============================================================================
// USER SELECTION / TICKET TYPES
// ============================================================================

export interface SelectedProp {
  prop: NormalizedProp;
  side: "over" | "under";
  selectedBook: number; // msId
  selectedPrice: number;
  selectedLine: number | null;
  timestamp: Date;
}

export interface Ticket {
  id: string;
  selections: SelectedProp[];
  createdAt: Date;
  notes: string;
}

// ============================================================================
// FILTER / UI STATE TYPES
// ============================================================================

export interface OddsFilter {
  selectedMarkets: MarketType[];
  selectedSportsbooks: number[]; // msIds
  selectedPlayers: number[];     // personIds
  sortBy: "bestOdds" | "lineMovement" | "alphabetical";
  searchQuery: string;
  selectedTeams: number[]; // teamIds
}

export interface ApiError {
  code: string;
  message: string;
  timestamp: Date;
}
