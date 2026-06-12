import { describe, expect, it } from "vitest";
import { createMatchEvent } from "@/lib/tournament-engine/events";
import { recalculateStatistics } from "@/lib/tournament-engine/statistics";
import type { WorldCupManualData } from "@/types/worldcup-manual";

const base: WorldCupManualData = {
  updatedAt: new Date().toISOString(),
  teams: [{ id: 1, name: "Sénégal", code: "SEN" }],
  groups: [],
  players: [{ id: 10, name: "Mané", teamId: 1 }],
  fixtures: [
    {
      id: 1,
      date: "2026-06-15T18:00:00Z",
      venue: { name: "Stade", city: "Ville" },
      round: "J1",
      group: "I",
      homeTeamId: 1,
      awayTeamId: 2,
      goals: { home: null, away: null },
      status: "FT",
      events: [
        createMatchEvent({
          minute: 12,
          type: "goal",
          playerId: "10",
          playerName: "Mané",
          teamCode: "SEN",
        }),
      ],
    },
  ],
};

describe("recalculateStatistics", () => {
  it("compte les buts depuis les événements goal", () => {
    const stats = recalculateStatistics(base);
    expect(stats.goals.get(10)).toBe(1);
  });

  it("compte les passes depuis les événements assist", () => {
    const goal = createMatchEvent({
      minute: 67,
      type: "goal",
      playerId: "10",
      playerName: "Mané",
      teamCode: "SEN",
    });
    const data: WorldCupManualData = {
      ...base,
      fixtures: [
        {
          ...base.fixtures[0],
          events: [
            goal,
            createMatchEvent({
              minute: 67,
              type: "assist",
              playerId: "11",
              playerName: "Diallo",
              teamCode: "SEN",
              linkedGoalId: goal.id,
            }),
          ],
        },
      ],
      players: [
        { id: 10, name: "Mané", teamId: 1 },
        { id: 11, name: "Diallo", teamId: 1 },
      ],
    };
    const stats = recalculateStatistics(data);
    expect(stats.assists.get(11)).toBe(1);
  });

  it("n'attribue pas de but au joueur sur un CSC", () => {
    const data: WorldCupManualData = {
      ...base,
      fixtures: [
        {
          ...base.fixtures[0],
          events: [
            createMatchEvent({
              minute: 44,
              type: "goal",
              playerId: "10",
              playerName: "Mané",
              teamCode: "SEN",
              isOwnGoal: true,
            }),
          ],
        },
      ],
    };
    const stats = recalculateStatistics(data);
    expect(stats.goals.get(10)).toBeUndefined();
  });
});
