import { jsonError, jsonOk } from "@/lib/services/api-response";
import { loadStatistics } from "@/lib/services/statistics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await loadStatistics();
    return jsonOk(stats);
  } catch (error) {
    console.error(error);
    return jsonError("Failed to load statistics");
  }
}
