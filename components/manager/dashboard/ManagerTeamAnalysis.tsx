"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { TeamFlag } from "@/components/ui/team-flag";
import {
  DEFAULT_FAVORITE_TEAM_ID,
  STORAGE_KEY,
  filterTeams,
  getDefaultFavoriteTeam,
  getSelectableTeamById,
} from "@/lib/teams-selection";
import type { TeamQualificationAnalysis } from "@/lib/tournament-engine/types";
import type { SelectableTeam } from "@/types/team-selection";
import { cn } from "@/lib/utils";

type Props = {
  teams: SelectableTeam[];
  initial: TeamQualificationAnalysis;
};

function readStoredTeamId(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const id = Number(JSON.parse(raw));
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

export function ManagerTeamAnalysis({ teams, initial }: Props) {
  const defaultTeam = useMemo(() => getDefaultFavoriteTeam(teams), [teams]);
  const [teamId, setTeamId] = useState(initial.teamId || defaultTeam.id);
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = getSelectableTeamById(teamId, teams) ?? defaultTeam;
  const filtered = useMemo(() => filterTeams(query, teams), [query, teams]);

  const loadAnalysis = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/manager/team-analysis?teamId=${id}`, {
        credentials: "include",
      });
      const json = (await res.json()) as TeamQualificationAnalysis & {
        error?: string;
      };
      if (res.ok) setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = readStoredTeamId();
    const id = stored ?? DEFAULT_FAVORITE_TEAM_ID;
    if (id !== initial.teamId) {
      setTeamId(id);
      void loadAnalysis(id);
    }
  }, [initial.teamId, loadAnalysis]);

  function pickTeam(id: number) {
    setTeamId(id);
    setOpen(false);
    setQuery("");
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(id));
    } catch {
      /* ignore */
    }
    void loadAnalysis(id);
  }

  return (
    <section className="rounded-xl border border-senegal-green/30 bg-senegal-green/5 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-senegal-green">Analyse équipe</h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm hover:border-senegal-green/40"
          >
            <TeamFlag code={selected.code} teamName={selected.name} size="sm" />
            <span className="font-medium max-w-[140px] truncate">{selected.name}</span>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {open && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40"
                aria-label="Fermer"
                onClick={() => setOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-white/15 bg-[#0a0f0c] shadow-2xl overflow-hidden">
                <div className="p-2 border-b border-white/10">
                  <input
                    type="search"
                    placeholder="Rechercher une équipe…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                    autoFocus
                  />
                </div>
                <ul className="max-h-64 overflow-y-auto py-1">
                  {filtered.map((t) => (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => pickTeam(t.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/10",
                          t.id === teamId && "bg-senegal-green/15"
                        )}
                      >
                        <TeamFlag code={t.code} teamName={t.name} size="sm" />
                        <span className="truncate flex-1">{t.name}</span>
                        {t.group && (
                          <span className="text-[10px] font-mono text-gold">G{t.group}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Groupe {data.group ?? selected.group ?? "—"} · même sélection que le site public
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Position actuelle</p>
          <p className="text-2xl font-bold tabular-nums mt-1">
            {data.position != null ? `${data.position}e` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Points</p>
          <p className="text-2xl font-bold tabular-nums mt-1">
            {data.points ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Probabilité qualification</p>
          <p className="text-2xl font-bold tabular-nums mt-1 text-gold">
            {data.qualificationPercent}%
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Probabilité 1re place</p>
          <p className="text-2xl font-bold tabular-nums mt-1">
            {data.firstPlacePercent}%
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Probabilité huitièmes</p>
          <p className="text-2xl font-bold tabular-nums mt-1">
            {data.roundOf16Percent}%
          </p>
        </div>
      </div>
    </section>
  );
}
