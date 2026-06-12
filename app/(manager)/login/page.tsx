import { Suspense } from "react";
import { LoginForm } from "@/components/manager/login/LoginForm";

export const dynamic = "force-dynamic";

export default function ManagerLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#050807] via-[#0a1210] to-[#050807]">
      <Suspense fallback={<p className="text-muted-foreground">Chargement…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
