import { logger } from "@/utils/logger";
import { UserDetail } from "./types";

export function getInitials(user?: UserDetail | null): string {
  const first = user?.first_name?.trim() || "";
  const last = user?.last_name?.trim() || "";

  const f = first.charAt(0).toUpperCase();
  const l = last.charAt(0).toUpperCase();

  if (f || l) return f + l;

  const email = user?.email?.trim() || "";
  if (email) return email.charAt(0).toUpperCase();

  return "??";
}
