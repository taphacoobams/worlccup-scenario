import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { isManagerRequestAuthorized } from "@/lib/manager/auth";
import { readWorldCupData } from "@/lib/worldcup-data";
import { logActivity } from "@/lib/tournament-engine/activity";

export async function POST(req: NextRequest) {
  if (!(await isManagerRequestAuthorized(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const data = await readWorldCupData();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup-${stamp}.json`;
  const dir = path.join(process.cwd(), "data", "backups");
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, filename),
    JSON.stringify(data, null, 2),
    "utf-8"
  );

  await logActivity("backup_created", filename);
  return NextResponse.json({ ok: true, filename });
}
