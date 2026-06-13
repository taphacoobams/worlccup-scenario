import { NextRequest, NextResponse } from "next/server";
import { isManagerRequestAuthorized } from "@/lib/manager/auth";
import { getMatchResult } from "@/lib/results/repository";
import { resultEventsToMatchEvents } from "@/lib/results/events";
import {
  getMatchResultForApi,
  loadManagerDashboardData,
  loadManagerMatchFromResults,
} from "@/lib/results/manager-load";
import { persistMatchResultFromManager } from "@/lib/results/pipeline";
import { normalizeMatchEvents } from "@/lib/tournament-engine/events";
import type { ManualFixture } from "@/types/worldcup-manual";
import type { MatchResultStatus } from "@/types/results";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  if (!(await isManagerRequestAuthorized(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await context.params;
  const fixtureId = Number(id);
  if (!Number.isFinite(fixtureId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const loaded = await loadManagerMatchFromResults(fixtureId);
    if (!loaded) {
      return NextResponse.json({ error: "Match introuvable" }, { status: 404 });
    }

    const { fixture, data } = loaded;
    const result = getMatchResult(fixtureId);
    const computed = getMatchResultForApi(
      fixtureId,
      fixture.homeTeamId,
      fixture.awayTeamId,
      data.teams
    );

    return NextResponse.json({
      source: "results.json",
      fixture,
      result,
      computed,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lecture impossible" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  if (!(await isManagerRequestAuthorized(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await context.params;
  const fixtureId = Number(id);
  if (!Number.isFinite(fixtureId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const patch = (await req.json()) as Partial<ManualFixture>;
    const loaded = await loadManagerMatchFromResults(fixtureId);
    if (!loaded) {
      return NextResponse.json({ error: "Match introuvable" }, { status: 404 });
    }

    const { fixture, data } = loaded;
    const existingResult = getMatchResult(fixtureId);
    const existingEvents = existingResult
      ? resultEventsToMatchEvents(
          existingResult.events,
          data.teams,
          data.players
        )
      : fixture.events;

    const events = normalizeMatchEvents(
      patch.events ?? existingEvents,
      data.teams,
      data.players
    );
    const status = (patch.status ?? fixture.status) as MatchResultStatus;

    const result = await persistMatchResultFromManager({
      matchId: fixtureId,
      status,
      events,
      teams: data.teams,
    });

    const saved = result.fixtures.find((f) => f.id === fixtureId);
    return NextResponse.json({
      ok: true,
      source: "results.json",
      fixture: saved,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Mise à jour impossible" },
      { status: 500 }
    );
  }
}
