import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  ClipboardList,
  Contact,
  Package,
  ShieldCheck,
  Star,
} from "lucide-react";
import type { AdminUser, ApiProblem, GearItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderReference } from "@/components/shared/order-reference";
import {
  formatDashboardDateTime,
  formatDashboardMoney,
} from "../_utils/dashboard-format";
import { AdminUserEditForm } from "./admin-user-edit-form";
import { AdminUserStatusForm } from "./admin-user-status-form";
import { DashboardApiFeedback, DashboardEmptyState } from "./dashboard-feedback";
import { UserStatusBadge } from "./dashboard-status-badge";

/**
 * The registers accept one `search` string, and each backend search matches a
 * different set of columns, so a link is only offered where the backend can
 * genuinely resolve it:
 *
 * - `GET /orders` matches `customerId` on an exact UUID and the owning
 *   provider's email on a text search.
 * - `GET /payments` never matches a user UUID; it matches the customer's email
 *   as text.
 * - `GET /reviews` matches `customerId` on an exact UUID.
 *
 * Links that the backend cannot answer are omitted rather than rendered dead.
 */
function relatedRegisters(user: AdminUser) {
  if (user.role === "CUSTOMER") {
    return [
      {
        label: "Rental orders",
        href: `/dashboard/orders?search=${encodeURIComponent(user.id)}`,
        icon: ClipboardList,
      },
      {
        label: "Payments",
        href: `/dashboard/payments?search=${encodeURIComponent(user.email)}`,
        icon: Package,
      },
      {
        label: "Reviews",
        href: `/dashboard/reviews?search=${encodeURIComponent(user.id)}`,
        icon: Star,
      },
    ];
  }

  if (user.role === "PROVIDER") {
    return [
      {
        label: "Orders on their gear",
        href: `/dashboard/orders?search=${encodeURIComponent(user.email)}`,
        icon: ClipboardList,
      },
    ];
  }

  return [];
}

function DetailCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Package;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-ink/15 bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-ink/55">
        <Icon aria-hidden="true" className="size-3.5" />
        {title}
      </h2>
      <div className="mt-4 space-y-2 text-sm text-ink/80">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-xs text-ink/55">{label}</dt>
      <dd className="min-w-0 break-words text-right font-medium text-ink">
        {value}
      </dd>
    </div>
  );
}

function CountTile({
  label,
  value,
  href,
  hint,
}: {
  label: string;
  value: number;
  href?: string;
  hint?: string;
}) {
  return (
    <div className="border border-ink/15 bg-card p-5">
      <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.16em] text-ink/55">
        {label}
      </p>
      <p className="mt-3 font-display text-4xl font-black">{value}</p>
      {hint && <p className="mt-2 text-xs leading-5 text-ink/55">{hint}</p>}
      {href && value > 0 && (
        <Button asChild variant="ghost" size="compact" className="mt-3 -ml-2">
          <Link href={href}>
            Open register
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      )}
    </div>
  );
}

export function UserDetail({
  user,
  currentAdminId,
  providerGear,
  providerGearTotal,
  providerGearProblem,
}: {
  user: AdminUser;
  currentAdminId: string;
  /** Only loaded for provider accounts; `GET /gear` has a real providerId filter. */
  providerGear?: GearItem[];
  providerGearTotal?: number | null;
  providerGearProblem?: ApiProblem;
}) {
  const isProvider = user.role === "PROVIDER";
  const isCustomer = user.role === "CUSTOMER";
  const registers = relatedRegisters(user);
  // Remount the edit form when the saved identity changes so its uncontrolled
  // inputs pick up the refreshed record instead of the pre-edit values.
  const editFormKey = `${user.name}|${user.email}|${user.phone}|${user.role}`;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-14">
      <div>
        <Button asChild variant="ghost" size="compact" className="-ml-2">
          <Link href="/dashboard/users">
            <ArrowLeft aria-hidden="true" />
            Back to users
          </Link>
        </Button>
      </div>

      <header className="border border-ink/15 bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="rounded-none uppercase">
            {user.role}
          </Badge>
          <UserStatusBadge status={user.status} />
        </div>
        <h1 className="mt-4 font-display text-3xl font-black uppercase leading-tight sm:text-4xl">
          {user.name}
        </h1>
        <p className="mt-2 text-xs text-ink/55">
          Joined {formatDashboardDateTime(user.createdAt)} · Updated{" "}
          {formatDashboardDateTime(user.updatedAt)}
        </p>
        <OrderReference
          orderId={user.id}
          label="User ID"
          className="mt-5 max-w-2xl"
        />
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <DetailCard title="Contact" icon={Contact}>
          <AdminUserEditForm
            key={editFormKey}
            user={user}
            currentAdminId={currentAdminId}
          />
        </DetailCard>

        <DetailCard title="Account status" icon={ShieldCheck}>
          <dl className="space-y-2">
            <Row label="Role" value={user.role} />
            <Row
              label="Current status"
              value={<UserStatusBadge status={user.status} />}
            />
          </dl>
          <div className="mt-4 border-t border-ink/12 pt-4">
            <AdminUserStatusForm
              key={`${user.id}:${user.status}`}
              user={user}
              currentAdminId={currentAdminId}
            />
            <p className="mt-3 text-xs leading-5 text-ink/55">
              Inactive and suspended accounts cannot log in, refresh, or reach
              protected endpoints.
            </p>
          </div>
        </DetailCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <CountTile
          label="Gear listings"
          value={user._count.gearItems}
          hint={
            isProvider
              ? "Listings this provider owns."
              : "Only provider accounts own gear."
          }
        />
        <CountTile
          label="Rental orders"
          value={user._count.rentalOrders}
          href={
            isCustomer
              ? `/dashboard/orders?search=${encodeURIComponent(user.id)}`
              : undefined
          }
          hint="Orders placed by this account as a customer."
        />
        <CountTile
          label="Reviews"
          value={user._count.reviews}
          href={
            isCustomer
              ? `/dashboard/reviews?search=${encodeURIComponent(user.id)}`
              : undefined
          }
          hint="Reviews written by this account."
        />
      </div>

      {isProvider && (
        <DetailCard title="Gear listings" icon={Boxes}>
          {providerGearProblem ? (
            <DashboardApiFeedback problems={[providerGearProblem]} />
          ) : providerGear && providerGear.length > 0 ? (
            <>
              <ol className="divide-y divide-ink/12 border border-ink/15">
                {providerGear.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg font-black uppercase">
                        {item.name}
                      </p>
                      <p className="mt-1 truncate text-xs text-ink/60">
                        {item.category.name} · Stock {item.stock} ·{" "}
                        {item.isAvailable && item.stock > 0
                          ? "Available"
                          : "Unavailable"}
                      </p>
                    </div>
                    <p className="font-display text-lg font-black">
                      {formatDashboardMoney(item.pricePerDay)}
                      <span className="ml-1 text-[0.6rem] font-bold uppercase text-ink/55">
                        / day
                      </span>
                    </p>
                  </li>
                ))}
              </ol>
              {typeof providerGearTotal === "number" &&
                providerGearTotal > providerGear.length && (
                  <p className="mt-3 text-xs text-ink/55">
                    Showing {providerGear.length} of {providerGearTotal}{" "}
                    listings.
                  </p>
                )}
            </>
          ) : (
            <DashboardEmptyState
              title="No gear listings"
              description="This provider has not published any gear yet."
            />
          )}
        </DetailCard>
      )}

      {registers.length > 0 && (
        <DetailCard title="Related registers" icon={ClipboardList}>
          <div className="flex flex-wrap gap-2">
            {registers.map(({ label, href, icon: Icon }) => (
              <Button key={href} asChild variant="outline" size="compact">
                <Link href={href}>
                  <Icon aria-hidden="true" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-ink/55">
            Each link hands the register a backend search term, so the records
            are resolved by the API rather than filtered in the browser.
          </p>
        </DetailCard>
      )}
    </div>
  );
}
