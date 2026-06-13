import "server-only";

import { readFileSync, writeFileSync } from "fs";
import path from "path";
import type {
  MatchResult,
  MatchResultComputed,
  MatchResultStatus,
  ResultEvent,
  TournamentResultsFile,
} from "@/types/results";
import type { ManualTeam } from "@/types/worldcup-manual";
import { computeScoresFromResultEvents } from "@/lib/results/scores";
import { backupResultsJson } from "@/lib/results/backup";

const RESULTS_PATH = path.join(process.cwd(), "data", "results.json");

const EMPTY: TournamentResultsFile = {
  version: 1,
  updatedAt: new Date(0).toISOString(),
  matches: [],
};

function readRaw(): TournamentResultsFile {
  try {
    const raw = readFileSync(RESULTS_PATH, "utf-8");
    const parsed = JSON.parse(raw) as TournamentResultsFile;
    if (!Array.isArray(parsed.matches)) return { ...EMPTY, ...parsed };
    return {
      version: parsed.version ?? 1,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      matches: parsed.matches.map(normalizeMatch),
    };
  } catch {
    return { ...EMPTY };
  }
}

function normalizeMatch(m: MatchResult): MatchResult {
  return {
    matchId: m.matchId,
    status: m.status,
    events: [...(m.events ?? [])].sort(sortEvents),
    updatedAt: m.updatedAt ?? new Date().toISOString(),
  };
}

function sortEvents(a: ResultEvent, b: ResultEvent): number {
  const ma = a.minute + (a.addedTime ?? 0) * 0.01;
  const mb = b.minute + (b.addedTime ?? 0) * 0.01;
  return ma - mb;
}

function writeRaw(data: TournamentResultsFile): void {
  backupResultsJson(readRaw());
  const payload: TournamentResultsFile = {
    version: 1,
    updatedAt: new Date().toISOString(),
    matches: data.matches.map(normalizeMatch),
  };
  writeFileSync(RESULTS_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
}

/** Écrit le fichier results.json complet (avec sauvegarde automatique) */
export function saveResultsJson(data: TournamentResultsFile): void {
  writeRaw(data);
}

export function getResults(): TournamentResultsFile {
  return readRaw();
}

export function getMatchResult(matchId: number): MatchResult | null {
  return getResults().matches.find((m) => m.matchId === matchId) ?? null;
}

export function getMatchResultComputed(
  matchId: number,
  homeTeamId: number,
  awayTeamId: number,
  teams: ManualTeam[]
): MatchResultComputed | null {
  const result = getMatchResult(matchId);
  if (!result) return null;
  const { homeScore, awayScore } = computeScoresFromResultEvents(
    homeTeamId,
    awayTeamId,
    result.events,
    teams
  );
  return { ...result, homeScore, awayScore };
}

export function saveMatchResult(
  matchId: number,
  data: {
    status: MatchResultStatus;
    events: ResultEvent[];
  }
): MatchResult {
  const file = readRaw();
  const now = new Date().toISOString();
  const entry: MatchResult = normalizeMatch({
    matchId,
    status: data.status,
    events: data.events,
    updatedAt: now,
  });

  const idx = file.matches.findIndex((m) => m.matchId === matchId);
  if (idx >= 0) {
    file.matches[idx] = entry;
  } else {
    file.matches.push(entry);
  }

  file.matches.sort((a, b) => a.matchId - b.matchId);
  writeRaw(file);
  return entry;
}

export function updateMatchEvents(
  matchId: number,
  events: ResultEvent[],
  status: MatchResultStatus = "FT"
): MatchResult {
  const existing = getMatchResult(matchId);
  return saveMatchResult(matchId, {
    status: existing?.status ?? status,
    events,
  });
}

/** Invalide le cache React après écriture */
export function invalidateResultsCache(): void {
  // cache() ne permet pas d'invalider — relecture disque à chaque write via readRaw hors cache
}

export function resultsPath(): string {
  return RESULTS_PATH;
}
