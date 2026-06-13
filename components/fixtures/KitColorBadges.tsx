import { kitColorBadgeClass, kitColorToFrench } from "@/lib/kit-colors-fr";
import { cn } from "@/lib/utils";

type Props = {
  colors: string[];
  className?: string;
};

export function KitColorBadges({ colors, className }: Props) {
  if (colors.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap justify-center gap-1.5", className)}>
      {colors.map((color) => (
        <span
          key={color}
          className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
            kitColorBadgeClass(color)
          )}
        >
          {kitColorToFrench(color)}
        </span>
      ))}
    </div>
  );
}
