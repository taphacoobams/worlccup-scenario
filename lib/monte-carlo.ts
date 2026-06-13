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

type MonteCarloAccumulator = {
  opponentCounts: Record<string, number>;
  groupCounts: Record<Group, number>;
  favoriteQualified: number;
  completed: number;
};

function createAccumulator(): MonteCarloAccumulator {
  return {
    opponentCounts: {},
    groupCounts: Object.fromEntries(
      "ABCDEFGHIJKL".split("").map((g) => [g, 0])
    ) as Record<Group, number>,
    favoriteQualified: 0,
    completed: 0,
  };
}

function runIterations(
  scenarios: Scenario[],
  params: MonteCarloParams,
  rng: () => number,
  count: number,
  acc: MonteCarloAccumulator
) {
  const favoriteGroup =
    params.favoriteGroup ??
    (params.senegalBias != null ? SENEGAL_GROUP : undefined);
  const bias = params.favoriteGroupBias ?? params.senegalBias ?? 0;
  const favoriteScenarios =
    favoriteGroup && bias > 0
      ? scenarios.filter((s) => scenarioIncludesGroup(s, favoriteGroup))
      : null;

  for (let i = 0; i < count; i++) {
    let scenario;
    if (favoriteScenarios && favoriteScenarios.length > 0) {
      const useFavorite = rng() < Math.min(bias, 1);
      const pool = useFavorite ? favoriteScenarios : scenarios;
      scenario = pool[Math.floor(rng() * pool.length)];
    } else {
      scenario = scenarios[Math.floor(rng() * scenarios.length)];
    }

    if (favoriteGroup && scenarioIncludesGroup(scenario, favoriteGroup)) {
      acc.favoriteQualified++;
    } else if (!favoriteGroup && scenario.includesSenegalGroup) {
      acc.favoriteQualified++;
    }

    for (const g of scenario.qualifiedThirdPlaceGroups) {
      acc.groupCounts[g]++;
    }

    if (favoriteGroup) {
      const thirdBy = getThirdPlayedByWinner(scenario, favoriteGroup);
      if (thirdBy) {
        acc.opponentCounts[thirdBy] = (acc.opponentCounts[thirdBy] ?? 0) + 1;
      }
    } else if (scenario.thirdIPlayedBy) {
      acc.opponentCounts[scenario.thirdIPlayedBy] =
        (acc.opponentCounts[scenario.thirdIPlayedBy] ?? 0) + 1;
    }

    acc.completed++;
  }
}

function finalizeResult(
  acc: MonteCarloAccumulator,
  iterations: number
): MonteCarloResult {
  const topOpponents = Object.entries(acc.opponentCounts)
    .map(([opponent, count]) => ({
      opponent,
      count,
      probability: count / iterations,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const rate = acc.favoriteQualified / iterations;

  return {
    iterations,
    opponentCounts: acc.opponentCounts,
    groupCounts: acc.groupCounts,
    senegalQualifiedRate: rate,
    favoriteGroupQualifiedRate: rate,
    topOpponents,
  };
}

export function runMonteCarloSimulation(
  scenarios: Scenario[],
  params: MonteCarloParams
): MonteCarloResult {
  const rng = mulberry32(params.seed ?? Date.now());
  const acc = createAccumulator();
  runIterations(scenarios, params, rng, params.iterations, acc);
  return finalizeResult(acc, params.iterations);
}

export type MonteCarloProgressOptions = {
  chunkSize?: number;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
};

/** Simulation par lots — permet une barre de progression animée côté client */
export async function runMonteCarloSimulationAsync(
  scenarios: Scenario[],
  params: MonteCarloParams,
  options: MonteCarloProgressOptions = {}
): Promise<MonteCarloResult | null> {
  const chunkSize = options.chunkSize ?? Math.max(500, Math.floor(params.iterations / 80));
  const rng = mulberry32(params.seed ?? Date.now());
  const acc = createAccumulator();

  while (acc.completed < params.iterations) {
    if (options.signal?.aborted) return null;

    const remaining = params.iterations - acc.completed;
    runIterations(scenarios, params, rng, Math.min(chunkSize, remaining), acc);
    options.onProgress?.(acc.completed / params.iterations);

    await new Promise<void>((resolve) => {
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => resolve());
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  options.onProgress?.(1);
  return finalizeResult(acc, params.iterations);
}
