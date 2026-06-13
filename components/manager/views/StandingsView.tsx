"use client";

import { useManagerData } from "@/context/manager-data-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ManualGroup, WorldCupManualData } from "@/types/worldcup-manual";

function GroupTable({
  group,
  teams,
}: {
  group: ManualGroup;
  teams: WorldCupManualData["teams"];
}) {
  return (
    <Card className="border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Groupe {group.letter}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground text-left">
              <th className="py-1 pr-2">Pos</th>
              <th className="py-1 pr-2">Team</th>
              <th className="py-1 px-1 text-center">P</th>
              <th className="py-1 px-1 text-center">W</th>
              <th className="py-1 px-1 text-center">D</th>
              <th className="py-1 px-1 text-center">L</th>
              <th className="py-1 px-1 text-center">GF</th>
              <th className="py-1 px-1 text-center">GA</th>
              <th className="py-1 px-1 text-center">GD</th>
              <th className="py-1 px-1 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {[...group.standings]
              .sort((a, b) => a.position - b.position)
              .map((row) => {
                const name = teams.find((t) => t.id === row.teamId)?.name ?? "?";
                return (
                  <tr key={row.teamId} className="border-t border-white/5">
                    <td className="py-2 pr-2 text-gold font-bold">{row.position}</td>
                    <td className="py-2 pr-2 font-medium max-w-[140px] truncate">{name}</td>
                    <td className="py-1 px-1 text-center tabular-nums">{row.played}</td>
                    <td className="py-1 px-1 text-center tabular-nums">{row.won}</td>
                    <td className="py-1 px-1 text-center tabular-nums">{row.draw}</td>
                    <td className="py-1 px-1 text-center tabular-nums">{row.lost}</td>
                    <td className="py-1 px-1 text-center tabular-nums">{row.goalsFor}</td>
                    <td className="py-1 px-1 text-center tabular-nums">{row.goalsAgainst}</td>
                    <td className="py-1 px-1 text-center tabular-nums">
                      {row.goalDifference > 0 ? "+" : ""}
                      {row.goalDifference}
                    </td>
                    <td className="py-1 px-1 text-center font-bold tabular-nums">
                      {row.points}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function StandingsView() {
  const { data, loading } = useManagerData();
  if (loading || !data) {
    return <p className="text-muted-foreground">Chargement des classements…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Groupes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Classements recalculés automatiquement depuis les matchs de poule terminés.
        </p>
      </div>
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.groups.map((g) => (
          <GroupTable key={g.letter} group={g} teams={data.teams} />
        ))}
      </div>
    </div>
  );
}
