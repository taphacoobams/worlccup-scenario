"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, User, X } from "lucide-react";
import { CompetitionLogo } from "@/components/layout/competition-logo";
import { GlobalSearch } from "@/components/layout/global-search";
import { useEffect, useState } from "react";
import { TeamSelector } from "@/components/header/TeamSelector";
import { useTeamContext } from "@/context/team-context";
import { useLocale } from "@/context/locale-context";
import { PUBLIC_NAV_ROUTES } from "@/lib/constants";
import { DEFAULT_FAVORITE_TEAM_ID } from "@/lib/teams-selection";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { worldCupBadge } from "@/lib/ui-classes";

const DESKTOP_NAV = PUBLIC_NAV_ROUTES;

export function Header() {
  return <WorldCupHeader />;
}

/** Header minimal — aligné dashboard manager */
export function WorldCupHeader() {
  const pathname = usePathname();
  const pathBase = pathname || "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const { selectedTeam } = useTeamContext();
  const { t, href } = useLocale();

  const isSenegalDefault = selectedTeam.id === DEFAULT_FAVORITE_TEAM_ID;
  const scenarioSubtitle = t("header.scenariosFor", { team: selectedTeam.name });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathBase]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background">
      <div className="mx-auto flex h-14 sm:h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:gap-4 lg:px-8">
        <Link
          href={href("/")}
          className="flex min-w-0 shrink-0 items-center gap-3 group"
          aria-label={t("header.homeAria")}
        >
          <CompetitionLogo
            size={36}
            className="h-9 w-9 shrink-0 rounded-lg ring-1 ring-white/10"
            priority
          />
          <div className="hidden sm:block min-w-0">
            <span className="font-bold tracking-tight block truncate text-sm">
              World Cup Scenario
              <span className="text-gold"> 2026</span>
            </span>
            <span className="text-[10px] text-muted-foreground block truncate">
              {isSenegalDefault ? t("header.defaultFocus") : scenarioSubtitle}
            </span>
          </div>
        </Link>

        <nav
          className="nav-scroll hidden min-w-0 flex-1 items-center justify-center gap-1.5 px-1 xl:flex 2xl:gap-2"
          aria-label={t("header.mainNav")}
        >
          {DESKTOP_NAV.map((item) => {
            const active = pathBase === item.href || pathBase.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-medium transition-colors xl:text-[13px] 2xl:px-3 2xl:text-sm",
                  active
                    ? "bg-senegal-green/20 text-senegal-green"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                {t(`navigation.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3 min-w-0">
          <GlobalSearch />
          <TeamSelector />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex rounded-lg h-9 w-9"
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
            className="xl:hidden rounded-lg h-9 w-9"
            onClick={() => setMobileOpen(true)}
            aria-label={t("header.menu")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Fermer le menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px] xl:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              id="mobile-nav-sidebar"
              role="dialog"
              aria-modal="true"
              aria-label={t("header.mobileNav")}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed top-0 left-0 z-[70] flex h-full w-[min(88vw,320px)] flex-col border-r border-white/10 bg-background shadow-2xl xl:hidden"
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
                <Link
                  href={href("/")}
                  className="flex min-w-0 items-center gap-3"
                  onClick={() => setMobileOpen(false)}
                >
                  <CompetitionLogo
                    size={32}
                    className="h-8 w-8 shrink-0 rounded-lg ring-1 ring-white/10"
                  />
                  <div className="min-w-0">
                    <span className="font-bold tracking-tight block truncate text-sm">
                      World Cup Scenario
                      <span className="text-gold"> 2026</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate">
                      {isSenegalDefault ? t("header.defaultFocus") : scenarioSubtitle}
                    </span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-lg h-9 w-9"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Fermer le menu"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <div className={cn(worldCupBadge, "mb-4 w-fit")}>Coupe du Monde 2026</div>
                <ul className="space-y-1">
                  {PUBLIC_NAV_ROUTES.map((item) => {
                    const active =
                      pathBase === item.href || pathBase.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href}>
                        <Link
                          href={href(item.href)}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "block rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                            active
                              ? "bg-senegal-green/20 text-senegal-green"
                              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                          )}
                        >
                          {t(`navigation.${item.key}`)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="border-t border-white/10 p-4 space-y-3">
                <Link
                  href={href("/about")}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
                >
                  <User className="h-4 w-4" />
                  À propos
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
