import { DashboardRegisterPage } from "../../../_components/dashboard-register-page";
import { PaymentList } from "../../../_components/dashboard-record-lists";
import {
  type DashboardListPageProps,
  parseDashboardPage,
} from "../../../_utils/dashboard-query";
import { getResultTotal } from "../../../_utils/dashboard-results";
import { listPayments } from "@/services/payments";

export default async function ProviderPaymentsPage({
  searchParams,
}: DashboardListPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parseDashboardPage(rawPage);
  const result = await listPayments({ page, limit: 8 });

  return (
    <DashboardRegisterPage
      eyebrow="Provider register // payments"
      title="Owned-gear payments"
      description="The backend scopes this payment history to rental orders attached to the signed-in provider's inventory."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/provider/payments"
    >
      {result.ok && <PaymentList payments={result.data} />}
    </DashboardRegisterPage>
  );
}
