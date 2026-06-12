"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useManagerData } from "@/context/manager-data-context";
import { MatchEventsEditor } from "@/components/manager/MatchEventsEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { countGoalsFromEvents } from "@/lib/manager-standings";
import { normalizeMatchEvents } from "@/lib/tournament-engine/events";

export function MatchEditorView({ matchId }: { matchId: number }) {
  const { data, loading, saving, updateFixture, teamName, reload } =
    useManagerData();
  const [localSaving, setLocalSaving] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const fixture = useMemo(() => {
    if (!data) return null;
    const f = data.fixtures.find((x) => x.id === matchId);
    if (!f) return null;
    return {
      ...f,
      events: normalizeMatchEvents(f.events, data.teams, data.players),
    };
  }, [data, matchId]);

  const score = useMemo(() => {
    if (!fixture || !data) return { home: 0, away: 0 };
    return countGoalsFromEvents(fixture, data.teams);
  }, [fixture, data]);

  async function saveMatch() {
    if (!fixture || !data) return;
    setLocalSaving(true);
    setLocalMessage(null);

    const payload = {
      ...fixture,
      events: normalizeMatchEvents(fixture.events, data.teams, data.players),
      goals: score,
      status:
        (fixture.events?.length ?? 0) > 0 && fixture.status === "NS"
          ? "FT"
          : fixture.status,
    };

    try {
      const res = await fetch(`/api/manager/matches/${matchId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Échec enregistrement");
      setLocalMessage(
        "Enregistré — classements, buteurs, cartons et scénarios recalculés."
      );
      await reload();
    } catch (e) {
      setLocalMessage(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLocalSaving(false);
    }
  }

  if (loading || !data) {
    return <p className="text-muted-foreground">Chargement…</p>;
  }

  if (!fixture) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Match #{matchId} introuvable.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/matches">Retour</Link>
        </Button>
      </div>
    );
  }

  const home = teamName(fixture.homeTeamId) || fixture.homeTeam || "—";
  const away = teamName(fixture.awayTeamId) || fixture.awayTeam || "—";
  const d = new Date(fixture.date);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link href="/dashboard/matches">← Matchs</Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {home} {score.home} - {score.away} {away}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Score calculé automatiquement à partir des buts enregistrés.
          </p>
        </div>
        <Button onClick={() => void saveMatch()} disabled={localSaving || saving}>
          {(localSaving || saving) && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>

      {localMessage && (
        <p className="text-sm text-senegal-green">{localMessage}</p>
      )}

      <Card className="border-white/10">
        <CardContent className="pt-6 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium">{d.toLocaleDateString("fr-FR")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Heure</p>
            <p className="font-medium">
              {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Groupe</p>
            <p className="font-medium font-mono text-gold">{fixture.group ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tour</p>
            <p className="font-medium">{fixture.round || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stade</p>
            <p className="font-medium">{fixture.venue?.name || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Ville</p>
            <p className="font-medium">{fixture.venue?.city || "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Équipe domicile</p>
            <p className="font-medium">{home}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-muted-foreground">Équipe extérieur</p>
            <p className="font-medium">{away}</p>
          </div>
        </CardContent>
      </Card>

      <MatchEventsEditor
        fixture={fixture}
        teams={data.teams}
        players={data.players}
        onChange={(events) => updateFixture(matchId, { events })}
      />
    </div>
  );
}
