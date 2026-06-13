import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { readTeamsJson } from "@/lib/data/loader";
import { withDbFallback } from "@/lib/services/with-fallback";
import type { LocalTeam } from "@/types/data";
import type { SelectableTeam } from "@/types/team-selection";

function mapDbTeam(t: {
  legacyId: number;
  name: string;
  code: string;
  country: string;
  group: string | null;
  fifaRanking: number | null;
  coach: string | null;
  bio: string | null;
  strengths: string | null;
  weaknesses: string | null;
  playerPick: string | null;
  contentCredit: string | null;
}): LocalTeam {
  return {
    id: t.legacyId,
    name: t.name,
    code: t.code,
    country: t.country || t.name,
    group: t.group?.toUpperCase() ?? null,
    fifaRanking: t.fifaRanking ?? undefined,
    coach: t.coach ?? undefined,
    bio: t.bio ?? undefined,
    strengths: t.strengths ?? undefined,
    weaknesses: t.weaknesses ?? undefined,
    playerPick: t.playerPick ?? undefined,
    contentCredit: t.contentCredit ?? undefined,
  };
}

async function listTeamsFromDb(): Promise<LocalTeam[]> {
  const rows = await prisma.team.findMany({ orderBy: { name: "asc" } });
  return rows.map(mapDbTeam);
}

function listTeamsFromJson(): LocalTeam[] {
  return readTeamsJson().map((t) => ({
    ...t,
    country: t.country || t.name,
    group: t.group?.toUpperCase() ?? null,
  }));
}

export const listTeams = cache(async (): Promise<LocalTeam[]> => {
  const teams = await withDbFallback(listTeamsFromDb, listTeamsFromJson, "teams");
  return teams.sort((a, b) => a.name.localeCompare(b.name, "fr"));
});

export const listSelectableTeams = cache(async (): Promise<SelectableTeam[]> => {
  const teams = await listTeams();
  return teams.map((t) => ({
    id: t.id,
    name: t.name,
    code: t.code,
    country: t.country,
    group: t.group,
  }));
});

export async function findSenegalTeam() {
  const teams = await listTeams();
  return (
    teams.find(
      (t) =>
        t.code === "SEN" ||
        t.name.toLowerCase().includes("sénégal") ||
        t.name.toLowerCase().includes("senegal")
    ) ?? null
  );
}

export async function getTeamByLegacyId(id: number): Promise<LocalTeam | null> {
  const teams = await listTeams();
  return teams.find((t) => t.id === id) ?? null;
}
