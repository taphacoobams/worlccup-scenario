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
    <div className="page-container space-y-10">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary mb-3 font-semibold">
            <Layers className="h-3.5 w-3.5" />
            {t("scenarios.badge", { total: String(total) })}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text">
            {t("scenarios.title")}
          </h1>
          <p className="text-text-secondary mt-2 max-w-2xl">{t("scenarios.description")}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant={view === "cards" ? "default" : "secondary"}
            onClick={() => setView("cards")}
            aria-pressed={view === "cards"}
          >
            <LayoutGrid className="h-4 w-4" /> {t("scenarios.cardsView")}
          </Button>
          <Button
            size="sm"
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

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="lg:sticky lg:top-[88px] lg:self-start">
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

        <main>
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
