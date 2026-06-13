import { jsonError, jsonOk } from "@/lib/services/api-response";
import { getPlayerById } from "@/lib/data";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const legacyId = Number(id);
    if (!Number.isFinite(legacyId)) {
      return jsonError("Invalid player id", 400);
    }
    const player = await getPlayerById(legacyId);
    if (!player) {
      return jsonError("Player not found", 404);
    }
    return jsonOk(player);
  } catch (error) {
    console.error(error);
    return jsonError("Failed to load player");
  }
}
