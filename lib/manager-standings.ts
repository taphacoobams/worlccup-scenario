import type {
  ManualFixture,
  ManualStanding,
  ManualTeam,
  WorldCupManualData,
} from "@/types/worldcup-manual";
import type { MatchEvent } from "@/types/match-events";
import { normalizeMatchEvents } from "@/lib/tournament-engine/events";

const FINISHED = new Set(["FT", "AET", "PEN"]);

export type ManualMatchEvent = MatchEvent;

function emptyStanding(teamId: number): ManualStanding {
  return {
    teamId,
    position: 0,
    played: 0,
    won: 0,
    draw: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function homeAwayCodes(
  fixture: ManualFixture,
  teams: ManualTeam[]
): { home: string; away: string } | null {
  if (fixture.homeTeamId <= 0 || fixture.awayTeamId <= 0) return null;
  const home = teams.find((t) => t.id === fixture.homeTeamId)?.code;
  const away = teams.find((t) => t.id === fixture.awayTeamId)?.code;
  if (!home || !away) return null;
  return { home, away };
}

/** Compte les buts dom./ext. à partir des événements goal (CSC inversé) */
export function countGoalsFromEvents(
  fixture: ManualFixture,
  teams: ManualTeam[] = []
): { home: number; away: number } {
  let home = 0;
  let away = 0;
  const codes = homeAwayCodes(fixture, teams);
  if (!codes) return { home: 0, away: 0 };

  const events = normalizeMatchEvents(fixture.events, teams);

  for (const e of events) {
    if (e.type !== "goal") continue;

    if (e.isOwnGoal) {
      if (e.teamCode === codes.home) away++;
      else if (e.teamCode === codes.away) home++;
    } else if (e.teamCode === codes.home) {
      home++;
    } else if (e.teamCode === codes.away) {
      away++;
    }
  }

  return { home, away };
}

/** Met à jour le score à partir des événements goal */
export function syncFixtureScoreFromEvents(
  fixture: ManualFixture,
  teams: ManualTeam[] = []
): ManualFixture {
  const events = normalizeMatchEvents(fixture.events, teams);
  const goalEvents = events.filter((e) => e.type === "goal");
  if (goalEvents.length === 0) return fixture;

  const { home, away } = countGoalsFromEvents(fixture, teams);
  return {
    ...fixture,
    events,
    goals: { home, away },
    status: fixture.status === "NS" ? "FT" : fixture.status,
  };
}

export function computeManualStandingsForGroup(
  data: WorldCupManualData,
  letter: string
): ManualStanding[] {
  const g = letter.toUpperCase();
  const group = data.groups.find((x) => x.letter.toUpperCase() === g);
  if (!group) return [];

  const rows = new Map<number, ManualStanding>();
  for (const s of group.standings) {
    rows.set(s.teamId, emptyStanding(s.teamId));
  }

  for (const f of data.fixtures) {
    if (f.group?.toUpperCase() !== g) continue;
    if (!FINISHED.has(f.status)) continue;
    if (f.goals.home == null || f.goals.away == null) continue;
    if (!f.homeTeamId || !f.awayTeamId) continue;

    const home = rows.get(f.homeTeamId);
    const away = rows.get(f.awayTeamId);
    if (!home || !away) continue;

    const hg = f.goals.home;
    const ag = f.goals.away;

    home.played++;
    away.played++;
    home.goalsFor += hg;
    home.goalsAgainst += ag;
    away.goalsFor += ag;
    away.goalsAgainst += hg;

    if (hg > ag) {
      home.won++;
      home.points += 3;
      away.lost++;
    } else if (hg < ag) {
      away.won++;
      away.points += 3;
      home.lost++;
    } else {
      home.draw++;
      away.draw++;
      home.points += 1;
      away.points += 1;
    }
  }

  const sorted = [...rows.values()]
    .map((r) => ({
      ...r,
      goalDifference: r.goalsFor - r.goalsAgainst,
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

  return sorted.map((r, i) => ({ ...r, position: i + 1 }));
}

export function recalculateAllStandings(
  data: WorldCupManualData
): WorldCupManualData {
  return {
    ...data,
    groups: data.groups.map((g) => ({
      ...g,
      standings: computeManualStandingsForGroup(data, g.letter),
    })),
  };
}

export function applyManagerPipeline(
  data: WorldCupManualData
): WorldCupManualData {
  const fixtures = data.fixtures.map((f) =>
    syncFixtureScoreFromEvents(f, data.teams)
  );
  return recalculateAllStandings({ ...data, fixtures });
}

export { isGroupFixture, isKnockoutFixture } from "@/lib/manager-fixtures";
