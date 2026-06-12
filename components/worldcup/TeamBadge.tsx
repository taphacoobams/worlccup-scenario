import type { Team } from "@/types/worldcup";
import { BracketSlotLabel } from "@/components/worldcup/BracketSlotLabel";
import { TeamFlag } from "@/components/ui/team-flag";
import { isBracketSlot } from "@/lib/bracket-slots";
import { cn } from "@/lib/utils";

type Props = {
  team: Team;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const flagSize = {
  sm: "sm" as const,
  md: "md" as const,
  lg: "md" as const,
};

const flagBox = {
  sm: "h-4 w-6",
  md: "h-5 w-7",
  lg: "h-10 w-14",
};

export function TeamBadge({ team, showName = true, size = "md", className }: Props) {
  const slotOnly = isBracketSlot(team.name);

  return (
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      {slotOnly ? (
        <BracketSlotLabel label={team.name} />
      ) : (
        <TeamFlag
          code={team.code}
          teamName={team.name}
          size={flagSize[size]}
          className={flagBox[size]}
        />
      )}
      {showName && !slotOnly && (
        <span
          className={cn(
            "truncate font-medium",
            size === "sm" && "text-xs",
            size === "lg" && "text-base font-semibold"
          )}
        >
          {team.name}
        </span>
      )}
    </div>
  );
}
