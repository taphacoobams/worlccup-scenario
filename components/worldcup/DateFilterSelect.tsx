"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  dates: string[];
  className?: string;
};

/** Clé YYYY-MM-DD sans décalage UTC */
export function fixtureDateKey(iso: string): string {
  const trimmed = iso.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return trimmed.slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (!y || !m || !d) return dateKey;
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
  }).format(new Date(y, m - 1, d));
}

export function DateFilterSelect({ value, onChange, dates, className }: Props) {
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

  const label =
    value === "all" ? "Toutes les dates" : formatDateLabel(value);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-text",
          "focus:outline-none focus:ring-2 focus:ring-senegal-green/40"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filtrer par date"
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-[60] mt-1 max-h-64 w-full min-w-[220px] overflow-auto rounded-lg border border-white/10 bg-background py-1 shadow-xl"
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
                value === "all" && "bg-senegal-green/15 text-senegal-green"
              )}
            >
              Toutes les dates
            </button>
          </li>
          {dates.map((d) => (
            <li key={d}>
              <button
                type="button"
                role="option"
                aria-selected={value === d}
                onClick={() => {
                  onChange(d);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-3 py-2.5 text-left text-sm hover:bg-white/5",
                  value === d && "bg-senegal-green/15 text-senegal-green"
                )}
              >
                {formatDateLabel(d)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
