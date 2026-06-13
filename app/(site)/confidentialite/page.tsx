import type { Metadata } from "next";
import { PolicyDocumentView } from "@/components/legal/PolicyDocumentView";
import { getMessages } from "@/lib/i18n/get-messages";

const messages = getMessages();

export const metadata: Metadata = {
  title: messages.privacy.title,
  description: messages.privacy.description,
};

export default function ConfidentialitePage() {
  const t = messages.privacy;
  return (
    <PolicyDocumentView
      title={t.title}
      description={t.description}
      sections={t.sections}
      updatedAt={t.updatedAt}
    />
  );
}
