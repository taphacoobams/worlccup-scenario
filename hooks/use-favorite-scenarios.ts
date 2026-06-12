"use client";

import { useMemo } from "react";
import { useTeamContext } from "@/context/team-context";
import { filterScenarios } from "@/lib/scenarios";
import type { FilterState } from "@/types";

/** Scénarios et stats liés à l'équipe sélectionnée dans le header */
export function useFavoriteScenarios(filters?: Partial<FilterState>) {
  const { favoriteGroup, favoriteScenarios, stats, selectedTeam } = useTeamContext();

  const filtered = useMemo(() => {
    if (!filters) return favoriteScenarios;
    return filterScenarios(favoriteScenarios, {
      search: filters.search,
      includesGroupI: filters.includesGroupI ?? undefined,
      favoriteGroup: filters.includesGroupI != null ? favoriteGroup : undefined,
      groups: filters.groups,
      opponent: filters.opponent,
    });
  }, [favoriteScenarios, favoriteGroup, filters]);

  return {
    selectedTeam,
    favoriteGroup,
    favoriteScenarios,
    stats,
    filtered,
  };
}
