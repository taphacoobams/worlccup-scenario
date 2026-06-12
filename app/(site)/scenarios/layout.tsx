import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "495 Scénarios — Probabilités intelligentes",
  description:
    "Explorez les 495 scénarios des meilleurs troisièmes Coupe du Monde 2026 avec scores de probabilité, filtres et analyse par équipe.",
};

export default function ScenariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
