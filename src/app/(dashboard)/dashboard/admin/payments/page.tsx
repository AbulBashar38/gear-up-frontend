import { DashboardRegisterPage } from "../../../_components/dashboard-register-page";
import { PaymentList } from "../../../_components/dashboard-record-lists";
import {
  type DashboardListPageProps,
  parseDashboardPage,
} from "../../../_utils/dashboard-query";
import { getResultTotal } from "../../../_utils/dashboard-results";
import { listPayments } from "@/services/payments";

export default async function AdminPaymentsPage({
  searchParams,
}: DashboardListPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parseDashboardPage(rawPage);
  const result = await listPayments({ page, limit: 8 });

  return (
    <DashboardRegisterPage
      eyebrow="Admin register // settlement"
      title="All payments"
      description="Inspect platform-wide pending, completed, and failed Stripe-backed payment records without exposing card data."
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/admin/payments"
    >
      {result.ok && <PaymentList payments={result.data} />}
    </DashboardRegisterPage>
  );
}
