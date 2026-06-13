import { cn } from "@/lib/utils";
import { glassPanelStatic, premiumCardHover } from "@/lib/ui-classes";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export function DataCard({ className, interactive = false, children, ...props }: Props) {
  return (
    <div
      className={cn(glassPanelStatic, interactive && premiumCardHover, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function DataCardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-6 pb-4", className)} {...props} />;
}

export function DataCardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold tracking-tight text-text", className)} {...props} />
  );
}

export function DataCardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-text-secondary", className)} {...props} />;
}

export function DataCardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
