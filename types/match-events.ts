/** Événements match — source de vérité pour score et statistiques */

export type MatchEventType =
  | "goal"
  | "assist"
  | "yellow_card"
  | "red_card";

export type MatchEvent = {
  id: string;
  minute: number;
  addedTime?: number;
  type: MatchEventType;
  playerId: string;
  playerName: string;
  teamCode: string;
  linkedGoalId?: string;
  /** CSC : le but est crédité à l'adversaire */
  isOwnGoal?: boolean;
  createdAt: string;
};

/** Ancien format (goal + assistName, Card + detail) */
export type LegacyMatchEvent = {
  id?: string;
  time: { elapsed: number | null; extra: number | null };
  teamId: number;
  playerName: string | null;
  assistName: string | null;
  type: string;
  detail: string;
  createdAt?: string;
};
