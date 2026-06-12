import { ALL_GROUPS, TOTAL_SCENARIOS } from "@/lib/constants";
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

/** Probabilités 1er / 2e / 3e (top 8) / total qualification */
export function computeTeamQualificationProbs(
  row: GroupStanding,
  standings: GroupStanding[],
  thirdRankAmong12: number | null,
  groupScenarioRate: number
): TeamQualificationProbs {
  const sorted = [...standings].sort((a, b) => a.position - b.position);
  const leader = sorted.find((s) => s.position === 1) ?? sorted[0];
  const second = sorted.find((s) => s.position === 2) ?? sorted[1];
  const third = sorted.find((s) => s.position === 3) ?? sorted[2];

  let p1 = 0;
  let p2 = 0;
  let p3 = 0;

  const pos = row.position;
  const maxPlayed = Math.max(...standings.map((s) => s.played), 3);
  const remainingFactor = clamp((maxPlayed - row.played) / maxPlayed, 0.15, 1);

  if (pos === 1) {
    const gap = row.points - (second?.points ?? 0);
    p1 = clamp(42 + gap * 14 * remainingFactor, 8, 92);
    p2 = clamp(35 - gap * 8, 5, 55);
    p3 = clamp(8 - gap * 2, 1, 15);
  } else if (pos === 2) {
    const gapToFirst = (leader?.points ?? 0) - row.points;
    const gapToThird = row.points - (third?.points ?? 0);
    p1 = clamp(28 - gapToFirst * 12, 2, 45);
    p2 = clamp(40 + gapToThird * 10, 10, 78);
    p3 = clamp(12 - gapToThird * 4, 2, 28);
  } else if (pos === 3) {
    const gapToSecond = (second?.points ?? 0) - row.points;
    p1 = clamp(4 - gapToSecond * 2, 0.5, 8);
    p2 = clamp(18 - gapToSecond * 8, 2, 35);
    const rankScore =
      thirdRankAmong12 !== null
        ? thirdRankAmong12 <= 8
          ? clamp(55 - (thirdRankAmong12 - 1) * 5, 28, 72)
          : clamp(22 - (thirdRankAmong12 - 8) * 4, 3, 20)
        : 25;
    p3 = clamp(rankScore * 0.65 + groupScenarioRate * 0.35, 5, 85);
  } else {
    p1 = 1;
    p2 = clamp(6 - (row.position - 4) * 2, 0.5, 8);
    p3 =
      thirdRankAmong12 !== null && thirdRankAmong12 <= 10
        ? clamp(12 - thirdRankAmong12, 1, 10)
        : 2;
  }

  const scale = 100 / (p1 + p2 + p3 + 0.01);
  p1 = round1(clamp(p1 * scale * 0.92, 0, 95));
  p2 = round1(clamp(p2 * scale * 0.92, 0, 95));
  p3 = round1(clamp(p3 * scale * 0.92, 0, 95));
  const total = round1(clamp(p1 + p2 + p3, 0, 99));

  let likelyPath: TeamQualificationProbs["likelyPath"] = "eliminated";
  if (p1 >= p2 && p1 >= p3 && p1 >= 20) likelyPath = "first";
  else if (p2 >= p3 && p2 >= 15) likelyPath = "second";
  else if (p3 >= 12) likelyPath = "third";
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
  return a.group.localeCompare(b.group);
}

export function buildBestThirdsRanking(
  groups: WorldCupGroup[],
  groupFrequencies: Record<Group, number>
): BestThirdEntry[] {
  const entries: BestThirdEntry[] = [];

  for (const group of groups) {
    const letter = extractGroupLetter(group.name);
    const thirdRow =
      group.standings.find((s) => s.position === 3) ?? group.standings[2];

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
