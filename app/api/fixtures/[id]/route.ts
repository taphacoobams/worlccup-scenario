import { jsonError, jsonOk } from "@/lib/services/api-response";
import { getFixtureById } from "@/lib/worldcup-data";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const legacyId = Number(id);
    if (!Number.isFinite(legacyId)) {
      return jsonError("Invalid fixture id", 400);
    }
    const fixture = await getFixtureById(legacyId);
    if (!fixture) {
      return jsonError("Fixture not found", 404);
    }
    return jsonOk(fixture);
  } catch (error) {
    console.error(error);
    return jsonError("Failed to load fixture");
  }
}
