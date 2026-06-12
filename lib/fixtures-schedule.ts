import type { ManualFixture } from "@/types/worldcup-manual";

/** Calendrier complet attendu en base après seed (fixtures-all → db:seed). */
export async function mergeWithOfficialSchedule(
  fixtures: ManualFixture[]
): Promise<ManualFixture[]> {
  return fixtures;
}
