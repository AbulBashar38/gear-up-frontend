import type { Role } from "@/lib/types";
import { listOrders } from "@/services/orders";
import { DashboardRegisterPage } from "../../_components/dashboard-register-page";
import { OrderList } from "../../_components/dashboard-record-lists";
import { requireDashboardUser } from "../../_utils/dashboard-access";
import {
  type DashboardListPageProps,
  parseDashboardPage,
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

export default async function OrdersPage({ searchParams }: DashboardListPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parseDashboardPage(rawPage);
  const [user, result] = await Promise.all([
    requireDashboardUser("/dashboard/orders"),
    listOrders({ page, limit: 8 }),
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
    >
      {result.ok && (
        <OrderList
          orders={result.data}
          adminActions={user.role === "ADMIN"}
          customerActions={user.role === "CUSTOMER"}
        />
      )}
    </DashboardRegisterPage>
  );
}
