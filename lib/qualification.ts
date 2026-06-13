import { ALL_GROUPS, TOTAL_SCENARIOS } from "@/lib/constants";
import { resolveTeamStrengthScore } from "@/lib/scenario-engine/team-strength";
import { sortStandingsByStats } from "@/lib/standings-utils";
import { getWorldCupGroups } from "@/lib/worldcup-data";
import type { Group } from "@/types";
import type {
  BestThirdEntry,
  TeamQualificationProbs,
} from "@/types/qualification";
import type { GroupStanding, WorldCupGroup } from "@/types/worldcup";

/** P(groupe X présent parmi les 8 meilleurs 3es) — moteur 495 scénarios */
export function getGroupThirdScenarioRate(
  group: Group,
  groupFrequencies: Record<Group, number>,
  total = TOTAL_SCENARIOS
): number {
  return (groupFrequencies[group] / total) * 100;
}

export function extractGroupLetter(name: string): Group {
  const m = name.match(/Groupe\s*([A-L])/i) ?? name.match(/\b([A-L])\b/);
  return (m?.[1]?.toUpperCase() ?? "A") as Group;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export { sortStandingsByStats } from "@/lib/standings-utils";

function standingsAreFullyTied(standings: GroupStanding[]): boolean {
  if (standings.length === 0) return false;
  const first = standings[0];
  return standings.every(
    (s) =>
      s.points === first.points &&
      s.goalDifference === first.goalDifference &&
      s.goalsFor === first.goalsFor &&
      s.played === first.played
  );
}

/** Probabilités avant match / poule à 0 pt — basées sur FIFA + rang attendu */
function computePreTournamentProbs(
  rank: number,
  strength: number,
  sortedStrengths: number[],
  groupScenarioRate: number
): Pick<TeamQualificationProbs, "first" | "second" | "third" | "total" | "likelyPath"> {
  const maxS = Math.max(...sortedStrengths);
  const minS = Math.min(...sortedStrengths);
  const norm =
    maxS === minS ? 0.5 : clamp((strength - minS) / (maxS - minS), 0, 1);
  const rankFactor = { 1: 1, 2: 0.7, 3: 0.45, 4: 0.2 }[rank] ?? 0.12;
  const blend = norm * 0.62 + rankFactor * 0.38;

  let p1 = clamp(blend * 58 + (rank === 1 ? 18 : 0) - (rank - 1) * 9, 1, 90);
  let p2 = clamp(blend * 42 + (rank === 2 ? 14 : 0) - Math.abs(rank - 2) * 7, 1, 72);
  let p3 =
    rank === 3
      ? clamp(blend * 28 + groupScenarioRate * 0.42, 4, 68)
      : clamp(blend * 10 * (rank === 4 ? 0.55 : 0.25), 0.5, 14);

  p1 = round1(clamp(p1, 0, 99));
  p2 = round1(clamp(p2, 0, 99));
  p3 = round1(clamp(p3, 0, 99));

  let total: number;
  if (rank <= 2) {
    total = round1(clamp(p1 + p2 + p3 * 0.15, 0, 99));
  } else if (rank === 3) {
    total = round1(clamp(p2 * 0.25 + p3, 0, 99));
  } else {
    total = round1(clamp(p1 + p2 + p3, 0, 99));
  }

  let likelyPath: TeamQualificationProbs["likelyPath"] = "eliminated";
  if (rank <= 2 && total >= 45) likelyPath = rank === 1 ? "first" : "second";
  else if (rank === 1 && p1 >= p2 && p1 >= 20) likelyPath = "first";
  else if (rank === 2 && p2 >= 15) likelyPath = "second";
  else if (rank === 3 && p3 >= 12) likelyPath = "third";
  else if (total < 12) likelyPath = "eliminated";

  return { first: p1, second: p2, third: p3, total, likelyPath };
}

/** Probabilités 1er / 2e / 3e (top 8) / total qualification */
export function computeTeamQualificationProbs(
  row: GroupStanding,
  standings: GroupStanding[],
  thirdRankAmong12: number | null,
  groupScenarioRate: number
): TeamQualificationProbs {
  const sorted = sortStandingsByStats(standings);
  const effective = sorted.find((s) => s.team.id === row.team.id) ?? row;
  const rank = effective.position;
  const groupHasResults = standings.some((s) => s.played > 0);
  const useStrengthModel =
    !groupHasResults || standingsAreFullyTied(standings);

  const leader = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  const matchesLeft = clamp(3 - effective.played, 0, 3);

  let p1 = 0;
  let p2 = 0;
  let p3 = 0;

  if (useStrengthModel) {
    const sortedStrengths = sorted.map((s) =>
      resolveTeamStrengthScore(s.team)
    );
    const strength = resolveTeamStrengthScore(effective.team);
    const pre = computePreTournamentProbs(
      rank,
      strength,
      sortedStrengths,
      groupScenarioRate
    );
    return {
      teamId: row.team.id,
      ...pre,
    };
  } else if (rank === 1) {
    const cushion = effective.points - (second?.points ?? 0);
    p1 = clamp(48 + cushion * 16 - matchesLeft * 3, 20, 96);
    p2 = clamp(34 - cushion * 6 + matchesLeft, 8, 52);
    p3 = clamp(6 - cushion * 1.5, 1, 12);
  } else if (rank === 2) {
    const cushion = effective.points - (third?.points ?? 0);
    const gapLeader = (leader?.points ?? 0) - effective.points;
    p1 = clamp(26 - gapLeader * 10, 2, 42);
    p2 = clamp(44 + cushion * 14 - gapLeader * 3, 12, 88);
    p3 = clamp(14 - cushion * 4, 2, 28);
  } else if (rank === 3) {
    const gap2nd = (second?.points ?? 0) - effective.points;
    p1 = clamp(4 - gap2nd * 2, 0.5, 8);
    p2 = clamp(16 - gap2nd * 7, 2, 32);
    const rankScore =
      thirdRankAmong12 !== null
        ? thirdRankAmong12 <= 8
          ? clamp(58 - (thirdRankAmong12 - 1) * 5.5, 26, 75)
          : clamp(20 - (thirdRankAmong12 - 8) * 4, 2, 18)
        : clamp(groupScenarioRate * 0.5, 8, 35);
    p3 = clamp(rankScore * 0.6 + groupScenarioRate * 0.4, 5, 82);
  } else {
    const gap3rd = (third?.points ?? 0) - effective.points;
    p1 = 0.5;
    p2 = clamp(5 - gap3rd * 3, 0.5, 6);
    p3 =
      gap3rd <= 0 && thirdRankAmong12 !== null && thirdRankAmong12 <= 10
        ? clamp(14 - thirdRankAmong12, 1, 10)
        : clamp(2 - gap3rd, 0.5, 3);
  }

  p1 = round1(clamp(p1, 0, 99));
  p2 = round1(clamp(p2, 0, 99));
  p3 = round1(clamp(p3, 0, 99));

  let total: number;
  if (rank <= 2) {
    total = round1(clamp(p1 + p2 + p3 * 0.15, 0, 99));
  } else if (rank === 3) {
    total = round1(clamp(p2 * 0.25 + p3, 0, 99));
  } else {
    total = round1(clamp(p1 + p2 + p3, 0, 99));
  }

  let likelyPath: TeamQualificationProbs["likelyPath"] = "eliminated";
  if (rank <= 2 && total >= 45) likelyPath = rank === 1 ? "first" : "second";
  else if (rank === 1 && p1 >= p2 && p1 >= 20) likelyPath = "first";
  else if (rank === 2 && p2 >= 15) likelyPath = "second";
  else if (rank === 3 && p3 >= 12) likelyPath = "third";
  else if (total < 12) likelyPath = "eliminated";

  return {
    teamId: row.team.id,
    first: p1,
    second: p2,
    third: p3,
    total,
    likelyPath,
  };
}

function compareThirds(a: BestThirdEntry, b: BestThirdEntry): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference)
    return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  const sa = resolveTeamStrengthScore(a.team);
  const sb = resolveTeamStrengthScore(b.team);
  if (sb !== sa) return sb - sa;
  return a.group.localeCompare(b.group);
}

export function buildBestThirdsRanking(
  groups: WorldCupGroup[],
  groupFrequencies: Record<Group, number>
): BestThirdEntry[] {
  const entries: BestThirdEntry[] = [];

  for (const group of groups) {
    const letter = extractGroupLetter(group.name);
    const sorted = sortStandingsByStats(group.standings);
    const thirdRow = sorted.find((s) => s.position === 3) ?? sorted[2];

    if (!thirdRow) continue;

    const scenarioRate = getGroupThirdScenarioRate(letter, groupFrequencies);

    entries.push({
      rank: 0,
      group: letter,
      team: thirdRow.team,
      played: thirdRow.played,
      won: thirdRow.won,
      draw: thirdRow.draw,
      lost: thirdRow.lost,
      goalsFor: thirdRow.goalsFor,
      goalsAgainst: thirdRow.goalsAgainst,
      goalDifference: thirdRow.goalDifference,
      points: thirdRow.points,
      qualifiesProbability: 0,
      groupScenarioRate: round1(scenarioRate),
      inQualifyingZone: false,
    });
  }

  entries.sort(compareThirds);

  return entries.map((e, i) => {
    const rank = i + 1;
    const inZone = rank <= 8;
    const rankProb = inZone ? clamp(78 - (rank - 1) * 6, 32, 82) : clamp(28 - (rank - 8) * 5, 2, 25);
    const qualifiesProbability = round1(
      clamp(rankProb * 0.6 + e.groupScenarioRate * 0.4, 2, 90)
    );
    return {
      ...e,
      rank,
      inQualifyingZone: inZone,
      qualifiesProbability,
    };
  });
}

/** Poules — PostgreSQL */
export async function buildOfficialGroups(): Promise<WorldCupGroup[]> {
  return getWorldCupGroups();
}

export { ALL_GROUPS };
