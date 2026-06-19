import type { ManualPlayer, ManualTeam } from "@/types/worldcup-manual";
import type { MatchEvent } from "@/types/match-events";
import { createMatchEvent } from "@/lib/tournament-engine/events";

/**
 * Import d'un rapport Wikipédia de match.
 *
 * Convertit le texte brut collé d'une feuille de match Wikipédia (français)
 * en `MatchEvent[]` exploitables par la pipeline existante (results.json,
 * classements, statistiques, scénarios…).
 *
 * Règles clés :
 *  - le match est imposé (jamais déduit du texte)
 *  - l'équipe d'un événement est déduite du joueur (player.teamId), jamais de
 *    la position dans le texte
 *  - un CSC est crédité à l'équipe adverse au score, mais l'événement conserve
 *    le `teamCode` de l'équipe réelle du joueur (`isOwnGoal: true`)
 *  - un joueur introuvable n'interrompt jamais l'import (nom brut + warning)
 */

export type ParsedEventKind = "goal" | "yellow_card" | "red_card";

export type ParsedEvent = {
  kind: ParsedEventKind;
  /** Nom brut tel que détecté dans le texte */
  rawPlayer: string;
  /** Nom résolu (roster) ou nom brut si introuvable */
  playerName: string;
  /** Identifiant joueur résolu, sinon "" */
  playerId: string;
  /** Code de l'équipe réelle du joueur (ou équipe devinée en secours) */
  teamCode: string;
  /** Nom de l'équipe réelle du joueur */
  teamName: string;
  minute: number;
  addedTime?: number;
  assist?: string;
  assistId?: string;
  isOwnGoal?: boolean;
  isPenalty?: boolean;
  /** Joueur introuvable dans les deux effectifs */
  unmatched?: boolean;
  /** Alternatives disponibles en cas d'ambiguïté */
  alternatives?: Array<{ player: ManualPlayer; team: ManualTeam }>;
};

export type WikipediaImportResult = {
  events: ParsedEvent[];
  warnings: string[];
  homeScore: number;
  awayScore: number;
  needsVerification: boolean;
};

type Roster = { team: ManualTeam; players: ManualPlayer[] };

const IGNORE_LINE = /^rapport$|^\[archive\]$|^spectateur|^affluence|^arbitrage|^arbitre/i;

const RED_RE = /carton\s+rouge|expuls/i;
const YELLOW_RE = /averti|carton\s+jaune/i;
const GOAL_RE = /but\s+inscrit|\bbut\b/i;

/** Normalise un nom : accents, apostrophes, tirets, casse. */
export function normalizeName(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, " ")
    .replace(/[-]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Extrait minute (+ temps additionnel) depuis un marqueur « 45+5e ». */
function extractMinute(line: string): { minute: number; addedTime?: number } | null {
  const m = line.match(/(\d{1,3})(?:\s*\+\s*(\d{1,3}))?\s*e\b/);
  if (!m) {
    // Secours : « après 28 minutes »
    const alt = line.match(/apr[èe]s\s+(\d{1,3})(?:\s*\+\s*(\d{1,3}))?\s*minutes?/i);
    if (!alt) return null;
    return {
      minute: Number(alt[1]),
      addedTime: alt[2] != null ? Number(alt[2]) : undefined,
    };
  }
  return {
    minute: Number(m[1]),
    addedTime: m[2] != null ? Number(m[2]) : undefined,
  };
}

/** Extrait le passeur depuis « (Passe décisive X) » ou « (X Passe décisive) ». */
function extractAssist(line: string): string | null {
  // Try both formats: "Passe décisive X" and "X Passe décisive"
  const m1 = line.match(/passes?\s+d[ée]cisives?\s+([^)]+)\)/i);
  if (m1) {
    return m1[1].split(/[,;]/)[0].replace(/\bet\b.*$/i, "").trim() || null;
  }
  const m2 = line.match(/\(([^)]+)\s+passes?\s+d[ée]cisives?\)/i);
  if (m2) {
    return m2[1].split(/[,;]/)[0].replace(/\bet\b.*$/i, "").trim() || null;
  }
  return null;
}

/** Supprime tout le boilerplate d'une ligne pour ne garder que le nom du joueur. */
function extractPlayerName(line: string): string {
  let s = ` ${line} `;
  // Bloc passe décisive - handle both formats: "(Passe décisive X)" and "(X Passe décisive)"
  s = s.replace(/\(\s*[^)]*\s+passes?\s+d[ée]cisives?\s*\)/gi, " ");
  s = s.replace(/\(\s*passes?\s+d[ée]cisives?\s+[^)]*\)/gi, " ");
  // Score courant « (0 - 1) »
  s = s.replace(/\(\s*\d+\s*[-–]\s*\d+\s*\)/g, " ");
  // Drapeaux
  s = s.replace(/\(\s*csc\s*\)/gi, " ");
  s = s.replace(/\(\s*(pen\.?|s\.?\s*p\.?|penalty)\s*\)/gi, " ");
  // Phrases d'événement
  s = s.replace(/but\s+inscrit\s+apr[èe]s\s+\d+(?:\s*\+\s*\d+)?\s+minutes?/gi, " ");
  s = s.replace(/averti\s+apr[èe]s\s+\d+(?:\s*\+\s*\d+)?\s+minutes?/gi, " ");
  s = s.replace(/carton\s+(jaune|rouge)/gi, " ");
  s = s.replace(/\bexpuls[ée]e?s?\b/gi, " ");
  s = s.replace(/\bbut\b/gi, " ");
  s = s.replace(/\baverti\b/gi, " ");
  // Marqueurs minute « 45+5e »
  s = s.replace(/\d{1,3}(?:\s*\+\s*\d{1,3})?\s*e\b/g, " ");
  // Mots résiduels
  s = s.replace(/\bapr[èe]s\b/gi, " ");
  s = s.replace(/\bminutes?\b/gi, " ");
  s = s.replace(/\d+/g, " ");
  s = s.replace(/[•·▪◦*+\-–—|]/g, " ");
  return s.replace(/\s+/g, " ").trim();
}

/** Recherche un joueur dans les deux effectifs avec normalisation. */
function matchPlayer(
  raw: string,
  rosters: Roster[],
  preferredTeamId?: number,
  hasTeamContext?: boolean
): { player: ManualPlayer; team: ManualTeam; ambiguous: boolean; alternatives?: Array<{ player: ManualPlayer; team: ManualTeam }> } | null {
  const target = normalizeName(raw);
  if (!target) return null;
  const targetParts = target.split(" ");
  
  // Check if raw input has dots (abbreviation) BEFORE normalization
  const hasAbbreviation = raw.includes(".");
  const rawParts = raw.trim().split(/\s+/).filter(p => p.length > 0);

  // Manual overrides for specific problematic cases
  const manualOverrides: Record<string, { id: number; teamId: number }> = {
    "mohebi": { id: 580, teamId: 27 }, // Mohammad Mohebbi M. (Iran)
    "hajsafi": { id: 575, teamId: 27 }, // Ehsan Haji Safi E. (Iran)
    "rezaeian": { id: 9488, teamId: 27 }, // Ramin Rezaeiansemeskandi (Iran)
    "rezaei": { id: 9488, teamId: 27 }, // Ramin Rezaeiansemeskandi (Iran) - alternate spelling
    "reza": { id: 9488, teamId: 27 }, // Ramin Rezaeiansemeskandi (Iran) - short form
    "hany": { id: 6681, teamId: 33 }, // Mohamed Hany Gamal Eldemerdash M. (Egypt)
    "de cuyper": { id: 1732, teamId: 4 }, // Maxim Peter M De Cuyper (Belgium)
    "fatouh": { id: 429, teamId: 26 }, // Ahmed Mohamed Aboelfetouh Mohamed (Egypt)
    "i ndiaye": { id: 15944, teamId: 30 }, // Iliman Cheikh Baroy Ndiaye (Senegal) - normalized form
    "al-rawabdeh": { id: 658, teamId: 40 }, // Noor Al-Deen Mahmoud Ali Al (Jordan)
    "j neves": { id: 899, teamId: 41 }, // João Pedro Gonçalves Neves João (Portugal)
    "t araujo": { id: 888, teamId: 41 }, // Tomás Lemos Araújo (Portugal)
    "t araujo r": { id: 888, teamId: 41 }, // Tomás Lemos Araújo (Portugal) - with suffix
  };

  const override = manualOverrides[target];
  if (override) {
    for (const r of rosters) {
      if (r.team.id === override.teamId) {
        const player = r.players.find(p => p.id === override.id);
        if (player) {
          return { player, team: r.team, ambiguous: false };
        }
      }
    }
  }

  type Cand = { player: ManualPlayer; team: ManualTeam; score: number };
  const candidates: Cand[] = [];

  for (const r of rosters) {
    for (const p of r.players) {
      const full = normalizeName(p.name);
      if (!full) continue;
      const parts = full.split(" ");
      const last = parts[parts.length - 1];
      
      // Also check nameOnShirt if available
      const nameOnShirt = p.nameOnShirt ? normalizeName(p.nameOnShirt) : null;
      let score = 0;

      if (full === target) score = 100;
      else if (last === target) score = 85;
      else if (parts.includes(target)) score = 70;
      else if (targetParts.length > 1 && full.includes(target)) score = 65;
      else if (targetParts.length > 1 && targetParts.every((t) => parts.includes(t)))
        score = 60;
      else if (target.length >= 4 && last.length >= 4 && last.includes(target))
        score = 45;
      else if (target.length >= 4 && full.includes(target)) score = 35;
      
      // Check against nameOnShirt if available (higher priority since it's the shirt name)
      // BUT reduce priority if there are multiple players with same nameOnShirt and we have an abbreviation
      if (nameOnShirt) {
        let nameOnShirtScore = nameOnShirt === target ? 95 : 
          (nameOnShirt.includes(target) || target.includes(nameOnShirt)) ? 75 : 0;
        
        // Handle double letter variations in nameOnShirt (mohebi vs mohebbi, hajsafi vs hajisafi)
        if (nameOnShirtScore === 0) {
          const targetSimplified = target.replace(/([a-z])\1+/g, "$1");
          const nameOnShirtSimplified = nameOnShirt.replace(/([a-z])\1+/g, "$1");
          if (targetSimplified === nameOnShirtSimplified) {
            nameOnShirtScore = 85;
          }
          else if (nameOnShirtSimplified.includes(targetSimplified) || targetSimplified.includes(nameOnShirtSimplified)) {
            const lengthDiff = Math.abs(targetSimplified.length - nameOnShirtSimplified.length);
            if (lengthDiff <= 1) {
              nameOnShirtScore = 80;
            }
          }
          // Handle case where target is substring of nameOnShirt (mohebi vs mohebbi)
          else if (nameOnShirt.includes(target) && target.length >= 4) {
            const ratio = target.length / nameOnShirt.length;
            if (ratio >= 0.7) {
              nameOnShirtScore = 70;
            }
          }
        }
        
        // Only apply nameOnShirt score if we don't have a high-confidence abbreviation match
        // This prevents "I. Ndiaye" from matching any player with nameOnShirt "Ndiaye"
        if (hasAbbreviation && nameOnShirtScore >= 75) {
          // Reduce nameOnShirt priority when we have an abbreviation
          score = Math.max(score, nameOnShirtScore - 20);
        } else {
          score = Math.max(score, nameOnShirtScore);
        }
      }
      
      // Handle partial last name matches (e.g., "Amri" vs "Alamri", "Al Amri" vs "Alamri")
      // Only apply if score is still 0 AND we haven't found a good match yet
      if (score === 0 && targetParts.length >= 1) {
        const targetLastPart = targetParts[targetParts.length - 1];
        
        // Handle compound names separated by space (haji safi vs hajisafi) - HIGHEST PRIORITY
        const targetJoined = targetParts.join("");
        if (targetJoined.length >= 4 && (last === targetJoined || targetJoined === last)) {
          score = 70; // High score for exact compound match
        }
        
        // Check if target last name is contained in player last name or vice versa
        // Only if length difference is small to avoid false positives
        else if (targetLastPart.length >= 4 && last.length >= 4) {
          const lengthDiff = Math.abs(targetLastPart.length - last.length);
          if (lengthDiff <= 2 && (last.includes(targetLastPart) || targetLastPart.includes(last))) {
            score = 50;
          }
        }
        // Handle "Al Amri" vs "Alamri" - remove common prefixes
        else {
          const prefixes = ["al", "el", "abd", "bin", "ben"];
          const targetWithoutPrefix = prefixes.reduce((acc, prefix) => 
            acc.startsWith(prefix) ? acc.slice(prefix.length).trim() : acc, targetLastPart);
          const lastWithoutPrefix = prefixes.reduce((acc, prefix) => 
            acc.startsWith(prefix) ? acc.slice(prefix.length).trim() : acc, last);
          if (targetWithoutPrefix.length >= 4 && lastWithoutPrefix.length >= 4) {
            const lengthDiff = Math.abs(targetWithoutPrefix.length - lastWithoutPrefix.length);
            if (lengthDiff <= 2 && (lastWithoutPrefix.includes(targetWithoutPrefix) || targetWithoutPrefix.includes(lastWithoutPrefix))) {
              score = 55;
            }
          }
        }
        
        // Handle double letter variations (mohebi vs mohebbi, hajsafi vs hajisafi)
        // Only if the simplified versions are very similar
        const targetSimplified = targetLastPart.replace(/([a-z])\1+/g, "$1");
        const lastSimplified = last.replace(/([a-z])\1+/g, "$1");
        if (targetSimplified.length >= 4 && lastSimplified.length >= 4) {
          if (targetSimplified === lastSimplified) {
            score = Math.max(score, 65);
          }
          // Also check if one is contained in the other after simplification
          else if (lastSimplified.includes(targetSimplified) || targetSimplified.includes(lastSimplified)) {
            const lengthDiff = Math.abs(targetSimplified.length - lastSimplified.length);
            if (lengthDiff <= 1) {
              score = Math.max(score, 60);
            }
          }
        }
        
        // Handle single letter differences - ONLY if very similar
        if (targetLastPart.length >= 5 && last.length >= 5) {
          let diffCount = 0;
          const maxLen = Math.max(targetLastPart.length, last.length);
          for (let i = 0; i < maxLen; i++) {
            if (targetLastPart[i] !== last[i]) diffCount++;
          }
          // If only 1 character difference and length is identical, it's a match
          if (diffCount === 1 && targetLastPart.length === last.length) {
            score = Math.max(score, 60);
          }
        }
        
        // Also check against full name for compound names like "Hajsafi" vs "Haji Safi"
        // Only if the match is very strong
        if (full.includes(target) && target.length >= 5) {
          const ratio = target.length / full.length;
          if (ratio >= 0.7) { // Target must be at least 70% of full name
            score = Math.max(score, 55);
          }
        }
      }
      
      // Handle abbreviations: "R. Khedira" should match "Rani Khedira"
      // Check if raw input has dots (abbreviation)
      if (hasAbbreviation && score === 0) {
        // Try matching with initials from raw parts
        if (rawParts.length === 2 && parts.length >= 2) {
          const rawInitial = rawParts[0].replace(/\./g, "").toLowerCase();
          const rawLast = normalizeName(rawParts[1]);
          const playerFirst = parts[0];
          const playerLast = parts[parts.length - 1];
          
          // Check if last name matches and first name starts with the initial - HIGHEST SCORE
          if (playerLast === rawLast && playerFirst.startsWith(rawInitial)) {
            score = 85; // Increased from 80 to prioritize exact initial match
          }
          // Check if first name starts with initial and last name is similar
          else if (playerFirst.startsWith(rawInitial) && playerLast.includes(rawLast)) {
            score = 70;
          }
          // Check if last name matches exactly (just last name with initial) - LOWER SCORE
          // This prevents ambiguity when multiple players have same last name
          else if (playerLast === rawLast) {
            score = 60; // Reduced from 75 to avoid ambiguity with same last name
          }
        }
        // Handle single initial + last name like "Khedira" from "R. Khedira"
        else if (rawParts.length === 2) {
          const rawLast = normalizeName(rawParts[1]);
          if (last === rawLast) {
            score = 60; // Reduced from 75 to avoid ambiguity
          }
        }
      }
      
      // Handle single word match (just last name)
      if (targetParts.length === 1 && last === target) {
        score = Math.max(score, 75);
      }

      // Boost score if player is from preferred team AND we have explicit team context
      // Don't boost if team context is unclear to avoid misassigning players
      if (score > 0 && preferredTeamId === r.team.id && hasTeamContext) {
        score += 20;
      }

      if (score > 0) candidates.push({ player: p, team: r.team, score });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  
  // Flag ambiguity if there are multiple candidates with the same score (same team OR different teams)
  let ambiguous = candidates.some(
    (c) => c !== best && c.score === best.score
  );
  
  // Also flag ambiguity if there are multiple players with same last name
  // This handles common surnames like "Ndiaye", "Diop", etc.
  // BUT NOT if we have a high-confidence abbreviation match (score >= 85)
  if (!ambiguous && candidates.length > 1 && best.score < 85) {
    const bestLastName = best.player.name.split(" ").pop()?.toLowerCase();
    const sameLastNameCount = candidates.filter(
      (c) => c.player.name.split(" ").pop()?.toLowerCase() === bestLastName
    ).length;
    if (sameLastNameCount > 1) {
      ambiguous = true;
    }
  }
  
  // Also flag ambiguity if there are multiple players with same nameOnShirt
  // BUT NOT if we have a high-confidence abbreviation match (score >= 85) AND the input has dots
  if (!ambiguous && candidates.length > 1) {
    const bestNameOnShirt = (best.player as any).nameOnShirt?.toLowerCase();
    if (bestNameOnShirt) {
      const sameNameOnShirtCount = candidates.filter(
        (c) => ((c.player as any).nameOnShirt?.toLowerCase() === bestNameOnShirt)
      ).length;
      // Force ambiguity if multiple players share nameOnShirt AND input has no dots (not an abbreviation)
      if (sameNameOnShirtCount > 1 && !hasAbbreviation) {
        ambiguous = true;
      }
      // Also force ambiguity if score is low even with abbreviation
      else if (sameNameOnShirtCount > 1 && best.score < 85) {
        ambiguous = true;
      }
    }
  }
  
  // Return alternatives for UI selection when ambiguous
  // Include all candidates with same last name or nameOnShirt when ambiguous
  const alternatives = ambiguous
    ? candidates.filter((c) => {
        const sameLastName = c.player.name.split(" ").pop()?.toLowerCase() === best.player.name.split(" ").pop()?.toLowerCase();
        const sameNameOnShirt = ((c.player as any).nameOnShirt?.toLowerCase() === (best.player as any).nameOnShirt?.toLowerCase());
        return sameLastName || sameNameOnShirt;
      }).map((c) => ({ player: c.player, team: c.team }))
    : undefined;
  
  // When ambiguous, don't return a player to force user selection
  if (ambiguous) {
    return { 
      player: best.player, 
      team: best.team, 
      ambiguous: true, 
      alternatives 
    };
  }
  
  return { player: best.player, team: best.team, ambiguous: false, alternatives };
}

export function parseWikipediaReport(
  rawText: string,
  homeTeam: ManualTeam,
  awayTeam: ManualTeam,
  players: ManualPlayer[]
): WikipediaImportResult {
  const homePlayers = players.filter((p) => p.teamId === homeTeam.id);
  const awayPlayers = players.filter((p) => p.teamId === awayTeam.id);
  const rosters: Roster[] = [
    { team: homeTeam, players: homePlayers },
    { team: awayTeam, players: awayPlayers },
  ];

  const warnings: string[] = [];
  const events: ParsedEvent[] = [];
  let needsVerification = false;

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Split lines that contain multiple events (multiple minute markers or "Rapport [archive]" separator)
  const expandedLines: string[] = [];
  for (const line of lines) {
    const minuteMatches = line.match(/\d{1,3}(?:\s*\+\s*\d{1,3})?\s*e\b/g);
    const hasRapportSeparator = /rapport/i.test(line);
    const hasMetadataSeparator = /spectateurs|arbitrage|arbitre\s+vidéo|affluence/i.test(line);

    if ((minuteMatches && minuteMatches.length > 1) || hasRapportSeparator || hasMetadataSeparator) {
      // First split by metadata keywords and "Rapport"
      const splitPattern = /spectateurs|arbitrage|arbitre\s+vidéo|affluence|rapport/i;
      const segments = line.split(splitPattern);
      for (const segment of segments) {
        if (!segment.trim()) continue;
        // Clean segment: remove [archive], brackets, extra whitespace
        const cleanedSegment = segment
          .replace(/\[?\s*archive\s*\]?/gi, "")
          .replace(/\[|\]/g, "")
          .replace(/\s+/g, " ")
          .trim();
        if (!cleanedSegment) continue;

        // Then split each segment by minute markers if there are multiple
        const segmentMinuteMatches = cleanedSegment.match(/\d{1,3}(?:\s*\+\s*\d{1,3})?\s*e\b/g);
        if (segmentMinuteMatches && segmentMinuteMatches.length > 1) {
          // Split by minute markers but keep markers with their associated content
          const parts = cleanedSegment.split(/(\d{1,3}(?:\s*\+\s*\d{1,3})?\s*e\b)/);
          // parts will be: [text1, marker1, text2, marker2, text3, ...]
          for (let i = 1; i < parts.length; i += 2) {
            const marker = parts[i];
            const textBefore = parts[i - 1] || "";
            // Only take text after the marker up to the next marker or score
            const textAfter = parts[i + 1] || "";
            // Stop at next minute marker OR score pattern (score separates events)
            // Include CSC/penalty markers as they belong to the current event
            const nextMarkerIndex = textAfter.search(/\d{1,3}(?:\s*\+\s*\d{1,3})?\s*e\b|\(\s*\d+\s*[-–]\s*\d+\s*\)/);
            const relevantTextAfter = nextMarkerIndex >= 0 ? textAfter.substring(0, nextMarkerIndex) : textAfter;
            // Combine: text before + marker + relevant text after
            const part = (textBefore + marker + relevantTextAfter).trim();
            if (part) expandedLines.push(part);
          }
        } else if (segmentMinuteMatches && segmentMinuteMatches.length === 1) {
          // Single minute marker in segment - keep as is
          expandedLines.push(cleanedSegment);
        } else {
          // No minute marker but still content - might be incomplete event, keep for processing
          expandedLines.push(cleanedSegment);
        }
      }
    } else {
      expandedLines.push(line);
    }
  }

  for (const line of expandedLines) {
    if (IGNORE_LINE.test(line)) continue;

    let kind: ParsedEventKind | null = null;
    if (RED_RE.test(line)) kind = "red_card";
    else if (YELLOW_RE.test(line)) kind = "yellow_card";
    else if (GOAL_RE.test(line)) kind = "goal";
    if (!kind) continue;

    const time = extractMinute(line);
    if (!time) continue; // ligne sans minute = pas un événement exploitable

    const rawPlayer = extractPlayerName(line);
    if (!rawPlayer) {
      warnings.push(`Ligne ignorée (joueur introuvable) : « ${line} »`);
      continue;
    }

    let isOwnGoal = false;
    const isPenalty =
      kind === "goal" &&
      /\(\s*(pen\.?|s\.?\s*p\.?|penalty)\s*\)/i.test(line);

    // CSC detection - check for CSC markers anywhere in the line
    // Pattern: "Player Name Team 19' (CSC)" or "Player Name Team 19' CSC" or "Inscrit contre son camp"
    if (kind === "goal") {
      const cscInParens = /\(\s*csc\s*\)/i;
      const cscWithoutParens = /\bcsc\b/i;
      const contreSonCamp = /contre\s+son\s+camp/i;
      
      if (cscInParens.test(line) || cscWithoutParens.test(line) || contreSonCamp.test(line)) {
        isOwnGoal = true;
      }
    }

    // CSC and penalty should be mutually exclusive
    // If both markers present, penalty takes precedence (more common)
    if (isOwnGoal && isPenalty) {
      // Clear CSC flag if penalty is also present
      // This handles cases where both markers appear on the same line
      isOwnGoal = false;
    }

    // Try to infer team from line content (team name mentioned)
    let preferredTeamId: number | undefined;
    let hasTeamContext = false;
    if (homeTeam.name && line.toLowerCase().includes(homeTeam.name.toLowerCase())) {
      preferredTeamId = homeTeam.id;
      hasTeamContext = true;
    } else if (awayTeam.name && line.toLowerCase().includes(awayTeam.name.toLowerCase())) {
      preferredTeamId = awayTeam.id;
      hasTeamContext = true;
    }

    // If no team name in line, try to infer from score context
    if (!preferredTeamId && kind === "goal" && !isOwnGoal) {
      const scoreMatch = line.match(/\(\s*(\d+)\s*[-–]\s*(\d+)\s*\)/);
      if (scoreMatch) {
        const homeScore = parseInt(scoreMatch[1], 10);
        const awayScore = parseInt(scoreMatch[2], 10);
        // If this is a goal event, check which team's score increased
        // This is a heuristic - we need to track running score to be accurate
        // For now, prefer the team that's not the CSC team (if CSC is mentioned)
        if (isOwnGoal) {
          // CSC is against a team, so prefer the opposing team
          preferredTeamId = homeTeam.id; // default, will be refined
        }
      }
    }

    const matched = matchPlayer(rawPlayer, rosters, preferredTeamId, hasTeamContext);
    let teamCode: string;
    let teamName: string;
    let playerId = "";
    let playerName = rawPlayer;
    let unmatched = false;

    if (matched) {
      teamCode = matched.team.code;
      teamName = matched.team.name;
      // Only set playerId if not ambiguous - force user selection for ambiguous cases
      if (!matched.ambiguous) {
        playerId = String(matched.player.id);
      } else {
        playerId = ""; // Empty to force user selection
        needsVerification = true;
      }
      playerName = matched.player.name;
      if (matched.ambiguous) {
        warnings.push(
          `Joueur ambigu « ${rawPlayer} » — sélectionnez le bon joueur dans la liste.`
        );
      }
    } else {
      // Joueur introuvable : on garde l'événement mais équipe inconnue à vérifier
      unmatched = true;
      teamCode = "UNKNOWN";
      teamName = "À vérifier";
      playerId = "";
      playerName = rawPlayer;
      needsVerification = true;
      warnings.push(
        `Joueur introuvable « ${rawPlayer} » — équipe à vérifier manuellement.`
      );
    }

    let assist: string | undefined;
    let assistId: string | undefined;
    if (kind === "goal" && !isOwnGoal) {
      const rawAssist = extractAssist(line);
      if (rawAssist) {
        const assistMatch = matchPlayer(rawAssist, rosters, preferredTeamId, hasTeamContext);
        if (assistMatch) {
          assist = assistMatch.player.name;
          assistId = String(assistMatch.player.id);
        } else {
          assist = rawAssist;
          warnings.push(`Passeur introuvable « ${rawAssist} » — nom conservé.`);
        }
      }
    }

    events.push({
      kind,
      rawPlayer,
      playerName,
      playerId,
      teamCode,
      teamName,
      minute: time.minute,
      addedTime: time.addedTime,
      assist,
      assistId,
      isOwnGoal: isOwnGoal || undefined,
      isPenalty: isPenalty || undefined,
      unmatched: unmatched || undefined,
      alternatives: matched?.alternatives,
    });
  }

  events.sort(
    (a, b) => a.minute - b.minute || (a.addedTime ?? 0) - (b.addedTime ?? 0)
  );

  // Score (CSC inversé) - ignore events with UNKNOWN team
  let homeScore = 0;
  let awayScore = 0;
  for (const e of events) {
    if (e.kind !== "goal") continue;
    if (e.teamCode === "UNKNOWN") continue; // Skip goals from unmatched players
    const isHome = e.teamCode === homeTeam.code;
    const isAway = e.teamCode === awayTeam.code;
    if (e.isOwnGoal) {
      if (isHome) awayScore++;
      else if (isAway) homeScore++;
    } else if (isHome) homeScore++;
    else if (isAway) awayScore++;
  }

  if (events.length === 0) {
    warnings.push("Aucun événement détecté dans le texte collé.");
  }

  return { events, warnings, homeScore, awayScore, needsVerification };
}

/** Convertit les événements analysés en `MatchEvent[]` pour la pipeline. */
export function parsedEventsToMatchEvents(parsed: ParsedEvent[]): MatchEvent[] {
  const out: MatchEvent[] = [];
  for (const e of parsed) {
    if (e.kind === "goal") {
      const goal = createMatchEvent({
        minute: e.minute,
        addedTime: e.addedTime,
        type: "goal",
        playerId: e.playerId,
        playerName: e.playerName,
        teamCode: e.teamCode,
        isOwnGoal: e.isOwnGoal,
      });
      out.push(goal);
      if (e.assist && !e.isOwnGoal) {
        out.push(
          createMatchEvent({
            minute: e.minute,
            addedTime: e.addedTime,
            type: "assist",
            playerId: e.assistId ?? "",
            playerName: e.assist,
            teamCode: e.teamCode,
            linkedGoalId: goal.id,
          })
        );
      }
      continue;
    }
    out.push(
      createMatchEvent({
        minute: e.minute,
        addedTime: e.addedTime,
        type: e.kind,
        playerId: e.playerId,
        playerName: e.playerName,
        teamCode: e.teamCode,
      })
    );
  }
  return out;
}
