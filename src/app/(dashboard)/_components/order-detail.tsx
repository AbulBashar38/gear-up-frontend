import Link from "next/link";
import { ArrowLeft, CalendarRange, Package, Store, User } from "lucide-react";
import type { RentalOrder, Review, Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { OrderReference } from "@/components/shared/order-reference";
import {
  formatDashboardDate,
  formatDashboardMoney,
} from "../_utils/dashboard-format";
import { OrderStatusActions } from "./order-status-actions";
import { PayNowButton } from "./pay-now-button";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "./dashboard-status-badge";
import { OrderReviewCard } from "./order-review-card";

/** Inclusive rental days — the backend charges same-day rentals as one day. */
function inclusiveRentalDays(startDate: string, endDate: string) {
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);
  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  const dayMs = 24 * 60 * 60 * 1000;
  return Math.floor((end - start) / dayMs) + 1;
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
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

export function OrderDetail({
  order,
  role,
  existingReview,
  reviewLookupMessage,
}: {
  order: RentalOrder;
  role: Role;
  existingReview?: Review | null;
  reviewLookupMessage?: string;
}) {
  const rentalDays = inclusiveRentalDays(order.startDate, order.endDate);
  const showParties = role === "PROVIDER" || role === "ADMIN";
  const paymentStatus = order.payment?.status ?? "PENDING";
  const canPay =
    role === "CUSTOMER" &&
    order.status === "CONFIRMED" &&
    paymentStatus === "PENDING";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-14">
      <div>
        <Button asChild variant="ghost" size="compact" className="-ml-2">
          <Link href="/dashboard/orders">
            <ArrowLeft aria-hidden="true" />
            Back to orders
          </Link>
        </Button>
      </div>

      <header className="border border-ink/15 bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {order.payment && <PaymentStatusBadge status={order.payment.status} />}
        </div>
        <OrderReference orderId={order.id} className="mt-4 max-w-2xl" />
        <h1 className="mt-4 font-display text-3xl font-black uppercase leading-tight sm:text-4xl">
          <Link
            href={`/gear/${order.gearItemId}`}
            className="underline-offset-4 hover:underline"
          >
            {order.gearItem.name}
          </Link>
        </h1>
        <p className="mt-2 text-xs text-ink/55">
          Placed {formatDashboardDate(order.createdAt)} · Updated{" "}
          {formatDashboardDate(order.updatedAt)}
        </p>

        <div className="mt-6 space-y-4 border-t border-ink/12 pt-6">
          {canPay && (
            <div className="flex flex-col gap-3 border border-primary/25 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-ink/80">
                This order is confirmed and ready for payment.
              </p>
              <PayNowButton orderId={order.id} totalPrice={order.totalPrice} />
            </div>
          )}
          <OrderStatusActions order={order} role={role} />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <DetailCard title="Rental period" icon={CalendarRange}>
          <dl className="space-y-2">
            <Row label="Start" value={formatDashboardDate(order.startDate)} />
            <Row label="End" value={formatDashboardDate(order.endDate)} />
            <Row
              label="Rental days"
              value={rentalDays ? `${rentalDays} day${rentalDays === 1 ? "" : "s"}` : "—"}
            />
            <Row label="Quantity" value={order.quantity} />
          </dl>
        </DetailCard>

        <DetailCard title="Pricing" icon={Package}>
          <p className="font-display text-3xl font-black">
            {formatDashboardMoney(order.totalPrice)}
          </p>
          <p className="text-xs text-ink/55">
            Authoritative total calculated by the backend.
          </p>
          <dl className="mt-3 space-y-2 border-t border-ink/12 pt-3">
            <Row
              label="Per day"
              value={formatDashboardMoney(order.gearItem.pricePerDay)}
            />
            {order.gearItem.brand && (
              <Row label="Brand" value={order.gearItem.brand} />
            )}
            <Row label="Category" value={order.gearItem.category.name} />
          </dl>
        </DetailCard>

        <DetailCard title="Provider" icon={Store}>
          <Row label="Name" value={order.gearItem.provider.name} />
          <Row label="Email" value={order.gearItem.provider.email} />
        </DetailCard>

        {showParties ? (
          <DetailCard title="Customer" icon={User}>
            <Row label="Name" value={order.customer.name} />
            <Row label="Email" value={order.customer.email} />
            <Row label="Phone" value={order.customer.phone} />
          </DetailCard>
        ) : (
          <DetailCard title="Payment" icon={Package}>
            {order.payment ? (
              <dl className="space-y-2">
                <Row
                  label="Status"
                  value={<PaymentStatusBadge status={order.payment.status} />}
                />
                <Row
                  label="Amount"
                  value={formatDashboardMoney(order.payment.amount)}
                />
                <Row
                  label="Updated"
                  value={formatDashboardDate(order.payment.updatedAt)}
                />
              </dl>
            ) : (
              <p className="text-xs text-ink/60">
                No payment record yet. Payment opens once the provider confirms
                this order.
              </p>
            )}
          </DetailCard>
        )}
      </div>

      {showParties && (
        <DetailCard title="Payment" icon={Package}>
          {order.payment ? (
            <dl className="grid gap-2 sm:grid-cols-3">
              <Row
                label="Status"
                value={<PaymentStatusBadge status={order.payment.status} />}
              />
              <Row
                label="Amount"
                value={formatDashboardMoney(order.payment.amount)}
              />
              <Row
                label="Updated"
                value={formatDashboardDate(order.payment.updatedAt)}
              />
            </dl>
          ) : (
            <p className="text-xs text-ink/60">
              No payment has been initiated for this order yet.
            </p>
          )}
        </DetailCard>
      )}

      {role === "CUSTOMER" && order.status === "RETURNED" && (
        <OrderReviewCard
          orderId={order.id}
          gearItemId={order.gearItemId}
          gearName={order.gearItem.name}
          existingReview={existingReview}
          lookupMessage={reviewLookupMessage}
        />
      )}
    </div>
  );
}
