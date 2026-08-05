import { DashboardRegisterPage } from "../../../_components/dashboard-register-page";
import { PaymentList } from "../../../_components/dashboard-record-lists";
import {
  type DashboardListPageProps,
  parseDashboardPage,
} from "../../../_utils/dashboard-query";
import { getResultTotal } from "../../../_utils/dashboard-results";
import { listPayments } from "@/services/payments";

export default async function CustomerPaymentsPage({
  searchParams,
}: DashboardListPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parseDashboardPage(rawPage);
  const result = await listPayments({ page, limit: 8 });

  return (
    <DashboardRegisterPage
      eyebrow="Customer register // payments"
      title="Payment history"
      description="These records reflect Stripe Checkout and webhook-confirmed backend status. The frontend never marks its own payment as completed."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/customer/payments"
    >
      {result.ok && <PaymentList payments={result.data} />}
    </DashboardRegisterPage>
  );
}
