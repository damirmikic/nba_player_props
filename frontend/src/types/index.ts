/**
 * Core domain types reflecting Unabated API schema
 * https://content.unabated.com/markets/v2/league/{leagueId}/propodds.json
 */

// ============================================================================
// LEAGUE & SPORT TYPES
// ============================================================================

export enum League {
  NBA = 1,
  WNBA = 7,
  EUROLIGA = 100,
  EUROLEAGUE = 100, // alias
  ABA = 101,
  EUROCUP = 102,
  ACB = 103,
  GREECE = 104,
  TURKEY = 105,
  ITALY = 106,
  FRANCE = 107,
  GERMANY = 108,
  NCAA = 109,
  VTB = 110,
  LITHUANIA = 111,
}

export const LEAGUE_NAMES: Record<League, string> = {
  [League.NBA]: 'NBA',
  [League.WNBA]: 'WNBA',
  [League.EUROLIGA]: 'Euroliga',
  [League.ABA]: 'ABA Liga',
  [League.EUROCUP]: 'EuroCup',
  [League.ACB]: 'ACB (Spain)',
  [League.GREECE]: 'Greece',
  [League.TURKEY]: 'Turkey',
  [League.ITALY]: 'Italy',
  [League.FRANCE]: 'France',
  [League.GERMANY]: 'Germany',
  [League.NCAA]: 'NCAA',
  [League.VTB]: 'VTB',
  [League.LITHUANIA]: 'Lithuania',
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
  // US Books (Unabated)
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

  // European Books (Superbet)
  BET365: 201,
  STOIXMAN: 202,
  SUPERBET: 203,
  UNIBET: 204,
  BETSSON: 205,
  MARATHONBET: 206,
  PINNACLE: 207,
  OLYBET: 208,
  FONBET: 209,
  X1BET: 210,
} as const;

// League → Data Sources mapping
export const LEAGUE_DATA_SOURCES: Record<League, {
  primary: string;
  books: (typeof SPORTSBOOKS)[keyof typeof SPORTSBOOKS][];
  apiEndpoint?: string;
}> = {
  [League.NBA]: {
    primary: 'Unabated',
    books: [SPORTSBOOKS.DRAFTKINGS, SPORTSBOOKS.FANDUEL, SPORTSBOOKS.BETMGM, SPORTSBOOKS.CAESARS, SPORTSBOOKS.BETRIVERS],
    apiEndpoint: 'https://content.unabated.com/markets/v2/league/1/propodds.json',
  },
  [League.WNBA]: {
    primary: 'Unabated',
    books: [SPORTSBOOKS.DRAFTKINGS, SPORTSBOOKS.FANDUEL, SPORTSBOOKS.BETMGM, SPORTSBOOKS.CAESARS, SPORTSBOOKS.BETRIVERS],
    apiEndpoint: 'https://content.unabated.com/markets/v2/league/7/propodds.json',
  },
  [League.EUROLIGA]: {
    primary: 'Superbet',
    books: [SPORTSBOOKS.BET365, SPORTSBOOKS.STOIXMAN, SPORTSBOOKS.SUPERBET],
    apiEndpoint: 'https://superbet.com/api/markets/euroliga', // TBD
  },
  [League.ABA]: {
    primary: 'Superbet',
    books: [SPORTSBOOKS.SUPERBET, SPORTSBOOKS.BET365],
    apiEndpoint: 'https://superbet.com/api/markets/aba',
  },
  [League.EUROCUP]: {
    primary: 'Superbet',
    books: [SPORTSBOOKS.BET365, SPORTSBOOKS.STOIXMAN, SPORTSBOOKS.SUPERBET],
    apiEndpoint: 'https://superbet.com/api/markets/eurocup',
  },
  [League.ACB]: {
    primary: 'Superbet',
    books: [SPORTSBOOKS.BET365, SPORTSBOOKS.STOIXMAN, SPORTSBOOKS.SUPERBET],
    apiEndpoint: 'https://superbet.com/api/markets/acb',
  },
  [League.GREECE]: {
    primary: 'Stoixman',
    books: [SPORTSBOOKS.STOIXMAN, SPORTSBOOKS.BET365],
    apiEndpoint: 'https://superbet.com/api/markets/greece',
  },
  [League.TURKEY]: {
    primary: 'Superbet',
    books: [SPORTSBOOKS.SUPERBET],
    apiEndpoint: 'https://superbet.com/api/markets/turkey',
  },
  [League.ITALY]: {
    primary: 'Superbet',
    books: [SPORTSBOOKS.STOIXMAN, SPORTSBOOKS.BET365, SPORTSBOOKS.SUPERBET],
    apiEndpoint: 'https://superbet.com/api/markets/italy',
  },
  [League.FRANCE]: {
    primary: 'Superbet',
    books: [SPORTSBOOKS.BET365, SPORTSBOOKS.SUPERBET, SPORTSBOOKS.STOIXMAN],
    apiEndpoint: 'https://superbet.com/api/markets/france',
  },
  [League.GERMANY]: {
    primary: 'Superbet',
    books: [SPORTSBOOKS.BET365, SPORTSBOOKS.SUPERBET, SPORTSBOOKS.STOIXMAN],
    apiEndpoint: 'https://superbet.com/api/markets/germany',
  },
  [League.NCAA]: {
    primary: 'Unabated',
    books: [SPORTSBOOKS.DRAFTKINGS, SPORTSBOOKS.FANDUEL],
    apiEndpoint: 'https://content.unabated.com/markets/v2/league/90/propodds.json',
  },
  [League.VTB]: {
    primary: 'Superbet',
    books: [SPORTSBOOKS.X1BET, SPORTSBOOKS.FONBET],
    apiEndpoint: 'https://superbet.com/api/markets/vtb',
  },
  [League.LITHUANIA]: {
    primary: 'OlyBet',
    books: [SPORTSBOOKS.OLYBET],
    apiEndpoint: 'https://superbet.com/api/markets/lithuania',
  },
};

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
  league: League; // Added for multi-league support
  dataSource: string; // 'Unabated', 'Superbet', 'Bet365', etc.
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
