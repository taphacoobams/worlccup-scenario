"use client";

import {
  Database,
  GitBranch,
  Layers,
  Rocket,
  Target,
} from "lucide-react";
import { CompetitionLogo } from "@/components/layout/competition-logo";
import { PageHero } from "@/components/ui/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import { worldCupBadge } from "@/lib/ui-classes";
import { COMBINATION_FORMULA, TOTAL_SCENARIOS } from "@/lib/constants";

const TECH = ["Next.js 16", "React 19", "PostgreSQL", "Prisma", "TailwindCSS", "Recharts"];

const ROADMAP = [
  { phase: "Phase 1", label: "495 scénarios & explorateur", done: true },
  { phase: "Phase 2", label: "Moteur tournoi & Manager", done: true },
  { phase: "Phase 3", label: "UI premium publique", done: true },
];

type Props = {
  title: string;
  name: string;
  p1: string;
  p2: string;
  p3: string;
};

export function AboutView({ title, name, p1, p2, p3 }: Props) {
  return (
    <div>
      <PageHero
        logo={
          <CompetitionLogo
            size={48}
            className="h-10 w-10 rounded-lg ring-1 ring-white/10"
          />
        }
        badge={<span className={worldCupBadge}>Projet open data</span>}
        title={title}
        subtitle="Exploration des 495 combinaisons de meilleurs troisièmes — Coupe du Monde FIFA 2026"
      />

      <div className="page-container max-w-4xl space-y-6 pb-12">
        <SectionCard title={name} description="Mission & vision">
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>{p1}</p>
            <p>{p2}</p>
            <p>{p3}</p>
          </div>
        </SectionCard>

        <div className="grid sm:grid-cols-2 gap-3">
          <Card className="border-white/10 bg-white/[0.02]">
            <CardHeader className="pb-2">
              <Layers className="h-5 w-5 text-senegal-green mb-2" />
              <CardTitle className="text-base font-semibold">{TOTAL_SCENARIOS} scénarios</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Combinaisons FIFA des 12 meilleurs troisièmes ({COMBINATION_FORMULA}) avec
              cartographie complète des tableaux éliminatoires.
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.02]">
            <CardHeader className="pb-2">
              <Target className="h-5 w-5 text-gold mb-2" />
              <CardTitle className="text-base font-semibold">Focus équipe</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Sélectionnez n&apos;importe quelle équipe du tournoi pour filtrer scénarios,
              probabilités et adversaires potentiels en phase finale.
            </CardContent>
          </Card>
        </div>

        <SectionCard title="Technologies" description="Stack technique">
          <div className="flex flex-wrap gap-2">
            {TECH.map((t) => (
              <span
                key={t}
                className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Roadmap" description="Évolution du projet">
          <ul className="space-y-2">
            {ROADMAP.map((item) => (
              <li
                key={item.phase}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5"
              >
                {item.done ? (
                  <GitBranch className="h-4 w-4 text-senegal-green shrink-0" />
                ) : (
                  <Rocket className="h-4 w-4 text-gold shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.phase}</p>
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
                <span
                  className={`ml-auto text-[10px] font-semibold uppercase tracking-wide shrink-0 ${
                    item.done ? "text-senegal-green" : "text-gold"
                  }`}
                >
                  {item.done ? "Live" : "À venir"}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <Card className="border-white/10 bg-white/[0.02]">
          <CardContent className="pt-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Database className="h-8 w-8 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              Données tournoi synchronisées via PostgreSQL. Le Manager permet la saisie des
              résultats, événements et recalcul automatique des classements et statistiques.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
