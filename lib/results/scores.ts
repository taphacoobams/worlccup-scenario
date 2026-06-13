import type { ManualFixture, ManualTeam } from "@/types/worldcup-manual";
import type { MatchResult, ResultEvent } from "@/types/results";
import { countGoalsFromEvents } from "@/lib/manager-standings";
import { resultEventsToMatchEvents } from "@/lib/results/events";

export function computeScoresFromResultEvents(
  homeTeamId: number,
  awayTeamId: number,
  events: ResultEvent[],
  teams: ManualTeam[]
): { homeScore: number; awayScore: number } {
  const fixture: ManualFixture = {
    id: 0,
    date: "",
    venue: { name: "", city: "" },
    round: "",
    group: null,
    homeTeamId,
    awayTeamId,
    goals: { home: null, away: null },
    status: "NS",
    events: resultEventsToMatchEvents(events, teams, []),
  };
  const { home, away } = countGoalsFromEvents(fixture, teams);
  return { homeScore: home, awayScore: away };
}

export function withComputedScores(
  result: MatchResult,
  homeTeamId: number,
  awayTeamId: number,
  teams: ManualTeam[]
) {
  const { homeScore, awayScore } = computeScoresFromResultEvents(
    homeTeamId,
    awayTeamId,
    result.events,
    teams
  );
  return { ...result, homeScore, awayScore };
}
