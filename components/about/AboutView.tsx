"use client";

import { motion } from "framer-motion";
import {
  Database,
  GitBranch,
  Layers,
  Rocket,
  Sparkles,
  Target,
} from "lucide-react";
import { CompetitionLogo } from "@/components/layout/competition-logo";
import { PageHero } from "@/components/ui/page-hero";
import { PremiumCard } from "@/components/ui/premium-card";
import { SectionCard } from "@/components/ui/section-card";
import { worldCupBadge } from "@/lib/ui-classes";
import { COMBINATION_FORMULA, TOTAL_SCENARIOS } from "@/lib/constants";

const TECH = ["Next.js 16", "React 19", "PostgreSQL", "Prisma", "TailwindCSS", "Recharts", "Framer Motion"];

const ROADMAP = [
  { phase: "Phase 1", label: "495 scénarios & explorateur", done: true },
  { phase: "Phase 2", label: "Moteur tournoi & Manager", done: true },
  { phase: "Phase 3", label: "UI premium publique", done: true },
  { phase: "Phase 4", label: "Monte Carlo & analytique avancée", done: false },
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
    <div className="relative">
      <PageHero
        logo={
          <CompetitionLogo
            size={72}
            className="h-16 w-16 rounded-2xl ring-2 ring-primary/20 shadow-xl"
          />
        }
        badge={
          <span className={worldCupBadge}>
            <Sparkles className="h-3.5 w-3.5" />
            Projet open data
          </span>
        }
        title={title}
        subtitle="Exploration des 495 combinaisons de meilleurs troisièmes — Coupe du Monde FIFA 2026"
        size="default"
      />

      <div className="page-container max-w-4xl space-y-8 pb-20 -mt-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <SectionCard title={name} description="Mission & vision">
            <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
              <p>{p1}</p>
              <p>{p2}</p>
              <p>{p3}</p>
            </div>
          </SectionCard>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          <PremiumCard interactive className="p-6">
            <Layers className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2">{TOTAL_SCENARIOS} scénarios</h3>
            <p className="text-sm text-text-secondary">
              Combinaisons FIFA des 12 meilleurs troisièmes ({COMBINATION_FORMULA}) avec
              cartographie complète des tableaux éliminatoires.
            </p>
          </PremiumCard>
          <PremiumCard interactive className="p-6">
            <Target className="h-8 w-8 text-gold mb-4" />
            <h3 className="font-bold text-lg mb-2">Focus équipe</h3>
            <p className="text-sm text-text-secondary">
              Sélectionnez n&apos;importe quelle équipe du tournoi pour filtrer scénarios,
              probabilités et adversaires potentiels en phase finale.
            </p>
          </PremiumCard>
        </div>

        <SectionCard title="Méthodologie" description="Comment les scénarios sont construits">
          <ol className="space-y-4 text-sm text-text-secondary">
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                1
              </span>
              <span>
                Modélisation des 12 groupes et des 8 combinaisons qualificatives de troisièmes
                places selon le règlement FIFA 2026.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                2
              </span>
              <span>
                Génération exhaustive des {TOTAL_SCENARIOS} scénarios avec mapping des
                affrontements 1X vs 3Y.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                3
              </span>
              <span>
                Enrichissement probabiliste via classements en direct, Monte Carlo et
                simulations Monte Carlo paramétrables.
              </span>
            </li>
          </ol>
        </SectionCard>

        <SectionCard title="Technologies" description="Stack technique">
          <div className="flex flex-wrap gap-2">
            {TECH.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-white/5 px-3 py-1.5 text-xs font-medium text-text-secondary"
              >
                {t}
              </span>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Roadmap" description="Évolution du projet">
          <ul className="space-y-3">
            {ROADMAP.map((item) => (
              <li
                key={item.phase}
                className="flex items-center gap-3 rounded-xl border border-border bg-white/[0.02] px-4 py-3"
              >
                {item.done ? (
                  <GitBranch className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <Rocket className="h-4 w-4 text-gold shrink-0" />
                )}
                <div>
                  <p className="text-xs text-text-secondary">{item.phase}</p>
                  <p className="text-sm font-medium">{item.label}</p>
                </div>
                <span
                  className={`ml-auto text-[10px] font-semibold uppercase tracking-wide ${
                    item.done ? "text-primary" : "text-gold"
                  }`}
                >
                  {item.done ? "Live" : "À venir"}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <PremiumCard variant="gradient" className="p-6 flex items-center gap-4">
          <Database className="h-10 w-10 text-secondary shrink-0" />
          <p className="text-sm text-text-secondary">
            Données tournoi synchronisées via PostgreSQL. Le Manager permet la saisie des
            résultats, événements et recalcul automatique des classements et statistiques.
          </p>
        </PremiumCard>
      </div>
    </div>
  );
}
