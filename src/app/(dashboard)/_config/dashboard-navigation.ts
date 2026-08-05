import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  PackageSearch,
  Star,
  Tags,
  Users,
} from "lucide-react";
import type { Role } from "@/lib/types";

export type DashboardNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const ROLE_DASHBOARD_PATH: Record<Role, string> = {
  CUSTOMER: "/dashboard/customer",
  PROVIDER: "/dashboard/provider",
  ADMIN: "/dashboard/admin",
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
    { label: "Browse gear", href: "/dashboard/gear", icon: PackageSearch },
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
  ],
};
