import { jsonError, jsonOk } from "@/lib/services/api-response";
import { getTeamDetailBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ team: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { team } = await params;
    const detail = await getTeamDetailBySlug(team);
    if (!detail) {
      return jsonError("Team not found", 404);
    }
    return jsonOk(detail);
  } catch (error) {
    console.error(error);
    return jsonError("Failed to load team");
  }
}
