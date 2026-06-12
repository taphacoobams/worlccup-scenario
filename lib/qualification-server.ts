import "server-only";

import { computeScenarioStats } from "@/lib/scenarios";
import { getAllScenarios } from "@/lib/scenarios/server";
import type { Group } from "@/types";
import type {
  BestThirdEntry,
  GroupQualificationSummary,
} from "@/types/qualification";
import type { WorldCupGroup } from "@/types/worldcup";
import {
  buildBestThirdsRanking,
  computeTeamQualificationProbs,
  extractGroupLetter,
  getGroupThirdScenarioRate,
} from "@/lib/qualification";

export async function enrichGroupsWithQualification(
  groups: WorldCupGroup[]
): Promise<{
  groups: WorldCupGroup[];
  summaries: GroupQualificationSummary[];
  bestThirds: BestThirdEntry[];
}> {
  const all = await getAllScenarios();
  const stats = computeScenarioStats(all);
  const groupFrequencies = stats.groupFrequencies;

  const bestThirds = buildBestThirdsRanking(groups, groupFrequencies);
  const thirdRankByTeamId = new Map(
    bestThirds.map((e) => [e.team.id, e.rank])
  );

  const summaries: GroupQualificationSummary[] = groups.map((group) => {
    const letter = extractGroupLetter(group.name);
    const scenarioRate = getGroupThirdScenarioRate(letter, groupFrequencies);
    const teamProbs = new Map();

    for (const row of group.standings) {
      teamProbs.set(
        row.team.id,
        computeTeamQualificationProbs(
          row,
          group.standings,
          thirdRankByTeamId.get(row.team.id) ?? null,
          scenarioRate
        )
      );
    }

    return {
      group: letter,
      groupName: group.name,
      teamProbs,
      thirdPlaceScenarioRate: Math.round(scenarioRate * 10) / 10,
    };
  });

  return { groups, summaries, bestThirds };
}

export async function loadGroupScenarioFrequencies(): Promise<Record<Group, number>> {
  const all = await getAllScenarios();
  return computeScenarioStats(all).groupFrequencies;
}
