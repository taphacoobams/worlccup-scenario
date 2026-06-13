"use client";

import Link from "next/link";
import { BarChart3, Calendar, Layers, Shield, Table2 } from "lucide-react";
import { CompetitionLogo } from "@/components/layout/competition-logo";
import { useLocale } from "@/context/locale-context";

const FOOTER_LINKS = [
  { href: "/scenarios", key: "scenarios", icon: Layers },
  { href: "/groups", key: "groups", icon: Shield },
  { href: "/fixtures", key: "fixtures", icon: Calendar },
  { href: "/analytique", key: "analytique", icon: BarChart3 },
  { href: "/explorer", key: "explorer", icon: Table2 },
] as const;

export function Footer() {
  const { t, href } = useLocale();

  return (
    <footer className="mt-auto border-t border-border bg-surface/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <CompetitionLogo size={36} className="h-9 w-9 rounded-lg" />
              <span className="font-bold text-sm">
                <span className="text-primary">Senegal</span>Scenario
                <span className="text-gold">2026</span>
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              {t("footer.senegalFirst")} — 495 scénarios FIFA, analytique &amp; simulation Monte Carlo.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map(({ href: path, key, icon: Icon }) => (
                <li key={path}>
                  <Link
                    href={href(path)}
                    className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {t(`navigation.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-4">
              Plus
            </h3>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li>
                <Link href={href("/monte-carlo")} className="hover:text-primary transition-colors">
                  {t("navigation.monteCarlo")}
                </Link>
              </li>
              <li>
                <Link href={href("/export")} className="hover:text-primary transition-colors">
                  {t("navigation.export")}
                </Link>
              </li>
              <li>
                <Link href={href("/about")} className="hover:text-primary transition-colors">
                  {t("footer.about")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row justify-between gap-3 text-xs text-text-secondary">
          <p>{t("footer.copyright")}</p>
          <p className="text-primary/80">FIFA World Cup 2026 · Fan analytics platform</p>
        </div>
      </div>
    </footer>
  );
}
