"use client";

import { useMemo } from "react";
import { useScenariosContext } from "@/context/scenarios-context";
import { useTeamContext } from "@/context/team-context";
import { teamGroupLetter } from "@/lib/teams-selection";
import {
  computeTeamScenarioSummary,
  filterEnrichedScenarios,
  generateScenarios,
  getBestScenariosForTeam,
  rankScenarios,
} from "@/lib/scenario-engine";
import type {
  EnrichedScenario,
  ScenarioFilterMode,
  ScenarioSortMode,
} from "@/lib/scenario-engine/types";
import type { Group } from "@/types";

export function useEnrichedScenarios(
  sort: ScenarioSortMode = "most-likely",
  filterMode: ScenarioFilterMode = "all",
  search = "",
  selectedGroups: Group[] = []
) {
  const { all: baseScenarios, engineData } = useScenariosContext();
  const { selectedTeam } = useTeamContext();
  const favoriteGroup = teamGroupLetter(selectedTeam);

  const { all, best, summary } = useMemo(() => {
    const { teams, standings, fixtures } = engineData;
    const team = teams.find((t) => t.id === selectedTeam.id) ?? null;
    const enriched = generateScenarios(
      baseScenarios,
      teams,
      standings,
      fixtures,
      team,
      favoriteGroup
    );
    const filtered = filterEnrichedScenarios(
      enriched,
      filterMode,
      search,
      selectedGroups,
      favoriteGroup
    );
    const ranked = rankScenarios(filtered, sort, selectedTeam.id);
    const bestScenarios = getBestScenariosForTeam(enriched, 6);
    const summaryStats = computeTeamScenarioSummary(
      enriched,
      selectedTeam.id,
      selectedTeam.name,
      favoriteGroup
    );
    return { all: ranked, best: bestScenarios, summary: summaryStats };
  }, [
    baseScenarios,
    engineData,
    selectedTeam,
    favoriteGroup,
    sort,
    filterMode,
    search,
    selectedGroups,
  ]);

  return {
    scenarios: all,
    bestScenarios: best,
    summary,
    favoriteGroup,
    selectedTeam,
    total: 495,
  };
}

export type { EnrichedScenario };
