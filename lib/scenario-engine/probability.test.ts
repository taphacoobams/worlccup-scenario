import { describe, expect, it } from "vitest";
import { loadScenariosFromThirdTableSource } from "@/lib/scenarios/test-data";
import { buildScenarioDataContext } from "@/lib/scenario-engine/team-strength";
import { enrichAllScenarios } from "@/lib/scenario-engine/enrich-scenario";
import { confidenceFromScore } from "@/lib/scenario-engine/calculate-probability";
import teamsJson from "@/data/teams.json";
import groupsJson from "@/data/groups.json";
import fixturesJson from "@/data/fixtures.json";
import { parseGroupsFile } from "@/lib/data/groups-file";
import { standingsFromGroups } from "@/lib/data/standings-from-groups";

describe("scenario probability engine", () => {
  it("generates 495 enriched scenarios", () => {
    const standingsJson = standingsFromGroups(parseGroupsFile(groupsJson).groups);
    const ctx = buildScenarioDataContext(
      teamsJson as never,
      standingsJson as never,
      fixturesJson as never
    );
    const senegal = (teamsJson as { id: number; name: string; group: string }[]).find(
      (t) => t.id === 34
    )!;
    const enriched = enrichAllScenarios(
      loadScenariosFromThirdTableSource(),
      ctx,
      senegal as never,
      "I"
    );
    expect(enriched).toHaveLength(495);
    expect(enriched.every((e) => e.probabilityScore >= 0 && e.probabilityScore <= 100)).toBe(
      true
    );
  });

  it("maps confidence bands", () => {
    expect(confidenceFromScore(95).confidence).toBe("very-likely");
    expect(confidenceFromScore(40).confidence).toBe("unlikely");
  });
});
