import type { GroupsFile, LocalBestThird, LocalGroup } from "@/types/data";

function compareBestThirds(
  a: Omit<LocalBestThird, "rank" | "inQualifyingZone">,
  b: Omit<LocalBestThird, "rank" | "inQualifyingZone">
): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference)
    return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.group.localeCompare(b.group);
}

/** Classement des 12 troisièmes — dérivé des poules si absent du fichier */
export function buildBestThirdsFromGroups(groups: LocalGroup[]): LocalBestThird[] {
  const entries = groups.map((g) => {
    const letter = g.letter.toUpperCase();
    const row = g.standings.find((s) => s.position === 3) ?? g.standings[2];
    if (!row) {
      throw new Error(`Groupe ${letter} : pas de 3e place`);
    }
    return {
      group: letter,
      key: `3${letter}`,
      teamId: row.teamId,
      teamName: row.teamName,
      played: row.played,
      won: row.won,
      draw: row.draw,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      goalDifference: row.goalDifference,
      points: row.points,
    };
  });

  entries.sort(compareBestThirds);

  return entries.map((e, i) => ({
    ...e,
    rank: i + 1,
    inQualifyingZone: i < 8,
  }));
}

/** Accepte l’ancien tableau `[{ letter, standings }]` ou `{ groups, bestThirds }` */
export function parseGroupsFile(raw: unknown): GroupsFile {
  if (Array.isArray(raw)) {
    const groups = raw as LocalGroup[];
    return { groups, bestThirds: buildBestThirdsFromGroups(groups) };
  }

  const file = raw as GroupsFile;
  const groups = file.groups ?? [];
  const bestThirds =
    file.bestThirds?.length === 12
      ? file.bestThirds
      : buildBestThirdsFromGroups(groups);

  return { groups, bestThirds };
}

export function groupsToFile(groups: LocalGroup[]): GroupsFile {
  return {
    groups,
    bestThirds: buildBestThirdsFromGroups(groups),
  };
}
