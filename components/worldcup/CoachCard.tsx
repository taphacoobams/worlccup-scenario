import type { Coach } from "@/types/worldcup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { coach: Coach };

export function CoachCard({ coach }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sélectionneur</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        {coach.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coach.photo}
            alt={coach.name}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover bg-white/10"
            loading="lazy"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-white/10" />
        )}
        <div>
          <p className="font-semibold text-lg">{coach.name}</p>
          <p className="text-sm text-muted-foreground">{coach.nationality}</p>
          {coach.age != null && (
            <p className="text-xs text-muted-foreground mt-1">{coach.age} ans</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
