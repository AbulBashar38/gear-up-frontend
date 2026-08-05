import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getOrder } from "@/services/orders";
import { OrderDetail } from "../../../_components/order-detail";
import { requireDashboardUser } from "../../../_utils/dashboard-access";
import { idSchema } from "../../../validation/order.schema";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Order detail",
  description: "Role-scoped rental order detail and lifecycle actions.",
};

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    notFound();
  }

  const user = await requireDashboardUser(`/dashboard/orders/${parsedId.data}`);
  const result = await getOrder(parsedId.data);

  if (!result.ok) {
    if (result.error.status === 404 || result.error.status === 403) {
      notFound();
    }

    return (
      <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-8 lg:px-10">
        <Alert variant="destructive" className="rounded-none p-6">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle className="font-display text-2xl font-black uppercase">
            {result.error.retryable
              ? "This order is temporarily unavailable."
              : "This order couldn't be opened."}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {result.error.message}
          </AlertDescription>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="primary">
              <Link href={`/dashboard/orders/${parsedId.data}`}>Retry</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/orders">Back to orders</Link>
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return <OrderDetail order={result.data} role={user.role} />;
}
