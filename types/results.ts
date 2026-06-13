/** Source de vérité — data/results.json */

export type ResultEventType = "goal" | "yellow_card" | "red_card";

export type ResultEvent = {
  type: ResultEventType;
  /** Nom d'équipe (ex. « Canada ») */
  team: string;
  player: string;
  minute: number;
  addedTime?: number;
  assist?: string;
  isOwnGoal?: boolean;
};

export type MatchResultStatus =
  | "NS"
  | "HT"
  | "FT"
  | "LIVE"
  | "AET"
  | "PEN"
  | "PST"
  | "CANC";

export type MatchResult = {
  matchId: number;
  status: MatchResultStatus;
  events: ResultEvent[];
  updatedAt: string;
};

export type MatchResultComputed = MatchResult & {
  homeScore: number;
  awayScore: number;
};

export type TournamentResultsFile = {
  version: number;
  updatedAt: string;
  matches: MatchResult[];
};
