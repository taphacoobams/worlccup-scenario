import type { Group, Scenario } from "@/types";
import type { LocalTeam } from "@/types/data";
import {
  buildScenarioTags,
  calculateRawProbability,
  computeFavoriteImpact,
  normalizeProbabilityScores,
} from "@/lib/scenario-engine/calculate-probability";
import type {
  EnrichedScenario,
  ScenarioDataContext,
} from "@/lib/scenario-engine/types";
import { buildGroupSnapshot } from "@/lib/scenario-engine/group-snapshot";

export function enrichScenario(
  scenario: Scenario,
  ctx: ScenarioDataContext,
  favoriteTeam: LocalTeam | null,
  favoriteGroup: Group | null
): EnrichedScenario {
  const rawScore = calculateRawProbability(scenario, ctx);
  const favoriteImpact =
    favoriteTeam && favoriteGroup
      ? computeFavoriteImpact(
          scenario,
          favoriteTeam.id,
          favoriteTeam.name,
          favoriteGroup,
          ctx
        )
      : null;

  const favoriteGroupSnapshot = favoriteGroup
    ? buildGroupSnapshot(scenario, favoriteGroup, ctx)
    : null;

  return {
    scenario,
    probabilityScore: rawScore,
    confidence: "possible",
    confidenceLabel: "Possible",
    favoriteImpact,
    favoriteGroupSnapshot,
    qualifiedThirdGroups: scenario.qualifiedThirdPlaceGroups,
    tags: [],
  };
}

export function enrichAllScenarios(
  scenarios: Scenario[],
  ctx: ScenarioDataContext,
  favoriteTeam: LocalTeam | null,
  favoriteGroup: Group | null
): EnrichedScenario[] {
  const draft = scenarios.map((s) =>
    enrichScenario(s, ctx, favoriteTeam, favoriteGroup)
  );

  const avgRaw =
    draft.reduce((sum, e) => sum + e.probabilityScore, 0) / draft.length;

  const withTags = draft.map((e) => ({
    ...e,
    tags: buildScenarioTags(
      e.scenario,
      e.probabilityScore,
      avgRaw,
      e.favoriteImpact,
      ctx
    ),
  }));

  return normalizeProbabilityScores(withTags);
}
