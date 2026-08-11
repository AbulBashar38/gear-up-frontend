import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getPayment } from "@/services/payments";
import { PaymentDetail } from "../../../_components/payment-detail";
import { requireDashboardUser } from "../../../_utils/dashboard-access";
import { paymentIdSchema } from "../../../validation/payment.schema";

type PaymentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Payment detail",
  description: "Role-scoped payment record, Stripe references, and rental context.",
};

export default async function PaymentDetailPage({
  params,
}: PaymentDetailPageProps) {
  const { id } = await params;
  const parsedId = paymentIdSchema.safeParse(id);

  if (!parsedId.success) {
    notFound();
  }

  const user = await requireDashboardUser(`/dashboard/payments/${parsedId.data}`);
  const result = await getPayment(parsedId.data);

  if (!result.ok) {
    // The backend answers `404` for payments outside the caller's role scope,
    // so a missing record and a forbidden one look the same here on purpose.
    if (result.error.status === 404 || result.error.status === 403) {
      notFound();
    }

    return (
      <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 lg:px-10">
        <Alert variant="destructive" className="rounded-none p-6">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle className="font-display text-2xl font-black uppercase">
            {result.error.retryable
              ? "This payment is temporarily unavailable."
              : "This payment couldn't be opened."}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {result.error.message}
          </AlertDescription>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary">
              <Link href={`/dashboard/payments/${parsedId.data}`}>Retry</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/payments">Back to payments</Link>
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return <PaymentDetail payment={result.data} role={user.role} />;
}
