import type { Group, Scenario } from "@/types";
import { getFlag } from "@/lib/flags";
import type {
  GroupSnapshot,
  ScenarioDataContext,
  ScenarioStandingRow,
  StandingOutcome,
} from "@/lib/scenario-engine/types";
import { scenarioIncludesGroup } from "@/lib/scenarios-team";
import {
  getStandingsForScenarioGroup,
  isSimulatedGroup,
} from "@/lib/scenario-engine/simulate-standings";

function outcomeForPosition(
  position: number,
  group: Group,
  scenario: Scenario
): StandingOutcome {
  if (position <= 2) return "qualified";
  if (position === 3) {
    return scenarioIncludesGroup(scenario, group) ? "qualified" : "third-chance";
  }
  return "eliminated";
}

export function buildGroupSnapshot(
  scenario: Scenario,
  group: Group,
  ctx: ScenarioDataContext
): GroupSnapshot {
  const rows = getStandingsForScenarioGroup(scenario, group, ctx);
  const thirdQualifiesInScenario = scenarioIncludesGroup(scenario, group);
  const simulated = isSimulatedGroup(scenario, group, ctx);

  const snapshotRows: ScenarioStandingRow[] = rows.map((row) => {
    const team = ctx.teamsById.get(row.teamId);
    return {
      teamId: row.teamId,
      name: row.teamName,
      code: team?.code ?? "—",
      flag: team ? getFlag(team.code, null, team.name) : "/placeholder-flag.svg",
      position: row.position,
      played: row.played,
      won: row.won,
      draw: row.draw,
      lost: row.lost,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      points: row.points,
      goalDifference: row.goalDifference,
      fifaRanking: team?.fifaRanking,
      outcome: outcomeForPosition(row.position, group, scenario),
    };
  });

  return {
    group,
    rows: snapshotRows,
    thirdQualifiesInScenario,
    simulated,
  };
}
