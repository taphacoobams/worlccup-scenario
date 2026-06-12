import type { Group, Scenario } from "@/types";
import type {
  EnrichedScenario,
  FavoriteScenarioImpact,
  ProbabilityConfidence,
  ScenarioDataContext,
  ScenarioTag,
} from "@/lib/scenario-engine/types";
import { getThirdPlayedByWinner, scenarioIncludesGroup } from "@/lib/scenarios-team";
import { getStandingsForScenarioGroup } from "@/lib/scenario-engine/simulate-standings";

const OPPONENT_DIFFICULTY: Record<string, number> = {
  "1A": 88,
  "1B": 85,
  "1D": 82,
  "1E": 80,
  "1G": 78,
  "1I": 76,
  "1K": 74,
  "1L": 72,
};

export function confidenceFromScore(score: number): {
  confidence: ProbabilityConfidence;
  label: string;
} {
  if (score >= 90) return { confidence: "very-likely", label: "Very Likely" };
  if (score >= 70) return { confidence: "likely", label: "Likely" };
  if (score >= 50) return { confidence: "possible", label: "Possible" };
  if (score >= 30) return { confidence: "unlikely", label: "Unlikely" };
  return { confidence: "very-unlikely", label: "Very Unlikely" };
}

function avgThirdStrength(scenario: Scenario, ctx: ScenarioDataContext): number {
  const strengths = scenario.qualifiedThirdPlaceGroups.map(
    (g) => ctx.groupThirdStrength.get(g) ?? 50
  );
  if (strengths.length === 0) return 50;
  return strengths.reduce((a, b) => a + b, 0) / strengths.length;
}

function strengthVariance(scenario: Scenario, ctx: ScenarioDataContext): number {
  const strengths = scenario.qualifiedThirdPlaceGroups.map(
    (g) => ctx.groupThirdStrength.get(g) ?? 50
  );
  const avg = avgThirdStrength(scenario, ctx);
  return (
    strengths.reduce((s, v) => s + (v - avg) ** 2, 0) / Math.max(strengths.length, 1)
  );
}

/** Score brut 0–100 avant normalisation globale */
export function calculateRawProbability(
  scenario: Scenario,
  ctx: ScenarioDataContext
): number {
  const thirds = scenario.qualifiedThirdPlaceGroups;
  const avg = avgThirdStrength(scenario, ctx);
  const variance = strengthVariance(scenario, ctx);

  let score =
    avg * 0.55 +
    (100 - Math.min(variance, 400) * 0.08) * 0.2 +
    (thirds.length / 8) * 100 * 0.05;

  const weakCount = thirds.filter(
    (g) => (ctx.groupThirdStrength.get(g) ?? 50) < 58
  ).length;
  const strongCount = thirds.filter(
    (g) => (ctx.groupThirdStrength.get(g) ?? 50) > 72
  ).length;

  score += strongCount * 2.5 - weakCount * 1.8;

  const freqBoost = thirds.reduce((s, g) => {
    return s + (ctx.groupThirdStrength.get(g) ?? 50) * 0.02;
  }, 0);

  score += Math.min(freqBoost * 0.15, 12);

  return Math.min(99, Math.max(5, score));
}

export function computeFavoriteImpact(
  scenario: Scenario,
  teamId: number,
  teamName: string,
  group: Group,
  ctx: ScenarioDataContext
): FavoriteScenarioImpact {
  const rows = getStandingsForScenarioGroup(scenario, group, ctx);
  const row = rows.find((r) => r.teamId === teamId);
  const position = row?.position ?? 4;
  const thirdQualifies = scenarioIncludesGroup(scenario, group);
  const thirdBy = getThirdPlayedByWinner(scenario, group);
  const reachesRoundOf16 =
    position <= 2 || (position === 3 && thirdQualifies);

  let favorabilityScore = 0;
  if (position === 1) favorabilityScore += 45;
  else if (position === 2) favorabilityScore += 32;
  else if (position === 3 && thirdQualifies) favorabilityScore += 28;
  else favorabilityScore += 4;

  if (thirdBy && OPPONENT_DIFFICULTY[thirdBy]) {
    favorabilityScore += (100 - OPPONENT_DIFFICULTY[thirdBy]) * 0.35;
  } else if (thirdQualifies) {
    favorabilityScore += 12;
  }

  const strength = ctx.teamStrength.get(teamId) ?? 50;
  favorabilityScore += strength * 0.15;

  let likelyPath: FavoriteScenarioImpact["likelyPath"] = "eliminated";
  if (position === 1) likelyPath = "first";
  else if (position === 2) likelyPath = "second";
  else if (position === 3 && thirdQualifies) likelyPath = "third";
  else if (position === 3) likelyPath = "eliminated";

  const roundOf32Opponent = thirdQualifies
    ? thirdBy
      ? `3${group} → ${thirdBy}`
      : scenario.mappings.find((m) => m.winner === `1${group}`)?.opponent ?? null
    : null;

  return {
    teamId,
    teamName,
    group,
    position,
    thirdQualifies,
    reachesRoundOf16,
    favorabilityScore: Math.min(100, favorabilityScore),
    likelyPath,
    roundOf32Opponent,
  };
}

export function buildScenarioTags(
  scenario: Scenario,
  rawScore: number,
  avgScore: number,
  favoriteImpact: FavoriteScenarioImpact | null,
  ctx: ScenarioDataContext
): ScenarioTag[] {
  const tags: ScenarioTag[] = [];
  const draws = scenario.qualifiedThirdPlaceGroups.filter((g) => {
    const rows = ctx.standingsByGroup.get(g) ?? [];
    return rows.some((r) => r.draw >= 2);
  }).length;

  if (favoriteImpact?.thirdQualifies || favoriteImpact?.reachesRoundOf16) {
    tags.push("qualification");
  } else if (favoriteImpact) {
    tags.push("elimination");
  }

  if (draws >= 4) tags.push("draw-heavy");
  if (rawScore < avgScore * 0.75) tags.push("upset");
  if (favoriteImpact && favoriteImpact.favorabilityScore >= 65) {
    tags.push("best-for-team");
  }

  return tags;
}

export function normalizeProbabilityScores(
  enriched: EnrichedScenario[]
): EnrichedScenario[] {
  const raw = enriched.map((e) => e.probabilityScore);
  const min = Math.min(...raw);
  const max = Math.max(...raw);
  const span = max - min || 1;

  return enriched.map((e) => {
    const normalized = Math.round(((e.probabilityScore - min) / span) * 85 + 8);
    const { confidence, label } = confidenceFromScore(normalized);
    return {
      ...e,
      probabilityScore: normalized,
      confidence,
      confidenceLabel: label,
    };
  });
}
