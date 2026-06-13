import { cache } from "react";
import {
  loadPlayerCountsByTeamLegacyId,
  loadPlayersFromDb,
} from "@/lib/data/players-db";
import { getTournamentLocalBundle } from "@/lib/data/worldcup-source";
import { groupSquadByPosition, toSquadPlayer } from "@/lib/data/squad";
import { findTeamIdBySlug } from "@/lib/team-slug";
import { loadStatisticsViewData } from "@/lib/data/statistics-db";
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
  const { teams } = await getTournamentLocalBundle();
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

export const getPlayers = cache(async (): Promise<LocalPlayer[]> => {
  return loadPlayersFromDb();
});

export const getPlayersByTeam = cache(async (teamId: number): Promise<SquadPlayer[]> => {
  const players = await loadPlayersFromDb();
  return players.filter((p) => p.teamId === teamId).map(toSquadPlayer);
});

export const getTeamSquad = cache(async (teamId: number) => {
  const players = await getPlayersByTeam(teamId);
  return groupSquadByPosition(players);
});

export const getStandings = cache(async (): Promise<LocalStanding[]> => {
  const { standings } = await getTournamentLocalBundle();
  return standings;
});

export const getGroups = cache(async (): Promise<LocalGroup[]> => {
  const { groups } = await getTournamentLocalBundle();
  return groups;
});

export const getBestThirds = cache(async (): Promise<LocalBestThird[]> => {
  return [];
});

export const getFixtures = cache(async (): Promise<LocalFixture[]> => {
  const { fixtures } = await getTournamentLocalBundle();
  return fixtures;
});

export const getFixtureById = cache(async (id: number): Promise<LocalFixture | null> => {
  const fixtures = await getFixtures();
  return fixtures.find((f) => f.id === id) ?? null;
});

/** Stats discipline / passes — PostgreSQL ou recalcul moteur tournoi */
export const getStatistics = cache(async (): Promise<StatisticsViewData> => {
  return loadStatisticsViewData();
});

export type TeamCardData = {
  team: LocalTeam;
  playerCount: number;
};

export const getTeamsPageData = cache(async (): Promise<TeamCardData[]> => {
  const [teams, counts] = await Promise.all([
    getTeams(),
    loadPlayerCountsByTeamLegacyId(),
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
