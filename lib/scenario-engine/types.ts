import type { Group, Scenario } from "@/types";

export type ProbabilityConfidence =
  | "very-likely"
  | "likely"
  | "possible"
  | "unlikely"
  | "very-unlikely";

export type StandingOutcome = "qualified" | "eliminated" | "playoff" | "third-chance";

export type ScenarioStandingRow = {
  teamId: number;
  name: string;
  code: string;
  flag: string;
  position: number;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  goalDifference: number;
  fifaRanking?: number;
  outcome: StandingOutcome;
};

export type GroupSnapshot = {
  group: Group;
  rows: ScenarioStandingRow[];
  thirdQualifiesInScenario: boolean;
  /** true = points projetés (pas encore de résultats réels) */
  simulated: boolean;
};

export type FavoriteScenarioImpact = {
  teamId: number;
  teamName: string;
  group: Group;
  position: number;
  thirdQualifies: boolean;
  reachesRoundOf16: boolean;
  favorabilityScore: number;
  likelyPath: "first" | "second" | "third" | "eliminated";
  roundOf32Opponent: string | null;
};

export type EnrichedScenario = {
  scenario: Scenario;
  probabilityScore: number;
  confidence: ProbabilityConfidence;
  confidenceLabel: string;
  favoriteImpact: FavoriteScenarioImpact | null;
  favoriteGroupSnapshot: GroupSnapshot | null;
  qualifiedThirdGroups: Group[];
  tags: ScenarioTag[];
};

export type ScenarioTag =
  | "qualification"
  | "elimination"
  | "draw-heavy"
  | "upset"
  | "best-for-team";

export type ScenarioSortMode =
  | "most-likely"
  | "least-likely"
  | "best-for-team"
  | "id"
  | "fifa";

export type ScenarioFilterMode =
  | "all"
  | "qualification"
  | "elimination"
  | "draw-heavy"
  | "upsets"
  | "best-for-team";

export type TeamScenarioSummaryStats = {
  teamId: number;
  teamName: string;
  group: Group | null;
  qualificationPercent: number;
  firstPlacePercent: number;
  secondPlacePercent: number;
  eliminationPercent: number;
  roundOf16Percent: number;
  scenariosWithThirdQualify: number;
  totalScenarios: number;
};

export type ScenarioDataContext = {
  teamsById: Map<number, import("@/types/data").LocalTeam>;
  standingsByGroup: Map<Group, import("@/types/data").LocalStanding[]>;
  teamStrength: Map<number, number>;
  groupThirdStrength: Map<Group, number>;
};
