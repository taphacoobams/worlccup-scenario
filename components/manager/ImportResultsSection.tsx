"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImportPreview } from "@/types/results-import";

type ValidationError = { path: string; message: string };

export function ImportResultsSection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<unknown>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState<"validate" | "import" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFileSelect(file: File | null) {
    setMessage(null);
    setPreview(null);
    setErrors([]);
    setParsed(null);
    setFileName(null);

    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text) as unknown;
      setParsed(json);
      setFileName(file.name);
    } catch {
      setErrors([{ path: "", message: "Fichier JSON invalide ou illisible." }]);
    }
  }

  async function validateFile() {
    if (!parsed) return;
    setLoading("validate");
    setMessage(null);
    setErrors([]);
    setPreview(null);

    try {
      const res = await fetch("/api/manager/results/import", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "validate", data: parsed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Validation impossible");

      if (!json.valid) {
        setErrors(json.errors ?? [{ path: "", message: "Fichier invalide." }]);
        return;
      }

      setPreview(json.preview as ImportPreview);
      setMessage(
        `${json.preview.totalMatches} match(s) prêt(s) à importer (${json.preview.toReplace} remplacement(s), ${json.preview.toAdd} ajout(s)).`
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(null);
    }
  }

  async function importFile() {
    if (!parsed || !preview) return;
    setLoading("import");
    setMessage(null);

    try {
      const res = await fetch("/api/manager/results/import", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "import", data: parsed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Import impossible");

      const { summary } = json as {
        summary: { replaced: number; added: number; matchIds: number[] };
      };

      setMessage(
        `Import réussi — ${summary.matchIds.length} match(s) mis à jour dans results.json (${summary.replaced} remplacé(s), ${summary.added} ajouté(s)). Classements, statistiques et scénarios recalculés.`
      );
      setPreview(null);
      setParsed(null);
      setFileName(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="rounded-xl border border-white/10 p-5 space-y-4">
      <div>
        <h2 className="font-semibold">Import Results</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Importez un fichier JSON de résultats (ex. généré par ChatGPT). Les matchs sont fusionnés
          dans <code className="text-gold">data/results.json</code> — même matchId = remplacement
          complet, nouveau matchId = ajout.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-white/15 p-4 space-y-3">
        <label className="flex flex-col gap-2 cursor-pointer">
          <span className="text-sm font-medium flex items-center gap-2">
            <FileUp className="h-4 w-4 text-gold" />
            Fichier JSON
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            className="text-sm file:mr-3 file:rounded file:border-0 file:bg-senegal-green/20 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-senegal-green"
            onChange={(e) => void handleFileSelect(e.target.files?.[0] ?? null)}
          />
        </label>
        {fileName && (
          <p className="text-xs text-muted-foreground">
            Fichier sélectionné : <span className="text-foreground">{fileName}</span>
          </p>
        )}
      </div>

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer text-foreground/80">Format attendu</summary>
        <pre className="mt-2 overflow-x-auto rounded bg-black/30 p-3 text-[11px] leading-relaxed">
{`{
  "matches": [
    {
      "matchId": 3,
      "status": "FT",
      "events": [
        {
          "type": "goal",
          "team": "Canada",
          "player": "Larin",
          "assist": "David",
          "minute": 78
        },
        {
          "type": "yellow_card",
          "team": "Canada",
          "player": "Johnston",
          "minute": 11,
          "additionalTime": 0
        }
      ]
    }
  ]
}`}
        </pre>
      </details>

      {errors.length > 0 && (
        <ul className="text-sm text-destructive space-y-1">
          {errors.map((err, i) => (
            <li key={`${err.path}-${i}`}>
              {err.path ? <code className="text-xs">{err.path}</code> : null}{" "}
              {err.message}
            </li>
          ))}
        </ul>
      )}

      {message && (
        <p
          className={`text-sm ${
            message.includes("réussi") || message.includes("prêt")
              ? "text-senegal-green"
              : "text-destructive"
          }`}
        >
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          disabled={!parsed || loading !== null}
          onClick={() => void validateFile()}
        >
          {loading === "validate" && <Loader2 className="h-4 w-4 animate-spin" />}
          Valider et aperçu
        </Button>
        <Button
          disabled={!preview || loading !== null}
          onClick={() => void importFile()}
        >
          {loading === "import" && <Loader2 className="h-4 w-4 animate-spin" />}
          Importer
        </Button>
      </div>

      {preview && preview.matches.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
                <th className="p-2">#</th>
                <th className="p-2">Match</th>
                <th className="p-2">Score</th>
                <th className="p-2">Événements</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {preview.matches.map((m) => (
                <tr key={m.matchId} className="border-b border-white/5">
                  <td className="p-2 font-mono">{m.matchId}</td>
                  <td className="p-2">
                    {m.homeTeam} – {m.awayTeam}
                  </td>
                  <td className="p-2 tabular-nums font-medium">
                    {m.homeScore}–{m.awayScore}
                  </td>
                  <td className="p-2 text-muted-foreground">{m.eventCount}</td>
                  <td className="p-2">
                    <span
                      className={
                        m.action === "replace"
                          ? "text-amber-400"
                          : "text-senegal-green"
                      }
                    >
                      {m.action === "replace" ? "Remplacer" : "Ajouter"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
