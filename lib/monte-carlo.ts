import { getThirdPlayedByWinner, scenarioIncludesGroup } from "@/lib/scenarios-team";
import { SENEGAL_GROUP } from "@/lib/constants";
import type { Group, MonteCarloParams, MonteCarloResult, Scenario } from "@/types";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function runMonteCarloSimulation(
  scenarios: Scenario[],
  params: MonteCarloParams
): MonteCarloResult {
  const rng = mulberry32(params.seed ?? Date.now());
  const favoriteGroup =
    params.favoriteGroup ??
    (params.senegalBias != null ? SENEGAL_GROUP : undefined);
  const bias = params.favoriteGroupBias ?? params.senegalBias ?? 0;

  const opponentCounts: Record<string, number> = {};
  const groupCounts = Object.fromEntries(
    "ABCDEFGHIJKL".split("").map((g) => [g, 0])
  ) as Record<Group, number>;
  let favoriteQualified = 0;

  for (let i = 0; i < params.iterations; i++) {
    let scenario;
    if (favoriteGroup && bias > 0) {
      const favoriteScenarios = scenarios.filter((s) =>
        scenarioIncludesGroup(s, favoriteGroup)
      );
      const useFavorite = rng() < Math.min(bias, 1);
      const pool = useFavorite ? favoriteScenarios : scenarios;
      scenario = pool[Math.floor(rng() * pool.length)];
    } else {
      scenario = scenarios[Math.floor(rng() * scenarios.length)];
    }

    if (favoriteGroup && scenarioIncludesGroup(scenario, favoriteGroup)) {
      favoriteQualified++;
    } else if (!favoriteGroup && scenario.includesSenegalGroup) {
      favoriteQualified++;
    }

    for (const g of scenario.qualifiedThirdPlaceGroups) {
      groupCounts[g]++;
    }

    if (favoriteGroup) {
      const thirdBy = getThirdPlayedByWinner(scenario, favoriteGroup);
      if (thirdBy) {
        opponentCounts[thirdBy] = (opponentCounts[thirdBy] ?? 0) + 1;
      }
    } else if (scenario.thirdIPlayedBy) {
      opponentCounts[scenario.thirdIPlayedBy] =
        (opponentCounts[scenario.thirdIPlayedBy] ?? 0) + 1;
    }
  }

  const topOpponents = Object.entries(opponentCounts)
    .map(([opponent, count]) => ({
      opponent,
      count,
      probability: count / params.iterations,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const rate = favoriteQualified / params.iterations;

  return {
    iterations: params.iterations,
    opponentCounts,
    groupCounts,
    senegalQualifiedRate: rate,
    favoriteGroupQualifiedRate: rate,
    topOpponents,
  };
}
