import type { Metadata } from "next";
import { PolicyDocumentView } from "@/components/legal/PolicyDocumentView";
import { getMessages } from "@/lib/i18n/get-messages";

const messages = getMessages();

export const metadata: Metadata = {
  title: messages.legal.title,
  description: messages.legal.description,
};

export default function MentionsLegalesPage() {
  const t = messages.legal;
  return (
    <PolicyDocumentView
      title={t.title}
      description={t.description}
      sections={t.sections}
      updatedAt={t.updatedAt}
    />
  );
}
