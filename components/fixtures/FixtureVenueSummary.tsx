import { Calendar, Clock, MapPin } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";
import { formatFixtureKickoff, formatVenueCity } from "@/lib/venue-display";

type Props = {
  venueName: string;
  city: string;
  dateIso: string;
  timezone?: string;
};

/** Lieu du match — texte seul (sans image stade) */
export function FixtureVenueSummary({ venueName, city, dateIso, timezone = "UTC" }: Props) {
  const { dateLine, timeLine } = formatFixtureKickoff(dateIso, timezone);

  return (
    <SectionCard title="Lieu du match" className="mt-6">
      <div className="grid sm:grid-cols-3 gap-4 text-sm">
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-senegal-green shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Stade</p>
            <p className="font-medium">{venueName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatVenueCity(city)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Calendar className="h-4 w-4 text-gold shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="font-medium">{dateLine}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Coup d&apos;envoi</p>
            <p className="font-medium">{timeLine}</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
