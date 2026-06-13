import { jsonOk } from "@/lib/services/api-response";
import { diagnoseDatabaseUrl } from "@/lib/services/diagnostics";

export const dynamic = "force-dynamic";

export async function GET() {
  return jsonOk(diagnoseDatabaseUrl());
}
