import "server-only";

import { prisma } from "@/lib/prisma";

const FINISHED = new Set(["FT", "AET", "PEN", "CANC", "PST"]);

export type ManagerMatchAlert = {
  id: number;
  date: string;
  group: string | null;
  status: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  kind: "overdue" | "played";
  message: string;
};

/** Matchs dont l'heure est passée — alerte saisie ou confirmation */
export async function getManagerMatchAlerts(): Promise<ManagerMatchAlert[]> {
  const now = new Date();

  const rows = await prisma.fixture.findMany({
    where: {
      date: { lt: now },
      homeTeamId: { not: null },
      awayTeamId: { not: null },
    },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { date: "desc" },
    take: 30,
  });

  const alerts: ManagerMatchAlert[] = [];

  for (const f of rows) {
    const home = f.homeTeam?.name ?? "—";
    const away = f.awayTeam?.name ?? "—";
    const base = {
      id: f.legacyId,
      date: f.date.toISOString(),
      group: f.group,
      status: f.status,
      home,
      away,
      homeScore: f.homeScore,
      awayScore: f.awayScore,
    };

    if (!FINISHED.has(f.status)) {
      alerts.push({
        ...base,
        kind: "overdue",
        message: `Match passé — résultat à saisir : ${home} vs ${away}`,
      });
      continue;
    }

    const playedAt = f.date.getTime();
    const dayAgo = now.getTime() - 48 * 60 * 60 * 1000;
    if (playedAt >= dayAgo) {
      const score =
        f.homeScore != null && f.awayScore != null
          ? ` (${f.homeScore}-${f.awayScore})`
          : "";
      alerts.push({
        ...base,
        kind: "played",
        message: `Match joué${score} : ${home} vs ${away}`,
      });
    }
  }

  return alerts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
