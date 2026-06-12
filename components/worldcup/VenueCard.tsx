import { MapPin, Clock } from "lucide-react";
import type { Fixture } from "@/types/worldcup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { fixture: Fixture };

export function VenueCard({ fixture }: Props) {
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: fixture.timezone || "UTC",
  }).format(new Date(fixture.date));

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gold" />
          Stade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="font-semibold text-lg">{fixture.venue.name}</p>
        <p className="text-muted-foreground">{fixture.venue.city}</p>
        <div className="flex items-center gap-2 text-muted-foreground pt-2 border-t border-white/10">
          <Clock className="h-4 w-4 text-gold shrink-0" />
          <div>
            <p>{dateLabel}</p>
            <p className="text-xs mt-0.5">Fuseau : {fixture.timezone}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
