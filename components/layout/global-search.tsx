"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Layers, Search, Target, Trophy, Users, X } from "lucide-react";
import { useTeamContext } from "@/context/team-context";
import { useLocale } from "@/context/locale-context";
import { NAV_ROUTES } from "@/lib/constants";
import { filterTeams } from "@/lib/teams-selection";
import { teamHref } from "@/lib/team-slug";
import { TeamFlag } from "@/components/ui/team-flag";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof Search> = {
  groups: Target,
  fixtures: Calendar,
  teams: Users,
  scenarios: Layers,
  knockout: Trophy,
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const router = useRouter();
  const { selectableTeams } = useTeamContext();
  const { t, href } = useLocale();

  const navItems = useMemo(
    () =>
      NAV_ROUTES.filter((r) => r.key !== "manager").map((r) => ({
        type: "page" as const,
        id: r.href,
        label: t(`navigation.${r.key}`),
        href: href(r.href),
        icon: ICONS[r.key] ?? Search,
      })),
    [t, href]
  );

  const teamItems = useMemo(
    () =>
      filterTeams(query, selectableTeams).slice(0, 8).map((team) => ({
        type: "team" as const,
        id: `team-${team.id}`,
        label: team.name,
        sub: team.group ? `${t("common.group")} ${team.group}` : team.code,
        href: href(teamHref({ name: team.name, code: team.code })),
        code: team.code,
      })),
    [query, selectableTeams, t, href]
  );

  const pageResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return navItems.slice(0, 6);
    return navItems.filter((n) => n.label.toLowerCase().includes(q));
  }, [query, navItems]);

  const results = useMemo(
    () => [...pageResults, ...(query.trim() ? teamItems : [])],
    [pageResults, teamItems, query]
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHighlight(0);
  }, []);

  const go = useCallback(
    (path: string) => {
      close();
      router.push(path);
    },
    [close, router]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[highlight]) {
        e.preventDefault();
        go(results[highlight].href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, highlight, go]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "hidden md:flex items-center gap-2 h-9 px-3 rounded-xl",
          "border border-border bg-white/5 text-text-secondary text-sm",
          "hover:border-primary/30 hover:bg-white/8 hover:text-text transition-all"
        )}
        aria-label="Recherche globale"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="hidden lg:inline">Rechercher…</span>
        <kbd className="hidden lg:inline ml-2 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>

      <ButtonIconMobile onClick={() => setOpen(true)} />

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
              onClick={close}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.18 }}
              className="fixed left-1/2 top-[12vh] z-[201] w-[min(calc(100vw-2rem),32rem)] -translate-x-1/2 rounded-2xl border border-border bg-surface/95 backdrop-blur-2xl premium-shadow overflow-hidden"
              role="dialog"
              aria-label="Recherche"
            >
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Search className="h-4 w-4 text-text-secondary shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlight(0);
                  }}
                  placeholder="Pages, équipes, modules…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-secondary"
                />
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg p-1.5 text-text-secondary hover:bg-white/10"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="max-h-[50vh] overflow-y-auto py-2">
                {results.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-text-secondary">
                    Aucun résultat
                  </li>
                ) : (
                  results.map((item, i) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => go(item.href)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                          i === highlight ? "bg-primary/15 text-primary" : "hover:bg-white/5"
                        )}
                      >
                        {"code" in item ? (
                          <TeamFlag code={item.code} teamName={item.label} size="sm" />
                        ) : (
                          <item.icon className="h-4 w-4 shrink-0 text-text-secondary" />
                        )}
                        <span className="flex-1 min-w-0">
                          <span className="block font-medium truncate">{item.label}</span>
                          {"sub" in item && item.sub && (
                            <span className="text-[10px] text-text-secondary">{item.sub}</span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function ButtonIconMobile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white/5 text-text-secondary hover:border-primary/30"
      aria-label="Recherche"
    >
      <Search className="h-4 w-4" />
    </button>
  );
}

/** Alias design brief */
export { GlobalSearch as WorldCupSearch };
