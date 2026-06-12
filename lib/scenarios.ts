import { SENEGAL_GROUP, ALL_GROUPS } from "@/lib/constants";
import type { Group, Scenario, ScenarioStats } from "@/types";

export { buildAllScenarios } from "@/lib/scenarios/build";

export function computeScenarioStats(all: Scenario[]): ScenarioStats {
  const senegal = all.filter((s) => s.includesSenegalGroup);

  const groupFrequencies = Object.fromEntries(
    ALL_GROUPS.map((g) => [g, 0])
  ) as Record<Group, number>;

  const opponentFrequencies: Record<string, number> = {};
  const senegalOpponentFrequencies: Record<string, number> = {};
  const heatmap: Record<string, Record<string, number>> = {};

  for (const s of all) {
    for (const g of s.qualifiedThirdPlaceGroups) {
      groupFrequencies[g]++;
    }
    for (const m of s.mappings) {
      const key = m.opponent;
      opponentFrequencies[key] = (opponentFrequencies[key] ?? 0) + 1;
      if (!heatmap[m.winner]) heatmap[m.winner] = {};
      heatmap[m.winner][m.opponentGroup] =
        (heatmap[m.winner][m.opponentGroup] ?? 0) + 1;
    }
    if (s.includesSenegalGroup && s.thirdIPlayedBy) {
      const opp = s.thirdIPlayedBy;
      senegalOpponentFrequencies[opp] = (senegalOpponentFrequencies[opp] ?? 0) + 1;
    }
  }

  return {
    totalScenarios: all.length,
    senegalScenarios: senegal.length,
    nonSenegalScenarios: all.length - senegal.length,
    groupFrequencies,
    opponentFrequencies,
    senegalOpponentFrequencies,
    heatmap,
  };
}

export function filterScenarios(
  scenarios: Scenario[],
  filters: {
    search?: string;
    includesGroupI?: boolean | null;
    favoriteGroup?: Group | null;
    groups?: Group[];
    opponent?: string;
  }
): Scenario[] {
  return scenarios.filter((s) => {
    if (filters.favoriteGroup) {
      const inc = s.qualifiedThirdPlaceGroups.includes(filters.favoriteGroup);
      if (filters.includesGroupI === true && !inc) return false;
      if (filters.includesGroupI === false && inc) return false;
    } else {
      if (filters.includesGroupI === true && !s.includesSenegalGroup) return false;
      if (filters.includesGroupI === false && s.includesSenegalGroup) return false;
    }

    if (filters.groups?.length) {
      const hasAll = filters.groups.every((g) =>
        s.qualifiedThirdPlaceGroups.includes(g)
      );
      if (!hasAll) return false;
    }

    if (filters.opponent) {
      const hasOpp = s.mappings.some(
        (m) =>
          m.opponent.includes(filters.opponent!) ||
          m.winner.includes(filters.opponent!)
      );
      if (!hasOpp) return false;
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = [
        s.id.toString(),
        s.fifaNumber.toString(),
        s.qualifiedThirdPlaceGroups.join(","),
        s.mappings.map((m) => `${m.winner}-${m.opponent}`).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}

/** @deprecated Utiliser useScenariosContext() côté client ou getAllScenarios() depuis lib/scenarios/server */
export function getSenegalScenariosFrom(all: Scenario[]): Scenario[] {
  return all.filter((s) => s.includesSenegalGroup);
}

export { SENEGAL_GROUP };
