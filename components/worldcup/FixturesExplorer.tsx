"use client";

import { useMemo, useState } from "react";
import type { Fixture, GroupStanding } from "@/types/worldcup";
import { MatchRow } from "@/components/worldcup/MatchRow";
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
  groupSummaries: Record<Group, string>;
  groupStandingsByLetter?: Record<string, GroupStanding[]>;
  favoriteGroup?: Group | null;
  favoriteTeamName?: string;
};

const selectClass =
  "h-11 w-full rounded-xl border border-border bg-surface-light/50 px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/40";

export function FixturesExplorer({
  fixtures,
  groupSummaries,
  groupStandingsByLetter,
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
    const set = new Set(
      fixtures.map((f) => new Date(f.date).toISOString().slice(0, 10))
    );
    return [...set].sort();
  }, [fixtures]);

  const filtered = useMemo(() => {
    return fixtures.filter((f) => {
      if (phaseFilter === "groups" && !f.group) return false;
      if (phaseFilter === "knockout" && f.group) return false;
      if (groupFilter !== "all" && f.group !== groupFilter) return false;
      if (dateFilter !== "all") {
        const d = new Date(f.date).toISOString().slice(0, 10);
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
      <FilterBar sticky>
      <div className="flex flex-wrap gap-2">
        {phaseTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setPhaseFilter(tab.id);
              if (tab.id === "knockout") setGroupFilter("all");
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
              phaseFilter === tab.id
                ? "border-primary/50 bg-primary/15 text-text shadow-sm shadow-primary/10"
                : "border-border bg-surface-light/30 text-text-secondary hover:border-primary/25 hover:text-text"
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
          <select
            id="fixture-group"
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            disabled={phaseFilter === "knockout"}
            className={selectClass}
            aria-label="Filtrer par groupe"
          >
            <option value="all">Tous les groupes ({counts.groups} matchs)</option>
            {ALL_GROUPS.map((g) => (
              <option key={g} value={g}>
                Groupe {g} — {groupSummaries[g]}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Date" htmlFor="fixture-date">
          <select
            id="fixture-date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={selectClass}
            aria-label="Filtrer par date"
          >
            <option value="all">Toutes les dates</option>
            {dates.map((d) => (
              <option key={d} value={d}>
                {new Intl.DateTimeFormat("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                }).format(new Date(d))}
              </option>
            ))}
          </select>
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
            <MatchRow
              key={f.id}
              fixture={f}
              index={i}
              groupStandings={
                f.group ? groupStandingsByLetter?.[f.group.toUpperCase()] : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
