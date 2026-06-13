export {
  getResults,
  getMatchResult,
  getMatchResultComputed,
  saveMatchResult,
  saveResultsJson,
  updateMatchEvents,
} from "@/lib/results/repository";

export { enrichWorldCupWithResults, applyResultsToWorldCupData } from "@/lib/results/enrich";
export { syncFixturesFromResults } from "@/lib/results/sync-fixtures";
export { persistMatchResultFromManager, syncResultsPipeline, revalidateTournamentPages } from "@/lib/results/pipeline";
export { buildImportPreview, importResultsFromJson } from "@/lib/results/import";
export type { ImportPreview, ImportSummary } from "@/types/results-import";
export { validateImportResultsPayload } from "@/lib/results/validate-import";
export { recalculateTournament } from "@/lib/results/recalculate";
export {
  loadManagerDashboardData,
  loadManagerMatchFromResults,
  loadTournamentSchedule,
} from "@/lib/results/manager-load";
export { startupSync, runStartupSyncOnce } from "@/lib/results/startup-sync";
export { backupResultsJson } from "@/lib/results/backup";
export { computeStatisticsFromResults } from "@/lib/results/statistics";
export { computeGroupStandingsFromResults } from "@/lib/results/group-standings";
export {
  resultEventsToMatchEvents,
  matchEventsToResultEvents,
} from "@/lib/results/events";
export { computeScoresFromResultEvents } from "@/lib/results/scores";
