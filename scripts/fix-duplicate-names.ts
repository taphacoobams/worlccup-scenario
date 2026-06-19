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

function removeDuplicateParts(name: string): string {
  const parts = name.split(' ');
  const cleaned: string[] = [];
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    // Skip if this part is the same as the next part (duplicate)
    if (i < parts.length - 1 && part.toLowerCase() === parts[i + 1].toLowerCase()) {
      continue;
    }
    cleaned.push(part);
  }
  
  return cleaned.join(' ');
}

function main() {
  const data = fs.readFileSync(playersPath, 'utf-8');
  const players: Player[] = JSON.parse(data);

  let fixedCount = 0;
  const fixedPlayers = players.map(player => {
    const cleanedName = removeDuplicateParts(player.name);
    if (cleanedName !== player.name) {
      console.log(`Fixed player ${player.id}: "${player.name}" -> "${cleanedName}"`);
      fixedCount++;
      return { ...player, name: cleanedName };
    }
    return player;
  });

  fs.writeFileSync(playersPath, JSON.stringify(fixedPlayers, null, 2));
  console.log(`\nFixed ${fixedCount} player names`);
}

main();
