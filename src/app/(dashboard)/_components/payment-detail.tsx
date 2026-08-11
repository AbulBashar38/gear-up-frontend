import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarRange,
  CreditCard,
  Package,
  Receipt,
  Store,
  User,
} from "lucide-react";
import type { Payment, Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { OrderReference } from "@/components/shared/order-reference";
import {
  formatDashboardDate,
  formatDashboardDateTime,
  formatDashboardMoney,
} from "../_utils/dashboard-format";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "./dashboard-status-badge";

const PAYMENT_STATUS_NOTE: Record<Payment["status"], string> = {
  PENDING:
    "Stripe has not confirmed this payment yet. The signed webhook is the only thing that marks it completed.",
  COMPLETED:
    "Stripe confirmed this payment through its signed webhook, which also moved the rental order to paid.",
  FAILED:
    "This payment did not complete. An expired Checkout Session also cancels its rental order.",
};

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

export function PaymentDetail({
  payment,
  role,
}: {
  payment: Payment;
  role: Role;
}) {
  const order = payment.rentalOrder;
  const showCustomer = role === "PROVIDER" || role === "ADMIN";
  const hasStripeReference = Boolean(
    payment.stripeSessionId || payment.stripePaymentIntentId,
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-14">
      <div>
        <Button asChild variant="ghost" size="compact" className="-ml-2">
          <Link href="/dashboard/payments">
            <ArrowLeft aria-hidden="true" />
            Back to payments
          </Link>
        </Button>
      </div>

      <header className="border border-ink/15 bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <PaymentStatusBadge status={payment.status} />
          <OrderStatusBadge status={order.status} />
        </div>
        <h1 className="mt-4 font-display text-3xl font-black uppercase leading-tight sm:text-4xl">
          {formatDashboardMoney(payment.amount)}
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          {order.gearItem.name} · {order.quantity} unit
          {order.quantity === 1 ? "" : "s"}
        </p>
        <p className="mt-4 max-w-2xl border-t border-ink/12 pt-4 text-xs leading-5 text-ink/60">
          {PAYMENT_STATUS_NOTE[payment.status]}
        </p>
        <div className="mt-5">
          <Button asChild variant="outline" size="compact">
            <Link href={`/dashboard/orders/${payment.rentalOrderId}`}>
              View rental order
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <DetailCard title="Payment record" icon={CreditCard}>
          <dl className="space-y-2">
            <Row
              label="Status"
              value={<PaymentStatusBadge status={payment.status} />}
            />
            <Row label="Amount" value={formatDashboardMoney(payment.amount)} />
            <Row
              label="Created"
              value={formatDashboardDateTime(payment.createdAt)}
            />
            <Row
              label="Updated"
              value={formatDashboardDateTime(payment.updatedAt)}
            />
          </dl>
        </DetailCard>

        <DetailCard title="Rental period" icon={CalendarRange}>
          <dl className="space-y-2">
            <Row label="Start" value={formatDashboardDate(order.startDate)} />
            <Row label="End" value={formatDashboardDate(order.endDate)} />
            <Row label="Quantity" value={order.quantity} />
            <Row
              label="Order total"
              value={formatDashboardMoney(order.totalPrice)}
            />
          </dl>
        </DetailCard>

        <DetailCard title="Gear" icon={Package}>
          <dl className="space-y-2">
            <Row
              label="Name"
              value={
                <Link
                  href={`/gear/${order.gearItemId}`}
                  className="underline-offset-4 hover:underline"
                >
                  {order.gearItem.name}
                </Link>
              }
            />
            <Row label="Category" value={order.gearItem.category.name} />
            {order.gearItem.brand && (
              <Row label="Brand" value={order.gearItem.brand} />
            )}
            <Row
              label="Per day"
              value={formatDashboardMoney(order.gearItem.pricePerDay)}
            />
          </dl>
        </DetailCard>

        {showCustomer ? (
          <DetailCard title="Customer" icon={User}>
            <dl className="space-y-2">
              <Row label="Name" value={order.customer.name} />
              <Row label="Email" value={order.customer.email} />
              <Row label="Phone" value={order.customer.phone} />
            </dl>
          </DetailCard>
        ) : (
          <DetailCard title="Provider" icon={Store}>
            <dl className="space-y-2">
              <Row label="Name" value={order.gearItem.provider.name} />
              <Row label="Email" value={order.gearItem.provider.email} />
            </dl>
          </DetailCard>
        )}
      </div>

      <DetailCard title="References" icon={Receipt}>
        <div className="space-y-3">
          <OrderReference orderId={payment.id} label="Payment ID" />
          <OrderReference orderId={payment.rentalOrderId} label="Order ID" />
          {payment.stripeSessionId && (
            <OrderReference
              orderId={payment.stripeSessionId}
              label="Stripe session ID"
            />
          )}
          {payment.stripePaymentIntentId && (
            <OrderReference
              orderId={payment.stripePaymentIntentId}
              label="Stripe payment intent ID"
            />
          )}
          {!hasStripeReference && (
            <p className="text-xs text-ink/60">
              No Stripe reference yet. These IDs appear once the customer opens
              Checkout for the confirmed order.
            </p>
          )}
        </div>
      </DetailCard>
    </div>
  );
}
