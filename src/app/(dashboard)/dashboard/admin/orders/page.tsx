import { DashboardRegisterPage } from "../../../_components/dashboard-register-page";
import { OrderList } from "../../../_components/dashboard-record-lists";
import {
  type DashboardListPageProps,
  parseDashboardPage,
} from "../../../_utils/dashboard-query";
import { getResultTotal } from "../../../_utils/dashboard-results";
import { listOrders } from "@/services/orders";

export default async function AdminOrdersPage({
  searchParams,
}: DashboardListPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parseDashboardPage(rawPage);
  const result = await listOrders({ page, limit: 8 });

  return (
    <DashboardRegisterPage
      eyebrow="Admin register // rentals"
      title="All rental orders"
      description="This platform-wide register exposes backend-authorized order state. Paid remains webhook-only and cannot be set from the frontend."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/admin/orders"
    >
      {result.ok && <OrderList orders={result.data} adminActions />}
    </DashboardRegisterPage>
  );
}
