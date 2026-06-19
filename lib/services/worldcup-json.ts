import "server-only";

import { readTeamsJson, readPlayersJson, readFixturesJson } from "@/lib/data/loader";
import { parseGroupsFile } from "@/lib/data/groups-file";
import { readFileSync } from "fs";
import path from "path";
import type {
  ManualFixture,
  ManualFixtureStatus,
  ManualGroup,
  ManualPlayer,
  ManualTeam,
  WorldCupManualData,
} from "@/types/worldcup-manual";

function readGroupsRaw() {
  const raw = readFileSync(path.join(process.cwd(), "data", "groups.json"), "utf-8");
  return parseGroupsFile(JSON.parse(raw) as unknown);
}

function toManualStatus(status: string): ManualFixtureStatus {
  const u = status.toUpperCase() as ManualFixtureStatus;
  const valid = new Set<ManualFixtureStatus>([
    "NS",
    "FT",
    "HT",
    "PST",
    "CANC",
    "AET",
    "PEN",
  ]);
  return valid.has(u) ? u : "NS";
}

export function loadWorldCupFromJson(): WorldCupManualData {
  const teamsRaw = readTeamsJson();
  const playersRaw = readPlayersJson();
  const fixturesRaw = readFixturesJson();
  const { groups: groupsRaw } = readGroupsRaw();

  const teams: ManualTeam[] = teamsRaw.map((t) => ({
    id: t.id,
    name: t.name,
    code: t.code,
    country: t.country || t.name,
    fifaRanking: t.fifaRanking ?? null,
    coach: t.coach ? { name: t.coach } : undefined,
  }));

  const groups: ManualGroup[] = groupsRaw.map((g) => ({
    letter: g.letter.toUpperCase(),
    standings: g.standings.map((s) => ({
      teamId: s.teamId,
      position: s.position,
      played: s.played,
      won: s.won,
      draw: s.draw,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalDifference,
      points: s.points,
    })),
  }));

  const fixtures: ManualFixture[] = fixturesRaw.map((f) => ({
    id: f.id,
    date: f.date,
    timezone: f.timezone ?? "UTC",
    venue: {
      name: f.venue.name,
      city: f.venue.city,
      image: f.venueImage ?? null,
    },
    venueImage: f.venueImage ?? null,
    round: f.round,
    group: f.group,
    homeTeamId: f.homeTeamId,
    awayTeamId: f.awayTeamId,
    homeTeam: f.homeTeamName,
    awayTeam: f.awayTeamName,
    goals: f.goals,
    status: toManualStatus(f.status),
    events: [],
  }));

  const players: ManualPlayer[] = playersRaw.map((p) => ({
    id: p.id,
    name: p.name,
    nameOnShirt: (p as any).nameOnShirt ?? undefined,
    teamId: p.teamId,
    number: p.number,
    position: p.position,
    nationality: p.nationality,
    age: p.age ?? undefined,
    photo: p.photo,
  }));

  return {
    updatedAt: new Date().toISOString(),
    teams,
    groups,
    fixtures,
    players,
  };
}
