import { TOTAL_SCENARIOS, SCENARIOS_WITH_GROUP, SCENARIOS_WITHOUT_GROUP } from "@/lib/constants";
import type { Group, Scenario } from "@/types";
import type { FavoriteScenarioStats } from "@/types/team-selection";

export function scenarioIncludesGroup(scenario: Scenario, group: Group): boolean {
  return scenario.qualifiedThirdPlaceGroups.includes(group);
}

export function getScenariosForGroup(all: Scenario[], group: Group): Scenario[] {
  return all.filter((s) => scenarioIncludesGroup(s, group));
}

export function getThirdPlayedByWinner(
  scenario: Scenario,
  group: Group
): string | null {
  const mapping = scenario.mappings.find((m) => m.opponentGroup === group);
  return mapping?.winner ?? null;
}

export function getFavoriteRoundOf32Opponent(
  scenario: Scenario,
  group: Group
): string | null {
  if (!scenarioIncludesGroup(scenario, group)) return null;
  const thirdBy = getThirdPlayedByWinner(scenario, group);
  if (thirdBy) return `3${group} → ${thirdBy}`;
  const winnerSlot = `1${group}` as const;
  return scenario.mappings.find((m) => m.winner === winnerSlot)?.opponent ?? null;
}

export function computeScenarioStatsForGroup(
  all: Scenario[],
  group: Group
): FavoriteScenarioStats {
  const favorite = all.filter((s) => scenarioIncludesGroup(s, group));

  const groupFrequencies = Object.fromEntries(
    "ABCDEFGHIJKL".split("").map((g) => [g, 0])
  ) as Record<Group, number>;

  const opponentFrequencies: Record<string, number> = {};
  const favoriteOpponentFrequencies: Record<string, number> = {};
  const heatmap: Record<string, Record<string, number>> = {};

  for (const s of all) {
    for (const g of s.qualifiedThirdPlaceGroups) {
      groupFrequencies[g]++;
    }
    for (const m of s.mappings) {
      opponentFrequencies[m.opponent] = (opponentFrequencies[m.opponent] ?? 0) + 1;
      if (!heatmap[m.winner]) heatmap[m.winner] = {};
      heatmap[m.winner][m.opponentGroup] =
        (heatmap[m.winner][m.opponentGroup] ?? 0) + 1;
    }
    if (scenarioIncludesGroup(s, group)) {
      const thirdBy = getThirdPlayedByWinner(s, group);
      if (thirdBy) {
        favoriteOpponentFrequencies[thirdBy] =
          (favoriteOpponentFrequencies[thirdBy] ?? 0) + 1;
      }
    }
  }

  return {
    totalScenarios: TOTAL_SCENARIOS,
    favoriteScenarios: favorite.length,
    nonFavoriteScenarios: all.length - favorite.length,
    groupFrequencies,
    opponentFrequencies,
    favoriteOpponentFrequencies,
    heatmap,
  };
}

export { SCENARIOS_WITH_GROUP, SCENARIOS_WITHOUT_GROUP };
