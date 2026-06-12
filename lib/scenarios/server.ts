import "server-only";

import { cache } from "react";
import { getFifaMappingRows } from "@/lib/data/fifa-mappings";
import { buildAllScenarios } from "@/lib/scenarios/build";
import type { Group, Scenario, ScenarioStats } from "@/types";
import { computeScenarioStats, filterScenarios } from "@/lib/scenarios";

export const getAllScenarios = cache(async (): Promise<Scenario[]> => {
  const rows = await getFifaMappingRows();
  return buildAllScenarios(rows);
});

export async function getSenegalScenarios(): Promise<Scenario[]> {
  const all = await getAllScenarios();
  return all.filter((s) => s.includesSenegalGroup);
}

export async function getScenarioById(id: number): Promise<Scenario | undefined> {
  const all = await getAllScenarios();
  return all.find((s) => s.id === id);
}

export async function getScenarioStats(): Promise<ScenarioStats> {
  return computeScenarioStats(await getAllScenarios());
}

export async function getGroupThirdScenarioRate(group: Group): Promise<number> {
  const stats = await getScenarioStats();
  return (stats.groupFrequencies[group] / stats.totalScenarios) * 100;
}

export { filterScenarios };
