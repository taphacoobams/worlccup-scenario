import { describe, it, expect } from "vitest";
import {
  buildBestThirdsRanking,
  buildOfficialGroups,
  computeTeamQualificationProbs,
  getGroupThirdScenarioRate,
  sortStandingsByStats,
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

  it("differentiates qual % when group has points", () => {
    const standings = sortStandingsByStats([
      {
        position: 4,
        team: { id: 1, name: "Mexique", code: "MX", country: "Mexique", logo: "" },
        played: 1,
        won: 1,
        draw: 0,
        lost: 0,
        goalsFor: 2,
        goalsAgainst: 0,
        goalDifference: 2,
        points: 3,
      },
      {
        position: 1,
        team: { id: 2, name: "Afrique du Sud", code: "ZA", country: "Afrique du Sud", logo: "" },
        played: 1,
        won: 0,
        draw: 0,
        lost: 1,
        goalsFor: 0,
        goalsAgainst: 2,
        goalDifference: -2,
        points: 0,
      },
      {
        position: 2,
        team: { id: 3, name: "Corée du Sud", code: "KR", country: "Corée du Sud", logo: "" },
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
      {
        position: 3,
        team: { id: 4, name: "Tchéquie", code: "CZ", country: "Tchéquie", logo: "" },
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
    ]);

    const leader = standings[0];
    const last = standings[3];
    const leaderProb = computeTeamQualificationProbs(leader, standings, null, 40);
    const lastProb = computeTeamQualificationProbs(last, standings, null, 40);

    expect(leaderProb.total).toBeGreaterThan(lastProb.total + 15);
  });

  it("differentiates qual % at 0 pts using FIFA ranking", () => {
    const standings = sortStandingsByStats([
      {
        position: 1,
        team: {
          id: 17,
          name: "Allemagne",
          code: "DE",
          country: "Allemagne",
          fifaRanking: 10,
          logo: "",
        },
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
      {
        position: 2,
        team: {
          id: 19,
          name: "Côte d'Ivoire",
          code: "CI",
          country: "Côte d'Ivoire",
          fifaRanking: 34,
          logo: "",
        },
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
      {
        position: 3,
        team: {
          id: 20,
          name: "Équateur",
          code: "EC",
          country: "Équateur",
          fifaRanking: 24,
          logo: "",
        },
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
      {
        position: 4,
        team: {
          id: 18,
          name: "Curaçao",
          code: "CW",
          country: "Curaçao",
          fifaRanking: 83,
          logo: "",
        },
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
    ]);

    const scenarioRate = 66.7;
    const byId = Object.fromEntries(
      standings.map((row) => [
        row.team.id,
        computeTeamQualificationProbs(row, standings, null, scenarioRate),
      ])
    );

    expect(byId[17].total).toBeGreaterThan(byId[20].total);
    expect(byId[20].total).toBeGreaterThan(byId[19].total);
    expect(byId[17].total).toBeGreaterThan(byId[18].total + 25);
    expect(new Set(standings.map((r) => byId[r.team.id].total)).size).toBe(4);
  });
});
