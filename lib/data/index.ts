import "server-only";

import { cache } from "react";
import { listPlayers, listPlayerCountsByTeam } from "@/lib/services/players";
import { getTournamentBundle } from "@/lib/services/tournament";
import { groupSquadByPosition, toSquadPlayer } from "@/lib/data/squad";
import { findTeamIdBySlug } from "@/lib/team-slug";
import { findPlayerIdBySlug } from "@/lib/slugs/player";
import { loadStatistics } from "@/lib/services/statistics";
import type {
  LocalBestThird,
  LocalFixture,
  LocalGroup,
  LocalPlayer,
  LocalStanding,
  LocalTeam,
  SquadPlayer,
  StatisticsViewData,
} from "@/types/data";

export type { StatisticsViewData };

export const getTeams = cache(async (): Promise<LocalTeam[]> => {
  const { teams } = await getTournamentBundle();
  return teams;
});

export const getTeamById = cache(async (id: number): Promise<LocalTeam | null> => {
  const teams = await getTeams();
  return teams.find((t) => t.id === id) ?? null;
});

export const getPlayerById = cache(async (id: number): Promise<LocalPlayer | null> => {
  const players = await getPlayers();
  return players.find((p) => p.id === id) ?? null;
});

export const getPlayerBySlug = cache(async (slug: string): Promise<LocalPlayer | null> => {
  const players = await getPlayers();
  const id = findPlayerIdBySlug(slug, players);
  if (id == null) return null;
  return getPlayerById(id);
});

export const getPlayers = cache(async (): Promise<LocalPlayer[]> => {
  return listPlayers();
});

export const getPlayersByTeam = cache(async (teamId: number): Promise<SquadPlayer[]> => {
  const players = await listPlayers();
  return players.filter((p) => p.teamId === teamId).map(toSquadPlayer);
});

export const getTeamSquad = cache(async (teamId: number) => {
  const players = await getPlayersByTeam(teamId);
  return groupSquadByPosition(players);
});

export const getStandings = cache(async (): Promise<LocalStanding[]> => {
  const { standings } = await getTournamentBundle();
  return standings;
});

export const getGroups = cache(async (): Promise<LocalGroup[]> => {
  const { groups } = await getTournamentBundle();
  return groups;
});

export const getBestThirds = cache(async (): Promise<LocalBestThird[]> => {
  return [];
});

export const getFixtures = cache(async (): Promise<LocalFixture[]> => {
  const { fixtures } = await getTournamentBundle();
  return fixtures;
});

export const getFixtureById = cache(async (id: number): Promise<LocalFixture | null> => {
  const fixtures = await getFixtures();
  return fixtures.find((f) => f.id === id) ?? null;
});

export const getStatistics = cache(async (): Promise<StatisticsViewData> => {
  return loadStatistics();
});

export type TeamCardData = {
  team: LocalTeam;
  playerCount: number;
};

export const getTeamsPageData = cache(async (): Promise<TeamCardData[]> => {
  const [teams, counts] = await Promise.all([
    getTeams(),
    listPlayerCountsByTeam(),
  ]);

  return teams.map((team) => ({
    team,
    playerCount: counts.get(team.id) ?? 0,
  }));
});

export const getTeamDetail = cache(async (teamId: number) => {
  const team = await getTeamById(teamId);
  if (!team) return null;
  const squad = await getTeamSquad(teamId);
  const playerCount = (await getPlayersByTeam(teamId)).length;
  return { team, squad, playerCount };
});

export const getTeamDetailBySlug = cache(async (slug: string) => {
  const teams = await getTeams();
  const teamId = findTeamIdBySlug(slug, teams);
  if (teamId == null) return null;
  return getTeamDetail(teamId);
});
