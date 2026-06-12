import type { EnrichedScenario, TeamScenarioSummaryStats } from "@/lib/scenario-engine/types";
import type { Group } from "@/types";

export function getBestScenariosForTeam(
  scenarios: EnrichedScenario[],
  limit = 8
): EnrichedScenario[] {
  return [...scenarios]
    .filter((e) => e.favoriteImpact && e.favoriteImpact.favorabilityScore >= 50)
    .sort((a, b) => {
      const fa = a.favoriteImpact!.favorabilityScore;
      const fb = b.favoriteImpact!.favorabilityScore;
      if (fb !== fa) return fb - fa;
      return b.probabilityScore - a.probabilityScore;
    })
    .slice(0, limit);
}

export function computeTeamScenarioSummary(
  scenarios: EnrichedScenario[],
  teamId: number,
  teamName: string,
  group: Group | null
): TeamScenarioSummaryStats {
  const total = scenarios.length;
  if (!group || total === 0) {
    return {
      teamId,
      teamName,
      group,
      qualificationPercent: 0,
      firstPlacePercent: 0,
      secondPlacePercent: 0,
      eliminationPercent: 0,
      roundOf16Percent: 0,
      scenariosWithThirdQualify: 0,
      totalScenarios: total,
    };
  }

  let thirdQualify = 0;
  let r16 = 0;
  let first = 0;
  let second = 0;
  let elim = 0;

  for (const e of scenarios) {
    const impact = e.favoriteImpact;
    if (!impact) continue;
    if (impact.thirdQualifies) thirdQualify++;
    if (impact.reachesRoundOf16) r16++;
    if (impact.likelyPath === "first") first++;
    else if (impact.likelyPath === "second") second++;
    else if (impact.likelyPath === "eliminated" || !impact.thirdQualifies) elim++;
  }

  const pct = (n: number) => Math.round((n / total) * 1000) / 10;

  return {
    teamId,
    teamName,
    group,
    qualificationPercent: pct(thirdQualify),
    firstPlacePercent: pct(first),
    secondPlacePercent: pct(second),
    eliminationPercent: pct(elim),
    roundOf16Percent: pct(r16),
    scenariosWithThirdQualify: thirdQualify,
    totalScenarios: total,
  };
}
