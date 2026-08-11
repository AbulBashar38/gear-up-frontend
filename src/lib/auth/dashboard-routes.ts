import type { Role } from "@/lib/types";

// Where each role lands after login and where wrong-role access is bounced to.
// Kept here (free of icon/JSX imports) so Proxy can use it in the Edge runtime.
export const ROLE_HOME: Record<Role, string> = {
  CUSTOMER: "/dashboard/customer",
  PROVIDER: "/dashboard/provider",
  ADMIN: "/dashboard/admin",
};

// Dashboard path prefixes that only some roles may view. Shared registers such
// as /dashboard/orders and /dashboard/payments are intentionally absent: their
// pages resolve the role and scope the data themselves. /dashboard/categories
// is readable by providers because gear forms depend on the taxonomy, but every
// category mutation stays admin-only in the Server Actions and in the backend.
// /dashboard/gear is provider inventory and admin oversight; customers discover
// gear through the public /gear catalog instead.
const ROLE_RESTRICTED_PREFIXES: ReadonlyArray<{
  prefix: string;
  roles: readonly Role[];
}> = [
  { prefix: "/dashboard/customer", roles: ["CUSTOMER"] },
  { prefix: "/dashboard/provider", roles: ["PROVIDER"] },
  { prefix: "/dashboard/admin", roles: ["ADMIN"] },
  { prefix: "/dashboard/users", roles: ["ADMIN"] },
  { prefix: "/dashboard/categories", roles: ["ADMIN", "PROVIDER"] },
  { prefix: "/dashboard/gear", roles: ["ADMIN", "PROVIDER"] },
  { prefix: "/dashboard/admins", roles: ["ADMIN"] },
];

// The roles permitted on a dashboard path, or null when any signed-in role may
// view it. Used for optimistic Proxy redirects; the page-level
// requireDashboardRole(s) guard remains the authoritative check.
export function allowedRolesForPath(pathname: string): readonly Role[] | null {
  const match = ROLE_RESTRICTED_PREFIXES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return match?.roles ?? null;
}
