import { NextRequest, NextResponse } from "next/server";
import { isManagerRequestAuthorized } from "@/lib/manager/auth";
import { logActivity } from "@/lib/tournament-engine/activity";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  if (!(await isManagerRequestAuthorized(req))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await context.params;
  const legacyId = Number(id);
  if (!Number.isFinite(legacyId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const body = (await req.json()) as {
    bio?: string;
    specialTag?: string;
    image?: string;
  };

  const player = await prisma.player.findUnique({ where: { legacyId } });
  if (!player) {
    return NextResponse.json({ error: "Joueur introuvable" }, { status: 404 });
  }

  await prisma.player.update({
    where: { legacyId },
    data: {
      bio: body.bio !== undefined ? body.bio : undefined,
      specialTag: body.specialTag !== undefined ? body.specialTag : undefined,
      image: body.image !== undefined ? body.image : undefined,
    },
  });

  await logActivity("player_updated", player.name);
  return NextResponse.json({ ok: true });
}
