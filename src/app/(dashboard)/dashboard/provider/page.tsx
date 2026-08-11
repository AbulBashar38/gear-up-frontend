import Link from "next/link";
import { Boxes, CheckCircle2, ClipboardCheck, PackageCheck } from "lucide-react";
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

export default async function ProviderDashboardPage() {
  const user = await requireDashboardRole("PROVIDER", "/dashboard/provider");
  const [inventory, requests, paid, pickedUp, completedPayments] =
    await Promise.all([
      listGear({ providerId: user.id, page: 1, limit: 1 }),
      listOrders({ status: "PLACED", page: 1, limit: 5 }),
      listOrders({ status: "PAID", page: 1, limit: 1 }),
      listOrders({ status: "PICKED_UP", page: 1, limit: 1 }),
      listPayments({ status: "COMPLETED", page: 1, limit: 1 }),
    ]);
  const problems = collectApiProblems(
    inventory,
    requests,
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
        eyebrow={`Provider depot // ${user.name}`}
        title="Inventory meets demand"
        description="Monitor owned gear, confirm new rental requests, and move paid orders through pickup and return. Every order count is already scoped by the backend to your listings."
        actions={
          <Button asChild size="lg">
            <Link href="/dashboard/gear">Open inventory</Link>
          </Button>
        }
      />

      {problems.length > 0 && (
        <div className="mt-8">
          <DashboardApiFeedback problems={problems} />
        </div>
      )}

      <section aria-label="Provider dashboard totals" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard code="PRO—01" label="Listings" value={getResultTotal(inventory)} detail="Gear listings owned by this provider account." href="/dashboard/gear" icon={Boxes} />
        <DashboardMetricCard code="PRO—02" label="New requests" value={getResultTotal(requests)} detail="Placed requests waiting for confirmation or cancellation." href="/dashboard/orders" icon={ClipboardCheck} tone="orange" />
        <DashboardMetricCard code="PRO—03" label="In motion" value={activeTotal} detail="Paid or picked-up rentals requiring fulfillment." href="/dashboard/orders" icon={PackageCheck} tone="lime" />
        <DashboardMetricCard code="PRO—04" label="Paid records" value={getResultTotal(completedPayments)} detail="Completed payments attached to owned gear." href="/dashboard/payments" icon={CheckCircle2} tone="ink" />
      </section>

      <section className="mt-12" aria-labelledby="provider-request-queue">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-signal">Action queue // newest first</p>
            <h2 id="provider-request-queue" className="mt-2 font-display text-4xl font-black uppercase">Requests awaiting review</h2>
          </div>
          <Button asChild variant="outline" size="compact"><Link href="/dashboard/orders">View all orders</Link></Button>
        </div>
        {requests.ok && <OrderList orders={requests.data} providerActions />}
      </section>
    </div>
  );
}
