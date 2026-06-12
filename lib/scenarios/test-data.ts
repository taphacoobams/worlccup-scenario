import { readFileSync } from "fs";
import path from "path";
import { buildFifaRowsFromThirdTable, type FifaThirdTable } from "@/lib/fifa-third-table";
import { buildAllScenarios } from "@/lib/scenarios/build";
import type { Scenario } from "@/types";

/** Charge les 495 scénarios depuis third-table-source.json (tests / scripts). */
export function loadScenariosFromThirdTableSource(): Scenario[] {
  const filePath = path.join(process.cwd(), "data", "third-table-source.json");
  const thirdTable = JSON.parse(readFileSync(filePath, "utf-8")) as FifaThirdTable;
  return buildAllScenarios(buildFifaRowsFromThirdTable(thirdTable));
}
