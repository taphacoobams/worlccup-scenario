import { NextRequest, NextResponse } from "next/server";
import {
  createManagerSessionToken,
  isManagerConfigured,
  managerCookieOptions,
  verifyManagerPassword,
} from "@/lib/manager/auth";
import { logActivity } from "@/lib/tournament-engine/activity";

export async function POST(req: NextRequest) {
  if (!isManagerConfigured()) {
    return NextResponse.json(
      { error: "Manager non configuré (MANAGER_SECRET manquant)" },
      { status: 503 }
    );
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: string };
    password = body.password?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });
  }

  if (!(await verifyManagerPassword(password))) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const token = await createManagerSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Session impossible" }, { status: 500 });
  }

  await logActivity("login");

  const res = NextResponse.json({ ok: true });
  res.cookies.set(managerCookieOptions(token));
  return res;
}
