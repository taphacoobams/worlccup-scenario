"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { useManagerData } from "@/context/manager-data-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TeamFlag } from "@/components/ui/team-flag";
import { TOTAL_SCENARIOS } from "@/lib/constants";

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);

type MatchAlert = {
  id: number;
  matchNumber: number;
  home: string;
  away: string;
  homeCode: string;
  awayCode: string;
};

type TodayMatch = {
  id: number;
  date: string;
  home: string;
  away: string;
  homeCode: string;
  awayCode: string;
  homeScore: number | null;
  awayScore: number | null;
  group: string | null;
  status: string;
};

type DashboardStats = {
  teams: number;
  players: number;
  fixtures: number;
  groups: number;
  scenarios: number;
  finishedMatches: number;
  remainingMatches: number;
  goals: number;
  goalsPerMatch: number;
  assists: number;
  yellowCards: number;
  redCards: number;
};

type KpiItem = {
  key: keyof DashboardStats;
  label: string;
  format?: (v: number) => string;
};

const ADMIN_KPI: KpiItem[] = [
  { key: "finishedMatches", label: "Matchs joués" },
  { key: "remainingMatches", label: "Matchs restants" },
  { key: "goals", label: "Buts" },
  { key: "goalsPerMatch", label: "Buts/match", format: (v: number) => v.toFixed(2) },
  { key: "assists", label: "Passes décisives" },
  { key: "yellowCards", label: "Cartons jaunes" },
  { key: "redCards", label: "Cartons rouges" },
];

export function ManagerDashboardView() {
  const { data, loading, teamName, teamCode } = useManagerData();

  const { alerts, todayMatches, stats } = useMemo(() => {
    if (!data) {
      return {
        alerts: [] as MatchAlert[],
        todayMatches: [] as TodayMatch[],
        stats: null as DashboardStats | null,
      };
    }

    const now = new Date();
    const timeZone = "America/New_York";
    const nowInET = new Date(now.toLocaleString("en-US", { timeZone }));
    const startOfDay = new Date(nowInET);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Alerts: matches that should have been played but have no result
    const overdueAlerts: MatchAlert[] = data.fixtures
      .filter((f) => {
        const matchDate = new Date(f.date);
        return matchDate < now && !FINISHED_STATUSES.has(f.status) && f.homeTeamId > 0 && f.awayTeamId > 0;
      })
      .slice(0, 16)
      .map((f) => ({
        id: f.id,
        matchNumber: f.id,
        home: teamName(f.homeTeamId),
        away: teamName(f.awayTeamId),
        homeCode: teamCode(f.homeTeamId),
        awayCode: teamCode(f.awayTeamId),
      }));

    // Today matches
    const today: TodayMatch[] = data.fixtures
      .filter((f) => {
        const matchDate = new Date(f.date);
        return matchDate >= startOfDay && matchDate < endOfDay && matchDate >= nowInET;
      })
      .map((f) => ({
        id: f.id,
        date: f.date,
        home: teamName(f.homeTeamId),
        away: teamName(f.awayTeamId),
        homeCode: teamCode(f.homeTeamId),
        awayCode: teamCode(f.awayTeamId),
        homeScore: f.goals.home,
        awayScore: f.goals.away,
        group: f.group,
        status: f.status,
      }));

    // Stats
    const finishedMatches = data.fixtures.filter((f) => FINISHED_STATUSES.has(f.status)).length;
    let totalGoals = 0;
    let totalAssists = 0;
    let totalYellowCards = 0;
    let totalRedCards = 0;

    for (const f of data.fixtures) {
      if (!f.events) continue;
      for (const e of f.events) {
        if (e.type === "goal" && !e.isOwnGoal) totalGoals++;
        if (e.type === "assist") totalAssists++;
        if (e.type === "yellow_card") totalYellowCards++;
        if (e.type === "red_card") totalRedCards++;
      }
    }

    const dashStats: DashboardStats = {
      teams: data.teams.length,
      players: data.players.length,
      fixtures: data.fixtures.length,
      groups: data.groups.length,
      scenarios: TOTAL_SCENARIOS,
      finishedMatches,
      remainingMatches: data.fixtures.length - finishedMatches,
      goals: totalGoals,
      goalsPerMatch: finishedMatches > 0 ? Math.round((totalGoals / finishedMatches) * 100) / 100 : 0,
      assists: totalAssists,
      yellowCards: totalYellowCards,
      redCards: totalRedCards,
    };

    return { alerts: overdueAlerts, todayMatches: today, stats: dashStats };
  }, [data, teamName, teamCode]);

  if (loading) {
    return <p className="text-muted-foreground">Chargement du dashboard…</p>;
  }

  if (!data) {
    return <p className="text-muted-foreground">Impossible de charger les données.</p>;
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Console d&apos;administration — Coupe du Monde FIFA 2026
        </p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="rounded-xl border border-amber-500/40 bg-amber-500/10 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-amber-500/30 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <h2 className="font-semibold text-amber-200">
              {alerts.length} match{alerts.length > 1 ? "s" : ""} à saisir
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {alerts.map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/matches/${a.id}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                >
                  <span className="text-xs font-mono text-muted-foreground">#{a.matchNumber}</span>
                  <div className="flex items-center gap-1">
                    <TeamFlag code={a.homeCode} teamName={a.home} size="sm" />
                    <span className="text-xs text-muted-foreground">vs</span>
                    <TeamFlag code={a.awayCode} teamName={a.away} size="sm" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* KPI Grid */}
      {stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {ADMIN_KPI.map(({ key, label, format }) => (
            <Card key={key} className="border-white/10 bg-white/2">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold tabular-nums mt-1">
                  {format ? format(stats[key] as number) : stats[key]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Today Matches */}
      <section className="rounded-xl border border-white/10 bg-white/2 overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="font-semibold">Matchs du jour</h2>
        </div>
        {todayMatches.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Aucun match prévu aujourd'hui.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
                  <th className="p-3">Heure</th>
                  <th className="p-3">Match</th>
                  <th className="p-3">Groupe</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {todayMatches.map((m) => (
                  <tr key={m.id} className="border-b border-white/5">
                    <td className="p-3 tabular-nums">
                      {new Date(m.date).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <TeamFlag code={m.homeCode} teamName={m.home} size="sm" />
                        <span>{m.home}</span>
                        {m.homeScore != null && m.awayScore != null ? (
                          <span className="font-medium">{` ${m.homeScore} - ${m.awayScore} `}</span>
                        ) : (
                          <span className="text-muted-foreground"> — </span>
                        )}
                        <TeamFlag code={m.awayCode} teamName={m.away} size="sm" />
                        <span>{m.away}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-gold">{m.group ?? "—"}</td>
                    <td className="p-3">{m.status}</td>
                    <td className="p-3">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/matches/${m.id}`}>Modifier</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
