import type { Role } from "@/lib/types";
import { listPayments } from "@/services/payments";
import { DashboardRegisterPage } from "../../_components/dashboard-register-page";
import { PaymentList } from "../../_components/dashboard-record-lists";
import { requireDashboardUser } from "../../_utils/dashboard-access";
import {
  type DashboardListPageProps,
  parseDashboardPage,
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

export default async function PaymentsPage({ searchParams }: DashboardListPageProps) {
  const { page: rawPage } = await searchParams;
  const page = parseDashboardPage(rawPage);
  const [user, result] = await Promise.all([
    requireDashboardUser("/dashboard/payments"),
    listPayments({ page, limit: 8 }),
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
    >
      {result.ok && <PaymentList payments={result.data} />}
    </DashboardRegisterPage>
  );
}
