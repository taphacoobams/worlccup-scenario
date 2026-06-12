"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Download, Search } from "lucide-react";
import type { Scenario } from "@/types";
import { GroupBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTeamContext } from "@/context/team-context";
import { exportScenarios } from "@/lib/export";
import {
  getFavoriteRoundOf32Opponent,
  getThirdPlayedByWinner,
  scenarioIncludesGroup,
} from "@/lib/scenarios-team";
import { cn } from "@/lib/utils";

type Props = {
  data: Scenario[];
  showFavoriteOnly?: boolean;
};

export function ScenariosTable({ data, showFavoriteOnly }: Props) {
  const { selectedTeam, favoriteGroup } = useTeamContext();
  const group = favoriteGroup ?? "I";
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Scenario>[]>(
    () => [
      { accessorKey: "id", header: "ID", size: 60 },
      { accessorKey: "fifaNumber", header: "FIFA #", size: 70 },
      {
        id: "groups",
        header: "Groupes qualifiés (3es)",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.qualifiedThirdPlaceGroups.map((g) => (
              <GroupBadge key={g} group={g} />
            ))}
          </div>
        ),
      },
      {
        id: "favoriteGroup",
        header: `Groupe ${group}`,
        cell: ({ row }) =>
          scenarioIncludesGroup(row.original, group) ? (
            <span className="text-senegal-green font-semibold">✓</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "winnerVsThird",
        header: `1${group} vs`,
        cell: ({ row }) => {
          const m = row.original.mappings.find((x) => x.winner === `1${group}`);
          return m?.opponent ?? "—";
        },
      },
      {
        id: "thirdPlayedBy",
        header: `3${group} →`,
        cell: ({ row }) => (
          <span className="font-mono text-gold text-xs">
            {getThirdPlayedByWinner(row.original, group) ?? "—"}
          </span>
        ),
      },
      {
        id: "r32",
        header: "R32",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px] block">
            {getFavoriteRoundOf32Opponent(row.original, group) ?? "—"}
          </span>
        ),
      },
      {
        id: "mappings",
        header: "Mappings",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground font-mono truncate max-w-[200px] block">
            {row.original.mappings.map((m) => `${m.winner}:${m.opponent}`).join(" ")}
          </span>
        ),
      },
    ],
    [group]
  );

  // TanStack Table — incompatible avec React Compiler (API non mémoïsable)
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 25 } },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
          <input
            type="search"
            placeholder="Rechercher ID, FIFA, groupes…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-senegal-green/50"
            aria-label="Recherche scénarios"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => exportScenarios(data, "csv")}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportScenarios(data, "xlsx")}>
            <Download className="h-4 w-4" /> Excel
          </Button>
          <Button variant="secondary" size="sm" onClick={() => exportScenarios(data, "json")}>
            <Download className="h-4 w-4" /> JSON
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card z-10 border-b border-white/10">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-4 py-3 text-left font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-white/5 hover:bg-white/5 transition-colors",
                    scenarioIncludesGroup(row.original, group) && "bg-senegal-green/5"
                  )}
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
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {table.getFilteredRowModel().rows.length} scénario(s)
          {showFavoriteOnly ? ` — ${selectedTeam.name}` : ""}
        </span>
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
