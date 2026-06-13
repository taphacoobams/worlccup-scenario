"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileDown,
  FileJson,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { SitePageHeader } from "@/components/layout/site-page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { useTeamContext } from "@/context/team-context";
import { useScenarios } from "@/hooks/use-scenarios";
import { useLocale } from "@/context/locale-context";
import { exportScenarios } from "@/lib/export";
import type { ExportFormat } from "@/types";
import { cn } from "@/lib/utils";

const formats: {
  id: ExportFormat;
  label: string;
  description: string;
  icon: typeof FileDown;
  accent: string;
}[] = [
  {
    id: "csv",
    label: "CSV",
    description: "Tableur léger, import Excel / Google Sheets",
    icon: FileText,
    accent: "from-primary/15 to-transparent border-primary/25",
  },
  {
    id: "xlsx",
    label: "Excel",
    description: "Classeur .xlsx avec colonnes structurées",
    icon: FileSpreadsheet,
    accent: "from-secondary/15 to-transparent border-secondary/25",
  },
  {
    id: "json",
    label: "JSON",
    description: "Export brut pour scripts et intégrations",
    icon: FileJson,
    accent: "from-gold/15 to-transparent border-gold/25",
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Aperçu imprimable (100 premières lignes)",
    icon: FileDown,
    accent: "from-white/10 to-transparent border-border",
  },
];

export function ExportLab() {
  const { t } = useLocale();
  const { selectedTeam } = useTeamContext();
  const { all, senegal: favorite } = useScenarios();
  const [scope, setScope] = useState<"all" | "favorite">("all");
  const [downloading, setDownloading] = useState<ExportFormat | null>(null);
  const [lastExport, setLastExport] = useState<ExportFormat | null>(null);

  const data = scope === "favorite" ? favorite : all;
  const slug = selectedTeam.name.toLowerCase().replace(/\s+/g, "-");

  const handleExport = async (format: ExportFormat) => {
    if (data.length === 0) return;
    setDownloading(format);
    setLastExport(null);
    try {
      await exportScenarios(data, format, `${slug}-scenarios`);
      setLastExport(format);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="page-container max-w-6xl">
      <SitePageHeader
        title={t("export.title")}
        description={t("export.subtitle", { team: selectedTeam.name })}
      />

      <FilterBar sticky className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={scope === "all" ? "default" : "secondary"}
            size="sm"
            onClick={() => setScope("all")}
          >
            {t("export.all")} ({all.length})
          </Button>
          <Button
            variant={scope === "favorite" ? "default" : "secondary"}
            size="sm"
            onClick={() => setScope("favorite")}
          >
            {t("export.teamScope", { team: selectedTeam.name })} ({favorite.length})
          </Button>
        </div>
      </FilterBar>

      {all.length === 0 ? (
        <EmptyState title={t("scenarios.noMatch")} />
      ) : (
        <>
          <SectionCard
            title="Centre d'export"
            description={`${data.length.toLocaleString("fr-FR")} scénarios sélectionnés · prêt au téléchargement`}
            className="mb-6"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {formats.map((f, i) => {
                const Icon = f.icon;
                const isLoading = downloading === f.id;
                const isDone = lastExport === f.id && !isLoading;

                return (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "rounded-2xl border bg-gradient-to-br p-5 flex flex-col gap-4",
                      f.accent
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-white/5 p-2.5 shrink-0">
                        <Icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{f.label}</h3>
                        <p className="text-sm text-text-secondary mt-0.5">{f.description}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-auto"
                      disabled={isLoading || data.length === 0}
                      onClick={() => handleExport(f.id)}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Génération…
                        </>
                      ) : isDone ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          Téléchargé
                        </>
                      ) : (
                        <>
                          <FileDown className="h-4 w-4" />
                          {t("export.download")}
                        </>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </SectionCard>

          <p className="text-xs text-text-secondary text-center">
            Les exports incluent ID, numéro FIFA, groupes qualifiés, adversaire 1
            {scope === "favorite" ? ` · filtré pour ${selectedTeam.name}` : ""}.
          </p>
        </>
      )}
    </div>
  );
}
