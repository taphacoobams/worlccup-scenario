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

  // Get all teams to map teamId (number) to team.id (string)
  const teams = await prisma.team.findMany({
    select: { id: true, legacyId: true }
  });
  const teamIdMap = new Map<number, string>();
  for (const team of teams) {
    if (team.legacyId) {
      teamIdMap.set(team.legacyId, team.id);
    }
  }

  // Get all players from database
  const dbPlayers = await prisma.player.findMany({
    select: { id: true, legacyId: true }
  });

  const dbPlayersByLegacyId = new Map(dbPlayers.map(p => [p.legacyId, p.id]));

  let createdCount = 0;
  let updatedCount = 0;

  for (const player of players) {
    const existingDbId = dbPlayersByLegacyId.get(player.id);
    const teamDbId = teamIdMap.get(player.teamId);

    if (!teamDbId) {
      console.warn(`Team not found for player ${player.name} (teamId: ${player.teamId})`);
      continue;
    }

    const playerData = {
      name: player.name,
      number: player.number,
      position: player.position,
      positionCode: player.positionCode,
      club: player.club,
      age: player.age,
      nationality: player.nationality,
      image: player.photo,
      dateOfBirth: player.dob ? new Date(player.dob.split('/').reverse().join('-')) : null,
      heightCm: player.heightCm,
      bio: player.bio,
      bioEn: player.bioEn,
    };

    if (existingDbId) {
      // Update existing player
      await prisma.player.update({
        where: { id: existingDbId },
        data: playerData
      });
      updatedCount++;
    } else {
      // Create new player
      await prisma.player.create({
        data: {
          legacyId: player.id,
          teamId: teamDbId,
          ...playerData,
        }
      });
      createdCount++;
    }
  }

  // Remove players from DB that are no longer in players.json
  const jsonPlayerIds = new Set(players.map(p => p.id));
  let deletedCount = 0;

  for (const dbPlayer of dbPlayers) {
    if (dbPlayer.legacyId && !jsonPlayerIds.has(dbPlayer.legacyId)) {
      await prisma.player.delete({
        where: { id: dbPlayer.id }
      });
      deletedCount++;
    }
  }

  console.log(`Created: ${createdCount} players`);
  console.log(`Updated: ${updatedCount} players`);
  console.log(`Deleted: ${deletedCount} players`);
  console.log(`Total in players.json: ${players.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
