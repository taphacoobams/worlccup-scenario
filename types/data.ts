/** Schéma des fichiers JSON locaux dans /data */

export type LocalTeam = {
  id: number;
  name: string;
  code: string;
  country: string;
  group: string | null;
  fifaRanking?: number;
  coach?: string;
  bio?: string;
  strengths?: string;
  weaknesses?: string;
  playerPick?: string;
  contentCredit?: string | null;
  guardianGuideUrl?: string | null;
};

export type LocalPlayer = {
  id: number;
  teamId: number;
  name: string;
  number: number | null;
  position: string;
  positionCode?: string;
  club: string;
  age: number | null;
  nationality: string;
  photo: string;
  dob?: string;
  heightCm?: number;
  bio?: string;
  bioEn?: string;
  bioCredit?: string | null;
  imageCredit?: string | null;
};

export type LocalStanding = {
  teamId: number;
  teamName: string;
  group?: string;
  position: number;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type LocalGroup = {
  letter: string;
  standings: LocalStanding[];
};

/** 3e de poule dans le classement transversal des meilleurs troisièmes */
export type LocalBestThird = {
  rank: number;
  /** Lettre de poule d’origine (A–L) */
  group: string;
  /** Créneau knockout FIFA, ex. `3A`, `3I` */
  key: string;
  teamId: number;
  teamName: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  /** Top 8 qualifiés en 1/16e */
  inQualifyingZone: boolean;
};

export type GroupsFile = {
  groups: LocalGroup[];
  bestThirds: LocalBestThird[];
};

export type LocalFixture = {
  id: number;
  date: string;
  timezone: string;
  venue: { name: string; city: string };
  venueImage?: string | null;
  round: string;
  group: string | null;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  goals: { home: number | null; away: number | null };
  status: string;
};

export type StatEntry = {
  playerId: number;
  name: string;
  teamId: number;
  teamName: string;
  teamCode?: string;
  flag?: string;
  teamLogo?: string;
  photo?: string;
  goals?: number;
  penalties?: number;
  assists?: number;
  appearances?: number;
  yellowCards?: number;
  redCards?: number;
  /** Suspension en cours (rouge ou 2e jaune) */
  suspended?: boolean;
  /** 1 jaune accumulé — prochain jaune = suspension */
  suspensionRisk?: boolean;
};

export type LocalCards = {
  yellow: StatEntry[];
  red: StatEntry[];
};

export type LocalStatistics = {
  updatedAt: string;
  tournament: string;
  suspended: {
    playerId: number;
    name: string;
    teamId: number;
    teamName: string;
    teamCode?: string;
    reason: string;
    flag?: string;
    teamLogo?: string;
    photo?: string;
    suspendedSince?: string;
    suspendedSinceMatch?: string;
    missesMatch?: string;
    missesMatchDate?: string;
    returnsMatch?: string;
    returnsMatchDate?: string;
    active?: boolean;
  }[];
};

export type StatisticsViewData = {
  topScorers: StatEntry[];
  topAssists: StatEntry[];
  topYellowCards: StatEntry[];
  topRedCards: StatEntry[];
  suspended: LocalStatistics["suspended"];
  updatedAt: string;
  evolution?: StatsEvolutionPoint[];
};

export type StatsEvolutionPoint = {
  label: string;
  date: string;
  matchNumber: number;
  dateLabel?: string;
  totalGoals: number;
  totalYellowCards: number;
  totalRedCards: number;
  topScorer?: { name: string; goals: number };
};

export type PositionGroup =
  | "Gardiens"
  | "Défenseurs"
  | "Milieux"
  | "Attaquants"
  | "Autres";

export type SquadPlayer = LocalPlayer & {
  positionGroup: PositionGroup;
};
