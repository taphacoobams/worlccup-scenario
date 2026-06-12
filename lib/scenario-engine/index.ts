import type { LocalFixture, LocalStanding, LocalTeam } from "@/types/data";
import type { Group, Scenario } from "@/types";
import { buildScenarioDataContext } from "@/lib/scenario-engine/team-strength";
import { enrichAllScenarios } from "@/lib/scenario-engine/enrich-scenario";
import type { EnrichedScenario } from "@/lib/scenario-engine/types";

let cachedEnriched: EnrichedScenario[] | null = null;
let cacheKey = "";

export function generateScenarios(
  baseScenarios: Scenario[],
  teams: LocalTeam[],
  standings: LocalStanding[],
  fixtures: LocalFixture[],
  favoriteTeam: LocalTeam | null,
  favoriteGroup: Group | null
): EnrichedScenario[] {
  const key = `${favoriteTeam?.id ?? 0}-${favoriteGroup ?? "x"}-${standings.length}-${fixtures.length}`;
  if (cachedEnriched && cacheKey === key) return cachedEnriched;

  const ctx = buildScenarioDataContext(teams, standings, fixtures);
  cachedEnriched = enrichAllScenarios(baseScenarios, ctx, favoriteTeam, favoriteGroup);
  cacheKey = key;
  return cachedEnriched;
}

export { calculateRawProbability, confidenceFromScore } from "@/lib/scenario-engine/calculate-probability";
export { rankScenarios, filterEnrichedScenarios } from "@/lib/scenario-engine/rank-scenarios";
export { getBestScenariosForTeam, computeTeamScenarioSummary } from "@/lib/scenario-engine/get-best-for-team";
export { buildScenarioDataContext } from "@/lib/scenario-engine/team-strength";
export type * from "@/lib/scenario-engine/types";
