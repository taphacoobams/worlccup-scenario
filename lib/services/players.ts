import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { readPlayersJson } from "@/lib/data/loader";
import { withDbFallback } from "@/lib/services/with-fallback";
import type { LocalPlayer } from "@/types/data";

function mapDbPlayer(row: {
  legacyId: number;
  team: { legacyId: number };
  name: string;
  number: number | null;
  position: string | null;
  positionCode: string | null;
  club: string | null;
  age: number | null;
  nationality: string | null;
  image: string | null;
  dateOfBirth: Date | null;
  heightCm: number | null;
  bio: string | null;
  bioEn: string | null;
  bioCredit: string | null;
  imageCredit: string | null;
}): LocalPlayer {
  return {
    id: row.legacyId,
    teamId: row.team.legacyId,
    name: row.name,
    number: row.number,
    position: row.position ?? "",
    positionCode: row.positionCode ?? undefined,
    club: row.club ?? "",
    age: row.age,
    nationality: row.nationality ?? "",
    photo: row.image ?? "",
    dob: row.dateOfBirth?.toISOString().slice(0, 10),
    heightCm: row.heightCm ?? undefined,
    bio: row.bio ?? undefined,
    bioEn: row.bioEn ?? undefined,
    bioCredit: row.bioCredit,
    imageCredit: row.imageCredit,
  };
}

async function listPlayersFromDb(): Promise<LocalPlayer[]> {
  const rows = await prisma.player.findMany({
    include: { team: { select: { legacyId: true } } },
    orderBy: [{ team: { name: "asc" } }, { name: "asc" }],
  });
  return rows.map(mapDbPlayer);
}

function listPlayersFromJson(): LocalPlayer[] {
  return readPlayersJson();
}

export const listPlayers = cache(async (): Promise<LocalPlayer[]> => {
  return withDbFallback(listPlayersFromDb, listPlayersFromJson, "players");
});

export const listPlayerCountsByTeam = cache(
  async (): Promise<Map<number, number>> => {
    try {
      const [counts, teams] = await Promise.all([
        prisma.player.groupBy({
          by: ["teamId"],
          _count: { _all: true },
        }),
        prisma.team.findMany({ select: { id: true, legacyId: true } }),
      ]);
      const legacyById = new Map(teams.map((t) => [t.id, t.legacyId]));
      const out = new Map<number, number>();
      for (const row of counts) {
        const legacyId = legacyById.get(row.teamId);
        if (legacyId != null) out.set(legacyId, row._count._all);
      }
      return out;
    } catch {
      const players = listPlayersFromJson();
      const out = new Map<number, number>();
      for (const p of players) {
        out.set(p.teamId, (out.get(p.teamId) ?? 0) + 1);
      }
      return out;
    }
  }
);

export async function getPlayerByLegacyId(id: number): Promise<LocalPlayer | null> {
  const players = await listPlayers();
  return players.find((p) => p.id === id) ?? null;
}
