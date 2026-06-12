import { buildBestThirdsRanking } from "@/lib/qualification";
import type { Group } from "@/types";
import type { Team, WorldCupGroup } from "@/types/worldcup";
import type { WorldCupManualData } from "@/types/worldcup-manual";

const FINISHED = new Set(["FT", "AET", "PEN"]);

/** Tous les matchs de poule du groupe sont terminés avec score */
export function isGroupStageComplete(
  data: WorldCupManualData,
  letter: string
): boolean {
  const g = letter.toUpperCase();
  const groupFixtures = data.fixtures.filter(
    (f) => f.group?.toUpperCase() === g
  );
  if (groupFixtures.length === 0) return false;
  return groupFixtures.every(
    (f) =>
      FINISHED.has(f.status) &&
      f.goals.home != null &&
      f.goals.away != null
  );
}

export function isAllGroupStagesComplete(data: WorldCupManualData): boolean {
  return data.groups.every((grp) =>
    isGroupStageComplete(data, grp.letter)
  );
}

/** Place 1 / 2 / 3 figée (poule terminée pour ce groupe) */
export function isGroupRankDefinite(
  data: WorldCupManualData,
  letter: string,
  rank: 1 | 2 | 3
): boolean {
  if (rank === 3) {
    return isGroupStageComplete(data, letter);
  }
  return isGroupStageComplete(data, letter);
}

function buildWorldCupGroups(
  data: WorldCupManualData,
  teams: Map<number, Team>
): WorldCupGroup[] {
  return data.groups.map((g) => ({
    name: `Groupe ${g.letter}`,
    letter: g.letter.toUpperCase(),
    standings: [...g.standings]
      .sort((a, b) => a.position - b.position)
      .map((row) => ({
        position: row.position,
        team: teams.get(row.teamId)!,
        played: row.played,
        won: row.won,
        draw: row.draw,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference: row.goalDifference,
        points: row.points,
      }))
      .filter((s) => s.team),
  }));
}

/**
 * Parmi les groupes listés dans un créneau 3X/Y/Z, retourne la lettre du seul
 * troisième qualifié (top 8) — sinon ambigu.
 */
export function resolveUniqueQualifiedThirdGroup(
  data: WorldCupManualData,
  teams: Map<number, Team>,
  letters: string[],
  groupFrequencies: Record<Group, number>
): string | null {
  if (!isAllGroupStagesComplete(data)) return null;

  const groups = buildWorldCupGroups(data, teams);
  const bestThirds = buildBestThirdsRanking(groups, groupFrequencies);
  const qualifiedLetters = new Set<string>(
    bestThirds.filter((e) => e.rank <= 8).map((e) => e.group)
  );

  const fromSlot = letters
    .map((l) => l.toUpperCase())
    .filter((l) => qualifiedLetters.has(l));

  if (fromSlot.length === 1) return fromSlot[0]!;
  return null;
}
