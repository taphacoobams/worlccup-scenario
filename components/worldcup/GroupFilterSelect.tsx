"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { TeamFlag } from "@/components/ui/team-flag";
import { ALL_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type GroupTeamFlag = {
  code: string;
  name: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  groupTeamsByLetter: Record<string, GroupTeamFlag[]>;
  groupMatchCount: number;
  className?: string;
};

function GroupFlagsRow({
  teams,
  size = "sm",
}: {
  teams: GroupTeamFlag[];
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "h-3.5 w-5" : "h-4 w-6";
  return (
    <span className="inline-flex items-center gap-0.5 shrink-0">
      {teams.map((team) => (
        <TeamFlag
          key={team.code}
          code={team.code}
          teamName={team.name}
          size="sm"
          className={box}
        />
      ))}
    </span>
  );
}

export function GroupFilterSelect({
  value,
  onChange,
  disabled,
  groupTeamsByLetter,
  groupMatchCount,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const selectedTeams = value !== "all" ? groupTeamsByLetter[value] : undefined;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface-light/50 px-3 py-2 text-sm text-text",
          "focus:outline-none focus:ring-2 focus:ring-primary/40",
          disabled && "cursor-not-allowed opacity-50"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filtrer par groupe"
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {value === "all" ? (
            <span>Tous les groupes ({groupMatchCount} matchs)</span>
          ) : (
            <>
              <GroupFlagsRow teams={selectedTeams ?? []} />
              <span className="truncate font-medium">Groupe {value}</span>
            </>
          )}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-text-secondary transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && !disabled && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-border bg-[#0f172a] py-1 shadow-xl"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === "all"}
              onClick={() => {
                onChange("all");
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center px-3 py-2.5 text-left text-sm hover:bg-white/5",
                value === "all" && "bg-primary/10 text-primary"
              )}
            >
              Tous les groupes ({groupMatchCount} matchs)
            </button>
          </li>
          {ALL_GROUPS.map((g) => {
            const teams = groupTeamsByLetter[g] ?? [];
            return (
              <li key={g}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === g}
                  onClick={() => {
                    onChange(g);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-white/5",
                    value === g && "bg-primary/10 text-primary"
                  )}
                >
                  <GroupFlagsRow teams={teams} size="md" />
                  <span className="font-medium">Groupe {g}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
