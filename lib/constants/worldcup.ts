/** Coupe du Monde FIFA 2026 — identifiants API-Football officiels */
export const WORLD_CUP_LEAGUE_ID = 1;
export const WORLD_CUP_SEASON = 2026;

/** Toutes les requêtes API — cache ISR 1h (pas de polling / live). */
export const REVALIDATE_DEFAULT = 3600;

export const WORLD_CUP_STATS = {
  teams: 48,
  matches: 104,
  stadiums: 16,
  groups: 12,
} as const;
