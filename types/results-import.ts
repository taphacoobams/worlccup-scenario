import type { ResultEvent } from "@/types/results";

export type ImportPreviewMatch = {
  matchId: number;
  action: "replace" | "add";
  status: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  eventCount: number;
  events: ResultEvent[];
};

export type ImportPreview = {
  totalMatches: number;
  toReplace: number;
  toAdd: number;
  unknownMatchIds: number[];
  matches: ImportPreviewMatch[];
};

export type ImportSummary = {
  replaced: number;
  added: number;
  matchIds: number[];
};
