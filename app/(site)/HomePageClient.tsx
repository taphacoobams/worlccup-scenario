"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Layers,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { AnimatedCounter } from "@/components/analytics/animated-counter";
import { CompetitionLogo } from "@/components/layout/competition-logo";
import { PageHero } from "@/components/ui/page-hero";
import { StatCard } from "@/components/ui/stat-card";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Card } from "@/components/ui/card";
import { TeamFlag } from "@/components/ui/team-flag";
import { Button } from "@/components/ui/button";
import { RecentResultsSection } from "@/components/worldcup/RecentResultsSection";
import { useTeamContext } from "@/context/team-context";
import { useLocale } from "@/context/locale-context";
import { COMBINATION_FORMULA, TOTAL_SCENARIOS } from "@/lib/constants";
import { teamHref } from "@/lib/team-slug";
import { worldCupBadge } from "@/lib/ui-classes";
import { formatPercent } from "@/lib/utils";
import type { Fixture } from "@/types/worldcup";

type Props = {
  recentFixtures: Fixture[];
};

export function HomePageClient({ recentFixtures }: Props) {
  const { selectedTeam, favoriteGroup, stats } = useTeamContext();
  const { t, href } = useLocale();
  const groupLabel = favoriteGroup ?? "I";
  const withGroupCount = stats.favoriteScenarios;
  const withoutGroupCount = TOTAL_SCENARIOS - withGroupCount;
  const qualProb = (stats.favoriteScenarios / stats.totalScenarios) * 100;

  return (
    <div className="space-y-6">
      <PageHero
        logo={
          <CompetitionLogo
            size={56}
            className="h-12 w-12 rounded-lg ring-1 ring-white/10"
            priority
          />
        }
        badge={<span className={worldCupBadge}>{t("home.badge")}</span>}
        title={
          <>
            {t("home.titleWorldCup")}
            {t("home.titleScenario")}
            <span className="text-gold">{t("home.titleYear")}</span>
          </>
        }
        subtitle={t("home.subtitle", { formula: COMBINATION_FORMULA })}
        ctas={[{ label: t("home.explore"), href: href("/scenarios") }]}
      />

      <section className="page-container pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          <StatCard
            title={t("home.totalScenarios")}
            value={<AnimatedCounter value={TOTAL_SCENARIOS} />}
            subtitle={COMBINATION_FORMULA}
            icon={Layers}
            accent="primary"
          />
          <StatCard
            title={t("home.withGroup", { group: groupLabel })}
            value={<AnimatedCounter value={withGroupCount} />}
            subtitle={t("home.thirdQualifiable", { team: selectedTeam.name })}
            icon={Target}
            accent="gold"
          />
          <StatCard
            title={t("home.withoutGroup", { group: groupLabel })}
            value={<AnimatedCounter value={withoutGroupCount} />}
            subtitle={formatPercent(withoutGroupCount, TOTAL_SCENARIOS)}
            icon={BarChart3}
          />
          <StatCard
            title={t("home.r32Winners")}
            value="8"
            subtitle="1A 1B 1D 1E 1G 1I 1K 1L"
            icon={Trophy}
          />
          <Card className="border-white/10 bg-white/[0.02] p-4 h-full flex flex-col items-center justify-center">
            <ProgressRing
              value={qualProb}
              label={t("common.group")}
              sublabel={t("home.groupProbability", { group: groupLabel })}
              size={88}
            />
          </Card>
        </div>
      </section>

      <RecentResultsSection fixtures={recentFixtures} />

      <section className="page-container pt-0 pb-12">
        <Card className="border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="grid lg:grid-cols-[auto_1fr_auto] gap-5 p-5 sm:p-6 items-center">
            <TeamFlag
              code={selectedTeam.code}
              teamName={selectedTeam.name}
              size="md"
              className="h-14 w-20 sm:h-16 sm:w-24 rounded-lg ring-1 ring-white/10 mx-auto lg:mx-0"
            />
            <div className="text-center lg:text-left min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gold mb-1">
                Focus équipe
              </p>
              <h2 className="text-xl font-bold truncate">{selectedTeam.name}</h2>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-2 text-xs text-muted-foreground">
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
              <Button asChild size="sm">
                <Link
                  href={href(
                    teamHref({ name: selectedTeam.name, code: selectedTeam.code })
                  )}
                >
                  Fiche équipe <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={href("/scenarios")}>
                  <Star className="h-4 w-4" />
                  Scénarios
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
