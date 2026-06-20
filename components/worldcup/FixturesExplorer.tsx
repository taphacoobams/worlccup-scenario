"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { ChevronDown, ListFilter, ArrowUpDown } from "lucide-react";

type PhaseFilter = "all" | "groups" | "knockout";
type RoundFilter = "all" | "matchday1" | "matchday2" | "matchday3" | "r16" | "qf" | "sf" | "third" | "final";
type SortMode = "date" | "group";

const ROUND_OPTIONS: { value: RoundFilter; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "matchday1", label: "1ère journée" },
  { value: "matchday2", label: "2ème journée" },
  { value: "matchday3", label: "3ème journée" },
  { value: "r16", label: "Huitièmes" },
  { value: "qf", label: "Quarts" },
  { value: "sf", label: "Demi-finales" },
  { value: "third", label: "3e place" },
  { value: "final", label: "Finale" },
];

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "group", label: "Groupe" },
];

function RoundFilterSelect({
  value,
  onChange,
}: {
  value: RoundFilter;
  onChange: (v: RoundFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const label = ROUND_OPTIONS.find((o) => o.value === value)?.label ?? "Toutes";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text",
          "focus:outline-none focus:ring-2 focus:ring-senegal-green/40"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <ListFilter className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-[60] mt-1 max-h-64 w-full min-w-[180px] overflow-auto rounded-lg border border-white/10 bg-background py-1 shadow-xl"
        >
          {ROUND_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={value === opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-3 py-2.5 text-left text-sm hover:bg-white/5",
                  value === opt.value && "bg-senegal-green/15 text-senegal-green"
                )}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SortModeSelect({
  value,
  onChange,
}: {
  value: SortMode;
  onChange: (v: SortMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const label = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "Date";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text",
          "focus:outline-none focus:ring-2 focus:ring-senegal-green/40"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <ArrowUpDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-[60] mt-1 w-full min-w-[140px] overflow-auto rounded-lg border border-white/10 bg-background py-1 shadow-xl"
        >
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                role="option"
                aria-selected={value === opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-3 py-2.5 text-left text-sm hover:bg-white/5",
                  value === opt.value && "bg-senegal-green/15 text-senegal-green"
                )}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
  }, [fixtures, phaseFilter, groupFilter, dateFilter, roundFilter, search]);

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
    roundFilter !== "all" ||
    search.length > 0;

  function resetFilters() {
    setPhaseFilter("all");
    setGroupFilter("all");
    setDateFilter("all");
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

      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(180px,220px)_minmax(180px,220px)_minmax(180px,220px)_minmax(140px,180px)]">
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
          <RoundFilterSelect value={roundFilter} onChange={setRoundFilter} />
        </FilterField>

        <FilterField label="Date">
          <DateFilterSelect
            value={dateFilter}
            onChange={setDateFilter}
            dates={dates}
          />
        </FilterField>

        <FilterField label="Trier par">
          <SortModeSelect value={sortMode} onChange={setSortMode} />
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
