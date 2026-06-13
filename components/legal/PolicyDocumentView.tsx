import { SitePageHeader } from "@/components/layout/site-page-header";
import { PremiumCard } from "@/components/ui/premium-card";

export type PolicySection = {
  title: string;
  body: string;
};

type Props = {
  title: string;
  description: string;
  sections: PolicySection[];
  updatedAt?: string;
};

export function PolicyDocumentView({ title, description, sections, updatedAt }: Props) {
  return (
    <div className="page-container max-w-3xl pb-16">
      <SitePageHeader title={title} description={description} />
      <PremiumCard className="p-6 sm:p-8 space-y-8 text-sm text-text-secondary leading-relaxed">
        {updatedAt && (
          <p className="text-xs text-text-secondary/80 border-b border-border pb-4">
            Dernière mise à jour : {updatedAt}
          </p>
        )}
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-semibold text-text mb-2">{section.title}</h2>
            <p className="whitespace-pre-line">{section.body}</p>
          </section>
        ))}
      </PremiumCard>
    </div>
  );
}
