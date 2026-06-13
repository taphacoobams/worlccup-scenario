import { jsonError, jsonOk } from "@/lib/services/api-response";
import { listTeams } from "@/lib/services/teams";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const teams = await listTeams();
    return jsonOk(teams);
  } catch (error) {
    console.error(error);
    return jsonError("Failed to load teams");
  }
}
