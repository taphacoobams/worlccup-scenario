import type { Group, Scenario } from "@/types";
import type { LocalStanding } from "@/types/data";
import { ALL_GROUPS } from "@/lib/constants";
import { scenarioIncludesGroup } from "@/lib/scenarios-team";
import type { ScenarioDataContext } from "@/lib/scenario-engine/types";
import { getTeamStrength } from "@/lib/scenario-engine/team-strength";

const GROUP_MATCHES = 3;

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFor(scenarioId: number, group: Group, teamId: number): number {
  return scenarioId * 9973 + group.charCodeAt(0) * 131 + teamId * 17;
}

function hasRealResults(rows: LocalStanding[]): boolean {
  return rows.some((r) => r.played > 0);
}

/** Simule J/V/N/D/BP/BC/pts pour une poule (3 matchs) — déterministe par scénario */
function simulateGroupTable(
  scenario: Scenario,
  group: Group,
  rows: LocalStanding[],
  ctx: ScenarioDataContext
): LocalStanding[] {
  const sorted = [...rows].sort((a, b) => a.position - b.position);
  const draft = sorted.map((row) => {
    const strength = getTeamStrength(row.teamId, ctx);
    const rng = mulberry32(seedFor(scenario.id, group, row.teamId));

    const winChance = Math.min(0.72, Math.max(0.08, strength / 130));
    const drawChance = 0.22 + (50 - Math.abs(strength - 65)) * 0.002;

    let won = 0;
    let draw = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (let m = 0; m < GROUP_MATCHES; m++) {
      const roll = rng();
      const gf = Math.max(0, Math.round(1.1 + strength / 38 + rng() * 2.2));
      const ga = Math.max(0, Math.round(0.8 + (100 - strength) / 42 + rng() * 2));

      if (roll < winChance) {
        won++;
        goalsFor += Math.max(gf, ga + 1);
        goalsAgainst += ga;
      } else if (roll < winChance + drawChance) {
        draw++;
        const g = Math.max(gf, ga, 1);
        goalsFor += g;
        goalsAgainst += g;
      } else {
        lost++;
        goalsFor += gf;
        goalsAgainst += Math.max(ga, gf + 1);
      }
    }

    const points = won * 3 + draw;
    return {
      ...row,
      played: GROUP_MATCHES,
      won,
      draw,
      lost,
      goalsFor,
      goalsAgainst,
      goalDifference: goalsFor - goalsAgainst,
      points,
    };
  });

  return assignPositions(draft);
}

function assignPositions(rows: LocalStanding[]): LocalStanding[] {
  const sorted = [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName, "fr");
  });

  return sorted.map((row, i) => ({ ...row, position: i + 1 }));
}

function recordFromPoints(points: number, gf: number, ga: number): Pick<
  LocalStanding,
  "won" | "draw" | "lost" | "goalsFor" | "goalsAgainst" | "goalDifference" | "points" | "played"
> {
  const won = points >= 6 ? 2 : points >= 3 ? 1 : 0;
  const draw = points % 3;
  const lost = GROUP_MATCHES - won - draw;
  return {
    played: GROUP_MATCHES,
    won,
    draw,
    lost,
    goalsFor: gf,
    goalsAgainst: ga,
    goalDifference: gf - ga,
    points,
  };
}

/** Réécrit la poule avec un classement cohérent (3 matchs) selon qualification 3e */
function rewriteGroupTable(
  rows: LocalStanding[],
  thirdQualifies: boolean,
  rankAmongThirds: number,
  rng: () => number
): LocalStanding[] {
  const sorted = [...rows].sort((a, b) => a.position - b.position);
  const jitter = () => Math.floor(rng() * 2);

  const templates = thirdQualifies
    ? [
        { points: 9, gf: 10 + jitter(), ga: 2 },
        { points: 7, gf: 8 + jitter(), ga: 3 },
        { points: 6 + (rankAmongThirds % 2), gf: 5 + rankAmongThirds, ga: 2 + jitter() },
        { points: 3, gf: 3, ga: 6 },
      ]
    : [
        { points: 7, gf: 8, ga: 3 },
        { points: 6, gf: 6, ga: 4 },
        { points: Math.max(1, 3 - rankAmongThirds), gf: 3, ga: 5 + rankAmongThirds },
        { points: 0, gf: 1, ga: 7 },
      ];

  return sorted.map((row, i) => ({
    ...row,
    ...recordFromPoints(
      templates[i]!.points,
      templates[i]!.gf,
      templates[i]!.ga
    ),
    position: i + 1,
  }));
}

function alignThirdsWithScenario(
  byGroup: Map<Group, LocalStanding[]>,
  scenario: Scenario
): void {
  const rng = mulberry32(scenario.id * 7919);
  const qualified = new Set(scenario.qualifiedThirdPlaceGroups);
  const qualifiedOrder = [...scenario.qualifiedThirdPlaceGroups].sort();

  for (const group of ALL_GROUPS) {
    const rows = byGroup.get(group);
    if (!rows?.length) continue;
    const isQ = qualified.has(group);
    const rankAmongThirds = isQ
      ? qualifiedOrder.indexOf(group)
      : scenario.excludedGroups.indexOf(group);
    byGroup.set(
      group,
      rewriteGroupTable(rows, isQ, Math.max(0, rankAmongThirds), rng)
    );
  }
}

const cache = new Map<number, Map<Group, LocalStanding[]>>();

/** Classements simulés pour un scénario (cache par id) */
export function getSimulatedStandingsByGroup(
  scenario: Scenario,
  ctx: ScenarioDataContext
): Map<Group, LocalStanding[]> {
  const cached = cache.get(scenario.id);
  if (cached) return cached;

  const byGroup = new Map<Group, LocalStanding[]>();

  let usedSimulation = false;

  for (const group of ALL_GROUPS) {
    const rows = ctx.standingsByGroup.get(group) ?? [];
    if (rows.length === 0) continue;

    if (hasRealResults(rows)) {
      byGroup.set(group, assignPositions([...rows]));
    } else {
      usedSimulation = true;
      byGroup.set(group, simulateGroupTable(scenario, group, rows, ctx));
    }
  }

  if (usedSimulation) {
    alignThirdsWithScenario(byGroup, scenario);
  }

  cache.set(scenario.id, byGroup);
  return byGroup;
}

export function getStandingsForScenarioGroup(
  scenario: Scenario,
  group: Group,
  ctx: ScenarioDataContext
): LocalStanding[] {
  return getSimulatedStandingsByGroup(scenario, ctx).get(group) ?? [];
}

export function isSimulatedGroup(
  _scenario: Scenario,
  group: Group,
  ctx: ScenarioDataContext
): boolean {
  const rows = ctx.standingsByGroup.get(group) ?? [];
  return rows.length > 0 && !hasRealResults(rows);
}

export function thirdQualifiesInScenario(
  scenario: Scenario,
  group: Group
): boolean {
  return scenarioIncludesGroup(scenario, group);
}
