"use client";

import Image from "next/image";
import type { TeamKitImage } from "@/types/match-kits";
import { KitColorBadges } from "@/components/fixtures/KitColorBadges";

type Props = {
  homeName: string;
  awayName: string;
  homeKit: TeamKitImage;
  awayKit: TeamKitImage;
};

function KitFigure({ name, kit }: { name: string; kit: TeamKitImage }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3 min-w-0">
      <div className="relative h-44 w-full max-w-[200px] sm:h-52 sm:max-w-[220px] bg-transparent">
        <Image
          src={kit.img}
          alt={`Maillot — ${name}`}
          fill
          unoptimized
          className="object-contain object-bottom drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
          sizes="220px"
        />
      </div>
      <KitColorBadges colors={kit.colors} />
    </div>
  );
}

export function MatchKitsShowcase({ homeName, awayName, homeKit, awayKit }: Props) {
  return (
    <div className="pt-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary text-center mb-5">
        Tenues officielles
      </p>
      <div className="flex items-end justify-center gap-4 sm:gap-10">
        <KitFigure name={homeName} kit={homeKit} />
        <span className="pb-16 text-sm text-text-secondary shrink-0">vs</span>
        <KitFigure name={awayName} kit={awayKit} />
      </div>
    </div>
  );
}
