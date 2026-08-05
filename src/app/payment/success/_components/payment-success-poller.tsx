"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Clock, Loader2 } from "lucide-react";
import type { PaymentStatus, RentalOrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  finalizeCheckoutAction,
  refreshCheckoutStatusAction,
} from "../../_actions/payment-status-actions";

type Phase = "processing" | "paid" | "timeout";

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 10; // ~25s bounded window

/** "paid" | "failed" once terminal, otherwise null while still pending. */
function deriveOutcome(
  orderStatus: RentalOrderStatus,
  paymentStatus: PaymentStatus,
): "paid" | "failed" | null {
  if (paymentStatus === "COMPLETED" || orderStatus === "PAID") return "paid";
  if (paymentStatus === "FAILED" || orderStatus === "CANCELLED") return "failed";
  return null;
}

export function PaymentSuccessPoller({
  orderId,
  initialOrderStatus,
  initialPaymentStatus,
}: {
  orderId: string;
  initialOrderStatus: RentalOrderStatus;
  initialPaymentStatus: PaymentStatus;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(() =>
    deriveOutcome(initialOrderStatus, initialPaymentStatus) === "paid"
      ? "paid"
      : "processing",
  );
  const attemptsRef = useRef(0);
  const failedHref = `/payment/failed?order_id=${orderId}`;

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;

    const initial = deriveOutcome(initialOrderStatus, initialPaymentStatus);
    if (initial === "paid") {
      void finalizeCheckoutAction();
      return;
    }
    if (initial === "failed") {
      void finalizeCheckoutAction();
      router.replace(failedHref);
      return;
    }

    async function poll() {
      attemptsRef.current += 1;
      const result = await refreshCheckoutStatusAction(orderId);
      if (!active) return;

      if (result.ok) {
        const outcome = deriveOutcome(result.orderStatus, result.paymentStatus);
        if (outcome === "paid") {
          setPhase("paid");
          void finalizeCheckoutAction();
          return;
        }
        if (outcome === "failed") {
          void finalizeCheckoutAction();
          router.replace(failedHref);
          return;
        }
      }

      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setPhase("timeout");
        return;
      }

      timer = setTimeout(poll, POLL_INTERVAL_MS);
    }

    timer = setTimeout(poll, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [orderId, router, failedHref, initialOrderStatus, initialPaymentStatus]);

  const orderHref = `/dashboard/orders/${orderId}`;

  if (phase === "paid") {
    return (
      <Panel
        icon={Check}
        tone="success"
        title="Payment successful"
        description="Your rental is paid and confirmed. The provider will prepare it for pickup — you can track everything from your order."
      >
        <Button asChild size="lg">
          <Link href={orderHref}>View your order</Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href="/dashboard/orders">All orders</Link>
        </Button>
      </Panel>
    );
  }

  if (phase === "timeout") {
    return (
      <Panel
        icon={Clock}
        tone="muted"
        title="Payment confirmation is processing"
        description="Stripe is still confirming your payment. This can take a moment — check your order shortly and the status will update automatically."
      >
        <Button asChild size="lg">
          <Link href={orderHref}>Check order status</Link>
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href="/dashboard/orders">All orders</Link>
        </Button>
      </Panel>
    );
  }

  return (
    <Panel
      icon={Loader2}
      tone="muted"
      spin
      title="Confirming your payment"
      description="Please wait while we verify the payment with Stripe. Don't close this tab."
    />
  );
}

function Panel({
  icon: Icon,
  tone,
  spin = false,
  title,
  description,
  children,
}: {
  icon: typeof Check;
  tone: "success" | "danger" | "muted";
  spin?: boolean;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  const isSuccess = tone === "success";

  const badgeClass =
    tone === "success"
      ? "bg-success text-success-foreground shadow-lg shadow-success/25"
      : tone === "danger"
        ? "bg-signal/12 text-signal"
        : "bg-muted text-ink/60";

  return (
    <div
      className={cn(
        "border bg-card p-7 text-center sm:p-10",
        isSuccess ? "border-success/30 border-t-4 border-t-success" : "border-ink/15",
      )}
    >
      <div
        className={cn(
          "mx-auto grid size-16 place-items-center rounded-full",
          badgeClass,
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn("size-8", spin && "animate-spin")}
          strokeWidth={tone === "success" ? 3 : 2}
        />
      </div>
      {isSuccess && (
        <p className="mt-5 font-mono text-[0.62rem] font-bold uppercase tracking-[0.2em] text-success">
          Payment complete
        </p>
      )}
      <h1 className="mt-3 font-display text-3xl font-black uppercase leading-tight sm:text-4xl">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-ink/70">{description}</p>
      {children && (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {children}
        </div>
      )}
    </div>
  );
}
