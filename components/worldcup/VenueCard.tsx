import type { Fixture } from "@/types/worldcup";
import { VenueCardPremium } from "@/components/worldcup/VenueCardPremium";
import { formatFixtureKickoff } from "@/lib/venue-display";
import {
  getVenueMeta,
  googleMapsUrl,
  isOpeningMatch,
  simulateVenueWeather,
} from "@/lib/venue-metadata";

type Props = { fixture: Fixture };

export function VenueCard({ fixture }: Props) {
  const meta = getVenueMeta(fixture.venue.name, fixture.venue.city);
  const { dateLine, timeLine } = formatFixtureKickoff(fixture.date, fixture.timezone);
  const weather = simulateVenueWeather(meta.cityLabel || fixture.venue.city, fixture.date);

  return (
    <VenueCardPremium
      venueName={fixture.venue.name}
      city={meta.cityLabel || fixture.venue.city}
      country={meta.country}
      capacity={meta.capacity}
      date={dateLine}
      kickoffTime={timeLine}
      timezone={fixture.timezone || "UTC"}
      heroGradient={meta.heroGradient}
      weather={weather}
      isOpeningMatch={isOpeningMatch(fixture.id)}
      mapsUrl={googleMapsUrl(meta.mapsQuery || `${fixture.venue.name} ${fixture.venue.city}`)}
    />
  );
}

export { VenueCardPremium } from "@/components/worldcup/VenueCardPremium";
export type { VenueCardPremiumProps } from "@/components/worldcup/VenueCardPremium";
