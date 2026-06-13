import type { Metadata } from "next";
import { PolicyDocumentView } from "@/components/legal/PolicyDocumentView";
import { getMessages } from "@/lib/i18n/get-messages";

const messages = getMessages();

export const metadata: Metadata = {
  title: messages.dmca.title,
  description: messages.dmca.description,
};

export default function DmcaPage() {
  const t = messages.dmca;
  return (
    <PolicyDocumentView
      title={t.title}
      description={t.description}
      sections={t.sections}
      updatedAt={t.updatedAt}
    />
  );
}
