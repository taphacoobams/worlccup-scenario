import Image from "next/image";
import { cn } from "@/lib/utils";

export const COMPETITION_LOGO = "/logo.png";

type CompetitionLogoProps = {
  className?: string;
  size?: number;
  priority?: boolean;
};

export function CompetitionLogo({
  className,
  size = 36,
  priority = false,
}: CompetitionLogoProps) {
  return (
    <Image
      src={COMPETITION_LOGO}
      alt="FIFA World Cup"
      width={size}
      height={size}
      className={cn("object-contain", className)}
      priority={priority}
    />
  );
}
