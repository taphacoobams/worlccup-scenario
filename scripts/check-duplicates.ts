import fs from 'fs';
import path from 'path';

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

function main() {
  const data = fs.readFileSync(playersPath, 'utf-8');
  const players: Player[] = JSON.parse(data);

  // Group players by team
  const playersByTeam = new Map<number, Player[]>();
  for (const player of players) {
    if (!playersByTeam.has(player.teamId)) {
      playersByTeam.set(player.teamId, []);
    }
    playersByTeam.get(player.teamId)!.push(player);
  }

  // Check for duplicates within each team
  const duplicatesByTeam = new Map<number, Array<{ name: string; ids: number[] }>>();
  
  for (const [teamId, teamPlayers] of playersByTeam) {
    const nameCount = new Map<string, number[]>();
    
    for (const player of teamPlayers) {
      if (!nameCount.has(player.name)) {
        nameCount.set(player.name, []);
      }
      nameCount.get(player.name)!.push(player.id);
    }

    // Find duplicates (names that appear more than once)
    for (const [name, ids] of nameCount) {
      if (ids.length > 1) {
        if (!duplicatesByTeam.has(teamId)) {
          duplicatesByTeam.set(teamId, []);
        }
        duplicatesByTeam.get(teamId)!.push({ name, ids });
      }
    }
  }

  // Print results
  if (duplicatesByTeam.size === 0) {
    console.log("No duplicate players found within teams.");
  } else {
    console.log(`Found duplicates in ${duplicatesByTeam.size} team(s):\n`);
    for (const [teamId, duplicates] of duplicatesByTeam) {
      console.log(`Team ID ${teamId}:`);
      for (const dup of duplicates) {
        console.log(`  - "${dup.name}" appears ${dup.ids.length} times (IDs: ${dup.ids.join(', ')})`);
      }
      console.log();
    }
  }
}

main();
