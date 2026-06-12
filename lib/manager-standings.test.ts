import { describe, expect, it } from "vitest";
import { createMatchEvent } from "@/lib/tournament-engine/events";
import {
  applyManagerPipeline,
  countGoalsFromEvents,
  syncFixtureScoreFromEvents,
} from "@/lib/manager-standings";
import type { WorldCupManualData } from "@/types/worldcup-manual";

function miniData(): WorldCupManualData {
  const goalHome = createMatchEvent({
    minute: 10,
    type: "goal",
    playerId: "",
    playerName: "Dupont",
    teamCode: "A1",
  });
  const goalAway = createMatchEvent({
    minute: 55,
    type: "goal",
    playerId: "",
    playerName: "Martin",
    teamCode: "A2",
  });
  const assistAway = createMatchEvent({
    minute: 55,
    type: "assist",
    playerId: "",
    playerName: "Durand",
    teamCode: "A2",
    linkedGoalId: goalAway.id,
  });

  return {
    updatedAt: new Date().toISOString(),
    teams: [
      { id: 1, name: "A1", code: "A1", country: "A1" },
      { id: 2, name: "A2", code: "A2", country: "A2" },
    ],
    groups: [
      {
        letter: "A",
        standings: [
          { teamId: 1, position: 1, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
          { teamId: 2, position: 2, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
        ],
      },
    ],
    fixtures: [
      {
        id: 1,
        date: "2026-06-01T12:00:00.000Z",
        venue: { name: "S", city: "C" },
        round: "Group",
        group: "A",
        homeTeamId: 1,
        awayTeamId: 2,
        goals: { home: null, away: null },
        status: "NS",
        events: [goalHome, goalAway, assistAway],
      },
    ],
    players: [],
  };
}

describe("manager-standings", () => {
  it("sync score from goal events", () => {
    const data = miniData();
    const f = syncFixtureScoreFromEvents(data.fixtures[0], data.teams);
    expect(f.goals).toEqual({ home: 1, away: 1 });
    expect(f.status).toBe("FT");
  });

  it("recalculates standings after FT match", () => {
    const data = miniData();
    data.fixtures[0].status = "FT";
    data.fixtures[0].goals = { home: 1, away: 1 };
    const out = applyManagerPipeline(data);
    const standings = out.groups[0].standings.sort((a, b) => a.position - b.position);
    expect(standings[0].points).toBe(1);
    expect(standings[0].played).toBe(1);
    expect(standings[0].goalsFor).toBe(1);
  });

  it("counts own goals for opponent", () => {
    const data = miniData();
    const f = data.fixtures[0];
    f.events = [
      createMatchEvent({
        minute: 1,
        type: "goal",
        playerId: "",
        playerName: "X",
        teamCode: "A1",
        isOwnGoal: true,
      }),
    ];
    expect(countGoalsFromEvents(f, data.teams)).toEqual({ home: 0, away: 1 });
  });
});
