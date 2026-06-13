import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LocaleProvider } from "@/context/locale-context";
import { getMessages } from "@/lib/i18n/get-messages";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WorldCupScenario2026 — FIFA World Cup Analytics",
    template: "%s | WorldCupScenario2026",
  },
  description:
    "Plateforme d'analyse des 495 scénarios des meilleurs troisièmes — Coupe du Monde FIFA 2026.",
  keywords: ["FIFA 2026", "World Cup", "Coupe du Monde", "scenarios", "best thirds", "football"],
  authors: [{ name: "WorldCupScenario2026" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "WorldCupScenario2026",
    description: "495 scénarios FIFA 2026 — analyse & simulation",
    type: "website",
    locale: "fr_FR",
    siteName: "WorldCupScenario2026",
    images: [
      {
        url: "/logo.png",
        alt: "FIFA World Cup",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WorldCupScenario2026",
    description: "FIFA 2026 scenario analytics — World Cup",
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#18c964" },
    { media: "(prefers-color-scheme: dark)", color: "#07111f" },
  ],
};

const messages = getMessages();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col antialiased">
        <LocaleProvider messages={messages}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
