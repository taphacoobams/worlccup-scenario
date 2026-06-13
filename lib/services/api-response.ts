import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store" },
    ...init,
  });
}

export function jsonError(message: string, status = 500) {
  console.error(`[api] ${message}`);
  return NextResponse.json({ error: message, data: null }, { status });
}

export function jsonEmptyArray() {
  return jsonOk([]);
}
