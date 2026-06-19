"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useEffect } from "react";
import { useManagerData } from "@/context/manager-data-context";
import { Button } from "@/components/ui/button";
import { TeamFlag } from "@/components/ui/team-flag";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "NS" | "FT" | "LIVE";
type RoundFilter = "all" | "matchday1" | "matchday2" | "matchday3" | "r16" | "qf" | "sf" | "third" | "final";
type SortMode = "date" | "group";

export function MatchesListView() {
  const { data, loading, teamName, teamCode } = useManagerData();
  const [teamQuery, setTeamQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roundFilter, setRoundFilter] = useState<RoundFilter>("all");
  const [stadiumQuery, setStadiumQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!sortRef.current?.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [sortOpen]);

  const fixtures = useMemo(() => {
    if (!data) return [];
    return [...data.fixtures];
  }, [data]);

  const filtered = useMemo(() => {
    const q = teamQuery.trim().toLowerCase();
    const s = stadiumQuery.trim().toLowerCase();
    return fixtures.filter((f) => {
      if (groupFilter !== "all" && f.group?.toUpperCase() !== groupFilter) return false;
      if (dateFilter) {
        const d = new Date(f.date).toISOString().slice(0, 10);
        if (d !== dateFilter) return false;
      }
      if (statusFilter === "NS" && f.status !== "NS") return false;
      if (statusFilter === "FT" && !["FT", "AET", "PEN"].includes(f.status)) return false;
      if (statusFilter === "LIVE" && !["HT", "1H", "2H"].includes(f.status)) return false;
      if (roundFilter !== "all") {
        const round = getRoundFilterValue(f.round, f.matchday);
        if (round !== roundFilter) return false;
      }
      if (q) {
        const home = teamName(f.homeTeamId).toLowerCase();
        const away = teamName(f.awayTeamId).toLowerCase();
        if (!home.includes(q) && !away.includes(q)) return false;
      }
      if (s) {
        const stadium = f.venue.name.toLowerCase();
        if (!stadium.includes(s)) return false;
      }
      return true;
    });
  }, [fixtures, groupFilter, dateFilter, statusFilter, roundFilter, teamQuery, stadiumQuery, teamName]);

  const sorted = useMemo(() => {
    const sortedFixtures = [...filtered];
    switch (sortMode) {
      case "date":
        return sortedFixtures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case "group":
        return sortedFixtures.sort((a, b) => {
          const groupA = a.group ?? "ZZ";
          const groupB = b.group ?? "ZZ";
          if (groupA !== groupB) return groupA.localeCompare(groupB);
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
      default:
        return sortedFixtures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  }, [filtered, sortMode]);

  function getRoundFilterValue(round: string, matchday?: number): RoundFilter {
    const roundLower = round.toLowerCase();
    if (roundLower.includes("group") || roundLower.includes("groupe")) {
      if (matchday === 1) return "matchday1";
      if (matchday === 2) return "matchday2";
      if (matchday === 3) return "matchday3";
    }
    if (roundLower.includes("round of 16") || roundLower.includes("huitièmes")) return "r16";
    if (roundLower.includes("quarter") || roundLower.includes("quarts")) return "qf";
    if (roundLower.includes("semi") || roundLower.includes("demi")) return "sf";
    if (roundLower.includes("third") || roundLower.includes("3e") || roundLower.includes("3ème")) return "third";
    if (roundLower.includes("final")) return "final";
    return "all";
  }

  function canEditMatch(fixture: typeof fixtures[0]): boolean {
    // Match is finished
    if (fixture.status === "FT" || fixture.status === "AET" || fixture.status === "PEN") {
      return true;
    }
    // Match is in progress or finished based on time (match duration = 2 hours)
    // Use same timezone as today matches (America/New_York)
    const timeZone = "America/New_York";
    const nowInET = new Date(new Date().toLocaleString("en-US", { timeZone }));
    const matchTime = new Date(fixture.date);
    const matchEndTime = new Date(matchTime.getTime() + 2 * 60 * 60 * 1000); // +2 hours
    return nowInET >= matchEndTime;
  }

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
          Journée
          <select
            className="ml-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5"
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value as RoundFilter)}
          >
            <option value="all">Toutes</option>
            <option value="matchday1">1ère journée</option>
            <option value="matchday2">2ème journée</option>
            <option value="matchday3">3ème journée</option>
            <option value="r16">Huitièmes</option>
            <option value="qf">Quarts</option>
            <option value="sf">Demi-finales</option>
            <option value="third">3e place</option>
            <option value="final">Finale</option>
          </select>
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
        <label className="text-muted-foreground">
          Stade
          <input
            className="ml-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5"
            value={stadiumQuery}
            onChange={(e) => setStadiumQuery(e.target.value)}
            placeholder="Rechercher…"
          />
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
          Trier par
          <div ref={sortRef} className="relative ml-2">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className="flex h-9 items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
            >
              <span>{sortMode === "date" ? "Date" : "Groupe"}</span>
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 transition-transform", sortOpen && "rotate-180")}
                aria-hidden
              />
            </button>

            {sortOpen && (
              <ul
                role="listbox"
                className="absolute z-50 mt-1 w-full overflow-auto rounded-lg border border-white/10 bg-[#0f172a] py-1 shadow-xl"
              >
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={sortMode === "date"}
                    onClick={() => {
                      setSortMode("date");
                      setSortOpen(false);
                    }}
                    className={cn(
                      "flex w-full px-3 py-2 text-left text-sm hover:bg-white/5",
                      sortMode === "date" && "bg-primary/10 text-primary"
                    )}
                  >
                    Date
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-selected={sortMode === "group"}
                    onClick={() => {
                      setSortMode("group");
                      setSortOpen(false);
                    }}
                    className={cn(
                      "flex w-full px-3 py-2 text-left text-sm hover:bg-white/5",
                      sortMode === "group" && "bg-primary/10 text-primary"
                    )}
                  >
                    Groupe
                  </button>
                </li>
              </ul>
            )}
          </div>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          {sorted.length} match{sorted.length !== 1 ? "s" : ""} affiché{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
              <th className="p-3">Date</th>
              <th className="p-3">Heure</th>
              <th className="p-3">Groupe</th>
              <th className="p-3">Match</th>
              <th className="p-3">Score</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((f) => {
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
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <TeamFlag code={teamCode(f.homeTeamId)} teamName={teamName(f.homeTeamId)} size="sm" />
                      <span>{teamName(f.homeTeamId) || f.homeTeam}</span>
                      <span className="text-muted-foreground">vs</span>
                      <TeamFlag code={teamCode(f.awayTeamId)} teamName={teamName(f.awayTeamId)} size="sm" />
                      <span>{teamName(f.awayTeamId) || f.awayTeam}</span>
                    </div>
                  </td>
                  <td className="p-3 tabular-nums font-medium text-center">
                    {f.goals.home != null && f.goals.away != null
                      ? `${f.goals.home} - ${f.goals.away}`
                      : "—"}
                  </td>
                  <td className="p-3">{f.status}</td>
                  <td className="p-3">
                    {canEditMatch(f) ? (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/dashboard/matches/${f.id}`}>Modifier</Link>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        À venir
                      </Button>
                    )}
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
