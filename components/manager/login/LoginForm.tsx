"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setError("Entrez le mot de passe administrateur.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/manager/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Connexion impossible");
        return;
      }
      const next = searchParams.get("next") ?? "/dashboard";
      router.push(next);
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-[420px] border-senegal-green/30 bg-[#0a0f0c]/90 shadow-2xl">
      <CardContent className="pt-8 pb-8 px-6 sm:px-8">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            World Cup 2026
          </p>
          <h1 className="text-2xl font-bold mt-1 text-senegal-green">Manager Console</h1>
          <p className="text-sm text-muted-foreground mt-2">Administration du tournoi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-muted-foreground">
            Mot de passe
            <div className="relative mt-1.5">
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-senegal-green/50"
                placeholder="Mot de passe admin"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                aria-label={show ? "Masquer" : "Afficher"}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connexion…
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
