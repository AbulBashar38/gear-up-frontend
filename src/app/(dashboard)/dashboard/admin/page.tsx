import Link from "next/link";
import { Boxes, ClipboardList, CreditCard, Users } from "lucide-react";
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
import { listGear } from "@/services/gear";
import { listOrders } from "@/services/orders";
import { listPayments } from "@/services/payments";
import { listUsers } from "@/services/users";

export default async function AdminDashboardPage() {
  const user = await requireDashboardRole("ADMIN", "/dashboard/admin");
  const [users, gear, orders, payments] = await Promise.all([
    listUsers({ page: 1, limit: 1 }),
    listGear({ page: 1, limit: 1 }),
    listOrders({ page: 1, limit: 5 }),
    listPayments({ page: 1, limit: 1 }),
  ]);
  const problems = collectApiProblems(users, gear, orders, payments);

  return (
    <div className="p-5 sm:p-8 lg:p-10 xl:p-14">
      <DashboardPageHeader
        eyebrow={`Platform control // ${user.name}`}
        title="The whole operation"
        description="Review platform totals, inspect recent role-scoped activity, and enter each operational register. Values come from backend pagination metadata—not from a single page length."
        actions={
          <Button asChild size="lg">
            <Link href="/dashboard/users">Manage users</Link>
          </Button>
        }
      />

      {problems.length > 0 && (
        <div className="mt-8">
          <DashboardApiFeedback problems={problems} />
        </div>
      )}

      <section aria-label="Admin dashboard totals" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard code="ADM—01" label="Users" value={getResultTotal(users)} detail="Customer, provider, and admin accounts." href="/dashboard/users" icon={Users} />
        <DashboardMetricCard code="ADM—02" label="Gear" value={getResultTotal(gear)} detail="All inventory published across providers." href="/dashboard/gear" icon={Boxes} tone="orange" />
        <DashboardMetricCard code="ADM—03" label="Orders" value={getResultTotal(orders)} detail="All rental requests across the platform." href="/dashboard/orders" icon={ClipboardList} tone="lime" />
        <DashboardMetricCard code="ADM—04" label="Payments" value={getResultTotal(payments)} detail="Stripe-backed payment records at every status." href="/dashboard/payments" icon={CreditCard} tone="ink" />
      </section>

      <section className="mt-12" aria-labelledby="admin-recent-orders">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-signal">Platform register // newest first</p>
            <h2 id="admin-recent-orders" className="mt-2 font-display text-4xl font-black uppercase">Recent rental activity</h2>
          </div>
          <Button asChild variant="outline" size="compact"><Link href="/dashboard/orders">View all orders</Link></Button>
        </div>
        {orders.ok && <OrderList orders={orders.data} adminActions />}
      </section>
    </div>
  );
}
