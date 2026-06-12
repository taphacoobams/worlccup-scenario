import { generateAllCombinations, validateCombinations } from "@/lib/combinations";
import { SENEGAL_GROUP, ALL_GROUPS, WINNER_SLOTS } from "@/lib/constants";
import type { FifaMappingRow } from "@/lib/fifa-third-table";
import type { Group, Mapping, Scenario } from "@/types";

const WINNERS = WINNER_SLOTS;

function mappingToMappings(mapping: string[]): Mapping[] {
  return WINNERS.map((winner, i) => {
    const opponent = mapping[i];
    const opponentGroup = opponent.replace("3", "") as Group;
    return { winner, opponent, opponentGroup };
  });
}

/** Assemble les 495 scénarios à partir des lignes BDD / Annex C. */
export function buildAllScenarios(rows: FifaMappingRow[]): Scenario[] {
  const fifaByLex = new Map(rows.map((r) => [r.lexIndex, r]));
  const combos = generateAllCombinations(8);
  const validation = validateCombinations(combos);
  if (!validation.valid) {
    console.warn("Combination validation:", validation.errors);
  }

  return combos.map((groups, lexIndex) => {
    const fifa = fifaByLex.get(lexIndex);
    const sorted = [...groups].sort() as Group[];
    const excluded = ALL_GROUPS.filter((g) => !sorted.includes(g));
    const includesI = sorted.includes(SENEGAL_GROUP);
    const mappings = fifa ? mappingToMappings(fifa.mapping) : [];

    const thirdIPlayedBy =
      mappings.find((m) => m.opponentGroup === "I")?.winner ?? null;

    const senegalRoundOf32Opponent = includesI
      ? thirdIPlayedBy
        ? `3I → ${thirdIPlayedBy}`
        : mappings.find((m) => m.winner === "1I")?.opponent ?? null
      : null;

    return {
      id: lexIndex + 1,
      fifaNumber: fifa?.fifaNumber ?? 495 - lexIndex,
      qualifiedThirdPlaceGroups: sorted,
      excludedGroups: excluded,
      mappings,
      includesSenegalGroup: includesI,
      winner1IOpponent: mappings.find((m) => m.winner === "1I")?.opponent ?? null,
      thirdIPlayedBy: thirdIPlayedBy as Scenario["thirdIPlayedBy"],
      senegalRoundOf32Opponent,
    };
  });
}
