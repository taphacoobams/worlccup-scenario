import { cn } from "@/lib/utils";
import { glassPanelStatic } from "@/lib/ui-classes";

type Props = {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
};

export function FilterBar({ children, className, sticky = false }: Props) {
  return (
    <div
      className={cn(glassPanelStatic, "p-4 flex flex-col gap-4 min-w-0 max-w-full", sticky && "sticky top-14 sm:top-16 z-30 bg-background", className)}
    >
      {children}
    </div>
  );
}

export function FilterBarRow({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-wrap items-end gap-3", className)}>{children}</div>
  );
}

export function FilterField({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5 min-w-0 sm:min-w-[140px] flex-1", className)}>
      <label htmlFor={htmlFor} className="text-xs text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
