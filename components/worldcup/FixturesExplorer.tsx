"use client";

import { useMemo, useState } from "react";
import type { Fixture } from "@/types/worldcup";
import { MatchRow } from "@/components/worldcup/MatchRow";
import { GroupFilterSelect, type GroupTeamFlag } from "@/components/worldcup/GroupFilterSelect";
import { DateFilterSelect, fixtureDateKey } from "@/components/worldcup/DateFilterSelect";
import { ALL_GROUPS, GROUP_COLORS } from "@/lib/constants";
import type { Group } from "@/types";
import { SearchInput } from "@/components/ui/search-input";
import { FilterBar, FilterField } from "@/components/ui/filter-bar";
import { Button } from "@/components/ui/button";
import { GroupBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PhaseFilter = "all" | "groups" | "knockout";
type StatusFilter = "all" | "NS" | "IN_PROGRESS" | "FT";
type RoundFilter = "all" | "matchday1" | "matchday2" | "matchday3" | "r16" | "qf" | "sf" | "third" | "final";
type SortMode = "date" | "group";

type Props = {
  fixtures: Fixture[];
  groupTeamsByLetter: Record<string, GroupTeamFlag[]>;
  favoriteGroup?: Group | null;
  favoriteTeamName?: string;
};

export function FixturesExplorer({
  fixtures,
  groupTeamsByLetter,
  favoriteGroup,
  favoriteTeamName,
}: Props) {
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roundFilter, setRoundFilter] = useState<RoundFilter>("all");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("date");

  const counts = useMemo(() => {
    const groups = fixtures.filter((f) => f.group).length;
    return { all: fixtures.length, groups, knockout: fixtures.length - groups };
  }, [fixtures]);

  const dates = useMemo(() => {
    const set = new Set(fixtures.map((f) => fixtureDateKey(f.date)));
    return [...set].sort();
  }, [fixtures]);

  const filtered = useMemo(() => {
    return fixtures.filter((f) => {
      if (phaseFilter === "groups" && !f.group) return false;
      if (phaseFilter === "knockout" && f.group) return false;
      if (groupFilter !== "all" && f.group !== groupFilter) return false;
      if (dateFilter !== "all") {
        const d = fixtureDateKey(f.date);
        if (d !== dateFilter) return false;
      }
      if (statusFilter !== "all") {
        const status = f.status.short === "FT" || f.status.short === "AET" || f.status.short === "PEN" ? "FT" 
          : f.status.short === "1H" || f.status.short === "2H" || f.status.short === "HT" ? "IN_PROGRESS"
          : "NS";
        if (status !== statusFilter) return false;
      }
      if (roundFilter !== "all") {
        const round = getRoundFilterValue(f.round, f.matchday);
        if (round !== roundFilter) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const hay =
          `${f.teams.home.name} ${f.teams.away.name} ${f.round} ${f.venue.name} ${f.venue.city}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [fixtures, phaseFilter, groupFilter, dateFilter, statusFilter, roundFilter, search]);

  const sorted = useMemo(() => {
    const sortedFixtures = [...filtered];
    switch (sortMode) {
      case "date":
        return sortedFixtures.sort((a, b) => a.timestamp - b.timestamp);
      case "group":
        return sortedFixtures.sort((a, b) => {
          const groupA = a.group ?? "ZZ";
          const groupB = b.group ?? "ZZ";
          if (groupA !== groupB) return groupA.localeCompare(groupB);
          return a.timestamp - b.timestamp;
        });
      default:
        return sortedFixtures.sort((a, b) => a.timestamp - b.timestamp);
    }
  }, [filtered, sortMode]);

  const hasActiveFilters =
    phaseFilter !== "all" ||
    groupFilter !== "all" ||
    dateFilter !== "all" ||
    statusFilter !== "all" ||
    roundFilter !== "all" ||
    search.length > 0;

  function resetFilters() {
    setPhaseFilter("all");
    setGroupFilter("all");
    setDateFilter("all");
    setStatusFilter("all");
    setRoundFilter("all");
    setSearch("");
  }

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

  const phaseTabs: { id: PhaseFilter; label: string; count: number }[] = [
    { id: "all", label: "Tous", count: counts.all },
    { id: "groups", label: "Phase de groupes", count: counts.groups },
    { id: "knockout", label: "Éliminatoires", count: counts.knockout },
  ];

  return (
    <div className="space-y-6">
      <FilterBar sticky className="min-w-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {phaseTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setPhaseFilter(tab.id);
              if (tab.id === "knockout") setGroupFilter("all");
            }}
            className={cn(
              "inline-flex w-full sm:w-auto items-center justify-between sm:justify-start gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              phaseFilter === tab.id
                ? "border-senegal-green/40 bg-senegal-green/20 text-senegal-green"
                : "border-white/10 bg-white/2 text-muted-foreground hover:bg-white/4 hover:text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-xs tabular-nums",
                phaseFilter === tab.id ? "bg-black/20" : "bg-white/10"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(180px,220px)_minmax(180px,220px)_minmax(180px,220px)_minmax(180px,220px)_minmax(140px,180px)]">
        <FilterField label="Recherche" htmlFor="fixture-search">
          <SearchInput
            id="fixture-search"
            placeholder="Équipe, stade, tour…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Rechercher un match"
          />
        </FilterField>

        <FilterField
          label="Groupe"
          htmlFor="fixture-group"
          className={phaseFilter === "knockout" ? "opacity-50" : undefined}
        >
          <GroupFilterSelect
            value={groupFilter}
            onChange={setGroupFilter}
            disabled={phaseFilter === "knockout"}
            groupTeamsByLetter={groupTeamsByLetter}
            groupMatchCount={counts.groups}
          />
        </FilterField>

        <FilterField label="Journée">
          <select
            value={roundFilter}
            onChange={(e) => setRoundFilter(e.target.value as RoundFilter)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-senegal-green/50"
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
        </FilterField>

        <FilterField label="Statut">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-senegal-green/50"
          >
            <option value="all">Tous</option>
            <option value="NS">À venir</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="FT">Terminé</option>
          </select>
        </FilterField>

        <FilterField label="Date">
          <DateFilterSelect
            value={dateFilter}
            onChange={setDateFilter}
            dates={dates}
          />
        </FilterField>

        <FilterField label="Trier par">
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-senegal-green/50"
          >
            <option value="date">Date</option>
            <option value="group">Groupe</option>
          </select>
        </FilterField>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          {sorted.length} match{sorted.length !== 1 ? "s" : ""} affiché
          {sorted.length !== 1 ? "s" : ""}
          {sorted.length < counts.all && (
            <span> sur {counts.all}</span>
          )}
        </span>

        {groupFilter !== "all" && (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1"
            style={{ borderColor: `${GROUP_COLORS[groupFilter as Group]}55` }}
          >
            <GroupBadge group={groupFilter as Group} className="h-5 w-5 text-[10px]" />
            <span className="font-medium">Groupe {groupFilter}</span>
          </span>
        )}

        {favoriteGroup && groupFilter !== favoriteGroup && phaseFilter !== "knockout" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 border-senegal-green/40 text-senegal-green hover:bg-senegal-green/10"
            onClick={() => {
              setPhaseFilter("groups");
              setGroupFilter(favoriteGroup);
            }}
          >
            Groupe {favoriteGroup}
            {favoriteTeamName ? ` (${favoriteTeamName})` : ""}
          </Button>
        )}

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground"
            onClick={resetFilters}
          >
            Réinitialiser
          </Button>
        )}
      </div>
      </FilterBar>

      {sorted.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Aucun match ne correspond aux filtres.
        </p>
      ) : (
        <div className="space-y-4">
          {sorted.map((f, i) => (
            <MatchRow key={f.id} fixture={f} index={i} allFixtures={fixtures} />
          ))}
        </div>
      )}
    </div>
  );
}
