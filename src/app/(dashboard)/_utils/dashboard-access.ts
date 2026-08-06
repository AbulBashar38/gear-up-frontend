import "server-only";

import { redirect } from "next/navigation";
import type { Role } from "@/lib/types";
import { getCurrentUser } from "@/services/auth";
import { ROLE_DASHBOARD_PATH } from "../_config/dashboard-navigation";

function safeReturnTo(path: string) {
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}

export async function requireDashboardUser(returnTo = "/dashboard") {
  const result = await getCurrentUser();

  if (!result.ok) {
    if (result.error.status === 401 || result.error.status === 403) {
      redirect(`/login?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`);
    }

    throw new Error(result.error.message);
  }

  return result.data;
}

export async function requireDashboardRole(role: Role, returnTo: string) {
  const user = await requireDashboardUser(returnTo);

  if (user.role !== role) {
    redirect(ROLE_DASHBOARD_PATH[user.role]);
  }

  return user;
}

export async function requireDashboardRoles(roles: Role[], returnTo: string) {
  const user = await requireDashboardUser(returnTo);

  if (!roles.includes(user.role)) {
    redirect(ROLE_DASHBOARD_PATH[user.role]);
  }

  return user;
}
