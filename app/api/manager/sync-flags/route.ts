import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { isManagerRequestAuthorized } from "@/lib/manager/auth";
import { readWorldCupData, syncTeamFlags, writeWorldCupData } from "@/lib/worldcup-data";

export async function POST(req: NextRequest) {
  if (!(await isManagerRequestAuthorized(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const data = await readWorldCupData();
    const synced = syncTeamFlags(data);
    await writeWorldCupData(synced);

    for (const route of [
      "/groups",
      "/teams",
      "/fixtures",
      "/dashboard",
      "/statistics",
    ]) {
      revalidatePath(route);
    }

    return NextResponse.json({
      ok: true,
      count: synced.teams.length,
      updatedAt: synced.updatedAt,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 500 }
    );
  }
}
