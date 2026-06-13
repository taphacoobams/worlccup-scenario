/**
 * Couche d'accès aux données pour les pages et composants.
 * Côté serveur : appelle directement les services (pas de round-trip HTTP).
 * Côté client : fetch vers /api/*.
 */
import "server-only";

import { cache } from "react";
import {
  getTeams as getTeamsData,
  getTeamById as getTeamByIdData,
  getPlayers as getPlayersData,
  getPlayerById as getPlayerByIdData,
  getPlayerBySlug as getPlayerBySlugData,
  getPlayersByTeam as getPlayersByTeamData,
  getTeamDetailBySlug as getTeamDetailBySlugData,
  getTeamsPageData as getTeamsPageDataData,
  getStatistics as getStatisticsData,
  getGroups as getGroupsData,
  getFixtures as getFixturesData,
  getFixtureById as getFixtureByIdData,
  type TeamCardData,
  type StatisticsViewData,
} from "@/lib/data";
import {
  getRecentFinishedFixtures as getRecentFinishedFixturesWc,
  getWorldCupFixtures as getWorldCupFixturesWc,
  getWorldCupGroups as getWorldCupGroupsWc,
  getGroupsWithResults as getGroupsWithResultsWc,
  getFixtureById as getWorldCupFixtureById,
  getFixtureBySlug as getWorldCupFixtureBySlug,
  getKnockoutBracket as getKnockoutBracketWc,
  getKnockoutTableau as getKnockoutTableauWc,
  getWorldCupTeams as getWorldCupTeamsWc,
  type GroupsStandingsSource,
} from "@/lib/worldcup-data";
import { listSelectableTeams } from "@/lib/services/teams";
import { diagnoseDatabaseUrl } from "@/lib/services/diagnostics";
import {
  getAllScenarios,
  getScenarioStats,
} from "@/lib/scenarios/server";

export type { TeamCardData, StatisticsViewData, GroupsStandingsSource };

// ——— Équipes ———
export const getTeams = getTeamsData;
export const getTeamById = getTeamByIdData;
export const getTeamsPageData = getTeamsPageDataData;
export const getTeamDetailBySlug = getTeamDetailBySlugData;
export const getSelectableTeams = listSelectableTeams;

// ——— Joueurs ———
export const getPlayers = getPlayersData;
export const getPlayerById = getPlayerByIdData;
export const getPlayerBySlug = getPlayerBySlugData;
export const getPlayersByTeam = getPlayersByTeamData;

// ——— Tournoi (affichage worldcup) ———
export const getWorldCupTeams = getWorldCupTeamsWc;
export const getWorldCupGroups = getWorldCupGroupsWc;
export const getWorldCupFixtures = getWorldCupFixturesWc;
export const getGroupsWithResults = getGroupsWithResultsWc;
export const getRecentFinishedFixtures = getRecentFinishedFixturesWc;
export const getFixtureById = getWorldCupFixtureById;
export const getFixtureBySlug = getWorldCupFixtureBySlug;
export const getKnockoutBracket = getKnockoutBracketWc;
export const getKnockoutTableau = getKnockoutTableauWc;

// ——— Données locales ———
export const getGroups = getGroupsData;
export const getLocalFixtures = getFixturesData;
export const getLocalFixtureById = getFixtureByIdData;

// ——— Statistiques & scénarios ———
export const getStatistics = getStatisticsData;
export const getScenarios = cache(getAllScenarios);
export const getScenariosStats = cache(getScenarioStats);

// ——— Diagnostic BDD ———
export const getDatabaseDiagnostic = diagnoseDatabaseUrl;
