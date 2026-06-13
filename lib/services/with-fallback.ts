import "server-only";

import { isDatabaseEnabled } from "@/lib/database";

export async function withDbFallback<T>(
  dbOp: () => Promise<T>,
  jsonOp: () => T | Promise<T>,
  label = "data"
): Promise<T> {
  if (!isDatabaseEnabled()) {
    return jsonOp();
  }
  try {
    return await dbOp();
  } catch (error) {
    console.error(`[services:${label}] DB unavailable, falling back to JSON`, error);
    return jsonOp();
  }
}
