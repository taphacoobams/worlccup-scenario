import "server-only";

import { cache } from "react";
import { requireDatabase } from "@/lib/database";
import type { FifaMappingRow } from "@/lib/fifa-third-table";
import { prisma } from "@/lib/prisma";
import type { Group } from "@/types";

async function rowsFromDatabase(): Promise<FifaMappingRow[]> {
  requireDatabase();
  const rows = await prisma.fifaThirdPlaceScenario.findMany({
    orderBy: { lexIndex: "asc" },
  });

  if (rows.length === 0) {
    throw new Error(
      "Aucun scénario FIFA en base — lancez npm run import-fifa puis npm run db:seed"
    );
  }

  if (rows.length !== 495) {
    console.warn(`Attendu 495 scénarios FIFA, trouvé ${rows.length} en BDD`);
  }

  return rows.map((r) => ({
    lexIndex: r.lexIndex,
    fifaNumber: r.fifaNumber,
    qualifiedGroups: r.qualifiedGroups as Group[],
    mapping: r.mapping,
  }));
}

/** 495 combinaisons FIFA — PostgreSQL uniquement. */
export const getFifaMappingRows = cache(async (): Promise<FifaMappingRow[]> => {
  return rowsFromDatabase();
});
