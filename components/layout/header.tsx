"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Trophy, User, X } from "lucide-react";
import { CompetitionLogo } from "@/components/layout/competition-logo";
import { GlobalSearch } from "@/components/layout/global-search";
import { useState } from "react";
import { TeamSelector } from "@/components/header/TeamSelector";
import { useTeamContext } from "@/context/team-context";
import { useLocale } from "@/context/locale-context";
import { NAV_ROUTES } from "@/lib/constants";
import { DEFAULT_FAVORITE_TEAM_ID } from "@/lib/teams-selection";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { worldCupBadge } from "@/lib/ui-classes";

const DESKTOP_NAV = NAV_ROUTES.filter(
  (r) => r.key !== "manager" && r.key !== "monteCarlo" && r.key !== "export"
).slice(0, 8);

export function Header() {
  return <WorldCupHeader />;
}

/** Header premium — glassmorphism, recherche globale, badge CDM 2026 */
export function WorldCupHeader() {
  const pathname = usePathname();
  const pathBase = pathname || "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const { selectedTeam } = useTeamContext();
  const { t, href } = useLocale();

  const isSenegalDefault = selectedTeam.id === DEFAULT_FAVORITE_TEAM_ID;
  const scenarioSubtitle = t("header.scenariosFor", { team: selectedTeam.name });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-2 px-4 lg:px-8">
        <Link
          href={href("/")}
          className="flex items-center gap-3 min-w-0 group shrink-0"
          aria-label={t("header.homeAria")}
        >
          <CompetitionLogo
            size={40}
            className="h-10 w-10 shrink-0 rounded-xl ring-1 ring-border group-hover:ring-primary/40 transition-all shadow-lg shadow-primary/5"
            priority
          />
          <div className="hidden sm:block min-w-0">
            <span className="font-bold tracking-tight block truncate text-sm lg:text-base">
              <span className="text-primary">Senegal</span>
              <span className="text-text">Scenario</span>
              <span className="text-gold">2026</span>
            </span>
            <span className="text-[10px] text-text-secondary block truncate">
              {isSenegalDefault ? t("header.senegalFocus") : scenarioSubtitle}
            </span>
          </div>
        </Link>

        <div className={cn(worldCupBadge, "hidden xl:flex shrink-0")}>
          <Trophy className="h-3 w-3" aria-hidden />
          Coupe du Monde 2026
        </div>

        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center max-w-2xl" aria-label={t("header.mainNav")}>
          {DESKTOP_NAV.map((item) => {
            const active = pathBase === item.href || pathBase.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                className={cn(
                  "nav-link relative px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  active ? "nav-link-active bg-primary/10" : "hover:bg-white/5"
                )}
              >
                {t(`navigation.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <GlobalSearch />
          <TeamSelector />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex rounded-xl"
            asChild
            aria-label="À propos"
          >
            <Link href={href("/about")}>
              <User className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-xl"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("header.menu")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border overflow-hidden bg-surface/95 backdrop-blur-xl"
            aria-label={t("header.mobileNav")}
          >
            <div className="px-4 py-4 grid gap-1 max-h-[70vh] overflow-y-auto">
              <div className={cn(worldCupBadge, "mb-2 w-fit")}>
                <Trophy className="h-3 w-3" />
                Coupe du Monde 2026
              </div>
              {NAV_ROUTES.filter((r) => r.key !== "manager").map((item) => (
                <Link
                  key={item.href}
                  href={href(item.href)}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    pathBase === item.href
                      ? "bg-primary/15 text-primary"
                      : "text-text-secondary hover:bg-white/5 hover:text-text"
                  )}
                >
                  {t(`navigation.${item.key}`)}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
