/** Classes partagées — site public minimaliste (aligné dashboard manager) */
export const panelBase = "rounded-xl border border-white/10 bg-white/[0.02]";

/** @deprecated Alias — préférer panelBase */
export const glassPanelStatic = panelBase;

export const glassPanel =
  `${panelBase} transition-colors hover:border-white/15 hover:bg-white/[0.03]`;

export const premiumCardHover =
  "transition-colors hover:border-white/15 hover:bg-white/[0.03]";

export const gradientCard = `${panelBase} bg-white/[0.03]`;

export const worldCupBadge =
  "inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-gold";

export const pageTitle = "text-2xl font-bold";
export const pageDescription = "text-sm text-muted-foreground mt-1";
export const tableShell = "overflow-x-auto rounded-xl border border-white/10";
export const inputMinimal =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-senegal-green/40";
