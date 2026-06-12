"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Layers,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { AnimatedCounter } from "@/components/analytics/animated-counter";
import { CompetitionLogo } from "@/components/layout/competition-logo";
import { KpiCard } from "@/components/analytics/kpi-card";
import { TeamFlag } from "@/components/ui/team-flag";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamContext } from "@/context/team-context";
import { useLocale } from "@/context/locale-context";
import { COMBINATION_FORMULA, TOTAL_SCENARIOS } from "@/lib/constants";
import { formatPercent } from "@/lib/utils";

export default function HomePage() {
  const { selectedTeam, favoriteGroup, stats } = useTeamContext();
  const { t, href } = useLocale();
  const groupLabel = favoriteGroup ?? "I";
  const withGroupCount = stats.favoriteScenarios;
  const withoutGroupCount = TOTAL_SCENARIOS - withGroupCount;

  const modules = [
    { href: "/groups", title: t("navigation.groups"), desc: t("home.moduleGroups") },
    { href: "/fixtures", title: t("navigation.fixtures"), desc: t("home.moduleFixtures") },
    {
      href: "/scenarios",
      title: t("home.teamScenarios", { team: selectedTeam.name }),
      desc: t("home.moduleScenarios"),
    },
    { href: "/explorer", title: t("navigation.explorer"), desc: t("home.moduleExplorer") },
    { href: "/analytique", title: t("navigation.analytique"), desc: t("home.moduleAnalytique") },
  ];

  return (
    <div className="hero-gradient">
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <CompetitionLogo
            size={72}
            className="mx-auto mb-6 h-16 w-16 sm:h-20 sm:w-20 rounded-xl"
            priority
          />
          <div className="inline-flex items-center gap-2 rounded-full border border-senegal-green/30 bg-senegal-green/10 px-4 py-1.5 text-sm text-senegal-green mb-6">
            <Sparkles className="h-4 w-4" aria-hidden />
            {t("home.badge")}
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="text-senegal-green">{t("home.titleSenegal")}</span>
            <span className="text-gold">{t("home.titleScenario")}</span>
            {t("home.titleYear")}
          </h1>
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
            {t("home.subtitle", { formula: COMBINATION_FORMULA })}
          </p>
          <p className="text-sm text-muted-foreground mb-8 flex items-center justify-center gap-2 flex-wrap">
            <TeamFlag
              code={selectedTeam.code}
              teamName={selectedTeam.name}
              size="sm"
              className="h-5 w-7 rounded-sm"
            />
            {t("home.activeTeam")} : <strong className="text-foreground">{selectedTeam.name}</strong>
            <span className="text-gold font-mono">
              ({t("common.group")} {groupLabel})
            </span>
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href={href("/explorer")}>
                {t("home.explore")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={href("/scenarios")}>
                {t("home.teamScenarios", { team: selectedTeam.name })}
              </Link>
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          <KpiCard
            title={t("home.totalScenarios")}
            value={<AnimatedCounter value={TOTAL_SCENARIOS} />}
            subtitle={COMBINATION_FORMULA}
            icon={Layers}
            accent="green"
            delay={0.1}
          />
          <KpiCard
            title={t("home.withGroup", { group: groupLabel })}
            value={<AnimatedCounter value={withGroupCount} />}
            subtitle={t("home.thirdQualifiable", { team: selectedTeam.name })}
            icon={Target}
            accent="gold"
            delay={0.2}
          />
          <KpiCard
            title={t("home.withoutGroup", { group: groupLabel })}
            value={<AnimatedCounter value={withoutGroupCount} />}
            subtitle={formatPercent(withoutGroupCount, TOTAL_SCENARIOS)}
            icon={BarChart3}
            delay={0.3}
          />
          <KpiCard
            title={t("home.r32Winners")}
            value="8"
            subtitle="1A 1B 1D 1E 1G 1I 1K 1L"
            icon={Trophy}
            delay={0.4}
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 lg:px-8">
        <h2 className="text-2xl font-bold mb-6 text-center">{t("home.modules")}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m) => (
            <Link key={m.href} href={href(m.href)}>
              <Card className="h-full hover:border-senegal-green/40 transition-all group">
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-senegal-green transition-colors">
                    {m.title}
                  </CardTitle>
                  <CardDescription>{m.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-10">
          {t("home.groupProbability", { group: groupLabel })} :{" "}
          {formatPercent(stats.favoriteScenarios, stats.totalScenarios)}
        </p>
      </section>
    </div>
  );
}
