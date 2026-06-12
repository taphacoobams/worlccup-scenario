"use client";

import Link from "next/link";
import type { SquadPlayer } from "@/types/data";
import { GuardianCredit } from "@/components/ui/guardian-credit";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { teamHref } from "@/lib/team-slug";
import type { LocalTeam } from "@/types/data";

type Props = {
  player: SquadPlayer | null;
  team?: LocalTeam | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PlayerDetailDialog({ player, team, open, onOpenChange }: Props) {
  if (!player) return null;

  const meta = [player.position, player.club].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="items-center text-center sm:items-center sm:text-center">
          <PlayerAvatar
            photo={player.photo}
            className="relative mx-auto h-24 w-24 rounded-full ring-2 ring-white/15 mb-3"
          />
          <DialogTitle className="text-xl">
            {player.number != null && (
              <span className="text-gold font-bold tabular-nums mr-2">#{player.number}</span>
            )}
            {player.name}
          </DialogTitle>
          {team && (
            <Link
              href={teamHref(team)}
              className="text-sm text-senegal-green hover:underline"
              onClick={() => onOpenChange(false)}
            >
              {team.name}
              {team.group ? ` · Groupe ${team.group}` : ""}
            </Link>
          )}
        </DialogHeader>

        <div className="mt-4 space-y-3 text-sm">
          {meta.length > 0 && (
            <p className="text-center text-muted-foreground">{meta.join(" · ")}</p>
          )}
          {player.age != null && (
            <p className="text-center text-muted-foreground">{player.age} ans</p>
          )}
          {player.bio ? (
            <p className="text-muted-foreground leading-relaxed text-left">{player.bio}</p>
          ) : (
            <p className="text-center text-muted-foreground/60 italic text-xs">
              Biographie non disponible.
            </p>
          )}
          {(player.bioCredit || player.imageCredit) && (
            <div className="pt-2 border-t border-white/10 space-y-1">
              {player.bioCredit && <GuardianCredit label="Bio" />}
              {player.imageCredit && <GuardianCredit label="Photo" />}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
