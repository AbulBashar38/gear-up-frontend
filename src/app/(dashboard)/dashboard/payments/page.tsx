import type {
  PaymentStatus,
  RentalOrderStatus,
  Role,
} from "@/lib/types";
import { listPayments } from "@/services/payments";
import { DashboardRegisterPage } from "../../_components/dashboard-register-page";
import { PaymentList } from "../../_components/dashboard-record-lists";
import {
  PaymentRegisterFilters,
  type PaymentFilterValues,
} from "../../_components/dashboard-register-filters";
import { requireDashboardUser } from "../../_utils/dashboard-access";
import {
  type DashboardListPageProps,
  parseDashboardChoice,
  parseDashboardPage,
  parseDashboardText,
} from "../../_utils/dashboard-query";
import { getResultTotal } from "../../_utils/dashboard-results";

const PAYMENT_COPY: Record<Role, { eyebrow: string; title: string; description: string }> = {
  CUSTOMER: {
    eyebrow: "Customer register // payments",
    title: "Payment history",
    description:
      "These records reflect Stripe Checkout and webhook-confirmed backend status. The frontend never marks its own payment as completed.",
  },
  PROVIDER: {
    eyebrow: "Provider register // payments",
    title: "Owned-gear payments",
    description:
      "The backend scopes this history to rental orders attached to the signed-in provider's inventory.",
  },
  ADMIN: {
    eyebrow: "Admin register // settlement",
    title: "All payments",
    description:
      "Inspect platform-wide pending, completed, and failed Stripe-backed payment records without exposing card data.",
  },
};

const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  "PENDING",
  "COMPLETED",
  "FAILED",
];
const ORDER_STATUSES: readonly RentalOrderStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PAID",
  "PICKED_UP",
  "RETURNED",
  "CANCELLED",
];

export default async function PaymentsPage({ searchParams }: DashboardListPageProps) {
  const params = await searchParams;
  const page = parseDashboardPage(params.page);
  const values: PaymentFilterValues = {
    search: parseDashboardText(params.search),
    status: parseDashboardChoice(params.status, PAYMENT_STATUSES),
    orderStatus: parseDashboardChoice(params.orderStatus, ORDER_STATUSES),
  };
  const [user, result] = await Promise.all([
    requireDashboardUser("/dashboard/payments"),
    listPayments({
      search: values.search || undefined,
      status: values.status || undefined,
      orderStatus: values.orderStatus || undefined,
      page,
      limit: 8,
    }),
  ]);
  const copy = PAYMENT_COPY[user.role];

  return (
    <DashboardRegisterPage
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/payments"
      paginationQuery={{
        search: values.search || undefined,
        status: values.status || undefined,
        orderStatus: values.orderStatus || undefined,
      }}
      filters={<PaymentRegisterFilters values={values} />}
    >
      {result.ok && <PaymentList payments={result.data} />}
    </DashboardRegisterPage>
  );
}
