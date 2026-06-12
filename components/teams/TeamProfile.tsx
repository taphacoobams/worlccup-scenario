import type { LocalTeam } from "@/types/data";
import { GuardianCredit } from "@/components/ui/guardian-credit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getGuardianGuideUrlFromBio,
  hasTeamGuardianGuideFromBio,
} from "@/lib/guardian-guides";

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Présentation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{team.bio}</p>
          </CardContent>
        </Card>
      )}

      {(team.strengths?.trim() || team.weaknesses?.trim()) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {team.strengths?.trim() && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-senegal-green">Forces</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {team.strengths}
                </p>
              </CardContent>
            </Card>
          )}
          {team.weaknesses?.trim() && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-destructive/90">Faiblesses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {team.weaknesses}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {team.playerPick?.trim() && (
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">Joueur clé : </span>
          {team.playerPick}
        </p>
      )}

      {team.contentCredit && (
        <div className="flex flex-col items-end gap-2">
          {hasGuide && (
            <a
              href={guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-senegal-green hover:underline"
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
