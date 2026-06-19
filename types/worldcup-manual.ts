/** Schéma éditable via /dashboard → data/teams.json, groups.json, fixtures.json */

import type { MatchEvent } from "@/types/match-events";

export type ManualCoach = {
  name: string;
  nationality?: string;
  photo?: string;
};

export type ManualTeam = {
  id: number;
  name: string;
  code: string;
  country?: string;
  fifaRanking?: number | null;
  coach?: ManualCoach;
};

export type ManualStanding = {
  teamId: number;
  position: number;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type ManualGroup = {
  letter: string;
  standings: ManualStanding[];
};

export type ManualFixtureStatus = "NS" | "FT" | "HT" | "PST" | "CANC" | "AET" | "PEN";

export type ManualFixture = {
  id: number;
  matchNumber?: number;
  matchday?: number;
  date: string;
  timezone?: string;
  venue: { name: string; city: string; image?: string | null };
  /** Image stade (miroir racine pour JSON fixtures) */
  venueImage?: string | null;
  round: string;
  group: string | null;
  homeTeamId: number;
  awayTeamId: number;
  /** Libellés si slots knockout (1E, 3A/…) ou secours */
  homeTeam?: string;
  awayTeam?: string;
  goals: { home: number | null; away: number | null };
  status: ManualFixtureStatus;
  events?: MatchEvent[];
};

export type ManualPlayer = {
  id: number;
  name: string;
  nameOnShirt?: string;
  teamId: number;
  number?: number | null;
  position?: string;
  nationality?: string;
  age?: number;
  photo?: string;
};

export type WorldCupManualData = {
  updatedAt: string;
  teams: ManualTeam[];
  groups: ManualGroup[];
  fixtures: ManualFixture[];
  players: ManualPlayer[];
};
