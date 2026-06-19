import Link from "next/link";
import { BracketSlotLabel } from "@/components/worldcup/BracketSlotLabel";
import { TeamFlag } from "@/components/ui/team-flag";
import { isBracketSlot } from "@/lib/bracket-slots";
import { teamHref } from "@/lib/team-slug";
import { cn } from "@/lib/utils";
import type { Team } from "@/types/worldcup";

type Props = {
  team: Team;
  /** Lien vers la fiche équipe (/teams/[slug]) */
  linkToTeam?: boolean;
  /** Layout horizontal avec nom à côté du drapeau (home: gauche, away: droite) */
  horizontal?: boolean;
  /** Position du nom par rapport au drapeau (horizontal uniquement) */
  side?: "home" | "away";
};

export function FixtureTeamColumn({ team, linkToTeam = false, horizontal = false, side }: Props) {
  if (isBracketSlot(team.name)) {
    return (
      <div className="flex flex-1 justify-center min-w-0">
        <BracketSlotLabel label={team.name} />
      </div>
    );
  }

  const inner = horizontal ? (
    <>
      {side === "home" && (
        <span className="text-base font-semibold leading-tight">{team.name}</span>
      )}
      <TeamFlag
        code={team.code}
        teamName={team.name}
        size="md"
        className="h-10 w-14 rounded-lg"
      />
      {side === "away" && (
        <span className="text-base font-semibold leading-tight">{team.name}</span>
      )}
      {team.fifaRanking != null && (
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          FIFA #{team.fifaRanking}
        </span>
      )}
    </>
  ) : (
    <>
      <TeamFlag
        code={team.code}
        teamName={team.name}
        size="md"
        className="h-10 w-14 rounded-lg"
      />
      <span className="text-base font-semibold leading-tight">{team.name}</span>
      {team.fifaRanking != null && (
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          FIFA #{team.fifaRanking}
        </span>
      )}
    </>
  );

  const className = horizontal
    ? "flex flex-1 items-center gap-3 min-w-0"
    : "flex flex-1 flex-col items-center gap-2 min-w-0 text-center";

  if (linkToTeam && team.id > 0) {
    return (
      <Link
        href={teamHref(team)}
        className={cn(
          className,
          "rounded-xl px-2 py-1 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-senegal-green/50"
        )}
      >
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
