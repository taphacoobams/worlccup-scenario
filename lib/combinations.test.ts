import { describe, it, expect } from "vitest";
import {
  generateAllCombinations,
  validateCombinations,
  binomial,
  countWithGroup,
} from "./combinations";

describe("combinations", () => {
  it("computes binomial C(12,8) = 495", () => {
    expect(binomial(12, 8)).toBe(495);
    expect(binomial(11, 7)).toBe(330);
    expect(binomial(11, 8)).toBe(165);
  });

  it("generates exactly 495 unique combinations", () => {
    const combos = generateAllCombinations(8);
    const validation = validateCombinations(combos);
    expect(combos.length).toBe(495);
    expect(validation.valid).toBe(true);
    expect(validation.unique).toBe(true);
  });

  it("counts 330 with group I and 165 without", () => {
    const combos = generateAllCombinations(8);
    expect(countWithGroup(combos, "I")).toBe(330);
    expect(495 - countWithGroup(combos, "I")).toBe(165);
  });

  it("each combination has exactly 8 groups", () => {
    const combos = generateAllCombinations(8);
    for (const c of combos) {
      expect(c).toHaveLength(8);
      expect(new Set(c).size).toBe(8);
    }
  });
});
