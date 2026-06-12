"use client";

import { useMemo, useState } from "react";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import type { ManualPlayer } from "@/types/worldcup-manual";

type PlayerRow = ManualPlayer & {
  teamName: string;
  club: string | null;
  bio: string | null;
  specialTag: string | null;
};

export function PlayersManagerView({
  initialPlayers,
}: {
  initialPlayers: PlayerRow[];
}) {
  const [players, setPlayers] = useState(initialPlayers);
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [editing, setEditing] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const teams = useMemo(
    () => [...new Set(players.map((p) => p.teamName))].sort(),
    [players]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players.filter((p) => {
      if (teamFilter !== "all" && p.teamName !== teamFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.teamName.toLowerCase().includes(q) ||
        (p.club?.toLowerCase().includes(q) ?? false) ||
        (p.position?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [players, query, teamFilter]);

  async function savePlayer(id: number, patch: Partial<PlayerRow>) {
    setMessage(null);
    const res = await fetch(`/api/manager/players/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    if (!res.ok) {
      setMessage(json.error ?? "Erreur");
      return;
    }
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
    setEditing(null);
    setMessage("Joueur mis à jour.");
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold">Players</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {players.length} joueurs — buts, passes et cartons sont automatiques.
        </p>
      </div>

      {message && <p className="text-sm text-senegal-green">{message}</p>}

      <div className="flex flex-wrap gap-3 text-sm">
        <label className="text-muted-foreground">
          Nom
          <input
            className="ml-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="text-muted-foreground">
          Équipe
          <select
            className="ml-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          >
            <option value="all">Toutes</option>
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
              <th className="p-3">Photo</th>
              <th className="p-3">Nom</th>
              <th className="p-3">Équipe</th>
              <th className="p-3">Position</th>
              <th className="p-3">Club</th>
              <th className="p-3">Bio / Tag</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-white/5 align-top">
                <td className="p-3">
                  <PlayerAvatar photo={p.photo} className="h-10 w-10 rounded-full" />
                </td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-muted-foreground">{p.teamName}</td>
                <td className="p-3">{p.position ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{p.club ?? "—"}</td>
                <td className="p-3 max-w-xs">
                  {editing === p.id ? (
                    <div className="space-y-2">
                      <textarea
                        className="w-full rounded border border-white/10 bg-card px-2 py-1 text-xs"
                        rows={2}
                        defaultValue={p.bio ?? ""}
                        id={`bio-${p.id}`}
                        placeholder="Bio"
                      />
                      <input
                        className="w-full rounded border border-white/10 bg-card px-2 py-1 text-xs"
                        defaultValue={p.specialTag ?? ""}
                        id={`tag-${p.id}`}
                        placeholder="Special tag"
                      />
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs line-clamp-2">
                      {p.bio || p.specialTag || "—"}
                    </span>
                  )}
                </td>
                <td className="p-3">
                  {editing === p.id ? (
                    <button
                      type="button"
                      className="text-xs text-senegal-green hover:underline"
                      onClick={() => {
                        const bio = (
                          document.getElementById(`bio-${p.id}`) as HTMLTextAreaElement
                        ).value;
                        const specialTag = (
                          document.getElementById(`tag-${p.id}`) as HTMLInputElement
                        ).value;
                        void savePlayer(p.id, { bio, specialTag });
                      }}
                    >
                      Sauver
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="text-xs text-gold hover:underline"
                      onClick={() => setEditing(p.id)}
                    >
                      Éditer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
