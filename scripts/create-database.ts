/**
 * Crée la base PostgreSQL si elle n'existe pas.
 * Usage: npx tsx scripts/create-database.ts
 */
import { Client } from "pg";

const DB_NAME = "senegalscenario2026";

function adminUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    try {
      const parsed = new URL(url);
      parsed.pathname = "/postgres";
      parsed.search = "";
      return parsed.toString();
    } catch {
      /* fallback */
    }
  }
  return (
    process.env.DATABASE_ADMIN_URL?.trim() ??
    "postgresql://postgres:postgres@localhost:5432/postgres"
  );
}

async function main() {
  const client = new Client({ connectionString: adminUrl() });
  await client.connect();

  const exists = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [DB_NAME]
  );

  if (exists.rowCount && exists.rowCount > 0) {
    console.log(`Database already exists: ${DB_NAME}`);
  } else {
    await client.query(`CREATE DATABASE ${DB_NAME}`);
    console.log("Database created");
    console.log(`  → ${DB_NAME}`);
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
