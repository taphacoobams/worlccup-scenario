import fr from "@/messages/fr.json";

export type Messages = typeof fr;

export function getMessages(): Messages {
  return fr;
}
