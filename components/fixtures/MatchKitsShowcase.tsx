"use client";

import Image from "next/image";
import { useState } from "react";
import { playerKitImageUrl } from "@/lib/match-kits-utils";
import type { PlayerKit } from "@/types/match-kits";

type Props = {
  homeName: string;
  awayName: string;
  homeKit: PlayerKit;
  awayKit: PlayerKit;
};

function KitFigure({ name, kit }: { name: string; kit: PlayerKit }) {
  const composite = playerKitImageUrl(kit);
  const [src, setSrc] = useState(composite);

  return (
    <div className="flex flex-1 flex-col items-center gap-2 min-w-0">
      <div className="relative h-44 w-full max-w-[200px] sm:h-52 sm:max-w-[220px]">
        <Image
          src={src}
          alt={`Maillot joueur — ${name}`}
          fill
          className="object-contain object-bottom"
          sizes="220px"
          onError={() => {
            if (src !== kit.shirt.img) setSrc(kit.shirt.img);
          }}
        />
      </div>
      <p className="text-center text-xs text-muted-foreground capitalize">
        {kit.shirt.color}
      </p>
    </div>
  );
}

export function MatchKitsShowcase({ homeName, awayName, homeKit, awayKit }: Props) {
  return (
    <div className="border-t border-white/10 pt-6 mt-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center mb-5">
        Tenues joueurs
      </p>
      <div className="flex items-end justify-center gap-4 sm:gap-10">
        <KitFigure name={homeName} kit={homeKit} />
        <span className="pb-16 text-sm text-muted-foreground shrink-0">vs</span>
        <KitFigure name={awayName} kit={awayKit} />
      </div>
    </div>
  );
}
