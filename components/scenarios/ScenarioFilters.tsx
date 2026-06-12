"use client";

import { Search } from "lucide-react";
import { ALL_GROUPS } from "@/lib/constants";
import type { Group } from "@/types";
import type { ScenarioFilterMode, ScenarioSortMode } from "@/lib/scenario-engine/types";
import { useLocale } from "@/context/locale-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS: { id: ScenarioSortMode; key: string }[] = [
  { id: "most-likely", key: "sortMostLikely" },
  { id: "least-likely", key: "sortLeastLikely" },
  { id: "best-for-team", key: "sortBestForTeam" },
  { id: "fifa", key: "sortFifa" },
  { id: "id", key: "sortId" },
];

const FILTER_OPTIONS: { id: ScenarioFilterMode; key: string }[] = [
  { id: "all", key: "filterAll" },
  { id: "qualification", key: "filterQualification" },
  { id: "elimination", key: "filterElimination" },
  { id: "best-for-team", key: "filterFavorable" },
  { id: "draw-heavy", key: "filterDrawHeavy" },
  { id: "upsets", key: "filterUpsets" },
];

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  sort: ScenarioSortMode;
  onSortChange: (v: ScenarioSortMode) => void;
  filterMode: ScenarioFilterMode;
  onFilterModeChange: (v: ScenarioFilterMode) => void;
  selectedGroups: Group[];
  onToggleGroup: (g: Group) => void;
  favoriteGroup: string | null;
  resultCount: number;
};

export function ScenarioFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
  filterMode,
  onFilterModeChange,
  selectedGroups,
  onToggleGroup,
  favoriteGroup,
  resultCount,
}: Props) {
  const { t } = useLocale();

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("scenarios.searchPlaceholder")}
          className="w-full rounded-lg border border-white/10 bg-background/50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-senegal-green/50"
          aria-label={t("common.search")}
        />
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">{t("scenarios.sortLabel")}</p>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((o) => (
            <Button
              key={o.id}
              size="sm"
              variant={sort === o.id ? "default" : "secondary"}
              onClick={() => onSortChange(o.id)}
            >
              {t(`scenarios.${o.key}`)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">{t("scenarios.filtersLabel")}</p>
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((o) => (
            <Button
              key={o.id}
              size="sm"
              variant={filterMode === o.id ? "default" : "secondary"}
              onClick={() => onFilterModeChange(o.id)}
            >
              {t(`scenarios.${o.key}`)}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {t("scenarios.qualifiedGroupsLabel")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onToggleGroup(g)}
              className={cn(
                "h-8 w-8 rounded-lg text-xs font-bold transition-all",
                selectedGroups.includes(g)
                  ? "bg-senegal-green text-white"
                  : "bg-white/10 hover:bg-white/20",
                g === favoriteGroup && "ring-1 ring-gold"
              )}
              aria-pressed={selectedGroups.includes(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {t("scenarios.resultsCount", { count: String(resultCount) })}
      </p>
    </div>
  );
}
