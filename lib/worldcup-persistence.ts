import { requireDatabaseForWrite } from "@/lib/database";
import { loadWorldCupBundle } from "@/lib/services/worldcup";
import { saveWorldCupToDb } from "@/lib/worldcup-db";
import type { WorldCupManualData } from "@/types/worldcup-manual";

/** Charge équipes, poules, matchs et joueurs — PostgreSQL avec repli JSON. */
export async function loadWorldCupFromFiles(): Promise<WorldCupManualData> {
  return loadWorldCupBundle();
}

/** Persiste les modifications du Manager en base. */
export async function saveWorldCupToFiles(data: WorldCupManualData): Promise<void> {
  requireDatabaseForWrite();
  await saveWorldCupToDb(data);
}
