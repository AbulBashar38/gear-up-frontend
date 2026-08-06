import type { Role } from "@/lib/types";

// Where each role lands after login and where wrong-role access is bounced to.
// Kept here (free of icon/JSX imports) so Proxy can use it in the Edge runtime.
export const ROLE_HOME: Record<Role, string> = {
  CUSTOMER: "/dashboard/customer",
  PROVIDER: "/dashboard/provider",
  ADMIN: "/dashboard/admin",
};

// Dashboard path prefixes that only one role may view. Shared registers such as
// /dashboard/orders, /dashboard/payments, and /dashboard/gear are intentionally
// absent: their pages resolve the role and scope the data themselves.
const ROLE_RESTRICTED_PREFIXES: ReadonlyArray<{ prefix: string; role: Role }> = [
  { prefix: "/dashboard/customer", role: "CUSTOMER" },
  { prefix: "/dashboard/provider", role: "PROVIDER" },
  { prefix: "/dashboard/admin", role: "ADMIN" },
  { prefix: "/dashboard/users", role: "ADMIN" },
  { prefix: "/dashboard/categories", role: "ADMIN" },
  { prefix: "/dashboard/admins", role: "ADMIN" },
];

// The single role permitted on a dashboard path, or null when any signed-in
// role may view it. Used for optimistic Proxy redirects; page-level
// requireDashboardRole remains the authoritative check.
export function requiredRoleForPath(pathname: string): Role | null {
  const match = ROLE_RESTRICTED_PREFIXES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return match?.role ?? null;
}
