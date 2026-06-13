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
  const [search, setSearch] = useState("");

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
      if (search) {
        const q = search.toLowerCase();
        const hay =
          `${f.teams.home.name} ${f.teams.away.name} ${f.round} ${f.venue.name} ${f.venue.city}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [fixtures, phaseFilter, groupFilter, dateFilter, search]);

  const hasActiveFilters =
    phaseFilter !== "all" ||
    groupFilter !== "all" ||
    dateFilter !== "all" ||
    search.length > 0;

  function resetFilters() {
    setPhaseFilter("all");
    setGroupFilter("all");
    setDateFilter("all");
    setSearch("");
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
                : "border-white/10 bg-white/[0.02] text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
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

      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(220px,280px)_minmax(180px,220px)]">
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

        <FilterField label="Date">
          <DateFilterSelect
            value={dateFilter}
            onChange={setDateFilter}
            dates={dates}
          />
        </FilterField>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          {filtered.length} match{filtered.length !== 1 ? "s" : ""} affiché
          {filtered.length !== 1 ? "s" : ""}
          {filtered.length < counts.all && (
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

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Aucun match ne correspond aux filtres.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((f, i) => (
            <MatchRow key={f.id} fixture={f} index={i} allFixtures={fixtures} />
          ))}
        </div>
      )}
    </div>
  );
}
