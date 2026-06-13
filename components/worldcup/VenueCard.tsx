import type { Fixture } from "@/types/worldcup";
import { VenueCardPremium } from "@/components/worldcup/VenueCardPremium";
import { formatFixtureKickoff } from "@/lib/venue-display";
import { getVenueMeta } from "@/lib/venue-metadata";
import { resolveVenueImage } from "@/lib/stadium-images";

type Props = { fixture: Fixture };

export function VenueCard({ fixture }: Props) {
  const meta = getVenueMeta(fixture.venue.name, fixture.venue.city);
  const { dateLine, timeLine } = formatFixtureKickoff(fixture.date, fixture.timezone);

  return (
    <VenueCardPremium
      venueName={fixture.venue.name}
      city={meta.cityLabel || fixture.venue.city}
      country={meta.country}
      date={dateLine}
      kickoffTime={timeLine}
      timezone={fixture.timezone || "UTC"}
      image={resolveVenueImage(fixture.venue.name, fixture.venue.image)}
      heroGradient={meta.heroGradient}
    />
  );
}

export { VenueCardPremium } from "@/components/worldcup/VenueCardPremium";
export type { VenueCardPremiumProps } from "@/components/worldcup/VenueCardPremium";
