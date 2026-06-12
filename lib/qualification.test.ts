import { describe, it, expect } from "vitest";
import {
  buildBestThirdsRanking,
  buildOfficialGroups,
  computeTeamQualificationProbs,
  getGroupThirdScenarioRate,
} from "./qualification";
import { computeScenarioStats } from "@/lib/scenarios";
import { loadScenariosFromThirdTableSource } from "@/lib/scenarios/test-data";
import { SENEGAL_SCENARIOS, TOTAL_SCENARIOS } from "@/lib/constants";

describe("qualification", () => {
  const stats = computeScenarioStats(loadScenariosFromThirdTableSource());

  it("group I scenario rate is 330/495", () => {
    const rate = getGroupThirdScenarioRate("I", stats.groupFrequencies);
    expect(rate).toBeCloseTo((SENEGAL_SCENARIOS / TOTAL_SCENARIOS) * 100, 0);
  });

  it("builds 12 best thirds entries", async () => {
    const groups = await buildOfficialGroups();
    const ranking = buildBestThirdsRanking(groups, stats.groupFrequencies);
    expect(ranking).toHaveLength(12);
    expect(ranking[0].rank).toBe(1);
    expect(ranking[7].inQualifyingZone).toBe(true);
    expect(ranking[8].inQualifyingZone).toBe(false);
  });

  it("computes third-place qualification probs for group I", async () => {
    const groups = await buildOfficialGroups();
    const groupI = groups.find((g) => g.name === "Groupe I")!;
    const scenarioRate = getGroupThirdScenarioRate("I", stats.groupFrequencies);
    expect(scenarioRate).toBeCloseTo(66.7, 0);
    const thirdRow = groupI.standings[2];
    const probs = computeTeamQualificationProbs(
      thirdRow,
      groupI.standings,
      3,
      scenarioRate
    );
    expect(probs.third).toBeGreaterThan(0);
  });
});
