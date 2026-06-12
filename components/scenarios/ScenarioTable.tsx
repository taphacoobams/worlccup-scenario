"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { ScenarioProbabilityBar } from "@/components/scenarios/ScenarioProbabilityBar";
import { useLocale } from "@/context/locale-context";
import type { EnrichedScenario } from "@/lib/scenario-engine/types";
import { GroupBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  data: EnrichedScenario[];
};

export function ScenarioTable({ data }: Props) {
  const { t } = useLocale();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });

  const columns = useMemo<ColumnDef<EnrichedScenario>[]>(
    () => [
      { accessorFn: (r) => r.scenario.id, header: "ID", size: 56 },
      { accessorFn: (r) => r.scenario.fifaNumber, header: "FIFA" },
      {
        id: "prob",
        header: t("scenarios.probability"),
        cell: ({ row }) => (
          <div className="w-36">
            <ScenarioProbabilityBar
              score={row.original.probabilityScore}
              confidence={row.original.confidence}
              compact
            />
          </div>
        ),
      },
      {
        id: "groups",
        header: t("scenarios.qualifiedGroupsLabel"),
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-0.5 max-w-[200px]">
            {row.original.qualifiedThirdGroups.map((g) => (
              <GroupBadge key={g} group={g} />
            ))}
          </div>
        ),
      },
      {
        id: "pts",
        header: t("standings.points"),
        cell: ({ row }) => {
          const snap = row.original.favoriteGroupSnapshot;
          const fav = row.original.favoriteImpact;
          if (!snap || !fav) return "—";
          const teamRow = snap.rows.find((r) => r.teamId === fav.teamId);
          return (
            <span className="tabular-nums font-medium">
              {teamRow?.points ?? 0}
            </span>
          );
        },
      },
      {
        id: "gd",
        header: t("common.goalDifference"),
        cell: ({ row }) => {
          const snap = row.original.favoriteGroupSnapshot;
          const fav = row.original.favoriteImpact;
          if (!snap || !fav) return "—";
          const teamRow = snap.rows.find((r) => r.teamId === fav.teamId);
          const gd = teamRow?.goalDifference ?? 0;
          return (
            <span className="tabular-nums text-xs">
              {gd >= 0 ? "+" : ""}
              {gd}
            </span>
          );
        },
      },
      {
        id: "fav",
        header: t("scenarios.yourTeam"),
        cell: ({ row }) => {
          const imp = row.original.favoriteImpact;
          if (!imp) return "—";
          return (
            <span
              className={cn(
                "text-xs font-medium",
                imp.thirdQualifies ? "text-senegal-green" : "text-red-400"
              )}
            >
              {imp.thirdQualifies
                ? t("scenarios.thirdQualified")
                : t("scenarios.outOfTop8")}
            </span>
          );
        },
      },
      {
        id: "r32",
        header: "R32",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-gold">
            {row.original.favoriteImpact?.roundOf32Opponent ?? "—"}
          </span>
        ),
      },
      {
        id: "favor",
        header: t("scenarios.favorability"),
        cell: ({ row }) =>
          row.original.favoriteImpact
            ? `${Math.round(row.original.favoriteImpact.favorabilityScore)}%`
            : "—",
      },
    ],
    [t]
  );

  // TanStack Table — incompatible avec React Compiler (API non mémoïsable)
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-card border-b border-white/10">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-4 py-3 text-left font-medium text-muted-foreground"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground border-t border-white/10">
        <span>
          {data.length} · {pagination.pageIndex + 1} / {table.getPageCount()}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            {t("common.previous")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            {t("common.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
