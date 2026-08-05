import { DashboardRegisterPage } from "../../../_components/dashboard-register-page";
import { OrderList } from "../../../_components/dashboard-record-lists";
import {
  type DashboardListPageProps,
  parseDashboardPage,
} from "../../../_utils/dashboard-query";
import { getResultTotal } from "../../../_utils/dashboard-results";
import { listOrders } from "@/services/orders";

export default async function CustomerOrdersPage({
  searchParams,
}: DashboardListPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parseDashboardPage(rawPage);
  const result = await listOrders({ page, limit: 8 });

  return (
    <DashboardRegisterPage
      eyebrow="Customer register // orders"
      title="My rental requests"
      description="Provider confirmation comes before payment. Placed requests are not reserved until the provider confirms availability."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/customer/orders"
    >
      {result.ok && <OrderList orders={result.data} />}
    </DashboardRegisterPage>
  );
}
