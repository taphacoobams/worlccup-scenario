import { NextRequest, NextResponse } from "next/server";
import { isManagerRequestAuthorized } from "@/lib/manager/auth";
import { readWorldCupData } from "@/lib/worldcup-data";
import { logActivity } from "@/lib/tournament-engine/activity";

export async function GET(req: NextRequest) {
  if (!(await isManagerRequestAuthorized(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const format = req.nextUrl.searchParams.get("format") ?? "json";
  const data = await readWorldCupData();

  if (format === "zip") {
    const bundle = {
      teams: data.teams,
      groups: data.groups,
      fixtures: data.fixtures,
      players: data.players,
      exportedAt: new Date().toISOString(),
    };
    await logActivity("data_exported", "ZIP (bundle JSON)");
    return new NextResponse(JSON.stringify(bundle, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="worldcup-backup.json"',
      },
    });
  }

  await logActivity("data_exported", "JSON");
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="worldcup-data.json"',
    },
  });
}
