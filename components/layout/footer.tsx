"use client";

import Link from "next/link";
import { useLocale } from "@/context/locale-context";

export function Footer() {
  const { t, href } = useLocale();

  return (
    <footer className="mt-auto border-t border-white/10 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted-foreground">
        <div>
          <p>{t("footer.copyright")}</p>
          <p className="text-xs mt-1 text-senegal-green/80">{t("footer.senegalFirst")}</p>
        </div>
        <div className="flex gap-4">
          <Link href={href("/about")} className="hover:text-foreground transition-colors">
            {t("footer.about")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
