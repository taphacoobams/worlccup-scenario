import "server-only";

import { isDatabaseEnabled } from "@/lib/database";

export type DatabaseDiagnostic = {
  enabled: boolean;
  host: string | null;
  port: string | null;
  database: string | null;
  user: string | null;
  isLocalhost: boolean;
  maskedUrl: string | null;
  issues: string[];
};

export function diagnoseDatabaseUrl(): DatabaseDiagnostic {
  const url = process.env.DATABASE_URL?.trim();
  const issues: string[] = [];

  if (!url || url === "false") {
    return {
      enabled: false,
      host: null,
      port: null,
      database: null,
      user: null,
      isLocalhost: false,
      maskedUrl: null,
      issues: ["DATABASE_URL non défini — fallback JSON actif"],
    };
  }

  let host: string | null = null;
  let port: string | null = null;
  let database: string | null = null;
  let user: string | null = null;
  let maskedUrl: string | null = null;

  try {
    const parsed = new URL(url);
    host = parsed.hostname;
    port = parsed.port || "5432";
    database = parsed.pathname.replace(/^\//, "") || null;
    user = parsed.username || null;
    if (parsed.password) {
      parsed.password = "****";
    }
    maskedUrl = parsed.toString();
  } catch {
    issues.push("DATABASE_URL invalide (format URL attendu)");
  }

  const isLocalhost =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1";

  if (isLocalhost) {
    issues.push(
      "L'hôte est localhost/127.0.0.1 — inaccessible depuis Vercel. Utilisez l'IP publique du VPS."
    );
  }

  if (process.env.VERCEL && isLocalhost) {
    issues.push("Déploiement Vercel détecté avec une URL locale — erreur 500 attendue sans fallback.");
  }

  return {
    enabled: isDatabaseEnabled(),
    host,
    port,
    database,
    user,
    isLocalhost,
    maskedUrl,
    issues,
  };
}
