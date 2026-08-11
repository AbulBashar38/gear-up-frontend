import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderReference } from "@/components/shared/order-reference";
import { getOrder } from "@/services/orders";
import { idSchema } from "../../(dashboard)/validation/order.schema";

export const metadata: Metadata = {
  title: "Payment failed",
  robots: { index: false },
};

type FailedPageProps = {
  searchParams: Promise<{ order_id?: string }>;
};

export default async function PaymentFailedPage({
  searchParams,
}: FailedPageProps) {
  const { order_id: orderIdParam } = await searchParams;
  const parsedId = idSchema.safeParse(orderIdParam);

  // Best-effort context; the order is expected to be CANCELLED after a failure.
  const order = parsedId.success ? await getOrder(parsedId.data) : null;
  const gearName = order?.ok ? order.data.gearItem.name : null;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="grid min-h-dvh place-items-center bg-paper px-5 py-16"
    >
      <div className="w-full max-w-lg border border-ink/15 bg-card p-7 text-center sm:p-10">
        <XCircle aria-hidden="true" className="mx-auto size-12 text-signal" />
        <h1 className="mt-5 font-display text-3xl font-black uppercase leading-tight">
          Payment failed
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink/70">
          {gearName ? (
            <>
              We couldn&apos;t complete payment for{" "}
              <strong>{gearName}</strong>. The payment was declined or the
              checkout session expired, so this rental has been cancelled.
            </>
          ) : (
            <>
              We couldn&apos;t complete your payment. The payment was declined
              or the checkout session expired, so this rental has been
              cancelled.
            </>
          )}{" "}
          You haven&apos;t been charged. You can place the rental request again
          whenever you&apos;re ready.
        </p>
        {parsedId.success && (
          <OrderReference
            orderId={parsedId.data}
            className="mx-auto mt-6 max-w-md"
          />
        )}
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {parsedId.success && (
            <Button asChild size="lg" variant="outline">
              <Link href={`/dashboard/orders/${parsedId.data}`}>
                View order
              </Link>
            </Button>
          )}
          <Button asChild size="lg">
            <Link href="/gear">Browse gear</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
