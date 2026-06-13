"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTeamContext } from "@/context/team-context";
import { useLocale } from "@/context/locale-context";
import { TeamFlag } from "@/components/ui/team-flag";
import { teamCountrySubtitle } from "@/lib/team-display";
import { useIsClient } from "@/hooks/use-is-client";
import { filterTeams } from "@/lib/teams-selection";
import type { SelectableTeam } from "@/types/team-selection";
import { cn } from "@/lib/utils";

function teamMetaLine(team: SelectableTeam, groupLabel: string): string {
  const parts: string[] = [];
  if (team.group) parts.push(`${groupLabel} ${team.group}`);
  parts.push(team.code);
  return parts.join(" · ");
}

function TeamOption({
  team,
  active,
  highlighted,
  groupLabel,
  onSelect,
}: {
  team: SelectableTeam;
  active: boolean;
  highlighted: boolean;
  groupLabel: string;
  onSelect: () => void;
}) {
  const subtitle = teamCountrySubtitle(team) ?? teamMetaLine(team, groupLabel);

  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
        active && "bg-senegal-green/15",
        highlighted && !active && "bg-white/10",
        !active && !highlighted && "hover:bg-white/10"
      )}
    >
      <TeamFlag code={team.code} teamName={team.name} size="md" />
      <span className="flex-1 min-w-0">
        <span className="font-medium block truncate">{team.name}</span>
        <span className="text-[10px] text-muted-foreground truncate block">
          {subtitle}
        </span>
      </span>
      {team.group && (
        <span className="text-[10px] font-mono text-gold shrink-0">G{team.group}</span>
      )}
    </button>
  );
}

type PanelLayout = "sheet" | "modal" | "anchored";

function usePanelLayout(open: boolean): PanelLayout {
  const [layout, setLayout] = useState<PanelLayout>("sheet");

  useEffect(() => {
    if (!open) return;
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const mqMd = window.matchMedia("(min-width: 768px)");

    const update = () => {
      if (mqLg.matches) setLayout("anchored");
      else if (mqMd.matches) setLayout("modal");
      else setLayout("sheet");
    };

    update();
    mqLg.addEventListener("change", update);
    mqMd.addEventListener("change", update);
    return () => {
      mqLg.removeEventListener("change", update);
      mqMd.removeEventListener("change", update);
    };
  }, [open]);

  return layout;
}

export function TeamSelector() {
  const { selectedTeam, setSelectedTeamId, selectableTeams } = useTeamContext();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const mounted = useIsClient();
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const panelLayout = usePanelLayout(open);
  const groupLabel = t("common.group");

  const teams = selectableTeams;
  const filtered = useMemo(() => filterTeams(query, teams), [query, teams]);
  const safeHighlightIndex = Math.min(
    highlightIndex,
    Math.max(0, filtered.length - 1)
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHighlightIndex(0);
  }, []);

  const selectTeam = useCallback(
    (team: SelectableTeam) => {
      setSelectedTeamId(team.id);
      close();
    },
    [setSelectedTeamId, close]
  );

  const openDropdown = useCallback(() => {
    setOpen(true);
    setHighlightIndex(0);
  }, []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const update = () => {
      setAnchorRect(triggerRef.current?.getBoundingClientRect() ?? null);
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

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
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && filtered[safeHighlightIndex]) {
        e.preventDefault();
        selectTeam(filtered[safeHighlightIndex]);
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, close, filtered, safeHighlightIndex, selectTeam]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[safeHighlightIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [safeHighlightIndex, open]);

  const panelStyle =
    panelLayout === "anchored" && anchorRect
      ? {
          position: "fixed" as const,
          top: anchorRect.bottom + 8,
          right: Math.max(16, window.innerWidth - anchorRect.right),
          width: 320,
          maxHeight: "min(70dvh, 400px)",
        }
      : undefined;

  const dropdown = mounted ? (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="team-selector-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-[100] bg-black/60 backdrop-blur-[2px]",
              panelLayout === "anchored" && "lg:bg-black/30"
            )}
            aria-hidden
            onClick={close}
          />
          <motion.div
            key="team-selector-panel"
            ref={panelRef}
            initial={{ opacity: 0, y: panelLayout === "sheet" ? 24 : 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: panelLayout === "sheet" ? 24 : 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            aria-label={t("teamSelector.label", { team: selectedTeam.name })}
            onMouseDown={(e) => e.preventDefault()}
            style={panelStyle}
            className={cn(
              "z-[101] flex flex-col overflow-hidden rounded-xl border border-white/20",
              "bg-card shadow-2xl ring-1 ring-black/20",
              panelLayout === "sheet" &&
                "fixed inset-x-3 bottom-3 max-h-[min(75dvh,440px)] pb-[max(0px,env(safe-area-inset-bottom))]",
              panelLayout === "modal" &&
                "fixed left-1/2 top-1/2 w-[min(calc(100vw-2rem),28rem)] -translate-x-1/2 -translate-y-1/2 max-h-[min(80dvh,480px)]",
              panelLayout === "anchored" && "fixed"
            )}
          >
            <div className="flex items-center justify-between gap-2 p-3 border-b border-white/10 shrink-0">
              <p className="text-xs font-semibold text-gold">
                {t("teamSelector.chooseTeam")}
              </p>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground lg:hidden"
                aria-label={t("teamSelector.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-3 pb-2 shrink-0 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={inputRef}
                  type="search"
                  enterKeyHint="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlightIndex(0);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  placeholder={t("teamSelector.search")}
                  className="w-full rounded-lg border border-white/15 bg-background pl-9 pr-3 py-2.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-senegal-green/50"
                  aria-label={t("teamSelector.search")}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {t("teamSelector.hint", { count: `${filtered.length}/${teams.length}` })}
              </p>
            </div>

            <ul
              ref={listRef}
              className="overflow-y-auto flex-1 py-1 overscroll-contain bg-card touch-pan-y"
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                  {t("teamSelector.empty")}
                </li>
              ) : (
                filtered.map((team, index) => (
                  <li key={team.id}>
                    <TeamOption
                      team={team}
                      active={team.id === selectedTeam.id}
                      highlighted={index === safeHighlightIndex}
                      groupLabel={groupLabel}
                      onSelect={() => selectTeam(team)}
                    />
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  ) : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : openDropdown())}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("teamSelector.label", { team: selectedTeam.name })}
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 rounded-xl border border-white/15 bg-white/5 backdrop-blur-md",
          "hover:border-senegal-green/40 hover:bg-white/10 transition-all text-left",
          "h-9 px-2 min-w-0 max-w-[9.5rem]",
          "sm:h-10 sm:px-2.5 sm:min-w-[10rem] sm:max-w-[14rem] md:max-w-[16rem]"
        )}
      >
        <TeamFlag code={selectedTeam.code} teamName={selectedTeam.name} size="sm" />
        <span className="flex-1 min-w-0 flex flex-col leading-tight">
          <span className="font-semibold text-foreground truncate text-xs sm:text-sm">
            {selectedTeam.name}
          </span>
          {selectedTeam.group && (
            <span className="hidden sm:block text-[10px] text-muted-foreground font-mono truncate">
              {groupLabel} {selectedTeam.group}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {dropdown ? createPortal(dropdown, document.body) : null}
    </div>
  );
}
