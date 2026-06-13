/** URL de base pour les appels API internes (serveur + client). */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
}

export async function fetchApi<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    cache: "no-store",
    ...init,
  });

  if (!res.ok) {
    throw new Error(`API ${path} failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}
