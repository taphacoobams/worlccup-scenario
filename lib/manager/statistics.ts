import "server-only";

import { prisma } from "@/lib/prisma";

export async function getManagerStatistics() {
  const [scorers, assists, cards] = await Promise.all([
    prisma.scorer.findMany({
      include: {
        player: { include: { team: { select: { name: true, code: true } } } },
      },
      orderBy: { goals: "desc" },
    }),
    prisma.assist.findMany({
      include: {
        player: { include: { team: { select: { name: true, code: true } } } },
      },
      orderBy: { assists: "desc" },
    }),
    prisma.card.findMany({
      include: {
        player: { include: { team: { select: { name: true, code: true } } } },
      },
      orderBy: [{ yellowCards: "desc" }, { redCards: "desc" }],
    }),
  ]);

  const suspended = cards.filter((c) => c.suspended);

  return { scorers, assists, cards, suspended };
}
