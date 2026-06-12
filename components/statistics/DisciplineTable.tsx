"use client";

import type { LocalStatistics, StatEntry } from "@/types/data";
import { PlayerCell, StatisticsTable } from "@/components/statistics/StatisticsTable";

export function YellowCardsTable({ players }: { players: StatEntry[] }) {
  return (
    <StatisticsTable
      rows={players}
      columns={[
        {
          key: "player",
          header: "Joueur",
          render: (p) => (
            <PlayerCell
              photo={p.photo}
              name={p.name}
              teamCode={p.teamCode}
              flagUrl={p.flag}
              teamName={p.teamName}
              teamLogo={p.teamLogo}
            />
          ),
        },
        {
          key: "yellow",
          header: "Jaunes",
          align: "right",
          render: (p) => (
            <span className="inline-flex items-center gap-1 font-bold tabular-nums">
              <span className="h-3 w-3 rounded-sm bg-yellow-400" aria-hidden />
              {p.yellowCards ?? 0}
            </span>
          ),
        },
      ]}
    />
  );
}

export function RedCardsTable({ players }: { players: StatEntry[] }) {
  return (
    <StatisticsTable
      rows={players}
      columns={[
        {
          key: "player",
          header: "Joueur",
          render: (p) => (
            <PlayerCell
              photo={p.photo}
              name={p.name}
              teamCode={p.teamCode}
              flagUrl={p.flag}
              teamName={p.teamName}
              teamLogo={p.teamLogo}
            />
          ),
        },
        {
          key: "red",
          header: "Rouges",
          align: "right",
          render: (p) => (
            <span className="inline-flex items-center gap-1 font-bold tabular-nums">
              <span className="h-3 w-3 rounded-sm bg-red-600" aria-hidden />
              {p.redCards ?? 0}
            </span>
          ),
        },
      ]}
    />
  );
}

export function SuspendedPlayersTable({
  players,
}: {
  players: LocalStatistics["suspended"];
}) {
  return (
    <StatisticsTable
      rows={players}
      emptyMessage="Aucun joueur suspendu pour le moment."
      columns={[
        {
          key: "player",
          header: "Joueur",
          render: (p) => (
            <PlayerCell
              name={p.name}
              teamCode={p.teamCode}
              flagUrl={p.flag}
              teamName={p.teamName}
              teamLogo={p.teamLogo}
            />
          ),
        },
        {
          key: "reason",
          header: "Raison",
          render: (p) => (
            <span className="text-sm text-muted-foreground">{p.reason}</span>
          ),
        },
      ]}
    />
  );
}
