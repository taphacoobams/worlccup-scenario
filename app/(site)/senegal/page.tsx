import { redirect } from "next/navigation";

/** Ancienne route — redirige vers la page scénarios principale */
export default function SenegalRedirectPage() {
  redirect("/scenarios");
}
