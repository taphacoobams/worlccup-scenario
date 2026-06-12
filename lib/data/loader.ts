import { readFileSync } from "fs";
import path from "path";
import { cache } from "react";
import { parseGroupsFile } from "@/lib/data/groups-file";
import { standingsFromGroups } from "@/lib/data/standings-from-groups";

const DATA_DIR = path.join(process.cwd(), "data");

function readJsonFile<T>(filename: string): T {
  const raw = readFileSync(path.join(DATA_DIR, filename), "utf-8");
  return JSON.parse(raw) as T;
}

export const readTeamsJson = cache(() => readJsonFile<import("@/types/data").LocalTeam[]>("teams.json"));

export const readPlayersJson = cache(() =>
  readJsonFile<import("@/types/data").LocalPlayer[]>("players.json")
);

export const readGroupsFileJson = cache(() =>
  parseGroupsFile(readJsonFile<unknown>("groups.json"))
);

export const readGroupsJson = cache(() => readGroupsFileJson().groups);

export const readBestThirdsJson = cache(() => readGroupsFileJson().bestThirds);

export const readStandingsJson = cache(() => standingsFromGroups(readGroupsJson()));

export const readFixturesJson = cache(() =>
  readJsonFile<import("@/types/data").LocalFixture[]>("fixtures.json")
);
