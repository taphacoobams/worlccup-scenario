import "server-only";

import { readFileSync } from "fs";
import path from "path";
import { cache } from "react";
import { toFifa3Code } from "@/lib/fifa-codes";
import type { PlayerKit } from "@/types/match-kits";

type KitsMatch = {
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
  kits: Record<string, { player: PlayerKit }>;
};

type KitsDocument = {
  matches: KitsMatch[];
};

const KITS_PATH = path.join(process.cwd(), "public", "data", "kits.json");

function loadKitsDocument(): KitsDocument | null {
  try {
    return JSON.parse(readFileSync(KITS_PATH, "utf-8")) as KitsDocument;
  } catch {
    return null;
  }
}

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
