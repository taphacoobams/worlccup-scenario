import type { ProbabilityConfidence } from "@/lib/scenario-engine/types";

const CONFIDENCE_KEYS: Record<ProbabilityConfidence, string> = {
  "very-likely": "veryLikely",
  likely: "likely",
  possible: "possible",
  unlikely: "unlikely",
  "very-unlikely": "veryUnlikely",
};

export function confidenceMessageKey(confidence: ProbabilityConfidence): string {
  return `scenarios.confidence.${CONFIDENCE_KEYS[confidence]}`;
}
