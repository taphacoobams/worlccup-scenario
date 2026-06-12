import { GUARDIAN_CREDIT, GUARDIAN_CREDIT_URL } from "@/lib/credits";
import { cn } from "@/lib/utils";

type GuardianCreditProps = {
  label?: string;
  /** Guide équipe Guardian ; défaut = page Mondial 2026 */
  href?: string;
  className?: string;
};

export function GuardianCredit({
  label = "Source",
  href = GUARDIAN_CREDIT_URL,
  className,
}: GuardianCreditProps) {
  return (
    <p className={cn("text-[10px] text-muted-foreground/75 italic", className)}>
      {label} :{" "}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground transition-colors"
      >
        {GUARDIAN_CREDIT}
      </a>
    </p>
  );
}
