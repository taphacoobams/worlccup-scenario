import type { Group } from "@/types";
import type { EnrichedScenario, ScenarioFilterMode, ScenarioSortMode } from "@/lib/scenario-engine/types";

export function rankScenarios(
  scenarios: EnrichedScenario[],
  sort: ScenarioSortMode,
  favoriteTeamId?: number
): EnrichedScenario[] {
  const list = [...scenarios];

  switch (sort) {
    case "most-likely":
      list.sort((a, b) => b.probabilityScore - a.probabilityScore);
      break;
    case "least-likely":
      list.sort((a, b) => a.probabilityScore - b.probabilityScore);
      break;
    case "best-for-team":
      list.sort((a, b) => {
        const fa = a.favoriteImpact?.favorabilityScore ?? 0;
        const fb = b.favoriteImpact?.favorabilityScore ?? 0;
        if (fb !== fa) return fb - fa;
        return b.probabilityScore - a.probabilityScore;
      });
      break;
    case "fifa":
      list.sort((a, b) => a.scenario.fifaNumber - b.scenario.fifaNumber);
      break;
    case "id":
    default:
      list.sort((a, b) => a.scenario.id - b.scenario.id);
  }

  if (favoriteTeamId && sort === "best-for-team") {
    return list;
  }

  return list;
}

export function filterEnrichedScenarios(
  scenarios: EnrichedScenario[],
  mode: ScenarioFilterMode,
  search: string,
  groups: Group[],
  favoriteGroup: Group | null
): EnrichedScenario[] {
  let list = scenarios;
  const q = search.trim().toLowerCase();

  if (mode === "qualification" && favoriteGroup) {
    list = list.filter((e) => e.favoriteImpact?.thirdQualifies);
  } else if (mode === "elimination" && favoriteGroup) {
    list = list.filter((e) => !e.favoriteImpact?.thirdQualifies);
  } else if (mode === "draw-heavy") {
    list = list.filter((e) => e.tags.includes("draw-heavy"));
  } else if (mode === "upsets") {
    list = list.filter((e) => e.tags.includes("upset"));
  } else if (mode === "best-for-team") {
    list = list.filter((e) => e.tags.includes("best-for-team"));
  }

  if (groups.length > 0) {
    list = list.filter((e) =>
      groups.every((g) => e.qualifiedThirdGroups.includes(g))
    );
  }

  if (q) {
    list = list.filter((e) => {
      const s = e.scenario;
      const snap = e.favoriteGroupSnapshot;
      const hay = [
        s.id,
        s.fifaNumber,
        s.qualifiedThirdPlaceGroups.join(","),
        snap?.rows.map((r) => `${r.name} ${r.points}`).join(" "),
        e.favoriteImpact?.roundOf32Opponent,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  return list;
}
