"use client";

import { useMemo, useState } from "react";
import type { TeamCardData } from "@/lib/data";
import { TeamCard } from "@/components/teams/TeamCard";

type Props = { teams: TeamCardData[] };

export function TeamsPageSearch({ teams }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return teams;
    return teams.filter(
      (t) =>
        t.team.name.toLowerCase().includes(query) ||
        t.team.code.toLowerCase().includes(query) ||
        t.team.country.toLowerCase().includes(query) ||
        (t.team.group != null &&
          (`groupe ${t.team.group}`.toLowerCase().includes(query) ||
            t.team.group.toLowerCase().includes(query)))
    );
  }, [teams, q]);

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Rechercher une équipe ou un groupe…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-senegal-green/50"
        aria-label="Rechercher une équipe"
      />
      <p className="text-sm text-muted-foreground">
        {filtered.length} équipe{filtered.length !== 1 ? "s" : ""}
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((t) => (
          <TeamCard key={t.team.id} team={t.team} playerCount={t.playerCount} />
        ))}
      </div>
    </div>
  );
}
