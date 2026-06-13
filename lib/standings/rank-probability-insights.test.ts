import { describe, it, expect } from "vitest";
import {
  explainRankProbabilityInversion,
  findRankProbabilityInversions,
  isStandingsOrderSportValid,
} from "./rank-probability-insights";
import type { GroupStanding } from "@/types/worldcup";
import type { TeamQualificationProbs } from "@/types/qualification";

function row(
  id: number,
  name: string,
  points: number,
  gd: number,
  gf: number
): GroupStanding {
  return {
    position: 0,
    team: { id, name, code: name.slice(0, 2).toUpperCase(), country: name, logo: "" },
    played: 1,
    won: points === 3 ? 1 : 0,
    draw: points === 1 ? 1 : 0,
    lost: points === 0 ? 1 : 0,
    goalsFor: gf,
    goalsAgainst: gf - gd,
    goalDifference: gd,
    points,
  };
}

describe("rank-probability-insights", () => {
  it("detects when a lower-ranked team has higher qualification probability", () => {
    const standings = [row(1, "Mexique", 3, 2, 2), row(2, "Corée du Sud", 0, -2, 0)];
    const teamProbs: Record<number, TeamQualificationProbs> = {
      1: { teamId: 1, first: 50, second: 28, third: 1, total: 78.9, likelyPath: "first" },
      2: { teamId: 2, first: 20, second: 40, third: 39, total: 99, likelyPath: "second" },
    };

    const inversions = findRankProbabilityInversions(standings, teamProbs);
    expect(inversions).toHaveLength(1);
    expect(inversions[0].aheadTeam.name).toBe("Mexique");
    expect(inversions[0].behindTeam.name).toBe("Corée du Sud");
    expect(explainRankProbabilityInversion(inversions[0])).toContain("Corée du Sud");
    expect(explainRankProbabilityInversion(inversions[0])).toContain("probabilité de qualification");
  });

  it("validates sport ordering by points", () => {
    const standings = [row(1, "A", 6, 3, 5), row(2, "B", 3, 0, 2)];
    expect(isStandingsOrderSportValid(standings)).toBe(true);
  });
});
