import { loadWorldCupBundle } from "@/lib/services/worldcup";

/** Active la BDD Prisma quand DATABASE_URL est défini (sauf USE_DATABASE=false). */
export function isDatabaseEnabled(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url || url === "false") return false;
  return process.env.USE_DATABASE !== "false";
}

/** Runtime applicatif — PostgreSQL préféré, repli JSON si indisponible. */
export function requireDatabase(): void {
  if (!isDatabaseEnabled()) {
    console.warn(
      "[database] DATABASE_URL absent — mode repli JSON (data/*.json)"
    );
  }
}

/** Écritures Manager — PostgreSQL obligatoire. */
export function requireDatabaseForWrite(): void {
  if (!isDatabaseEnabled()) {
    throw new Error(
      "DATABASE_URL requis pour écrire en base — configurez PostgreSQL ou désactivez les actions d'écriture."
    );
  }
}

export async function getTournamentUpdatedAt(): Promise<string | null> {
  try {
    const bundle = await loadWorldCupBundle();
    return bundle.updatedAt;
  } catch {
    return null;
  }
}
