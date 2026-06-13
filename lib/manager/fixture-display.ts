import { getFlag } from "@/lib/flags";
import { isBracketSlot } from "@/lib/bracket-slots";
import { normalizeMatchEvents } from "@/lib/tournament-engine/events";
import type { FixtureEvent, GroupStanding, Team } from "@/types/worldcup";
import type {
  ManualFixture,
  ManualGroup,
  ManualPlayer,
  ManualFixtureStatus,
  ManualTeam,
} from "@/types/worldcup-manual";

export const MANUAL_STATUS_LABELS: Record<ManualFixtureStatus, string> = {
  NS: "À venir",
  FT: "Terminé",
  HT: "Mi-temps",
  PST: "Reporté",
  CANC: "Annulé",
  AET: "Prolongations",
  PEN: "Tirs au but",
};

export function managerTeamToDisplayTeam(t: ManualTeam): Team {
  return {
    id: t.id,
    name: t.name,
    code: t.code.toUpperCase(),
    country: t.country ?? t.name,
    fifaRanking: t.fifaRanking ?? null,
    logo: getFlag(t.code, null, t.name),
  };
}

export function resolveManagerParticipant(
  teamId: number,
  slotLabel: string | undefined,
  teams: ManualTeam[]
): Team {
  const found = teams.find((t) => t.id === teamId);
  if (found) return managerTeamToDisplayTeam(found);

  const label = slotLabel?.trim();
  if (label) {
    return {
      id: teamId || 0,
      name: label,
      code: isBracketSlot(label) ? "—" : "XX",
      country: label,
      logo: getFlag("xx", null, label),
    };
  }

  return {
    id: teamId || 0,
    name: "—",
    code: "XX",
    country: "",
    logo: getFlag("xx"),
  };
}

export function managerEventsToFixtureEvents(
  fixture: ManualFixture,
  teams: ManualTeam[],
  players: ManualPlayer[] = []
): FixtureEvent[] {
  const events = normalizeMatchEvents(fixture.events, teams, players);
  if (!events.length) return [];

  const teamsMap = new Map(teams.map((t) => [t.id, managerTeamToDisplayTeam(t)]));
  const codeToTeamId = new Map(teams.map((t) => [t.code.toUpperCase(), t.id]));
  const assistsByGoal = new Map(
    events
      .filter((e) => e.type === "assist" && e.linkedGoalId)
      .map((e) => [e.linkedGoalId!, e])
  );

  return events
    .filter((e) => e.type !== "assist")
    .map((e) => {
      const teamLegacyId = codeToTeamId.get(e.teamCode.toUpperCase()) ?? 0;
      const team = teamsMap.get(teamLegacyId);
      const assist = e.type === "goal" ? assistsByGoal.get(e.id) : undefined;
      const detail =
        e.type === "goal" && e.isOwnGoal
          ? "Own Goal"
          : e.type === "yellow_card"
            ? "Yellow Card"
            : e.type === "red_card"
              ? "Red Card"
              : "Goal";

      return {
        time: { elapsed: e.minute, extra: e.addedTime ?? null },
        team: {
          id: teamLegacyId,
          name: team?.name ?? e.teamCode,
          code: team?.code ?? e.teamCode,
          logo: team?.logo ?? getFlag(e.teamCode),
        },
        player: {
          id: e.playerId ? Number(e.playerId) : null,
          name: e.playerName,
        },
        assist: {
          id: assist?.playerId ? Number(assist.playerId) : null,
          name: assist?.playerName ?? null,
        },
        type: e.type === "yellow_card" || e.type === "red_card" ? "Card" : "Goal",
        detail,
        comments: null,
      };
    });
}

export function managerGroupToStandings(
  group: ManualGroup,
  teams: ManualTeam[]
): GroupStanding[] {
  return [...group.standings]
    .sort((a, b) => a.position - b.position)
    .map((row) => {
      const team = teams.find((t) => t.id === row.teamId);
      if (!team) return null;
      return {
        position: row.position,
        team: managerTeamToDisplayTeam(team),
        played: row.played,
        won: row.won,
        draw: row.draw,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference: row.goalDifference,
        points: row.points,
      };
    })
    .filter((row): row is GroupStanding => row != null);
}
