import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { Group } from "@/types";
import { GROUP_COLORS } from "@/lib/constants";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-white/10 text-foreground",
        senegal: "bg-senegal-green/20 text-senegal-green border border-senegal-green/30",
        gold: "bg-gold/20 text-gold border border-gold/30",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function GroupBadge({ group, className }: { group: Group; className?: string }) {
  const color = GROUP_COLORS[group];
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm",
        className
      )}
      style={{ backgroundColor: color }}
      aria-label={`Groupe ${group}`}
    >
      {group}
    </span>
  );
}
