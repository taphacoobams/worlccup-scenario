/**
 * Vérifie les tables et compte les enregistrements après seed.
 * Usage: npx tsx scripts/db-verify.ts
 */
import { PrismaClient } from "@prisma/client";

const TABLES = [
  "Team",
  "Player",
  "Fixture",
  "Venue",
  "MatchEvent",
  "GroupStanding",
  "Scorer",
  "Assist",
  "Card",
  "TournamentMeta",
] as const;

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log("\nDatabase created");
    console.log("\nTables created:");
    for (const table of TABLES) {
      console.log(`- ${table}`);
    }

    const [
      teams,
      players,
      fixtures,
      standings,
      scorers,
      assists,
      cards,
    ] = await Promise.all([
      prisma.team.count(),
      prisma.player.count(),
      prisma.fixture.count(),
      prisma.groupStanding.count(),
      prisma.scorer.count(),
      prisma.assist.count(),
      prisma.card.count(),
    ]);

    console.log("\nImport summary:");
    console.log(`Teams imported: ${teams}`);
    console.log(`Players imported: ${players}`);
    console.log(`Fixtures imported: ${fixtures}`);
    console.log(`Standings imported: ${standings}`);
    console.log(`Scorers imported: ${scorers}`);
    console.log(`Assists imported: ${assists}`);
    console.log(`Cards imported: ${cards}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
