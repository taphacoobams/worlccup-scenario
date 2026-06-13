"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  computeScenarioStats,
  filterScenarios,
} from "@/lib/scenarios";
import type { ScenarioEngineData } from "@/types/scenario-engine";
import type { Group, Scenario, ScenarioStats } from "@/types";

type ScenariosContextValue = {
  all: Scenario[];
  engineData: ScenarioEngineData;
  stats: ScenarioStats;
  getSenegalScenarios: () => Scenario[];
  getScenariosForGroup: (group: Group) => Scenario[];
  getScenarioById: (id: number) => Scenario | undefined;
  filter: typeof filterScenarios;
};

const ScenariosContext = createContext<ScenariosContextValue | null>(null);

export function ScenariosProvider({
  scenarios,
  engineData,
  children,
}: {
  scenarios: Scenario[];
  engineData: ScenarioEngineData;
  children: ReactNode;
}) {
  const value = useMemo<ScenariosContextValue>(() => {
    const stats = computeScenarioStats(scenarios);
    return {
      all: scenarios,
      engineData,
      stats,
      getSenegalScenarios: () =>
        scenarios.filter((s) => s.includesSenegalGroup),
      getScenariosForGroup: (group: Group) =>
        scenarios.filter((s) => s.qualifiedThirdPlaceGroups.includes(group)),
      getScenarioById: (id: number) => scenarios.find((s) => s.id === id),
      filter: (list, filters) => filterScenarios(list, filters),
    };
  }, [scenarios, engineData]);

  return (
    <ScenariosContext.Provider value={value}>{children}</ScenariosContext.Provider>
  );
}

export function useScenariosContext(): ScenariosContextValue {
  const ctx = useContext(ScenariosContext);
  if (!ctx) {
    throw new Error("useScenariosContext must be used within ScenariosProvider");
  }
  return ctx;
}
