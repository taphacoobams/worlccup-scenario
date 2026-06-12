"use client";

import { useState } from "react";
import { ScenariosTable } from "@/components/tables/scenarios-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTeamContext } from "@/context/team-context";
import { useScenariosContext } from "@/context/scenarios-context";
import { useLocale } from "@/context/locale-context";
import type { Group } from "@/types";
import { ALL_GROUPS } from "@/lib/constants";
import { TeamFlag } from "@/components/ui/team-flag";
import { cn } from "@/lib/utils";

export default function ExplorerPage() {
  const { t } = useLocale();
  const { selectedTeam, favoriteGroup, stats } = useTeamContext();
  const [includesFavorite, setIncludesFavorite] = useState<boolean | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<Group[]>([]);

  const { all, filter } = useScenariosContext();
  const data = filter(all, {
    includesGroupI: includesFavorite,
    favoriteGroup: includesFavorite != null ? favoriteGroup : undefined,
    groups: selectedGroups.length ? selectedGroups : undefined,
  });

  const groupLabel = favoriteGroup ?? "I";

  const toggleGroup = (g: Group) => {
    setSelectedGroups((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8 flex items-start gap-3">
        <TeamFlag
          code={selectedTeam.code}
          teamName={selectedTeam.name}
          size="md"
          className="h-12 w-16 rounded-lg shrink-0 hidden sm:block"
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("explorer.title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("explorer.subtitle", { team: selectedTeam.name, group: groupLabel })}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t("explorer.filters")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={includesFavorite === null ? "default" : "secondary"}
              onClick={() => setIncludesFavorite(null)}
            >
              {t("explorer.all")} ({all.length})
            </Button>
            <Button
              size="sm"
              variant={includesFavorite === true ? "default" : "secondary"}
              onClick={() => setIncludesFavorite(true)}
            >
              {t("explorer.withGroup", { group: groupLabel })} ({stats.favoriteScenarios})
            </Button>
            <Button
              size="sm"
              variant={includesFavorite === false ? "default" : "secondary"}
              onClick={() => setIncludesFavorite(false)}
            >
              {t("explorer.withoutGroup", { group: groupLabel })}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGroup(g)}
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
        </CardContent>
      </Card>

      {all.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">{t("scenarios.noMatch")}</p>
      ) : (
        <ScenariosTable data={data} />
      )}
    </div>
  );
}
