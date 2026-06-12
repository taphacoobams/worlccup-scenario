"use client";

import type { StatEntry } from "@/types/data";
import { PlayerCell, StatisticsTable } from "@/components/statistics/StatisticsTable";

type Props = {
  title?: string;
  players: StatEntry[];
  mode: "goals" | "assists";
};

export function TopScorersTable({ title, players, mode }: Props) {
  const columns =
    mode === "goals"
      ? [
          {
            key: "player",
            header: "Joueur",
            render: (p: StatEntry) => (
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
            key: "goals",
            header: "Buts",
            align: "right" as const,
            render: (p: StatEntry) => (
              <span className="text-lg font-bold text-gold tabular-nums">{p.goals ?? 0}</span>
            ),
          },
          {
            key: "penalties",
            header: "Pen.",
            align: "right" as const,
            render: (p: StatEntry) => (
              <span className="tabular-nums text-muted-foreground">{p.penalties ?? 0}</span>
            ),
          },
          {
            key: "apps",
            header: "MJ",
            align: "right" as const,
            render: (p: StatEntry) => (
              <span className="tabular-nums">{p.appearances ?? 0}</span>
            ),
          },
        ]
      : [
          {
            key: "player",
            header: "Joueur",
            render: (p: StatEntry) => (
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
            key: "assists",
            header: "Passes D.",
            align: "right" as const,
            render: (p: StatEntry) => (
              <span className="text-lg font-bold text-gold tabular-nums">{p.assists ?? 0}</span>
            ),
          },
          {
            key: "apps",
            header: "MJ",
            align: "right" as const,
            render: (p: StatEntry) => (
              <span className="tabular-nums">{p.appearances ?? 0}</span>
            ),
          },
        ];

  return (
    <section>
      {title ? <h2 className="text-xl font-bold mb-4">{title}</h2> : null}
      <StatisticsTable rows={players} columns={columns} />
    </section>
  );
}
