import { ALL_GROUPS } from "@/lib/constants";
import type { Group } from "@/types";

export function getOfficialGroupLetters(): Group[] {
  return ALL_GROUPS;
}

/** Normalise un nom pour rapprocher API ↔ tirage officiel */
export function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const ALIASES: Record<string, string> = {
  usa: "unitedstates",
  unitedstates: "unitedstates",
  etatsunis: "unitedstates",
  mexique: "mexico",
  mexico: "mexico",
  korearepublic: "southkorea",
  southkorea: "southkorea",
  coreedusud: "southkorea",
  cotedivoire: "ivorycoast",
  ivorycoast: "ivorycoast",
  afriquedusud: "southafrica",
  southafrica: "southafrica",
  tchequie: "czechrepublic",
  czechrepublic: "czechrepublic",
  senegal: "senegal",
  bosnieherzegovine: "bosniaandherzegovina",
  capvert: "capeverde",
  capeverde: "capeverde",
  arabiesaoudite: "saudiarabia",
  saudiarabia: "saudiarabia",
  curacao: "curacao",
  paysbas: "netherlands",
  nouvellezelande: "newzealand",
  rdcongo: "drcongo",
  drcongo: "drcongo",
  ouzbekistan: "uzbekistan",
  ecosse: "scotland",
  scotland: "scotland",
};

export function namesMatch(apiName: string, officialName: string): boolean {
  const a = ALIASES[normalizeTeamName(apiName)] ?? normalizeTeamName(apiName);
  const o =
    ALIASES[normalizeTeamName(officialName)] ?? normalizeTeamName(officialName);
  return a === o || a.includes(o) || o.includes(a);
}
