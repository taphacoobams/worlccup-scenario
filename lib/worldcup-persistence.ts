import { requireDatabase } from "@/lib/database";
import { loadWorldCupFromDb, saveWorldCupToDb } from "@/lib/worldcup-db";
import type { WorldCupManualData } from "@/types/worldcup-manual";

/** Charge équipes, poules, matchs et joueurs depuis PostgreSQL. */
export async function loadWorldCupFromFiles(): Promise<WorldCupManualData> {
  requireDatabase();
  return loadWorldCupFromDb();
}

/** Persiste les modifications du Manager en base. */
export async function saveWorldCupToFiles(data: WorldCupManualData): Promise<void> {
  requireDatabase();
  await saveWorldCupToDb(data);
}
