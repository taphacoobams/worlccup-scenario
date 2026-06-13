import type { ManualFixture, WorldCupManualData } from "@/types/worldcup-manual";
import {
  normalizeMatchEvents,
  resolvePlayerLegacyId,
  sortEventsChronologically,
} from "@/lib/tournament-engine/events";

const FINISHED = new Set(["FT", "AET", "PEN"]);

export type SuspensionReason = "double_jaune" | "carton_rouge";

export type SuspensionDetail = {
  playerId: number;
  teamId: number;
  reason: SuspensionReason;
  active: boolean;
  triggeredFixtureId: number;
  triggeredFixtureDate: string;
  triggeredMatchLabel: string;
  missedFixtureId: number | null;
  missedFixtureDate: string | null;
  missedMatchLabel: string | null;
  returnFixtureId: number | null;
  returnFixtureDate: string | null;
  returnMatchLabel: string | null;
};

export type SuspensionState = {
  suspendedPlayerIds: Set<number>;
  yellowAccumulated: Map<number, number>;
  details: SuspensionDetail[];
};

function playerIdFromEvent(
  e: { playerId: string; playerName: string; teamCode: string },
  data: WorldCupManualData
): number | null {
  const parsed = Number(e.playerId);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  const team = data.teams.find((t) => t.code === e.teamCode);
  if (!team) return null;
  return resolvePlayerLegacyId(e.playerName, team.id, data.players);
}

function teamIdFromCode(teamCode: string, data: WorldCupManualData): number | null {
  return data.teams.find((t) => t.code === teamCode)?.id ?? null;
}

function fixtureLabel(fixture: ManualFixture, data: WorldCupManualData): string {
  const home =
    data.teams.find((t) => t.id === fixture.homeTeamId)?.name ??
    fixture.homeTeam ??
    "?";
  const away =
    data.teams.find((t) => t.id === fixture.awayTeamId)?.name ??
    fixture.awayTeam ??
    "?";
  return `${home} – ${away}`;
}

function teamFixtures(
  teamId: number,
  fixtures: ManualFixture[]
): ManualFixture[] {
  return fixtures.filter(
    (f) => f.homeTeamId === teamId || f.awayTeamId === teamId
  );
}

function nextTeamFixtureAfter(
  teamId: number,
  afterFixtureId: number,
  fixtures: ManualFixture[]
): ManualFixture | null {
  const teamList = teamFixtures(teamId, fixtures);
  const index = teamList.findIndex((f) => f.id === afterFixtureId);
  if (index < 0) return teamList[0] ?? null;
  return teamList[index + 1] ?? null;
}

function createPendingDetail(
  playerId: number,
  teamId: number,
  reason: SuspensionReason,
  fixture: ManualFixture,
  data: WorldCupManualData
): SuspensionDetail {
  const missed = nextTeamFixtureAfter(teamId, fixture.id, data.fixtures);
  const returns = missed
    ? nextTeamFixtureAfter(teamId, missed.id, data.fixtures)
    : null;

  return {
    playerId,
    teamId,
    reason,
    active: true,
    triggeredFixtureId: fixture.id,
    triggeredFixtureDate: fixture.date,
    triggeredMatchLabel: fixtureLabel(fixture, data),
    missedFixtureId: missed?.id ?? null,
    missedFixtureDate: missed?.date ?? null,
    missedMatchLabel: missed ? fixtureLabel(missed, data) : null,
    returnFixtureId: returns?.id ?? null,
    returnFixtureDate: returns?.date ?? null,
    returnMatchLabel: returns ? fixtureLabel(returns, data) : null,
  };
}

function finalizeServed(
  detail: SuspensionDetail,
  missedFixture: ManualFixture,
  data: WorldCupManualData,
  played: boolean
): SuspensionDetail {
  const returns = played
    ? missedFixture
    : nextTeamFixtureAfter(detail.teamId, missedFixture.id, data.fixtures);

  return {
    ...detail,
    active: false,
    missedFixtureId: missedFixture.id,
    missedFixtureDate: missedFixture.date,
    missedMatchLabel: fixtureLabel(missedFixture, data),
    returnFixtureId: returns?.id ?? null,
    returnFixtureDate: returns?.date ?? null,
    returnMatchLabel: returns ? fixtureLabel(returns, data) : null,
  };
}

/** Détermine les joueurs suspendus (2 jaunes ou rouge) et l'historique associé */
export function recalculateSuspensions(
  data: WorldCupManualData
): SuspensionState {
  const yellowAccumulated = new Map<number, number>();
  const suspendedPlayerIds = new Set<number>();
  const active = new Map<number, SuspensionDetail>();
  const details: SuspensionDetail[] = [];

  const fixtures = [...data.fixtures]
    .filter((f) => f.homeTeamId > 0 && f.awayTeamId > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const fixture of fixtures) {
    if (!FINISHED.has(fixture.status)) continue;

    const events = normalizeMatchEvents(
      fixture.events,
      data.teams,
      data.players
    );

    const played = new Set<number>();
    for (const e of events) {
      const playerId = playerIdFromEvent(e, data);
      if (playerId) played.add(playerId);
    }

    const teamIds = [fixture.homeTeamId, fixture.awayTeamId];

    for (const [playerId, pending] of [...active.entries()]) {
      if (!teamIds.includes(pending.teamId)) continue;
      const served = finalizeServed(pending, fixture, data, played.has(playerId));
      details.push(served);
      active.delete(playerId);
    }

    for (const e of sortEventsChronologically(events)) {
      const playerId = playerIdFromEvent(e, data);
      if (!playerId) continue;

      if (e.type === "red_card") {
        yellowAccumulated.set(playerId, 0);
        const teamId = teamIdFromCode(e.teamCode, data);
        if (teamId) {
          active.set(
            playerId,
            createPendingDetail(playerId, teamId, "carton_rouge", fixture, {
              ...data,
              fixtures,
            })
          );
        }
      } else if (e.type === "yellow_card") {
        const y = (yellowAccumulated.get(playerId) ?? 0) + 1;
        yellowAccumulated.set(playerId, y);
        if (y >= 2) {
          yellowAccumulated.set(playerId, 0);
          const teamId = teamIdFromCode(e.teamCode, data);
          if (teamId) {
            active.set(
              playerId,
              createPendingDetail(playerId, teamId, "double_jaune", fixture, {
                ...data,
                fixtures,
              })
            );
          }
        }
      }
    }
  }

  for (const [, pending] of active) {
    details.push(pending);
    suspendedPlayerIds.add(pending.playerId);
  }

  return { suspendedPlayerIds, yellowAccumulated, details };
}

export function suspensionReasonLabel(reason: SuspensionReason): string {
  return reason === "double_jaune" ? "2 cartons jaunes" : "Carton rouge";
}
