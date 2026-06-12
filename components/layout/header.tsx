"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { CompetitionLogo } from "@/components/layout/competition-logo";
import { useState } from "react";
import { TeamSelector } from "@/components/header/TeamSelector";
import { useTeamContext } from "@/context/team-context";
import { useLocale } from "@/context/locale-context";
import { NAV_ROUTES } from "@/lib/constants";
import { stripLocaleFromPath } from "@/lib/i18n/routing";
import { DEFAULT_FAVORITE_TEAM_ID } from "@/lib/teams-selection";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const pathBase = stripLocaleFromPath(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { selectedTeam } = useTeamContext();
  const { t, href } = useLocale();

  const isSenegalDefault = selectedTeam.id === DEFAULT_FAVORITE_TEAM_ID;
  const scenarioSubtitle = t("header.scenariosFor", { team: selectedTeam.name });

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 lg:px-8">
        <Link
          href={href("/")}
          className="flex items-center gap-2 min-w-0"
          aria-label={t("header.homeAria")}
        >
          <CompetitionLogo
            size={36}
            className="h-9 w-9 shrink-0 rounded-lg"
            priority
          />
          <div className="hidden sm:block min-w-0">
            <span className="font-bold tracking-tight block truncate text-sm lg:text-base text-senegal-green">
              SenegalScenario<span className="text-gold">2026</span>
            </span>
            <span className="text-[10px] text-muted-foreground block truncate">
              <span className="lg:hidden">{scenarioSubtitle}</span>
              <span className="hidden lg:inline">
                {isSenegalDefault ? t("header.senegalFocus") : scenarioSubtitle}
              </span>
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label={t("header.mainNav")}>
          {NAV_ROUTES.slice(0, 8).map((item) => {
            const active = pathBase === item.href;
            return (
              <Link
                key={item.href}
                href={href(item.href)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-senegal-green/20 text-senegal-green"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {t(`navigation.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <TeamSelector />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={t("header.menu")}
            aria-expanded={mobileOpen}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="lg:hidden border-t border-white/10 px-4 py-4 flex flex-col gap-3"
          aria-label={t("header.mobileNav")}
        >
          {NAV_ROUTES.map((item) => (
            <Link
              key={item.href}
              href={href(item.href)}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm",
                pathBase === item.href
                  ? "bg-senegal-green/20 text-senegal-green"
                  : "text-muted-foreground"
              )}
            >
              {t(`navigation.${item.key}`)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
