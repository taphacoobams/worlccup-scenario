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

  // Track seen players by (teamId, name) to identify duplicates
  const seen = new Map<string, number>(); // key: "teamId-name", value: first ID
  const idsToRemove = new Set<number>();

  for (const player of players) {
    const key = `${player.teamId}-${player.name}`;
    if (seen.has(key)) {
      // This is a duplicate - mark for removal
      console.log(`Duplicate found: ${player.name} (ID: ${player.id}) in team ${player.teamId} - keeping ID ${seen.get(key)}`);
      idsToRemove.add(player.id);
    } else {
      // First occurrence - keep it
      seen.set(key, player.id);
    }
  }

  if (idsToRemove.size === 0) {
    console.log("No duplicate entries found.");
    return;
  }

  console.log(`\nRemoving ${idsToRemove.size} duplicate entries...`);

  // Filter out duplicates
  const filteredPlayers = players.filter(p => !idsToRemove.has(p.id));

  fs.writeFileSync(playersPath, JSON.stringify(filteredPlayers, null, 2));
  console.log(`Removed ${idsToRemove.size} duplicate entries. Remaining players: ${filteredPlayers.length}`);
}

main();
