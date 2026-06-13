import { cn } from "@/lib/utils";
import { glassPanelStatic, premiumCardHover, gradientCard } from "@/lib/ui-classes";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  variant?: "glass" | "gradient" | "solid";
};

/** Carte premium — alias PremiumCard du design brief */
export function PremiumCard({
  className,
  interactive = false,
  variant = "glass",
  children,
  ...props
}: Props) {
  return (
    <div
      className={cn(
        variant === "gradient" && gradientCard,
        variant === "glass" && glassPanelStatic,
        variant === "solid" && "rounded-[20px] border border-border bg-card premium-shadow",
        interactive && premiumCardHover,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export const GlassCard = PremiumCard;
export function GradientCard(props: Omit<Props, "variant">) {
  return <PremiumCard variant="gradient" {...props} />;
}
