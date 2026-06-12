import { NextResponse } from "next/server";
import { runMonteCarloSimulation } from "@/lib/monte-carlo";
import { getAllScenarios } from "@/lib/scenarios/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const iterations = Math.min(Math.max(Number(body.iterations) || 10000, 100), 500000);
    const senegalBias = body.senegalBias ? Number(body.senegalBias) : undefined;
    const seed = body.seed ? Number(body.seed) : undefined;

    const scenarios = await getAllScenarios();
    const result = runMonteCarloSimulation(scenarios, {
      iterations,
      senegalBias,
      seed,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
