"use client";

import { useCallback, useState } from "react";
import { LayoutGrid, List, Layers } from "lucide-react";
import { TeamScenarioSummary } from "@/components/scenarios/TeamScenarioSummary";
import { ScenarioFilters } from "@/components/scenarios/ScenarioFilters";
import { ScenarioRanking } from "@/components/scenarios/ScenarioRanking";
import { ScenarioVirtualList } from "@/components/scenarios/ScenarioVirtualList";
import { ScenarioTable } from "@/components/scenarios/ScenarioTable";
import { useEnrichedScenarios } from "@/hooks/use-enriched-scenarios";
import { useLocale } from "@/context/locale-context";
import type { ScenarioFilterMode, ScenarioSortMode } from "@/lib/scenario-engine/types";
import type { Group } from "@/types";
import { Button } from "@/components/ui/button";
import { pageDescription, pageTitle, worldCupBadge } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export default function ScenariosPage() {
  const { t } = useLocale();
  const [sort, setSort] = useState<ScenarioSortMode>("most-likely");
  const [filterMode, setFilterMode] = useState<ScenarioFilterMode>("all");
  const [search, setSearch] = useState("");
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);
  const [view, setView] = useState<"cards" | "table">("cards");

  const { scenarios, bestScenarios, summary, favoriteGroup, selectedTeam, total } =
    useEnrichedScenarios(sort, filterMode, search, selectedGroups);

  const toggleGroup = useCallback((g: Group) => {
    setSelectedGroups((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }, []);

  return (
    <div className="page-container space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className={cn(worldCupBadge, "mb-2 inline-flex gap-2")}>
            <Layers className="h-3 w-3" />
            {t("scenarios.badge", { total: String(total) })}
          </div>
          <h1 className={pageTitle}>{t("scenarios.title")}</h1>
          <p className={cn(pageDescription, "max-w-2xl")}>{t("scenarios.description")}</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            className="flex-1 sm:flex-none"
            variant={view === "cards" ? "default" : "secondary"}
            onClick={() => setView("cards")}
            aria-pressed={view === "cards"}
          >
            <LayoutGrid className="h-4 w-4" /> {t("scenarios.cardsView")}
          </Button>
          <Button
            size="sm"
            className="flex-1 sm:flex-none"
            variant={view === "table" ? "default" : "secondary"}
            onClick={() => setView("table")}
            aria-pressed={view === "table"}
          >
            <List className="h-4 w-4" /> {t("scenarios.tableView")}
          </Button>
        </div>
      </header>

      <TeamScenarioSummary
        team={selectedTeam}
        stats={summary}
        groupLabel={favoriteGroup}
      />

      <ScenarioRanking
        title={t("scenarios.bestFor", { team: selectedTeam.name })}
        scenarios={bestScenarios}
        teamName={selectedTeam.name}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-[88px] lg:self-start">
          <ScenarioFilters
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
            filterMode={filterMode}
            onFilterModeChange={setFilterMode}
            selectedGroups={selectedGroups}
            onToggleGroup={toggleGroup}
            favoriteGroup={favoriteGroup}
            resultCount={scenarios.length}
          />
        </aside>

        <main className="min-w-0">
          {view === "cards" ? (
            <ScenarioVirtualList items={scenarios} />
          ) : (
            <ScenarioTable data={scenarios} />
          )}
        </main>
      </div>
    </div>
  );
}
