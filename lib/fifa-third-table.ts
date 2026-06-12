import { combinationKey } from "@/lib/combinations";
import { ALL_GROUPS, WINNER_SLOTS } from "@/lib/constants";
import type { Group } from "@/types";

export type FifaThirdTable = Record<string, Record<string, string>>;

export type FifaMappingRow = {
  lexIndex: number;
  fifaNumber: number;
  qualifiedGroups: Group[];
  mapping: string[];
};

const WINNER_LETTERS = WINNER_SLOTS.map((s) => s.replace("1", "")) as Group[];

function* combinations(items: readonly Group[], k: number): Generator<Group[]> {
  const n = items.length;
  const idx = Array.from({ length: k }, (_, i) => i);
  while (true) {
    yield idx.map((i) => items[i]);
    let i = k - 1;
    while (i >= 0 && idx[i] === n - k + i) i--;
    if (i < 0) break;
    idx[i]++;
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
  }
}

function lexIndexFromGroups(groups: Group[]): number {
  const key = combinationKey(groups);
  let i = 0;
  for (const combo of combinations(ALL_GROUPS, 8)) {
    if (combinationKey(combo) === key) return i;
    i++;
  }
  return -1;
}

/** Convertit la table Annex C (clé « EFGHIJKL ») en lignes indexées. */
export function buildFifaRowsFromThirdTable(thirdTable: FifaThirdTable): FifaMappingRow[] {
  const scenarios: FifaMappingRow[] = [];

  for (const [concatKey, slotMap] of Object.entries(thirdTable)) {
    const qualifiedGroups = concatKey.split("") as Group[];
    if (qualifiedGroups.length !== 8) continue;

    const mapping = WINNER_LETTERS.map((letter) => `3${slotMap[letter]}`);
    const lexIndex = lexIndexFromGroups(qualifiedGroups);
    if (lexIndex < 0) {
      throw new Error(`Combinaison FIFA inconnue: ${concatKey}`);
    }

    scenarios.push({
      lexIndex,
      fifaNumber: 495 - lexIndex,
      qualifiedGroups,
      mapping,
    });
  }

  scenarios.sort((a, b) => a.lexIndex - b.lexIndex);

  if (scenarios.length !== 495) {
    throw new Error(`Attendu 495 scénarios FIFA, obtenu ${scenarios.length}`);
  }

  return scenarios;
}
