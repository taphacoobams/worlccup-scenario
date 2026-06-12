import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { mapWorldCupToScenarioEngineData } from "@/lib/scenarios/engine-data";
import { loadWorldCupFromFiles } from "@/lib/worldcup-persistence";
import type { LocalFixture, LocalGroup, LocalStanding, LocalTeam } from "@/types/data";

export type TournamentLocalBundle = {
  teams: LocalTeam[];
  groups: LocalGroup[];
  standings: LocalStanding[];
  fixtures: LocalFixture[];
};

async function loadTeamsLocal(): Promise<LocalTeam[]> {
  const rows = await prisma.team.findMany({ orderBy: { name: "asc" } });
  return rows.map((t) => ({
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
  }));
}

/** Poules, équipes, classements et matchs — PostgreSQL uniquement. */
export const getTournamentLocalBundle = cache(async (): Promise<TournamentLocalBundle> => {
  const [wc, teams] = await Promise.all([loadWorldCupFromFiles(), loadTeamsLocal()]);
  const engine = mapWorldCupToScenarioEngineData(wc);
  const teamById = new Map(teams.map((t) => [t.id, t]));

  const groups: LocalGroup[] = wc.groups.map((g) => ({
    letter: g.letter.toUpperCase(),
    standings: g.standings.map((s) => ({
      ...s,
      teamName: teamById.get(s.teamId)?.name ?? "",
      group: g.letter.toUpperCase(),
    })),
  }));

  return {
    teams: teams.sort((a, b) => a.name.localeCompare(b.name, "fr")),
    groups,
    standings: engine.standings,
    fixtures: engine.fixtures,
  };
});
