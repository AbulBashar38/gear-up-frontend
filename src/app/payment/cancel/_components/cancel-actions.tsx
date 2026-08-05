"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startCheckoutAction } from "../../../(dashboard)/_actions/checkout-actions";
import { changeOrderStatusAction } from "../../../(dashboard)/_actions/order-actions";
import { finalizeCheckoutAction } from "../../_actions/payment-status-actions";
import {
  AdminActionMessage,
  INITIAL_ADMIN_MUTATION_STATE,
} from "../../../(dashboard)/_components/admin-mutation-feedback";

export function CancelActions({
  orderId,
  canCancel,
}: {
  orderId: string;
  canCancel: boolean;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    changeOrderStatusAction.bind(null, orderId),
    INITIAL_ADMIN_MUTATION_STATE,
  );
  const [retryState, retryAction, retryPending] = useActionState(
    startCheckoutAction.bind(null, orderId),
    INITIAL_ADMIN_MUTATION_STATE,
  );
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (state.status === "success" && state.message) {
      toast.success(state.message);
      void finalizeCheckoutAction();
      router.push(`/dashboard/orders/${orderId}`);
      router.refresh();
    }
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [orderId, router, state]);

  useEffect(() => {
    if (retryState.status === "error" && retryState.message) {
      toast.error(retryState.message);
    }
  }, [retryState]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <form action={retryAction}>
          <Button type="submit" size="lg" disabled={retryPending}>
            <CreditCard aria-hidden="true" />
            {retryPending ? "Redirecting to Stripe…" : "Retry payment"}
          </Button>
        </form>
        <Button asChild size="lg" variant="outline">
          <Link href={`/dashboard/orders/${orderId}`}>Back to order</Link>
        </Button>
      </div>
      <AdminActionMessage state={retryState} className="mt-2" />

      {canCancel && (
        <div className="border-t border-ink/12 pt-4">
          {confirming ? (
            <form action={action} className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-signal">
                Cancel this rental permanently?
              </span>
              <Button
                type="submit"
                name="status"
                value="CANCELLED"
                variant="destructive"
                size="compact"
                disabled={pending}
              >
                <XCircle aria-hidden="true" />
                {pending ? "Cancelling…" : "Yes, cancel rental"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="compact"
                disabled={pending}
                onClick={() => setConfirming(false)}
              >
                Keep order
              </Button>
            </form>
          ) : (
            <Button
              type="button"
              variant="destructive"
              size="compact"
              onClick={() => setConfirming(true)}
            >
              <XCircle aria-hidden="true" />
              Cancel rental instead
            </Button>
          )}
          <AdminActionMessage state={state} className="mt-2" />
        </div>
      )}
    </div>
  );
}
