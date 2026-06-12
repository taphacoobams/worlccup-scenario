/** Active la BDD Prisma quand DATABASE_URL est défini (sauf USE_DATABASE=false). */
export function isDatabaseEnabled(): boolean {
  const url = process.env.DATABASE_URL?.trim();
  if (!url || url === "false") return false;
  return process.env.USE_DATABASE !== "false";
}

/** Runtime applicatif — PostgreSQL obligatoire (JSON = seed/scripts uniquement). */
export function requireDatabase(): void {
  if (!isDatabaseEnabled()) {
    throw new Error(
      "DATABASE_URL requis — importez les données (npm run db:seed) puis relancez l’application."
    );
  }
}
