"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "@/context/locale-context";
import { PlayerCard } from "@/components/teams/PlayerCard";
import { GuardianCredit } from "@/components/ui/guardian-credit";
import { toSquadPlayer } from "@/lib/data/squad";
import { playerFullName } from "@/lib/player-display";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LocalPlayer, LocalTeam } from "@/types/data";

type Props = {
  players: LocalPlayer[];
  teams: LocalTeam[];
};

export function PlayersGrid({ players, teams }: Props) {
  const { t } = useTranslations("players");
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");

  const teamById = useMemo(
    () => new Map(teams.map((team) => [team.id, team])),
    [teams]
  );

  const positions = useMemo(
    () =>
      [...new Set(players.map((p) => p.position).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "fr")
      ),
    [players]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return players
      .filter((p) => {
        if (teamFilter !== "all" && String(p.teamId) !== teamFilter) return false;
        if (positionFilter !== "all" && p.position !== positionFilter) return false;
        if (!q) return true;
        const team = teamById.get(p.teamId);
        return (
          playerFullName(p).toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.club?.toLowerCase().includes(q) ?? false) ||
          (team?.name.toLowerCase().includes(q) ?? false) ||
          (p.number != null && String(p.number).includes(q))
        );
      })
      .map(toSquadPlayer)
      .sort((a, b) =>
        playerFullName(a).localeCompare(playerFullName(b), "fr", { sensitivity: "base" })
      );
  }, [players, search, teamFilter, positionFilter, teamById]);

  if (players.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12 space-y-4">
        <p>{t("empty")}</p>
        <p className="text-xs max-w-md mx-auto">{t("emptyHint")}</p>
        <Button asChild variant="outline">
          <Link href="/login">Manager</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm sm:max-w-xs w-full"
          )}
        />
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className={cn(
            "h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm sm:w-48"
          )}
          aria-label={t("filterTeam")}
        >
          <option value="all">{t("allTeams")}</option>
          {teams.map((team) => (
            <option key={team.id} value={String(team.id)}>
              {team.name}
            </option>
          ))}
        </select>
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className={cn(
            "h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm sm:w-40"
          )}
          aria-label={t("filterPosition")}
        >
          <option value="all">{t("allPositions")}</option>
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
        <p className="text-sm text-muted-foreground self-center sm:ml-auto">
          {t("count", { count: filtered.length })}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {filtered.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            team={teamById.get(player.teamId)}
          />
        ))}
      </div>

      <GuardianCredit label="Biographies" className="text-center pt-2" />
    </div>
  );
}
