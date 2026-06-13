"use client";

import Link from "next/link";
import { useLocale } from "@/context/locale-context";

const FOOTER_LINKS = [
  { href: "/about", labelKey: "footer.about" },
  { href: "/mentions-legales", labelKey: "footer.legal" },
  { href: "/confidentialite", labelKey: "footer.privacy" },
  { href: "/dmca", labelKey: "footer.dmca" },
] as const;

export function Footer() {
  const { t, href } = useLocale();

  return (
    <footer className="mt-auto border-t border-white/10 bg-background">
      <div className="mx-auto max-w-7xl w-full min-w-0 px-4 py-8 text-center">
        <nav
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-text-secondary"
          aria-label="Liens pied de page"
        >
          {FOOTER_LINKS.map((link, index) => (
            <span key={link.href} className="inline-flex items-center gap-2">
              {index > 0 && (
                <span className="text-border select-none" aria-hidden>
                  ·
                </span>
              )}
              <Link href={href(link.href)} className="hover:text-primary transition-colors">
                {t(link.labelKey)}
              </Link>
            </span>
          ))}
        </nav>
        <p className="mt-4 text-xs text-text-secondary">{t("footer.copyright")}</p>
      </div>
    </footer>
  );
}
