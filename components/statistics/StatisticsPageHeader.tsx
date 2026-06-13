"use client";

import { useLocale } from "@/context/locale-context";
import { PageHeader } from "@/components/ui/page-header";

export function StatisticsPageHeader() {
  const { t } = useLocale();

  return (
    <PageHeader title={t("statistics.title")} description={t("statistics.subtitle")} />
  );
}
