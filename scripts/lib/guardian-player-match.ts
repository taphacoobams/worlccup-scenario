export interface MatchableFlatPlayer {
  name: string;
}

export function normalizeForMatching(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\u2018\u2019\u2032'`´""]/g, "")
    .replace(/[-–—]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeArabicName(name: string): string {
  return normalizeForMatching(name)
    .replace(/\bal\s*/g, "al")
    .replace(/\bel\s*/g, "el")
    .replace(/\s+/g, "");
}

function nameTokens(name: string): string[] {
  return normalizeForMatching(name).split(" ").filter((p) => p.length > 0);
}

/**
 * Associe un nom Guardian (nom complet) à un joueur FIFA (colonne PLAYER NAME).
 */
export function matchGuardianToPlayer<T extends MatchableFlatPlayer>(
  guardianName: string,
  teamPlayers: T[]
): T | null {
  if (teamPlayers.length === 0) return null;

  const cleanGuardianName = guardianName.replace(/[''""]/g, "").trim();
  const normalizedGuardian = normalizeForMatching(cleanGuardianName);
  const guardianParts = nameTokens(cleanGuardianName);
  const arabicGuardian = normalizeArabicName(cleanGuardianName);

  for (const raw of teamPlayers) {
    if (raw.name === guardianName || raw.name === cleanGuardianName) return raw;
  }

  for (const raw of teamPlayers) {
    if (normalizeForMatching(raw.name) === normalizedGuardian) return raw;
    if (normalizeArabicName(raw.name) === arabicGuardian && arabicGuardian.length > 5) {
      return raw;
    }
  }

  const guardianLast = guardianParts[guardianParts.length - 1];
  for (const raw of teamPlayers) {
    const playerNorm = normalizeForMatching(raw.name);
    if (playerNorm === guardianLast && guardianLast.length > 2) {
      const sameLast = teamPlayers.filter(
        (p) => normalizeForMatching(p.name) === guardianLast
      );
      if (sameLast.length === 1) return raw;
    }
    if (guardianParts.includes(playerNorm) && playerNorm.length > 2) {
      const candidates = teamPlayers.filter((p) =>
        guardianParts.includes(normalizeForMatching(p.name))
      );
      if (candidates.length === 1) return raw;
    }
  }

  for (const raw of teamPlayers) {
    const playerParts = nameTokens(raw.name);
    let matches = 0;
    for (const gp of guardianParts) {
      if (gp.length < 2) continue;
      for (const pp of playerParts) {
        if (pp.length < 2) continue;
        if (gp === pp) {
          matches++;
          break;
        }
        if (gp.length > 3 && pp.length > 3 && (gp.includes(pp) || pp.includes(gp))) {
          matches += 0.5;
          break;
        }
      }
    }
    const threshold = Math.min(2, Math.max(1, playerParts.length));
    if (matches >= threshold) return raw;
  }

  if (guardianParts.length === 1 && guardianParts[0].length > 3) {
    for (const raw of teamPlayers) {
      const playerParts = nameTokens(raw.name);
      if (
        playerParts.some(
          (pp) =>
            pp === guardianParts[0] ||
            (pp.length > 3 &&
              guardianParts[0].length > 3 &&
              (pp.includes(guardianParts[0]) || guardianParts[0].includes(pp)))
        )
      ) {
        const candidates = teamPlayers.filter((p) => {
          const parts = nameTokens(p.name);
          return parts.some((pp) => pp === guardianParts[0] || pp.includes(guardianParts[0]));
        });
        if (candidates.length === 1) return raw;
      }
    }
  }

  return null;
}
