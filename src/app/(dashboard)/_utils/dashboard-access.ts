import "server-only";

import { redirect } from "next/navigation";
import type { Role } from "@/lib/types";
import { getCurrentUser } from "@/services/auth";
import { ROLE_DASHBOARD_PATH } from "../_config/dashboard-navigation";

function safeReturnTo(path: string) {
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}

function refreshSession(returnTo: string): never {
  redirect(`/auth/refresh?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`);
}

function showServiceUnavailable(returnTo: string): never {
  redirect(
    `/service-unavailable?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`,
  );
}

export async function requireDashboardUser(returnTo = "/dashboard") {
  const result = await getCurrentUser();

  if (!result.ok) {
    if (result.error.status === 401 || result.error.status === 403) {
      refreshSession(returnTo);
    }

    // A missing/misconfigured API, network outage, invalid gateway response, or
    // backend 5xx is an expected service interruption. Preserve the session
    // cookies and move outside the protected layout so the failure cannot turn
    // into a dashboard render loop or an uncaught layout exception.
    showServiceUnavailable(returnTo);
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
