"use client";

import { useLocale } from "@/context/locale-context";

export function StatisticsPageHeader() {
  const { t } = useLocale();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">{t("statistics.title")}</h1>
      <p className="text-muted-foreground mt-2">{t("statistics.subtitle")}</p>
    </div>
  );
}
