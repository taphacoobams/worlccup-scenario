"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
  Star,
  Table2,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { AnimatedCounter } from "@/components/analytics/animated-counter";
import { CompetitionLogo } from "@/components/layout/competition-logo";
import { PageHero } from "@/components/ui/page-hero";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { PremiumCard } from "@/components/ui/premium-card";
import { TeamFlag } from "@/components/ui/team-flag";
import { Button } from "@/components/ui/button";
import { useTeamContext } from "@/context/team-context";
import { useLocale } from "@/context/locale-context";
import { COMBINATION_FORMULA, TOTAL_SCENARIOS } from "@/lib/constants";
import { formatPercent } from "@/lib/utils";
import { worldCupBadge } from "@/lib/ui-classes";

const MODULE_ICONS: Record<string, typeof Layers> = {
  groups: Target,
  fixtures: Calendar,
  scenarios: Layers,
  explorer: Table2,
  analytique: BarChart3,
};

const QUICK_ACCESS = [
  { href: "/groups", key: "groups", icon: Target, color: "text-primary" },
  { href: "/fixtures", key: "fixtures", icon: Calendar, color: "text-secondary" },
  { href: "/scenarios", key: "scenarios", icon: Layers, color: "text-gold" },
  { href: "/analytique", key: "analytique", icon: BarChart3, color: "text-primary" },
  { href: "/statistics", key: "statistics", icon: Trophy, color: "text-gold" },
  { href: "/teams", key: "teams", icon: Users, color: "text-secondary" },
] as const;

export default function HomePage() {
  const { selectedTeam, favoriteGroup, stats } = useTeamContext();
  const { t, href } = useLocale();
  const groupLabel = favoriteGroup ?? "I";
  const withGroupCount = stats.favoriteScenarios;
  const withoutGroupCount = TOTAL_SCENARIOS - withGroupCount;
  const qualProb = (stats.favoriteScenarios / stats.totalScenarios) * 100;

  return (
    <div className="relative">
      <PageHero
        size="large"
        logo={
          <CompetitionLogo
            size={88}
            className="h-20 w-20 sm:h-22 sm:w-22 rounded-2xl ring-2 ring-primary/25 shadow-2xl shadow-primary/15"
            priority
          />
        }
        badge={
          <span className={worldCupBadge}>
            <Sparkles className="h-3.5 w-3.5" />
            {t("home.badge")}
          </span>
        }
        title={
          <>
            <span className="text-primary">{t("home.titleSenegal")}</span>
            <span className="text-gold">{t("home.titleScenario")}</span>
            {t("home.titleYear")}
          </>
        }
        subtitle={t("home.subtitle", { formula: COMBINATION_FORMULA })}
        ctas={[
          { label: t("home.explore"), href: href("/explorer") },
          {
            label: t("home.teamScenarios", { team: selectedTeam.name }),
            href: href("/scenarios"),
            variant: "outline",
          },
        ]}
      />

      <section className="page-container -mt-6 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard
            title={t("home.totalScenarios")}
            value={<AnimatedCounter value={TOTAL_SCENARIOS} />}
            subtitle={COMBINATION_FORMULA}
            icon={Layers}
            accent="primary"
            delay={0.05}
          />
          <StatCard
            title={t("home.withGroup", { group: groupLabel })}
            value={<AnimatedCounter value={withGroupCount} />}
            subtitle={t("home.thirdQualifiable", { team: selectedTeam.name })}
            icon={Target}
            accent="gold"
            delay={0.1}
          />
          <StatCard
            title={t("home.withoutGroup", { group: groupLabel })}
            value={<AnimatedCounter value={withoutGroupCount} />}
            subtitle={formatPercent(withoutGroupCount, TOTAL_SCENARIOS)}
            icon={BarChart3}
            accent="secondary"
            delay={0.15}
          />
          <StatCard
            title={t("home.r32Winners")}
            value="8"
            subtitle="1A 1B 1D 1E 1G 1I 1K 1L"
            icon={Trophy}
            accent="default"
            delay={0.2}
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <PremiumCard className="p-5 h-full flex flex-col items-center justify-center">
              <ProgressRing
                value={qualProb}
                label={t("common.group")}
                sublabel={t("home.groupProbability", { group: groupLabel })}
                size={100}
              />
            </PremiumCard>
          </motion.div>
        </div>
      </section>

      <section className="page-container pb-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Accès rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACCESS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 + i * 0.04 }}
              >
                <Link href={href(item.href)} className="block group">
                  <PremiumCard interactive className="p-4 text-center h-full">
                    <div
                      className={`mx-auto mb-3 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold block">
                      {t(`navigation.${item.key}`)}
                    </span>
                  </PremiumCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="page-container pb-20">
        <PremiumCard variant="gradient" className="overflow-hidden">
          <div className="grid lg:grid-cols-[auto_1fr_auto] gap-6 p-6 sm:p-8 items-center">
            <TeamFlag
              code={selectedTeam.code}
              teamName={selectedTeam.name}
              size="md"
              className="h-16 w-24 sm:h-20 sm:w-28 rounded-xl shadow-xl mx-auto lg:mx-0"
            />
            <div className="text-center lg:text-left min-w-0">
              <p className="text-xs uppercase tracking-wider text-text-secondary mb-1">
                Focus équipe
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold truncate">{selectedTeam.name}</h2>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-3 text-sm text-text-secondary">
                <span>
                  {t("common.group")}{" "}
                  <strong className="text-gold font-mono">{groupLabel}</strong>
                </span>
                <span>
                  {stats.favoriteScenarios.toLocaleString("fr-FR")} scénarios favorables
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <Button asChild>
                <Link href={href(`/teams/${selectedTeam.id}`)}>
                  Fiche équipe <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={href("/scenarios")}>
                  <Star className="h-4 w-4" />
                  Scénarios
                </Link>
              </Button>
            </div>
          </div>
        </PremiumCard>

        <h2 className="text-xl sm:text-2xl font-bold mt-12 mb-6">{t("home.modules")}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { href: "/groups", key: "groups", desc: t("home.moduleGroups") },
            { href: "/fixtures", key: "fixtures", desc: t("home.moduleFixtures") },
            {
              href: "/scenarios",
              key: "scenarios",
              desc: t("home.moduleScenarios"),
              title: t("home.teamScenarios", { team: selectedTeam.name }),
            },
            { href: "/explorer", key: "explorer", desc: t("home.moduleExplorer") },
            { href: "/analytique", key: "analytique", desc: t("home.moduleAnalytique") },
          ].map((m, i) => {
            const Icon = MODULE_ICONS[m.key] ?? Layers;
            return (
              <motion.div
                key={m.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Link href={href(m.href)} className="block h-full group">
                  <PremiumCard interactive className="h-full p-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-primary/15 p-3 text-primary group-hover:bg-primary/25 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {"title" in m && m.title ? m.title : t(`navigation.${m.key}`)}
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">{m.desc}</p>
                        <span className="inline-flex items-center gap-1 text-xs text-primary mt-4 font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                          Explorer <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </PremiumCard>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
