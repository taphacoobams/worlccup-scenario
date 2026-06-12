import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

interface Player {
  playerName: string;
  bio?: string;
  specialTag?: string;
  image?: string;
}

interface PlayersTeam {
  code: string;
  players: Player[];
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeQuotes(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")  // Smart single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')  // Smart double quotes
    .replace(/[''`´]/g, "'")
    .replace(/[""]/g, '"');
}

function normalizeForMatch(name: string): string {
  return normalizeQuotes(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type GuardianPlayerRow = {
  name: string;
  bio?: string;
  grid_image?: string;
  gridImage?: string;
  special_player?: string;
  "special player? (eg. key player, promising talent, etc) OPTIONAL"?: string;
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
      if (response.statusCode !== 200) { resolve(null); return; }
      let data = '';
      response.on('data', (chunk: Buffer) => data += chunk);
      response.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
    }).on('error', () => resolve(null));
  });
}

function downloadImage(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!url || url.trim() === '') { resolve(false); return; }
    
    const makeRequest = (requestUrl: string, redirectCount = 0): void => {
      if (redirectCount > 5) { resolve(false); return; }
      
      https.get(requestUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) { makeRequest(redirectUrl, redirectCount + 1); return; }
        }
        if (response.statusCode !== 200) { resolve(false); return; }
        
        const fileStream = fs.createWriteStream(destPath);
        response.pipe(fileStream);
        fileStream.on('finish', () => { fileStream.close(); resolve(true); });
        fileStream.on('error', () => { fs.unlink(destPath, () => {}); resolve(false); });
      }).on('error', () => resolve(false));
    };
    
    makeRequest(url);
  });
}

function findBestMatch(guardianName: string, players: Player[]): Player | null {
  const normalizedGuardian = normalizeForMatch(guardianName);
  const guardianParts = normalizedGuardian.split(' ').filter(p => p.length > 1);
  
  // Extract nickname if present (between quotes)
  const nicknameMatch = normalizeQuotes(guardianName).match(/['"]([^'"]+)['"]/);
  const nickname = nicknameMatch ? normalizeForMatch(nicknameMatch[1]) : null;
  
  for (const player of players) {
    const normalizedPlayer = normalizeForMatch(player.playerName);
    const playerParts = normalizedPlayer.split(' ').filter(p => p.length > 1);
    
    // Exact normalized match
    if (normalizedPlayer === normalizedGuardian) return player;
    
    // Nickname match
    if (nickname && playerParts.includes(nickname)) return player;
    
    // Count matching parts
    let matches = 0;
    for (const gp of guardianParts) {
      if (playerParts.some(pp => pp === gp || pp.includes(gp) || gp.includes(pp))) {
        matches++;
      }
    }
    
    // Need at least 2 matching parts
    if (matches >= 2) return player;
    
    // Last name match if unique
    const guardianLast = guardianParts[guardianParts.length - 1];
    const playerLast = playerParts[playerParts.length - 1];
    if (guardianLast === playerLast && guardianLast.length > 3) {
      return player;
    }
  }
  
  return null;
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

async function main() {
  const dataDir = path.join(__dirname, '..', 'data');
  const playersImagesDir = path.join(__dirname, '..', 'public', 'players');
  
  console.log('=== Final Player Fix (All Teams) ===\n');
  
  const teamsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'teams-data.json'), 'utf-8'));
  const playersData: { teams: PlayersTeam[] } = JSON.parse(fs.readFileSync(path.join(dataDir, 'players.json'), 'utf-8'));
  
  let totalBios = 0;
  let totalTags = 0;
  let totalImages = 0;
  
  for (const guardianTeam of teamsData.sheets.Teams) {
    const teamCode = TEAM_CODE_MAPPING[guardianTeam.Team];
    if (!teamCode) continue;
    
    const playersTeam = playersData.teams.find(t => t.code === teamCode);
    if (!playersTeam) continue;
    
    // Check if team needs fixing
    const needsBio = playersTeam.players.filter(p => !p.bio).length;
    const needsImage = playersTeam.players.filter(p => !p.image).length;
    if (needsBio === 0 && needsImage === 0) continue;
    
    const teamCodeLower = teamCode.toLowerCase();
    const teamImagesDir = path.join(playersImagesDir, teamCodeLower);
    if (!fs.existsSync(teamImagesDir)) {
      fs.mkdirSync(teamImagesDir, { recursive: true });
    }
    
    // Fetch Guardian JSON
    const url = `https://interactive.guim.co.uk/docsdata/${guardianTeam.spreadsheet}.json`;
    const json = await fetchJson(url);
    
    if (!json || !json.sheets || !json.sheets.Players) continue;
    
    let teamBios = 0, teamTags = 0, teamImages = 0;
    
    for (const gp of json.sheets.Players) {
      const player = findBestMatch(gp.name, playersTeam.players);
      if (!player) continue;
      
      // Add bio
      if (!player.bio && gp.bio) {
        player.bio = gp.bio;
        teamBios++;
        totalBios++;
      }
      
      // Add special tag
      const specialTag = gp['special player? (eg. key player, promising talent, etc) OPTIONAL'] || '';
      if (!player.specialTag && specialTag) {
        player.specialTag = specialTag;
        teamTags++;
        totalTags++;
      }
      
      // Download image
      const gridImage = gp.grid_image || '';
      if (!player.image && gridImage) {
        const imageSlug = slugify(player.playerName);
        const imageExt = gridImage.includes('.png') ? 'png' : 'jpg';
        const imageName = `${imageSlug}.${imageExt}`;
        const imagePath = path.join(teamImagesDir, imageName);
        
        if (!fs.existsSync(imagePath)) {
          const success = await downloadImage(gridImage, imagePath);
          if (success) {
            player.image = `/players/${teamCodeLower}/${imageName}`;
            teamImages++;
            totalImages++;
          }
        } else {
          player.image = `/players/${teamCodeLower}/${imageName}`;
          teamImages++;
          totalImages++;
        }
      }
    }
    
    if (teamBios > 0 || teamTags > 0 || teamImages > 0) {
      console.log(`[${teamCode}] +${teamBios} bios, +${teamTags} tags, +${teamImages} images`);
    }
  }
  
  // Save
  fs.writeFileSync(path.join(dataDir, 'players.json'), JSON.stringify(playersData, null, 2));
  
  console.log('\n=== SUMMARY ===');
  console.log(`New bios: ${totalBios}`);
  console.log(`New tags: ${totalTags}`);
  console.log(`New images: ${totalImages}`);
  
  // Final stats
  let withBio = 0, withImage = 0, withTag = 0;
  playersData.teams.forEach(t => t.players.forEach(p => {
    if (p.bio) withBio++;
    if (p.image) withImage++;
    if (p.specialTag) withTag++;
  }));
  console.log(`\nPlayers with bio: ${withBio}/1248 (${(withBio/1248*100).toFixed(1)}%)`);
  console.log(`Players with image: ${withImage}/1248 (${(withImage/1248*100).toFixed(1)}%)`);
  console.log(`Players with specialTag: ${withTag}/1248 (${(withTag/1248*100).toFixed(1)}%)`);
}

main().catch(console.error);
