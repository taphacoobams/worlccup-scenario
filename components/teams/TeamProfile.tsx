import type { LocalTeam } from "@/types/data";
import { GuardianCredit } from "@/components/ui/guardian-credit";
import { DataCard, DataCardContent, DataCardHeader, DataCardTitle } from "@/components/ui/data-card";
import {
  getGuardianGuideUrlFromBio,
  hasTeamGuardianGuideFromBio,
} from "@/lib/guardian-guides";
import { Star, TrendingDown, TrendingUp } from "lucide-react";

type Props = {
  team: LocalTeam;
};

export function TeamProfile({ team }: Props) {
  const guideUrl = getGuardianGuideUrlFromBio(team.bio);
  const hasGuide = hasTeamGuardianGuideFromBio(team.bio);

  const hasContent =
    team.bio?.trim() ||
    team.strengths?.trim() ||
    team.weaknesses?.trim() ||
    team.playerPick?.trim();

  if (!hasContent) return null;

  return (
    <section className="mt-8 space-y-4">
      {team.bio?.trim() && (
        <DataCard>
          <DataCardHeader className="pb-2">
            <DataCardTitle className="text-base">Présentation</DataCardTitle>
          </DataCardHeader>
          <DataCardContent>
            <p className="text-sm text-text-secondary leading-relaxed">{team.bio}</p>
          </DataCardContent>
        </DataCard>
      )}

      {(team.strengths?.trim() || team.weaknesses?.trim()) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {team.strengths?.trim() && (
            <DataCard className="border-primary/20">
              <DataCardHeader className="pb-2">
                <DataCardTitle className="text-base flex items-center gap-2 text-primary">
                  <TrendingUp className="h-4 w-4" /> Forces
                </DataCardTitle>
              </DataCardHeader>
              <DataCardContent>
                <p className="text-sm text-text-secondary leading-relaxed">{team.strengths}</p>
              </DataCardContent>
            </DataCard>
          )}
          {team.weaknesses?.trim() && (
            <DataCard className="border-red-500/20">
              <DataCardHeader className="pb-2">
                <DataCardTitle className="text-base flex items-center gap-2 text-red-400">
                  <TrendingDown className="h-4 w-4" /> Faiblesses
                </DataCardTitle>
              </DataCardHeader>
              <DataCardContent>
                <p className="text-sm text-text-secondary leading-relaxed">{team.weaknesses}</p>
              </DataCardContent>
            </DataCard>
          )}
        </div>
      )}

      {team.playerPick?.trim() && (
        <DataCard className="border-gold/25 bg-gold/5">
          <DataCardContent className="pt-6 flex items-start gap-3">
            <Star className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gold">Joueur clé</p>
              <p className="text-sm font-medium mt-1">{team.playerPick}</p>
            </div>
          </DataCardContent>
        </DataCard>
      )}

      {team.contentCredit && (
        <div className="flex flex-col items-end gap-2">
          {hasGuide && (
            <a
              href={guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Guide équipe — The Guardian
            </a>
          )}
          <GuardianCredit label="Analyse équipe" href={guideUrl} className="text-right" />
        </div>
      )}
    </section>
  );
}
