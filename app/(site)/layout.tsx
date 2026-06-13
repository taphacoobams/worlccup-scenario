import type { ReactNode } from "react";
import { AppProvidersWrapper } from "@/components/providers/app-providers-wrapper";

/** Données tournoi en PostgreSQL — pas de prérendu massif au build */
export const dynamic = "force-dynamic";
import { ScenariosProviderWrapper } from "@/components/providers/scenarios-provider-wrapper";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

/** Groupe de routes publiques — alias logique `(public)` */
export default function PublicSiteLayout({ children }: { children: ReactNode }) {
  return (
    <ScenariosProviderWrapper>
      <AppProvidersWrapper>
        <Header />
        <main className="flex-1 min-w-0 w-full overflow-x-hidden">{children}</main>
        <Footer />
      </AppProvidersWrapper>
    </ScenariosProviderWrapper>
  );
}
