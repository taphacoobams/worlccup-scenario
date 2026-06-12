import "server-only";

import { prisma } from "@/lib/prisma";

export async function getManagerPlayersList() {
  return prisma.player.findMany({
    include: { team: { select: { name: true, code: true, legacyId: true } } },
    orderBy: [{ team: { name: "asc" } }, { name: "asc" }],
  });
}
