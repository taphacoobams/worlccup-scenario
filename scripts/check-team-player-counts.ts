import fs from 'fs';
import path from 'path';

const playersPath = path.join(__dirname, '../data/players.json');
const teamsPath = path.join(__dirname, '../data/teams.json');

interface Player {
  id: number;
  teamId: number;
  name: string;
}

interface Team {
  id: number;
  name: string;
  code: string;
}

function main() {
  const players = JSON.parse(fs.readFileSync(playersPath, 'utf-8')) as Player[];
  const teams = JSON.parse(fs.readFileSync(teamsPath, 'utf-8')) as Team[];

  // Count players per team
  const teamCounts = new Map<number, number>();
  for (const player of players) {
    teamCounts.set(player.teamId, (teamCounts.get(player.teamId) || 0) + 1);
  }

  // Find teams with 23 players
  const teamsWith23: Array<{ team: Team; count: number }> = [];
  for (const team of teams) {
    const count = teamCounts.get(team.id) || 0;
    if (count === 23) {
      teamsWith23.push({ team, count });
    }
  }

  if (teamsWith23.length === 0) {
    console.log("No teams with exactly 23 players found.");
  } else {
    console.log(`Found ${teamsWith23.length} team(s) with 23 players:\n`);
    for (const { team, count } of teamsWith23) {
      console.log(`- ${team.name} (${team.code}): ${count} players`);
    }
  }

  // Also show all team counts for reference
  console.log("\n=== All team player counts ===");
  for (const team of teams) {
    const count = teamCounts.get(team.id) || 0;
    console.log(`${team.code} (${team.name}): ${count}`);
  }
}

main();
