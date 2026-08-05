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
      href: "/dashboard/customer/orders",
      icon: ClipboardList,
    },
    {
      label: "Payments",
      href: "/dashboard/customer/payments",
      icon: CreditCard,
    },
    { label: "Browse gear", href: "/gear", icon: PackageSearch },
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
      href: "/dashboard/provider/gear",
      icon: Boxes,
    },
    {
      label: "Rental orders",
      href: "/dashboard/provider/orders",
      icon: ClipboardList,
    },
    {
      label: "Payments",
      href: "/dashboard/provider/payments",
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
    { label: "Users", href: "/dashboard/admin/users", icon: Users },
    {
      label: "Categories",
      href: "/dashboard/admin/categories",
      icon: Tags,
    },
    { label: "Gear", href: "/dashboard/admin/gear", icon: Boxes },
    {
      label: "Orders",
      href: "/dashboard/admin/orders",
      icon: ClipboardList,
    },
    {
      label: "Payments",
      href: "/dashboard/admin/payments",
      icon: CreditCard,
    },
    { label: "Reviews", href: "/dashboard/admin/reviews", icon: Star },
  ],
};
