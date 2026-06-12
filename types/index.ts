export type Group = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L";

export type WinnerSlot = "1A" | "1B" | "1D" | "1E" | "1G" | "1I" | "1K" | "1L";

export type Mapping = {
  winner: WinnerSlot;
  opponent: string;
  opponentGroup: Group;
};

export type Scenario = {
  id: number;
  fifaNumber: number;
  qualifiedThirdPlaceGroups: Group[];
  excludedGroups: Group[];
  mappings: Mapping[];
  includesSenegalGroup: boolean;
  winner1IOpponent: string | null;
  thirdIPlayedBy: WinnerSlot | null;
  senegalRoundOf32Opponent: string | null;
};

export type ScenarioStats = {
  totalScenarios: number;
  senegalScenarios: number;
  nonSenegalScenarios: number;
  groupFrequencies: Record<Group, number>;
  opponentFrequencies: Record<string, number>;
  senegalOpponentFrequencies: Record<string, number>;
  heatmap: Record<string, Record<string, number>>;
};

export type MonteCarloParams = {
  iterations: number;
  /** @deprecated use favoriteGroupBias */
  senegalBias?: number;
  favoriteGroupBias?: number;
  favoriteGroup?: Group;
  seed?: number;
};

export type MonteCarloResult = {
  iterations: number;
  opponentCounts: Record<string, number>;
  groupCounts: Record<Group, number>;
  /** @deprecated use favoriteGroupQualifiedRate */
  senegalQualifiedRate: number;
  favoriteGroupQualifiedRate: number;
  topOpponents: { opponent: string; count: number; probability: number }[];
};

export type ExportFormat = "csv" | "json" | "xlsx" | "pdf";

export type FilterState = {
  search: string;
  includesGroupI: boolean | null;
  groups: Group[];
  opponent: string;
};
