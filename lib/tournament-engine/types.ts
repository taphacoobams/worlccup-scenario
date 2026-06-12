/** Types partagés — importables côté client sans server-only */
export type TeamQualificationAnalysis = {
  teamId: number;
  teamName: string;
  teamCode: string;
  group: string | null;
  position: number | null;
  points: number | null;
  qualificationPercent: number;
  firstPlacePercent: number;
  roundOf16Percent: number;
};

/** @deprecated Utiliser TeamQualificationAnalysis */
export type SenegalProbabilities = TeamQualificationAnalysis;
