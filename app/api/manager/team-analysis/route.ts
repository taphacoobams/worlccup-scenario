import { NextRequest, NextResponse } from "next/server";
import { isManagerRequestAuthorized } from "@/lib/manager/auth";
import { recalculateQualificationProbabilities } from "@/lib/tournament-engine/scenarios";
import { DEFAULT_FAVORITE_TEAM_ID } from "@/lib/teams-selection";

export async function GET(req: NextRequest) {
  if (!(await isManagerRequestAuthorized(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const raw = req.nextUrl.searchParams.get("teamId");
  const teamId = raw ? Number(raw) : DEFAULT_FAVORITE_TEAM_ID;
  if (!Number.isFinite(teamId)) {
    return NextResponse.json({ error: "teamId invalide" }, { status: 400 });
  }

  const analysis = await recalculateQualificationProbabilities(teamId);
  return NextResponse.json(analysis);
}
