import { describe, it, expect } from "vitest";
import { computeScenarioStats } from "./scenarios";
import { loadScenariosFromThirdTableSource } from "@/lib/scenarios/test-data";

describe("scenarios", () => {
  const all = loadScenariosFromThirdTableSource();

  it("loads 495 scenarios with FIFA mappings", () => {
    expect(all.length).toBe(495);
    expect(all.every((s) => s.mappings.length === 8)).toBe(true);
  });

  it("has 330 Senegal scenarios", () => {
    const senegal = all.filter((s) => s.includesSenegalGroup);
    expect(senegal.length).toBe(330);
    expect(senegal.every((s) => s.includesSenegalGroup)).toBe(true);
  });

  it("computes consistent stats", () => {
    const stats = computeScenarioStats(all);
    expect(stats.totalScenarios).toBe(495);
    expect(stats.senegalScenarios).toBe(330);
    expect(stats.nonSenegalScenarios).toBe(165);
  });

  it("first lex scenario maps to FIFA 495 (A-H)", () => {
    const first = all[0];
    expect(first.qualifiedThirdPlaceGroups.join("")).toContain("A");
    expect(first.fifaNumber).toBe(495);
  });
});
