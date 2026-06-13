import { jsonError, jsonOk } from "@/lib/services/api-response";
import { listPlayers } from "@/lib/services/players";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const players = await listPlayers();
    return jsonOk(players);
  } catch (error) {
    console.error(error);
    return jsonError("Failed to load players");
  }
}
