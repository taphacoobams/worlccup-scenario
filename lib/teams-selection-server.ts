import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { SelectableTeam } from "@/types/team-selection";

export const getSelectableTeamsFromDb = cache(async (): Promise<SelectableTeam[]> => {
  const rows = await prisma.team.findMany({ orderBy: { name: "asc" } });
  return rows.map((t) => ({
    id: t.legacyId,
    name: t.name,
    code: t.code,
    country: t.country || t.name,
    group: t.group?.toUpperCase() ?? null,
  }));
});
