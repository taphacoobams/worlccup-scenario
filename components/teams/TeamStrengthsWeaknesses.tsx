import type { LocalTeam } from "@/types/data";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Check, X } from "lucide-react";

type Props = {
  team: LocalTeam;
};

export function TeamStrengthsWeaknesses({ team }: Props) {
  const strengths = team.strengths?.split('\n').filter(s => s.trim()) || [];
  const weaknesses = team.weaknesses?.split('\n').filter(w => w.trim()) || [];

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <GlassPanel className="p-6 border-green-500/20 bg-green-500/5">
        <h3 className="text-lg font-bold mb-4 text-green-400">Forces</h3>
        {strengths.length > 0 ? (
          <ul className="space-y-2">
            {strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{strength}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic text-sm">Non renseigné</p>
        )}
      </GlassPanel>

      <GlassPanel className="p-6 border-red-500/20 bg-red-500/5">
        <h3 className="text-lg font-bold mb-4 text-red-400">Faiblesses</h3>
        {weaknesses.length > 0 ? (
          <ul className="space-y-2">
            {weaknesses.map((weakness, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <X className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{weakness}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground italic text-sm">Non renseigné</p>
        )}
      </GlassPanel>
    </div>
  );
}
