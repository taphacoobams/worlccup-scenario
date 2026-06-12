import type { Group } from "@/types";

/** Équipe sélectionnable dans le header (depuis teams.json) */
export type SelectableTeam = {
  id: number;
  name: string;
  code: string;
  country: string;
  group: string | null;
};

export type FavoriteScenarioStats = {
  totalScenarios: number;
  favoriteScenarios: number;
  nonFavoriteScenarios: number;
  groupFrequencies: Record<Group, number>;
  opponentFrequencies: Record<string, number>;
  favoriteOpponentFrequencies: Record<string, number>;
  heatmap: Record<string, Record<string, number>>;
};
