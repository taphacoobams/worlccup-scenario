"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useManagerData } from "@/context/manager-data-context";
import { MatchEventsEditor } from "@/components/manager/MatchEventsEditor";
import { GroupStandingsSection } from "@/components/fixtures/GroupStandingsSection";
import { MatchEventsTimeline } from "@/components/fixtures/MatchEventsTimeline";
import { FixtureTeamColumn } from "@/components/fixtures/FixtureTeamColumn";
import { FixtureVenueSummary } from "@/components/fixtures/FixtureVenueSummary";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionCard } from "@/components/ui/section-card";
import { countGoalsFromEvents } from "@/lib/manager-standings";
import {
  MANUAL_STATUS_LABELS,
  managerEventsToFixtureEvents,
  managerGroupToStandings,
  resolveManagerParticipant,
} from "@/lib/manager/fixture-display";
import { normalizeMatchEvents } from "@/lib/tournament-engine/events";

export function MatchEditorView({ matchId }: { matchId: number }) {
  const { data, loading, saving, updateFixture, reload } = useManagerData();
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

  const homeTeam = useMemo(() => {
    if (!fixture || !data) return null;
    return resolveManagerParticipant(
      fixture.homeTeamId,
      fixture.homeTeam,
      data.teams
    );
  }, [fixture, data]);

  const awayTeam = useMemo(() => {
    if (!fixture || !data) return null;
    return resolveManagerParticipant(
      fixture.awayTeamId,
      fixture.awayTeam,
      data.teams
    );
  }, [fixture, data]);

  const displayEvents = useMemo(() => {
    if (!fixture || !data) return [];
    return managerEventsToFixtureEvents(fixture, data.teams, data.players);
  }, [fixture, data]);

  const groupStandings = useMemo(() => {
    if (!fixture?.group || !data) return undefined;
    const group = data.groups.find(
      (g) => g.letter.toUpperCase() === fixture.group!.toUpperCase()
    );
    if (!group) return undefined;
    return managerGroupToStandings(group, data.teams);
  }, [fixture, data]);

  const hasScore =
    fixture != null &&
    (fixture.status === "FT" ||
      fixture.status === "AET" ||
      fixture.status === "PEN" ||
      (fixture.events?.length ?? 0) > 0);

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

  if (!fixture || !homeTeam || !awayTeam) {
    return (
      <div className="space-y-4 max-w-4xl">
        <p className="text-destructive">Match #{matchId} introuvable.</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/matches">Retour au calendrier</Link>
        </Button>
      </div>
    );
  }

  const statusLabel = MANUAL_STATUS_LABELS[fixture.status] ?? fixture.status;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/matches">
            <ArrowLeft className="h-4 w-4" /> Retour au calendrier
          </Link>
        </Button>
        <Button onClick={() => void saveMatch()} disabled={localSaving || saving} size="sm">
          {(localSaving || saving) && <Loader2 className="h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>

      {localMessage && (
        <p className="text-sm text-senegal-green">{localMessage}</p>
      )}

      <GlassPanel className="p-5 sm:p-6 text-center">
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {fixture.group && (
            <span className="rounded-lg bg-senegal-green/20 px-3 py-1 text-xs font-bold text-senegal-green">
              Groupe {fixture.group}
            </span>
          )}
          {fixture.round && (
            <span className="rounded-lg bg-white/5 px-3 py-1 text-xs text-muted-foreground">
              {fixture.round}
            </span>
          )}
          <span className="rounded-lg bg-white/5 px-3 py-1 text-xs text-muted-foreground">
            {statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-6 sm:gap-4 max-w-lg mx-auto w-full">
          <FixtureTeamColumn team={homeTeam} />
          <div className="shrink-0 px-2 order-first sm:order-none">
            {hasScore ? (
              <p className="text-4xl sm:text-5xl font-bold tabular-nums tracking-tight">
                {score.home}
                <span className="text-muted-foreground mx-2 font-light">–</span>
                {score.away}
              </p>
            ) : (
              <p className="text-3xl text-muted-foreground font-light">vs</p>
            )}
          </div>
          <FixtureTeamColumn team={awayTeam} />
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Score calculé automatiquement à partir des buts enregistrés.
        </p>
      </GlassPanel>

      {displayEvents.length > 0 && (
        <MatchEventsTimeline
          events={displayEvents}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
        />
      )}

      <SectionCard title="Modifier les événements" description="Buts, passes décisives et cartons">
        <MatchEventsEditor
          fixture={fixture}
          teams={data.teams}
          players={data.players}
          onChange={(events) => updateFixture(matchId, { events })}
          hideTimeline
        />
      </SectionCard>

      <FixtureVenueSummary
        venueName={fixture.venue?.name || "—"}
        city={fixture.venue?.city || ""}
        dateIso={fixture.date}
        timezone={fixture.timezone}
      />

      {fixture.group && groupStandings && groupStandings.length > 0 && (
        <GroupStandingsSection
          groupLetter={fixture.group}
          standings={groupStandings}
          highlightTeamIds={[homeTeam.id, awayTeam.id]}
        />
      )}
    </div>
  );
}
