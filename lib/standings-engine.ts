/**
 * Moteur local de recalcul des classements (indépendant de l'API).
 * Utilisé pour les scénarios « what-if » sans persistance Git.
 */
import type { Fixture, GroupStanding, WorldCupGroup } from "@/types/worldcup";

export type ScoreOverride = {
  fixtureId: number;
  home: number;
  away: number;
};

export function applyScoreOverrides(
  fixtures: Fixture[],
  overrides: ScoreOverride[]
): Fixture[] {
  const map = new Map(overrides.map((o) => [o.fixtureId, o]));
  return fixtures.map((f) => {
    const o = map.get(f.id);
    if (!o) return f;
    return {
      ...f,
      goals: { home: o.home, away: o.away },
      status: { short: "FT", long: "Match Finished", elapsed: 90 },
    };
  });
}

export function computeStandingsFromFixtures(
  fixtures: Fixture[],
  groupLetter: string
): GroupStanding[] {
  const g = groupLetter.toUpperCase();
  const groupFixtures = fixtures.filter(
    (f) => f.group === g && f.goals.home !== null && f.goals.away !== null
  );

  const table = new Map<
    number,
    GroupStanding & { teamId: number }
  >();

  const ensure = (team: Fixture["teams"]["home"]) => {
    if (!table.has(team.id)) {
      table.set(team.id, {
        position: 0,
        team,
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        teamId: team.id,
      });
    }
    return table.get(team.id)!;
  };

  for (const f of groupFixtures) {
    const home = f.goals.home!;
    const away = f.goals.away!;
    const h = ensure(f.teams.home);
    const a = ensure(f.teams.away);

    h.played++;
    a.played++;
    h.goalsFor += home;
    h.goalsAgainst += away;
    a.goalsFor += away;
    a.goalsAgainst += home;

    if (home > away) {
      h.won++;
      h.points += 3;
      a.lost++;
    } else if (home < away) {
      a.won++;
      a.points += 3;
      h.lost++;
    } else {
      h.draw++;
      a.draw++;
      h.points += 1;
      a.points += 1;
    }
  }

  const rows = [...table.values()].map((r) => ({
    ...r,
    goalDifference: r.goalsFor - r.goalsAgainst,
  }));

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return rows.map((r, i) => ({
    position: i + 1,
    team: r.team,
    played: r.played,
    won: r.won,
    draw: r.draw,
    lost: r.lost,
    goalsFor: r.goalsFor,
    goalsAgainst: r.goalsAgainst,
    goalDifference: r.goalDifference,
    points: r.points,
  }));
}

export function mergeGroupsWithSimulation(
  apiGroups: WorldCupGroup[],
  fixtures: Fixture[],
  overrides: ScoreOverride[]
): WorldCupGroup[] {
  const simulated = applyScoreOverrides(fixtures, overrides);

  return apiGroups.map((group) => {
    const letter =
      group.name.replace(/Groupe\s*/i, "").trim().toUpperCase().slice(0, 1) ||
      group.name.slice(-1).toUpperCase();

    const computed = computeStandingsFromFixtures(simulated, letter);
    if (computed.length === 0) return group;

    return { ...group, standings: computed };
  });
}
