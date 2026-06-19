import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

const playersPath = path.join(__dirname, '../data/players.json');

interface Player {
  id: number;
  teamId: number;
  name: string;
  number: number;
  position: string;
  positionCode: string;
  club: string;
  age: number;
  nationality: string;
  photo: string;
  dob: string;
  heightCm: number;
  bio?: string;
  bioEn?: string;
}

async function main() {
  const data = fs.readFileSync(playersPath, 'utf-8');
  const players: Player[] = JSON.parse(data);

  // Get all player IDs from JSON
  const jsonPlayerIds = new Set(players.map(p => p.id));

  // Get all players from database
  const dbPlayers = await prisma.player.findMany({
    select: { id: true, legacyId: true }
  });

  let deletedCount = 0;

  for (const dbPlayer of dbPlayers) {
    // If the player exists in DB but not in JSON (was removed), delete from DB
    if (dbPlayer.legacyId && !jsonPlayerIds.has(dbPlayer.legacyId)) {
      try {
        await prisma.player.delete({
          where: { id: dbPlayer.id }
        });
        console.log(`Deleted player from DB: legacyId ${dbPlayer.legacyId}`);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting player ${dbPlayer.legacyId}:`, error);
      }
    }
  }

  console.log(`\nDeleted ${deletedCount} duplicate players from database`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
