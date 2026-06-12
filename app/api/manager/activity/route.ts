import { NextRequest, NextResponse } from "next/server";
import { isManagerRequestAuthorized } from "@/lib/manager/auth";
import { getRecentActivity } from "@/lib/tournament-engine/activity";

export async function GET(req: NextRequest) {
  if (!(await isManagerRequestAuthorized(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "50");
  const rows = await getRecentActivity(Math.min(limit, 200));
  return NextResponse.json({ activities: rows });
}
