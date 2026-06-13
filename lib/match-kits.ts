import "server-only";

import { readFileSync } from "fs";
import path from "path";
import { cache } from "react";
import { toFifa3Code } from "@/lib/fifa-codes";
import type { PlayerKit, TeamKitImage } from "@/types/match-kits";

type KitsMatch = {
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
  kits: Record<string, { player: PlayerKit }>;
};

type KitsDocument = {
  matches: KitsMatch[];
};

type TeamKitEntry = {
  match: number;
  filename: string;
  colors: string[];
};

type TeamKitsDocument = Record<string, { matches: TeamKitEntry[] }>;

const KITS_PATH = path.join(process.cwd(), "public", "data", "kits.json");
const TEAM_KITS_PATH = path.join(process.cwd(), "public", "data", "team-kits.json");

function loadKitsDocument(): KitsDocument | null {
  try {
    return JSON.parse(readFileSync(KITS_PATH, "utf-8")) as KitsDocument;
  } catch {
    return null;
  }
}

function loadTeamKitsDocument(): TeamKitsDocument | null {
  try {
    return JSON.parse(readFileSync(TEAM_KITS_PATH, "utf-8")) as TeamKitsDocument;
  } catch {
    return null;
  }
}

function resolveSharedKitMatch(
  homeFifa: string,
  awayFifa: string
): { matchNumber: number; home: TeamKitEntry; away: TeamKitEntry } | null {
  const doc = loadTeamKitsDocument();
  if (!doc) return null;

  const homeMatches = doc[homeFifa]?.matches ?? [];
  const awayMatches = doc[awayFifa]?.matches ?? [];
  if (homeMatches.length === 0 || awayMatches.length === 0) return null;

  const homeByMatch = new Map(homeMatches.map((m) => [m.match, m]));

  for (const awayEntry of awayMatches) {
    const homeEntry = homeByMatch.get(awayEntry.match);
    if (homeEntry) {
      return { matchNumber: awayEntry.match, home: homeEntry, away: awayEntry };
    }
  }

  return null;
}

/** Maillots PNG locaux (/public/team-kits) — 2 images par match (72 matchs de poules = 144 fichiers) */
export const getFixtureTeamKitImages = cache(
  (homeCode: string, awayCode: string): { home: TeamKitImage; away: TeamKitImage } | null => {
    const homeFifa = toFifa3Code(homeCode);
    const awayFifa = toFifa3Code(awayCode);

    const shared = resolveSharedKitMatch(homeFifa, awayFifa);
    if (!shared) return null;

    return {
      home: {
        img: `/team-kits/${shared.home.filename}`,
        colors: shared.home.colors,
      },
      away: {
        img: `/team-kits/${shared.away.filename}`,
        colors: shared.away.colors,
      },
    };
  }
);

/** @deprecated préférer getFixtureTeamKitImages — kits composés generated-kits */
export const getFixturePlayerKits = cache(
  (
    homeCode: string,
    awayCode: string
  ): { home: PlayerKit; away: PlayerKit } | null => {
    const doc = loadKitsDocument();
    if (!doc) return null;

    const homeFifa = toFifa3Code(homeCode);
    const awayFifa = toFifa3Code(awayCode);

    const match = doc.matches.find(
      (m) =>
        (m.homeTeam === homeFifa && m.awayTeam === awayFifa) ||
        (m.homeTeam === awayFifa && m.awayTeam === homeFifa)
    );
    if (!match) return null;

    const homeKit = match.kits[homeFifa]?.player;
    const awayKit = match.kits[awayFifa]?.player;
    if (!homeKit || !awayKit) return null;

    return { home: homeKit, away: awayKit };
  }
);
