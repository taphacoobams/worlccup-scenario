import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// ============================================================================
// Types
// ============================================================================

interface GuardianTeamData {
  Team: string;
  FIFA_ranking: string;
  Coach: string;
  Bio: string;
  strengths: string;
  weaknesses: string;
  player_pick: string;
  spreadsheet: string;
}

interface TeamsDataJson {
  sheets: {
    Teams: GuardianTeamData[];
  };
}

interface LocalTeam {
  id: number;
  name: string;
  code: string;
  country: string;
  group: string;
  fifaRanking?: number;
  coach?: string;
  bio?: string;
  strengths?: string;
  weaknesses?: string;
  playerPick?: string;
}

interface Player {
  number: number;
  position: string;
  playerName: string;
  firstName: string;
  lastName: string;
  nameOnShirt: string;
  dob: string;
  club: string;
  heightCm: number;
  bio?: string;
  specialTag?: string;
  image?: string;
}

interface PlayersTeam {
  country: string;
  code: string;
  coach: string;
  players: Player[];
}

interface PlayersJson {
  teams: PlayersTeam[];
}

interface GuardianPlayer {
  name: string;
  bio: string;
  specialPlayer: string;
  gridImage: string;
  team: string;
}

interface GuardianJsonResponse {
  sheets: {
    Players?: Record<string, string>[];
    [key: string]: Record<string, string>[] | undefined;
  };
}

type MatchLevel = 'EXACT' | 'NORMALIZED' | 'APPROXIMATE' | 'IMPOSSIBLE';

interface MatchResult {
  guardianName: string;
  playerName: string | null;
  level: MatchLevel;
}

interface Report {
  teamsProcessed: number;
  jsonDownloaded: number;
  jsonFailed: number;
  guardianPlayersFound: number;
  playersMatched: number;
  biosImported: number;
  specialTagsImported: number;
  photosDownloaded: number;
  photosMissing: number;
  matchExact: number;
  matchNormalized: number;
  matchApproximate: number;
  matchImpossible: number;
  teamsEnriched: number;
  unmatchedPlayers: MatchResult[];
}

// ============================================================================
// Team Mappings
// ============================================================================

const TEAM_NAME_MAPPING: Record<string, string> = {
  'Czechia': 'Tchéquie',
  'Mexico': 'Mexique',
  'South Africa': 'Afrique du Sud',
  'South Korea': 'Corée du Sud',
  'Bosnia and Herzegovina': 'Bosnie-Herzégovine',
  'Canada': 'Canada',
  'Qatar': 'Qatar',
  'Switzerland': 'Suisse',
  'Brazil': 'Brésil',
  'Haiti': 'Haïti',
  'Morocco': 'Maroc',
  'Scotland': 'Écosse',
  'Australia': 'Australie',
  'Paraguay': 'Paraguay',
  'Turkey': 'Turquie',
  'USA': 'États-Unis',
  'Curaçao': 'Curaçao',
  'Ecuador': 'Équateur',
  'Germany': 'Allemagne',
  "Côte d'Ivoire": "Côte d'Ivoire",
  'Japan': 'Japon',
  'Netherlands': 'Pays-Bas',
  'Sweden': 'Suède',
  'Tunisia': 'Tunisie',
  'Belgium': 'Belgique',
  'Egypt': 'Égypte',
  'Iran': 'Iran',
  'New Zealand': 'Nouvelle-Zélande',
  'Cape Verde': 'Cap-Vert',
  'Saudi Arabia': 'Arabie saoudite',
  'Spain': 'Espagne',
  'Uruguay': 'Uruguay',
  'France': 'France',
  'Iraq': 'Irak',
  'Norway': 'Norvège',
  'Senegal': 'Sénégal',
  'Algeria': 'Algérie',
  'Argentina': 'Argentine',
  'Austria': 'Autriche',
  'Jordan': 'Jordanie',
  'Colombia': 'Colombie',
  'DR Congo': 'RD Congo',
  'Portugal': 'Portugal',
  'Uzbekistan': 'Ouzbékistan',
  'Croatia': 'Croatie',
  'England': 'Angleterre',
  'Ghana': 'Ghana',
  'Panama': 'Panama',
};

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

// ============================================================================
// Utilities
// ============================================================================

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
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .replace(/[''`´""]/g, '')        // Remove apostrophes and quotes
    .replace(/[-–—]/g, '')           // Remove dashes completely (Al-Dawsari -> Aldawsari)
    .replace(/\s+/g, ' ')            // Normalize spaces
    .trim();
}

function normalizeArabicName(name: string): string {
  return normalizeForMatching(name)
    .replace(/\bal\s*/g, 'al')       // "Al " -> "al"
    .replace(/\bel\s*/g, 'el')       // "El " -> "el"
    .replace(/\s+/g, '');            // Remove all spaces for comparison
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// HTTP Utilities
// ============================================================================

function fetchJson(url: string): Promise<GuardianJsonResponse | null> {
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
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
      response.on('error', () => resolve(null));
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
        
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });
        
        fileStream.on('error', () => {
          fs.unlink(destPath, () => {});
          resolve(false);
        });
      }).on('error', () => resolve(false));
    };
    
    makeRequest(url);
  });
}

// ============================================================================
// Guardian JSON Parser
// ============================================================================

function parseGuardianJson(json: GuardianJsonResponse): GuardianPlayer[] {
  const players: GuardianPlayer[] = [];
  
  // Find the players sheet (could be "Players", "players", or first sheet)
  let playersData: Record<string, string>[] | undefined;
  
  if (json.sheets.Players) {
    playersData = json.sheets.Players;
  } else {
    // Try to find any sheet with player data
    for (const sheetName of Object.keys(json.sheets)) {
      const sheet = json.sheets[sheetName];
      if (sheet && sheet.length > 0 && sheet[0]) {
        // Check if it looks like player data (has name field)
        const firstRow = sheet[0];
        const keys = Object.keys(firstRow).map(k => k.toLowerCase());
        if (keys.some(k => k === 'name' || k.includes('player'))) {
          playersData = sheet;
          break;
        }
      }
    }
  }
  
  if (!playersData) return players;
  
  for (const row of playersData) {
    // Dynamic field detection
    const name = findField(row, ['name', 'player name', 'player']);
    const bio = findField(row, ['bio', 'biography']);
    const specialPlayer = findField(row, ['special player', 'special']);
    const gridImage = findField(row, ['grid_image', 'grid image', 'image']);
    const team = findField(row, ['team', 'country']);
    
    if (name) {
      players.push({
        name: name.trim(),
        bio: bio || '',
        specialPlayer: specialPlayer || '',
        gridImage: gridImage || '',
        team: team || '',
      });
    }
  }
  
  return players;
}

function findField(row: Record<string, string>, possibleKeys: string[]): string {
  for (const key of Object.keys(row)) {
    const lowerKey = key.toLowerCase().trim();
    for (const possible of possibleKeys) {
      if (lowerKey === possible || lowerKey.includes(possible) || possible.includes(lowerKey)) {
        return row[key] || '';
      }
    }
  }
  return '';
}

// ============================================================================
// Player Matching (6 Levels)
// ============================================================================

function matchPlayer(
  guardianName: string,
  teamPlayers: Player[],
  report: Report
): { player: Player | null; level: MatchLevel } {
  // Clean guardian name: remove quotes around nicknames
  const cleanGuardianName = guardianName.replace(/[''""]/g, '').trim();
  const normalizedGuardian = normalizeForMatching(cleanGuardianName);
  const guardianParts = normalizedGuardian.split(' ').filter(p => p.length > 0);
  const arabicGuardian = normalizeArabicName(cleanGuardianName);
  
  // Level 1: Exact match
  for (const player of teamPlayers) {
    if (player.playerName === guardianName || player.playerName === cleanGuardianName) {
      report.matchExact++;
      return { player, level: 'EXACT' };
    }
  }
  
  // Level 2: Normalized match
  for (const player of teamPlayers) {
    const normalizedPlayer = normalizeForMatching(player.playerName);
    if (normalizedPlayer === normalizedGuardian) {
      report.matchNormalized++;
      return { player, level: 'NORMALIZED' };
    }
    // Arabic name match (no spaces, no dashes)
    const arabicPlayer = normalizeArabicName(player.playerName);
    if (arabicPlayer === arabicGuardian && arabicGuardian.length > 5) {
      report.matchNormalized++;
      return { player, level: 'NORMALIZED' };
    }
  }
  
  // Level 3: Compound names - first + last word match
  for (const player of teamPlayers) {
    const normalizedFirst = normalizeForMatching(player.firstName);
    const normalizedLast = normalizeForMatching(player.lastName);
    const guardianFirst = guardianParts[0];
    const guardianLast = guardianParts[guardianParts.length - 1];
    
    if (guardianFirst === normalizedFirst && guardianLast === normalizedLast) {
      report.matchApproximate++;
      return { player, level: 'APPROXIMATE' };
    }
  }
  
  // Level 4: First name + last name anywhere in guardian name
  for (const player of teamPlayers) {
    const normalizedFirst = normalizeForMatching(player.firstName);
    const normalizedLast = normalizeForMatching(player.lastName);
    
    if (guardianParts.includes(normalizedFirst) && guardianParts.includes(normalizedLast)) {
      report.matchApproximate++;
      return { player, level: 'APPROXIMATE' };
    }
  }
  
  // Level 5: Last name only if unique in team
  const guardianLast = guardianParts[guardianParts.length - 1];
  for (const player of teamPlayers) {
    const normalizedLast = normalizeForMatching(player.lastName);
    if (normalizedLast === guardianLast && normalizedLast.length > 2) {
      const sameLastName = teamPlayers.filter(p => 
        normalizeForMatching(p.lastName) === normalizedLast
      );
      if (sameLastName.length === 1) {
        report.matchApproximate++;
        return { player, level: 'APPROXIMATE' };
      }
    }
  }
  
  // Level 6: Arabic name matching (Al-X vs AlX vs Al X)
  for (const player of teamPlayers) {
    // Check if last part matches
    const guardianLastArabic = normalizeArabicName(guardianParts[guardianParts.length - 1]);
    const playerLastArabic = normalizeArabicName(player.lastName);
    
    if (guardianLastArabic === playerLastArabic && guardianLastArabic.length > 4) {
      // Check first name too
      const guardianFirstArabic = normalizeArabicName(guardianParts[0]);
      const playerFirstArabic = normalizeArabicName(player.firstName);
      if (guardianFirstArabic === playerFirstArabic || 
          playerFirstArabic.includes(guardianFirstArabic) ||
          guardianFirstArabic.includes(playerFirstArabic)) {
        report.matchApproximate++;
        return { player, level: 'APPROXIMATE' };
      }
    }
  }
  
  // Level 7: Fuzzy match with partial name matching
  for (const player of teamPlayers) {
    const playerParts = normalizeForMatching(player.playerName).split(' ').filter(p => p.length > 0);
    
    let matches = 0;
    for (const gp of guardianParts) {
      if (gp.length < 2) continue;
      for (const pp of playerParts) {
        if (pp.length < 2) continue;
        if (gp === pp) {
          matches++;
          break;
        }
        if (gp.length > 3 && pp.length > 3) {
          if (gp.includes(pp) || pp.includes(gp)) {
            matches += 0.5;
            break;
          }
        }
      }
    }
    
    const threshold = Math.min(2, Math.max(1, playerParts.length - 1));
    if (matches >= threshold) {
      report.matchApproximate++;
      return { player, level: 'APPROXIMATE' };
    }
  }
  
  // Level 8: Single significant word match (for nicknames like "Neymar")
  if (guardianParts.length === 1 && guardianParts[0].length > 4) {
    for (const player of teamPlayers) {
      const playerParts = normalizeForMatching(player.playerName).split(' ');
      if (playerParts.some(pp => pp === guardianParts[0] || 
          (pp.length > 4 && guardianParts[0].length > 4 && 
           (pp.includes(guardianParts[0]) || guardianParts[0].includes(pp))))) {
        report.matchApproximate++;
        return { player, level: 'APPROXIMATE' };
      }
    }
  }
  
  report.matchImpossible++;
  return { player: null, level: 'IMPOSSIBLE' };
}

// ============================================================================
// Main Import Logic
// ============================================================================

async function main() {
  const dataDir = path.join(__dirname, '..', 'data');
  const publicDir = path.join(__dirname, '..', 'public');
  const playersImagesDir = path.join(publicDir, 'players');
  
  console.log('=== Guardian Data Import (Public JSON API) ===\n');
  
  // Load data files
  console.log('Loading data files...');
  
  const teamsDataPath = path.join(dataDir, 'teams-data.json');
  const teamsPath = path.join(dataDir, 'teams.json');
  const playersPath = path.join(dataDir, 'players.json');
  
  const teamsData: TeamsDataJson = JSON.parse(fs.readFileSync(teamsDataPath, 'utf-8'));
  const localTeams: LocalTeam[] = JSON.parse(fs.readFileSync(teamsPath, 'utf-8'));
  const playersData: PlayersJson = JSON.parse(fs.readFileSync(playersPath, 'utf-8'));
  
  console.log(`  - teams-data.json: ${teamsData.sheets.Teams.length} teams`);
  console.log(`  - teams.json: ${localTeams.length} teams`);
  console.log(`  - players.json: ${playersData.teams.length} teams\n`);
  
  const report: Report = {
    teamsProcessed: 0,
    jsonDownloaded: 0,
    jsonFailed: 0,
    guardianPlayersFound: 0,
    playersMatched: 0,
    biosImported: 0,
    specialTagsImported: 0,
    photosDownloaded: 0,
    photosMissing: 0,
    matchExact: 0,
    matchNormalized: 0,
    matchApproximate: 0,
    matchImpossible: 0,
    teamsEnriched: 0,
    unmatchedPlayers: [],
  };
  
  // ========================================================================
  // Step 1: Enrich teams.json from teams-data.json
  // ========================================================================
  
  console.log('Step 1: Enriching teams.json from teams-data.json...');
  
  for (const guardianTeam of teamsData.sheets.Teams) {
    const localName = TEAM_NAME_MAPPING[guardianTeam.Team];
    if (!localName) continue;
    
    const localTeam = localTeams.find(t => t.name === localName);
    if (!localTeam) continue;
    
    let enriched = false;
    
    if (!localTeam.fifaRanking && guardianTeam.FIFA_ranking) {
      localTeam.fifaRanking = parseInt(guardianTeam.FIFA_ranking, 10);
      enriched = true;
    }
    if (!localTeam.coach && guardianTeam.Coach) {
      localTeam.coach = guardianTeam.Coach;
      enriched = true;
    }
    if (!localTeam.bio && guardianTeam.Bio) {
      localTeam.bio = guardianTeam.Bio;
      enriched = true;
    }
    if (!localTeam.strengths && guardianTeam.strengths) {
      localTeam.strengths = guardianTeam.strengths;
      enriched = true;
    }
    if (!localTeam.weaknesses && guardianTeam.weaknesses) {
      localTeam.weaknesses = guardianTeam.weaknesses;
      enriched = true;
    }
    if (!localTeam.playerPick && guardianTeam.player_pick) {
      localTeam.playerPick = guardianTeam.player_pick;
      enriched = true;
    }
    
    if (enriched) report.teamsEnriched++;
  }
  
  fs.writeFileSync(teamsPath, JSON.stringify(localTeams, null, 2));
  console.log(`  ✅ ${report.teamsEnriched} teams enriched\n`);
  
  // ========================================================================
  // Step 2: Fetch all Guardian JSONs in parallel
  // ========================================================================
  
  console.log('Step 2: Fetching Guardian JSONs (48 teams)...');
  
  const fetchPromises = teamsData.sheets.Teams.map(async (team) => {
    const url = `https://interactive.guim.co.uk/docsdata/${team.spreadsheet}.json`;
    const json = await fetchJson(url);
    return { team, json };
  });
  
  const results = await Promise.allSettled(fetchPromises);
  
  const teamJsons: { team: GuardianTeamData; json: GuardianJsonResponse }[] = [];
  
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.json) {
      teamJsons.push({ team: result.value.team, json: result.value.json });
      report.jsonDownloaded++;
    } else {
      report.jsonFailed++;
    }
  }
  
  console.log(`  ✅ Downloaded: ${report.jsonDownloaded}/48`);
  console.log(`  ❌ Failed: ${report.jsonFailed}/48\n`);
  
  // ========================================================================
  // Step 3: Process each team's players
  // ========================================================================
  
  console.log('Step 3: Processing players...\n');
  
  for (const { team, json } of teamJsons) {
    report.teamsProcessed++;
    const teamCode = TEAM_CODE_MAPPING[team.Team];
    
    if (!teamCode) {
      console.log(`  [${report.teamsProcessed}/48] ${team.Team}: ❌ No code mapping`);
      continue;
    }
    
    const playersTeam = playersData.teams.find(t => t.code === teamCode);
    if (!playersTeam) {
      console.log(`  [${report.teamsProcessed}/48] ${team.Team} (${teamCode}): ❌ Team not found`);
      continue;
    }
    
    // Parse Guardian players
    const guardianPlayers = parseGuardianJson(json);
    report.guardianPlayersFound += guardianPlayers.length;
    
    if (guardianPlayers.length === 0) {
      console.log(`  [${report.teamsProcessed}/48] ${team.Team} (${teamCode}): ⚠️ No players in JSON`);
      continue;
    }
    
    let teamMatched = 0;
    let teamBios = 0;
    let teamTags = 0;
    let teamPhotos = 0;
    
    // Ensure team images directory exists
    const teamCodeLower = teamCode.toLowerCase();
    const teamImagesDir = path.join(playersImagesDir, teamCodeLower);
    if (!fs.existsSync(teamImagesDir)) {
      fs.mkdirSync(teamImagesDir, { recursive: true });
    }
    
    for (const gp of guardianPlayers) {
      const { player } = matchPlayer(gp.name, playersTeam.players, report);
      
      if (!player) {
        if (gp.bio || gp.gridImage) {
          report.unmatchedPlayers.push({
            guardianName: `${team.Team}: ${gp.name}`,
            playerName: null,
            level: 'IMPOSSIBLE',
          });
        }
        continue;
      }
      
      report.playersMatched++;
      teamMatched++;
      
      // Enrich bio
      if (!player.bio && gp.bio) {
        player.bio = gp.bio;
        report.biosImported++;
        teamBios++;
      }
      
      // Enrich special tag
      if (!player.specialTag && gp.specialPlayer) {
        player.specialTag = gp.specialPlayer;
        report.specialTagsImported++;
        teamTags++;
      }
      
      // Download image
      if (!player.image && gp.gridImage) {
        const imageSlug = slugify(player.playerName);
        const imageExt = gp.gridImage.includes('.png') ? 'png' : 'jpg';
        const imageName = `${imageSlug}.${imageExt}`;
        const imagePath = path.join(teamImagesDir, imageName);
        
        if (!fs.existsSync(imagePath)) {
          const downloaded = await downloadImage(gp.gridImage, imagePath);
          if (downloaded) {
            player.image = `/players/${teamCodeLower}/${imageName}`;
            report.photosDownloaded++;
            teamPhotos++;
          } else {
            report.photosMissing++;
          }
        } else {
          player.image = `/players/${teamCodeLower}/${imageName}`;
        }
      }
    }
    
    console.log(`  [${report.teamsProcessed}/48] ${team.Team} (${teamCode}): ${teamMatched}/${guardianPlayers.length} matched, ${teamBios} bios, ${teamTags} tags, ${teamPhotos} photos`);
    
    // Small delay to avoid rate limiting
    await delay(100);
  }
  
  // Save enriched players.json
  console.log('\nSaving players.json...');
  fs.writeFileSync(playersPath, JSON.stringify(playersData, null, 2));
  console.log('✅ Saved\n');
  
  // ========================================================================
  // Final Report
  // ========================================================================
  
  console.log('='.repeat(60));
  console.log('FINAL REPORT');
  console.log('='.repeat(60));
  console.log(`Équipes traitées : ${report.teamsProcessed}/48`);
  console.log(`JSON Guardian téléchargés : ${report.jsonDownloaded}/48`);
  console.log(`Joueurs Guardian trouvés : ${report.guardianPlayersFound}`);
  console.log(`Joueurs matchés : ${report.playersMatched}`);
  console.log(`Biographies importées : ${report.biosImported}`);
  console.log(`Special tags importés : ${report.specialTagsImported}`);
  console.log(`Images téléchargées : ${report.photosDownloaded}`);
  console.log(`Images manquantes : ${report.photosMissing}`);
  console.log(`Matchs exacts : ${report.matchExact}`);
  console.log(`Matchs normalisés : ${report.matchNormalized}`);
  console.log(`Matchs approximatifs : ${report.matchApproximate}`);
  console.log(`Matchs impossibles : ${report.matchImpossible}`);
  
  if (report.unmatchedPlayers.length > 0) {
    console.log(`\n⚠️ Joueurs non matchés (${report.unmatchedPlayers.length}):`);
    report.unmatchedPlayers.slice(0, 30).forEach(m => {
      console.log(`  - ${m.guardianName}`);
    });
    if (report.unmatchedPlayers.length > 30) {
      console.log(`  ... et ${report.unmatchedPlayers.length - 30} autres`);
    }
  }
  
  // Quality checks
  console.log('\n=== Quality Checks ===');
  const totalPlayers = playersData.teams.reduce((sum, t) => sum + t.players.length, 0);
  const playersWithBio = playersData.teams.reduce((sum, t) => sum + t.players.filter(p => p.bio).length, 0);
  const playersWithImage = playersData.teams.reduce((sum, t) => sum + t.players.filter(p => p.image).length, 0);
  
  console.log(`Total joueurs : ${totalPlayers}`);
  console.log(`Joueurs avec bio : ${playersWithBio} (${(playersWithBio/totalPlayers*100).toFixed(1)}%)`);
  console.log(`Joueurs avec image : ${playersWithImage} (${(playersWithImage/totalPlayers*100).toFixed(1)}%)`);
}

main().catch(console.error);
