import type { Team } from "@/types/worldcup";
import type { ResolvedParticipant } from "@/lib/resolve-bracket-slot";
import { BracketSlotLabel } from "@/components/worldcup/BracketSlotLabel";
import { Flag } from "@/components/worldcup/Flag";
import { isBracketSlot } from "@/lib/bracket-slots";
type Props = {
  team?: Team | null;
  slot: string;
  resolved?: ResolvedParticipant;
  size?: "sm" | "md";
  showSlotHint?: boolean;
};

export function BracketParticipant({
  team,
  slot,
  resolved,
  size = "sm",
  showSlotHint = true,
}: Props) {
  const r = resolved ?? { slot, team: team ?? null, candidates: [] };
  const slotNorm = slot.replace(/\s+/g, "").trim();
  const isSlot = isBracketSlot(slotNorm);

  // Créneau poule : n'afficher l'équipe que si la qualification est confirmée
  const displayTeam =
    isSlot && r.team
      ? r.team
      : !isSlot && team?.logo && !isBracketSlot(team.name)
        ? team
        : !isSlot
          ? (team ?? r.team)
          : null;

  if (displayTeam?.logo && !isBracketSlot(displayTeam.name)) {
    return (
      <div className="flex flex-col items-center gap-0.5 min-w-0 max-w-[88px]">
        <Flag
          teamCode={displayTeam.code}
          teamName={displayTeam.name}
          src={displayTeam.logo}
          alt={displayTeam.name}
          size={size}
        />
        <span className="text-[10px] font-medium truncate w-full text-center">
          {displayTeam.name}
        </span>
        {showSlotHint && isSlot && (
          <BracketSlotLabel label={slot} className="text-[9px] px-1 py-0" />
        )}
      </div>
    );
  }

  return <BracketSlotLabel label={slot} />;
}
