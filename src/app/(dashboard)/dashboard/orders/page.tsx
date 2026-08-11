import type {
  PaymentStatus,
  RentalOrderStatus,
  Role,
} from "@/lib/types";
import { listOrders } from "@/services/orders";
import { DashboardRegisterPage } from "../../_components/dashboard-register-page";
import { OrderList } from "../../_components/dashboard-record-lists";
import {
  OrderRegisterFilters,
  type OrderFilterValues,
} from "../../_components/dashboard-register-filters";
import { requireDashboardUser } from "../../_utils/dashboard-access";
import {
  type DashboardListPageProps,
  parseDashboardChoice,
  parseDashboardPage,
  parseDashboardText,
} from "../../_utils/dashboard-query";
import { getResultTotal } from "../../_utils/dashboard-results";

const ORDER_COPY: Record<Role, { eyebrow: string; title: string; description: string }> = {
  CUSTOMER: {
    eyebrow: "Customer register // orders",
    title: "My rental requests",
    description:
      "Provider confirmation comes before payment. Placed requests are not reserved until the provider confirms availability.",
  },
  PROVIDER: {
    eyebrow: "Provider register // fulfillment",
    title: "Rental orders",
    description:
      "The backend returns only orders attached to gear owned by this provider account.",
  },
  ADMIN: {
    eyebrow: "Admin register // rentals",
    title: "All rental orders",
    description:
      "This platform-wide register exposes backend-authorized order state. Paid remains webhook-only and cannot be set from the frontend.",
  },
};

const ORDER_STATUSES: readonly RentalOrderStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PAID",
  "PICKED_UP",
  "RETURNED",
  "CANCELLED",
];
const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  "PENDING",
  "COMPLETED",
  "FAILED",
];

export default async function OrdersPage({ searchParams }: DashboardListPageProps) {
  const params = await searchParams;
  const page = parseDashboardPage(params.page);
  const values: OrderFilterValues = {
    search: parseDashboardText(params.search),
    status: parseDashboardChoice(params.status, ORDER_STATUSES),
    paymentStatus: parseDashboardChoice(
      params.paymentStatus,
      PAYMENT_STATUSES,
    ),
  };
  const [user, result] = await Promise.all([
    requireDashboardUser("/dashboard/orders"),
    listOrders({
      search: values.search || undefined,
      status: values.status || undefined,
      paymentStatus: values.paymentStatus || undefined,
      page,
      limit: 8,
    }),
  ]);
  const copy = ORDER_COPY[user.role];

  return (
    <DashboardRegisterPage
      eyebrow={copy.eyebrow}
      title={copy.title}
      description={copy.description}
      total={getResultTotal(result)}
      problem={result.ok ? undefined : result.error}
      meta={result.ok ? result.meta : undefined}
      pathname="/dashboard/orders"
      paginationQuery={{
        search: values.search || undefined,
        status: values.status || undefined,
        paymentStatus: values.paymentStatus || undefined,
      }}
      filters={<OrderRegisterFilters values={values} role={user.role} />}
    >
      {result.ok && (
        <OrderList
          orders={result.data}
          adminActions={user.role === "ADMIN"}
          providerActions={user.role === "PROVIDER"}
          customerActions={user.role === "CUSTOMER"}
        />
      )}
    </DashboardRegisterPage>
  );
}
