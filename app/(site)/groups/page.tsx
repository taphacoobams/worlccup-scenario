import { redirect } from "next/navigation";
import { PATHS } from "@/lib/i18n/paths";

export default function GroupsRedirect() {
  redirect(PATHS.groupes);
}
