import { ALL_GROUPS } from "@/lib/constants";
import type { Group } from "@/types";

/**
 * Generates all C(n,k) combinations in lexicographic order.
 * Optimized iterative algorithm — O(C(n,k)) time, O(k) space per yield.
 */
export function* combinationsGenerator(
  items: readonly Group[],
  k: number
): Generator<Group[]> {
  const n = items.length;
  if (k > n || k < 0) return;
  if (k === 0) {
    yield [];
    return;
  }

  const indices = Array.from({ length: k }, (_, i) => i);

  while (true) {
    yield indices.map((i) => items[i]);

    let i = k - 1;
    while (i >= 0 && indices[i] === n - k + i) i--;
    if (i < 0) break;

    indices[i]++;
    for (let j = i + 1; j < k; j++) {
      indices[j] = indices[j - 1] + 1;
    }
  }
}

export function generateAllCombinations(k = 8): Group[][] {
  return [...combinationsGenerator(ALL_GROUPS, k)];
}

export function combinationKey(groups: Group[]): string {
  return [...groups].sort().join(",");
}

export function validateCombinations(combos: Group[][]): {
  valid: boolean;
  count: number;
  unique: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const expected = binomial(12, 8);

  if (combos.length !== expected) {
    errors.push(`Expected ${expected} combinations, got ${combos.length}`);
  }

  const keys = new Set<string>();
  for (const c of combos) {
    if (c.length !== 8) errors.push(`Invalid size: ${c.length}`);
    const key = combinationKey(c);
    if (keys.has(key)) errors.push(`Duplicate: ${key}`);
    keys.add(key);
  }

  return {
    valid: errors.length === 0,
    count: combos.length,
    unique: keys.size === combos.length,
    errors,
  };
}

export function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return Math.round(result);
}

export function countWithGroup(combos: Group[][], group: Group): number {
  return combos.filter((c) => c.includes(group)).length;
}

export function fifaNumberFromLexIndex(lexIndex: number): number {
  return 495 - lexIndex;
}

export function lexIndexFromFifaNumber(fifaNumber: number): number {
  return 495 - fifaNumber;
}
