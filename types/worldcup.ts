export type FixtureStatus =
  | "NS"
  | "IN_PROGRESS"
  | "FT"
  | "HT"
  | "PST"
  | "CANC"
  | "AET"
  | "PEN";

export type Team = {
  id: number;
  name: string;
  code: string;
  country: string;
  founded?: number;
  national?: boolean;
  /** URL drapeau flagcdn.com */
  logo: string;
};

export type FixtureVenue = {
  id: number;
  name: string;
  city: string;
};

export type FixtureStatusDetail = {
  short: string;
  long: string;
  elapsed: number | null;
};

export type Fixture = {
  id: number;
  date: string;
  timestamp: number;
  timezone: string;
  venue: FixtureVenue;
  status: FixtureStatusDetail;
  round: string;
  group: string | null;
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
};

/** Alias rétrocompat composants existants */
export type FixtureLegacy = Fixture & {
  homeTeam: Team;
  awayTeam: Team;
  stadium: string;
  city: string;
  statusShort: FixtureStatus;
};

export type GroupStanding = {
  position: number;
  team: Team;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type WorldCupGroup = {
  name: string;
  letter: string;
  standings: GroupStanding[];
};

export type KnockoutRound = {
  id: string;
  label: string;
  fixtures: Fixture[];
};

export type Player = {
  id: number;
  name: string;
  age: number | null;
  nationality: string;
  height: string | null;
  weight: string | null;
  position: string | null;
  photo: string;
  teamId?: number;
};

export type Coach = {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number | null;
  nationality: string;
  photo: string;
};

export type FixtureEvent = {
  time: { elapsed: number | null; extra: number | null };
  team: { id: number; name: string; code?: string; logo: string };
  player: { id: number | null; name: string | null };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
};

export type FixtureDetail = Fixture & {
  events: FixtureEvent[];
  statistics: unknown[];
  lineups: unknown[];
  players: unknown[];
};

export type Prediction = {
  winner: { id: number | null; name: string | null; comment: string | null };
  winOrDraw: boolean;
  underOver: string | null;
  goals: { home: string | null; away: string | null };
  advice: string;
  percent: { home: string; draw: string; away: string };
};

export type Injury = {
  player: { id: number; name: string; photo: string };
  team: Team;
  fixture: { id: number; date: string };
  type: string;
  reason: string;
};

export type OddsBookmaker = {
  name: string;
  bets: { name: string; values: { value: string; odd: string }[] }[];
};

export function toLegacyFixture(f: Fixture): FixtureLegacy {
  const short = mapStatusShort(f.status.short);
  return {
    ...f,
    homeTeam: f.teams.home,
    awayTeam: f.teams.away,
    stadium: f.venue.name,
    city: f.venue.city,
    statusShort: short,
  };
}

function mapStatusShort(short: string): FixtureStatus {
  const inProgress = ["1H", "2H", "ET", "BT", "P", "LIVE"];
  if (inProgress.includes(short)) return "IN_PROGRESS";
  if (short === "FT" || short === "AET" || short === "PEN") return "FT";
  if (short === "HT") return "IN_PROGRESS";
  if (short === "PST" || short === "SUSP") return "PST";
  if (short === "CANC" || short === "ABD") return "CANC";
  return "NS";
}

export function fixtureStatus(f: Fixture): FixtureStatus {
  return mapStatusShort(f.status.short);
}

/** Score affiché uniquement une fois le match terminé (pas de résultat live). */
export function isMatchFinished(f: Fixture): boolean {
  const s = f.status.short;
  return s === "FT" || s === "AET" || s === "PEN";
}

export function shouldShowScore(f: Fixture): boolean {
  return (
    isMatchFinished(f) &&
    f.goals.home !== null &&
    f.goals.away !== null
  );
}

export const FIXTURE_STATUS_LABELS: Record<FixtureStatus, string> = {
  IN_PROGRESS: "En cours",
  FT: "Terminé",
  NS: "À venir",
  HT: "Mi-temps",
  PST: "Reporté",
  CANC: "Annulé",
  AET: "Prolongations",
  PEN: "Tirs au but",
};
