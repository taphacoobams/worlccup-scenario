import type { Group } from "@/types";
import type { Team } from "@/types/worldcup";

export type QualificationPath = "first" | "second" | "third" | "eliminated";

export type TeamQualificationProbs = {
  teamId: number;
  first: number;
  second: number;
  third: number;
  total: number;
  likelyPath: QualificationPath;
};

export type BestThirdEntry = {
  rank: number;
  group: Group;
  team: Team;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  qualifiesProbability: number;
  groupScenarioRate: number;
  inQualifyingZone: boolean;
};

export type GroupQualificationSummary = {
  group: Group;
  groupName: string;
  teamProbs: Map<number, TeamQualificationProbs>;
  thirdPlaceScenarioRate: number;
};
