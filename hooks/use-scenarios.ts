"use client";

import { useMemo } from "react";
import { useTeamContext } from "@/context/team-context";
import { useScenariosContext } from "@/context/scenarios-context";
import { filterScenarios } from "@/lib/scenarios";
import type { FilterState } from "@/types";

/** @deprecated Préférer useFavoriteScenarios pour l'équipe du header */
export function useScenarios(filters?: Partial<FilterState>) {
  const { favoriteGroup, stats: favoriteStats } = useTeamContext();
  const { all, stats: globalStats, filter } = useScenariosContext();

  const filtered = useMemo(() => {
    if (!filters) return all;
    return filter(all, {
      search: filters.search,
      includesGroupI: filters.includesGroupI ?? undefined,
      favoriteGroup: filters.includesGroupI != null ? favoriteGroup : undefined,
      groups: filters.groups,
      opponent: filters.opponent,
    });
  }, [all, filter, filters, favoriteGroup]);

  const senegal = useMemo(
    () => all.filter((s) => s.includesSenegalGroup),
    [all]
  );

  return {
    all,
    senegal,
    stats: globalStats,
    favoriteStats,
    filtered,
  };
}

export { filterScenarios };
