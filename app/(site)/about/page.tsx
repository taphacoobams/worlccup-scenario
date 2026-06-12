import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompetitionLogo } from "@/components/layout/competition-logo";
import { getMessages } from "@/lib/i18n/get-messages";

const messages = getMessages();

export const metadata: Metadata = {
  title: messages.about.title,
};

export default function AboutPage() {
  const t = messages.about;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <CompetitionLogo size={48} className="h-12 w-12 rounded-xl shrink-0" />
        <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4 text-sm leading-relaxed">
          <p>{t.p1}</p>
          <p>{t.p2}</p>
          <p>{t.p3}</p>
        </CardContent>
      </Card>
    </div>
  );
}
