import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Contact,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import type { Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderReference } from "@/components/shared/order-reference";
import { DashboardPageHeader } from "../../_components/dashboard-page-header";
import { UserStatusBadge } from "../../_components/dashboard-status-badge";
import { DetailCard } from "../../_components/detail-card";
import { ProfileEditForm } from "../../_components/profile-edit-form";
import { formatDashboardDateTime } from "../../_utils/dashboard-format";
import { requireDashboardUser } from "../../_utils/dashboard-access";

export const metadata: Metadata = {
  title: "Your profile",
  description: "The GearUp account details behind your current session.",
};

const ROLE_SUMMARY: Record<Role, string> = {
  CUSTOMER:
    "You can request rentals, pay for confirmed orders through Stripe, and review gear once an order is returned.",
  PROVIDER:
    "You can publish and maintain gear listings, confirm or cancel incoming requests, and move paid rentals through pickup and return.",
  ADMIN:
    "You can manage users, categories, and every gear listing, and progress or cancel any rental order on the platform.",
};

/** Only registers the signed-in role can actually open. */
function shortcutsFor(role: Role) {
  if (role === "CUSTOMER") {
    return [
      { label: "My orders", href: "/dashboard/orders" },
      { label: "Payments", href: "/dashboard/payments" },
      { label: "Browse gear", href: "/gear" },
    ];
  }

  if (role === "PROVIDER") {
    return [
      { label: "Inventory", href: "/dashboard/gear" },
      { label: "Rental orders", href: "/dashboard/orders" },
      { label: "Reviews", href: "/dashboard/reviews" },
    ];
  }

  return [
    { label: "Users", href: "/dashboard/users" },
    { label: "Categories", href: "/dashboard/categories" },
    { label: "Orders", href: "/dashboard/orders" },
  ];
}

export default async function DashboardProfilePage() {
  const user = await requireDashboardUser("/dashboard/profile");
  const shortcuts = shortcutsFor(user.role);
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="p-5 sm:p-8 lg:p-10 xl:p-14">
      <DashboardPageHeader
        eyebrow="Your session // account"
        title="Profile"
        description="These are the account details GearUp resolves for your session on every protected request."
        actions={
          isAdmin ? (
            <Button asChild size="lg">
              <Link href={`/dashboard/users/${user.id}`}>
                <Pencil aria-hidden="true" />
                Edit your details
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="mt-8 border border-ink/15 bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="rounded-none uppercase">
            {user.role}
          </Badge>
          <UserStatusBadge status={user.status} />
        </div>
        <h2 className="mt-4 font-display text-3xl font-black uppercase leading-tight sm:text-4xl">
          {user.name}
        </h2>
        <p className="mt-2 text-xs text-ink/55">
          Member since {formatDashboardDateTime(user.createdAt)} · Updated{" "}
          {formatDashboardDateTime(user.updatedAt)}
        </p>
        <OrderReference
          orderId={user.id}
          label="User ID"
          className="mt-5 max-w-2xl"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <DetailCard title="Account" icon={Contact}>
          <ProfileEditForm
            key={`${user.name}|${user.phone}`}
            user={user}
          />
        </DetailCard>

        <DetailCard title="What this account can do" icon={ShieldCheck}>
          <p className="leading-6">{ROLE_SUMMARY[user.role]}</p>
          <p className="mt-4 border-t border-ink/12 pt-4 text-xs leading-5 text-ink/55">
            {isAdmin
              ? "You can edit your own name and phone here, and your email from your user record. Your own role and account status stay locked so an admin cannot remove their own access."
              : "You can edit your own name and phone here. Your email, role, and account status are changed by an admin, and GearUp has no password-reset endpoint yet."}
          </p>
        </DetailCard>
      </div>

      <div className="mt-4">
        <DetailCard title="Go to" icon={ClipboardList}>
          <div className="flex flex-wrap gap-2">
            {shortcuts.map(({ label, href }) => (
              <Button key={href} asChild variant="outline" size="compact">
                <Link href={href}>
                  {label}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            ))}
          </div>
        </DetailCard>
      </div>
    </div>
  );
}
