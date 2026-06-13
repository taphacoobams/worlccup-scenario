"use client";

import { useMemo, useState } from "react";
import type { TeamCardData } from "@/lib/data";
import { TeamCard } from "@/components/teams/TeamCard";
import { SearchInput } from "@/components/ui/search-input";

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
      <SearchInput
        placeholder="Rechercher une équipe ou un groupe…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Rechercher une équipe"
        containerClassName="max-w-md"
      />
      <p className="text-sm text-text-secondary">
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
