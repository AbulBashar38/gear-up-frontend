import { DashboardRegisterPage } from "../../../_components/dashboard-register-page";
import { OrderList } from "../../../_components/dashboard-record-lists";
import {
  type DashboardListPageProps,
  parseDashboardPage,
} from "../../../_utils/dashboard-query";
import { getResultTotal } from "../../../_utils/dashboard-results";
import { listOrders } from "@/services/orders";

export default async function ProviderOrdersPage({
  searchParams,
}: DashboardListPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parseDashboardPage(rawPage);
  const result = await listOrders({ page, limit: 8 });

  return (
    <DashboardRegisterPage
      eyebrow="Provider register // fulfillment"
      title="Rental orders"
      description="Only orders for gear owned by this provider are returned. Valid status actions will follow the backend transition map."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/provider/orders"
    >
      {result.ok && <OrderList orders={result.data} />}
    </DashboardRegisterPage>
  );
}
