import { fromFifa3Code } from "@/lib/fifa-codes";

/** Associe un code FIFA 3 lettres à un teamId (legacyId en BDD). */
export function fifa3ToTeamId(
  fifa3: string,
  teams: { id: number; code: string }[]
): number | null {
  const internal = fromFifa3Code(fifa3);
  if (!internal) return null;
  return teams.find((t) => t.code.toUpperCase() === internal)?.id ?? null;
}
