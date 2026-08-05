import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOrder } from "@/services/orders";
import { idSchema } from "../../(dashboard)/validation/order.schema";
import { CancelActions } from "./_components/cancel-actions";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false },
};

type CancelPageProps = {
  searchParams: Promise<{ order_id?: string }>;
};

export default async function PaymentCancelPage({
  searchParams,
}: CancelPageProps) {
  const { order_id: orderIdParam } = await searchParams;
  const parsedId = idSchema.safeParse(orderIdParam);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="grid min-h-dvh place-items-center bg-paper px-5 py-16"
    >
      <div className="w-full max-w-lg border border-ink/15 bg-card p-7 sm:p-10">
        <Info aria-hidden="true" className="size-11 text-ink/55" />
        <h1 className="mt-4 font-display text-3xl font-black uppercase leading-tight">
          Checkout cancelled
        </h1>
        <p className="mt-3 text-sm text-ink/70">
          Leaving Stripe Checkout does <strong>not</strong> cancel your order.
          It stays confirmed and awaiting payment, so you can retry whenever
          you&apos;re ready — or explicitly cancel the rental below.
        </p>

        <div className="mt-6">
          {parsedId.success ? (
            <CancelPageActions orderId={parsedId.data} />
          ) : (
            <Button asChild size="lg">
              <Link href="/dashboard/orders">Back to my orders</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

async function CancelPageActions({ orderId }: { orderId: string }) {
  const result = await getOrder(orderId);
  // Cancelling from here is only meaningful for a still-cancellable order.
  const canCancel =
    result.ok &&
    (result.data.status === "PLACED" || result.data.status === "CONFIRMED");

  return <CancelActions orderId={orderId} canCancel={canCancel} />;
}
