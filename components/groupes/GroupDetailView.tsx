"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GroupTable } from "@/components/worldcup/GroupTable";
import { FixtureCard } from "@/components/worldcup/FixtureCard";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { GROUP_COLORS } from "@/lib/constants";
import { PATHS } from "@/lib/i18n/paths";
import { useLocale } from "@/context/locale-context";
import type { GroupQualificationSummary } from "@/types/qualification";
import type { Fixture, WorldCupGroup } from "@/types/worldcup";
import type { Group } from "@/types";

type Props = {
  letter: Group;
  group: WorldCupGroup;
  summary?: GroupQualificationSummary;
  fixtures: Fixture[];
  highlightCode?: string;
};

export function GroupDetailView({
  letter,
  group,
  summary,
  fixtures,
  highlightCode = "SN",
}: Props) {
  const { href } = useLocale();
  const color = GROUP_COLORS[letter] ?? "#18c964";
  const finished = fixtures.filter(
    (f) => f.status.short === "FT" || f.status.short === "AET" || f.status.short === "PEN"
  );
  const upcoming = fixtures.filter((f) => f.status.short === "NS");

  return (
    <div className="page-container max-w-5xl min-w-0">
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href={href(PATHS.groupes)}>
          <ArrowLeft className="h-4 w-4" /> Tous les groupes
        </Link>
      </Button>

      <header className="mb-8 flex flex-wrap items-center gap-4">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg"
          style={{ backgroundColor: color, boxShadow: `0 4px 24px ${color}40` }}
        >
          {letter}
        </span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Groupe {letter}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Classement actuel · probabilités de qualification · matchs
          </p>
        </div>
      </header>

      <div className="grid gap-8">
        <GroupTable group={group} summary={summary} highlightCode={highlightCode} disableLink />

        {summary && (
          <SectionCard
            title="Probabilité de qualification — projection FIFA"
            description="Fréquence statistique parmi les 495 scénarios — distincte du classement actuel"
          >
            <p className="text-sm text-muted-foreground mb-4">
              P(3e au tableau) :{" "}
              <strong className="text-gold text-lg">{summary.thirdPlaceScenarioRate}%</strong>
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href={href(PATHS.scenarios)}>Explorer tous les scénarios</Link>
            </Button>
          </SectionCard>
        )}

        {finished.length > 0 && (
          <SectionCard title="Résultats" description={`${finished.length} match(s) joué(s)`}>
            <div className="grid gap-3 grid-cols-1">
              {finished.map((f) => (
                <FixtureCard key={f.id} fixture={f} compact allFixtures={fixtures} />
              ))}
            </div>
          </SectionCard>
        )}

        {upcoming.length > 0 && (
          <SectionCard title="Matchs à venir" description={`${upcoming.length} match(s) programmé(s)`}>
            <div className="grid gap-3 grid-cols-1">
              {upcoming.map((f) => (
                <FixtureCard key={f.id} fixture={f} compact allFixtures={fixtures} />
              ))}
            </div>
          </SectionCard>
        )}

        {fixtures.length > 0 && (
          <SectionCard title="Calendrier complet du groupe">
            <div className="grid gap-3 grid-cols-1">
              {fixtures.map((f) => (
                <FixtureCard key={f.id} fixture={f} compact allFixtures={fixtures} />
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
