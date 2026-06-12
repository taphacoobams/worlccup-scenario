import type { LocalFixture, LocalStanding, LocalTeam } from "@/types/data";
import type { Group } from "@/types";
import type { ScenarioDataContext } from "@/lib/scenario-engine/types";

/** Pedigree FIFA / historique CM (0–100) — données locales, pas d’API */
const PEDIGREE: Record<string, number> = {
  AR: 94,
  FR: 93,
  BR: 92,
  EN: 91,
  ES: 90,
  DE: 89,
  PT: 88,
  NL: 87,
  BE: 86,
  IT: 85,
  UY: 84,
  CO: 82,
  MX: 80,
  US: 79,
  JP: 78,
  KR: 77,
  MA: 76,
  SN: 75,
  HR: 74,
  CH: 73,
  AT: 72,
  EC: 71,
  AU: 70,
  IR: 69,
  TN: 68,
  DZ: 67,
  CD: 66,
  UZ: 62,
  ZA: 61,
  CA: 60,
  NO: 59,
  PY: 58,
  CR: 57,
  JO: 52,
  HT: 50,
  NZ: 48,
  QA: 45,
  PA: 44,
  CV: 43,
  CZ: 72,
  BA: 55,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function formFromFixtures(teamId: number, fixtures: LocalFixture[]): number {
  const played = fixtures
    .filter(
      (f) =>
        (f.homeTeamId === teamId || f.awayTeamId === teamId) &&
        f.goals.home != null &&
        f.goals.away != null
    )
    .slice(-5);

  if (played.length === 0) return 50;

  let pts = 0;
  for (const f of played) {
    const home = f.goals.home!;
    const away = f.goals.away!;
    const isHome = f.homeTeamId === teamId;
    const gf = isHome ? home : away;
    const ga = isHome ? away : home;
    if (gf > ga) pts += 3;
    else if (gf === ga) pts += 1;
  }
  return clamp((pts / (played.length * 3)) * 100, 15, 95);
}

export function buildScenarioDataContext(
  teams: LocalTeam[],
  standings: LocalStanding[],
  fixtures: LocalFixture[]
): ScenarioDataContext {
  const teamsById = new Map(teams.map((t) => [t.id, t]));
  const standingsByGroup = new Map<Group, LocalStanding[]>();

  for (const row of standings) {
    const g = (row.group ?? teamsById.get(row.teamId)?.group ?? "A") as Group;
    const list = standingsByGroup.get(g) ?? [];
    list.push(row);
    standingsByGroup.set(g, list);
  }

  for (const [g, list] of standingsByGroup) {
    standingsByGroup.set(
      g,
      [...list].sort((a, b) => a.position - b.position)
    );
  }

  const teamStrength = new Map<number, number>();
  const groupThirdStrength = new Map<Group, number>();

  for (const team of teams) {
    const row = standings.find((s) => s.teamId === team.id);
    const pedigree = PEDIGREE[team.code] ?? 55;
    const played = row?.played ?? 0;
    const ptsScore = row ? clamp((row.points / Math.max(played, 1)) * 28, 0, 35) : 12;
    const gdScore = row ? clamp(15 + row.goalDifference * 4, 0, 25) : 10;
    const posScore = row
      ? clamp(25 - (row.position - 1) * 8, 5, 25)
      : 12;
    const attack = row
      ? clamp((row.goalsFor / Math.max(played, 1)) * 12, 0, 18)
      : 8;
    const defense = row
      ? clamp(18 - (row.goalsAgainst / Math.max(played, 1)) * 10, 2, 18)
      : 8;
    const form = formFromFixtures(team.id, fixtures);

    const strength = clamp(
      pedigree * 0.28 +
        ptsScore +
        gdScore +
        posScore +
        attack +
        defense +
        form * 0.12,
      25,
      98
    );
    teamStrength.set(team.id, strength);
  }

  for (const [group, rows] of standingsByGroup) {
    const third = rows.find((r) => r.position === 3);
    if (third) {
      groupThirdStrength.set(group, teamStrength.get(third.teamId) ?? 50);
    } else {
      const fourth = rows.find((r) => r.position === 4);
      groupThirdStrength.set(
        group,
        fourth ? (teamStrength.get(fourth.teamId) ?? 45) * 0.85 : 45
      );
    }
  }

  return { teamsById, standingsByGroup, teamStrength, groupThirdStrength };
}

export function getTeamStrength(teamId: number, ctx: ScenarioDataContext): number {
  return ctx.teamStrength.get(teamId) ?? 50;
}
