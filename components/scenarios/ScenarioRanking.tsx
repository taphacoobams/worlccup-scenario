"use client";

import { ScenarioCard } from "@/components/scenarios/ScenarioCard";
import type { EnrichedScenario } from "@/lib/scenario-engine/types";
import { Trophy } from "lucide-react";

type Props = {
  title: string;
  scenarios: EnrichedScenario[];
  teamName: string;
};

export function ScenarioRanking({ title, scenarios, teamName }: Props) {
  if (scenarios.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-gold" />
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="text-sm text-muted-foreground">— {teamName}</span>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {scenarios.map((item, i) => (
          <ScenarioCard key={item.scenario.id} enriched={item} index={i} />
        ))}
      </div>
    </section>
  );
}
