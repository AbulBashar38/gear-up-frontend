import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  CreditCard,
  PackageCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardApiFeedback } from "../../_components/dashboard-feedback";
import { DashboardMetricCard } from "../../_components/dashboard-metric-card";
import { DashboardPageHeader } from "../../_components/dashboard-page-header";
import { OrderList } from "../../_components/dashboard-record-lists";
import { requireDashboardRole } from "../../_utils/dashboard-access";
import {
  collectApiProblems,
  getResultTotal,
} from "../../_utils/dashboard-results";
import { listOrders } from "@/services/orders";
import { listPayments } from "@/services/payments";

export default async function CustomerDashboardPage() {
  const user = await requireDashboardRole("CUSTOMER", "/dashboard/customer");
  const [orders, confirmed, paid, pickedUp, completedPayments] = await Promise.all([
    listOrders({ page: 1, limit: 5 }),
    listOrders({ status: "CONFIRMED", page: 1, limit: 1 }),
    listOrders({ status: "PAID", page: 1, limit: 1 }),
    listOrders({ status: "PICKED_UP", page: 1, limit: 1 }),
    listPayments({ status: "COMPLETED", page: 1, limit: 1 }),
  ]);
  const problems = collectApiProblems(
    orders,
    confirmed,
    paid,
    pickedUp,
    completedPayments,
  );
  const paidTotal = getResultTotal(paid);
  const pickedUpTotal = getResultTotal(pickedUp);
  const activeTotal =
    paidTotal === null || pickedUpTotal === null
      ? null
      : paidTotal + pickedUpTotal;

  return (
    <div className="p-5 sm:p-8 lg:p-10 xl:p-14">
      <DashboardPageHeader
        eyebrow={`Customer station // ${user.name}`}
        title="Your rental fieldboard"
        description="Track every request from provider confirmation through Stripe payment, pickup, and return. Counts come from your role-scoped API records."
        actions={
          <Button asChild size="lg">
            <Link href="/gear">Find gear</Link>
          </Button>
        }
      />

      {problems.length > 0 && (
        <div className="mt-8">
          <DashboardApiFeedback problems={problems} />
        </div>
      )}

      <section aria-label="Customer dashboard totals" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard code="CUS—01" label="Requests" value={getResultTotal(orders)} detail="Every rental request in your account." href="/dashboard/orders" icon={ClipboardList} />
        <DashboardMetricCard code="CUS—02" label="Ready to pay" value={getResultTotal(confirmed)} detail="Provider-confirmed orders waiting for Checkout." href="/dashboard/orders" icon={CreditCard} tone="orange" />
        <DashboardMetricCard code="CUS—03" label="In the field" value={activeTotal} detail="Paid or picked-up rentals still in progress." href="/dashboard/orders" icon={PackageCheck} tone="lime" />
        <DashboardMetricCard code="CUS—04" label="Paid records" value={getResultTotal(completedPayments)} detail="Payments completed by the Stripe webhook." href="/dashboard/payments" icon={CheckCircle2} tone="ink" />
      </section>

      <section className="mt-12" aria-labelledby="recent-customer-orders">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-signal">Live register // newest first</p>
            <h2 id="recent-customer-orders" className="mt-2 font-display text-4xl font-black uppercase">Recent requests</h2>
          </div>
          <Button asChild variant="outline" size="compact"><Link href="/dashboard/orders">View all orders</Link></Button>
        </div>
        {orders.ok && <OrderList orders={orders.data} customerActions />}
      </section>
    </div>
  );
}
