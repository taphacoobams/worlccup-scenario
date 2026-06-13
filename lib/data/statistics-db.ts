import "server-only";

import { prisma } from "@/lib/prisma";
import { getFlag } from "@/lib/flags";
import { isDatabaseEnabled } from "@/lib/database";
import { loadWorldCupFromFiles } from "@/lib/worldcup-persistence";
import { recalculateStatistics, statsToJson } from "@/lib/tournament-engine/statistics";
import type { StatEntry, StatisticsViewData } from "@/types/data";

type PlayerRow = {
  legacyId: number;
  name: string;
  image: string | null;
  team: { legacyId: number; name: string; code: string };
};

function toStatEntry(
  player: PlayerRow,
  stats: Partial<Pick<StatEntry, "goals" | "assists" | "yellowCards" | "redCards">>
): StatEntry {
  return {
    playerId: player.legacyId,
    name: player.name,
    teamId: player.team.legacyId,
    teamName: player.team.name,
    teamCode: player.team.code,
    flag: getFlag(player.team.code, null, player.team.name),
    photo: player.image ?? undefined,
    ...stats,
  };
}

async function loadFromPrisma(): Promise<StatisticsViewData | null> {
  if (!isDatabaseEnabled()) return null;

  const [scorers, assists, cards, players] = await Promise.all([
    prisma.scorer.findMany({
      include: {
        player: { include: { team: { select: { legacyId: true, name: true, code: true } } } },
      },
      orderBy: { goals: "desc" },
    }),
    prisma.assist.findMany({
      include: {
        player: { include: { team: { select: { legacyId: true, name: true, code: true } } } },
      },
      orderBy: { assists: "desc" },
    }),
    prisma.card.findMany({
      include: {
        player: { include: { team: { select: { legacyId: true, name: true, code: true } } } },
      },
      orderBy: [{ yellowCards: "desc" }, { redCards: "desc" }],
    }),
    prisma.player.findMany({
      select: {
        legacyId: true,
        name: true,
        image: true,
        team: { select: { legacyId: true, name: true, code: true } },
      },
    }),
  ]);

  const playerMap = new Map(players.map((p) => [p.legacyId, p]));

  const resolvePlayer = (legacyId: number): PlayerRow | null => {
    const p = playerMap.get(legacyId);
    if (!p) return null;
    return {
      legacyId: p.legacyId,
      name: p.name,
      image: p.image,
      team: p.team,
    };
  };

  const topScorers: StatEntry[] = scorers
    .map((s) => {
      const p = resolvePlayer(s.player.legacyId);
      return p ? toStatEntry(p, { goals: s.goals }) : null;
    })
    .filter((x): x is StatEntry => x != null);

  const topAssists: StatEntry[] = assists
    .map((a) => {
      const p = resolvePlayer(a.player.legacyId);
      return p ? toStatEntry(p, { assists: a.assists }) : null;
    })
    .filter((x): x is StatEntry => x != null);

  const topYellowCards: StatEntry[] = cards
    .filter((c) => c.yellowCards > 0)
    .map((c) => {
      const p = resolvePlayer(c.player.legacyId);
      return p ? toStatEntry(p, { yellowCards: c.yellowCards }) : null;
    })
    .filter((x): x is StatEntry => x != null);

  const topRedCards: StatEntry[] = cards
    .filter((c) => c.redCards > 0)
    .map((c) => {
      const p = resolvePlayer(c.player.legacyId);
      return p ? toStatEntry(p, { redCards: c.redCards }) : null;
    })
    .filter((x): x is StatEntry => x != null);

  const suspended = cards
    .filter((c) => c.suspended)
    .map((c) => {
      const p = resolvePlayer(c.player.legacyId);
      if (!p) return null;
      return {
        playerId: p.legacyId,
        name: p.name,
        teamId: p.team.legacyId,
        teamName: p.team.name,
        teamCode: p.team.code,
        flag: getFlag(p.team.code, null, p.team.name),
        reason: "Suspension disciplinaire",
      };
    })
    .filter((x) => x != null) as StatisticsViewData["suspended"];

  const updatedAt =
    [
      ...scorers.map((s) => s.updatedAt),
      ...assists.map((a) => a.updatedAt),
      ...cards.map((c) => c.updatedAt),
    ]
      .sort((a, b) => b.getTime() - a.getTime())[0]
      ?.toISOString() ?? new Date().toISOString();

  return {
    topScorers,
    topAssists,
    topYellowCards,
    topRedCards,
    suspended,
    updatedAt,
  };
}

async function loadFromEngine(): Promise<StatisticsViewData> {
  const data = await loadWorldCupFromFiles();
  const raw = recalculateStatistics(data);
  const json = statsToJson(raw);

  const playerMap = new Map(data.players.map((p) => [p.id, p]));
  const teamMap = new Map(data.teams.map((t) => [t.id, t]));

  const build = (
    rows: { playerId: number; goals?: number; assists?: number; yellowCards?: number; redCards?: number }[],
    field: "goals" | "assists" | "yellowCards" | "redCards"
  ): StatEntry[] =>
    rows
      .map((row) => {
        const player = playerMap.get(row.playerId);
        const team = player ? teamMap.get(player.teamId) : null;
        if (!player || !team) return null;
        return toStatEntry(
          {
            legacyId: player.id,
            name: player.name,
            image: player.photo ?? null,
            team: { legacyId: team.id, name: team.name, code: team.code },
          },
          { [field]: row[field] ?? 0 }
        );
      })
      .filter((x): x is StatEntry => x != null);

  return {
    topScorers: build(json.scorers, "goals"),
    topAssists: build(json.assists, "assists"),
    topYellowCards: build(
      json.cards.filter((c) => c.yellowCards > 0),
      "yellowCards"
    ),
    topRedCards: build(
      json.cards.filter((c) => c.redCards > 0),
      "redCards"
    ),
    suspended: json.cards
      .filter((c) => c.suspended)
      .map((c) => {
        const player = playerMap.get(c.playerId);
        const team = player ? teamMap.get(player.teamId) : null;
        if (!player || !team) return null;
        return {
          playerId: player.id,
          name: player.name,
          teamId: team.id,
          teamName: team.name,
          teamCode: team.code,
          flag: getFlag(team.code, null, team.name),
          reason: "Suspension disciplinaire",
        };
      })
      .filter((x) => x != null) as StatisticsViewData["suspended"],
    updatedAt: new Date().toISOString(),
  };
}

export async function loadStatisticsViewData(): Promise<StatisticsViewData> {
  try {
    const fromDb = await loadFromPrisma();
    if (fromDb && fromDb.topScorers.length + fromDb.topAssists.length > 0) {
      return fromDb;
    }
  } catch {
    /* fallback moteur */
  }

  if (isDatabaseEnabled()) {
    try {
      return await loadFromEngine();
    } catch {
      /* empty */
    }
  }

  return {
    topScorers: [],
    topAssists: [],
    topYellowCards: [],
    topRedCards: [],
    suspended: [],
    updatedAt: new Date().toISOString(),
  };
}
