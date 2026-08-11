import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Star,
  Tags,
  UserRound,
  Users,
} from "lucide-react";
import type { Role } from "@/lib/types";
import { ROLE_HOME } from "@/lib/auth/dashboard-routes";

export type DashboardNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

// Single source of truth lives in the Edge-safe auth module so Proxy and server
// guards agree on where each role lands.
export const ROLE_DASHBOARD_PATH: Record<Role, string> = ROLE_HOME;

// Every signed-in role resolves the same `/auth/me` record, so the profile
// entry is shared rather than repeated per role.
const PROFILE_ITEM: DashboardNavigationItem = {
  label: "Profile",
  href: "/dashboard/profile",
  icon: UserRound,
};

export const DASHBOARD_NAVIGATION: Record<
  Role,
  DashboardNavigationItem[]
> = {
  CUSTOMER: [
    {
      label: "Overview",
      href: "/dashboard/customer",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "My orders",
      href: "/dashboard/orders",
      icon: ClipboardList,
    },
    {
      label: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
    },
    // No gear entry: customers discover gear through the public `/gear`
    // catalog, which the customer overview links to. `/dashboard/gear` is the
    // provider/admin inventory register.
    PROFILE_ITEM,
  ],
  PROVIDER: [
    {
      label: "Overview",
      href: "/dashboard/provider",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Inventory",
      href: "/dashboard/gear",
      icon: Boxes,
    },
    // Read-only for providers: the register renders the taxonomy without the
    // admin create/rename/delete controls.
    {
      label: "Categories",
      href: "/dashboard/categories",
      icon: Tags,
    },
    {
      label: "Rental orders",
      href: "/dashboard/orders",
      icon: ClipboardList,
    },
    {
      label: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
    },
    // Read-only for providers: feedback on their own listings, scoped per gear
    // item because the reviews API has no provider filter.
    {
      label: "Reviews",
      href: "/dashboard/reviews",
      icon: Star,
    },
    PROFILE_ITEM,
  ],
  ADMIN: [
    {
      label: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    { label: "Users", href: "/dashboard/users", icon: Users },
    {
      label: "Categories",
      href: "/dashboard/categories",
      icon: Tags,
    },
    { label: "Gear", href: "/dashboard/gear", icon: Boxes },
    {
      label: "Orders",
      href: "/dashboard/orders",
      icon: ClipboardList,
    },
    {
      label: "Payments",
      href: "/dashboard/payments",
      icon: CreditCard,
    },
    { label: "Reviews", href: "/dashboard/reviews", icon: Star },
    PROFILE_ITEM,
  ],
};
