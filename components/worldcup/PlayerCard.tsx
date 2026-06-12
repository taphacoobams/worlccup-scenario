import Link from "next/link";
import type { Player } from "@/types/worldcup";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = { player: Player; href?: string };

export function PlayerCard({ player, href }: Props) {
  const inner = (
    <Card
      className={cn(
        "h-full transition-all",
        href && "hover:border-senegal-green/40 cursor-pointer"
      )}
    >
      <CardContent className="flex gap-4 pt-6">
        {player.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.photo}
            alt={player.name}
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover bg-white/10 shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-white/10 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="font-semibold truncate">{player.name}</p>
          {player.position && (
            <p className="text-xs text-gold font-medium">{player.position}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {player.nationality}
            {player.age != null && ` · ${player.age} ans`}
          </p>
          {(player.height || player.weight) && (
            <p className="text-xs text-muted-foreground">
              {[player.height, player.weight].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
