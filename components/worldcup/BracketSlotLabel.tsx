import { isBracketSlot } from "@/lib/bracket-slots";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  className?: string;
};

export function BracketSlotLabel({ label, className }: Props) {
  if (!isBracketSlot(label)) {
    return <span className={cn("truncate font-medium text-sm", className)}>{label}</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[2.5rem] px-1.5 py-0.5 rounded",
        "bg-gold/15 text-gold font-mono text-xs font-bold border border-gold/30",
        className
      )}
      title="Créneau du tableau"
    >
      {label}
    </span>
  );
}
