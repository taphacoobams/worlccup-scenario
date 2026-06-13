import { cache } from "react";
import { readFileSync } from "fs";
import path from "path";
import { getFlag } from "@/lib/flags";
import {
  loadWorldCupFromFiles,
  saveWorldCupToFiles,
} from "@/lib/worldcup-persistence";
import {
  createBracketResolver,
  type BracketResolver,
  type ResolvedParticipant,
  teamFromSlotOrId,
} from "@/lib/resolve-bracket-slot";
import { loadGroupScenarioFrequencies } from "@/lib/qualification-server";
import { sortStandingsByStats } from "@/lib/qualification";
import type {
  Coach,
  Fixture,
  FixtureDetail,
  FixtureEvent,
  GroupStanding,
  KnockoutRound,
  Player,
  Team,
  WorldCupGroup,
} from "@/types/worldcup";
import type {
  ManualFixture,
  ManualTeam,
  WorldCupManualData,
} from "@/types/worldcup-manual";
import { resolveVenueImage } from "@/lib/stadium-images";

const TABLEAU_FILE = path.join(process.cwd(), "data", "tableau-final.json");

const STATUS_LONG: Record<string, string> = {
  NS: "Not Started",
  FT: "Match Finished",
  HT: "Halftime",
  PST: "Postponed",
  CANC: "Cancelled",
  AET: "After Extra Time",
  PEN: "Penalty Shootout",
};

/** Libellés exacts issus de matchs.txt — évite que « Seizièmes de finale » matche « Finale » */
const KNOCKOUT_ROUNDS: {
  id: string;
  label: string;
  matchRound: (round: string) => boolean;
}[] = [
  {
    id: "r32",
    label: "Seizièmes de finale",
    matchRound: (r) => /^Seizièmes de finale$/i.test(r.trim()),
  },
  {
    id: "r16",
    label: "Huitièmes de finale",
    matchRound: (r) => /^Huitièmes de finale$/i.test(r.trim()),
  },
  {
    id: "qf",
    label: "Quarts de finale",
    matchRound: (r) => /^Quarts de finale$/i.test(r.trim()),
  },
  {
    id: "sf",
    label: "Demi-finales",
    matchRound: (r) => /^Demi-finales$/i.test(r.trim()),
  },
  {
    id: "third",
    label: "Match pour la troisième place",
    matchRound: (r) => /troisième place/i.test(r),
  },
  { id: "final", label: "Finale", matchRound: (r) => /^Finale$/i.test(r.trim()) },
];

export async function readWorldCupData(): Promise<WorldCupManualData> {
  const data = await loadWorldCupFromFiles();
  return syncTeamFlags(data);
}

export async function writeWorldCupData(data: WorldCupManualData): Promise<void> {
  const synced = syncTeamFlags(data);
  await saveWorldCupToFiles(synced);
}

export function isManagerConfigured(): boolean {
  return Boolean(process.env.MANAGER_SECRET?.trim());
}

export function verifyManagerSecret(header: string | null): boolean {
  const secret = process.env.MANAGER_SECRET?.trim();
  if (!secret) return false;
  if (!header?.startsWith("Bearer ")) return false;
  return header.slice(7) === secret;
}

function toTeam(t: ManualTeam): Team {
  return {
    id: t.id,
    name: t.name,
    code: t.code.toUpperCase(),
    country: t.country ?? t.name,
    fifaRanking: t.fifaRanking ?? null,
    logo: getFlag(t.code, null, t.name),
  };
}

/** Drapeaux via flagcdn à l’affichage — pas de persistance logo/flag sur les équipes. */
export function syncTeamFlags(data: WorldCupManualData): WorldCupManualData {
  return {
    ...data,
    teams: [...data.teams].sort((a, b) => a.name.localeCompare(b.name, "fr")),
  };
}

function toCoach(t: ManualTeam): Coach | null {
  if (!t.coach?.name) return null;
  return {
    id: t.id,
    name: t.coach.name,
    firstname: "",
    lastname: "",
    age: null,
    nationality: t.coach.nationality ?? "",
    photo: t.coach.photo ?? "",
  };
}

function toFixture(
  m: ManualFixture,
  teams: Map<number, Team>,
  resolver: BracketResolver
): Fixture {
  const home = teamFromSlotOrId(
    m.homeTeamId,
    m.homeTeam,
    teams,
    resolver,
    m.homeTeamId || -1
  );
  const away = teamFromSlotOrId(
    m.awayTeamId,
    m.awayTeam,
    teams,
    resolver,
    m.awayTeamId || -2
  );
  return {
    id: m.id,
    date: m.date,
    timestamp: Math.floor(new Date(m.date).getTime() / 1000),
    timezone: m.timezone ?? "UTC",
    venue: {
      id: 0,
      name: m.venue.name,
      city: m.venue.city,
      image: resolveVenueImage(m.venue.name, m.venueImage ?? m.venue.image),
    },
    status: {
      short: m.status,
      long: STATUS_LONG[m.status] ?? m.status,
      elapsed: null,
    },
    round: m.round,
    group: m.group,
    teams: { home, away },
    goals: m.goals,
  };
}

function toEvents(
  m: ManualFixture,
  teams: Map<number, Team>,
  allTeams: { id: number; code: string }[]
): FixtureEvent[] {
  if (!m.events?.length) return [];

  const codeToTeamId = new Map(allTeams.map((t) => [t.code, t.id]));
  const assistsByGoal = new Map(
    m.events
      .filter((e) => e.type === "assist" && e.linkedGoalId)
      .map((e) => [e.linkedGoalId!, e])
  );

  return m.events
    .filter((e) => e.type !== "assist")
    .map((e) => {
      const teamLegacyId = codeToTeamId.get(e.teamCode) ?? 0;
      const team = teams.get(teamLegacyId);
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
          name: team?.name ?? "",
          code: team?.code ?? e.teamCode,
          logo: team?.logo ?? "",
        },
        player: {
          id: e.playerId ? Number(e.playerId) : null,
          name: e.playerName,
        },
        assist: {
          id: assist?.playerId ? Number(assist.playerId) : null,
          name: assist?.playerName ?? null,
        },
        type:
          e.type === "yellow_card" || e.type === "red_card" ? "Card" : "Goal",
        detail,
        comments: null,
      };
    });
}

function buildTeamsMap(data: WorldCupManualData): Map<number, Team> {
  return new Map(data.teams.map((t) => [t.id, toTeam(t)]));
}

export const loadWorldCupData = cache(readWorldCupData);

export const getWorldCupTeams = cache(async (): Promise<Team[]> => {
  const data = await loadWorldCupData();
  return data.teams.map(toTeam).sort((a, b) => a.name.localeCompare(b.name));
});

export function buildGroupSummaries(
  groups: WorldCupGroup[]
): Record<string, string> {
  return Object.fromEntries(
    groups.map((g) => [
      g.letter,
      g.standings.map((s) => s.team.name).join(" · "),
    ])
  );
}

export const getWorldCupGroups = cache(async (): Promise<WorldCupGroup[]> => {
  const data = await loadWorldCupData();
  const teams = buildTeamsMap(data);

  return data.groups
    .map((g) => ({
      name: `Groupe ${g.letter}`,
      letter: g.letter.toUpperCase(),
      standings: sortStandingsByStats(
        g.standings.map(
          (row): GroupStanding => ({
            position: row.position,
            team: teams.get(row.teamId)!,
            played: row.played,
            won: row.won,
            draw: row.draw,
            lost: row.lost,
            goalsFor: row.goalsFor,
            goalsAgainst: row.goalsAgainst,
            goalDifference: row.goalDifference,
            points: row.points,
          })
        )
      ),
    }))
    .sort((a, b) => a.letter.localeCompare(b.letter));
});

export type GroupsStandingsSource = "manual";

export const getGroupsWithResults = cache(async () => {
  const groups = await getWorldCupGroups();
  return {
    groups,
    standingsSource: "manual" as GroupsStandingsSource,
  };
});

export const getWorldCupFixtures = cache(async (): Promise<Fixture[]> => {
  const data = await loadWorldCupData();
  const teams = buildTeamsMap(data);
  const groupFrequencies = await loadGroupScenarioFrequencies();
  const resolver = createBracketResolver(data, teams, groupFrequencies);
  return data.fixtures
    .map((f) => toFixture(f, teams, resolver))
    .sort((a, b) => a.timestamp - b.timestamp);
});

export const getRecentFinishedFixtures = cache(
  async (limit = 6): Promise<Fixture[]> => {
    const fixtures = await getWorldCupFixtures();
    return fixtures
      .filter((f) => f.status.short === "FT" || f.status.short === "AET" || f.status.short === "PEN")
      .filter((f) => f.goals.home !== null && f.goals.away !== null)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
);

export const getFixtureById = cache(
  async (id: number): Promise<FixtureDetail | null> => {
    const data = await loadWorldCupData();
    const teams = buildTeamsMap(data);
    const groupFrequencies = await loadGroupScenarioFrequencies();
    const resolver = createBracketResolver(data, teams, groupFrequencies);
    const raw = data.fixtures.find((f) => f.id === id);
    if (!raw) return null;
    return {
      ...toFixture(raw, teams, resolver),
      events: toEvents(raw, teams, data.teams),
      statistics: [],
      lineups: [],
      players: [],
    };
  }
);

export const getTeamById = cache(async (teamId: number): Promise<Team | null> => {
  const data = await loadWorldCupData();
  const t = data.teams.find((x) => x.id === teamId);
  return t ? toTeam(t) : null;
});

export const getTeamGroupLetter = cache(
  async (teamId: number): Promise<string | null> => {
    const data = await loadWorldCupData();
    for (const g of data.groups) {
      if (g.standings.some((s) => s.teamId === teamId)) {
        return g.letter.toUpperCase();
      }
    }
    return null;
  }
);

export const getCoach = cache(async (teamId: number): Promise<Coach | null> => {
  const data = await loadWorldCupData();
  const t = data.teams.find((x) => x.id === teamId);
  if (!t) return null;
  return toCoach(t);
});

export const getPlayers = cache(async (): Promise<Player[]> => {
  const data = await loadWorldCupData();
  return data.players.map((p) => ({
    id: p.id,
    name: p.name,
    age: p.age ?? null,
    nationality: p.nationality ?? "",
    height: null,
    weight: null,
    position: p.position ?? null,
    photo: p.photo ?? "",
    teamId: p.teamId,
  }));
});

export const getKnockoutBracket = cache(async (): Promise<KnockoutRound[]> => {
  const fixtures = await getWorldCupFixtures();
  const knockout = fixtures.filter((f) =>
    KNOCKOUT_ROUNDS.some((kr) => kr.matchRound(f.round))
  );

  return KNOCKOUT_ROUNDS.map((p) => ({
    id: p.id,
    label: p.label,
    fixtures: knockout
      .filter((f) => p.matchRound(f.round))
      .sort((a, b) => a.timestamp - b.timestamp),
  })).filter((r) => r.fixtures.length > 0);
});

export type TableauMatch = {
  matchNumber: number;
  id: string;
  home: string;
  away: string;
  date?: string | null;
  venue?: string;
  city?: string;
};

export type TableauRound = {
  key: string;
  label: string;
  matches: TableauMatch[];
};

export type EnrichedTableauMatch = TableauMatch & {
  fixture: Fixture | null;
  homeResolved: ResolvedParticipant;
  awayResolved: ResolvedParticipant;
};

export type EnrichedTableauRound = Omit<TableauRound, "matches"> & {
  matches: EnrichedTableauMatch[];
};

export const getKnockoutTableau = cache(async (): Promise<EnrichedTableauRound[]> => {
  const data = await loadWorldCupData();
  const teams = buildTeamsMap(data);
  const groupFrequencies = await loadGroupScenarioFrequencies();
  const resolver = createBracketResolver(data, teams, groupFrequencies);
  const fixtures = data.fixtures
    .map((f) => toFixture(f, teams, resolver))
    .sort((a, b) => a.timestamp - b.timestamp);
  const byNumber = new Map(fixtures.map((f) => [f.id, f]));

  const raw = JSON.parse(readFileSync(TABLEAU_FILE, "utf-8")) as {
    rounds: TableauRound[];
  };

  return raw.rounds.map((round) => ({
    ...round,
    matches: round.matches.map((m) => ({
      ...m,
      fixture: byNumber.get(m.matchNumber) ?? null,
      homeResolved: resolver.resolve(m.home),
      awayResolved: resolver.resolve(m.away),
    })),
  }));
});

export const getHeadToHead = cache(
  async (_teamA: number, _teamB: number): Promise<Fixture[]> => {
    const fixtures = await getWorldCupFixtures();
    return fixtures.filter(
      (f) =>
        f.status.short === "FT" &&
        ((f.teams.home.id === _teamA && f.teams.away.id === _teamB) ||
          (f.teams.home.id === _teamB && f.teams.away.id === _teamA))
    );
  }
);
