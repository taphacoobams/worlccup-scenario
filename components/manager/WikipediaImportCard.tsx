"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, FileText, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { formatEventMinute } from "@/lib/tournament-engine/events";
import {
  parseWikipediaReport,
  parsedEventsToMatchEvents,
  type WikipediaImportResult,
  type ParsedEvent,
} from "@/lib/wikipedia-import";
import type { ManualPlayer, ManualTeam } from "@/types/worldcup-manual";
import type { MatchEvent } from "@/types/match-events";

const PLACEHOLDER = `Match 5 Haïti 0 - 1 Écosse
Gillette Stadium, Boston

(0 - 1) But inscrit après 28 minutes 28e McGinn

Bellegarde Averti après 39 minutes 39e

Averti après 47 minutes 47e Hickey
Averti après 90+1 minutes 90+1e Curtis`;

const KIND_ICON: Record<string, string> = {
  goal: "⚽",
  yellow_card: "🟨",
  red_card: "🟥",
};

type Props = {
  homeTeam: ManualTeam;
  awayTeam: ManualTeam;
  players: ManualPlayer[];
  onImport: (events: MatchEvent[]) => Promise<void> | void;
  importing?: boolean;
};

export function WikipediaImportCard({
  homeTeam,
  awayTeam,
  players,
  onImport,
  importing = false,
}: Props) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<WikipediaImportResult | null>(null);
  const [selectedAlternatives, setSelectedAlternatives] = useState<Record<number, { playerId: string; teamCode: string; teamName: string; playerName: string }>>({});

  const teamPlayers = useMemo(
    () => players.filter((p) => p.teamId === homeTeam.id || p.teamId === awayTeam.id),
    [players, homeTeam.id, awayTeam.id]
  );

  function handlePreview() {
    const result = parseWikipediaReport(text, homeTeam, awayTeam, teamPlayers);
    setPreview(result);
  }

  async function handleImport() {
    const result = preview ?? parseWikipediaReport(text, homeTeam, awayTeam, teamPlayers);
    if (result.events.length === 0) {
      setPreview(result);
      return;
    }

    // Apply user selections for ambiguous players
    const eventsWithSelections = result.events.map((e, index) => {
      const selection = selectedAlternatives[index];
      if (selection) {
        return {
          ...e,
          playerId: selection.playerId,
          teamCode: selection.teamCode,
          teamName: selection.teamName,
          playerName: selection.playerName,
        };
      }
      return e;
    });

    const matchEvents = parsedEventsToMatchEvents(eventsWithSelections);
    await onImport(matchEvents);
  }

  const canSubmit = text.trim().length > 0 && !importing;

  return (
    <SectionCard
      title="Import Wikipédia"
      description="Collez le rapport complet du match — détection automatique des buts, passes et cartons."
    >
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setPreview(null);
          }}
          placeholder={PLACEHOLDER}
          rows={9}
          className="w-full resize-y rounded-lg border border-white/10 bg-card px-3 py-2 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-senegal-green/60 focus:outline-none"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePreview}
            disabled={!canSubmit}
          >
            <FileText className="h-4 w-4" /> Prévisualiser
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleImport()}
            disabled={!canSubmit}
          >
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Importer
          </Button>
        </div>

        {preview && (
          <div className="rounded-lg border border-white/10 bg-card/60 p-4 space-y-4">
            {preview.needsVerification && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Match à vérifier manuellement
                </p>
                <p className="text-xs text-amber-200/80 mt-1">
                  Certains joueurs n'ont pas été trouvés dans les effectifs. Vérifiez les équipes avant d'importer.
                </p>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                Score calculé
              </p>
              <p className="text-lg font-bold tabular-nums">
                {homeTeam.name}{" "}
                <span className="text-senegal-green">{preview.homeScore}</span>
                <span className="text-muted-foreground mx-1.5 font-light">–</span>
                <span className="text-senegal-green">{preview.awayScore}</span>{" "}
                {awayTeam.name}
              </p>
            </div>

            {preview.events.length > 0 && (
              <ul className="space-y-1.5 text-sm">
                {preview.events.map((e, i) => (
                  <li
                    key={`${e.kind}-${e.minute}-${e.rawPlayer}-${i}`}
                    className="flex items-center gap-2"
                  >
                    <span className="w-6 text-center">{KIND_ICON[e.kind]}</span>
                    <div className="flex-1">
                      {e.alternatives && e.alternatives.length > 1 ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedAlternatives[i]?.playerId || e.playerId}
                            onChange={(ev) => {
                              const selected = e.alternatives?.find(a => String(a.player.id) === ev.target.value);
                              if (selected) {
                                setSelectedAlternatives(prev => ({
                                  ...prev,
                                  [i]: {
                                    playerId: String(selected.player.id),
                                    teamCode: selected.team.code,
                                    teamName: selected.team.name,
                                    playerName: selected.player.name,
                                  }
                                }));
                              }
                            }}
                            className="rounded border border-white/20 bg-card px-2 py-1 text-xs font-medium focus:border-senegal-green/60 focus:outline-none"
                          >
                            {e.alternatives.map((alt) => (
                              <option key={alt.player.id} value={String(alt.player.id)}>
                                {alt.player.name} ({alt.team.name})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        </div>
                      ) : (
                        <span className="font-medium">{e.playerName}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">({e.teamName})</span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatEventMinute(e.minute, e.addedTime)}
                    </span>
                    {e.assist && (
                      <span className="text-xs text-muted-foreground">
                        (passe : {e.assist})
                      </span>
                    )}
                    {e.isOwnGoal && (
                      <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                        CSC
                      </span>
                    )}
                    {e.isPenalty && (
                      <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        pen.
                      </span>
                    )}
                    {e.unmatched && (
                      <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-300">
                        introuvable
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {preview.warnings.length > 0 && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {preview.warnings.length} avertissement
                  {preview.warnings.length > 1 ? "s" : ""}
                </p>
                <ul className="space-y-1 text-xs text-amber-200/80">
                  {preview.warnings.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
