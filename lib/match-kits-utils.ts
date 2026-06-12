import type { PlayerKit } from "@/types/match-kits";

export function playerKitImageUrl(kit: PlayerKit): string {
  return kit.shirt.img.replace(/player-shirt\.png$/, "player-kit.png");
}
