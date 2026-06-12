import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

interface GuardianTeamData {
  Team: string;
  spreadsheet: string;
}

interface Player {
  playerName: string;
  image?: string;
}

interface PlayersTeam {
  code: string;
  players: Player[];
}

const TEAM_CODE_MAPPING: Record<string, string> = {
  'Czechia': 'CZE', 'Mexico': 'MEX', 'South Africa': 'RSA', 'South Korea': 'KOR',
  'Bosnia and Herzegovina': 'BIH', 'Canada': 'CAN', 'Qatar': 'QAT', 'Switzerland': 'SUI',
  'Brazil': 'BRA', 'Haiti': 'HAI', 'Morocco': 'MAR', 'Scotland': 'SCO',
  'Australia': 'AUS', 'Paraguay': 'PAR', 'Turkey': 'TUR', 'USA': 'USA',
  'Curaçao': 'CUW', 'Ecuador': 'ECU', 'Germany': 'GER', "Côte d'Ivoire": 'CIV',
  'Japan': 'JPN', 'Netherlands': 'NED', 'Sweden': 'SWE', 'Tunisia': 'TUN',
  'Belgium': 'BEL', 'Egypt': 'EGY', 'Iran': 'IRN', 'New Zealand': 'NZL',
  'Cape Verde': 'CPV', 'Saudi Arabia': 'KSA', 'Spain': 'ESP', 'Uruguay': 'URU',
  'France': 'FRA', 'Iraq': 'IRQ', 'Norway': 'NOR', 'Senegal': 'SEN',
  'Algeria': 'ALG', 'Argentina': 'ARG', 'Austria': 'AUT', 'Jordan': 'JOR',
  'Colombia': 'COL', 'DR Congo': 'COD', 'Portugal': 'POR', 'Uzbekistan': 'UZB',
  'Croatia': 'CRO', 'England': 'ENG', 'Ghana': 'GHA', 'Panama': 'PAN',
};

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeForMatching(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[''`´""]/g, '')
    .replace(/[-–—]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

type GuardianPlayerRow = {
  name: string;
  grid_image?: string;
  gridImage?: string;
  image?: string;
};

type GuardianDocsJson = {
  sheets?: {
    Players?: GuardianPlayerRow[];
  };
};

function fetchJson(url: string): Promise<GuardianDocsJson | null> {
  return new Promise((resolve) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    }, (response) => {
      if (response.statusCode !== 200) {
        resolve(null);
        return;
      }
      let data = '';
      response.on('data', (chunk: Buffer) => data += chunk);
      response.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function downloadImage(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url || url.trim() === '') {
      resolve(false);
      return;
    }
    
    const makeRequest = (requestUrl: string, redirectCount = 0): void => {
      if (redirectCount > 5) {
        resolve(false);
        return;
      }
      
      https.get(requestUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            makeRequest(redirectUrl, redirectCount + 1);
            return;
          }
        }
        
        if (response.statusCode !== 200) {
          resolve(false);
          return;
        }
        
        const fileStream = fs.createWriteStream(destPath);
        response.pipe(fileStream);
        fileStream.on('finish', () => { fileStream.close(); resolve(true); });
        fileStream.on('error', () => { fs.unlink(destPath, () => {}); resolve(false); });
      }).on('error', () => resolve(false));
    };
    
    makeRequest(url);
  });
}

function findPlayer(guardianName: string, teamPlayers: Player[]): Player | null {
  const cleanName = guardianName.replace(/[''""]/g, '').trim();
  const normalized = normalizeForMatching(cleanName);
  
  // Exact match
  for (const p of teamPlayers) {
    if (p.playerName === guardianName || p.playerName === cleanName) return p;
  }
  
  // Normalized match
  for (const p of teamPlayers) {
    if (normalizeForMatching(p.playerName) === normalized) return p;
  }
  
  // Partial match (first + last word)
  const parts = normalized.split(' ').filter(x => x.length > 0);
  if (parts.length >= 2) {
    const first = parts[0];
    const last = parts[parts.length - 1];
    for (const p of teamPlayers) {
      const pParts = normalizeForMatching(p.playerName).split(' ');
      if (pParts.includes(first) && pParts.includes(last)) return p;
    }
  }
  
  return null;
}

async function main() {
  const dataDir = path.join(__dirname, '..', 'data');
  const playersImagesDir = path.join(__dirname, '..', 'public', 'players');
  
  console.log('=== Guardian Images Download ===\n');
  
  const teamsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'teams-data.json'), 'utf-8'));
  const playersData: { teams: PlayersTeam[] } = JSON.parse(fs.readFileSync(path.join(dataDir, 'players.json'), 'utf-8'));
  
  let totalDownloaded = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  let totalNoMatch = 0;
  
  for (const guardianTeam of teamsData.sheets.Teams as GuardianTeamData[]) {
    const teamCode = TEAM_CODE_MAPPING[guardianTeam.Team];
    if (!teamCode) continue;
    
    const teamCodeLower = teamCode.toLowerCase();
    const teamImagesDir = path.join(playersImagesDir, teamCodeLower);
    
    if (!fs.existsSync(teamImagesDir)) {
      fs.mkdirSync(teamImagesDir, { recursive: true });
    }
    
    const playersTeam = playersData.teams.find(t => t.code === teamCode);
    if (!playersTeam) continue;
    
    // Fetch Guardian JSON
    const url = `https://interactive.guim.co.uk/docsdata/${guardianTeam.spreadsheet}.json`;
    const json = await fetchJson(url);
    
    if (!json || !json.sheets || !json.sheets.Players) {
      console.log(`[${teamCode}] ❌ Failed to fetch`);
      continue;
    }
    
    const guardianPlayers = json.sheets.Players;
    let teamDownloaded = 0;
    let teamSkipped = 0;
    
    for (const gp of guardianPlayers) {
      const gridImage = gp.grid_image || gp.gridImage || gp.image || '';
      if (!gridImage) continue;
      
      const player = findPlayer(gp.name, playersTeam.players);
      if (!player) {
        totalNoMatch++;
        continue;
      }
      
      const imageSlug = slugify(player.playerName);
      const imageExt = gridImage.includes('.png') ? 'png' : 'jpg';
      const imageName = `${imageSlug}.${imageExt}`;
      const imagePath = path.join(teamImagesDir, imageName);
      
      // Skip if already exists
      if (fs.existsSync(imagePath)) {
        if (!player.image) {
          player.image = `/players/${teamCodeLower}/${imageName}`;
        }
        teamSkipped++;
        totalSkipped++;
        continue;
      }
      
      // Download
      const success = await downloadImage(gridImage, imagePath);
      if (success) {
        player.image = `/players/${teamCodeLower}/${imageName}`;
        teamDownloaded++;
        totalDownloaded++;
      } else {
        totalFailed++;
      }
    }
    
    console.log(`[${teamCode}] ${guardianTeam.Team}: ${teamDownloaded} downloaded, ${teamSkipped} skipped`);
  }
  
  // Save updated players.json
  fs.writeFileSync(path.join(dataDir, 'players.json'), JSON.stringify(playersData, null, 2));
  
  console.log('\n=== SUMMARY ===');
  console.log(`Downloaded: ${totalDownloaded}`);
  console.log(`Skipped (exists): ${totalSkipped}`);
  console.log(`Failed: ${totalFailed}`);
  console.log(`No match: ${totalNoMatch}`);
  
  // Final stats
  let withImage = 0;
  playersData.teams.forEach(t => t.players.forEach(p => { if (p.image) withImage++; }));
  console.log(`\nPlayers with image: ${withImage}/1248 (${(withImage/1248*100).toFixed(1)}%)`);
}

main().catch(console.error);
