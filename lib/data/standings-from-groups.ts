import type { LocalGroup, LocalStanding } from "@/types/data";

export function standingsFromGroups(groups: LocalGroup[]): LocalStanding[] {
  return groups.flatMap((g) =>
    g.standings.map((s) => ({ ...s, group: g.letter.toUpperCase() }))
  );
}
