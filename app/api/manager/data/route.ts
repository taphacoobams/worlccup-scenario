import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import {
  isManagerConfigured,
  isManagerRequestAuthorized,
} from "@/lib/manager/auth";
import { readWorldCupData, writeWorldCupData } from "@/lib/worldcup-data";
import { loadManagerDashboardData } from "@/lib/results/manager-load";
import { saveTournamentStatisticsToDb } from "@/lib/worldcup-db";
import { runTournamentPipeline } from "@/lib/tournament-engine";
import { logActivity } from "@/lib/tournament-engine/activity";
import type { WorldCupManualData } from "@/types/worldcup-manual";

import { REVALIDATE_PATHS } from "@/lib/results/pipeline";

const REVALIDATE_ROUTES = [...REVALIDATE_PATHS, "/knockout", "/dashboard"];

export async function GET(req: NextRequest) {
  if (!isManagerConfigured()) {
    return NextResponse.json(
      { error: "Manager non configuré (MANAGER_SECRET manquant)" },
      { status: 503 }
    );
  }
  if (!(await isManagerRequestAuthorized(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const data = await loadManagerDashboardData();
    return NextResponse.json({ ...data, source: "results.json" });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lecture impossible" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await isManagerRequestAuthorized(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as WorldCupManualData;
    if (!body.teams?.length || !body.groups?.length) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { data, statistics } = await runTournamentPipeline(body, {
      logActivities: true,
      activityDetail: "Sauvegarde globale",
    });

    await writeWorldCupData(data);
    await saveTournamentStatisticsToDb(statistics);
    await logActivity("match_updated", "Données tournoi enregistrées");

    const saved = await readWorldCupData();

    for (const route of REVALIDATE_ROUTES) {
      revalidatePath(route);
    }

    return NextResponse.json({ ok: true, updatedAt: saved.updatedAt });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Échec enregistrement" },
      { status: 500 }
    );
  }
}
