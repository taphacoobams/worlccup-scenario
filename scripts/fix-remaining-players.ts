import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

interface Player {
  playerName: string;
  firstName: string;
  lastName: string;
  bio?: string;
  specialTag?: string;
  image?: string;
}

interface PlayersTeam {
  code: string;
  players: Player[];
}

// Manual mappings for unmatched players: Guardian name -> Local name pattern
const MANUAL_MAPPINGS: Record<string, Record<string, string>> = {
  'QAT': {
    'Hassan Al-Haydos': 'Hasan Hassan Alhaydos',
    'Ayoub Alawi': 'Ayoub Ayoub Aloui',
    'Ahmed Al-Ganehi': 'Ahmed Ahmed Alganehi',
    'Sultan Al-Brake': 'Sultan Sultan Albrake',
    'Hashmi Hussein': 'Alhashmi Alhashmi Alhussein',
    'Mohamed Al-Mannai': 'Mohamed Mohamed Manai',
  },
  'EGY': {
    'Mohamed El-Shenawy': 'Mohamed Mohamed Elshenawy',
    'Mohamed Abdelmonem': 'Mohamed Mohamed Abdelmoneim',
    'Mostafa Ziko': 'Mostafa Mostafa Zico',
    'Mohanad Lasheen': 'Mohanad Mohanad Lashin',
    "Nabil 'Dunga' Emad": 'Nabil Nabil Donga',
    'Marwan Attia': 'Marawan Marawan Attia',
    "Mostafa 'Oufa' Shobeir": 'Mostafa Mostafa Shoubir',
  },
  'IRN': {
    'Dennis-Yerai Eckert Ayensa': 'Dennis Dargahi',
  },
  'CPV': {
    "'Diney' Borges": 'Edilson Diney Borges',
    "Gilson 'Benchimol' Tavares": 'Gilson Gilson Benchimol',
    "Josimar 'Vozinha' Dias": 'Josimar Vozinha',
    "Ianique 'Stopira' Tavares": 'Ianique Stopira',
    "Roberto 'Pico' Lopes": 'Roberto Pico Lopes',
    "Carlos 'CJ' Dos Santos": 'Carlos Cj Dos Santos',
  },
  'KSA': {
    'Ayman Yahya': 'Aiman Aiman Yahya',
    'Firas Al-Buraikan': 'Feras Feras Albrikan',
    'Nawaf Boushal': 'Nawaf Nawaf Bu Washl',
    'Hassan Kadesh': 'Hassan Hassan Kadish',
    'Alaa Al-Hejji': 'Ala Ala Alhajji',
    'Abdullah Al-Hamdan': 'Abdullah Abdullah Alhamddan',
    'Jehad Thakri': 'Jehad Jehad Thikri',
  },
  'IRQ': {
    'Akam Hashem': 'Akam Akam Hashim',
    'Manaf Younis': 'Munaf Munaf Younus',
    'Ali Yousef': 'Ali Ali Yousif',
    'Ahmed Maknzi': 'Ahmed Ahmed Maknazi',
    'Ali Jassim': 'Ali Ali Jasim',
    'Zaid Ismail': 'Zaid Zaid Ismael',
  },
  'JOR': {
    'Mohammad Abu Hashish': 'Mohammad Mohammad Abuhasheesh',
    'Husam Abu Dahab': 'Husam Husam Abudahab',
    'Mohammad Abu Zrayq': 'Mohammad Mohammad Abuzraiq',
    'Musa Al-Taamari': 'Mousa Mousa Altamari',
    'Odeh Al-Fakhouri': 'Odeh Odeh Fakhoury',
    'Rajaei Ayed': 'Raja\'ei Rajaei Ayed',
    'Mohammad Abu Al-Nadi': 'Mohammad Mohammad Abualnadi',
    'Saed Al-Rosan': 'Sa\'ed Saed Alrosan',
    'Mohannad Abu Taha': 'Mohannad Mohannad Abutaha',
    'Nizar Al-Rashdan': 'Nizar Nizar Alrashdan',
    'Abdullah Al-Fakhouri': 'Abdallah Abdallah Alfakhori',
  },
  'POR': {
    'Diogo Dalot': 'José Diogo Dalot',
  },
};

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type GuardianPlayerRow = {
  name: string;
  bio?: string;
  gridImage?: string;
  grid_image?: string;
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

async function main() {
  const dataDir = path.join(__dirname, '..', 'data');
  const playersImagesDir = path.join(__dirname, '..', 'public', 'players');
  
  console.log('=== Fix Remaining Players ===\n');
  
  // Load teams-data.json to get spreadsheet IDs
  const teamsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'teams-data.json'), 'utf-8'));
  const playersData: { teams: PlayersTeam[] } = JSON.parse(fs.readFileSync(path.join(dataDir, 'players.json'), 'utf-8'));
  
  const TEAM_CODE_MAPPING: Record<string, string> = {
    'Qatar': 'QAT', 'Egypt': 'EGY', 'Iran': 'IRN', 'Cape Verde': 'CPV',
    'Saudi Arabia': 'KSA', 'Iraq': 'IRQ', 'Jordan': 'JOR', 'Portugal': 'POR',
  };
  
  let totalFixed = 0;
  let totalImages = 0;
  
  for (const guardianTeam of teamsData.sheets.Teams) {
    const teamCode = TEAM_CODE_MAPPING[guardianTeam.Team];
    if (!teamCode) continue;
    
    const mappings = MANUAL_MAPPINGS[teamCode];
    if (!mappings || Object.keys(mappings).length === 0) continue;
    
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
    
    if (!json || !json.sheets || !json.sheets.Players) {
      console.log(`[${teamCode}] ❌ Failed to fetch`);
      continue;
    }
    
    const guardianPlayers = json.sheets.Players;
    let teamFixed = 0;
    
    for (const [guardianName, localName] of Object.entries(mappings)) {
      // Find Guardian player
      const gp = guardianPlayers.find((p) => p.name === guardianName);
      if (!gp) {
        console.log(`  [${teamCode}] Guardian not found: ${guardianName}`);
        continue;
      }
      
      // Find local player
      const player = playersTeam.players.find(p => p.playerName === localName);
      if (!player) {
        console.log(`  [${teamCode}] Local not found: ${localName}`);
        continue;
      }
      
      let updated = false;
      
      // Add bio
      if (!player.bio && gp.bio) {
        player.bio = gp.bio;
        updated = true;
      }
      
      // Add special tag
      const specialTag = gp['special player? (eg. key player, promising talent, etc) OPTIONAL'] || gp.special_player || '';
      if (!player.specialTag && specialTag) {
        player.specialTag = specialTag;
        updated = true;
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
            totalImages++;
            updated = true;
          }
        } else {
          player.image = `/players/${teamCodeLower}/${imageName}`;
          updated = true;
        }
      }
      
      if (updated) {
        teamFixed++;
        totalFixed++;
        console.log(`  ✅ ${guardianName} -> ${player.playerName}`);
      }
    }
    
    console.log(`[${teamCode}] Fixed: ${teamFixed}`);
  }
  
  // Save
  fs.writeFileSync(path.join(dataDir, 'players.json'), JSON.stringify(playersData, null, 2));
  
  console.log('\n=== SUMMARY ===');
  console.log(`Players fixed: ${totalFixed}`);
  console.log(`Images downloaded: ${totalImages}`);
  
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
