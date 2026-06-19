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

  let updatedCount = 0;
  let errorCount = 0;

  for (const player of players) {
    try {
      // Find player by legacyId (which matches the id in JSON)
      const dbPlayer = await prisma.player.findFirst({
        where: { legacyId: player.id }
      });

      if (dbPlayer && dbPlayer.name !== player.name) {
        await prisma.player.update({
          where: { id: dbPlayer.id },
          data: { name: player.name }
        });
        console.log(`Updated ${dbPlayer.legacyId}: "${dbPlayer.name}" -> "${player.name}"`);
        updatedCount++;
      }
    } catch (error) {
      console.error(`Error updating player ${player.id}:`, error);
      errorCount++;
    }
  }

  console.log(`\nUpdated ${updatedCount} player names in database`);
  if (errorCount > 0) {
    console.log(`Errors: ${errorCount}`);
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
