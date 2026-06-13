import "server-only";

import type { MatchResult, TournamentResultsFile } from "@/types/results";
import type {
  ImportPreview,
  ImportPreviewMatch,
  ImportSummary,
} from "@/types/results-import";
import type { WorldCupManualData } from "@/types/worldcup-manual";
import { getResults, saveResultsJson } from "@/lib/results/repository";
import { computeScoresFromResultEvents } from "@/lib/results/scores";
import { loadTournamentSchedule } from "@/lib/results/manager-load";
import { validateImportResultsPayload } from "@/lib/results/validate-import";
import { syncResultsPipeline } from "@/lib/results/pipeline";
import { logActivity } from "@/lib/tournament-engine/activity";

function mergeImportedMatches(
  current: TournamentResultsFile,
  imported: MatchResult[]
): { file: TournamentResultsFile; replaced: number; added: number; matchIds: number[] } {
  const byId = new Map(current.matches.map((m) => [m.matchId, m]));
  let replaced = 0;
  let added = 0;
  const matchIds: number[] = [];

  for (const match of imported) {
    matchIds.push(match.matchId);
    if (byId.has(match.matchId)) {
      replaced += 1;
    } else {
      added += 1;
    }
    byId.set(match.matchId, {
      ...match,
      updatedAt: new Date().toISOString(),
    });
  }

  return {
    file: {
      version: 1,
      updatedAt: new Date().toISOString(),
      matches: [...byId.values()].sort((a, b) => a.matchId - b.matchId),
    },
    replaced,
    added,
    matchIds,
  };
}

export async function buildImportPreview(input: unknown): Promise<{
  valid: boolean;
  errors: { path: string; message: string }[];
  preview: ImportPreview | null;
  matches: MatchResult[];
}> {
  const validation = validateImportResultsPayload(input);
  if (!validation.valid) {
    return { valid: false, errors: validation.errors, preview: null, matches: [] };
  }

  const schedule = await loadTournamentSchedule();
  const existingIds = new Set(getResults().matches.map((m) => m.matchId));
  const fixtureById = new Map(schedule.fixtures.map((f) => [f.id, f]));

  const previewMatches: ImportPreviewMatch[] = [];
  const unknownMatchIds: number[] = [];

  for (const match of validation.matches) {
    const fixture = fixtureById.get(match.matchId);
    if (!fixture) {
      unknownMatchIds.push(match.matchId);
      continue;
    }

    const homeTeam =
      schedule.teams.find((t) => t.id === fixture.homeTeamId)?.name ?? fixture.homeTeam ?? "—";
    const awayTeam =
      schedule.teams.find((t) => t.id === fixture.awayTeamId)?.name ?? fixture.awayTeam ?? "—";

    const { homeScore, awayScore } = computeScoresFromResultEvents(
      fixture.homeTeamId,
      fixture.awayTeamId,
      match.events,
      schedule.teams
    );

    previewMatches.push({
      matchId: match.matchId,
      action: existingIds.has(match.matchId) ? "replace" : "add",
      status: match.status,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      eventCount: match.events.length,
      events: match.events,
    });
  }

  if (unknownMatchIds.length > 0) {
    return {
      valid: false,
      errors: unknownMatchIds.map((id) => ({
        path: `matchId:${id}`,
        message: `Match #${id} introuvable dans le calendrier.`,
      })),
      preview: null,
      matches: [],
    };
  }

  const toReplace = previewMatches.filter((m) => m.action === "replace").length;
  const toAdd = previewMatches.filter((m) => m.action === "add").length;

  return {
    valid: true,
    errors: [],
    preview: {
      totalMatches: previewMatches.length,
      toReplace,
      toAdd,
      unknownMatchIds,
      matches: previewMatches.sort((a, b) => a.matchId - b.matchId),
    },
    matches: validation.matches,
  };
}

/** Importe des résultats dans results.json puis lance la pipeline complète */
export async function importResultsFromJson(input: unknown): Promise<{
  data: WorldCupManualData;
  summary: ImportSummary;
}> {
  const built = await buildImportPreview(input);
  if (!built.valid || !built.preview) {
    const msg = built.errors.map((e) => e.message).join(" ");
    throw new Error(msg || "Fichier invalide");
  }

  const current = getResults();
  const { file, replaced, added, matchIds } = mergeImportedMatches(current, built.matches);

  saveResultsJson(file);
  const data = await syncResultsPipeline(matchIds);

  await logActivity(
    "match_updated",
    `Import results.json — ${matchIds.length} match(s) (${replaced} remplacé(s), ${added} ajouté(s))`
  );

  return {
    data,
    summary: { replaced, added, matchIds },
  };
}
