import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { readPendingCheckout } from "@/lib/checkout";
import { Button } from "@/components/ui/button";
import { getOrder } from "@/services/orders";
import { PaymentSuccessPoller } from "./_components/payment-success-poller";

export const metadata: Metadata = {
  title: "Payment processing",
  robots: { index: false },
};

export default async function PaymentSuccessPage() {
  const pending = await readPendingCheckout();

  // Without the pending order id there is nothing to poll — the backend can't
  // look a payment up by Stripe session id, so never treat session_id as proof.
  if (!pending) {
    return (
      <Shell>
        <div className="border border-success/30 border-t-4 border-t-success bg-card p-7 text-center sm:p-10">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-success text-success-foreground shadow-lg shadow-success/25">
            <Check aria-hidden="true" className="size-8" strokeWidth={3} />
          </div>
          <p className="mt-5 font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em] text-success">
            Payment complete
          </p>
          <h1 className="mt-3 font-display text-3xl font-black uppercase leading-tight sm:text-4xl">
            Payment received
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink/70">
            Thanks! Your order status will update to paid as soon as Stripe
            confirms the payment. Open your orders to see the latest status.
          </p>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link href="/dashboard/orders">Go to my orders</Link>
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  const result = await getOrder(pending.orderId);
  const initialOrderStatus = result.ok ? result.data.status : "CONFIRMED";
  const initialPaymentStatus = result.ok
    ? (result.data.payment?.status ?? "PENDING")
    : "PENDING";

  return (
    <Shell>
      <PaymentSuccessPoller
        orderId={pending.orderId}
        initialOrderStatus={initialOrderStatus}
        initialPaymentStatus={initialPaymentStatus}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="grid min-h-dvh place-items-center bg-paper px-5 py-16"
    >
      <div className="w-full max-w-lg">{children}</div>
    </main>
  );
}
