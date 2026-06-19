import type { LocalTeam } from "@/types/data";
import { GlassPanel } from "@/components/ui/glass-panel";

type Props = {
  team: LocalTeam;
};

export function TeamPresentation({ team }: Props) {
  return (
    <GlassPanel className="p-6 sm:p-8">
      <h2 className="text-xl font-bold mb-4">Présentation</h2>
      {team.bio ? (
        <p className="text-muted-foreground leading-relaxed">{team.bio}</p>
      ) : (
        <p className="text-muted-foreground italic">Aucune description disponible.</p>
      )}
    </GlassPanel>
  );
}
