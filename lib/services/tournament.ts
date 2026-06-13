import "server-only";

import { cache } from "react";
import { loadWorldCupBundle } from "@/lib/services/worldcup";
import { listTeams } from "@/lib/services/teams";
import { mapWorldCupToScenarioEngineData } from "@/lib/scenarios/engine-data";
import type { LocalFixture, LocalGroup, LocalStanding, LocalTeam } from "@/types/data";

export type TournamentBundle = {
  teams: LocalTeam[];
  groups: LocalGroup[];
  standings: LocalStanding[];
  fixtures: LocalFixture[];
};

export const getTournamentBundle = cache(async (): Promise<TournamentBundle> => {
  const [wc, teams] = await Promise.all([loadWorldCupBundle(), listTeams()]);
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
