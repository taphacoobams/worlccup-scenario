"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTeamContext } from "@/context/team-context";
import { useScenarios } from "@/hooks/use-scenarios";
import { useLocale } from "@/context/locale-context";
import { exportScenarios } from "@/lib/export";
import { FileDown } from "lucide-react";

const formats = [
  { id: "csv" as const, label: "CSV" },
  { id: "xlsx" as const, label: "Excel" },
  { id: "json" as const, label: "JSON" },
  { id: "pdf" as const, label: "PDF" },
];

export default function ExportPage() {
  const { t } = useLocale();
  const { selectedTeam } = useTeamContext();
  const { all, senegal: favorite } = useScenarios();
  const [scope, setScope] = useState<"all" | "favorite">("all");

  const data = scope === "favorite" ? favorite : all;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("export.title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("export.subtitle", { team: selectedTeam.name })}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={scope === "all" ? "default" : "secondary"}
          onClick={() => setScope("all")}
        >
          {t("export.all")} ({all.length})
        </Button>
        <Button
          variant={scope === "favorite" ? "default" : "secondary"}
          onClick={() => setScope("favorite")}
        >
          {t("export.teamScope", { team: selectedTeam.name })} ({favorite.length})
        </Button>
      </div>

      {all.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">{t("scenarios.noMatch")}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {formats.map((f) => (
            <Card key={f.id} className="hover:border-senegal-green/40 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileDown className="h-5 w-5" />
                  {f.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() =>
                    exportScenarios(data, f.id, `${selectedTeam.name.toLowerCase()}-scenarios`)
                  }
                >
                  {t("export.download")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
