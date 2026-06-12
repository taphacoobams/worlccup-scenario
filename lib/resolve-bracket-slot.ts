import { isBracketSlot } from "@/lib/bracket-slots";
import {
  isGroupRankDefinite,
  resolveUniqueQualifiedThirdGroup,
} from "@/lib/group-knockout-lock";
import type { Group } from "@/types";
import type { Team } from "@/types/worldcup";
import type { WorldCupManualData } from "@/types/worldcup-manual";

export type ResolvedParticipant = {
  slot: string;
  team: Team | null;
  /** Ne pas afficher plusieurs drapeaux tant que le créneau n'est pas figé */
  candidates: Team[];
};

export type BracketResolver = {
  resolve: (label: string) => ResolvedParticipant;
};

export function createBracketResolver(
  data: WorldCupManualData,
  teams: Map<number, Team>,
  groupFrequencies: Record<Group, number>
): BracketResolver {
  const fixtureById = new Map(
    data.fixtures.filter((f) => f.id != null).map((f) => [f.id as number, f])
  );

  function teamFromGroupRank(rank: number, letter: string): Team | null {
    if (!isGroupRankDefinite(data, letter, rank as 1 | 2 | 3)) {
      return null;
    }
    const g = data.groups.find(
      (x) => x.letter.toUpperCase() === letter.toUpperCase()
    );
    const row = g?.standings.find((s) => s.position === rank);
    if (!row) return null;
    return teams.get(row.teamId) ?? null;
  }

  function winnerOfMatch(matchId: number, depth = 0): Team | null {
    if (depth > 8) return null;
    const f = fixtureById.get(matchId);
    if (!f?.goals || f.goals.home == null || f.goals.away == null) return null;
    if (f.status !== "FT" && f.status !== "AET" && f.status !== "PEN") return null;
    if (f.goals.home === f.goals.away) return null;

    const homeWins = f.goals.home > f.goals.away;
    const winId = homeWins ? f.homeTeamId : f.awayTeamId;
    if (winId && teams.get(winId)) return teams.get(winId)!;

    const winLabel = homeWins ? f.homeTeam : f.awayTeam;
    if (winLabel && isBracketSlot(winLabel)) {
      return resolveLabel(winLabel, depth + 1).team;
    }
    return null;
  }

  function loserOfMatch(matchId: number, depth = 0): Team | null {
    if (depth > 8) return null;
    const f = fixtureById.get(matchId);
    if (!f?.goals || f.goals.home == null || f.goals.away == null) return null;
    if (f.status !== "FT" && f.status !== "AET" && f.status !== "PEN") return null;
    if (f.goals.home === f.goals.away) return null;

    const homeWins = f.goals.home > f.goals.away;
    const loseId = homeWins ? f.awayTeamId : f.homeTeamId;
    if (loseId && teams.get(loseId)) return teams.get(loseId)!;

    const loseLabel = homeWins ? f.awayTeam : f.homeTeam;
    if (loseLabel && isBracketSlot(loseLabel)) {
      return resolveLabel(loseLabel, depth + 1).team;
    }
    return null;
  }

  function resolveLabel(label: string, depth = 0): ResolvedParticipant {
    const slot = label.replace(/\s+/g, "").trim();
    if (!isBracketSlot(slot)) {
      return { slot: label, team: null, candidates: [] };
    }

    const groupSingle = /^([123])([A-L])$/.exec(slot);
    if (groupSingle) {
      const rank = parseInt(groupSingle[1], 10) as 1 | 2 | 3;
      const letter = groupSingle[2];
      const team = teamFromGroupRank(rank, letter);
      return { slot, team, candidates: team ? [team] : [] };
    }

    const multiThird = /^3([A-L](?:\/[A-L]+)*)$/.exec(slot);
    if (multiThird) {
      const letters = multiThird[1].split("/").filter(Boolean);
      const uniqueGroup = resolveUniqueQualifiedThirdGroup(
        data,
        teams,
        letters,
        groupFrequencies
      );
      if (uniqueGroup) {
        const team = teamFromGroupRank(3, uniqueGroup);
        return { slot, team, candidates: team ? [team] : [] };
      }
      return { slot, team: null, candidates: [] };
    }

    if (/^V\d+$/.test(slot)) {
      const num = parseInt(slot.slice(1), 10);
      const team = winnerOfMatch(num, depth);
      return { slot, team, candidates: team ? [team] : [] };
    }

    if (/^P\d+$/.test(slot)) {
      const num = parseInt(slot.slice(1), 10);
      const team = loserOfMatch(num, depth);
      return { slot, team, candidates: team ? [team] : [] };
    }

    return { slot, team: null, candidates: [] };
  }

  return { resolve: (label) => resolveLabel(label) };
}

/** Équipe affichable (drapeau) à partir d'un créneau ou d'un id */
export function teamFromSlotOrId(
  teamId: number,
  label: string | undefined,
  teams: Map<number, Team>,
  resolver: BracketResolver,
  placeholderId: number
): Team {
  if (teamId && teams.get(teamId)) return teams.get(teamId)!;

  if (label && isBracketSlot(label.replace(/\s+/g, "").trim())) {
    const r = resolver.resolve(label);
    if (r.team) return r.team;
    const name = label.replace(/\s+/g, "").trim();
    return {
      id: placeholderId,
      name,
      code: name,
      country: name,
      logo: "",
    };
  }

  if (label) {
    const r = resolver.resolve(label);
    if (r.team) return r.team;
  }

  const name = label ?? "TBD";
  return {
    id: placeholderId,
    name,
    code: "—",
    country: name,
    logo: "/placeholder-flag.svg",
  };
}
