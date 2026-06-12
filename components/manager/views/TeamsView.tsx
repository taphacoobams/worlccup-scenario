"use client";

import { getFlagPng } from "@/lib/flags";
import { SaveToolbar } from "@/components/manager/SaveToolbar";
import { useManagerData } from "@/context/manager-data-context";
import { Card, CardContent } from "@/components/ui/card";
import { TeamFlag } from "@/components/ui/team-flag";

export function TeamsView() {
  const { data, loading, patchData } = useManagerData();

  if (loading || !data) {
    return <p className="text-muted-foreground">Chargement des équipes…</p>;
  }

  const teams = [...data.teams].sort((a, b) => a.name.localeCompare(b.name, "fr"));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Teams</h1>
        <p className="text-sm text-muted-foreground mt-1">48 équipes — entraîneur et métadonnées.</p>
      </div>

      <SaveToolbar />

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-muted-foreground">
              <th className="p-3">Flag</th>
              <th className="p-3">Name</th>
              <th className="p-3">Group</th>
              <th className="p-3">Coach</th>
              <th className="p-3">Code</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((t) => {
              const group =
                data.groups.find((g) =>
                  g.standings.some((s) => s.teamId === t.id)
                )?.letter ?? "—";
              return (
                <tr key={t.id} className="border-b border-white/5">
                  <td className="p-3">
                    <TeamFlag code={t.code} teamName={t.name} size="sm" />
                  </td>
                  <td className="p-3 font-medium">{t.name}</td>
                  <td className="p-3 font-mono text-gold">{group}</td>
                  <td className="p-3">
                    <input
                      className="w-full min-w-[140px] rounded border border-white/10 bg-white/5 px-2 py-1 text-xs"
                      value={t.coach?.name ?? ""}
                      onChange={(e) =>
                        patchData({
                          ...data,
                          teams: data.teams.map((x) =>
                            x.id === t.id
                              ? {
                                  ...x,
                                  coach: e.target.value
                                    ? { ...x.coach, name: e.target.value }
                                    : undefined,
                                }
                              : x
                          ),
                        })
                      }
                    />
                  </td>
                  <td className="p-3 font-mono text-muted-foreground">{t.code}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((t) => (
          <Card key={t.id} className="border-white/10">
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getFlagPng(t.code, t.name)}
                  alt=""
                  width={40}
                  height={28}
                  className="h-7 w-10 object-contain rounded-sm"
                />
                <p className="font-semibold">{t.name}</p>
              </div>
              <label className="block text-xs text-muted-foreground">
                Coach
                <input
                  className="mt-1 w-full rounded border border-white/10 bg-white/5 px-2 py-1"
                  value={t.coach?.name ?? ""}
                  onChange={(e) =>
                    patchData({
                      ...data,
                      teams: data.teams.map((x) =>
                        x.id === t.id
                          ? {
                              ...x,
                              coach: e.target.value
                                ? { ...x.coach, name: e.target.value }
                                : undefined,
                            }
                          : x
                      ),
                    })
                  }
                />
              </label>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
