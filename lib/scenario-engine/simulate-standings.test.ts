import { describe, expect, it } from "vitest";
import { loadScenariosFromThirdTableSource } from "@/lib/scenarios/test-data";
import { buildScenarioDataContext } from "@/lib/scenario-engine/team-strength";
import { getSimulatedStandingsByGroup } from "@/lib/scenario-engine/simulate-standings";
import teamsJson from "@/data/teams.json";
import groupsJson from "@/data/groups.json";
import fixturesJson from "@/data/fixtures.json";
import { parseGroupsFile } from "@/lib/data/groups-file";
import { standingsFromGroups } from "@/lib/data/standings-from-groups";

describe("simulate-standings", () => {
  const ctx = buildScenarioDataContext(
    teamsJson as never,
    standingsFromGroups(parseGroupsFile(groupsJson).groups),
    fixturesJson as never
  );

  it("generates non-zero points per scenario", () => {
    const scenario = loadScenariosFromThirdTableSource()[100]!;
    const byGroup = getSimulatedStandingsByGroup(scenario, ctx);
    const groupI = byGroup.get("I")!;
    expect(groupI.every((r) => r.played === 3)).toBe(true);
    expect(groupI.some((r) => r.points > 0)).toBe(true);
    expect(new Set(groupI.map((r) => r.points)).size).toBeGreaterThan(1);
  });

  it("qualified thirds rank above excluded ones", () => {
    const scenario = loadScenariosFromThirdTableSource()[0]!;
    const byGroup = getSimulatedStandingsByGroup(scenario, ctx);
    const qualifiedPts = scenario.qualifiedThirdPlaceGroups.map((g) => {
      const third = byGroup.get(g)!.find((r) => r.position === 3)!;
      return third.points * 100 + third.goalDifference;
    });
    const excluded = scenario.excludedGroups.map((g) => {
      const third = byGroup.get(g)!.find((r) => r.position === 3)!;
      return third.points * 100 + third.goalDifference;
    });
    const minQ = Math.min(...qualifiedPts);
    const maxE = Math.max(...excluded);
    expect(minQ).toBeGreaterThan(maxE);
  });
});
