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

// Manual mappings: Guardian name -> Local playerName
const MANUAL_MAPPINGS: Record<string, Record<string, string>> = {
  'BRA': {
    'Éderson': 'Éderson Ederson Silva',
    'Danilo Santos': 'Danilo Danilo Santos',
    'Neymar': 'Neymar Neymar Jr',
    'Alisson': 'Álisson Alisson',
    'Marquinhos': 'Marcos Marquinhos',
    'Casemiro': 'Carlos Casemiro',
    'Raphinha': 'Raphael Raphinha',
    'Weverton': 'Weverton Weverton',
    'Danilo': 'Danilo Danilo',
    'Bremer': 'Gleison Bremer',
    'Fabinho': 'Fabio Fabinho',
    'Endrick': 'Endrick Endrick',
    'Ederson': 'Ederson Ederson',
    'Rayan': 'Rayan Rayan',
  },
  'EGY': {
    "Mostafa 'Oufa' Shobeir": 'Mostafa Mostafa Shoubir',
  },
  'IRN': {
    'Mehdi Ghaedi': 'Mehdi Ghayedi',
    'Seyed Hossein Hosseini': 'Hossein Hosseini',
    'Amirmohammad Razzaghinia': 'Amirmohammad Razaghinia',
  },
  'JOR': {
    'Ibrahim Sabra': 'Mohammad Mohammad Abughoush',
    'Abdallah Al Fakhouri': 'Abdallah Abdallah Alfakhori',
    'Mohammad Al-Dawoud': 'Mohammad Mohammad Aldaoud',
  },
  'NED': {
    'Lutsharel Geertruida': 'Lutsharel Geertruida',
  },
  'NOR': {
    'Fredrik André Bjørkan': 'Fredrik Bjorkan',
  },
  'POR': {
    'Samu Costa': 'Samuel Samu Costa',
  },
  'GER': {
    'Antonio Rüdiger': 'Antonio Ruediger',
    'Alexander Nübel': 'Alexander Nuebel',
  },
  'AUT': {
    'Alessandro Schöpf': 'Alessandro Schoepf',
  },
  'PAR': {
    'Gastón Oliveira': 'Gaston Olveira',
  },
  'SUI': {
    'Eray Cömert': 'Eray Coemert',
  },
  'URU': {
    'Maximiliano Araújo': 'Maxi Araujo',
  },
  'UZB': {
    'Odiljon Khamrobekov': 'Odiljon Xamrobekov',
  },
};

const TEAM_CODE_MAPPING: Record<string, string> = {
  'Brazil': 'BRA', 'Egypt': 'EGY', 'Iran': 'IRN', 'Jordan': 'JOR',
  'Netherlands': 'NED', 'Norway': 'NOR', 'Portugal': 'POR', 'Germany': 'GER',
  'Austria': 'AUT', 'Paraguay': 'PAR', 'Switzerland': 'SUI', 'Uruguay': 'URU',
  'Uzbekistan': 'UZB',
};

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeForMatch(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B''`´]/g, '')
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type GuardianPlayerRow = {
  name: string;
  bio?: string;
  grid_image?: string;
  gridImage?: string;
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

async function main() {
  const dataDir = path.join(__dirname, '..', 'data');
  const playersImagesDir = path.join(__dirname, '..', 'public', 'players');
  
  console.log('=== Fix Last Players ===\n');
  
  const teamsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'teams-data.json'), 'utf-8'));
  const playersData: { teams: PlayersTeam[] } = JSON.parse(fs.readFileSync(path.join(dataDir, 'players.json'), 'utf-8'));
  
  let totalBios = 0, totalImages = 0;
  
  for (const guardianTeam of teamsData.sheets.Teams) {
    const teamCode = TEAM_CODE_MAPPING[guardianTeam.Team];
    if (!teamCode) continue;
    
    const mappings = MANUAL_MAPPINGS[teamCode];
    if (!mappings) continue;
    
    const playersTeam = playersData.teams.find(t => t.code === teamCode);
    if (!playersTeam) continue;
    
    const teamCodeLower = teamCode.toLowerCase();
    const teamImagesDir = path.join(playersImagesDir, teamCodeLower);
    if (!fs.existsSync(teamImagesDir)) {
      fs.mkdirSync(teamImagesDir, { recursive: true });
    }
    
    // Fetch Guardian JSON
    const url = `https://interactive.guim.co.uk/docsdata/${guardianTeam.spreadsheet}.json`;
    const json = await fetchJson(url);
    
    if (!json || !json.sheets || !json.sheets.Players) continue;
    
    let teamBios = 0, teamImages = 0;
    
    for (const gp of json.sheets.Players) {
      // Try direct mapping first
      let localName = mappings[gp.name];
      
      // Try normalized match if no direct mapping
      if (!localName) {
        const normalizedGp = normalizeForMatch(gp.name);
        for (const [guardianName, playerName] of Object.entries(mappings)) {
          if (normalizeForMatch(guardianName) === normalizedGp) {
            localName = playerName;
            break;
          }
        }
      }
      
      if (!localName) continue;
      
      const player = playersTeam.players.find(p => p.playerName === localName);
      if (!player) {
        console.log(`  [${teamCode}] Player not found: ${localName}`);
        continue;
      }
      
      // Add bio
      if (!player.bio && gp.bio) {
        player.bio = gp.bio;
        teamBios++;
        totalBios++;
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
            console.log(`  ✅ ${gp.name} -> ${player.playerName}`);
          }
        } else {
          player.image = `/players/${teamCodeLower}/${imageName}`;
          teamImages++;
          totalImages++;
        }
      }
    }
    
    if (teamBios > 0 || teamImages > 0) {
      console.log(`[${teamCode}] +${teamBios} bios, +${teamImages} images`);
    }
  }
  
  // Save
  fs.writeFileSync(path.join(dataDir, 'players.json'), JSON.stringify(playersData, null, 2));
  
  console.log('\n=== SUMMARY ===');
  console.log(`New bios: ${totalBios}`);
  console.log(`New images: ${totalImages}`);
  
  // Final stats
  let withBio = 0, withImage = 0;
  playersData.teams.forEach(t => t.players.forEach(p => {
    if (p.bio) withBio++;
    if (p.image) withImage++;
  }));
  console.log(`\nPlayers with bio: ${withBio}/1248 (${(withBio/1248*100).toFixed(1)}%)`);
  console.log(`Players with image: ${withImage}/1248 (${(withImage/1248*100).toFixed(1)}%)`);
}

main().catch(console.error);
