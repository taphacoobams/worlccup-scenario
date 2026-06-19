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

function extractFullNameFromPhoto(photo: string): string {
  // Extract filename from path: "/players/alg/melvin-mastil.jpg" -> "melvin-mastil.jpg"
  const filename = photo.split('/').pop() || '';
  // Remove extension: "melvin-mastil.jpg" -> "melvin-mastil"
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  // Convert from "first-last" to "First Last"
  const parts = nameWithoutExt.split('-');
  const capitalized = parts.map(part => 
    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  );
  return capitalized.join(' ');
}

function main() {
  const data = fs.readFileSync(playersPath, 'utf-8');
  const players: Player[] = JSON.parse(data);

  let updatedCount = 0;
  const updatedPlayers = players.map(player => {
    const fullName = extractFullNameFromPhoto(player.photo);
    if (fullName && fullName !== player.name) {
      console.log(`Updating player ${player.id}: "${player.name}" -> "${fullName}"`);
      updatedCount++;
      return { ...player, name: fullName };
    }
    return player;
  });

  fs.writeFileSync(playersPath, JSON.stringify(updatedPlayers, null, 2));
  console.log(`\nUpdated ${updatedCount} player names`);
}

main();
