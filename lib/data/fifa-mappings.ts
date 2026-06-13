import "server-only";

import { cache } from "react";
import { listFifaMappingRows } from "@/lib/services/fifa";
import type { FifaMappingRow } from "@/lib/fifa-third-table";

/** 495 combinaisons FIFA — PostgreSQL avec repli third-table-source.json */
export const getFifaMappingRows = cache(async (): Promise<FifaMappingRow[]> => {
  return listFifaMappingRows();
});
