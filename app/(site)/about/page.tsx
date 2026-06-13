import type { Metadata } from "next";
import { AboutView } from "@/components/about/AboutView";
import { getMessages } from "@/lib/i18n/get-messages";

const messages = getMessages();

export const metadata: Metadata = {
  title: messages.about.title,
  description: "SenegalScenario2026 — mission, méthodologie et technologies.",
};

export default function AboutPage() {
  const t = messages.about;
  return <AboutView title={t.title} name={t.name} p1={t.p1} p2={t.p2} p3={t.p3} />;
}
