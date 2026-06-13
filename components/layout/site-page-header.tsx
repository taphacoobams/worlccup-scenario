"use client";

import { PageHeader } from "@/components/ui/page-header";

type Props = {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
};

export function SitePageHeader(props: Props) {
  return <PageHeader {...props} />;
}
