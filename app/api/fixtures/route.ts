import { jsonError, jsonOk } from "@/lib/services/api-response";
import { getWorldCupFixtures } from "@/lib/worldcup-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const fixtures = await getWorldCupFixtures();
    return jsonOk(fixtures);
  } catch (error) {
    console.error(error);
    return jsonError("Failed to load fixtures");
  }
}
