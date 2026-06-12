import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isManagerRequestAuthorized } from "@/lib/manager/auth";
import { readWorldCupData, writeWorldCupData } from "@/lib/worldcup-data";
import { saveTournamentStatisticsToDb } from "@/lib/worldcup-db";
import { runTournamentPipeline } from "@/lib/tournament-engine";
import { logActivity } from "@/lib/tournament-engine/activity";

export async function POST(req: NextRequest) {
  if (!(await isManagerRequestAuthorized(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const data = await readWorldCupData();
    const result = await runTournamentPipeline(data, {
      logActivities: true,
      activityDetail: "Recalcul manuel",
    });

    await writeWorldCupData(result.data);
    await saveTournamentStatisticsToDb(result.statistics);
    await logActivity("scenarios_recalculated", "Recalcul manuel demandé");

    revalidatePath("/dashboard/scenarios");
    revalidatePath("/dashboard");
    revalidatePath("/scenarios");

    return NextResponse.json({
      ok: true,
      suspended: result.suspendedPlayerIds.length,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Recalcul impossible" },
      { status: 500 }
    );
  }
}
