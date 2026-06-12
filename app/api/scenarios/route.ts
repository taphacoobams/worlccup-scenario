import { NextResponse } from "next/server";
import {
  getAllScenarios,
  getSenegalScenarios,
  getScenarioStats,
} from "@/lib/scenarios/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const senegalOnly = searchParams.get("senegal") === "true";
  const statsOnly = searchParams.get("stats") === "true";

  if (statsOnly) {
    const stats = await getScenarioStats();
    return NextResponse.json(stats, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  }

  const data = senegalOnly ? await getSenegalScenarios() : await getAllScenarios();
  return NextResponse.json(
    { count: data.length, scenarios: data },
    { headers: { "Cache-Control": "private, max-age=60" } }
  );
}
