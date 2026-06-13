import { sortStandingsByStats } from "@/lib/standings-utils";
import type { TeamQualificationProbs } from "@/types/qualification";
import type { GroupStanding } from "@/types/worldcup";

export const STANDINGS_DISCLAIMER =
  "Le classement est déterminé uniquement par les résultats déjà joués (points, différence de buts, buts marqués, critères FIFA). Il n'est jamais trié selon les probabilités.";

export const PROBABILITY_DISCLAIMER =
  "La probabilité de qualification est une projection statistique (simulations, force estimée, matchs restants). Elle ne modifie pas le classement actuel.";

export type RankProbabilityInversion = {
  aheadTeam: { id: number; name: string; position: number; probability: number };
  behindTeam: { id: number; name: string; position: number; probability: number };
};

const MIN_PROB_GAP = 1;

/** Détecte les cas où une équipe mieux classée a une P(qualif.) inférieure à une équipe derrière elle. */
export function findRankProbabilityInversions(
  standings: GroupStanding[],
  teamProbs: Record<number, TeamQualificationProbs> | Map<number, TeamQualificationProbs>
): RankProbabilityInversion[] {
  const getProb = (teamId: number) => {
    const entry =
      teamProbs instanceof Map ? teamProbs.get(teamId) : teamProbs[teamId];
    return entry?.total ?? 0;
  };

  const sorted = sortStandingsByStats(standings);
  const inversions: RankProbabilityInversion[] = [];

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const ahead = sorted[i];
      const behind = sorted[j];
      const probAhead = getProb(ahead.team.id);
      const probBehind = getProb(behind.team.id);

      if (probBehind > probAhead + MIN_PROB_GAP) {
        inversions.push({
          aheadTeam: {
            id: ahead.team.id,
            name: ahead.team.name,
            position: ahead.position,
            probability: probAhead,
          },
          behindTeam: {
            id: behind.team.id,
            name: behind.team.name,
            position: behind.position,
            probability: probBehind,
          },
        });
      }
    }
  }

  return inversions;
}

export function explainRankProbabilityInversion(inv: RankProbabilityInversion): string {
  const { aheadTeam, behindTeam } = inv;
  return (
    `${aheadTeam.name} est actuellement devant ${behindTeam.name} au classement ` +
    `(#${aheadTeam.position} vs #${behindTeam.position}) grâce à ses résultats déjà obtenus. ` +
    `Cependant, ${behindTeam.name} possède une probabilité de qualification plus élevée ` +
    `(${behindTeam.probability.toFixed(1)} % vs ${aheadTeam.probability.toFixed(1)} %) selon les simulations, ` +
    `car son calendrier restant est considéré comme plus favorable ou sa force estimée est supérieure. ` +
    `Le classement reflète la situation actuelle tandis que la probabilité de qualification reflète ` +
    `les chances de qualification à la fin de la phase de groupes.`
  );
}

/** Vérifie que le classement respecte l'ordre sportif (pts → diff → buts). */
export function isStandingsOrderSportValid(standings: GroupStanding[]): boolean {
  const sorted = sortStandingsByStats(standings);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (prev.points < curr.points) return false;
    if (prev.points === curr.points && prev.goalDifference < curr.goalDifference) return false;
    if (
      prev.points === curr.points &&
      prev.goalDifference === curr.goalDifference &&
      prev.goalsFor < curr.goalsFor
    ) {
      return false;
    }
  }
  return true;
}
