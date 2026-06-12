"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { computeScenarioStatsForGroup } from "@/lib/scenarios-team";
import {
  getDefaultFavoriteTeam,
  getSelectableTeamById,
  STORAGE_KEY,
  teamGroupLetter,
} from "@/lib/teams-selection";
import { useScenariosContext } from "@/context/scenarios-context";
import { useIsClient } from "@/hooks/use-is-client";
import type { Group } from "@/types";
import type { FavoriteScenarioStats, SelectableTeam } from "@/types/team-selection";

type TeamContextValue = {
  selectableTeams: SelectableTeam[];
  selectedTeam: SelectableTeam;
  favoriteGroup: Group | null;
  setSelectedTeamId: (id: number) => void;
  favoriteScenarios: ReturnType<typeof useScenariosContext>["all"];
  stats: FavoriteScenarioStats;
  isReady: boolean;
};

const TeamContext = createContext<TeamContextValue | null>(null);

function subscribeFavoriteTeam(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getFavoriteTeamIdSnapshot(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const id = Number(JSON.parse(raw));
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

type TeamProviderProps = {
  children: ReactNode;
  selectableTeams: SelectableTeam[];
};

export function TeamProvider({ children, selectableTeams }: TeamProviderProps) {
  const { all: allScenarios, getScenariosForGroup } = useScenariosContext();
  const storedId = useSyncExternalStore(
    subscribeFavoriteTeam,
    getFavoriteTeamIdSnapshot,
    () => null
  );
  const isReady = useIsClient();

  const storedTeam = useMemo(() => {
    if (storedId == null) return null;
    return getSelectableTeamById(storedId, selectableTeams);
  }, [storedId, selectableTeams]);

  const [pickedTeam, setPickedTeam] = useState<SelectableTeam | null>(null);

  const selectedTeam =
    pickedTeam ??
    storedTeam ??
    getDefaultFavoriteTeam(selectableTeams);

  const setSelectedTeamId = useCallback(
    (id: number) => {
      const team = getSelectableTeamById(id, selectableTeams);
      if (!team) return;
      setPickedTeam(team);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(id));
      } catch {
        /* ignore */
      }
    },
    [selectableTeams]
  );

  const favoriteGroup = teamGroupLetter(selectedTeam);

  const favoriteScenarios = useMemo(
    () => (favoriteGroup ? getScenariosForGroup(favoriteGroup) : []),
    [favoriteGroup, getScenariosForGroup]
  );

  const stats = useMemo(() => {
    if (!favoriteGroup) {
      return {
        totalScenarios: 495,
        favoriteScenarios: 0,
        nonFavoriteScenarios: 495,
        groupFrequencies: Object.fromEntries(
          "ABCDEFGHIJKL".split("").map((g) => [g, 0])
        ) as FavoriteScenarioStats["groupFrequencies"],
        opponentFrequencies: {},
        favoriteOpponentFrequencies: {},
        heatmap: {},
      } satisfies FavoriteScenarioStats;
    }
    return computeScenarioStatsForGroup(allScenarios, favoriteGroup);
  }, [favoriteGroup, allScenarios]);

  const value = useMemo(
    () => ({
      selectableTeams,
      selectedTeam,
      favoriteGroup,
      setSelectedTeamId,
      favoriteScenarios,
      stats,
      isReady,
    }),
    [
      selectableTeams,
      selectedTeam,
      favoriteGroup,
      setSelectedTeamId,
      favoriteScenarios,
      stats,
      isReady,
    ]
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeamContext(): TeamContextValue {
  const ctx = useContext(TeamContext);
  if (!ctx) {
    throw new Error("useTeamContext must be used within TeamProvider");
  }
  return ctx;
}

export function useTeamContextSafe(): TeamContextValue | null {
  return useContext(TeamContext);
}
