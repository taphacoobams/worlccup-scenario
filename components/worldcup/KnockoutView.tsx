"use client";

import { useState } from "react";
import type { KnockoutRound } from "@/types/worldcup";
import type { EnrichedTableauRound } from "@/lib/worldcup-data";
import { KnockoutBracket } from "@/components/worldcup/KnockoutBracket";
import { KnockoutBracketTree } from "@/components/worldcup/KnockoutBracketTree";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  rounds: KnockoutRound[];
  tableau: EnrichedTableauRound[];
};

export function KnockoutView({ rounds, tableau }: Props) {
  const [view, setView] = useState<"tree" | "list">("tree");

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={view === "tree" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("tree")}
        >
          Tableau
        </Button>
        <Button
          type="button"
          variant={view === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("list")}
        >
          Liste par tour
        </Button>
      </div>

      {view === "tree" ? (
        <div
          className={cn(
            "rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-4 md:p-6"
          )}
        >
          <KnockoutBracketTree rounds={tableau} />
        </div>
      ) : (
        <KnockoutBracket rounds={rounds} />
      )}
    </div>
  );
}
