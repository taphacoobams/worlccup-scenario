import type { ManualPlayer, ManualTeam } from "@/types/worldcup-manual";
import type { MatchEvent } from "@/types/match-events";
import type { ResultEvent } from "@/types/results";
import { createMatchEvent, newEventId } from "@/lib/tournament-engine/events";

function teamNameForCode(code: string, teams: ManualTeam[]): string {
  return teams.find((t) => t.code.toUpperCase() === code.toUpperCase())?.name ?? code;
}

function teamCodeForName(name: string, teams: ManualTeam[]): string {
  const n = name.trim().toLowerCase();
  return (
    teams.find((t) => t.name.trim().toLowerCase() === n)?.code ??
    teams.find((t) => t.name.toLowerCase().includes(n) || n.includes(t.name.toLowerCase()))
      ?.code ??
    name.slice(0, 2).toUpperCase()
  );
}

function resolvePlayerId(
  playerName: string,
  teamCode: string,
  players: ManualPlayer[]
): string {
  const n = playerName.trim().toLowerCase();
  const p = players.find(
    (x) =>
      x.name.trim().toLowerCase() === n &&
      teamsPlayerCode(x, players, teamCode)
  );
  if (p) return String(p.id);
  const loose = players.find((x) => x.name.trim().toLowerCase().includes(n));
  return loose ? String(loose.id) : "";
}

function teamsPlayerCode(
  player: ManualPlayer,
  _players: ManualPlayer[],
  _teamCode: string
): boolean {
  return true;
}

/** results.json → MatchEvent[] (assist intégré sur le goal) */
export function resultEventsToMatchEvents(
  events: ResultEvent[],
  teams: ManualTeam[],
  players: ManualPlayer[] = []
): MatchEvent[] {
  const sorted = [...events].sort((a, b) => {
    const ma = a.minute + (a.addedTime ?? 0) * 0.01;
    const mb = b.minute + (b.addedTime ?? 0) * 0.01;
    return ma - mb;
  });

  const out: MatchEvent[] = [];

  for (const e of sorted) {
    const teamCode = teamCodeForName(e.team, teams);
    const playerId = resolvePlayerId(e.player, teamCode, players);

    if (e.type === "goal") {
      const goal = createMatchEvent({
        id: newEventId(),
        minute: e.minute,
        addedTime: e.addedTime,
        type: "goal",
        playerId,
        playerName: e.player,
        teamCode,
        isOwnGoal: e.isOwnGoal,
      });
      out.push(goal);
      if (e.assist?.trim()) {
        out.push(
          createMatchEvent({
            id: newEventId(),
            minute: e.minute,
            addedTime: e.addedTime,
            type: "assist",
            playerId: resolvePlayerId(e.assist, teamCode, players),
            playerName: e.assist,
            teamCode,
            linkedGoalId: goal.id,
          })
        );
      }
      continue;
    }

    out.push(
      createMatchEvent({
        id: newEventId(),
        minute: e.minute,
        addedTime: e.addedTime,
        type: e.type,
        playerId,
        playerName: e.player,
        teamCode,
      })
    );
  }

  return out;
}

/** MatchEvent[] → results.json (fusionne assist sur goal) */
export function matchEventsToResultEvents(
  events: MatchEvent[] | undefined,
  teams: ManualTeam[]
): ResultEvent[] {
  if (!events?.length) return [];

  const assistsByGoal = new Map(
    events
      .filter((e) => e.type === "assist" && e.linkedGoalId)
      .map((e) => [e.linkedGoalId!, e])
  );

  const out: ResultEvent[] = [];

  for (const e of events) {
    if (e.type === "assist") continue;

    const team = teamNameForCode(e.teamCode, teams);

    if (e.type === "goal") {
      const assist = assistsByGoal.get(e.id);
      out.push({
        type: "goal",
        team,
        player: e.playerName,
        minute: e.minute,
        addedTime: e.addedTime,
        assist: assist?.playerName,
        isOwnGoal: e.isOwnGoal,
      });
      continue;
    }

    if (e.type === "yellow_card" || e.type === "red_card") {
      out.push({
        type: e.type,
        team,
        player: e.playerName,
        minute: e.minute,
        addedTime: e.addedTime,
      });
    }
  }

  return out.sort((a, b) => {
    const ma = a.minute + (a.addedTime ?? 0) * 0.01;
    const mb = b.minute + (b.addedTime ?? 0) * 0.01;
    return ma - mb;
  });
}
