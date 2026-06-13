"use client";

import type { LocalStatistics, StatEntry } from "@/types/data";
import { PlayerCell, StatisticsTable } from "@/components/statistics/StatisticsTable";
import { cn } from "@/lib/utils";

function MatchRef({
  label,
  date,
}: {
  label?: string;
  date?: string;
}) {
  if (!label) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="block text-sm">
      <span className="text-foreground">{label}</span>
      {date && (
        <span className="block text-[11px] text-muted-foreground mt-0.5">{date}</span>
      )}
    </span>
  );
}

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
              playerId={p.playerId}
              name={p.name}
              photo={p.photo}
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
              playerId={p.playerId}
              name={p.name}
              photo={p.photo}
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
  const activeCount = players.filter((p) => p.active !== false).length;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {activeCount > 0
          ? `${activeCount} suspension${activeCount > 1 ? "s" : ""} en cours`
          : "Aucune suspension en cours — historique des sanctions ci-dessous."}
      </p>
      <StatisticsTable
        rows={players}
        emptyMessage="Aucune suspension enregistrée pour le moment."
        columns={[
          {
            key: "player",
            header: "Joueur",
            render: (p) => (
              <PlayerCell
                playerId={p.playerId}
                name={p.name}
                photo={p.photo}
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
          {
            key: "since",
            header: "Suspendu depuis",
            render: (p) => (
              <MatchRef
                label={p.suspendedSinceMatch}
                date={p.suspendedSince}
              />
            ),
          },
          {
            key: "misses",
            header: "Match manqué",
            render: (p) => (
              <MatchRef label={p.missesMatch} date={p.missesMatchDate} />
            ),
          },
          {
            key: "returns",
            header: "Retour prévu",
            render: (p) => (
              <MatchRef label={p.returnsMatch} date={p.returnsMatchDate} />
            ),
          },
          {
            key: "status",
            header: "Statut",
            align: "right",
            render: (p) => (
              <span
                className={cn(
                  "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                  p.active !== false
                    ? "bg-amber-500/15 text-amber-300"
                    : "bg-white/5 text-muted-foreground"
                )}
              >
                {p.active !== false ? "En cours" : "Purgée"}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
