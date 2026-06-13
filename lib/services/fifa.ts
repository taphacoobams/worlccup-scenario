import "server-only";

import { cache } from "react";
import { readFileSync } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import {
  buildFifaRowsFromThirdTable,
  type FifaMappingRow,
  type FifaThirdTable,
} from "@/lib/fifa-third-table";
import { withDbFallback } from "@/lib/services/with-fallback";

function loadFifaRowsFromJson(): FifaMappingRow[] {
  const raw = readFileSync(
    path.join(process.cwd(), "data", "third-table-source.json"),
    "utf-8"
  );
  const table = JSON.parse(raw) as FifaThirdTable;
  const rows = buildFifaRowsFromThirdTable(table);
  rows.sort((a, b) => a.lexIndex - b.lexIndex);
  return rows;
}

async function loadFifaRowsFromDb(): Promise<FifaMappingRow[]> {
  const rows = await prisma.fifaThirdPlaceScenario.findMany({
    orderBy: { lexIndex: "asc" },
  });

  if (rows.length === 0) {
    throw new Error("Aucun scénario FIFA en base");
  }

  return rows.map((r) => ({
    lexIndex: r.lexIndex,
    fifaNumber: r.fifaNumber,
    qualifiedGroups: r.qualifiedGroups as FifaMappingRow["qualifiedGroups"],
    mapping: r.mapping,
  }));
}

export const listFifaMappingRows = cache(async (): Promise<FifaMappingRow[]> => {
  return withDbFallback(loadFifaRowsFromDb, loadFifaRowsFromJson, "fifa-scenarios");
});
