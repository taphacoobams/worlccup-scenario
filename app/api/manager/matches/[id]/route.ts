import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isManagerRequestAuthorized } from "@/lib/manager/auth";
import { readWorldCupData, writeWorldCupData } from "@/lib/worldcup-data";
import { saveTournamentStatisticsToDb } from "@/lib/worldcup-db";
import { runTournamentPipeline } from "@/lib/tournament-engine";
import { logActivity } from "@/lib/tournament-engine/activity";
import type { ManualFixture } from "@/types/worldcup-manual";

type RouteContext = { params: Promise<{ id: string }> };

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
    const data = await readWorldCupData();
    const exists = data.fixtures.some((f) => f.id === fixtureId);
    if (!exists) {
      return NextResponse.json({ error: "Match introuvable" }, { status: 404 });
    }

    const next = {
      ...data,
      fixtures: data.fixtures.map((f) =>
        f.id === fixtureId ? { ...f, ...patch } : f
      ),
    };

    const result = await runTournamentPipeline(next, {
      logActivities: true,
      activityDetail: `Match #${fixtureId}`,
    });

    await writeWorldCupData(result.data);
    await saveTournamentStatisticsToDb(result.statistics);
    await logActivity("match_updated", `Match #${fixtureId}`);

    if (patch.events?.some((e) => e.type === "goal")) {
      await logActivity("goal_added", `Match #${fixtureId}`);
    }
    if (
      patch.events?.some(
        (e) => e.type === "yellow_card" || e.type === "red_card"
      )
    ) {
      await logActivity("card_added", `Match #${fixtureId}`);
    }

    revalidatePath("/dashboard/matches");
    revalidatePath(`/dashboard/matches/${fixtureId}`);
    revalidatePath("/dashboard");
    revalidatePath("/fixtures");

    const saved = result.data.fixtures.find((f) => f.id === fixtureId);
    return NextResponse.json({ ok: true, fixture: saved });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Mise à jour impossible" },
      { status: 500 }
    );
  }
}
