"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const IMPORT_FILES = [
  "teams.json",
  "players.json",
  "fixtures.json",
  "groups.json",
  "standings.json",
  "statistics.json",
] as const;

export function DataManagerView() {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function exportData(format: "json" | "zip") {
    setLoading(`export-${format}`);
    setMessage(null);
    try {
      const res = await fetch(`/api/manager/export?format=${format}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Export impossible");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "zip" ? "worldcup-backup.zip" : "worldcup-data.json";
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Export téléchargé.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(null);
    }
  }

  async function createBackup() {
    setLoading("backup");
    setMessage(null);
    try {
      const res = await fetch("/api/manager/backup", {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Sauvegarde impossible");
      setMessage(`Sauvegarde créée — ${json.filename}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Data</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Import, export et sauvegarde des données tournoi.
        </p>
      </div>

      {message && <p className="text-sm text-senegal-green">{message}</p>}

      <section className="rounded-xl border border-white/10 p-5 space-y-4">
        <h2 className="font-semibold">Import JSON (seed)</h2>
        <p className="text-sm text-muted-foreground">
          Fichiers supportés : {IMPORT_FILES.join(", ")}
        </p>
        <p className="text-xs text-muted-foreground">
          Utilisez <code className="text-gold">npm run db:seed</code> pour un import complet depuis{" "}
          <code className="text-gold">data/</code>.
        </p>
      </section>

      <section className="rounded-xl border border-white/10 p-5 space-y-4">
        <h2 className="font-semibold">Export</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            disabled={loading !== null}
            onClick={() => void exportData("json")}
          >
            {loading === "export-json" && <Loader2 className="h-4 w-4 animate-spin" />}
            JSON
          </Button>
          <Button
            variant="outline"
            disabled={loading !== null}
            onClick={() => void exportData("zip")}
          >
            {loading === "export-zip" && <Loader2 className="h-4 w-4 animate-spin" />}
            ZIP
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 p-5 space-y-4">
        <h2 className="font-semibold">Backup</h2>
        <Button disabled={loading !== null} onClick={() => void createBackup()}>
          {loading === "backup" && <Loader2 className="h-4 w-4 animate-spin" />}
          Créer sauvegarde
        </Button>
      </section>
    </div>
  );
}
