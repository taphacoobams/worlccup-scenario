import { describe, expect, it } from "vitest";
import {
  createMatchEvent,
  formatEventMinute,
  formatEventTimelineLine,
  formatMatchMinuteInput,
  migrateLegacyEvent,
  normalizeMatchEvents,
  parseMatchMinute,
  removeEventById,
  sortEventsChronologically,
} from "@/lib/tournament-engine/events";
import type { ManualTeam } from "@/types/worldcup-manual";

const teams: ManualTeam[] = [
  { id: 1, name: "Mexico", code: "MEX" },
  { id: 2, name: "South Africa", code: "RSA" },
];

describe("parseMatchMinute", () => {
  it("parse minute simple", () => {
    expect(parseMatchMinute("12")).toEqual({ minute: 12 });
  });

  it("parse temps additionnel", () => {
    expect(parseMatchMinute("90+6")).toEqual({ minute: 90, addedTime: 6 });
    expect(parseMatchMinute("90 + 3")).toEqual({ minute: 90, addedTime: 3 });
  });
});

describe("formatEventMinute", () => {
  it("affiche 90+2'", () => {
    expect(formatEventMinute(90, 2)).toBe("90+2'");
    expect(formatMatchMinuteInput(90, 2)).toBe("90+2");
  });
});

describe("migrateLegacyEvent", () => {
  it("convertit but + passe en deux événements", () => {
    const out = migrateLegacyEvent(
      {
        time: { elapsed: 9, extra: null },
        teamId: 1,
        playerName: "Jose Quinones",
        assistName: "Erik Lira",
        type: "Goal",
        detail: "Goal",
      },
      teams,
      []
    );
    expect(out).toHaveLength(2);
    expect(out[0].type).toBe("goal");
    expect(out[1].type).toBe("assist");
    expect(out[1].linkedGoalId).toBe(out[0].id);
  });
});

describe("sortEventsChronologically", () => {
  it("trie minute puis addedTime puis type", () => {
    const goal = createMatchEvent({
      minute: 9,
      type: "goal",
      playerId: "1",
      playerName: "A",
      teamCode: "MEX",
    });
    const assist = createMatchEvent({
      minute: 9,
      type: "assist",
      playerId: "2",
      playerName: "B",
      teamCode: "MEX",
      linkedGoalId: goal.id,
    });
    const sorted = sortEventsChronologically([assist, goal]);
    expect(sorted[0].type).toBe("goal");
    expect(sorted[1].type).toBe("assist");
  });
});

describe("removeEventById", () => {
  it("supprime le but et sa passe liée", () => {
    const goal = createMatchEvent({
      minute: 67,
      type: "goal",
      playerId: "1",
      playerName: "Jimenez",
      teamCode: "MEX",
    });
    const assist = createMatchEvent({
      minute: 67,
      type: "assist",
      playerId: "2",
      playerName: "Alvarado",
      teamCode: "MEX",
      linkedGoalId: goal.id,
    });
    const out = removeEventById([goal, assist], goal.id);
    expect(out).toHaveLength(0);
  });
});

describe("formatEventTimelineLine", () => {
  it("affiche emoji et minute", () => {
    const line = formatEventTimelineLine(
      createMatchEvent({
        minute: 90,
        addedTime: 2,
        type: "red_card",
        playerId: "",
        playerName: "Carlos Montes",
        teamCode: "MEX",
      })
    );
    expect(line).toContain("🟥");
    expect(line).toContain("90+2'");
    expect(line).toContain("Carlos Montes");
  });
});

describe("normalizeMatchEvents", () => {
  it("accepte le nouveau format", () => {
    const e = createMatchEvent({
      minute: 59,
      type: "goal",
      playerId: "1",
      playerName: "Krejci",
      teamCode: "CZE",
    });
    expect(normalizeMatchEvents([e], teams)).toEqual([e]);
  });
});
