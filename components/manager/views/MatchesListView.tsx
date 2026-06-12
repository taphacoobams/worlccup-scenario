"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useManagerData } from "@/context/manager-data-context";
import { Button } from "@/components/ui/button";

type StatusFilter = "all" | "NS" | "FT" | "LIVE";

export function MatchesListView() {
  const { data, loading, teamName } = useManagerData();
  const [teamQuery, setTeamQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const fixtures = useMemo(() => {
    if (!data) return [];
    return [...data.fixtures].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  const filtered = useMemo(() => {
    const q = teamQuery.trim().toLowerCase();
    return fixtures.filter((f) => {
      if (groupFilter !== "all" && f.group?.toUpperCase() !== groupFilter) return false;
      if (dateFilter) {
        const d = new Date(f.date).toISOString().slice(0, 10);
        if (d !== dateFilter) return false;
      }
      if (statusFilter === "NS" && f.status !== "NS") return false;
      if (statusFilter === "FT" && !["FT", "AET", "PEN"].includes(f.status)) return false;
      if (statusFilter === "LIVE" && !["HT", "1H", "2H"].includes(f.status)) return false;
      if (q) {
        const home = teamName(f.homeTeamId).toLowerCase();
        const away = teamName(f.awayTeamId).toLowerCase();
        if (!home.includes(q) && !away.includes(q)) return false;
      }
      return true;
    });
  }, [fixtures, groupFilter, dateFilter, statusFilter, teamQuery, teamName]);

  if (loading || !data) {
    return <p className="text-muted-foreground">Chargement des matchs…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Matches</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data.fixtures.length} matchs — le score est dérivé des événements.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <label className="text-muted-foreground">
          Équipe
          <input
            className="ml-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5"
            value={teamQuery}
            onChange={(e) => setTeamQuery(e.target.value)}
            placeholder="Rechercher…"
          />
        </label>
        <label className="text-muted-foreground">
          Groupe
          <select
            className="ml-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
          >
            <option value="all">Tous</option>
            {data.groups.map((g) => (
              <option key={g.letter} value={g.letter.toUpperCase()}>
                {g.letter}
              </option>
            ))}
          </select>
        </label>
        <label className="text-muted-foreground">
          Date
          <input
            type="date"
            className="ml-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </label>
        <label className="text-muted-foreground">
          Statut
          <select
            className="ml-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="all">Tous</option>
            <option value="NS">À jouer</option>
            <option value="FT">Terminé</option>
            <option value="LIVE">En cours</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
              <th className="p-3">Date</th>
              <th className="p-3">Heure</th>
              <th className="p-3">Groupe</th>
              <th className="p-3">Domicile</th>
              <th className="p-3">Extérieur</th>
              <th className="p-3">Score</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => {
              const d = new Date(f.date);
              return (
                <tr key={f.id} className="border-b border-white/5">
                  <td className="p-3 tabular-nums">
                    {d.toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-3 tabular-nums">
                    {d.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3 font-mono text-gold">{f.group ?? "—"}</td>
                  <td className="p-3">{teamName(f.homeTeamId) || f.homeTeam}</td>
                  <td className="p-3">{teamName(f.awayTeamId) || f.awayTeam}</td>
                  <td className="p-3 tabular-nums font-medium">
                    {f.goals.home != null && f.goals.away != null
                      ? `${f.goals.home} - ${f.goals.away}`
                      : "—"}
                  </td>
                  <td className="p-3">{f.status}</td>
                  <td className="p-3">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/matches/${f.id}`}>Modifier</Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
