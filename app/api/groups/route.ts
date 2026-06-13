import { jsonError, jsonOk } from "@/lib/services/api-response";
import { getGroupsWithResults } from "@/lib/worldcup-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getGroupsWithResults();
    return jsonOk(data);
  } catch (error) {
    console.error(error);
    return jsonError("Failed to load groups");
  }
}
