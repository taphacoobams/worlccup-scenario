import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function main() {
  const teams = await prisma.team.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      _count: {
        select: {
          players: true
        }
      }
    }
  });

  console.log("=== Database team player counts ===\n");
  
  const teamsWith23: Array<{ name: string; code: string; count: number }> = [];
  
  for (const team of teams) {
    const count = team._count.players;
    if (count === 23) {
      teamsWith23.push({ name: team.name, code: team.code, count });
    }
    console.log(`${team.code} (${team.name}): ${count}`);
  }

  if (teamsWith23.length > 0) {
    console.log(`\n=== Teams with 23 players ===`);
    for (const { name, code, count } of teamsWith23) {
      console.log(`- ${name} (${code}): ${count}`);
    }
  } else {
    console.log("\nNo teams with 23 players in database.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
