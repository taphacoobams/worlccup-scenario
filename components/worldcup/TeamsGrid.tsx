"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Team } from "@/types/worldcup";
import { TeamBadge } from "@/components/worldcup/TeamBadge";
import { teamHref } from "@/lib/team-slug";
import { Card, CardContent } from "@/components/ui/card";

type Props = { teams: Team[] };

export function TeamsGrid({ teams }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return teams;
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.code.toLowerCase().includes(query) ||
        t.country.toLowerCase().includes(query)
    );
  }, [teams, q]);

  return (
    <div className="space-y-6">
      <input
        type="search"
        placeholder="Rechercher une équipe…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-senegal-green/50"
        aria-label="Rechercher une équipe"
      />
      <p className="text-sm text-muted-foreground">
        {filtered.length} équipe{filtered.length !== 1 ? "s" : ""} · 48 nations
      </p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((team) => (
          <Link key={team.id} href={teamHref({ name: team.name, code: team.code })}>
            <Card className="h-full hover:border-senegal-green/40 transition-all">
              <CardContent className="pt-6">
                <TeamBadge team={team} size="lg" />
                <p className="text-xs text-muted-foreground mt-3 font-mono">
                  {team.code}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
